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

import { FileItemBuilder } from './solution-outline-file-item';
import { parseYamlToCTreeItem } from '../../../generic/tree-item-yaml-parser';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { COutlineItem } from './solution-outline-item';


describe('FileItem', () => {
    let fileItem: FileItemBuilder;
    let projectDir: string;
    let cSolFile: string;
    let componentNode: COutlineItem;

    beforeEach(async () => {
        const tmpDir = os.tmpdir();
        projectDir = fs.mkdtempSync(path.join(tmpDir, 'myProject'));
        cSolFile = `${projectDir}/Blinky.csolution.yml`;

        fileItem = new FileItemBuilder();

        componentNode = new COutlineItem('component');
        componentNode.setTag('component');
        componentNode.setAttribute('label', 'Component X');
        componentNode.setAttribute('local', 'localPath');
        componentNode.setAttribute('update', 'updatePath');
        componentNode.setAttribute('base', 'basePath');

    });

    afterEach(() => {
        fs.rmSync(projectDir, { recursive: true, force: true });
    });

    it('creates file node with merge feature', async () => {
        const cbuildContent = `
        build:
            components:
              - component: ARM::CMSIS:RTOS2:Keil RTX5&Source@5.5.4
                condition: RTOS2 RTX5
                from-pack: ARM::CMSIS@5.9.0
                selected-by: ARM::CMSIS:RTOS2:Keil RTX5&Source
                implements: CMSIS:RTOS2@2.1.3
                files:
                  - file: RTE/CMSIS/RTX_Config.c
                    category: source
                    attr: config
                    version: 5.1.1
                    base: RTE/CMSIS/RTX_Config.c.base@4.0.0
                    update: RTE/CMSIS/RTX_Config.c.update@5.1.1
                    status: update required
                  - file: RTE/CMSIS/RTX_Config.h
                    category: header
                    attr: config
                    version: 5.5.2
                    base: RTE/CMSIS/RTX_Config.h.base@5.5.1
                    update: RTE/CMSIS/RTX_Config.h.update@5.5.2
                    status: update suggested`;

        const root = await parseYamlToCTreeItem(cbuildContent);
        const topChild = root?.getChild();
        root!.rootFileName = cSolFile;

        const children = topChild?.getChildren();
        const grandChildren = children?.[0]?.getChildren();
        const greatGrandChildren = grandChildren?.[0]?.getChildren();

        const files = greatGrandChildren?.[5]?.getChildren();
        expect(files).toBeDefined();
        expect(Array.isArray(files)).toBe(true);
        expect(files!.length).toBe(2);

        // create file nodes
        fileItem.createFileNodes(componentNode, files!);

        // get created children from componentNode
        const createdChildren = componentNode.getChildren();
        expect(createdChildren.length).toBe(2);

        // check attributes and merge features for each file node
        const fileLabels = ['RTX_Config.c', 'RTX_Config.h'];
        const fileStatuses = ["- 'RTX_Config.c' is incompatible. A file update is mandatory.", "- 'RTX_Config.h' has corrections. A file update is suggested."];
        createdChildren.forEach((child, idx) => {
            expect(child.getTag()).toBe('file');
            expect(child.getAttribute('label')).toContain(fileLabels[idx]);
            expect(child.getAttribute('update')).toContain('update');
            expect(child.getAttribute('base')).toContain('base');
            expect(child.getAttribute('description')).toBeUndefined();
            expect(child.getAttribute('tooltip')).toContain(fileStatuses[idx]);
        });

    });
});

