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

import { Disposable } from 'vscode';
import { CsolutionApiV2 } from '../../api/csolution';
import { draftProjectDataFactory } from '../data-manager/data-manager.factories';
import { SolutionManager } from '../solutions/solution-manager';
import { CsolutionApiV3Impl } from './v3-api';

describe('CsolutionApiV3Impl', () => {
    let existingApi: jest.Mocked<CsolutionApiV2 & Disposable>;
    let api: CsolutionApiV3Impl;
    const solutionManager: { loadState: SolutionManager['loadState'] } = { loadState: {} };
    const toolsEnvironment = { getToolsEnvironment: jest.fn() };

    beforeEach(() => {
        existingApi = {
            dispose: jest.fn(),
            getBoards: jest.fn(),
            getDevices: jest.fn(),
            getDraftProjects: jest.fn(),
            createNewSolution: jest.fn(),
            build: jest.fn(),
        };
        solutionManager.loadState = {};
        toolsEnvironment.getToolsEnvironment.mockReset();
        api = new CsolutionApiV3Impl(existingApi, solutionManager, toolsEnvironment);
    });

    it('delegates tools export without a loaded solution', async () => {
        toolsEnvironment.getToolsEnvironment.mockResolvedValue('tools YAML');
        await expect(api.getToolsEnvironment()).resolves.toBe('tools YAML');
        expect(toolsEnvironment.getToolsEnvironment).toHaveBeenCalledWith(undefined);
    });

    it('supplies metadata only for a loaded solution', async () => {
        solutionManager.loadState = { loaded: true, solutionPath: '/workspace/test.csolution.yml' };
        toolsEnvironment.getToolsEnvironment.mockResolvedValue('solution tools YAML');
        await expect(api.getToolsEnvironment()).resolves.toBe('solution tools YAML');
        expect(toolsEnvironment.getToolsEnvironment).toHaveBeenLastCalledWith('/workspace/test.csolution.yml');
        solutionManager.loadState.loaded = false;
        await api.getToolsEnvironment();
        expect(toolsEnvironment.getToolsEnvironment).toHaveBeenLastCalledWith(undefined);
    });

    it('propagates environment export failures', async () => {
        toolsEnvironment.getToolsEnvironment.mockRejectedValue(new Error('export failed'));
        await expect(api.getToolsEnvironment()).rejects.toThrow('export failed');
    });

    it('delegates board queries', () => {
        const filter = { vendor: 'Arm', name: 'board' };
        const result = Promise.resolve([]);
        existingApi.getBoards.mockReturnValue(result);

        expect(api.getBoards(filter)).toBe(result);
        expect(existingApi.getBoards).toHaveBeenCalledWith(filter);
    });

    it('delegates device queries', () => {
        const filter = { vendor: 'Arm', name: 'device' };
        const result = Promise.resolve([]);
        existingApi.getDevices.mockReturnValue(result);

        expect(api.getDevices(filter)).toBe(result);
        expect(existingApi.getDevices).toHaveBeenCalledWith(filter);
    });

    it('delegates draft project queries', () => {
        const board = { key: 'Arm::board', vendor: 'Arm', name: 'board', revision: undefined };
        const device = { key: 'Arm::device', vendor: 'Arm', name: 'device' };
        const result = Promise.resolve([]);
        existingApi.getDraftProjects.mockReturnValue(result);

        expect(api.getDraftProjects(board, device)).toBe(result);
        expect(existingApi.getDraftProjects).toHaveBeenCalledWith(board, device);
    });

    it('delegates solution creation', () => {
        const options: CsolutionApiV2.CreateNewSolutionOptions = {
            draft: draftProjectDataFactory() as CsolutionApiV2.DraftProjectData,
            folder: '/workspace',
        };
        const result = Promise.resolve();
        existingApi.createNewSolution.mockReturnValue(result);

        expect(api.createNewSolution(options)).toBe(result);
        expect(existingApi.createNewSolution).toHaveBeenCalledWith(options);
    });

    it('delegates builds', () => {
        const options = { rebuild: true };
        const result = Promise.resolve({ task: {} as import('vscode').Task, terminate: jest.fn() });
        existingApi.build.mockReturnValue(result);

        expect(api.build(options)).toBe(result);
        expect(existingApi.build).toHaveBeenCalledWith(options);
    });

    it('disposes the wrapped API', () => {
        api.dispose();
        expect(existingApi.dispose).toHaveBeenCalledTimes(1);
    });
});
