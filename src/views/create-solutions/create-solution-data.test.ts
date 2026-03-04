/**
 * Copyright 2025-2026 Arm Limited
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

import '../../generic/map';

import { ExtensionContext } from 'vscode';
import { CreateSolutionData } from './create-solution-data';
import { WebviewManager } from '../webview-manager';
import * as Messages from './messages';
import { dataManagerFactory, generateDraftProjectData } from '../../data-manager/data-manager.factories';
import path from 'path';

import * as vscode from 'vscode';
import { DraftProjectData } from '../../data-manager/draft-project-data';
import { DataSet } from '../../data-manager/dataset';
import { PackId } from '../../data-manager/pack-data';

const EXTENSION_URI = vscode.Uri.file(path.join(__dirname, '..', '..', '..'));

class CreateSolutionDataTestable extends CreateSolutionData {
    public listedDraftProjects(draftProjects: DataSet<DraftProjectData>, fromAllPackVersions: boolean) : DraftProjectData[] {
        return super.listedDraftProjects(draftProjects, fromAllPackVersions);
    }
}

describe('CreateSolutionData', () => {
    const createTestee = () : [CreateSolutionDataTestable, {
            contextMock: jest.Mocked<ExtensionContext>,
            webviewManagerMock: jest.Mocked<WebviewManager<Messages.IncomingMessage, Messages.OutgoingMessage>>,
            dataManagerMock: ReturnType<typeof dataManagerFactory>,
            readFileMock: jest.Spied<typeof vscode.workspace.fs.readFile>
        }] => {
        const contextMock = {
            extensionUri: EXTENSION_URI,
        } as jest.Mocked<ExtensionContext>;
        const webviewManagerMock = {
            asWebviewUri: jest.fn().mockImplementation((uri: vscode.Uri) => uri.with({ scheme: 'vscode-resource' }).toString()),
        } as unknown as jest.Mocked<WebviewManager<Messages.IncomingMessage, Messages.OutgoingMessage>>;
        const dataManagerMock = dataManagerFactory();
        const testee = new CreateSolutionDataTestable(
            contextMock,
            webviewManagerMock,
            dataManagerMock,
        );
        const readFileMock = jest.spyOn(vscode.workspace.fs, 'readFile').mockResolvedValue(Buffer.from('test-image-data'));
        return [testee, { contextMock, webviewManagerMock, dataManagerMock, readFileMock }];
    };

    describe('getImage', () => {
        test('should return placeholder image', async () => {
            const [testee, ] = createTestee();

            const expectedImage = vscode.Uri.joinPath(EXTENSION_URI, 'media', 'hardware-placeholder-dark.svg').with({ scheme: 'vscode-resource' }).toString();
            const result = await testee.getImage();
            expect(result).toBe(expectedImage);
        });

        test('should return local Unix file path image as base64', async () => {
            const [testee, { readFileMock }] = createTestee();

            const imagePath = '/path/to/image.svg';
            const result = await testee.getImage(imagePath);

            expect(result).toBe('data:image/svg;base64,dGVzdC1pbWFnZS1kYXRh');
            expect(readFileMock).toHaveBeenCalledWith(vscode.Uri.file(imagePath));
        });

        test('should return local file-uri image as base64', async () => {
            const [testee, { readFileMock }] = createTestee();

            const imageUri = 'file://path/to/image.svg';
            const result = await testee.getImage(imageUri);

            expect(result).toBe('data:image/svg;base64,dGVzdC1pbWFnZS1kYXRh');
            expect(readFileMock).toHaveBeenCalledWith(vscode.Uri.parse(imageUri));
        });

        test('should return local Windows file path image as base64', async () => {
            const [testee, { readFileMock }] = createTestee();

            const imagePath = 'C:/path/to/image.svg';
            const result = await testee.getImage(imagePath);

            expect(result).toBe('data:image/svg;base64,dGVzdC1pbWFnZS1kYXRh');
            expect(readFileMock).toHaveBeenCalledWith(vscode.Uri.file(imagePath));
        });

        test('should return remote uri', async () => {
            const [testee, { readFileMock }] = createTestee();

            const imageUrl = 'https://example.com/path/to/image.svg';
            const result = await testee.getImage(imageUrl);

            expect(result).toBe(imageUrl);
            expect(readFileMock).not.toHaveBeenCalled();
        });

    });

    describe('listedDraftProjects', () => {
        test('should list draft projects from all pack versions', () => {
            const [testee, ] = createTestee();

            const draftsV1 = generateDraftProjectData(3, {
                pack: new PackId('VendorA', 'PackX', '1.0.0'),
            });
            const draftsV2 = generateDraftProjectData(2, {
                pack: new PackId('VendorA', 'PackX', '2.0.0'),
            });
            const draftProjects = new DataSet<DraftProjectData>([...draftsV1, ...draftsV2]);

            const listed = testee.listedDraftProjects(draftProjects, true);
            expect(listed).toEqual(expect.arrayContaining([...draftsV1, ...draftsV2]));
        });

        test('should list draft projects from latest pack version only', () => {
            const [testee, ] = createTestee();

            const draftsV1 = generateDraftProjectData(3, {
                pack: new PackId('VendorA', 'PackX', '1.0.0'),
            });
            const draftsV2dev = generateDraftProjectData(2, {
                pack: new PackId('VendorA', 'PackX', '2.0.0-dev3'),
            });
            const draftsV2 = generateDraftProjectData(2, {
                pack: new PackId('VendorA', 'PackX', '2.0.0'),
            });
            const draftProjects = new DataSet<DraftProjectData>([...draftsV1, ...draftsV2, ...draftsV2dev]);

            const listed = testee.listedDraftProjects(draftProjects, false);
            expect(listed).toEqual(expect.arrayContaining([...draftsV2]));
        });
    });

});

