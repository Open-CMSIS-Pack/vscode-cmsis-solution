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

import { Tz } from '../../../../core-tools/client/packs_pb';
import { deviceHardwareOptionFactory, processorInfoFactory } from '../../cmsis-solution-types.factories';
import { blankTemplate, createProjectsForTemplateAndHardware, hardwareTemplateOptions, toValidProjectName, trustZoneTemplate } from './templates';
import { NewProject } from '../../cmsis-solution-types';
import { FieldAndInteraction, hadInteraction } from './field-and-interaction';

describe('Create solution templates', () => {
    describe('hardwareTemplateOptions', () => {
        it('return Blank and TrustZone Solution options for device with processor that has a trustzone', () => {
            const selectedDevice = deviceHardwareOptionFactory(
                { processors: [{ name: '', core: 'Cortex-M-1', tz: Tz.TZ }, { name: '', core: 'Cortex-M-2', tz: Tz.TZ_NO }] });
            const result = hardwareTemplateOptions(selectedDevice);
            expect(result).toEqual([blankTemplate, trustZoneTemplate]);
        });

        it('return Blank options for device with processor pairing of empty string and NO_TZ', () => {
            const selectedDevice = deviceHardwareOptionFactory(
                { processors: [{ name: '', core: 'Cortex-M-1', tz: Tz.TZ_UNSPECIFIED }, { name: '', core: 'Cortex-M-2', tz: Tz.TZ_NO }] });
            const result = hardwareTemplateOptions(selectedDevice);
            expect(result).toEqual([blankTemplate]);
        });

        it('return Blank option for device with processor with blank trustzone', () => {
            const selectedDevice = deviceHardwareOptionFactory(
                { processors: [{ name: '', core: 'Cortex-M-1', tz: Tz.TZ_UNSPECIFIED }, { name: '', core: 'Cortex-M-2', tz: Tz.TZ_UNSPECIFIED }] }
            );
            const result = hardwareTemplateOptions(selectedDevice);
            expect(result).toEqual([blankTemplate]);
        });
    });

    describe('createProjectsForTemplateAndHardware', () => {
        it('creates projects for the blank template with a selected device with multiple processors', () => {
            const processor1 = processorInfoFactory({ tz: Tz.TZ });
            const processor2 = processorInfoFactory({ tz: Tz.TZ_UNSPECIFIED });

            const selectedDevice = deviceHardwareOptionFactory({ processors: [processor1, processor2] });

            const projects = createProjectsForTemplateAndHardware(selectedDevice, blankTemplate);

            const expected: FieldAndInteraction<NewProject>[] = [
                hadInteraction({ name: toValidProjectName(processor1.name), processorName: processor1.name, trustzone: 'off' }),
                hadInteraction({ name: toValidProjectName(processor2.name), processorName: processor2.name, trustzone: 'off' }),
            ];

            expect(projects).toEqual(expected);
        });

        it('creates projects for the blank template with a selected device with one processor', () => {
            const processor = processorInfoFactory({ name: '', tz: Tz.TZ });
            const selectedDevice = deviceHardwareOptionFactory({ processors: [processor] });

            const projects = createProjectsForTemplateAndHardware(selectedDevice, blankTemplate);
            const expected: FieldAndInteraction<NewProject>[] = [
                hadInteraction({ name: toValidProjectName('Project'), processorName: '', trustzone: 'off' }),
            ];
            expect(projects).toEqual(expected);
        });

        it('creates projects for the trustzone template for a selected device with multiple processors', () => {
            const processor1 = processorInfoFactory({ tz: Tz.TZ });
            const processor2 = processorInfoFactory({ tz: Tz.TZ_UNSPECIFIED });

            const selectedDevice = deviceHardwareOptionFactory({ processors: [processor1, processor2] });

            const projects = createProjectsForTemplateAndHardware(selectedDevice, trustZoneTemplate);
            const expected: FieldAndInteraction<NewProject>[] = [
                { value: { name: toValidProjectName(`${processor1.name}_Secure`), processorName: processor1.name, trustzone: 'secure' }, hadInteraction: true },
                { value: { name: toValidProjectName(`${processor1.name}_NonSecure`), processorName: processor1.name, trustzone: 'non-secure' }, hadInteraction: true },
                { value: { name: toValidProjectName(processor2.name), processorName: processor2.name, trustzone: 'off' }, hadInteraction: true },
            ];
            expect(projects).toEqual(expected);
        });

        it('creates projects for the trustzone template for a selected device with one processor', () => {
            const processor = processorInfoFactory({ name: '', tz: Tz.TZ });
            const selectedDevice = deviceHardwareOptionFactory({ processors: [processor] });
            const projects = createProjectsForTemplateAndHardware(selectedDevice, trustZoneTemplate);
            const expected: FieldAndInteraction<NewProject>[] = [
                { value: { name: toValidProjectName('Secure'), processorName: '', trustzone: 'secure' }, hadInteraction: true },
                { value: { name: toValidProjectName('NonSecure'), processorName: '', trustzone: 'non-secure' }, hadInteraction: true },
            ];
            expect(projects).toEqual(expected);
        });
    });

    describe('toValidProjectName', () => {
        it('returns a valid string without modification', () => {
            const input = 'a_valid_name';
            const output = toValidProjectName(input);
            expect(output).toEqual(input);
        });

        it('replaces spaces with underscore', () => {
            const output = toValidProjectName('a test string');
            expect(output).toEqual('a_test_string');
        });

        it('removes non-word characters', () => {
            const output = toValidProjectName('a"test`string');
            expect(output).toEqual('ateststring');
        });
    });
});
