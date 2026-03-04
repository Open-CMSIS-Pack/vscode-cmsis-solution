/**
 * Copyright 2022-2026 Arm Limited
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

import { ExtensionContext } from 'vscode';
import { commandsProviderFactory, MockCommandsProvider } from '../vscode-api/commands-provider.factories';
import { BinaryFileLocator } from './binary-file-locator';
import { MockSolutionManager, solutionManagerFactory } from './solution-manager.factories';
import { CSolution } from './csolution';
import { ETextFileResult } from '../generic/text-file';
import path from 'node:path';

class BinaryFileLocatorTest extends BinaryFileLocator {
    public async buildBinaryFiles()  {
        return super.buildBinaryFiles();
    }
}

describe('BinaryFileLocator', () => {
    let solutionManager: MockSolutionManager;
    let commandsProvider: MockCommandsProvider;
    let binaryFileLocator: BinaryFileLocatorTest;

    beforeEach(async () => {
        solutionManager = solutionManagerFactory();
        commandsProvider = commandsProviderFactory();
        binaryFileLocator = new BinaryFileLocatorTest(
            solutionManager,
            commandsProvider,
        );

        await binaryFileLocator.activate({ subscriptions: [] } as unknown as ExtensionContext);
    });

    it('registers the commands on activation', () => {
        expect(commandsProvider.registerCommand).toHaveBeenCalledWith(BinaryFileLocator.getBinaryFileCommandType, binaryFileLocator.handleBinaryFileLocator, binaryFileLocator);
        expect(commandsProvider.registerCommand).toHaveBeenCalledWith(BinaryFileLocator.getBinaryFilesCommandType, binaryFileLocator.handleBinaryFilesLocator, binaryFileLocator);
    });

    describe('buildBinaryFiles', () => {
        it('returns the list of binary files from the cbuild-run.yml', async () => {
            const solutionFolder = path.join('path', 'to');
            const project1File = path.join('build', 'Debug', 'project1.axf');
            const project2File = path.join('build', 'Debug', 'project2.axf');

            const csolutionMock = {
                cbuildRunYml: {
                    load: jest.fn().mockResolvedValue(ETextFileResult.Success),
                    getSolution: jest.fn().mockReturnValue(path.join(solutionFolder, 'solution.csolution.yml')),
                    getImages: jest.fn().mockReturnValue([
                        { file: path.join(solutionFolder, project1File) },
                        { file: path.join(solutionFolder, project2File) },
                    ]),
                },
            } as unknown as CSolution;
            solutionManager.getCsolution.mockReturnValue(csolutionMock);

            const binaryFiles = await binaryFileLocator.buildBinaryFiles();
            expect(binaryFiles).toEqual([
                project1File,
                project2File,
            ]);
        });

        it('returns an empty list if cbuild-run.yml fails to load', async () => {
            const csolutionMock = {
                cbuildRunYml: {
                    load: jest.fn().mockResolvedValue(ETextFileResult.Error),
                    getSolution: jest.fn(),
                    getImages: jest.fn(),
                },
            } as unknown as CSolution;
            solutionManager.getCsolution.mockReturnValue(csolutionMock);

            const binaryFiles = await binaryFileLocator.buildBinaryFiles();
            expect(binaryFiles).toEqual([]);
        });

        it('returns an empty list if no csolution is loaded', async () => {
            solutionManager.getCsolution.mockReturnValue(undefined);

            const binaryFiles = await binaryFileLocator.buildBinaryFiles();
            expect(binaryFiles).toEqual([]);
        });
    });


    describe('handleBinaryFileLocator', () => {
        it('returns the first binary file when multiple are present', async () => {
            const mockBinaryFiles = ['file1.axf', 'file2.axf', 'file3.axf'];
            jest.spyOn(binaryFileLocator, 'buildBinaryFiles').mockResolvedValue(mockBinaryFiles);

            const result = await binaryFileLocator.handleBinaryFileLocator();
            expect(result).toBe('file1.axf');
        });

        it('returns an empty string when no binary files are found', async () => {
            jest.spyOn(binaryFileLocator, 'buildBinaryFiles').mockResolvedValue([]);

            const result = await binaryFileLocator.handleBinaryFileLocator();
            expect(result).toBe('');
        });
    });

    describe('handleBinaryFilesLocator', () => {
        it('returns the list of binary files when multiple are present', async () => {
            const mockBinaryFiles = ['file1.axf', 'file2.axf', 'file3.axf'];
            jest.spyOn(binaryFileLocator, 'buildBinaryFiles').mockResolvedValue(mockBinaryFiles);

            const result = await binaryFileLocator.handleBinaryFilesLocator();
            expect(result).toBe('["file1.axf","file2.axf","file3.axf"]');
        });

        it('returns an empty string json array when no binary files are found', async () => {
            jest.spyOn(binaryFileLocator, 'buildBinaryFiles').mockResolvedValue([]);

            const result = await binaryFileLocator.handleBinaryFilesLocator();
            expect(result).toBe('[]');
        });
    });
});
