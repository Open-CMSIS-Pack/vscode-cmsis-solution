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
    getMapFilePath,
    setContextMenuAttributes,
    setDocContext,
    setHeaderContext,
    setLinkerContext,
} from './solution-outline-utils';
import { CTreeItem } from '../../../generic/tree-item';
import path from 'path';
import { parseYamlToCTreeItem } from '../../../generic/tree-item-yaml-parser';
import { COutlineItem } from './solution-outline-item';
import * as manifest from '../../../manifest';
import { TestDataHandler } from '../../../__test__/test-data';
import * as fsUtils from '../../../utils/fs-utils';

describe('getMapFilePath', () => {
    const testDataHandler = new TestDataHandler();
    let projectDir: string;
    let linkerDir: string;
    let cSolFile: string;

    beforeEach(async () => {
        testDataHandler.rmTmpDir();
        projectDir = path.join(testDataHandler.tmpDir, 'myProject');
        cSolFile = `${projectDir}/Blinky.csolution.yml`;

        linkerDir = path.join(projectDir, 'out', 'Blinky', 'Debug');
        fsUtils.writeTextFile(path.join(linkerDir, 'myFile1.axf.map'));
        fsUtils.writeTextFile(path.join(linkerDir, 'myFile2.axf.map'));

    });

    afterAll(() => {
        testDataHandler.dispose();
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

