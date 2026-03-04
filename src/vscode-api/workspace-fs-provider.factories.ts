/**
 * Copyright 2023-2026 Arm Limited
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
import { WorkspaceFsProvider } from './workspace-fs-provider';
import path from 'path';

export type MockWorkspaceFsProvider = jest.Mocked<WorkspaceFsProvider>;

export const workspaceFsProviderFactory = (): MockWorkspaceFsProvider => ({
    readDirectory: jest.fn().mockResolvedValue([]),
    createDirectory: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    delete: jest.fn(),
    readUtf8File: jest.fn(),
    writeUtf8File: jest.fn(),
    rename: jest.fn(),
    copy: jest.fn(),
    exists: jest.fn().mockResolvedValue(false),
});

export type Files = {
    relativePath: string,
    content: string,
}[]

export const populatedWorkspaceFsProviderFactory = (rootDir: string, files: Files): WorkspaceFsProvider => {
    const mock = workspaceFsProviderFactory();

    const fileContentsByAbsolutePath: Record<string, string> = {};
    for (const file of files) {
        const absolutePath = path.join(rootDir, file.relativePath);
        fileContentsByAbsolutePath[absolutePath] = file.content;
    }
    mock.readUtf8File.mockImplementation((absoluteFilePath: string) => {
        const requestedContents = fileContentsByAbsolutePath[absoluteFilePath];
        if (requestedContents) {
            return Promise.resolve(requestedContents);
        }
        return Promise.reject(`file not found on mocked fs: ${absoluteFilePath}`);
    });
    mock.readFile.mockImplementation((absoluteFilePath: string) => {
        const requestedContents = fileContentsByAbsolutePath[absoluteFilePath];
        if (requestedContents) {
            return Promise.resolve(Buffer.from(requestedContents));
        }
        return Promise.reject(`file not found on mocked fs: ${absoluteFilePath}`);
    });

    mock.readDirectory.mockResolvedValue(files.map(file => [file.relativePath, 'file']));

    return mock;
};
