/**
 * Copyright 2026 Arm Limited
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

import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import yaml from 'yaml';
import { ActiveTool, EnvironmentManagerApiV1, VcpkgResults } from '@arm-software/vscode-environment-manager';
import { EnvironmentManager } from '../desktop/env-manager';
import { CMSIS_TOOLBOX_FOLDER, PACKAGE_NAME } from '../manifest';
import { getCmsisToolboxRoot } from '../utils/path-utils';
import { ExtensionApiProvider } from '../vscode-api/extension-api-provider';
import { WorkspaceFsProvider } from '../vscode-api/workspace-fs-provider';

const ENVIRONMENT_MANAGER_EXTENSION_ID = 'arm.environment-manager';
const CMSIS_SOLUTION_EXTENSION_ID = `arm.${PACKAGE_NAME}`;
const CMSIS_DEBUGGER_EXTENSION_ID = 'arm.vscode-cmsis-debugger';
const DOCUMENT_VERSION = '1.0.0';
const CMSIS_ENVIRONMENT_VARIABLES = ['CMSIS_PACK_ROOT', 'CMSIS_COMPILER_ROOT'];

type EnvironmentManagerToolsApi = Pick<EnvironmentManagerApiV1, 'getActiveTools'>
    & Partial<Pick<EnvironmentManagerApiV1, 'isActivating' | 'onDidActivate' | 'onDidFailActivation'>>;

interface BuiltInTool {
    tool: string;
    version: string;
    command: string;
    path: string;
    extension: string;
    manual: string;
}

interface ToolCandidate {
    identity: string;
    directory: string;
    value: Record<string, unknown>;
}

interface VcpkgPackage {
    name: string;
    version: string;
    root: string;
    pathEntry: string;
}

export class ToolsEnvironment {
    private readonly pendingWrites = new Map<string, Promise<void>>();

    constructor(
        private readonly environmentManager: EnvironmentManager,
        private readonly environmentManagerApiProvider: ExtensionApiProvider<EnvironmentManagerToolsApi>,
        private readonly workspaceFsProvider: WorkspaceFsProvider,
        private vcpkgResults?: VcpkgResults,
    ) {
    }

    public updateVcpkgResults(results: VcpkgResults): void {
        this.vcpkgResults = results;
    }

    public async captureAndQueueWrite(solutionPath: string): Promise<void> {
        const environmentManagerApi = await this.environmentManagerApiProvider.activateIfEnabled();
        if (environmentManagerApi) {
            await this.waitUntilReady(environmentManagerApi);
        }
        const content = this.createContent(solutionPath, environmentManagerApi?.getActiveTools() ?? []);
        this.queueWrite(solutionPath, content);
    }

    public async write(solutionPath: string): Promise<void> {
        const environmentManagerApi = await this.environmentManagerApiProvider.activateIfEnabled();
        const content = this.createContent(solutionPath, environmentManagerApi?.getActiveTools() ?? []);
        await this.writeContent(solutionPath, content);
    }

    private createContent(solutionPath: string, installedTools: ActiveTool[]): string {
        // Resolved environment: retain only values contributed or used by Arm extensions and vcpkg.
        const vcpkgVariables = Object.fromEntries(
            Object.entries(this.vcpkgResults?.variables ?? {})
                .filter(([name]) => name.toLowerCase() !== 'path'),
        );
        const resolvedVariables = this.mergeEnvironmentVariables(
            this.environmentManager.getEnvironmentVariables(),
            vcpkgVariables,
        );
        const localPath = this.getEnvironmentVariable(resolvedVariables, 'PATH');
        const localPathEntries = localPath?.split(path.delimiter).filter(Boolean) ?? [];
        const builtInTools = this.getBuiltInTools(resolvedVariables);
        const configuredVariables = this.mergeEnvironmentVariables(
            this.environmentManager.getConfiguredEnvironmentVariables(),
        );
        const configuredPath = this.getEnvironmentVariable(configuredVariables, 'PATH');
        const configuredPathEntries = configuredPath?.split(path.delimiter).filter(Boolean) ?? [];
        const contributedPathEntries = this.uniquePaths([
            ...configuredPathEntries,
            ...builtInTools.map(tool => tool.path),
            ...(this.vcpkgResults?.paths.PATH ?? []),
        ]);
        const pathEntries = this.selectPathEntries(
            this.uniquePaths([...localPathEntries, ...contributedPathEntries])
                .filter(entry => contributedPathEntries.some(contributed => this.pathsEqual(entry, contributed))),
            builtInTools,
        );
        const installedPackages = this.findVcpkgPackages([
            ...pathEntries,
            ...Object.values(this.vcpkgResults?.tools ?? {}),
        ]);
        const variables = this.selectVariables(resolvedVariables, configuredVariables);
        const toolsEnvironment = {
            'cmsis-tools-environment': {
                // Document metadata identifies the format and the converted solution.
                version: DOCUMENT_VERSION,
                'generated-by': `${CMSIS_SOLUTION_EXTENSION_ID} version ${this.getExtensionVersion()}`,
                solution: this.toPortablePath(path.relative(
                    path.join(path.dirname(solutionPath), '.cmsis'),
                    solutionPath,
                )),
                environment: {
                    path: pathEntries.map(entry => this.toPortablePath(entry)),
                    variables: Object.fromEntries(
                        Object.entries(variables)
                            .filter(([key]) => key.toLowerCase() !== 'path')
                            .filter((entry): entry is [string, string] => entry[1] !== undefined)
                            .map(([key, value]) => [key, this.toPortablePath(value)]),
                    ),
                },
                tools: this.selectTools(
                    builtInTools,
                    installedTools,
                    installedPackages,
                    pathEntries,
                ),
            },
        };
        return yaml.stringify(toolsEnvironment);
    }

    private async writeContent(solutionPath: string, content: string): Promise<void> {
        const cmsisDirectory = path.join(path.dirname(solutionPath), '.cmsis');
        const toolsEnvironmentPath = path.join(cmsisDirectory, 'tools-environment.yml');
        try {
            if (await this.workspaceFsProvider.readUtf8File(toolsEnvironmentPath) === content) {
                return;
            }
        } catch {
            // Missing or unreadable output is replaced below.
        }
        await this.workspaceFsProvider.createDirectory(cmsisDirectory);
        await this.workspaceFsProvider.writeUtf8File(toolsEnvironmentPath, content);
    }

    private queueWrite(solutionPath: string, content: string): void {
        const outputPath = path.join(path.dirname(solutionPath), '.cmsis', 'tools-environment.yml');
        const previousWrite = this.pendingWrites.get(outputPath) ?? Promise.resolve();
        const pendingWrite = previousWrite
            .catch(() => undefined)
            .then(() => this.writeContent(solutionPath, content));
        this.pendingWrites.set(outputPath, pendingWrite);
        void pendingWrite.catch(error => {
            console.error(`Failed to write tools environment for '${solutionPath}'`, error);
        }).finally(() => {
            if (this.pendingWrites.get(outputPath) === pendingWrite) {
                this.pendingWrites.delete(outputPath);
            }
        });
    }

    private async waitUntilReady(environmentManagerApi: EnvironmentManagerToolsApi): Promise<void> {
        const onDidActivate = environmentManagerApi.onDidActivate;
        const onDidFailActivation = environmentManagerApi.onDidFailActivation;
        if (!environmentManagerApi.isActivating?.() || !onDidActivate || !onDidFailActivation) {
            return;
        }
        await new Promise<void>(resolve => {
            const disposables: vscode.Disposable[] = [];
            const finishIfReady = () => {
                if (!environmentManagerApi.isActivating?.()) {
                    disposables.forEach(disposable => disposable.dispose());
                    resolve();
                }
            };
            disposables.push(
                onDidActivate(results => {
                    this.updateVcpkgResults(results);
                    finishIfReady();
                }),
                onDidFailActivation(finishIfReady),
            );
            finishIfReady();
        });
    }

    private getBuiltInTools(environment: NodeJS.ProcessEnv): BuiltInTool[] {
        const tools: BuiltInTool[] = [];
        if (getCmsisToolboxRoot(environment) === CMSIS_TOOLBOX_FOLDER) {
            tools.push({
                tool: 'CMSIS-Toolbox',
                version: this.getCmsisToolboxVersion(),
                command: 'csolution',
                path: path.join(CMSIS_TOOLBOX_FOLDER, 'bin'),
                extension: CMSIS_SOLUTION_EXTENSION_ID,
                manual: 'https://open-cmsis-pack.github.io/cmsis-toolbox/',
            });
        }

        const debuggerExtension = vscode.extensions.getExtension<void>(CMSIS_DEBUGGER_EXTENSION_ID);
        if (debuggerExtension?.extensionPath) {
            tools.push({
                tool: 'pyOCD',
                version: this.readVersionFile(path.join(debuggerExtension.extensionPath, 'tools', 'pyocd', 'version.txt')),
                command: 'pyocd',
                path: path.join(debuggerExtension.extensionPath, 'tools', 'pyocd'),
                extension: CMSIS_DEBUGGER_EXTENSION_ID,
                manual: 'https://pyocd.io/docs/',
            });
            tools.push({
                tool: 'Arm GNU GDB',
                version: this.readVersionFile(path.join(debuggerExtension.extensionPath, 'tools', 'gdb', 'version.txt')),
                command: 'arm-none-eabi-gdb',
                path: path.join(debuggerExtension.extensionPath, 'tools', 'gdb', 'bin'),
                extension: CMSIS_DEBUGGER_EXTENSION_ID,
                manual: 'https://developer.arm.com/Tools%20and%20Software/GNU%20Toolchain',
            });
        }
        return tools;
    }

    private selectTools(
        builtInTools: BuiltInTool[],
        installedTools: ActiveTool[],
        installedPackages: VcpkgPackage[],
        pathEntries: string[],
    ) {
        // Tool selection groups built-in and installed candidates by command identity.
        const candidates: ToolCandidate[] = [
            ...builtInTools.map(tool => ({
                identity: tool.command,
                directory: tool.path,
                value: this.mapBuiltInTool(tool),
            })),
            ...installedTools
                .filter(tool => !installedPackages.some(vcpkgPackage => this.pathContains(vcpkgPackage.root, tool.fullPath)))
                .map(tool => ({
                    identity: this.installedToolIdentity(tool),
                    directory: path.dirname(tool.fullPath),
                    value: this.mapInstalledTool(tool),
                })),
            ...installedPackages
                .map(vcpkgPackage => ({
                    identity: this.vcpkgPackageIdentity(vcpkgPackage),
                    directory: vcpkgPackage.pathEntry,
                    value: this.mapInstalledPackage(vcpkgPackage),
                })),
        ];
        const winners = new Map<string, ToolCandidate>();
        for (const candidate of candidates) {
            const identity = this.normalizeCommand(candidate.identity);
            const current = winners.get(identity);
            // The candidate found first in the exported PATH is the executable winner.
            if (!current || this.pathIndex(candidate.directory, pathEntries) < this.pathIndex(current.directory, pathEntries)) {
                winners.set(identity, candidate);
            }
        }
        return [...winners.values()]
            .sort((left, right) => this.pathIndex(left.directory, pathEntries) - this.pathIndex(right.directory, pathEntries))
            .map(candidate => candidate.value);
    }

    private mapBuiltInTool(tool: BuiltInTool) {
        // Built-in metadata names the Arm extension that ships the PATH directory.
        return {
            name: tool.tool,
            version: tool.version,
            origin: 'built-in',
            provider: {
                type: 'vscode-extension',
                id: tool.extension,
            },
            directory: this.toPortablePath(tool.path),
            manual: tool.manual,
        };
    }

    private mapInstalledTool(tool: ActiveTool) {
        // Active tools outside recognized artifacts expose their PATH directory.
        return {
            name: tool.name,
            origin: 'installed',
            provider: {
                type: 'vcpkg',
                id: ENVIRONMENT_MANAGER_EXTENSION_ID,
            },
            directory: this.toPortablePath(path.dirname(tool.fullPath)),
        };
    }

    private mapInstalledPackage(vcpkgPackage: VcpkgPackage) {
        // Recognized artifacts expose canonical package identity, version, and package root separately.
        return {
            name: vcpkgPackage.name,
            version: vcpkgPackage.version,
            origin: 'installed',
            provider: {
                type: 'vcpkg',
                id: ENVIRONMENT_MANAGER_EXTENSION_ID,
            },
            directory: this.toPortablePath(vcpkgPackage.root),
        };
    }

    private getExtensionVersion(): string {
        return vscode.extensions.getExtension(CMSIS_SOLUTION_EXTENSION_ID)?.packageJSON.version ?? 'unknown';
    }

    private getCmsisToolboxVersion(): string {
        const manifest = fs.readdirSync(CMSIS_TOOLBOX_FOLDER)
            .find(file => /^manifest_(.+)\.ya?ml$/i.test(file));
        const match = manifest?.match(/^manifest_(.+)\.ya?ml$/i);
        return match?.[1] ?? 'unknown';
    }

    private readVersionFile(filePath: string): string {
        try {
            return fs.readFileSync(filePath, 'utf8').trim();
        } catch {
            return 'unknown';
        }
    }

    private toPortablePath(value: string): string {
        return value.replace(/\\/g, '/');
    }

    private normalizeCommand(command: string): string {
        return command.replace(/\.exe$/i, '').toLocaleLowerCase();
    }

    private installedToolIdentity(tool: ActiveTool): string {
        const normalizedName = tool.name.replace(/[^a-z0-9]/gi, '').toLocaleLowerCase();
        // Environment Manager may report any command from the CMSIS-Toolbox suite.
        return normalizedName.includes('cmsistoolbox') ? 'csolution' : path.basename(tool.fullPath);
    }

    private vcpkgPackageIdentity(vcpkgPackage: VcpkgPackage): string {
        return this.isCmsisToolboxPath(vcpkgPackage.name) ? 'csolution' : vcpkgPackage.name;
    }

    private pathIndex(directory: string, pathEntries: string[]): number {
        const normalizedDirectory = this.normalizePath(directory);
        const index = pathEntries.findIndex(entry => this.normalizePath(entry) === normalizedDirectory);
        return index === -1 ? Number.MAX_SAFE_INTEGER : index;
    }

    private normalizePath(value: string): string {
        const normalized = path.normalize(value);
        return process.platform === 'win32' ? normalized.toLocaleLowerCase() : normalized;
    }

    private pathsEqual(left: string, right: string): boolean {
        return this.normalizePath(left) === this.normalizePath(right);
    }

    private selectVariables(variables: NodeJS.ProcessEnv, configuredVariables: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
        // Unrelated host process variables are intentionally omitted.
        const selectedNames = new Set([
            ...CMSIS_ENVIRONMENT_VARIABLES,
            ...Object.keys(configuredVariables),
            ...Object.keys(this.vcpkgResults?.variables ?? {}),
        ].map(name => name.toLowerCase()));
        return Object.fromEntries(
            Object.entries(variables).filter(([name]) => name.toLowerCase() !== 'path' && selectedNames.has(name.toLowerCase())),
        );
    }

    private mergeEnvironmentVariables(...sources: (NodeJS.ProcessEnv | undefined)[]): NodeJS.ProcessEnv {
        const merged = new Map<string, [string, string]>();
        for (const source of sources) {
            for (const [name, value] of Object.entries(source ?? {})) {
                if (value !== undefined) {
                    merged.set(name.toLowerCase(), [name, value]);
                }
            }
        }
        return Object.fromEntries(merged.values());
    }

    private getEnvironmentVariable(environment: NodeJS.ProcessEnv, name: string): string | undefined {
        return Object.entries(environment).find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1];
    }

    private uniquePaths(paths: string[]): string[] {
        const seen = new Set<string>();
        return paths.filter(entry => {
            const normalized = this.normalizePath(entry);
            if (seen.has(normalized)) {
                return false;
            }
            seen.add(normalized);
            return true;
        });
    }

    private selectPathEntries(pathEntries: string[], builtInTools: BuiltInTool[]): string[] {
        const builtInToolboxPaths = new Set(
            builtInTools
                .filter(tool => this.normalizeCommand(tool.command) === 'csolution')
                .map(tool => this.normalizePath(tool.path)),
        );
        let foundToolbox = false;
        return pathEntries.filter(entry => {
            // Export only the first CMSIS-Toolbox directory in PATH precedence order.
            const isToolbox = builtInToolboxPaths.has(this.normalizePath(entry)) || this.isCmsisToolboxPath(entry);
            if (!isToolbox) {
                return true;
            }
            if (foundToolbox) {
                return false;
            }
            foundToolbox = true;
            return true;
        });
    }

    private findVcpkgPackages(locations: string[]): VcpkgPackage[] {
        // Artifact paths encode .vcpkg/artifacts/<hash>/<package>/<version>.
        const packages = new Map<string, VcpkgPackage>();
        for (const location of locations) {
            const match = location.match(/^(.*?[\\/]\.vcpkg[\\/]artifacts[\\/][^\\/]+[\\/])([^\\/]+)[\\/]([^\\/]+)(?:[\\/].*)?$/i);
            if (!match) {
                continue;
            }
            const [, artifactsRoot, name, version] = match;
            const key = `${name.toLocaleLowerCase()}@${version.toLocaleLowerCase()}`;
            if (!packages.has(key)) {
                packages.set(key, {
                    name,
                    version,
                    root: path.join(artifactsRoot, name, version),
                    pathEntry: location,
                });
            }
        }
        return [...packages.values()];
    }

    private isCmsisToolboxPath(value: string): boolean {
        return value.replace(/[^a-z0-9]/gi, '').toLocaleLowerCase().includes('cmsistoolbox');
    }

    private pathContains(parent: string, child: string): boolean {
        const relative = path.relative(parent, child);
        return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
    }
}
