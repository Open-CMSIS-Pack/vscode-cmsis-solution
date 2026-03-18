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

import * as vscode from 'vscode';
import { SolutionLoadState, SolutionLoadStateChangeEvent, SolutionManager } from './solution-manager';
import { makeFactory, StubEvents } from '../__test__/test-data-factory';
import { faker } from '@faker-js/faker';
import path from 'path';
import { csolutionFactory } from './csolution.factory';
import { Severity } from './constants';
import { solutionRpcDataFactory } from './solution-rpc-data.factory';

export type MockSolutionManager = jest.Mocked<StubEvents<SolutionManager>> & { fireOnDidChangeLoadState: ReturnType<typeof fireOnDidChangeLoadState> };

export const idleSolutionLoadStateFactory = makeFactory<SolutionLoadState>({
    solutionPath: () => undefined,
    activated: () => undefined,
    loaded: () => undefined,
    converted: () => undefined,
});

export const activeSolutionLoadStateFactory = makeFactory<SolutionLoadState>({
    solutionPath: () => path.join(faker.system.filePath(), `${faker.word.noun()}.csolution.yml`),
    activated: () => true,
    loaded: () => undefined,
    converted: () => undefined,
});

const fireOnDidChangeLoadState = (emitter: vscode.EventEmitter<SolutionLoadStateChangeEvent>) => {
    return function fire(newState?: SolutionLoadState, previousState?: SolutionLoadState) {
        emitter.fire({
            previousState: previousState ?? idleSolutionLoadStateFactory(),
            newState: newState ?? activeSolutionLoadStateFactory(),
        });
    };
};

export const solutionManagerFactory = makeFactory<MockSolutionManager>({
    loadState: () => idleSolutionLoadStateFactory(),
    getCsolution: () => jest.fn().mockReturnValue(csolutionFactory()),
    getRpcData: () => jest.fn().mockReturnValue(solutionRpcDataFactory()),
    onDidChangeLoadStateEmitter: () => new vscode.EventEmitter<SolutionLoadStateChangeEvent>(),
    onDidChangeLoadState: (r) => jest.fn(r.onDidChangeLoadStateEmitter!.event),
    onLoadedBuildFilesEmitter: () => new vscode.EventEmitter<[Severity, boolean]>(),
    onLoadedBuildFiles: (r) => jest.fn(r.onLoadedBuildFilesEmitter!.event),
    fireOnDidChangeLoadState: (r) => fireOnDidChangeLoadState(r.onDidChangeLoadStateEmitter!),
    workspaceFolder: () => vscode.Uri.file('/workspace/folder'),
    refresh: () => jest.fn(),
    onUpdatedCompileCommandsEmitter: () => new vscode.EventEmitter<void>(),
    onUpdatedCompileCommands: (r) => jest.fn(r.onUpdatedCompileCommandsEmitter!.event),
});
