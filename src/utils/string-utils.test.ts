/**
 * Copyright 2024-2026 Arm Limited
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
import {
    convertCrLfToLf,
    convertLfToCrLf,
    extractPname,
    extractPrefix,
    extractSuffix,
    extractVersion,
    getIndentString,
    splitInThree,
    splitInTwo,
    stripAffix,
    stripExtension,
    stripPrefix,
    stripSuffix,
    stripTwoExtensions,
    stripVendor,
    stripVendorAndVersion,
    stripVersion
} from './string-utils';

describe('string utils', () => {
    describe('string utils', () => {

        it('checks getIndentString', () => {
            expect(getIndentString(0)).toEqual('');
            expect(getIndentString(1)).toEqual('  ');
            expect(getIndentString(0, 1)).toEqual('');
            expect(getIndentString(1, 1)).toEqual(' ');
            expect(getIndentString(0, 0)).toEqual('');
            expect(getIndentString(1, 0)).toEqual('');
        });


        it('checks extractPrefix/extractSuffix functions', () => {
            const input = 'foo:bar:baz';
            expect(extractPrefix(undefined, ':')).toEqual('');
            expect(extractSuffix(undefined, ':')).toEqual('');
            expect(extractPrefix(input, ':')).toEqual('foo');
            expect(extractSuffix(input, ':')).toEqual('baz');

            expect(extractPrefix('foo', ':')).toEqual('');
            expect(extractSuffix('foo', ':')).toEqual('');
            expect(extractPrefix(':bar', ':')).toEqual('');
            expect(extractSuffix(':bar', ':')).toEqual('bar');

        });

        it('checks stripPrefix/stripSuffix functions', () => {
            const input = 'foo:bar:baz';
            expect(stripPrefix(undefined, ':')).toEqual('');
            expect(stripSuffix(undefined, ':')).toEqual('');
            expect(stripPrefix(input, ':')).toEqual('bar:baz');
            expect(stripSuffix(input, ':')).toEqual('foo:bar');
            expect(stripPrefix(input, '::')).toEqual('foo:bar:baz');
            expect(stripSuffix(input, '::')).toEqual('foo:bar:baz');
            expect(stripAffix(input, ':', ':')).toEqual('bar');
            expect(stripAffix(input, '::', ':')).toEqual('foo:bar');
            expect(stripAffix(input, '::', '::')).toEqual(input);
            expect(stripAffix('foo::bar:baz', '::', ':')).toEqual('bar');
            expect(stripAffix('foo::bar:baz', ':', ':')).toEqual(':bar');

            expect(stripSuffix(undefined, ':')).toEqual('');
            expect(stripSuffix(undefined, ':')).toEqual('');
            expect(stripAffix(undefined, ':', ':')).toEqual('');
        });
        it('checks splitInTwo function', () => {
            expect(splitInTwo(undefined, ':')).toEqual(['', '']);
            expect(splitInTwo('foo:bar', ':')).toEqual(['foo', 'bar']);
            expect(splitInTwo('foo', ':')).toEqual(['foo', '']);
            expect(splitInTwo(':foo', ':')).toEqual(['', 'foo']);
            expect(splitInTwo('foo:bar:baz', ':')).toEqual(['foo', 'bar:baz']);

        });
        it('checks splitInThree function', () => {
            expect(splitInThree(undefined, '::', ':')).toEqual(['', '', '']);
            expect(splitInThree('foo::bar:baz', '::', ':')).toEqual(['foo', 'bar', 'baz']);
            expect(splitInThree('bar:baz', '::', ':')).toEqual(['', 'bar', 'baz']);
            expect(splitInThree('foo::bar', '::', ':')).toEqual(['foo', 'bar', '']);
            expect(splitInThree('bar', '::', ':')).toEqual(['', 'bar', '']);
        });
    });

    describe('stripVersion', () => {
        it('removes version from pack name', async () => {
            const packName = 'ARM::CMSIS@>=1.0.0-0';
            const expected = 'ARM::CMSIS';

            const result = stripVersion(packName);
            expect(result).toBe(expected);
        });

        it('no version in pack name', async () => {
            const packName = 'ARM::CMSIS';
            const expected = 'ARM::CMSIS';

            const result = stripVersion(packName);
            expect(result).toBe(expected);
        });

        it('returns empty if supplied undefined', async () => {
            expect(stripVersion(undefined)).toBe('');
        });

        it('removes vendor from pack name', async () => {
            const packName = 'ARM::CMSIS@1.0.0-0';
            const expected = 'CMSIS@1.0.0-0';

            const result = stripVendor(packName);
            expect(result).toBe(expected);
        });

        it('removes vendor from pack name without vendor', async () => {
            const packName = 'CMSIS@1.0.0-0';
            const expected = 'CMSIS@1.0.0-0';

            const result = stripVendor(packName);
            expect(result).toBe(expected);
        });

        it('removes vendor and version from pack name', async () => {
            const packName = 'ARM::CMSIS@1.0.0-0';
            const expected = 'CMSIS';

            const result = stripVendorAndVersion(packName);
            expect(result).toBe(expected);
        });

        it('removes vendor and version from pack name without both', async () => {
            const result = stripVendorAndVersion('CMSIS');
            expect(result).toBe('CMSIS');
        });


        it('removes vendor and version from pack name', async () => {
            const packName = 'ARM::CMSIS@1.0.0-0';
            const expected = 'CMSIS';

            const result = stripVendorAndVersion(packName);
            expect(result).toBe(expected);
        });

        it('removes version from pack name without vendor name', async () => {
            const packName = 'CMSIS@>=1.0.0-0';
            const expected = 'CMSIS';

            const result = stripVersion(packName);
            expect(result).toBe(expected);
        });

        it('removes version from pack name without equal sign', async () => {
            const packName = 'ARM::CMSIS@1.0.0-0';
            const expected = 'ARM::CMSIS';

            const result = stripVersion(packName);
            expect(result).toBe(expected);
        });

        it('removes version from pack name with circumflex', async () => {
            const packName = 'ARM::CMSIS@^1.0.0-0';
            const expected = 'ARM::CMSIS';

            const result = stripVersion(packName);
            expect(result).toBe(expected);
        });

        it('removes version from pack name which is crap', async () => {
            const packName = '$%&/(/&%$&%$§BGCFUZbkfbkaGIUHOöä.,-J';
            const expected = packName;

            const result = stripVersion(packName);
            expect(result).toBe(expected);
        });

        it('removes version from pack name which is version only', async () => {
            const packName = '@^1.0.0-0';
            const expected = '';

            const result = stripVersion(packName);
            expect(result).toBe(expected);
        });

        it('extracts version from pack name', async () => {
            const packName = 'ARM::CMSIS@1.0.0-0';
            const expected = '1.0.0-0';

            const result = extractVersion(packName);
            expect(result).toBe(expected);
        });

        it('extracts empty version from pack name without version', async () => {
            const packName = 'ARM::CMSIS';
            const expected = '';

            const result = extractVersion(packName);
            expect(result).toBe(expected);
        });


    });

    describe('strip extension ', () => {
        it('should strip one extension if present', () => {
            expect(stripExtension('foo')).toEqual('foo');
            expect(stripExtension('foo.bar')).toEqual('foo');
            expect(stripExtension('foo.tar.gz')).toEqual('foo.tar');
        });

        it('should strip two extensions if present', () => {
            expect(stripTwoExtensions('foo')).toEqual('foo');
            expect(stripTwoExtensions('foo.bar')).toEqual('foo');
            expect(stripTwoExtensions('foo.tar.gz')).toEqual('foo');
        });
    });

    describe('extractPname', () => {
        it('returns processor if specified', () => {
            expect(extractPname(':core1')).toBe('core1');
        });
        it('extracts processor suffix when device name present', () => {
            expect(extractPname('MyDevice:core1')).toBe('core1');
        });

        it('handles deprecated leading vendor prefix (::)', () => {
            expect(extractPname('MyVendor::MyDevice:core1')).toBe('core1');
        });

        it('returns undefined when processor suffix absent', () => {
            expect(extractPname('MyDevice')).toBeUndefined();
        });

        it('returns undefined when device value is undefined', () => {
            expect(extractPname('MyDevice')).toBeUndefined();
        });
    });

    describe('line ending conversions', () => {
        it('converts CRLF and CR to LF', () => {
            const input = 'a\r\nb\rc\nd';
            expect(convertCrLfToLf(input)).toBe('a\nb\nc\nd');
        });

        it('converts LF to CRLF without duplicating existing CRLF', () => {
            const input = 'a\r\nb\nc\r\nd';
            expect(convertLfToCrLf(input)).toBe('a\r\nb\r\nc\r\nd');
        });

        it('leaves strings without line breaks unchanged', () => {
            expect(convertCrLfToLf('plain')).toBe('plain');
            expect(convertLfToCrLf('plain')).toBe('plain');
        });
    });
});
