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

import 'jest';
import path from 'node:path';
import type { WorkspaceFolder } from 'vscode';
import { URI } from 'vscode-uri';
import * as manifest from '../../manifest';
import { waitForCondition, } from '../../__test__/wait-for-condition';
import { waitTimeout } from '../../__test__/test-waits';
import { commandsProviderFactory, type MockCommandsProvider } from '../../vscode-api/commands-provider.factories';
import { configurationProviderFactory, type MockConfigurationProvider } from '../../vscode-api/configuration-provider.factories';
import { fileWatcherProviderFactory, type MockFileWatcherProvider } from '../../vscode-api/file-watcher-provider.factories';
import { workspaceFoldersProviderFactory, type MockWorkspaceFoldersProvider } from '../../vscode-api/workspace-folders-provider.factories';
jest.mock('lodash.debounce', () => ({
    __esModule: true,
    default: <T extends (...args: unknown[]) => unknown>(callback: T) => callback,
}));

import { ConfigWizardFilesContextService } from './config-wizard-files-context-service';
import type { ConfigWizardAnnotationChecker } from '../../utils/config-wizard-checker';

describe('ConfigWizardFilesContextService', () => {
    const workspacePath = path.join(__dirname, 'workspace');
    const annotatedUri = URI.file(`${workspacePath}/annotated.txt`);
    const plainUri = URI.file(`${workspacePath}/plain.txt`);
    const changedUri = URI.file(`${workspacePath}/startup.s`);
    const refreshedUri = URI.file(`${workspacePath}/scatter.sct`);
    const annotatedPath = path.resolve(annotatedUri.fsPath);
    const changedPath = path.resolve(changedUri.fsPath);
    const refreshedPath = path.resolve(refreshedUri.fsPath);

    let context: { subscriptions: Array<{ dispose: () => void }> };
    let commandsProvider: MockCommandsProvider;
    let fileWatcherProvider: MockFileWatcherProvider;
    let workspaceFoldersProvider: MockWorkspaceFoldersProvider;
    let configurationProvider: MockConfigurationProvider;
    let annotationChecker: jest.Mocked<ConfigWizardAnnotationChecker>;
    let service: ConfigWizardFilesContextService;

    beforeEach(() => {
        context = { subscriptions: [] };
        commandsProvider = commandsProviderFactory();
        commandsProvider.executeCommand.mockResolvedValue(undefined);
        fileWatcherProvider = fileWatcherProviderFactory();
        workspaceFoldersProvider = workspaceFoldersProviderFactory([
            { uri: URI.file(workspacePath), name: 'workspace', index: 0 } as WorkspaceFolder,
        ]);
        configurationProvider = configurationProviderFactory();
        annotationChecker = {
            hasAnnotations: jest.fn().mockResolvedValue(false),
        };

        service = new ConfigWizardFilesContextService(
            commandsProvider,
            fileWatcherProvider,
            workspaceFoldersProvider,
            configurationProvider,
            annotationChecker,
            0,
        );
    });

    afterEach(() => {
        for (const { dispose } of context.subscriptions) {
            dispose();
        }
    });

    describe('activate', () => {
        it('sets context only for files that contain configuration wizard annotations', async () => {
            workspaceFoldersProvider.findFiles.mockResolvedValue([annotatedUri, plainUri]);
            annotationChecker.hasAnnotations.mockImplementation(async filePath => filePath === annotatedUri.fsPath);

            service.activate(context as never);

            const contextValue = await waitForContextValue(commandsProvider, value =>
                value[annotatedPath] === true,
            );

            expect(contextValue).toEqual({ [annotatedPath]: true });
        });
    });

    describe('file changes', () => {
        it('adds a changed workspace file to the preview context when annotations are detected', async () => {
            workspaceFoldersProvider.findFiles.mockResolvedValue([]);
            annotationChecker.hasAnnotations.mockImplementation(async filePath => filePath === changedUri.fsPath);

            service.activate(context as never);
            await waitForCondition(
                async () => workspaceFoldersProvider.findFiles.mock.calls.length === 1,
                'initial file scan to complete',
                200,
            );

            fileWatcherProvider.mockFireEvent('**/*', changedUri.fsPath, 'change');

            const contextValue = await waitForContextValue(commandsProvider, value => value[changedPath] === true);

            expect(contextValue).toEqual({ [changedPath]: true });
        });

        it('removes a deleted annotated file from the preview context', async () => {
            workspaceFoldersProvider.findFiles.mockResolvedValue([annotatedUri]);
            annotationChecker.hasAnnotations.mockResolvedValue(true);

            service.activate(context as never);
            await waitForContextValue(commandsProvider, value => value[annotatedPath] === true);

            commandsProvider.executeCommand.mockClear();

            fileWatcherProvider.mockFireEvent('**/*', annotatedUri.fsPath, 'delete');

            const contextValue = await waitForContextValue(commandsProvider, value => Object.keys(value).length === 0);

            expect(contextValue).toEqual({});
        });
    });

    describe('configuration changes', () => {
        it('refreshes the preview context when the exclude setting changes', async () => {
            workspaceFoldersProvider.findFiles.mockResolvedValue([annotatedUri]);
            annotationChecker.hasAnnotations.mockImplementation(async filePath =>
                filePath === annotatedUri.fsPath || filePath === refreshedUri.fsPath,
            );

            service.activate(context as never);
            await waitForContextValue(commandsProvider, value => value[annotatedUri.fsPath] === true);

            workspaceFoldersProvider.findFiles.mockResolvedValue([refreshedUri]);
            commandsProvider.executeCommand.mockClear();

            configurationProvider.fireOnChangeConfiguration(manifest.CONFIG_EXCLUDE);

            const contextValue = await waitForContextValue(commandsProvider, value =>
                value[refreshedPath] === true,
            );

            expect(contextValue).toEqual({ [refreshedPath]: true });
        });
    });
});

async function waitForContextValue(
    commandsProvider: MockCommandsProvider,
    predicate: (value: Record<string, boolean>) => boolean,
): Promise<Record<string, boolean>> {
    await waitForCondition(async () => {
        const contextValue = getLatestContextValue(commandsProvider);
        return !!contextValue && predicate(contextValue);
    }, 'config wizard files context update', 200);

    await waitTimeout(0);

    return getLatestContextValue(commandsProvider) || {};
}

function getLatestContextValue(commandsProvider: MockCommandsProvider): Record<string, boolean> | undefined {
    const matchingCall = [...commandsProvider.executeCommand.mock.calls]
        .reverse()
        .find(([command, key]) =>
            command === 'setContext' && key === ConfigWizardFilesContextService.contextKey,
        );

    if (!matchingCall) {
        return undefined;
    }

    return matchingCall[2] as Record<string, boolean>;
}
