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

import * as fs from 'node:fs';
import * as path from 'node:path';
import { constructor } from './constructor';

/**
 * Provides the file and path operations used by {@link TextFile}.
 * File content is expected to be UTF-8 encoded text.
 */
export interface ITextFileSystem {
    /**
     * Returns whether the specified file exists.
     * @param fileName Path to the file.
     */
    exists(fileName: string): boolean;

    /**
     * Reads the UTF-8 text file, or returns an empty string when it does not exist.
     * @param fileName Path to the file.
     */
    read(fileName: string): string;

    /**
     * Writes UTF-8 text to the file, creating its parent directory when necessary.
     * @param fileName Path to the file.
     * @param content Text content to write.
     */
    write(fileName: string, content: string): void;

    /**
     * Removes the file when it exists.
     * @param fileName Path to the file.
     */
    unlink(fileName: string): void;

    /**
     * Returns the directory portion of a path.
     * @param fileName Path from which to obtain the directory.
     */
    dirname(fileName: string): string;

    /**
     * Resolves path segments into an absolute path.
     * @param pathSegments Path segments to resolve.
     */
    resolve(...pathSegments: string[]): string;
}

class TextFileSystemImpl implements ITextFileSystem {
    public exists(fileName: string): boolean {
        return fs.existsSync(fileName);
    }

    public read(fileName: string): string {
        return fs.existsSync(fileName) ? fs.readFileSync(fileName, 'utf8') : '';
    }

    public write(fileName: string, content: string): void {
        const directory = path.dirname(fileName);
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }
        fs.writeFileSync(fileName, content, 'utf8');
    }

    public unlink(fileName: string): void {
        if (fs.existsSync(fileName)) {
            fs.rmSync(fileName, { force: true });
        }
    }

    public dirname(fileName: string): string {
        return path.dirname(fileName);
    }

    public resolve(...pathSegments: string[]): string {
        return path.resolve(...pathSegments);
    }
}

export const TextFileSystem = constructor<typeof TextFileSystemImpl, ITextFileSystem>(TextFileSystemImpl);
