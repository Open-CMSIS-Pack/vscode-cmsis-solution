/**
 * Copyright 2024-2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import 'jest';
import { cancellationTokenFactory } from '../../vscode-api/with-progress-provider.factories';
import { MockProcessManager, processManagerFactory } from '../../vscode-api/runner/process-manager.factories';
import { BuildTaskDefinition } from './build-task-definition';
import { BuildRunner, cbuildArgsFromTaskDefinition } from './build-runner';
import { HandleBuildEnoent } from './handle-enoent';
import { CmsisToolboxManager, CmsisToolboxManagerImpl } from '../../solutions/cmsis-toolbox';
import path from 'path';
import { csolutionServiceFactory } from '../../json-rpc/csolution-rpc-client.factory';

jest.mock('which', () => jest.fn((cmd) => Promise.resolve(path.join('path', 'to', cmd))));

describe('BuildRunner', () => {
    let mockProcessManager: MockProcessManager;
    let mockHandleBuildEnoent: jest.MockedFunction<HandleBuildEnoent>;
    let cmsisToolboxManager: CmsisToolboxManager;
    let mockCsolutionService: jest.Mocked<ReturnType<typeof csolutionServiceFactory>>;

    beforeEach(() => {
        mockProcessManager = processManagerFactory();
        mockHandleBuildEnoent = jest.fn();
        mockCsolutionService = csolutionServiceFactory();
        mockCsolutionService.getCsolutionBin.mockReturnValue('path/to/csolution');

        cmsisToolboxManager = new CmsisToolboxManagerImpl(
            mockProcessManager,
            mockHandleBuildEnoent,
            mockCsolutionService,
        );
    });

    describe('cbuildArgsFromTaskDefinition', () => {
        it('creates arguments from a simple task definition', () => {
            const buildTaskDefinition: BuildTaskDefinition = {
                type: 'some-task',
                solution: 'some-solution',
            };

            expect(cbuildArgsFromTaskDefinition(buildTaskDefinition)).toEqual([
                'some-solution',
                '--active', '',
                '--schema',
                '--skip-convert',
            ]);
        });

        it('creates arguments from a complex build task definition', () => {
            const buildTaskDefinition: BuildTaskDefinition = {
                type: 'some-task',
                solution: 'some-solution',
                clean: true,
                debug: true,
                intermediateDirectory: 'some-int-dir',
                outputDirectory: 'some-output-dir',
                cmakeTarget: 'cmake-target',
                generator: 'some-generator',
                rebuild: true,
                updateRte: true,
                toolchain: 'GCC',
                jobs: 5,
                downloadPacks: false,
                schemaCheck: true,
                active: 'some-active@set',
            };

            expect(cbuildArgsFromTaskDefinition(buildTaskDefinition)).toEqual([
                'some-solution',
                '--clean',
                '--debug',
                '--generator', 'some-generator',
                '--intdir', 'some-int-dir',
                '--outdir', 'some-output-dir',
                '--target', 'cmake-target',
                '--rebuild',
                '--update-rte',
                '--schema',
                '--toolchain', 'GCC',
                '--jobs', '5',
            ]);
        });

        it('uses active target set if requested', async () => {
            const buildTaskDefinition: BuildTaskDefinition = {
                type: 'some-task',
                solution: 'some-solution',
                active: 'some-active@set',
            };

            expect(cbuildArgsFromTaskDefinition(buildTaskDefinition)).toEqual([
                'some-solution',
                '--active', 'some-active@set',
                '--schema', '--skip-convert']);
        });

        it('does not include the --packs option if explicitly disabled in the task definition', async () => {
            const buildTaskDefinition: BuildTaskDefinition = {
                type: 'some-task',
                solution: 'some-solution',
                downloadPacks: false,
            };

            expect(cbuildArgsFromTaskDefinition(buildTaskDefinition)).toEqual([
                'some-solution',
                '--active', '',
                '--schema', '--skip-convert']);
        });

        it('does not include the --schema option if explicitly disabled in the task definition', async () => {
            const buildTaskDefinition: BuildTaskDefinition = {
                type: 'some-task',
                solution: 'some-solution',
                schemaCheck: false,
            };

            expect(cbuildArgsFromTaskDefinition(buildTaskDefinition)).toEqual([
                'some-solution',
                '--active', '', '--skip-convert'
            ]);
        });

        it('does not include the --update-rte option if explicitly disabled in the task definition', async () => {
            const buildTaskDefinition: BuildTaskDefinition = {
                type: 'some-task',
                solution: 'some-solution',
                updateRte: false,
            };

            expect(cbuildArgsFromTaskDefinition(buildTaskDefinition)).toEqual([
                'some-solution',
                '--active', '',
                '--schema', '--skip-convert']);
        });
    });

    describe('run', () => {
        it('spawns a process with the params from the given build task definition', async () => {
            const buildTaskDefinition: BuildTaskDefinition = {
                type: 'some-task',
                solution: 'some-solution',
            };
            const desktopBuildRunner = new BuildRunner(cmsisToolboxManager);

            await desktopBuildRunner.run(buildTaskDefinition, jest.fn(), cancellationTokenFactory().token);

            expect(mockProcessManager.spawn).toHaveBeenCalledWith(
                path.join('path', 'to', 'cbuild'),
                cbuildArgsFromTaskDefinition(buildTaskDefinition),
                expect.any(Object),
                expect.any(Function),
                expect.anything(),
                undefined
            );
        });

        it('writes the command and arguments to the terminal', async () => {
            const onOutput = jest.fn();
            const buildTaskDefinition: BuildTaskDefinition = { type: 'some-task', solution: 'some-solution' };
            const desktopBuildRunner = new BuildRunner(cmsisToolboxManager);

            await desktopBuildRunner.run(buildTaskDefinition, onOutput, cancellationTokenFactory().token);

            expect(onOutput.mock.calls[0][0]).toContain('Completed: cbuild');
        });

        it('sets the process env, including CMSIS env vars', async () => {
            const buildTaskDefinition: BuildTaskDefinition = {
                type: 'some-task',
                solution: 'some-solution',
            };
            const desktopBuildRunner = new BuildRunner(cmsisToolboxManager);

            await desktopBuildRunner.run(buildTaskDefinition, jest.fn(), cancellationTokenFactory().token);

            expect(mockProcessManager.spawn).toHaveBeenCalledWith(expect.anything(), expect.anything(), { cwd: './', env: expect.anything() }, expect.anything(), expect.anything(), undefined);
        });

        it('returns the error if there was a non-ENOENT error spawning the process and does not call handleBuildEnoent', async () => {
            const handleBuildEnoent: jest.MockedFunction<HandleBuildEnoent> = jest.fn();
            mockProcessManager.spawn.mockRejectedValue(new Error('it broke'));
            const buildTaskDefinition: BuildTaskDefinition = {
                type: 'some-task',
                solution: 'some-solution',
            };
            const desktopBuildRunner = new BuildRunner(cmsisToolboxManager);

            const logSpy = jest.spyOn(console, 'log');
            await desktopBuildRunner.run(buildTaskDefinition, jest.fn(), cancellationTokenFactory().token);
            expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('it broke'));

            expect(handleBuildEnoent).not.toHaveBeenCalled();
        });

        it('returns the error if there was a ENOENT error spawning the process and calls handleBuildEnoent', async () => {
            const enoent: NodeJS.ErrnoException = new Error('Error: ENOENT');
            enoent.code = 'ENOENT';

            mockProcessManager.spawn.mockRejectedValue(enoent);
            const buildTaskDefinition: BuildTaskDefinition = {
                type: 'some-task',
                solution: 'some-solution',
            };
            const desktopBuildRunner = new BuildRunner(cmsisToolboxManager);

            const logSpy = jest.spyOn(console, 'log');
            await desktopBuildRunner.run(buildTaskDefinition, jest.fn(), cancellationTokenFactory().token);
            expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Error: ENOENT'));
        });

        it('forwards output to the onOutput event', async () => {
            const listener = jest.fn();
            const desktopBuildRunner = new BuildRunner(cmsisToolboxManager);

            const expectedLine = 'Some output';
            mockProcessManager.mockOutputLines([expectedLine]);

            const buildTaskDefinition: BuildTaskDefinition = {
                type: 'some-task',
                solution: 'some-solution',
            };
            await desktopBuildRunner.run(buildTaskDefinition, listener, cancellationTokenFactory().token);

            expect(listener).toHaveBeenCalledWith(expectedLine);
        });

        it('cancels the process when the cancellation token is cancelled', async () => {
            const desktopBuildRunner = new BuildRunner(cmsisToolboxManager);
            const buildTaskDefinition: BuildTaskDefinition = {
                type: 'some-task',
                solution: 'some-solution',
            };

            const tokenSource = cancellationTokenFactory();

            await desktopBuildRunner.run(buildTaskDefinition, jest.fn(), tokenSource.token);

            expect(mockProcessManager.spawn).toHaveBeenCalledWith(expect.anything(), expect.anything(), expect.anything(), expect.any(Function), tokenSource.token, undefined);
        });
    });
});
