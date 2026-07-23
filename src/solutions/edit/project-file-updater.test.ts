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

import * as fs from 'fs-extra';
import * as path from 'node:path';
import { ProjectFileUpdaterImpl } from './project-file-updater';
import { CTreeItemYamlFile } from '../../generic/tree-item-file';
import { ETextFileResult } from '../../generic/text-file';
import { TestDataHandler } from '../../__test__/test-data';
import { UsedItems } from '../../json-rpc/csolution-rpc-client';
import { MockSolutionManager, solutionManagerFactory } from '../../solutions/solution-manager.factories';
import { CSolution } from '../csolution';
import { CTreeItem } from '../../generic/tree-item';


describe('ProjectFileUpdaterImpl', () => {
    let testProject: string;
    let testSolution: string;
    let testLayer: string;
    let testProject1: string;
    let testProject2: string;
    let testLayer1: string;
    let testLayer2: string;
    let csolution: CSolution;
    let usedItems: UsedItems;
    const solutionManager: MockSolutionManager = solutionManagerFactory();
    const testDataHandler = new TestDataHandler();
    let tmpSolutionDir: string;
    const contextDebug = 'project.Debug+TEST_TARGET';
    const contextDebug1 = 'project1.Debug+TEST_TARGET';
    const contextRelease = 'project.Release+TEST_TARGET';

    beforeAll(() => {
        tmpSolutionDir = testDataHandler.copyTestDataToTmp('solutions');
        testSolution = path.join(tmpSolutionDir, 'simple', 'test.csolution.yml');
        testProject = path.join(tmpSolutionDir, 'simple', 'project.cproject.yml');
        testLayer = path.join(tmpSolutionDir, 'simple', 'Board.clayer.yml');
        testProject1 = path.join(tmpSolutionDir, 'multi-project', 'project1', 'project1.cproject.yml');
        testProject2 = path.join(tmpSolutionDir, 'multi-project', 'project2', 'project2.cproject.yml');
        testLayer1 = path.join(tmpSolutionDir, 'multi-project', 'project1', 'Board.clayer.yml');
        testLayer2 = path.join(tmpSolutionDir, 'multi-project', 'project2', 'Board.clayer.yml');
    });

    afterAll(async () => {
        testDataHandler.dispose();
    });


    beforeEach(() => {
        csolution = new CSolution();
        solutionManager.getCsolution.mockReturnValue(csolution as CSolution);
        csolution.clayerYmlRoot = new Map();

        usedItems = {
            success: true,
            components: [],
            packs: []
        };
    });

    it('returns false if file does not exist', async () => {
        const updater = new ProjectFileUpdaterImpl(solutionManager);
        const result = await updater['updateUsedItemsInYmlFile']('not_existing_file.yml', usedItems, true);
        expect(result).toBe(false);
    });

    it('returns false if file exists but has no top item', async () => {
        // Create a file with invalid YAML content
        const invalidFile = path.join(tmpSolutionDir, 'invalid.yml');
        fs.writeFileSync(invalidFile, '');
        const updater = new ProjectFileUpdaterImpl(solutionManager);
        const result = await updater['updateUsedItemsInYmlFile'](invalidFile, usedItems, true);
        expect(result).toBe(false);
    });

    it('updates single project file: removes unused components and packs, adds new ones, and saves', async () => {
        // Prepare usedItems with components and packs for project and layer
        usedItems = {
            success: true,
            components: [
                { id: 'CMSIS:RTOS2:FreeRTOS@10.4.6', selectedCount: 2 },
            ],
            packs: [
                { pack: 'Keil::CMSIS-FreeRTOS', origin: '', selected: true },
            ]
        };

        const updater = new ProjectFileUpdaterImpl(solutionManager);
        let result = await updater.updateUsedItems(contextDebug, testProject, usedItems);
        expect(result).toBe(true);

        // Reload and check file content
        const ymlFile = new CTreeItemYamlFile();
        await ymlFile.load(testProject);
        let top = ymlFile.topItem;
        expect(top).toBeDefined();

        let components = top!.getChild('components');
        expect(components).toBeDefined();
        expect(components!.getChildren().length).toBe(1);
        let c = components?.getChildByValue('component', 'CMSIS:RTOS2:FreeRTOS');
        expect(c?.getValue('component')?.startsWith('CMSIS:RTOS2:FreeRTOS')).toBe(true);
        expect(c?.getValue('instances')).toBe('2');

        let packs = top!.getChild('packs');
        expect(packs).toBeDefined();
        expect(packs!.getChildren().length).toBe(1);
        let pack = packs!.getChildByValue('pack', 'Keil::CMSIS-FreeRTOS');
        expect(pack).toBeDefined();

        // Modify usedItems, now use vendor and modified selected count
        usedItems = {
            success: true,
            components: [
                {
                    id: 'ARM::CMSIS:RTOS2:FreeRTOS',
                    resolvedComponent: { id: 'ARM::CMSIS:RTOS2:FreeRTOS@10.4.7', pack: 'Keil::CMSIS-FreeRTOS@10.4.7' },
                    selectedCount: 3,
                },
                { id: 'CMSIS:CORE', selectedCount: 1 }
            ],
            packs: [
                { pack: 'Keil::CMSIS-FreeRTOS', origin: testProject, selected: true }
            ]
        };

        result = await updater.updateUsedItems(contextDebug, testProject, usedItems);
        expect(result).toBe(true);

        await ymlFile.load(testProject);
        top = ymlFile.topItem;
        expect(top).toBeDefined();

        components = top!.getChild('components');
        expect(components).toBeDefined();
        expect(components!.getChildren().length).toBe(2);
        c = components?.getChildByValue('component', 'CMSIS:RTOS2:FreeRTOS');
        expect(c?.getValue('instances')).toBe('3');
        expect(components?.getChildByValue('component', 'ARM::CMSIS:RTOS2:FreeRTOS')).toBeUndefined();

        packs = top?.getChild('packs');
        expect(packs).toBeDefined();
        expect(packs?.getChildren().length).toBe(1);
        pack = packs?.getChildByValue('pack', 'Keil::CMSIS-FreeRTOS');
        expect(pack).toBeDefined();

        // modify component to be context specific and save the file
        c!.setValue('for-context', contextRelease);
        c!.setValue('instances', '2');
        pack?.setValue('not-for-context', contextDebug);
        const saveResult = await ymlFile.save();
        expect(saveResult).toEqual(ETextFileResult.Success);

        // update again to see if component and pack is added
        usedItems.components[0].options = { explicitVersion: '@>=10.4.0' };
        usedItems.packs[0].pack = 'Keil::CMSIS-FreeRTOS@^10.4.7';

        result = await updater.updateUsedItems(contextDebug, testProject, usedItems);
        expect(result).toBe(true);
        await ymlFile.load(testProject);
        top = ymlFile.topItem;
        expect(top).toBeDefined();

        components = top!.getChild('components');
        expect(components?.getChildren().length).toBe(3);
        c = components?.getChildByValue('component', 'CMSIS:RTOS2:FreeRTOS');
        expect(c?.getValue('instances')).toBe('2');
        expect(components?.indexOfChild(c)).toBe(0);
        c = components?.getChildByValue('component', 'ARM::CMSIS:RTOS2:FreeRTOS@>=10.4.0');
        expect(components?.indexOfChild(c)).toBe(1);
        expect(c?.getValue('instances')).toBe('3');
        expect(c?.getValue('for-context')).toEqual(contextDebug);

        packs = top?.getChild('packs');
        expect(packs).toBeDefined();
        expect(packs?.getChildren().length).toBe(2);

        pack = packs?.getChildByValue('pack', 'Keil::CMSIS-FreeRTOS');
        expect(pack).toBeDefined();

        pack = packs?.getChildByValue('pack', 'Keil::CMSIS-FreeRTOS@^10.4.7');
        expect(pack).toBeDefined();

        // clear all debug
        usedItems = { success: true, components: [], packs: [] };

        result = await updater.updateUsedItems(contextDebug, testProject, usedItems);
        expect(result).toBe(true);
        await ymlFile.load(testProject);
        top = ymlFile.topItem;

        components = top!.getChild('components');
        expect(components).toBeDefined();
        expect(components!.getChildren().length).toBe(1);
        c = components?.getChildByValue('component', 'CMSIS:RTOS2:FreeRTOS');
        expect(c?.getValue('instances')).toBe('2');
        expect(components?.getChildByValue('component', 'ARM::CMSIS:RTOS2:FreeRTOS@>=10.4.0')).toBeUndefined();

        packs = top?.getChild('packs');
        expect(packs).toBeDefined();
        expect(packs?.getChildren().length).toBe(1);

        pack = packs?.getChildByValue('pack', 'Keil::CMSIS-FreeRTOS');
        expect(pack).toBeDefined();

        // change existing component to use vendor
        usedItems = {
            success: true,
            components: [
                {
                    id: 'ARM::CMSIS:RTOS2:FreeRTOS',
                    resolvedComponent: { id: 'ARM::CMSIS:RTOS2:FreeRTOS@10.4.7', pack: 'Keil::CMSIS-FreeRTOS@10.4.7' },
                    selectedCount: 1,
                    options: { explicitVendor: true },
                }
            ],
            packs: [
                { pack: 'Keil::CMSIS-FreeRTOS', origin: testProject, selected: true }
            ]
        };
        result = await updater.updateUsedItems(contextRelease, testProject, usedItems);
        expect(result).toBe(true);
        await ymlFile.load(testProject);
        top = ymlFile.topItem;

        components = top!.getChild('components');
        expect(components).toBeDefined();
        expect(components!.getChildren().length).toBe(1);
        c = components?.getChildByValue('component', 'ARM::CMSIS:RTOS2:FreeRTOS');
        expect(c?.getValue('instances')).toBeUndefined();

        // try to use explicit version without @ prefix
        usedItems.components[0].options = { explicitVersion: '^10.4.0' };
        result = await updater.updateUsedItems(contextRelease, testProject, usedItems);
        expect(result).toBe(true);
        await ymlFile.load(testProject);
        top = ymlFile.topItem;

        components = top!.getChild('components');
        c = components?.getChildByValue('component', 'ARM::CMSIS:RTOS2:FreeRTOS@^10.4.0');
        expect(components?.indexOfChild(c)).toBe(0);

        // clear all Release
        usedItems = { success: true, components: [], packs: [] };
        result = await updater.updateUsedItems(contextRelease, testProject, usedItems);
        expect(result).toBe(true);
        await ymlFile.load(testProject);
        top = ymlFile.topItem;
        components = top!.getChild('components');
        expect(components).toBeUndefined();
        packs = top?.getChild('packs');
        expect(packs).toBeUndefined();
    });

    it('update layer, solution and project files', async () => {
        // Prepare usedItems with components and packs for project and layer
        usedItems = {
            success: true,
            components: [
                { id: 'CMSIS:RTOS2:FreeRTOS@10.4.6', selectedCount: 2 },
                { id: 'ARM::CMSIS-Compiler:CORE', selectedCount: 1, options: { layer: testLayer, explicitVendor: true } }
            ],
            packs: [
                { pack: 'Keil::CMSIS-FreeRTOS@>=10.4.6', origin: testProject, selected: true },
                { pack: 'ARM::CMSIS-Compiler@2.0.0', origin: testLayer, selected: true },
                { pack: 'ARM::RteTest_DFP', origin: testSolution, selected: true },
                { pack: 'MY::DummyPack', origin: testSolution, selected: true, path: './my/dummy/pack' },
            ]
        };

        // load solution
        await csolution.load(testSolution);

        let top = csolution.csolutionYml.topItem;
        expect(top).toBeDefined();
        let packs = top!.getChild('packs');
        expect(packs).toBeDefined();
        expect(packs?.getChildren().length).toBe(1); // packs are written to all files
        let pack = packs?.getChildByValue('pack', 'ARM::RteTest_DFP');
        expect(pack).toBeDefined();

        const updater = new ProjectFileUpdaterImpl(solutionManager);
        let result = await updater.updateUsedItems(contextDebug, testProject, usedItems);
        expect(result).toBe(true);

        // Reload and check file content
        const ymlFile = new CTreeItemYamlFile();
        await ymlFile.load(testSolution);
        top = ymlFile.topItem;
        expect(top).toBeDefined();
        packs = top!.getChild('packs');
        expect(packs).toBeDefined();
        expect(packs?.getChildren().length).toBe(2); // packs are written to all files
        pack = packs?.getChildByValue('pack', 'ARM::RteTest_DFP');
        expect(pack).toBeDefined();
        pack = packs?.getChildByValue('pack', 'MY::DummyPack');
        expect(pack).toBeDefined();
        expect(pack?.getValue('path')).toEqual('my/dummy/pack');

        await ymlFile.load(testProject);
        top = ymlFile.topItem;
        expect(top).toBeDefined();

        let components = top!.getChild('components');
        expect(components).toBeDefined();
        expect(components!.getChildren().length).toBe(1);
        let c = components?.getChildByValue('component', 'CMSIS:RTOS2:FreeRTOS');
        expect(c?.getValue('component')?.startsWith('CMSIS:RTOS2:FreeRTOS')).toBe(true);
        expect(c?.getValue('instances')).toBe('2');

        packs = top!.getChild('packs');
        expect(packs).toBeDefined();
        expect(packs!.getChildren().length).toBe(1);
        pack = packs!.getChildByValue('pack', 'Keil::CMSIS-FreeRTOS@>=10.4.6');
        expect(pack).toBeDefined();

        // Modify usedItems, now add component to project
        usedItems.components.push({ id: 'CMSIS:CORE', selectedCount: 1 });

        result = await updater.updateUsedItems(contextDebug, testProject, usedItems);
        expect(result).toBe(true);

        await ymlFile.load(testProject);
        top = ymlFile.topItem;
        expect(top).toBeDefined();

        components = top!.getChild('components');
        expect(components).toBeDefined();
        expect(components!.getChildren().length).toBe(2);
        c = components?.getChildByValue('component', 'CMSIS:RTOS2:FreeRTOS');
        expect(c?.getValue('instances')).toBe('2');
        c = components?.getChildByValue('component', 'CMSIS:CORE');
        expect(c).toBeDefined();
        expect(c?.getValue('instances')).toBeUndefined();

        await ymlFile.load(testLayer);
        top = ymlFile.topItem;
        expect(top).toBeDefined();

        components = top!.getChild('components');
        expect(components?.getChildren().length).toBe(1);
        c = components?.getChildByValue('component', 'ARM::CMSIS-Compiler:CORE');
        expect(components?.indexOfChild(c)).toBe(0);
        c = components?.getChildByValue('component', 'CMSIS:CORE');
        expect(components?.indexOfChild(c)).toBe(-1);

        packs = top!.getChild('packs');
        expect(packs).toBeDefined();
        expect(packs!.getChildren().length).toBe(1);
        pack = packs!.getChildByValue('pack', 'ARM::CMSIS-Compiler@2.0.0');
        expect(pack).toBeDefined();

        // move component to a layer
        usedItems.components[2].options = { layer: testLayer };
        usedItems.packs[2].origin = testLayer;
        result = await updater.updateUsedItems(contextDebug, testProject, usedItems);
        expect(result).toBe(true);
        await ymlFile.load(testProject);
        top = ymlFile.topItem;
        expect(top).toBeDefined();

        components = top!.getChild('components');
        expect(components?.getChildren().length).toBe(1);
        c = components?.getChildByValue('component', 'CMSIS:RTOS2:FreeRTOS');
        expect(c?.getValue('instances')).toBe('2');
        expect(components?.indexOfChild(c)).toBe(0);
        c = components?.getChildByValue('component', 'CMSIS:CORE');
        expect(c).toBeUndefined();
        expect(components?.indexOfChild(c)).toBe(-1);

        await ymlFile.load(testLayer);
        top = ymlFile.topItem;
        expect(top).toBeDefined();

        components = top!.getChild('components');
        expect(components?.getChildren().length).toBe(2);
        c = components?.getChildByValue('component', 'ARM::CMSIS-Compiler:CORE');
        expect(components?.indexOfChild(c)).toBe(0);
        c = components?.getChildByValue('component', 'CMSIS:CORE');
        expect(components?.indexOfChild(c)).toBe(1);

        packs = top!.getChild('packs');
        expect(packs).toBeDefined();
        expect(packs!.getChildren().length).toBe(2);
        pack = packs!.getChildByValue('pack', 'ARM::RteTest_DFP');
        expect(pack).toBeDefined();


        // clear all Debug: no context specific components =>  project, solution  and layer are cleared
        usedItems = { success: true, components: [], packs: [] };

        result = await updater.updateUsedItems(contextDebug, testProject, usedItems);
        expect(result).toBe(true);
        await ymlFile.load(testProject);
        top = ymlFile.topItem;
        components = top!.getChild('components');
        expect(components).toBeUndefined();
        packs = top?.getChild('packs');
        expect(packs).toBeUndefined();

        await ymlFile.load(testLayer);
        top = ymlFile.topItem;
        components = top!.getChild('components');
        expect(components).toBeUndefined();
        packs = top?.getChild('packs');
        expect(packs).toBeUndefined();

        await ymlFile.load(testSolution);
        top = ymlFile.topItem;
        packs = top?.getChild('packs');
        expect(packs).toBeUndefined();
    });

    it('updates first project and its layer in multi-project solution', async () => {
        const multiProjectDir = path.join(tmpSolutionDir, 'multi-project');
        const multiSolution = path.join(multiProjectDir, 'test.csolution.yml');
        const project2File = new CTreeItemYamlFile(testProject2);
        const layer2File = new CTreeItemYamlFile(testLayer2);
        let unchangedResult = await project2File.load();
        expect(unchangedResult).toBe(ETextFileResult.Success);
        unchangedResult = await layer2File.load();
        expect(unchangedResult).toBe(ETextFileResult.Success);

        await csolution.load(multiSolution);
        csolution.clayerYmlRoot = new Map([
            [testLayer1, new CTreeItem()],
            [testLayer2, new CTreeItem()],
        ]);

        usedItems = {
            success: true,
            components: [
                { id: 'CMSIS:CORE', selectedCount: 1 },
                { id: 'ARM::CMSIS-Compiler:CORE', selectedCount: 2, options: { layer: testLayer1, explicitVendor: true } },
            ],
            packs: [
                { pack: 'ARM::RteTest_DFP', origin: multiSolution, selected: true },
                { pack: 'MY::DummyPack', origin: multiSolution, selected: true, path: './my/dummy/pack' },
                { pack: 'Keil::CMSIS-FreeRTOS@>=10.4.6', origin: testProject1, selected: true },
                { pack: 'ARM::CMSIS-Compiler@2.0.0', origin: testLayer1, selected: true },
            ]
        };

        const updater = new ProjectFileUpdaterImpl(solutionManager);
        const result = await updater.updateUsedItems(contextDebug1, testProject1, usedItems);
        expect(result).toBe(true);

        const ymlFile = new CTreeItemYamlFile();
        await ymlFile.load(multiSolution);
        let top = ymlFile.topItem;
        expect(top).toBeDefined();

        let packs = top!.getChild('packs');
        expect(packs).toBeDefined();
        expect(packs!.getChildren().length).toBe(2);
        expect(packs!.getChildByValue('pack', 'ARM::RteTest_DFP')).toBeDefined();
        expect(packs!.getChildByValue('pack', 'MY::DummyPack')?.getValue('path')).toEqual('my/dummy/pack');

        await ymlFile.load(testProject1);
        top = ymlFile.topItem;
        expect(top).toBeDefined();
        let components = top!.getChild('components');
        expect(components).toBeDefined();
        expect(components!.getChildren().length).toBe(1);
        expect(components!.getChildByValue('component', 'CMSIS:CORE')).toBeDefined();
        packs = top!.getChild('packs');
        expect(packs).toBeDefined();
        expect(packs!.getChildren().length).toBe(1);
        expect(packs!.getChildByValue('pack', 'Keil::CMSIS-FreeRTOS@>=10.4.6')).toBeDefined();

        await ymlFile.load(testLayer1);
        top = ymlFile.topItem;
        expect(top).toBeDefined();
        components = top!.getChild('components');
        expect(components).toBeDefined();
        expect(components!.getChildren().length).toBe(1);
        expect(components!.getChildByValue('component', 'ARM::CMSIS-Compiler:CORE')).toBeDefined();
        packs = top!.getChild('packs');
        expect(packs).toBeDefined();
        expect(packs!.getChildren().length).toBe(1);
        expect(packs!.getChildByValue('pack', 'ARM::CMSIS-Compiler@2.0.0')).toBeDefined();

        unchangedResult = await project2File.load();
        expect(unchangedResult).toBe(ETextFileResult.Unchanged);
        unchangedResult = await layer2File.load();
        expect(unchangedResult).toBe(ETextFileResult.Unchanged);

        await ymlFile.load(testProject2);
        top = ymlFile.topItem;
        expect(top).toBeDefined();
        components = top!.getChild('components');
        expect(components).toBeDefined();
        expect(components!.getChildren().length).toBe(1);
        expect(components!.getChildByValue('component', 'CORE')).toBeDefined();
        packs = top!.getChild('packs');
        expect(packs).toBeUndefined();

        await ymlFile.load(testLayer2);
        top = ymlFile.topItem;
        expect(top).toBeDefined();
        components = top!.getChild('components');
        expect(components).toBeDefined();
        expect(components!.getChildren().length).toBe(1);
        expect(components!.getChildByValue('component', 'CMSIS:RTOS2:FreeRTOS')).toBeDefined();
        packs = top!.getChild('packs');
        expect(packs).toBeDefined();
        expect(packs!.getChildren().length).toBe(1);
        expect(packs!.getChildByValue('pack', 'Keil::CMSIS-FreeRTOS@>=10.4.0')).toBeDefined();
    });


    it('returns false if save fails', async () => {
        // Patch CTreeItemYamlFile.save to simulate failure
        const fileCopy = path.join(tmpSolutionDir, 'simple', 'test-fail-save.csolution.yml');
        fs.copyFileSync(testProject, fileCopy);

        const updater = new ProjectFileUpdaterImpl(solutionManager);
        const origSave = CTreeItemYamlFile.prototype.save;
        CTreeItemYamlFile.prototype.save = async () => ETextFileResult.Error;

        const result = await updater.updateUsedItems('foo', fileCopy, usedItems);
        expect(result).toBe(false);

        // Restore
        CTreeItemYamlFile.prototype.save = origSave;
    });
});
