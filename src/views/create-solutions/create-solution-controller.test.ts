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

import * as path from 'path';
import { CreateSolutionController } from './create-solution-controller';
import { CreateSolutionData } from './create-solution-data';
import { SolutionCreator } from '../../solutions/solution-creator';
import { commandsProviderFactory } from '../../vscode-api/commands-provider.factories';
import { messageProviderFactory } from '../../vscode-api/message-provider.factories';
import { workspaceFoldersProviderFactory } from '../../vscode-api/workspace-folders-provider.factories';

describe('CreateSolutionController', () => {
    const requestId = 'request-id';

    const createTestee = () => {
        const dataModel = {
            getTargets: jest.fn(),
            getBoardInfo: jest.fn(),
            getDeviceInfo: jest.fn(),
            getDraftProjects: jest.fn(),
            getDraftProject: jest.fn(),
            getDraftProjectInfo: jest.fn(),
        } as unknown as jest.Mocked<CreateSolutionData>;
        const solutionCreator = {
            createSolution: jest.fn(),
        } as jest.Mocked<SolutionCreator>;
        const messageProvider = messageProviderFactory();
        const commandsProvider = commandsProviderFactory();
        const workspaceFoldersProvider = workspaceFoldersProviderFactory();
        const findSolutionFiles = jest.fn<string[], [string]>().mockReturnValue([]);

        const testee = new CreateSolutionController(
            dataModel,
            solutionCreator,
            messageProvider,
            commandsProvider,
            workspaceFoldersProvider,
            findSolutionFiles,
        );

        return { testee, dataModel, solutionCreator, messageProvider, findSolutionFiles };
    };

    it('checks the solution directory for existing solution files', async () => {
        const { testee, findSolutionFiles } = createTestee();

        const responses = await testee.handleRequest({
            type: 'CHECK_SOLUTION_DOES_NOT_EXIST',
            requestId,
            solutionLocation: 'solutions',
            solutionFolder: 'folder',
        });

        expect(findSolutionFiles).toHaveBeenCalledWith(path.join('solutions', 'folder'));
        expect(responses).toEqual([{
            type: 'REQUEST_SUCCESSFUL',
            requestType: 'CHECK_SOLUTION_DOES_NOT_EXIST',
            requestId,
        }]);
    });

    it('reports a differently named YAML solution file as an existing solution', async () => {
        const { testee, findSolutionFiles } = createTestee();
        findSolutionFiles.mockReturnValue([path.join('solutions', 'folder', 'existing.csolution.yaml')]);

        const responses = await testee.handleRequest({
            type: 'CHECK_SOLUTION_DOES_NOT_EXIST',
            requestId,
            solutionLocation: 'solutions',
            solutionFolder: 'folder',
        });

        expect(responses).toEqual([{
            type: 'REQUEST_FAILED',
            requestType: 'CHECK_SOLUTION_DOES_NOT_EXIST',
            requestId,
            errorMessage: 'Selected solution directory folder already contains existing.csolution.yaml',
            solutionConflict: {
                solutionFolder: 'folder',
                fileName: 'existing.csolution.yaml',
            },
        }]);
        const [response] = responses;
        if (response.type !== 'REQUEST_FAILED') {
            throw new Error(`Expected REQUEST_FAILED but received ${response.type}`);
        }
        expect(response.errorMessage).not.toContain('solutions');
    });

    it('does not create or prompt when the submitted directory contains a solution', async () => {
        const { testee, findSolutionFiles, solutionCreator, messageProvider } = createTestee();
        findSolutionFiles.mockReturnValue([path.join('solutions', 'folder', 'existing.csolution.yml')]);

        const responses = await testee.handleRequest({
            type: 'NEW_SOLUTION',
            requestId,
            solutionName: 'solution',
            projects: [],
            targetTypes: [],
            packs: [],
            gitInit: false,
            solutionLocation: 'solutions',
            solutionFolder: 'folder',
            compiler: 'AC6',
        });

        expect(solutionCreator.createSolution).not.toHaveBeenCalled();
        expect(messageProvider.showWarningMessage).not.toHaveBeenCalled();
        expect(responses).toEqual([{
            type: 'REQUEST_FAILED',
            requestType: 'NEW_SOLUTION',
            requestId,
            errorMessage: 'Selected solution directory folder already contains existing.csolution.yml',
            solutionConflict: {
                solutionFolder: 'folder',
                fileName: 'existing.csolution.yml',
            },
        }]);
    });

    it('returns a structured conflict when a solution appears during creation', async () => {
        const { testee, solutionCreator, messageProvider } = createTestee();
        const { SolutionDirectoryConflictError } = await import('../../solutions/solution-creator');
        solutionCreator.createSolution.mockRejectedValue(
            new SolutionDirectoryConflictError('folder', 'late.csolution.yml'),
        );

        const responses = await testee.handleRequest({
            type: 'NEW_SOLUTION',
            requestId,
            solutionName: 'solution',
            projects: [],
            targetTypes: [],
            packs: [],
            gitInit: false,
            solutionLocation: 'solutions',
            solutionFolder: 'folder',
            compiler: 'AC6',
        });

        expect(solutionCreator.createSolution).toHaveBeenCalledTimes(1);
        expect(messageProvider.showErrorMessage).not.toHaveBeenCalled();
        expect(responses).toEqual([{
            type: 'REQUEST_FAILED',
            requestType: 'NEW_SOLUTION',
            requestId,
            errorMessage: 'Selected solution directory folder already contains late.csolution.yml',
            solutionConflict: {
                solutionFolder: 'folder',
                fileName: 'late.csolution.yml',
            },
        }]);
    });

    it('returns only a correlated failure when creation fails', async () => {
        const { testee, solutionCreator, messageProvider } = createTestee();
        solutionCreator.createSolution.mockRejectedValue(new Error('creation failed'));

        const responses = await testee.handleRequest({
            type: 'NEW_SOLUTION',
            requestId,
            solutionName: 'solution',
            projects: [],
            targetTypes: [],
            packs: [],
            gitInit: false,
            solutionLocation: 'solutions',
            solutionFolder: 'folder',
            compiler: 'AC6',
        });

        expect(responses).toEqual([{
            type: 'REQUEST_FAILED',
            requestType: 'NEW_SOLUTION',
            requestId,
            errorMessage: 'Failed to create solution: creation failed',
        }]);
        expect(messageProvider.showErrorMessage).toHaveBeenCalledWith('Failed to create solution: creation failed');
    });

    it('awaits model data before returning data and completion responses', async () => {
        const { testee, dataModel } = createTestee();
        let resolveTargets!: (value: Awaited<ReturnType<CreateSolutionData['getTargets']>>) => void;
        const targetsPending = new Promise<Awaited<ReturnType<CreateSolutionData['getTargets']>>>(resolve => {
            resolveTargets = resolve;
        });
        dataModel.getTargets.mockReturnValue(targetsPending);

        const responsesPending = testee.handleRequest({ type: 'DATA_GET_TARGETS', requestId });
        let settled = false;
        void responsesPending.then(() => { settled = true; });
        await Promise.resolve();

        expect(settled).toBe(false);

        resolveTargets({ data: { boards: [], devices: [] }, errors: ['data error'] });
        await expect(responsesPending).resolves.toEqual([
            { type: 'TARGET_DATA', requestId, data: { boards: [], devices: [] }, errors: ['data error'] },
            { type: 'REQUEST_SUCCESSFUL', requestType: 'DATA_GET_TARGETS', requestId },
        ]);
    });
});
