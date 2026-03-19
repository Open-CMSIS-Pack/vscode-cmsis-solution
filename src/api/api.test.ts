/**
 * Copyright 2024-2026 Arm Limited
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

import { faker } from '@faker-js/faker';
import * as fs from 'node:fs';
import { tmpdir } from 'os';
import path from 'path';
import { Uri, workspace } from 'vscode';
import { CsolutionApiV2, CsolutionExtension } from '../../api/csolution';
import { getTestDataDir, SOLUTIONS_DIR } from '../__test__/test-data';
import { DataManager } from '../data-manager/data-manager';
import { dataSourceFactory, draftProjectDataFactory, MockDataSource } from '../data-manager/data-manager.factories';
import { DraftProjectData, DraftProjectFormat, DraftProjectType } from '../data-manager/draft-project-data';
import { getCreateSolutionFromDataManager } from '../solutions/create-solution-from-data-manager';
import { MdkToCsolutionConverter } from '../solutions/mdk-conversion/convert-mdk-command';
import { SolutionCreatorImp } from '../solutions/solution-creator';
import { SolutionInitialiserImp } from '../solutions/solution-initialiser';
import { BuildTaskProviderImpl } from '../tasks/build/build-task-provider';
import { ConfigureVcpkgForSolution } from '../vcpkg/configure-vcpkg';
import { commandsProvider } from '../vscode-api/commands-provider';
import { globalStateFactory } from '../vscode-api/global-state.factories';
import { messageProviderFactory } from '../vscode-api/message-provider.factories';
import { Runner } from '../vscode-api/runner/runner';
import { workspaceFoldersProvider } from '../vscode-api/workspace-folders-provider';
import { workspaceFsProviderFactory } from '../vscode-api/workspace-fs-provider.factories';
import { CsolutionExtensionImpl } from './csolution-extension';
import { copyFolderRecursive } from '../utils/fs-utils';

describe('Csolution Extension APIv2', () => {

    let mockWorkspaceFsProvider;
    let mockDataSource: MockDataSource;
    let mockRunner: jest.Mocked<Runner>;
    let mockConfigureVcpkgForSolution: jest.Mocked<ConfigureVcpkgForSolution>;
    let mockGlobalState;
    let mockMessageProvider;
    let extension: CsolutionExtension;

    beforeEach(() => {
        mockWorkspaceFsProvider = workspaceFsProviderFactory();
        mockWorkspaceFsProvider.createDirectory.mockImplementation(async (filePath: string) => {
            return new Promise<void>((resolve, reject) => fs.mkdir(filePath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }));
        });

        mockDataSource = dataSourceFactory();
        const dataManager = new DataManager(mockDataSource);

        const createSolutionFromDataManager = getCreateSolutionFromDataManager(
            mockWorkspaceFsProvider,
            {} as MdkToCsolutionConverter,
            workspace.findFiles,
        );

        mockMessageProvider = messageProviderFactory();
        mockConfigureVcpkgForSolution = jest.fn();
        mockGlobalState = globalStateFactory();

        const solutionInitialiserImp = new SolutionInitialiserImp(
            commandsProvider,
            workspaceFoldersProvider,
            mockConfigureVcpkgForSolution,
            mockMessageProvider,
            mockGlobalState,
        );

        const solutionCreator = new SolutionCreatorImp(
            createSolutionFromDataManager,
            solutionInitialiserImp,
            mockWorkspaceFsProvider,
        );

        mockRunner = { run: jest.fn() };

        const buildTaskProvider = new BuildTaskProviderImpl(mockRunner);

        extension = new CsolutionExtensionImpl(
            solutionCreator,
            buildTaskProvider,
            dataManager,
        );
    });

    describe('createNewSolution', () => {

        let tempFolder: string;

        beforeEach(() => {
            tempFolder = path.join(tmpdir(), faker.string.uuid());
            console.log(`Test Workspace: ${tempFolder}`);
        });

        afterEach(() => {
            if (fs.existsSync(tempFolder)) {
                fs.rmSync(tempFolder, { recursive: true, force: true });
            }
        });

        it('Creates solution from simple csolution example', async () => {

            const projectSrc = path.join(getTestDataDir(), SOLUTIONS_DIR, 'simple');
            const mockCopyTo = jest.fn().mockImplementation((dest: string) => {
                copyFolderRecursive(projectSrc, dest);
            });

            (workspace.findFiles as jest.Mock).mockResolvedValue([
                Uri.file(path.join(tempFolder, 'test.csolution.yml'))
            ]);

            const draftOptions: Partial<DraftProjectData> = {
                format: DraftProjectFormat.Csolution,
                draftType: DraftProjectType.Example,
                copyTo: mockCopyTo,
            };
            const draft = draftProjectDataFactory(draftOptions) as CsolutionApiV2.DraftProjectData;

            const api = extension.getApi(2);

            await api.createNewSolution({
                draft: draft,
                folder: tempFolder,
            });

            const expected: string[] = [];
            for await (const item of fs.opendirSync(projectSrc)) {
                expected.push(item.name);
            }

            const got: string[] = [];
            for await (const item of fs.opendirSync(tempFolder)) {
                got.push(item.name);
            }

            expect(mockCopyTo).toHaveBeenCalledWith(expect.lowercaseEquals(tempFolder));
            expect(got).toEqual(expect.arrayContaining(expected));
        });

    });

});
