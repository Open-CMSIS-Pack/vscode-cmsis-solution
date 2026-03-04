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
import { PackId, generatePackId, packIdsEqual, serialisePackId } from './pack-id';
import { PackReference } from '../solutions/deserialising/solution-data';

describe('PackId', () => {
    describe('packIdsEqual', () => {
        it('returns true if the vendor, name and version are equal', () => {
            const vendor = 'TEST_VENDOR';
            const name = 'TEST_NAME';
            const version = 'TEST_VERSION';
            const output = packIdsEqual({ vendor, name, version })({ vendor, name, version });
            expect(output).toBe(true);
        });

        it('returns false otherwise', () => {
            const vendor = 'TEST_VENDOR';
            const name = 'TEST_NAME';
            const version = 'TEST_VERSION';
            const packIdEqualsTest = packIdsEqual({ vendor, name, version });
            expect(packIdEqualsTest({ vendor: 'OTHER_VENDOR', name, version })).toBe(false);
        });
    });

    describe('generatePackId', () => {
        it('generate PackID from packReference', () => {
            const vendor = 'TEST_VENDOR';
            const name = 'TEST_NAME';
            const version = 'TEST_VERSION';
            const packRef: PackReference = {
                name,
                vendor,
                version
            };
            const expected: PackId = {
                name,
                vendor,
                version,
            };

            const result = generatePackId(packRef);

            expect(result).toEqual(expected);
        });

        it('generate PackID with empty strings when reference attribute is undefinded', () => {
            const vendor = 'TEST_VENDOR';
            const name = undefined;
            const version = undefined;
            const packRef: PackReference = {
                name,
                vendor,
                version
            };
            const expected: PackId = {
                name: '',
                vendor,
                version: '',
            };

            const result = generatePackId(packRef);

            expect(result).toEqual(expected);
        });

        it('return undefined when it is undefined', () => {
            const packRef = undefined;
            const expected = undefined;

            const result = generatePackId(packRef);

            expect(result).toEqual(expected);
        });
    });

    describe('serialisePackId', () => {
        it('convert pack ID to string', () => {
            const vendor = 'TEST_VENDOR';
            const name = 'TEST_NAME';
            const version = 'TEST_VERSION';
            const output = serialisePackId({ vendor, name, version });
            expect(output).toBe('TEST_VENDOR::TEST_NAME@TEST_VERSION');
        });
        it('convert pack ID with empty version to string', () => {
            const vendor = 'TEST_VENDOR';
            const name = 'TEST_NAME';
            const version = '';
            const output = serialisePackId({ vendor, name, version });
            expect(output).toBe('TEST_VENDOR::TEST_NAME');
        });
    });
});
