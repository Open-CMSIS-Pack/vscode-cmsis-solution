/**
 * Copyright 2022-2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as path from 'path';
import * as manifest from '../manifest';
import * as vscode from 'vscode';
import { ExtensionContext, FileSystemError } from 'vscode';
import { CONFIG_CLANGD_EXTNAME, CONFIG_CLANGD_GENERATE_SETUP, CONFIG_CLANGD_ARGUMENTS } from '../manifest';
import { ConfigurationProvider } from '../vscode-api/configuration-provider';
import { URI } from 'vscode-uri';
import yaml from 'yaml';
import { ArmclangDefineGetter } from './intellisense/armclang-define-getter';
import { WorkspaceFsProvider } from '../vscode-api/workspace-fs-provider';
import { debounce } from 'lodash';
import { SolutionManager } from './solution-manager';
import { CompileCommandsParser } from './intellisense/compile-commands-parser';
import { CommandsProvider } from '../vscode-api/commands-provider';
import { COutlineItem } from '../views/solution-outline/tree-structure/solution-outline-item';
import { CompileFlags } from '@eclipse-cdt-cloud/clangd-contexts';
import { ContextDescriptor } from './descriptors/descriptors';

export interface CompileFlags2 extends CompileFlags {
    Compiler?: string;
}

export interface ClangdConfig {
    If?: {
        PathMatch?: string,
        PathExclude?: string
    };
    CompileFlags: CompileFlags2;
    filePath?: string;
}

export const clangDActiveContextKey = `${manifest.PACKAGE_NAME}.activeClangdContext`;

/**
 * A class for managing clangd configuration files at both the user and project level.
 * It does two things:
 *  - Keeps the compilation database property of .clangd project files up-to-date with our project context
 *  - Provides both the project level .clangd file and the user level config.yaml updated with AddFlags to aid intellisense.
 *
 * Modification of the user level config.yaml relies heavily on yaml 'fragments' (single file, multiple 'fragments'):
 * - https://camel.readthedocs.io/en/latest/yamlref.html#general-syntax
 * - https://clangd.llvm.org/config#loading-and-combining-fragments
*/
export class ClangdManager {
    public static readonly setClangdContextCommandId = `${manifest.PACKAGE_NAME}.setClangdContext`;
    public static readonly unsetClangdContextCommandId = `${manifest.PACKAGE_NAME}.unsetClangdContext`;
    public static readonly getInfoPathCommandId = `${manifest.PACKAGE_NAME}.getInfoPath`;

    private readonly debouncedUpdateClangdConfig;
    private readonly restartClangd;
    private _globalContext: ContextDescriptor | undefined;
    private context: ExtensionContext | undefined;

    constructor(
        private readonly solutionManager: SolutionManager,
        private readonly configurationProvider: ConfigurationProvider,
        private readonly armclangDefineGetter: ArmclangDefineGetter,
        private readonly compileCommandParser: Pick<CompileCommandsParser, 'getAllIncludeCommands'>,
        private readonly workspaceFsProvider: WorkspaceFsProvider,
        private readonly commandsProvider: CommandsProvider,
        private readonly debounceMillis = 1000,
    ) {
        this.debouncedUpdateClangdConfig = debounce(this.updateClangdConfig.bind(this), this.debounceMillis);
        this.restartClangd = debounce(() => this.commandsProvider.executeCommandIfRegistered('clangd.restart'), this.debounceMillis);
    }

    public async activate(context: ExtensionContext): Promise<void> {
        this.context = context;
        this.solutionManager.onUpdatedCompileCommands(this.updateGlobalContext, this, context.subscriptions);
        this.configurationProvider.onChangeConfiguration(this.debouncedUpdateClangdConfig, CONFIG_CLANGD_GENERATE_SETUP);
        this.commandsProvider.registerCommand(ClangdManager.setClangdContextCommandId, this.setGlobalContext, this);
        this.commandsProvider.registerCommand(ClangdManager.unsetClangdContextCommandId, this.unsetGlobalContext, this);
        this.commandsProvider.registerCommand(ClangdManager.getInfoPathCommandId, this.getInfoPath, this);
    }

