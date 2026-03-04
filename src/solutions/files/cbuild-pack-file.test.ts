/**
 * Copyright 2026 Arm Limited
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
import { CbuildPackFile } from './cbuild-pack-file';
import { ETextFileResult } from '../../generic/text-file';
import * as fsUtils from '../../utils/fs-utils';

const initialYaml = `cbuild-pack:
  resolved-packs:
    - resolved-pack: ARM::CMSIS@6.0.0
      selected-by-pack:
        - ARM::Pack
        - ARM::Pack@6.0.0
    - resolved-pack: Keil::Middleware@2.3.4
      selected-by-pack:
        - Keil::Middleware
`;
const modifiedYaml = `cbuild-pack:
  resolved-packs:
    - resolved-pack: ARM::CMSIS@6.0.0
      selected-by-pack:
        - ARM::Pack@6.0.0
    - resolved-pack: ARM::CMSIS@6.3.0
      selected-by-pack:
        - ARM::Pack
    - resolved-pack: Keil::Middleware@2.3.5
      selected-by-pack:
        - Keil::Middleware
    - resolved-pack: My:Pack@1.1.0
      selected-by-pack:
        - My::Pack
        - My::Pack@>1.0.0
`;

describe('CbuildPackFile', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('loads resolved packs from YAML content', async () => {
        jest.spyOn(fsUtils, 'fileExists').mockReturnValue(true);
        jest.spyOn(fsUtils, 'readTextFile').mockReturnValue(initialYaml);

        const file = new CbuildPackFile('mySolution.cbuild-pack.yml');
        const result = await file.load();
        expect(result).toBe(ETextFileResult.Success);

        const packs = file.resolvedPacks;
        expect(packs.size).toBe(2);
        expect(packs.get('ARM::CMSIS@6.0.0')).toEqual(['ARM::Pack', 'ARM::Pack@6.0.0']);
        expect(packs.get('Keil::Middleware@2.3.4')).toEqual(['Keil::Middleware']);
    });

    it('persists resolved packs when saving', async () => {
        const writeSpy = jest.spyOn(fsUtils, 'writeTextFile').mockImplementation(() => undefined);
        jest.spyOn(fsUtils, 'fileExists').mockReturnValue(true);
        jest.spyOn(fsUtils, 'readTextFile').mockReturnValue(initialYaml);

        const file = new CbuildPackFile('mySolution.cbuild-pack.yml');
        await file.load();

        const packs = new Map<string, string[]>([
            ['ARM::CMSIS@6.3.0', ['ARM::Pack']],
            ['ARM::CMSIS@6.0.0', ['ARM::Pack@6.0.0']],
            ['Keil::Middleware@2.3.5', ['Keil::Middleware']],
            ['My:Pack@1.1.0', ['My::Pack', 'My::Pack@>1.0.0']],
        ]);
        file.resolvedPacks = packs;

        const result = await file.save();

        expect(result).toBe(ETextFileResult.Success);
        expect(writeSpy).toHaveBeenCalledTimes(1);
        expect(file.text).toContain('ARM::CMSIS@6.3.0');
        expect(file.text).toContain('ARM::CMSIS@6.0.0');
        expect(file.text).toContain('My:Pack@1.1.0');
        expect(file.text).toEqual(modifiedYaml);
    });

    it('deletes file when no resolved packs remain', async () => {
        jest.spyOn(fsUtils, 'fileExists').mockReturnValue(true);
        const deleteSpy = jest.spyOn(fsUtils, 'deleteFileIfExists').mockImplementation(() => undefined);

        const file = new CbuildPackFile('my.cbuild-pack.yml');
        file.resolvedPacks = new Map();

        const result = await file.save();

        expect(result).toBe(ETextFileResult.Success);
        expect(deleteSpy).toHaveBeenCalledWith('my.cbuild-pack.yml');
    });

    it('removes resolved packs selected by pack name with version suffix', async () => {
        jest.spyOn(fsUtils, 'fileExists').mockReturnValue(true);
        jest.spyOn(fsUtils, 'readTextFile').mockReturnValue(initialYaml);

        const file = new CbuildPackFile('mySolution.cbuild-pack.yml');
        const result = await file.load();
        expect(result).toBe(ETextFileResult.Success);
        let packs = file.resolvedPacks;
        expect(packs.size).toBe(2);

        file.unlockPackage('ARM::Pack');

        packs = file.resolvedPacks;
        expect(packs.size).toBe(1);
        expect(packs.has('ARM::CMSIS@6.0.0')).toBe(false);
        expect(packs.get('Keil::Middleware@2.3.4')).toEqual(['Keil::Middleware']);
    });
});
