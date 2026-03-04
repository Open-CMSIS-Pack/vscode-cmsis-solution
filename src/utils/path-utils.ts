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

import * as path from 'path';
import * as os from 'os';
import { stripTwoExtensions } from './string-utils';
import { CMSIS_TOOLBOX_FOLDER } from '../manifest';

/**
 * Check if two paths are equal. This should work on all platforms, e.g. on Windows it will compare case insensitively.
 */
export function pathsEqual(p1?: string, p2?: string): boolean {
    if (p1 === p2) {
        return true;
    }
    if (!p1 || !p2) {
        return false;
    }
    return path.relative(p1, p2) === '';
}

/**
 * Check the first path is an ancestor of the second.
 * This should work on all platforms, e.g. on Windows it will compare case insensitively.
 */
export const pathIsAncestor = (maybeAncestor: string, inputPath: string) => {
    const relative = path.relative(maybeAncestor, inputPath);
    return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
};

export const getCmsisPackRoot = (environment = process.env): string => {
    const environmentValue = environment['CMSIS_PACK_ROOT'];
    if (environmentValue) {
        return environmentValue;
    }

    // Default to standard cache location
    return os.platform() === 'win32'
        ? path.join(environment['LOCALAPPDATA'] ?? os.homedir(), 'arm', 'packs')
        : path.join(os.homedir(), '.cache', 'arm', 'packs');
};

export const getCmsisToolboxRoot = (environment = process.env): string => {
    const environmentValue = environment['CMSIS_SOLUTION_TOOLBOX'];
    if (environmentValue) {
        return environmentValue;
    }

    // Default to standard fixed location
    return CMSIS_TOOLBOX_FOLDER;
};

export function backToForwardSlashes(str: string): string {
    return str.replaceAll('\\', '/');
}

/**
 * Extract the filename from a file path.
 * @param filePath file to extract from
 * @returns filename with  extensions
 */

export function getFileNameFromPath(filePath?: string): string {
    if (!filePath) {
        return '';
    }
    return path.basename(filePath);
}

/**
 * Extracts name without extension from filename
 * @param filePath file to extract from
 * @returns filename without extensions
 * @example
 * getFileNameNoExt('/path/to/project.cproject.yml') // returns 'project'
 * getFileNameNoExt('C:\\projects\\app.clayer.yml') // returns 'app'
 * getFileNameNoExt('/home/user/config.csolution.yml') // returns 'config'
 * getFileNameNoExt('simple.txt') // returns 'simple'
 */
export function getFileNameNoExt(filePath?: string): string {
    return stripTwoExtensions(getFileNameFromPath(filePath));
}
