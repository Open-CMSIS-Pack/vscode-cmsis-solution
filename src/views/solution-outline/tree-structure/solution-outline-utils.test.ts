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

import {
    findMergeFiles,
    getMapFilePath,
    selectMergeSibling,
    setContextMenuAttributes,
    setDocContext,
    setHeaderContext,
    setLinkerContext,
} from './solution-outline-utils';
import { CTreeItem } from '../../../generic/tree-item';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { parseYamlToCTreeItem } from '../../../generic/tree-item-yaml-parser';
import { COutlineItem } from './solution-outline-item';
import * as manifest from '../../../manifest';

describe('getMapFilePath', () => {
    let projectDir: string;
    let linkerDir: string;
    let cSolFile: string;

    beforeEach(async () => {
        const tmpDir = os.tmpdir();
        projectDir = fs.mkdtempSync(path.join(tmpDir, 'myProject'));
        cSolFile = `${projectDir}/Blinky.csolution.yml`;

        linkerDir = path.join(projectDir, 'out', 'Blinky', 'Debug');
        fs.mkdirSync(linkerDir, { recursive: true });

        fs.writeFileSync(path.join(linkerDir, 'myFile1.axf.map'), '');
        fs.writeFileSync(path.join(linkerDir, 'myFile2.axf.map'), '');

    });

    afterEach(() => {
        fs.rmSync(projectDir, { recursive: true, force: true });
    });

    it('get linker map file if type map exists', async () => {
        const cbuildContent = `
        build:
          output-dirs:
            outdir: out/Blinky/Debug
          output:
            - type: map
              file: myFile.axf.map`;

        const root = await parseYamlToCTreeItem(cbuildContent);
        const topChild = root?.getChild();
        root!.rootFileName = cSolFile;

        const want = path.join(linkerDir, 'myFile.axf.map');
        const got = getMapFilePath(topChild as CTreeItem);
        expect(got).toEqual(want);
    });

    it('get first linker map file from outdir, if type map does not exist', async () => {
        const cbuildContent = `
        build:
          output-dirs:
            outdir: out/Blinky/Debug
          output:
            - type: elf
              file: HID.axf`;

        const root = await parseYamlToCTreeItem(cbuildContent);
        const topChild = root?.getChild();
        root!.rootFileName = cSolFile;

        const want = path.join(linkerDir, 'myFile1.axf.map');
        const got = getMapFilePath(topChild as CTreeItem);
        expect(got).toEqual(want);
    });
});

describe('Context utilities', () => {
    let node: COutlineItem;

    beforeEach(() => {
        node = new COutlineItem('testNode');
    });

    it('assigns fileUri and projectUri', () => {
        setContextMenuAttributes(node, '/path/to/file', '/path/to/project.yml');

        expect(node.getAttribute('fileUri')).toBe('/path/to/file');
        expect(node.getAttribute('projectUri')).toBe('/path/to/project.yml');
    });

    it('sets header attributes', () => {
        node.setAttribute('label', 'MyHeaderFile.h');
        setHeaderContext(node);

        expect(node.getAttribute('header')).toBe('MyHeaderFile.h');
    });

    it('should add DOC_CONTEXT feature and set type to docFile', () => {
        setDocContext(node);

        expect(node.getAttribute('type')).toBe('docFile');
        const features = node.getFeatures();
        expect(features).toContain(manifest.DOC_CONTEXT);
    });

    it('sets linker type and resource', () => {
        const addFeatureSpy = jest.spyOn(node, 'addFeature');
        const setAttributeSpy = jest.spyOn(node, 'setAttribute');

        const mapFilePath = '/some/path/to/file.map';
        setLinkerContext(node, mapFilePath);

        expect(addFeatureSpy).toHaveBeenCalledWith(manifest.LINKER_CONTEXT);
        expect(setAttributeSpy).toHaveBeenCalledWith('type', 'linkerMapFile');
        expect(setAttributeSpy).toHaveBeenCalledWith('resourcePath', mapFilePath);
    });

});

describe('findMergeFiles', () => {
    let projectDir: string;
    let localPath: string;

    beforeEach(() => {
        projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'merge-files-'));
        localPath = path.join(projectDir, 'RTX_Config.c');
        fs.writeFileSync(localPath, '');
    });

    afterEach(() => {
        fs.rmSync(projectDir, { recursive: true, force: true });
    });

    it('returns the highest-version update and base siblings', () => {
        fs.writeFileSync(path.join(projectDir, 'RTX_Config.c.update@1.2.0'), '');
        fs.writeFileSync(path.join(projectDir, 'RTX_Config.c.update@1.10.0'), '');
        fs.writeFileSync(path.join(projectDir, 'RTX_Config.c.base@1.2.0'), '');
        fs.writeFileSync(path.join(projectDir, 'RTX_Config.c.base@1.10.0'), '');

        expect(findMergeFiles(localPath)).toEqual({
            update: path.join(projectDir, 'RTX_Config.c.update@1.10.0'),
            base: path.join(projectDir, 'RTX_Config.c.base@1.10.0'),
        });
    });

    it('returns undefined siblings when one side is missing', () => {
        fs.writeFileSync(path.join(projectDir, 'RTX_Config.c.update@1.10.0'), '');

        expect(findMergeFiles(localPath)).toEqual({
            update: undefined,
            base: undefined,
        });
    });

    it('returns undefined siblings when the directory cannot be read', () => {
        const missingLocalPath = path.join(projectDir, 'missing', 'RTX_Config.c');

        expect(findMergeFiles(missingLocalPath)).toEqual({
            update: undefined,
            base: undefined,
        });
    });
});

describe('selectMergeSibling', () => {
    it('returns undefined for an empty list', () => {
        expect(selectMergeSibling([], 'MyComponent.clayer.yml.update@')).toBeUndefined();
    });

    it('selects the highest semver suffix', () => {
        const prefix = 'MyComponent.clayer.yml.update@';
        const fileNames = [
            `${prefix}1.2.0`,
            `${prefix}1.10.0`,
            `${prefix}1.3.0`,
        ];

        expect(selectMergeSibling(fileNames, prefix)).toBe(`${prefix}1.10.0`);
    });

    it('ignores invalid semver suffixes', () => {
        const prefix = 'MyComponent.clayer.yml.update@';
        const fileNames = [
            `${prefix}1.0.0.bak`,
            `${prefix}1.2.0`,
            `${prefix}1.10.0`,
        ];

        expect(selectMergeSibling(fileNames, prefix)).toBe(`${prefix}1.10.0`);
    });

    it('returns undefined when no valid semver suffix exists', () => {
        const prefix = 'MyComponent.clayer.yml.update@';
        const fileNames = [
            `${prefix}1.0.0.bak`,
            `${prefix}latest`,
        ];

        expect(selectMergeSibling(fileNames, prefix)).toBeUndefined();
    });
});
