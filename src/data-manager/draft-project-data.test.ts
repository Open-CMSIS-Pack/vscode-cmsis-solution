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

import * as path from 'path';
import { ExampleProject, SolutionTemplate } from '../json-rpc/csolution-rpc-client';
import { CsolutionExampleData, CsolutionTemplateData, SolarExampleData } from './draft-project-data';
import { PackId } from './pack-data';
import { ExampleProject as SolarProject } from '../solar-search/solar-search-client';

describe('Solar draft project data', () => {
    const example: SolarProject = {
        name: 'Web example', description: '', format: { type: 'csolution' },
        download_url: 'https://example.com/example.zip', id: 'example',
    };

    it('exposes the origin pack without changing the web example ID', () => {
        const draft = new SolarExampleData({
            ...example, origin: { type: 'cmsis_pack', url: 'https://example.com/packs/Arm.CMSIS.6.1.0.pack?download=1' },
        });

        expect(draft.pack).toEqual(new PackId('Arm', 'CMSIS', '6.1.0'));
        expect(draft.id.key).toBe('example');
    });

    it('accepts a pack version with prerelease and build metadata', () => {
        const draft = new SolarExampleData({
            ...example, origin: { type: 'cmsis_pack', url: 'https://example.com/Vendor.Name.1.2.3-rc.1+build.7.pack' },
        });

        expect(draft.pack).toEqual(new PackId('Vendor', 'Name', '1.2.3-rc.1+build.7'));
    });

    it.each([
        undefined,
        { type: 'github', url: 'https://example.com/Arm.CMSIS.6.1.0.pack' },
        { type: 'cmsis_pack', url: null },
        { type: 'cmsis_pack', url: 'not-a-url' },
        { type: 'cmsis_pack', url: 'https://example.com/invalid.pack' },
        { type: 'cmsis_pack', url: 'https://example.com/Arm.CMSIS.invalid.pack' },
        { type: 'cmsis_pack', url: 'https://example.com/Arm.CMSIS.1.2.3-foo..bar.pack' },
    ])('omits the pack for unsupported or invalid origin %p', origin => {
        expect(new SolarExampleData({ ...example, origin }).pack).toBeUndefined();
    });
});

describe('Csolution draft project data', () => {
    it('uses only the selected csolution environment filename', () => {
        const csolutionFile = path.resolve('packs', 'examples', 'Test-Ethos-U55.csolution.yml');
        const example: ExampleProject = {
            name: 'Ethos-U reference application',
            description: 'Reference application with multiple solutions',
            doc: '',
            pack: 'ARM::CMSIS-Ethos-U@1.0.0',
            environments: [
                { name: 'uv', file: path.resolve('packs', 'examples', 'Test-Ethos-U55.uvprojx'), folder: '' },
                { name: 'csolution', file: csolutionFile, folder: '' },
            ],
        };

        const draft = new CsolutionExampleData(example);

        expect(draft.solutionFileName).toBe('Test-Ethos-U55.csolution.yml');
    });

    it('uses only the template filename', () => {
        const template: SolutionTemplate = {
            name: 'Reference template',
            description: '',
            file: path.resolve('packs', 'templates', 'Reference.csolution.yml'),
            folder: '',
            pack: 'Vendor::Pack@1.0.0',
        };

        const draft = new CsolutionTemplateData(template);

        expect(draft.solutionFileName).toBe('Reference.csolution.yml');
    });

    it('does not expose a uVision project as a solution filename', () => {
        const example: ExampleProject = {
            name: 'uVision example',
            description: '',
            doc: '',
            pack: 'Vendor::Pack@1.0.0',
            environments: [
                { name: 'uv', file: path.resolve('packs', 'examples', 'project.uvprojx'), folder: '' },
            ],
        };

        const draft = new CsolutionExampleData(example);

        expect(draft.solutionFileName).toBeUndefined();
    });
});
