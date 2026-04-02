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

import 'jest';
import * as path from 'path';
import { URI } from 'vscode-uri';
import {
    backToForwardSlashes,
    expandRootVars,
    getCmsisCompilerRoot,
    getCmsisPackRoot,
    getCmsisToolboxRoot,
    getFileNameFromPath,
    getFileNameNoExt,
    pathIsAncestor,
    pathsEqual,
} from './path-utils';
import { CMSIS_TOOLBOX_FOLDER } from '../manifest';

describe('path-utils', () => {

    describe('pathsEqual', () => {
        it('returns true if the inputs are identical', () => {
            const output = pathsEqual(__dirname, __dirname);
            expect(output).toBe(true);
        });

        it('returns true if the inputs resolve to the same path', () => {
            // E.g. /path/to/src/../src
            const input = `${__dirname}${path.sep}..${path.sep}${getFileNameFromPath(__dirname)}`;
            const output = pathsEqual(__dirname, input);
            expect(output).toBe(true);
        });

        it('returns true if one input is the URI.fsPath of the other', () => {
            // On Windows, the drive letter will be capitalised on Windows for the first but not the second input
            const output = pathsEqual(__dirname, URI.file(__dirname).fsPath);
            expect(output).toBe(true);
        });

        it('returns false if the inputs do not resolve to the same path', () => {
            const output = pathsEqual(__dirname, path.resolve(__dirname, '..'));
            expect(output).toBe(false);
        });

        it('checks if paths are equal for common cases', () => {
            expect(pathsEqual('/path/to/name.cproject.yml', '/path/to/name.cproject.yml')).toBeTruthy();
            expect(pathsEqual('/path/to/name.cproject.yml', '/path/other/name.cproject.yml')).toBeFalsy();
            if (process.platform === 'win32') {
                expect(pathsEqual('C:/path/to/name.cproject.yml', 'c:\\path\\to\\name.cproject.yml')).toBeTruthy();
            }
            expect(pathsEqual(undefined, undefined)).toBeTruthy();
            expect(pathsEqual('/path/to/name.cproject.yml', undefined)).toBeFalsy();
            expect(pathsEqual(undefined, '/path/to/name.cproject.yml')).toBeFalsy();
        });
    });

    describe('pathIsAncestor', () => {
        it('returns false if the inputs are equal', () => {
            const output = pathIsAncestor(__dirname, __dirname);
            expect(output).toBe(false);
        });

        it('returns true if the first input is the containing directory of the second', () => {
            const output = pathIsAncestor(__dirname, path.join(__dirname, 'input'));
            expect(output).toBe(true);
        });

        it('returns true if the first input is the URI.fsPath of the parent of the second', () => {
            // On Windows, the drive letter will be capitalised on Windows for the first but not the second input
            const output = pathIsAncestor(URI.file(__dirname).fsPath, path.join(__dirname, 'input'));
            expect(output).toBe(true);
        });

        it('returns true if the first input is the third ancestor directory of the second', () => {
            const output = pathIsAncestor(__dirname, path.join(__dirname, 'd1', 'd2', 'd3'));
            expect(output).toBe(true);
        });

        it('returns false if the two inputs are in non-overlapping parts of the file tree', () => {
            const output = pathIsAncestor(path.join(__dirname, 'a'), path.join(__dirname, 'b1', 'b2'));
            expect(output).toBe(false);
        });

        it('returns false if the second input is an ancestor of the first', () => {
            const output = pathIsAncestor(path.join(__dirname, 'input'), __dirname);
            expect(output).toBe(false);
        });
    });

    describe('getCmsisPackRoot', () => {
        const environmentPath = path.join(__dirname, 'environmentCmsis');

        it('uses the CMSIS_PACK_ROOT environment variable', () => {
            const output = getCmsisPackRoot({ CMSIS_PACK_ROOT: environmentPath });
            expect(output).toBe(environmentPath);
        });

        it('falls back to the OS default location otherwise', () => {
            const output = getCmsisPackRoot({});
            expect(output.includes(`arm${path.sep}packs`)).toBeTruthy();
        });
    });

    describe('getCmsisToolboxRoot', () => {
        it('uses the CMSIS_SOLUTION_TOOLBOX environment variable', () => {
            const environmentPath = path.join(__dirname, 'environmentToolbox');
            const output = getCmsisToolboxRoot({ CMSIS_SOLUTION_TOOLBOX: environmentPath });
            expect(output).toBe(environmentPath);
        });

        it('falls back to the fixed default location otherwise', () => {
            const output = getCmsisToolboxRoot({});
            expect(output).toBe(CMSIS_TOOLBOX_FOLDER);
        });
    });

    describe('getCmsisCompilerRoot', () => {
        it('uses the CMSIS_COMPILER_ROOT environment variable', () => {
            const environmentPath = path.join(__dirname, 'environmentCompiler');
            const output = getCmsisCompilerRoot({ CMSIS_COMPILER_ROOT: environmentPath });
            expect(output).toBe(environmentPath);
        });

        it('falls back to toolbox etc path otherwise', () => {
            const toolboxPath = path.join(__dirname, 'toolboxRoot');
            const output = getCmsisCompilerRoot({ CMSIS_SOLUTION_TOOLBOX: toolboxPath });
            expect(output).toBe(path.join(toolboxPath, 'etc'));
        });
    });

    describe('expandRootVars', () => {
        it('expands pack root and compiler root placeholders', () => {
            const env = {
                CMSIS_PACK_ROOT: '/my/packs',
                CMSIS_COMPILER_ROOT: '/my/compiler',
            };
            const input = '${CMSIS_PACK_ROOT}/one;${CMSIS_COMPILER_ROOT}/two';
            const output = expandRootVars(input, env);
            expect(output).toBe('/my/packs/one;/my/compiler/two');
        });

        it('leaves strings unchanged when placeholders are not present', () => {
            const output = expandRootVars('/plain/path', {});
            expect(output).toBe('/plain/path');
        });
    });

    describe('name and slash helpers', () => {
        it('checks if backslashes get converted', () => {
            expect(backToForwardSlashes('\\path\\with\\slashes\\')).toEqual('/path/with/slashes/');
            expect(backToForwardSlashes('\\path/with\\slashes\\')).toEqual('/path/with/slashes/');
        });

        it('gets file base name with no extension', () => {
            expect(getFileNameNoExt('/path/to/name.cproject.yml')).toBe('name');
            expect(getFileNameNoExt('/path/to/name.cproject.yaml')).toBe('name');
            expect(getFileNameNoExt('/path/to/name.cproject.YML')).toBe('name');
            expect(getFileNameNoExt('/path/to/name.CPROJECT.YAML')).toBe('name');
            expect(getFileNameNoExt('/path/to/My.Project.cproject.yml')).toBe('My.Project');
            expect(getFileNameNoExt('/path/to/MySolution.csolution.yml')).toBe('MySolution');
            expect(getFileNameNoExt('/path/to/MyFile.foo')).toBe('MyFile');
        });

        it('gets filename from path', () => {
            expect(getFileNameFromPath('/path/to/name.cproject.yml')).toBe('name.cproject.yml');
            expect(getFileNameFromPath('/path/to/name.yaml')).toBe('name.yaml');
        });
    });
});