    private get globalContext() {
        return this._globalContext?.projectPath;
    }

    private set globalContext(projectPath: string | undefined) {
        if (!projectPath) {
            return;
        }

        const projectContext = this.solutionManager.getCsolution()?.getContextDescriptor(projectPath);

        if (projectContext && this._globalContext?.displayName !== projectContext.displayName) {
            projectContext.projectPath = projectPath; // ensure it is defined
            vscode.commands.executeCommand('setContext', clangDActiveContextKey, [`projectFile:${projectPath}`]);
            this.updateWorkspaceState(projectPath);
            this.debouncedUpdateClangdConfig();
            this._globalContext = projectContext;
        }
    }

    private setGlobalContext(treeNode: COutlineItem | undefined) {
        const type = treeNode?.getAttribute('type');
        if (type === 'projectFile') {
            this.globalContext = treeNode?.getAttribute('resourcePath');
        }
    }

    private unsetGlobalContext() {
        // Do nothing
    }

    private getInfoPath(): string {
        return this.resolveInfoPath();
    }

    private resolveInfoPath(): string {
        const csolution = this.solutionManager.getCsolution();
        const globalContextProjectPath = this.globalContext;

        if (!csolution || !globalContextProjectPath) {
            return '';
        }

        const context = csolution.getContextDescriptor(globalContextProjectPath);
        const outDir = context ? csolution.cbuildIdxFile?.cbuildFiles?.get(context.projectName)?.outDir : undefined;

        return outDir ?? '';
    }

    private async updateWorkspaceClangdConfig(compileCommands: URI | undefined) {
        const clangd_arguments = [];
        if (compileCommands) {
            clangd_arguments.push(`--compile-commands-dir=${path.dirname(compileCommands.fsPath)}`);
        }
        await this.configurationProvider.setConfigVariable(CONFIG_CLANGD_ARGUMENTS, clangd_arguments, CONFIG_CLANGD_EXTNAME, true);
        await this.restartClangd();
    }

    private updateWorkspaceState(projectPath: string) {
        const csolution = this.solutionManager.getCsolution();
        const solutionPath = csolution?.solutionPath;
        if (!solutionPath) {
            return;
        }
        const state = this.workspaceState;
        state[solutionPath] = projectPath;
        this.workspaceState = state;
    }

    private get workspaceState(): Record<string, string> {
        const state = this.context?.workspaceState.get<Record<string, string>>(clangDActiveContextKey) ?? {};
        if (typeof state !== 'object') {
            this.context?.workspaceState.update(clangDActiveContextKey, undefined);
            return {};
        }
        return state;
    }

    private set workspaceState(state: Record<string, string>) {
        this.context?.workspaceState.update(clangDActiveContextKey, state);
    }

    private updateGlobalContext() {
        const csolution = this.solutionManager.getCsolution();
        const solutionPath = csolution?.solutionPath;
        if (!solutionPath) {
            return;
        }

        const state = this.workspaceState;
        if (solutionPath in state) {
            const context = state[solutionPath];
            csolution?.getContextDescriptors()?.forEach(async c => await this.setClangdConfigDiagnosticsSuppress(c));
            if (csolution?.getContextDescriptors()?.some(c => c.projectPath === context)) {
                this.globalContext = context;
                return;
            }
        }

        const firstContext = csolution?.getContextDescriptors()?.find(c => c.projectPath !== undefined);
        if (firstContext) {
            this.globalContext = firstContext.projectPath;
        } else {
            this.globalContext = undefined;
        }
    }

    private compileCommandsFileURI(path: string) {
        return URI.file(`${path}/compile_commands.json`);
    }

    private compileMacrosCFileURI(path: string) {
        return URI.file(`${path}/compile_macros_c.h`);
    }

