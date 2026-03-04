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

import { workspace, Uri, FileType as FileTypeEnum } from 'vscode';
import { TextDecoder, TextEncoder } from 'util';

export type FileType = 'unknown' | 'file' | 'directory' | 'symbolicLink';

const fileTypeEnumToFileType = (fileTypeEnum: FileTypeEnum): FileType => {
    switch (fileTypeEnum) {
        case FileTypeEnum.Unknown: return 'unknown';
        case FileTypeEnum.SymbolicLink: return 'symbolicLink';
        case FileTypeEnum.File: return 'file';
        case FileTypeEnum.Directory: return 'directory';
    }
};

export type WorkspaceFsProvider = {
    readDirectory: (filePath: string) => Promise<[string, FileType][]>;
    createDirectory: (filePath: string) => Promise<void>;
    readFile: (filePath: string) => Promise<Uint8Array>;
    writeFile: (filePath: string, content: Uint8Array) => Promise<void>;
    delete: (filePath: string, recursive?: boolean, useTrash?: boolean) => Promise<void>;
    readUtf8File: (filePath: string) => Promise<string>;
    writeUtf8File: (filePath: string, content: string) => Promise<void>;
    rename: (sourcePath: string, destinationPath: string, overwrite?: boolean) => Promise<void>;
    copy: (sourcePath: string, destinationPath: string, overwrite?: boolean) => Promise<void>;
    exists: (filePath: string) => Promise<boolean>;
}

export const workspaceFsProvider: WorkspaceFsProvider = {
    exists: async (filePath: string) => {
        try {
            await workspace.fs.stat(Uri.file(filePath));
            return true;
        } catch {
            return false;
        }
    },
    readDirectory: async (filePath: string) => {
        const directoryEntries = await workspace.fs.readDirectory(Uri.file(filePath));
        return directoryEntries.map(([fileName, fileTypeEnum]) => [fileName, fileTypeEnumToFileType(fileTypeEnum)]);
    },
    copy: async (sourcePath: string, destinationPath: string, overwrite?: boolean) => {
        await workspace.fs.copy(Uri.file(sourcePath), Uri.file(destinationPath), { overwrite });
    },
    rename: async (sourcePath: string, destinationPath: string, overwrite?: boolean) => {
        await workspace.fs.rename(Uri.file(sourcePath), Uri.file(destinationPath), { overwrite });
    },
    createDirectory: async (filePath: string) => {
        return workspace.fs.createDirectory(Uri.file(filePath));
    },
    readFile: async (filePath: string) => {
        return workspace.fs.readFile(Uri.file(filePath));
    },
    writeFile: async (filePath: string, content: Uint8Array) => {
        return workspace.fs.writeFile(Uri.file(filePath), content);
    },
    delete: async (filePath: string, recursive?: boolean, useTrash?: boolean) => {
        return workspace.fs.delete(Uri.file(filePath), { recursive, useTrash });
    },
    readUtf8File: async (filePath: string) => {
        const binaryContent = await workspace.fs.readFile(Uri.file(filePath));
        return new TextDecoder().decode(binaryContent);
    },
    writeUtf8File: async (filePath, content) => {
        const binaryContent = new TextEncoder().encode(content);
        return workspace.fs.writeFile(Uri.file(filePath), binaryContent);
    },
};
