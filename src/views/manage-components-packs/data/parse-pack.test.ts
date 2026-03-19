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

import 'jest';
import { buildPackId, isValidPackId, parsePackId } from './pack-parse';

describe('parsePackId', () => {
    describe('valid pack id patterns', () => {
        it('parses pack with vendor, name and exact version', () => {
            const result = parsePackId('ARM::CMSIS@5.9.0');

            expect(result).toEqual({
                vendor: 'ARM',
                packName: 'CMSIS',
                versionOperator: '@',
                version: '5.9.0'
            });
        });

        it('parses pack with version operators (>=, ^, ~)', () => {
            expect(parsePackId('MDK-Middleware@>=7.13.0')).toEqual({
                vendor: undefined,
                packName: 'MDK-Middleware',
                versionOperator: '@>=',
                version: '7.13.0'
            });

            expect(parsePackId('MDK-Middleware@^7.13.0')).toEqual({
                vendor: undefined,
                packName: 'MDK-Middleware',
                versionOperator: '@^',
                version: '7.13.0'
            });

            expect(parsePackId('MDK-Middleware@~7.13.0')).toEqual({
                vendor: undefined,
                packName: 'MDK-Middleware',
                versionOperator: '@~',
                version: '7.13.0'
            });

            expect(parsePackId('MDK-Middleware@7.13.0')).toEqual({
                vendor: undefined,
                packName: 'MDK-Middleware',
                versionOperator: '@',
                version: '7.13.0'
            });
        });

        it('parses pack without version', () => {
            expect(parsePackId('Keil::TFM')).toEqual({
                vendor: 'Keil',
                packName: 'TFM',
                versionOperator: undefined,
                version: undefined
            });

            expect(parsePackId('AWS')).toEqual({
                vendor: undefined,
                packName: 'AWS',
                versionOperator: undefined,
                version: undefined
            });
        });

        it('parses pack with wildcard pattern', () => {
            const result = parsePackId('Keil::STM*');

            expect(result).toEqual({
                vendor: 'Keil',
                packName: 'STM*',
                versionOperator: undefined,
                version: undefined
            });
        });

        it('parses pack with pre-release and build metadata', () => {
            expect(parsePackId('MDK-Middleware@>=8.0.0-0')).toEqual({
                vendor: undefined,
                packName: 'MDK-Middleware',
                versionOperator: '@>=',
                version: '8.0.0-0'
            });

            expect(parsePackId('ARM::CMSIS@4.3.0-alpha+build1')).toEqual({
                vendor: 'ARM',
                packName: 'CMSIS',
                versionOperator: '@',
                version: '4.3.0-alpha+build1'
            });
        });

        it('parses names with hyphens and numbers', () => {
            expect(parsePackId('My-Vendor::My-Pack-Name@1.0.0')).toEqual({
                vendor: 'My-Vendor',
                packName: 'My-Pack-Name',
                versionOperator: '@',
                version: '1.0.0'
            });

            expect(parsePackId('ARM::STM32F4@1.0.0')).toEqual({
                vendor: 'ARM',
                packName: 'STM32F4',
                versionOperator: '@',
                version: '1.0.0'
            });

            expect(parsePackId('ARM::STM32F4')).toEqual({
                vendor: 'ARM',
                packName: 'STM32F4',
                versionOperator: undefined,
                version: undefined
            });
        });
    });

    describe('invalid pack id patterns', () => {
        it('returns undefined for invalid inputs', () => {
            expect(parsePackId('')).toBeUndefined();
            expect(parsePackId('ARM::CMSIS@invalid.version')).toBeUndefined();
            expect(parsePackId('ARM::CMSIS@>5.9.0')).toBeUndefined();
            expect(parsePackId('ARM::CMSIS@')).toBeUndefined();
        });
    });

    describe('isValidPackId', () => {
        describe('valid pack id patterns', () => {
            it('returns true for pack with vendor, name and exact version', () => {
                expect(isValidPackId('ARM::CMSIS@5.9.0')).toBe(true);
            });

            it('returns true for pack with version operators (>=, ^, ~)', () => {
                expect(isValidPackId('MDK-Middleware@>=7.13.0')).toBe(true);
                expect(isValidPackId('MDK-Middleware@^7.13.0')).toBe(true);
                expect(isValidPackId('MDK-Middleware@~7.13.0')).toBe(true);
                expect(isValidPackId('MDK-Middleware@7.13.0')).toBe(true);
            });

            it('returns true for pack without version', () => {
                expect(isValidPackId('Keil::TFM')).toBe(true);
                expect(isValidPackId('AWS')).toBe(true);
            });

            it('returns true for pack with wildcard pattern', () => {
                expect(isValidPackId('Keil::STM*')).toBe(true);
            });

            it('returns true for pack with pre-release and build metadata', () => {
                expect(isValidPackId('MDK-Middleware@>=8.0.0-0')).toBe(true);
                expect(isValidPackId('ARM::CMSIS@4.3.0-alpha.1+build.102')).toBe(true);
            });

            it('returns true for names with hyphens and numbers', () => {
                expect(isValidPackId('My-Vendor::My-Pack-Name@1.0.0')).toBe(true);
                expect(isValidPackId('ARM::STM32F4@1.0.0')).toBe(true);
                expect(isValidPackId('ARM::STM32F4')).toBe(true);
            });
        });

        describe('invalid pack id patterns', () => {
            it('returns false for empty string', () => {
                expect(isValidPackId('')).toBe(false);
            });

            it('returns false for pack with invalid version format', () => {
                expect(isValidPackId('ARM::CMSIS@invalid.version')).toBe(false);
            });

            it('returns false for unsupported version operator', () => {
                expect(isValidPackId('ARM::CMSIS@>5.9.0')).toBe(false);
            });

            it('returns false for pack with trailing @', () => {
                expect(isValidPackId('ARM::CMSIS@')).toBe(false);
            });
        });
    });

    describe('buildPackId', () => {
        describe('builds pack id with all components', () => {
            it('builds pack id with vendor, name and exact version', () => {
                const result = buildPackId({
                    vendor: 'ARM',
                    packName: 'CMSIS',
                    versionOperator: '@',
                    version: '5.9.0'
                });

                expect(result).toBe('ARM::CMSIS@5.9.0');
            });

            it('builds pack id with version operators (>=, ^, ~)', () => {
                expect(buildPackId({
                    packName: 'MDK-Middleware',
                    versionOperator: '@>=',
                    version: '7.13.0'
                })).toBe('MDK-Middleware@>=7.13.0');

                expect(buildPackId({
                    packName: 'MDK-Middleware',
                    versionOperator: '@^',
                    version: '7.13.0'
                })).toBe('MDK-Middleware@^7.13.0');

                expect(buildPackId({
                    packName: 'MDK-Middleware',
                    versionOperator: '@~',
                    version: '7.13.0'
                })).toBe('MDK-Middleware@~7.13.0');
            });

            it('builds pack id with default @ operator when version provided without operator', () => {
                expect(buildPackId({
                    packName: 'MDK-Middleware',
                    version: '7.13.0'
                })).toBe('MDK-Middleware@7.13.0');
            });

            it('builds pack id with pre-release and build metadata', () => {
                expect(buildPackId({
                    packName: 'MDK-Middleware',
                    versionOperator: '@>=',
                    version: '8.0.0-0'
                })).toBe('MDK-Middleware@>=8.0.0-0');

                expect(buildPackId({
                    vendor: 'ARM',
                    packName: 'CMSIS',
                    versionOperator: '@',
                    version: '5.9.0+build123'
                })).toBe('ARM::CMSIS@5.9.0+build123');
            });
        });

        describe('builds pack id without version', () => {
            it('builds pack id with vendor and name only', () => {
                expect(buildPackId({
                    vendor: 'Keil',
                    packName: 'TFM'
                })).toBe('Keil::TFM');
            });

            it('builds pack id with name only', () => {
                expect(buildPackId({
                    packName: 'AWS'
                })).toBe('AWS');
            });

            it('builds pack id with wildcard pattern', () => {
                expect(buildPackId({
                    vendor: 'Keil',
                    packName: 'STM*'
                })).toBe('Keil::STM*');
            });
        });

        describe('builds pack id with special characters', () => {
            it('builds pack id with hyphens and numbers in names', () => {
                expect(buildPackId({
                    vendor: 'My-Vendor',
                    packName: 'My-Pack-Name',
                    versionOperator: '@',
                    version: '1.0.0'
                })).toBe('My-Vendor::My-Pack-Name@1.0.0');

                expect(buildPackId({
                    vendor: 'ARM',
                    packName: 'STM32F4',
                    versionOperator: '@',
                    version: '1.0.0'
                })).toBe('ARM::STM32F4@1.0.0');

                expect(buildPackId({
                    vendor: 'ARM',
                    packName: 'STM32F4'
                })).toBe('ARM::STM32F4');
            });
        });
    });
});