    private compileMacrosCxxFileURI(path: string) {
        return URI.file(`${path}/compile_macros_cxx.h`);
    }

    private async updateClangdConfigForContext(context: ContextDescriptor) {
        const csolution = this.solutionManager.getCsolution();
        const updatePromises: Promise<unknown>[] = [];

        const cbuild = csolution?.cbuildIdxFile?.cbuildFiles?.get(context.projectName);
        const compilerInContext = cbuild?.compiler;
        const clangdFilePath = context.projectPath ? `${path.dirname(context.projectPath)}/.clangd` : undefined;

        const compileCommandsFileDirectory = cbuild?.outDir;
        if (compileCommandsFileDirectory && (this.globalContext === context.projectPath)) {
            updatePromises.push(
                this.updateWorkspaceClangdConfig(this.compileCommandsFileURI(compileCommandsFileDirectory))
            );
        }

        // Modify the .clangd file AddFlags for each context guarded on toolchain
        if (clangdFilePath) {
            const compileMacrosCFile = compileCommandsFileDirectory ? this.compileMacrosCFileURI(compileCommandsFileDirectory) : undefined;
            const compileMacrosCxxFile = compileCommandsFileDirectory ? this.compileMacrosCxxFileURI(compileCommandsFileDirectory) : undefined;
            const existingCompileMacrosCFile = compilerInContext !== 'CLANG' && compileMacrosCFile
                && await this.workspaceFsProvider.exists(compileMacrosCFile.fsPath) ? compileMacrosCFile : undefined;
            const existingCompileMacrosCxxFile = compilerInContext !== 'CLANG' && compileMacrosCxxFile
                && await this.workspaceFsProvider.exists(compileMacrosCxxFile.fsPath) ? compileMacrosCxxFile : undefined;
            if (compileCommandsFileDirectory && (existingCompileMacrosCFile || existingCompileMacrosCxxFile)) {
                // Use language-specific compile macros headers when available.
                updatePromises.push(
                    this.generateContextAddCompileMacros(
                        URI.file(clangdFilePath),
                        existingCompileMacrosCFile,
                        existingCompileMacrosCxxFile,
                        compileCommandsFileDirectory,
                    )
                );
            } else if (compileCommandsFileDirectory && (compilerInContext === 'AC6')) {
                // fallback to AC6 flags generation
                updatePromises.push(
                    this.generateContextAddFlags(
                        URI.file(clangdFilePath),
                        this.compileCommandsFileURI(compileCommandsFileDirectory),
                    )
                );
            } else {
                updatePromises.push(
                    this.clearContextAddFlags(
                        URI.file(clangdFilePath),
                        compileCommandsFileDirectory,
                    )
                );
            }
        }

        await Promise.all(updatePromises);
    };

    private async updateClangdConfig(): Promise<void> {
        this.updateWorkspaceClangdConfig(undefined);
        if (this.isAutoGenerateEnabled()) {
            const csolution = this.solutionManager.getCsolution();
            const solutionPath = csolution?.solutionPath;
            if (!solutionPath) {
                return;
            }
            await Promise.all(
                csolution?.getContextDescriptors()?.map(context => this.updateClangdConfigForContext(context))
            );
        }
    }

