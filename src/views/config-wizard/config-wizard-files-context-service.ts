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

import path from 'node:path';
import debounce from 'lodash.debounce';
import * as vscode from 'vscode';
import * as manifest from '../../manifest';
import { configWizardAnnotationChecker, type ConfigWizardAnnotationChecker } from '../../utils/config-wizard-checker';
import type { CommandsProvider } from '../../vscode-api/commands-provider';
import type { ConfigurationProvider } from '../../vscode-api/configuration-provider';
import type { FileWatcherProvider } from '../../vscode-api/file-watcher-provider';
import type { WorkspaceFoldersProvider } from '../../vscode-api/workspace-folders-provider';

export class ConfigWizardFilesContextService {
    public static readonly contextKey = `${manifest.PACKAGE_NAME}.configWizardFiles`;
    private static readonly globPattern = '**/*';
    private static readonly annotationCheckBatchSize = 32;
    private static readonly excludedPathSegments = new Set([
        'node_modules',
        '.git',
        'dist',
        'out',
        'coverage',
        'tools',
    ]);

    private readonly debouncedRefreshAll: () => void;
    private readonly debouncedRefreshPending: () => void;
    private annotatedFiles = new Set<string>();
    private readonly pendingPaths = new Set<string>();
    private refreshSequence: Promise<void> = Promise.resolve();

    public constructor(
        private readonly commandsProvider: CommandsProvider,
        private readonly fileWatcherProvider: FileWatcherProvider,
        private readonly workspaceFoldersProvider: WorkspaceFoldersProvider,
        private readonly configurationProvider: ConfigurationProvider,
        private readonly annotationChecker: ConfigWizardAnnotationChecker = configWizardAnnotationChecker,
        private readonly debounceMillis = 500,
    ) {
        this.debouncedRefreshAll = debounce(() => {
            void this.refreshAll();
        }, this.debounceMillis);
        this.debouncedRefreshPending = debounce(() => {
            void this.refreshPendingPaths();
        }, this.debounceMillis);
    }

    public activate(context: vscode.ExtensionContext): void {
        this.updateContext();

        context.subscriptions.push(
            this.fileWatcherProvider.watchFiles(ConfigWizardFilesContextService.globPattern, {
                onCreate: this.handlePathChanged,
                onChange: this.handlePathChanged,
                onDelete: this.handlePathDeleted,
            }, this),
            this.workspaceFoldersProvider.onDidChangeWorkspaceFolders(this.handleWorkspaceFoldersChanged, this),
        );

        this.configurationProvider.onChangeConfiguration(this.handleWorkspaceFoldersChanged.bind(this), manifest.CONFIG_EXCLUDE);

        void this.refreshAll();
    }

    private handleWorkspaceFoldersChanged(): void {
        this.pendingPaths.clear();
        this.debouncedRefreshAll();
    }

    private handlePathChanged(fsPath: string): void {
        if (this.isExcludedFromTracking(fsPath)) {
            return;
        }

        this.pendingPaths.add(path.resolve(fsPath));
        this.debouncedRefreshPending();
    }

    private handlePathDeleted(fsPath: string): void {
        const resolvedPath = path.resolve(fsPath);
        this.pendingPaths.delete(resolvedPath);

        if (this.annotatedFiles.delete(resolvedPath)) {
            this.updateContext();
        }
    }

    private async refreshAll(): Promise<void> {
        return this.enqueueRefresh(async () => {
            const uris = await this.workspaceFoldersProvider.findFiles(
                ConfigWizardFilesContextService.globPattern,
                this.getExcludeGlob(),
            );

            const annotatedFiles = await this.findAnnotatedPaths(uris.map(uri => uri.fsPath));
            this.annotatedFiles = new Set(annotatedFiles);
            this.updateContext();
        });
    }

    private async refreshPendingPaths(): Promise<void> {
        return this.enqueueRefresh(async () => {
            const paths = [...this.pendingPaths];
            this.pendingPaths.clear();

            const annotatedPaths = new Set(await this.findAnnotatedPaths(paths));

            for (const fsPath of paths) {
                if (annotatedPaths.has(fsPath)) {
                    this.annotatedFiles.add(fsPath);
                } else {
                    this.annotatedFiles.delete(fsPath);
                }
            }

            this.updateContext();
        });
    }

    private enqueueRefresh(refreshAction: () => Promise<void>): Promise<void> {
        const queuedRefresh = this.refreshSequence.then(refreshAction, refreshAction);
        this.refreshSequence = queuedRefresh.then(() => undefined, () => undefined);
        return queuedRefresh;
    }

    private async findAnnotatedPaths(fsPaths: string[]): Promise<string[]> {
        const annotatedPaths: string[] = [];

        for (let index = 0; index < fsPaths.length; index += ConfigWizardFilesContextService.annotationCheckBatchSize) {
            const batch = fsPaths.slice(index, index + ConfigWizardFilesContextService.annotationCheckBatchSize);
            const batchResults = await Promise.all(batch.map(async fsPath => {
                if (await this.hasAnnotations(fsPath)) {
                    return path.resolve(fsPath);
                }

                return undefined;
            }));

            annotatedPaths.push(...batchResults.filter((filePath): filePath is string => !!filePath));
        }

        return annotatedPaths;
    }

    private async hasAnnotations(fsPath: string): Promise<boolean> {
        try {
            return await this.annotationChecker.hasAnnotations(fsPath);
        } catch {
            return false;
        }
    }

    private updateContext(): void {
        const contextValue = Object.fromEntries(
            [...this.annotatedFiles]
                .sort((left, right) => left.localeCompare(right))
                .map(filePath => [filePath, true]),
        );

        void this.commandsProvider.executeCommand('setContext', ConfigWizardFilesContextService.contextKey, contextValue);
    }

    private getExcludeGlob(): string | undefined {
        const configuredExclude = this.configurationProvider.getConfigVariable<string>(manifest.CONFIG_EXCLUDE);
        const excludePatterns = [...ConfigWizardFilesContextService.excludedPathSegments].map(
            segment => `**/${segment}/**`,
        );

        if (configuredExclude) {
            excludePatterns.push(configuredExclude);
        }

        return excludePatterns.length > 0 ? `{${excludePatterns.join(',')}}` : undefined;
    }

    private isExcludedPath(fsPath: string): boolean {
        const pathSegments = path.resolve(fsPath).split(path.sep);
        return pathSegments.some(segment => ConfigWizardFilesContextService.excludedPathSegments.has(segment));
    }

    private isExcludedFromTracking(fsPath: string): boolean {
        const workspaceFolder = this.workspaceFoldersProvider.getWorkspaceFolder(fsPath);

        if (!workspaceFolder || this.isExcludedPath(fsPath)) {
            return true;
        }

        const configuredExclude = this.configurationProvider.getConfigVariable<string>(manifest.CONFIG_EXCLUDE);
        if (!configuredExclude) {
            return false;
        }

        const relativePath = path.relative(workspaceFolder.uri.fsPath, path.resolve(fsPath)).replaceAll('\\', '/');
        return path.matchesGlob(relativePath, configuredExclude);
    }
}
