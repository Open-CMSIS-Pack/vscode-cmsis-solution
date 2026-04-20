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
import { CompileFlags, setContext } from '@eclipse-cdt-cloud/clangd-contexts';
import { ContextDescriptor } from './descriptors/descriptors';

export const DEFAULT_CLANGD_CONFIG: ClangdConfig = {
    If: {

    },
    CompileFlags: {
        CompilationDatabase: undefined,
        Add: []
    }
};

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

    private compileMacrosFileURI(path: string) {
        return URI.file(`${path}/compile_macros.h`);
    }

    private async updateClangdConfigForContext(context: ContextDescriptor) {
        const csolution = this.solutionManager.getCsolution();
        const updatePromises: Promise<unknown>[] = [];

        const cbuild = csolution?.cbuildIdxFile?.cbuildFiles?.get(context.projectName);
        const compilerInContext = cbuild?.compiler;
        const clangdFilePath = context.projectPath ? `${path.dirname(context.projectPath)}/.clangd` : undefined;

        const compileCommandsFileDirectory = cbuild?.outDir;
        if (compileCommandsFileDirectory && clangdFilePath) {
            setContext(clangdFilePath, compileCommandsFileDirectory);
        }
        if (compileCommandsFileDirectory && (this.globalContext === context.projectPath)) {
            updatePromises.push(
                this.updateWorkspaceClangdConfig(this.compileCommandsFileURI(compileCommandsFileDirectory))
            );
        }

        // Modify the .clangd file AddFlags for each context guarded on toolchain
        if (clangdFilePath) {
            const compileMacrosFile = compileCommandsFileDirectory ? this.compileMacrosFileURI(compileCommandsFileDirectory) : undefined;
            if (compileMacrosFile && await this.workspaceFsProvider.exists(compileMacrosFile.fsPath)) {
                // use compile_macros.h if it is available
                updatePromises.push(
                    this.generateContextAddCompileMacros(
                        URI.file(clangdFilePath),
                        compileMacrosFile,
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
     * Generate and set Add flags for a context's .clangd file to pre-include compile_macros.h.
     *
     * @param clangdFile URI of the context .clangd file to update.
     * @param compileMacrosFile URI of compile_macros.h to include.
     * @returns the flags written to CompileFlags.Add.
     */
    private async generateContextAddCompileMacros(clangdFile: URI, compileMacrosFile: URI): Promise<string[]> {
        // Update clangd AddFlags flags for intellisense uplift
        // We make an assumption that project .clangd files only have one fragment
        const fragments = await this.getConfigFragments(clangdFile);
        if (fragments.length < 1) {
            fragments[0] = DEFAULT_CLANGD_CONFIG;
        }
        const flags = ['-include', `${compileMacrosFile.fsPath}`];
        fragments[0].CompileFlags.Add = flags;
        await this.writeConfigFragments([fragments[0]], clangdFile);
        return flags;
    }

    /**
     * Generate and set the AddFlags property of a given context's .clangd file.
     *
     * @param context The SolutionContext.
     * @returns the flags retrieved.
     */
    private async generateContextAddFlags(clangdFile: URI, compileCommandsFile: URI): Promise<string[]> {
        // Update clangd AddFlags flags for intellisense uplift
        // We make an assumption that project .clangd files only have one fragment
        const fragments = await this.getConfigFragments(clangdFile);
        if (fragments.length < 1) {
            fragments[0] = DEFAULT_CLANGD_CONFIG;
        }
        try {
            const flags = [
                ...(await this.armclangDefineGetter.getClangdDefineFlags(compileCommandsFile)),
                ...(await this.compileCommandParser.getAllIncludeCommands(compileCommandsFile.fsPath))
            ];
            fragments[0].CompileFlags.Add = flags;
            await this.writeConfigFragments([fragments[0]], clangdFile);
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
    private async clearContextAddFlags(clangdFile: URI): Promise<void> {
        const fragments = await this.getConfigFragments(clangdFile);
        for (const f of fragments) {
            f.CompileFlags.Add = [];
            await this.writeConfigFragments([f], clangdFile);
        }
    }

    private isAutoGenerateEnabled(): boolean {
        return this.configurationProvider.getConfigVariable<boolean>(CONFIG_CLANGD_GENERATE_SETUP) ?? true;
    }

    /**
     * Writes back a given clangd config fragment to a config file.
     * If the fragment has an If property that will be used to determine
     * if it should be replacing a matching fragment in the file or being appended.
     *
     * If there is no If and the file only contains one config, then it will instead replace that config.
     *
     * @param newFragments An array of clangd config fragments.
     * @param configFilePath A path to a clangd config file.
     */
    protected async writeConfigFragments(newFragments: ClangdConfig[], configFilePath: URI): Promise<void> {
        const currentFragments = await this.getConfigFragments(configFilePath);
        for (const f of newFragments) {
            const index = currentFragments.findIndex(cf => this.configFragmentsMatch(cf, f));
            if (currentFragments.length <= 1 && (!f.If)) {
                currentFragments[0] = f;
            } else if (index > -1) {
                currentFragments[index] = f;
            } else {
                currentFragments.push(f);
            }
        }
        try {
            // Create parent directory if it doesn't exist before attempting write
            await this.workspaceFsProvider.createDirectory(path.dirname(configFilePath.fsPath));
            await this.workspaceFsProvider.writeUtf8File(configFilePath.fsPath, currentFragments.map(cf => yaml.stringify(cf)).join('\n---\n'));
        } catch (err) {
            if (err instanceof FileSystemError) {
                switch (err.code) {
                    case 'NoPermissions':
                        console.log(`VS Code doesn't have permission to write clangd config fragment: ${err}`);
                        break;
                    default:
                        console.log(`Failed to write clangd config due to a FileSystemError: ${err}`);
                }
            } else {
                console.log(`Failed to write clangd config fragment with unknown error: ${err}`);
            }
        }
    }

    /**
     * Reads a given clangd config file and returns an array of
     * clang configs representing its fragments.
     *
     * @param configFilePath A path to the clangd config file.
     */
    protected async getConfigFragments(configFilePath: URI): Promise<ClangdConfig[]> {
        const userConfigPath = configFilePath;
        try {
            const content = await this.workspaceFsProvider.readUtf8File(userConfigPath.fsPath);
            if (!content) {
                return [];
            }
            const configs = yaml.parseAllDocuments(content).map(doc => doc.toJS() as ClangdConfig);
            return configs;
        } catch (err) {
            console.log(`Unable to read clangd configs: ${err}`);
            return [];
        }
    }

    /**
     * Check if two ClangdConfigs (fragments) match using
     * their If properties as a unique identifier.
     *
     * @param f1
     * @param f2
     * @returns true if the two configs match
     */
    private configFragmentsMatch(f1: ClangdConfig, f2: ClangdConfig) {
        if (f1.If?.PathMatch !== f2.If?.PathMatch) {
            return false;
        }
        if (f1.If?.PathExclude !== f2.If?.PathExclude) {
            return false;
        }
        return true;
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