    /**
     * Generate language-specific Add flags for a context's .clangd file.
     *
     * @param clangdFile URI of the context .clangd file to update.
     * @param compileMacrosCFile URI of compile_macros_c.h to include for C files.
     * @param compileMacrosCxxFile URI of compile_macros_cxx.h to include for C++ files.
     * @returns the flags written to CompileFlags.Add.
     */
    private async generateContextAddCompileMacros(
        clangdFile: URI,
        compileMacrosCFile: URI | undefined,
        compileMacrosCxxFile: URI | undefined,
        compileCommandsFileDirectory: string,
    ): Promise<string[]> {
        const fragments: ClangdConfig[] = [{
            CompileFlags: { CompilationDatabase: compileCommandsFileDirectory }
        }];
        const flags: string[] = [];
        const cPathMatch = '.*\\.(c|C|h)$';
        const cxxPathMatch = '.*\\.(cpp|c\\+\\+|C\\+\\+|cxx|cc|CC|hpp)$';
        if (compileMacrosCFile) {
            const cFlags = ['-include', compileMacrosCFile.fsPath];
            fragments.push({ If: { PathMatch: cPathMatch }, CompileFlags: { Add: cFlags } });
            flags.push(...cFlags);
        }
        if (compileMacrosCxxFile) {
            const cxxFlags = ['-include', compileMacrosCxxFile.fsPath];
            fragments.push({ If: { PathMatch: cxxPathMatch }, CompileFlags: { Add: cxxFlags } });
            flags.push(...cxxFlags);
        }
        await this.writeConfig(fragments, clangdFile);
        return flags;
    }

    /**
     * Generate and set the AddFlags property of a given context's .clangd file.
     *
     * @param context The SolutionContext.
     * @returns the flags retrieved.
     */
    private async generateContextAddFlags(clangdFile: URI, compileCommandsFile: URI): Promise<string[]> {
        try {
            const flags = [
                ...(await this.armclangDefineGetter.getClangdDefineFlags(compileCommandsFile)),
                ...(await this.compileCommandParser.getAllIncludeCommands(compileCommandsFile.fsPath))
            ];
            await this.writeConfig([{
                CompileFlags: {
                    CompilationDatabase: path.dirname(compileCommandsFile.fsPath),
                    Add: flags,
                }
            }], clangdFile);
            return flags;
        } catch (err) {
            console.log(`Clangd compile flag query failed: ${err}`);
            return [];
        }
    }

    /**
     * Clear the AddFlags property of a given context's .clangd file.
     *
     * @param context The SolutionContext.
     */
    private async clearContextAddFlags(clangdFile: URI, compileCommandsFileDirectory: string | undefined): Promise<void> {
        await this.writeConfig([{
            CompileFlags: {
                CompilationDatabase: compileCommandsFileDirectory,
                Add: [],
            }
        }], clangdFile);
    }

    private isAutoGenerateEnabled(): boolean {
        return this.configurationProvider.getConfigVariable<boolean>(CONFIG_CLANGD_GENERATE_SETUP) ?? true;
    }

    private async writeConfig(fragments: ClangdConfig[], configFilePath: URI): Promise<void> {
        try {
            await this.workspaceFsProvider.createDirectory(path.dirname(configFilePath.fsPath));
            await this.workspaceFsProvider.writeUtf8File(
                configFilePath.fsPath,
                fragments.map(fragment => yaml.stringify(fragment)).join('\n---\n')
            );
        } catch (err) {
            if (err instanceof FileSystemError) {
                switch (err.code) {
                    case 'NoPermissions':
                        console.log(`VS Code doesn't have permission to write clangd config: ${err}`);
                        break;
                    default:
                        console.log(`Failed to write clangd config due to a FileSystemError: ${err}`);
                }
            } else {
                console.log(`Failed to write clangd config with unknown error: ${err}`);
            }
        }
    }

    /**
     * Ensure a .clangd file exists in the context output directory
     * with diagnostics suppressed for generated output content.
     *
     * @param context Context descriptor used to resolve the output directory.
     */
    private async setClangdConfigDiagnosticsSuppress(context: ContextDescriptor) {
        const csolution = this.solutionManager.getCsolution();
        const outDir = csolution?.cbuildIdxFile?.cbuildFiles?.get(context.projectName)?.outDir;
        const clangdFilePath = outDir ? path.join(outDir, '.clangd') : undefined;
        if (clangdFilePath) {
            const exists = await this.workspaceFsProvider.exists(clangdFilePath);
            if (!exists) {
                await this.workspaceFsProvider.writeUtf8File(clangdFilePath, 'Diagnostics:\n  Suppress: [\'*\']');
            }
        }
    }
}
