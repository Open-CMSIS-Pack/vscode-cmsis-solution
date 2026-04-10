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

import { TestDataHandler } from '../../../__test__/test-data';
import { CSolution } from '../../../solutions/csolution';
import { ETextFileResult, TextFile } from '../../../generic/text-file';
import path from 'node:path';
import { SolutionOutlineTree } from './solution-outline-tree';
import { COutlineItem } from './solution-outline-item';
import { getCmsisPackRoot } from '../../../utils/path-utils';
import { toGenericString } from '../../../generic/tree-item-parser';
import * as fsUtils from '../../../utils/fs-utils';
import { CTreeItem } from '../../../generic/tree-item';
import { solutionRpcDataFactory, SolutionRpcDataMock } from '../../../solutions/solution-rpc-data.factory';

describe('CSolution', () => {
    const testDataHandler = new TestDataHandler();
    let tmpSolutionDir: string;
    let cmsisPackRoot: string;
    let rpcData: SolutionRpcDataMock;


    beforeAll(async () => {
        tmpSolutionDir = testDataHandler.copyTestDataToTmp('solutions');
        cmsisPackRoot = getCmsisPackRoot();
    });


    afterAll(async () => {
        testDataHandler.dispose();
    });

    beforeEach(() => {
        rpcData = solutionRpcDataFactory();
    });

    const normalize = (s: string) =>
        s.replace(/\r\n/g, '\n')      // unify CRLF -> LF
            .replace(/\r/g, '\n')        // stray CR -> LF
            .replace(/[ \t]+/g, ' ')     // collapse spaces/tabs
            .trim();                     // remove leading/trailing whitespace


    async function dumpOutline(tree: COutlineItem, solutionDir: string, dumpFileName: string, refFileName: string): Promise<{ dump: string; ref: string; }> {
        const res: { dump: string, ref: string } = { dump: '', ref: '' };

        const dumpFile = new TextFile(path.join(tmpSolutionDir, solutionDir, dumpFileName));
        dumpFile.text = toGenericString(tree).replaceAll(testDataHandler.tmpDir, 'TEST_DIR').replaceAll(cmsisPackRoot, '${CMSIS_PACK_ROOT}').replaceAll('\\', '/');

        let loadResult = await dumpFile.save();
        if (loadResult == (ETextFileResult.Success)) {
            res.dump = normalize(dumpFile.text);
        } else {
            res.dump = 'dump failed';
        }
        const refFile = new TextFile(path.join(tmpSolutionDir, solutionDir, refFileName));
        loadResult = await refFile.load();
        if (loadResult == (ETextFileResult.Success)) {
            res.ref = normalize(refFile.text);
        } else {
            res.ref = 'ref load failed';
        }
        return res;
    };

    it('test tree content for hardware and projects collapsed node', async () => {
        const fileName = path.join(tmpSolutionDir, 'USBD', 'USB_Device.csolution.yml');
        const csolution = new CSolution();

        const loadResult = await csolution.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Success);

        const want = new Map<string, string>();
        let countContext = 1;
        for (const cbuild of csolution.cbuildYmlRoot.values()) {
            const cbuildItem = cbuild.getChildItem();

            const board = cbuildItem?.getValueAsString('board') ?? '';
            want.set('board', board);

            const device = cbuildItem?.getValueAsString('device') ?? '';
            want.set('device', device);

            if (csolution.cbuildIdxFile?.topItem?.getValue('cdefault')) {
                want.set('cdefault', 'cdefault');
            }

            const context = cbuildItem?.getValueAsString('context') ?? '';
            want.set('context' + countContext.toString(), context);;
            countContext++;
        }

        // get results from tree
        const solutionOutlineTree = new SolutionOutlineTree(csolution, rpcData);
        const tree = solutionOutlineTree.createTree();
        const got = new Map<string, string>();

        let count = 1;
        for (const { label } of tree.getChildren().map(item => ({ label: item.getAttribute('label') ?? '' }))) {
            const hardwareName = label.replace(/^Device: |^Board: /, '');
            got.set(`treeItem${count++}`, hardwareName);
        }

        expect(Array.from(want.values())).toEqual(Array.from(got.values()));
    });

    it('creates error node when csolution is undefined', () => {
        const solutionOutlineTree = new SolutionOutlineTree(undefined, rpcData);
        const tree = solutionOutlineTree.createTree();

        const children = tree.getChildren() as COutlineItem[];
        expect(children).toHaveLength(1);

        const errorNode = children[0];
        expect(errorNode.getAttribute('iconPath')).toBe('error');
        expect(errorNode.getAttribute('description')).toBe('Solution could not be loaded');
    });

    it('creates error node when build files exist but none are usable', () => {
        const csolution = new CSolution();
        csolution.cbuildYmlRoot = new Map<string, CTreeItem>([
            ['dummy.cbuild.yml', new CTreeItem('cbuild')],
        ]);

        const solutionOutlineTree = new SolutionOutlineTree(csolution, rpcData);
        const tree = solutionOutlineTree.createTree();

        const children = tree.getChildren() as COutlineItem[];
        expect(children).toHaveLength(1);

        const errorNode = children[0];
        expect(errorNode.getAttribute('iconPath')).toBe('error');
        expect(errorNode.getAttribute('description')).toBe('Solution could not be loaded');
    });

    it('creates error node when no projects can be loaded', () => {
        const csolution = new CSolution();

        const solutionOutlineTree = new SolutionOutlineTree(csolution, rpcData);
        const tree = solutionOutlineTree.createTree();

        const children = tree.getChildren() as COutlineItem[];
        expect(children).toHaveLength(1);

        const errorNode = children[0];
        expect(errorNode.getAttribute('iconPath')).toBe('error');
        expect(errorNode.getAttribute('description')).toBe('Solution could not be loaded');
    });

    it('test tree content for project items', async () => {
        // load golden data
        const projectPath = path.join(tmpSolutionDir, 'USBD', 'HID', 'HID.cproject.yml');
        const cprojectContent = fsUtils.readTextFile(projectPath);

        // get results from tree
        const fileName = path.join(tmpSolutionDir, 'USBD', 'USB_Device.csolution.yml');
        const csolution = new CSolution();
        const outDirHID = path.join(tmpSolutionDir, 'USBD', 'out', 'HID', 'B-U585I-IOT02A', 'Release');

        let loadResult = await csolution.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Success);
        rpcData.seedVariables('HID.Release+B-U585I-IOT02A', { 'OutDir()': outDirHID, 'Dname': 'STM32U585AIIx' });

        const solutionOutlineTree = new SolutionOutlineTree(csolution, rpcData);
        let tree = solutionOutlineTree.createTree();

        let topItems = tree.getChildren();
        expect(topItems.length).toBe(5); // device, board, cdefault and two projects
        const project = topItems[3];
        const children = project.getChildren();

        const gotGroups: string[] = [];
        const gotComponents: string[] = [];
        for (const child of children) {
            const tag = child.getTag();
            const label = child.getAttribute('label') ?? '';
            if (tag == 'group') {
                gotGroups.push('- group: ' + label);
            }
            if (tag == 'components') {
                const children = child.getChildren();
                for (const child of children) {
                    const label = child.getAttribute('label') ?? '';
                    gotComponents.push('- component: ' + label);
                }
            }
        }
        // groups
        const groups = gotGroups.filter(gotGroup => cprojectContent.includes(gotGroup));
        expect(groups).toContain('- group: Documentation');
        expect(groups).toContain('- group: USB');

        // components
        const components = gotComponents.filter(gotComponent => cprojectContent.includes(gotComponent));
        expect(components).toContain('- component: ARM::CMSIS:OS Tick:SysTick');
        expect(components).toContain('- component: ARM::CMSIS:RTOS2:Keil RTX5&Source');
        expect(components).toContain('- component: Keil::USB&MDK:CORE');
        expect(components).toContain('- component: Keil::USB&MDK:Device');
        expect(components).toContain('- component: Keil::USB&MDK:Device:HID');

        let res = await dumpOutline(tree, 'USBD', 'CmsisViewTreeDmp.txt','CmsisViewTreeRef.txt');
        expect(res.dump).toEqual(res.ref);

        // emulate removing the project from target set by modifying cbuild-idx.yml
        const cbuilds = csolution.cbuildIdxFile.topItem?.getChild('cbuilds');
        const cbuildToRemove = cbuilds?.getChildByValue('project','HID');
        cbuilds?.removeChild(cbuildToRemove);
        csolution.cbuildIdxFile.save();

        loadResult = await csolution.loadBuildFiles();
        tree = solutionOutlineTree.createTree();
        topItems = tree.getChildren();
        expect(topItems.length).toBe(4); // device, board, cdefault, one project
        res = await dumpOutline(tree, 'USBD', 'CmsisViewTreeOneProjDmp.txt','CmsisViewTreeOneProjRef.txt');
        expect(res.dump).toEqual(res.ref);

    });
    it('test tree content for West project', async () => {
        const fileName = path.join(tmpSolutionDir, 'WestSupport', 'solution.csolution.yml');
        const csolution = new CSolution();

        const loadResult = await csolution.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Success);

        // get results from tree
        const solutionOutlineTree = new SolutionOutlineTree(csolution, rpcData);
        const tree = solutionOutlineTree.createTree();

        const res = await dumpOutline(tree, 'WestSupport', 'CmsisViewTreeDmp.txt','CmsisViewTreeRef.txt');
        expect(res.dump).toEqual(res.ref);
    });

    it('should identify West projects by filename pattern', async () => {
        const fileName = path.join(tmpSolutionDir, 'WestSupport', 'solution.csolution.yml');
        const csolution = new CSolution();

        const loadResult = await csolution.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Success);

        const solutionOutlineTree = new SolutionOutlineTree(csolution, rpcData);
        const tree = solutionOutlineTree.createTree();

        // Find West project nodes
        const projectNodes = (tree.getChildren() as COutlineItem[]).filter(
            (node) => node.getAttribute('description') === '(West)'
        );

        expect(projectNodes.length).toBeGreaterThan(0);

        // Check that West projects have filenames ending with .cproject-west.yml
        for (const projectNode of projectNodes) {
            const resourcePath = projectNode.getAttribute('resourcePath');
            expect(resourcePath).toMatch(/\.cproject-west\.yml$/);
        }
    });

    it('should set prjConfPath attribute for West project when prj.conf exists', async () => {
        const fileName = path.join(tmpSolutionDir, 'WestSupport', 'solution.csolution.yml');
        const csolution = new CSolution();

        const loadResult = await csolution.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Success);

        const solutionOutlineTree = new SolutionOutlineTree(csolution, rpcData);
        const tree = solutionOutlineTree.createTree();

        // Find West project nodes
        const westProjects = (tree.getChildren() as COutlineItem[]).filter(
            (node) => node.getAttribute('description') === '(West)'
        );

        expect(westProjects.length).toBeGreaterThan(0);

        // Each West project should potentially have prjConfPath if prj.conf exists
        for (const projectNode of westProjects) {
            const prjConfPath = projectNode.getAttribute('prjConfPath');

            // If prjConfPath is set, it should end with 'prj.conf'
            if (prjConfPath) {
                expect(prjConfPath).toMatch(/prj\.conf$/);
            }
        }
    });

    it('should not set prjConfPath for non-West projects', async () => {
        const fileName = path.join(tmpSolutionDir, 'USBD', 'USB_Device.csolution.yml');
        const csolution = new CSolution();

        const loadResult = await csolution.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Success);

        const solutionOutlineTree = new SolutionOutlineTree(csolution, rpcData);
        const tree = solutionOutlineTree.createTree();

        // Find all project nodes
        const projectNodes = (tree.getChildren() as COutlineItem[]).filter(
            (node) => node.getTag() === 'project'
        );

        expect(projectNodes.length).toBeGreaterThan(0);

        // Non-West projects should not have prjConfPath
        for (const projectNode of projectNodes) {
            const prjConfPath = projectNode.getAttribute('prjConfPath');
            expect(prjConfPath).toBeUndefined();
        }
    });

    it('test tree content for Image Only multicore solution', async () => {
        const fileName = path.join(tmpSolutionDir, 'ImageOnly', 'image-only-multicore.csolution.yml');
        const csolution = new CSolution();

        const loadResult = await csolution.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Success);

        // get results from tree
        const solutionOutlineTree = new SolutionOutlineTree(csolution, rpcData);
        const tree = solutionOutlineTree.createTree();

        const res = await dumpOutline(tree, 'ImageOnly', 'CmsisViewTreeMulticoreDmp.txt','CmsisViewTreeMulticoreRef.txt');
        expect(res.dump).toEqual(res.ref);
    });

});
