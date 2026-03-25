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

import 'jest';
import * as path from 'path';
import { URI } from 'vscode-uri';
import { isWebAddress } from './util';
import { getFileNameFromPath } from './utils/path-utils';
import { ITreeItem, CTreeItem } from './generic/tree-item';
import { matchesStringOrRegExp, arrayContainsValue, matchesContext } from './utils/context-utils';
import { pathsEqual, pathIsAncestor, getCmsisPackRoot, getFileNameNoExt, backToForwardSlashes } from './utils/path-utils';

describe('Util', () => {

    describe('is web address', () => {
        it('returns true if string represents webAddress', () => {
            expect(isWebAddress('https://www.arm.com')).toBe(true);
            expect(isWebAddress('https://www.arm.com')).toBe(true);
            expect(isWebAddress('https://www.arm.com#anchor')).toBe(true);
            expect(isWebAddress('www.arm.com')).toBe(true);
            expect(isWebAddress('ftp://www.arm.com')).toBe(false);
            expect(isWebAddress('MyFile.ext')).toBe(false);
            expect(isWebAddress('/tnp/MyTmpFile')).toBe(false);
        });
    });

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

    describe('getPackCachePath', () => {
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

    describe('project paths', () => {

        it('checks if backslashes get converted', () => {
            expect(backToForwardSlashes('\\path\\with\\slashes\\')).toEqual('/path/with/slashes/');
            expect(backToForwardSlashes('\\path/with\\slashes\\')).toEqual('/path/with/slashes/');
        });

        it('get file base name no ext', () => {
            expect(getFileNameNoExt('/path/to/name.cproject.yml')).toBe('name');
            expect(getFileNameNoExt('/path/to/name.cproject.yaml')).toBe('name');
            expect(getFileNameNoExt('/path/to/name.cproject.YML')).toBe('name');
            expect(getFileNameNoExt('/path/to/name.CPROJECT.YAML')).toBe('name');
            expect(getFileNameNoExt('/path/to/My.Project.cproject.yml')).toBe('My.Project');
            expect(getFileNameNoExt('/path/to/MySolution.csolution.yml')).toBe('MySolution');
            expect(getFileNameNoExt('/path/to/MyFile.foo')).toBe('MyFile');
        });

        it('get filename from path ', () => {
            expect(getFileNameFromPath('/path/to/name.cproject.yml')).toBe('name.cproject.yml');
            expect(getFileNameFromPath('/path/to/name.yaml')).toBe('name.yaml');
        });

        it('checks if paths are equal', () => {
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

    describe('matchesStringOrRegExp', () => {
        it('should match exact string', () => {
            expect(matchesStringOrRegExp('abc', 'abc')).toBe(true);
            expect(matchesStringOrRegExp('abc', 'def')).toBe(false);
        });

        it('should match regex pattern (pattern starts with \\)', () => {
            expect(matchesStringOrRegExp('abc123', '\\^abc')).toBe(true);
            expect(matchesStringOrRegExp('123abc', '\\abc$')).toBe(true);
            expect(matchesStringOrRegExp('xyz', '\\^abc')).toBe(false);
        });

        it('should return false for invalid regex', () => {
            expect(matchesStringOrRegExp('abc', '\\[')).toBe(false);
        });

        it('should return false if pattern is undefined', () => {
            expect(matchesStringOrRegExp('abc', undefined)).toBe(false);
        });

        it('should match full CMSIS context pattern (Hello.Debug+CS300)', () => {
            expect(matchesStringOrRegExp('Hello.Debug+CS300', 'Hello.Debug+CS300')).toBe(true);
            expect(matchesStringOrRegExp('MyProject.Debug+CS300', 'Hello.Debug+CS300')).toBe(false);
        });
    });

    describe('arrayContainsValue', () => {
        it('should return true if array contains exact value', () => {
            expect(arrayContainsValue('foo', ['foo', 'bar'])).toBe(true);
        });

        it('should return true if array contains matching regex', () => {
            expect(arrayContainsValue('abc123', ['\\^abc', 'xyz'])).toBe(true);
        });

        it('should return false if array does not contain value', () => {
            expect(arrayContainsValue('baz', ['foo', 'bar'])).toBe(false);
        });

        it('should return false if array is undefined or value is undefined', () => {
            expect(arrayContainsValue('foo', undefined)).toBe(false);
            expect(arrayContainsValue(undefined, ['foo'])).toBe(false);
        });
    });

    describe('matchesContext', () => {

        const mockItem = (forContext?: string[], notForContext?: string[]): ITreeItem<CTreeItem> => ({
            getValuesAsArray: (key: string) => {
                if (key === 'for-context' && forContext) {
                    return forContext;
                }
                if (key === 'not-for-context' && notForContext) {
                    return notForContext;
                }
                return [];
            },
        } as CTreeItem);

        it('should return false if item is undefined', () => {
            expect(matchesContext(undefined, 'ctx')).toBe(false);
        });

        it('should return true if context is undefined', () => {
            expect(matchesContext(mockItem(), undefined)).toBe(true);
        });

        it('should match for-context', () => {
            expect(matchesContext(mockItem(['foo', 'bar']), 'foo')).toBe(true);
            expect(matchesContext(mockItem(['foo', 'bar']), 'baz')).toBe(false);
        });

        it('should not match not-for-context', () => {
            expect(matchesContext(mockItem(undefined, ['foo', 'bar']), 'foo')).toBe(false);
            expect(matchesContext(mockItem(undefined, ['foo', 'bar']), 'baz')).toBe(true);
        });

        it('should match if neither for-context nor not-for-context is present', () => {
            expect(matchesContext(mockItem(), 'foo')).toBe(true);
        });
    });
});
