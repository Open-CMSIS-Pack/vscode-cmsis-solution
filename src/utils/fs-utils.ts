/**
 * Copyright 2025-2026 Arm Limited
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
import * as path from 'path';

export function removeReadOnly(dest: string) {
    if (!fs.existsSync(dest)) {
        throw new Error(`Could not find file for RO removal ${dest}`);
    }

    const stat = fs.statSync(dest);
    if (!stat) {
        throw new Error(`Could not read file stats for RO removal ${dest}`);
    }

    const newMode = stat.mode |
        fs.constants.S_IWUSR |
        fs.constants.S_IWGRP |
        fs.constants.S_IWOTH;

    if (stat.mode === newMode) {
        return;
    }

    fs.chmodSync(dest, newMode);
}

export function copyFolderRecursive(src: string, dest: string) {
    if (!fs.existsSync(src)) {
        throw new Error(`Could not find folder to copy ${src}`);
    }

    if (fs.statSync(src)?.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        removeReadOnly(dest);
        fs.readdirSync(src).forEach((item) => {
            copyFolderRecursive(path.join(src, item), path.join(dest, item));
        });
    } else {
        fs.copyFileSync(src, dest);
        removeReadOnly(dest);
    }
}

export function writeTextFile(filePath?: string, data?: string) {
    if (!filePath) {
        return;
    }
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, data ?? '', 'utf8');
}

export function readTextFile(filePath?: string) {
    if (filePath && fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
    }
    return '';
}

export function lineOf(fileContent: string, searchText: string): number {
    const index = fileContent.indexOf(searchText);
    if (index >= 0) {
        const before = fileContent.slice(0, index);
        return (before.match(/\r?\n/g)?.length ?? 0);
    }
    return 0;
}

export function fileExists(filePath?: string): filePath is string {
    return filePath ? fs.existsSync(filePath) : false;
}

export function deleteFileIfExists(filePath?: string) {
    if (fileExists(filePath)) {
        fs.rmSync(filePath, { force: true });
    }
}

export function getFileModificationTime(filePath: string): number {
    if (fileExists(filePath)) {
        const stat = fs.statSync(filePath);
        return stat.mtimeMs;
    }
    return 0;
}
