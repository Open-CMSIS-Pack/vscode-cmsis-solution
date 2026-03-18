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

import { buildComponentId, isValidComponentId, parseComponentId } from './component-parse';
import { INodeComponent } from './component-tools';

describe('Component ID parser', () => {
    describe('parseComponentId', () => {
        it('should parse a full component id with all fields', () => {
            const id = 'ARM::CMSIS&Bundle:RTOS:Keil RTX5&Variant@5.5.4';
            const result = parseComponentId(id);

            expect(result).toEqual({
                vendor: 'ARM',
                class: 'CMSIS',
                bundle: 'Bundle',
                group: 'RTOS',
                sub: 'Keil RTX5',
                variant: 'Variant',
                version: '5.5.4',
            });
        });

        it('should parse component id without vendor', () => {
            const id = 'CMSIS:RTOS:Keil RTX5@5.5.4';
            const result = parseComponentId(id);

            expect(result).toEqual({
                vendor: '',
                class: 'CMSIS',
                bundle: undefined,
                group: 'RTOS',
                sub: 'Keil RTX5',
                variant: undefined,
                version: '5.5.4',
            });
        });

        it('should parse component id without sub-group', () => {
            const id = 'ARM::CMSIS:CORE@1.0.0';
            const result = parseComponentId(id);

            expect(result).toEqual({
                vendor: 'ARM',
                class: 'CMSIS',
                bundle: undefined,
                group: 'CORE',
                sub: undefined,
                variant: undefined,
                version: '1.0.0',
            });
        });

        it('should parse component id without version', () => {
            const id = 'ARM::Device:Startup';
            const result = parseComponentId(id);

            expect(result).toEqual({
                vendor: 'ARM',
                class: 'Device',
                bundle: undefined,
                group: 'Startup',
                sub: undefined,
                variant: undefined,
                version: undefined,
            });
        });

        it('should parse component id with bundle but no variant', () => {
            const id = 'Keil::CMSIS&MDK-Pro:RTOS2:FreeRTOS@10.4.6';
            const result = parseComponentId(id);

            expect(result).toEqual({
                vendor: 'Keil',
                class: 'CMSIS',
                bundle: 'MDK-Pro',
                group: 'RTOS2',
                sub: 'FreeRTOS',
                variant: undefined,
                version: '10.4.6',
            });
        });

        it('should parse component id with variant but no bundle', () => {
            const id = 'ARM::CMSIS:DSP:Transform&CM4@1.10.0';
            const result = parseComponentId(id);

            expect(result).toEqual({
                vendor: 'ARM',
                class: 'CMSIS',
                bundle: undefined,
                group: 'DSP',
                sub: 'Transform',
                variant: 'CM4',
                version: '1.10.0',
            });
        });

        it('should parse minimal component id with only class and group', () => {
            const id = 'Device:Startup';
            const result = parseComponentId(id);

            expect(result).toEqual({
                vendor: '',
                class: 'Device',
                bundle: undefined,
                group: 'Startup',
                sub: undefined,
                variant: undefined,
                version: undefined,
            });
        });

        it('should parse version with >= prefix', () => {
            const id = 'ARM::CMSIS:CORE@>=1.0.0';
            const result = parseComponentId(id);

            expect(result).toEqual({
                vendor: 'ARM',
                class: 'CMSIS',
                bundle: undefined,
                group: 'CORE',
                sub: undefined,
                variant: undefined,
                version: '>=1.0.0',
            });
        });

        it('should parse version with complex format', () => {
            const id = 'ARM::CMSIS:CORE@1.2.3-beta.4+build.5';
            const result = parseComponentId(id);

            expect(result).toEqual({
                vendor: 'ARM',
                class: 'CMSIS',
                bundle: undefined,
                group: 'CORE',
                sub: undefined,
                variant: undefined,
                version: '1.2.3-beta.4+build.5',
            });
        });

        it('should return undefined for invalid component id missing colon', () => {
            const id = 'ARM::CMSIS';
            const result = parseComponentId(id);

            expect(result).toBeUndefined();
        });

        it('should return undefined for empty string', () => {
            const id = '';
            const result = parseComponentId(id);

            expect(result).toBeUndefined();
        });

        it('should return undefined for malformed component id', () => {
            const id = '::::::';
            const result = parseComponentId(id);

            expect(result).toBeUndefined();
        });

        it('should parse component id with special characters in names', () => {
            const id = 'ARM-Vendor::CMSIS-Plus:RTOS-2:Keil-RTX5@1.0.0';
            const result = parseComponentId(id);

            expect(result).toEqual({
                vendor: 'ARM-Vendor',
                class: 'CMSIS-Plus',
                bundle: undefined,
                group: 'RTOS-2',
                sub: 'Keil-RTX5',
                variant: undefined,
                version: '1.0.0',
            });
        });
    });

    describe('isValidComponentId', () => {
        it('should return true for a full component id with all fields', () => {
            const id = 'ARM::CMSIS&Bundle:RTOS:Keil RTX5&Variant@5.5.4';
            expect(isValidComponentId(id)).toBe(true);
        });

        it('should return true for component id without vendor', () => {
            const id = 'CMSIS:RTOS:Keil RTX5@5.5.4';
            expect(isValidComponentId(id)).toBe(true);
        });

        it('should return true for component id without sub-group', () => {
            const id = 'ARM::CMSIS:CORE@1.0.0';
            expect(isValidComponentId(id)).toBe(true);
        });

        it('should return true for component id without version', () => {
            const id = 'ARM::Device:Startup';
            expect(isValidComponentId(id)).toBe(true);
        });

        it('should return true for component id with bundle but no variant', () => {
            const id = 'Keil::CMSIS&MDK-Pro:RTOS2:FreeRTOS@10.4.6';
            expect(isValidComponentId(id)).toBe(true);
        });

        it('should return true for component id with variant but no bundle', () => {
            const id = 'ARM::CMSIS:DSP:Transform&CM4@1.10.0';
            expect(isValidComponentId(id)).toBe(true);
        });

        it('should return true for minimal component id with only class and group', () => {
            const id = 'Device:Startup';
            expect(isValidComponentId(id)).toBe(true);
        });

        it('should return true for version with >= prefix', () => {
            const id = 'ARM::CMSIS:CORE@>=1.0.0';
            expect(isValidComponentId(id)).toBe(true);
        });

        it('should return true for version with complex format', () => {
            const id = 'ARM::CMSIS:CORE@1.2.3-beta.4+build.5';
            expect(isValidComponentId(id)).toBe(true);
        });

        it('should return true for component id with special characters in names', () => {
            const id = 'ARM-Vendor::CMSIS-Plus:RTOS-2:Keil-RTX5@1.0.0';
            expect(isValidComponentId(id)).toBe(true);
        });

        it('should return false for invalid component id missing colon', () => {
            const id = 'ARM::CMSIS';
            expect(isValidComponentId(id)).toBe(false);
        });

        it('should return false for empty string', () => {
            const id = '';
            expect(isValidComponentId(id)).toBe(false);
        });

        it('should return false for malformed component id', () => {
            const id = '::::::';
            expect(isValidComponentId(id)).toBe(false);
        });

        it('should return false for component id with only vendor', () => {
            const id = 'ARM::';
            expect(isValidComponentId(id)).toBe(false);
        });

        it('should return false for component id with only class', () => {
            const id = 'CMSIS';
            expect(isValidComponentId(id)).toBe(false);
        });
    });

    describe('buildComponentId', () => {
        it('should build a full component id with all fields', () => {
            const component: INodeComponent = {
                vendor: 'ARM',
                class: 'CMSIS',
                bundle: 'Bundle',
                group: 'RTOS',
                sub: 'Keil RTX5',
                variant: 'Variant',
                version: '5.5.4',
            };
            const result = buildComponentId(component);

            expect(result).toBe('ARM::CMSIS&Bundle:RTOS:Keil RTX5&Variant@5.5.4');
        });

        it('should build component id without vendor', () => {
            const component: INodeComponent = {
                vendor: '',
                class: 'CMSIS',
                bundle: undefined,
                group: 'RTOS',
                sub: 'Keil RTX5',
                variant: undefined,
                version: '5.5.4',
            };
            const result = buildComponentId(component);

            expect(result).toBe('CMSIS:RTOS:Keil RTX5@5.5.4');
        });

        it('should build component id without sub-group', () => {
            const component: INodeComponent = {
                vendor: 'ARM',
                class: 'CMSIS',
                bundle: undefined,
                group: 'CORE',
                sub: undefined,
                variant: undefined,
                version: '1.0.0',
            };
            const result = buildComponentId(component);

            expect(result).toBe('ARM::CMSIS:CORE@1.0.0');
        });

        it('should build component id without version', () => {
            const component: INodeComponent = {
                vendor: 'ARM',
                class: 'Device',
                bundle: undefined,
                group: 'Startup',
                sub: undefined,
                variant: undefined,
                version: undefined,
            };
            const result = buildComponentId(component);

            expect(result).toBe('ARM::Device:Startup');
        });

        it('should build component id with bundle but no variant', () => {
            const component: INodeComponent = {
                vendor: 'Keil',
                class: 'CMSIS',
                bundle: 'MDK-Pro',
                group: 'RTOS2',
                sub: 'FreeRTOS',
                variant: undefined,
                version: '10.4.6',
            };
            const result = buildComponentId(component);

            expect(result).toBe('Keil::CMSIS&MDK-Pro:RTOS2:FreeRTOS@10.4.6');
        });

        it('should build component id with variant but no bundle', () => {
            const component: INodeComponent = {
                vendor: 'ARM',
                class: 'CMSIS',
                bundle: undefined,
                group: 'DSP',
                sub: 'Transform',
                variant: 'CM4',
                version: '1.10.0',
            };
            const result = buildComponentId(component);

            expect(result).toBe('ARM::CMSIS:DSP:Transform&CM4@1.10.0');
        });

        it('should build minimal component id with only class and group', () => {
            const component: INodeComponent = {
                vendor: '',
                class: 'Device',
                bundle: undefined,
                group: 'Startup',
                sub: undefined,
                variant: undefined,
                version: undefined,
            };
            const result = buildComponentId(component);

            expect(result).toBe('Device:Startup');
        });

        it('should build component id with >= version prefix', () => {
            const component: INodeComponent = {
                vendor: 'ARM',
                class: 'CMSIS',
                bundle: undefined,
                group: 'CORE',
                sub: undefined,
                variant: undefined,
                version: '>=1.0.0',
            };
            const result = buildComponentId(component);

            expect(result).toBe('ARM::CMSIS:CORE@>=1.0.0');
        });

        it('should build component id with complex version format', () => {
            const component: INodeComponent = {
                vendor: 'ARM',
                class: 'CMSIS',
                bundle: undefined,
                group: 'CORE',
                sub: undefined,
                variant: undefined,
                version: '1.2.3-beta.4+build.5',
            };
            const result = buildComponentId(component);

            expect(result).toBe('ARM::CMSIS:CORE@1.2.3-beta.4+build.5');
        });

        it('should build component id with special characters in names', () => {
            const component: INodeComponent = {
                vendor: 'ARM-Vendor',
                class: 'CMSIS-Plus',
                bundle: undefined,
                group: 'RTOS-2',
                sub: 'Keil-RTX5',
                variant: undefined,
                version: '1.0.0',
            };
            const result = buildComponentId(component);

            expect(result).toBe('ARM-Vendor::CMSIS-Plus:RTOS-2:Keil-RTX5@1.0.0');
        });

        it('should round-trip parse and build for full component id', () => {
            const originalId = 'ARM::CMSIS&Bundle:RTOS:Keil RTX5&Variant@5.5.4';
            const parsed = parseComponentId(originalId);
            const rebuilt = buildComponentId(parsed!);

            expect(rebuilt).toBe(originalId);
        });

        it('should round-trip parse and build for minimal component id', () => {
            const originalId = 'Device:Startup';
            const parsed = parseComponentId(originalId);
            const rebuilt = buildComponentId(parsed!);

            expect(rebuilt).toBe(originalId);
        });
    });
});
