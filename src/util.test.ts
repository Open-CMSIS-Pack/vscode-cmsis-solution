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
import { isWebAddress } from './util';
import { ITreeItem, CTreeItem } from './generic/tree-item';
import { matchesStringOrRegExp, arrayContainsValue, matchesContext } from './utils/context-utils';

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
