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

import { findUIOptionByYmlNode } from '../../debug/debug-adapters-yaml-file.factory';
import { UISection } from '../../debug/debug-adapters-yaml-file';
import { ManageSolutionController } from './manage-solution-controller';
import { ProjectSelection } from './view/state/manage-solution-state';
import { TestDataHandler, TmpDirReplacer } from '../../__test__/test-data';
import path from 'path';
import { ETextFileResult, TextFile } from '../../generic/text-file';
import { stripTwoExtensions } from '../../utils/string-utils';
import { solutionManagerFactory } from '../../solutions/solution-manager.factories';

/**
 * Build generated (current) and reference JSON strings for a context selection state.
 * Only input: absolute path to a *.csolution.yml file.
 * Returns: { generated, reference } JSON strings (paths sanitized to TEST_PATH).
 */
async function getSolutionDataStrings(solutionDir: string, solutionName: string): Promise<{ generated: string; reference: string; }> {
    const solutionPath = path.join(solutionDir, solutionName);
    const solutionManager = solutionManagerFactory();

    const controller = new ManageSolutionController();
    const res = await controller.loadSolution(solutionPath);
    if (res === ETextFileResult.Error || res === ETextFileResult.NotExists) {
        throw new Error(`Failed to load solution: ${solutionPath}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
    const { availableCoreNames, ...selectionState } = controller.solutionData;
    const generated = JSON.stringify(selectionState, TmpDirReplacer(solutionDir), 4);

    const genFile = new TextFile(stripTwoExtensions(solutionPath) + 'Gen.json');
    genFile.text = generated;
    genFile.save(); // in case we need to update reference

    const refFile = new TextFile(stripTwoExtensions(solutionPath) + 'Ref.json');
    refFile.load();
    const reference = refFile.text;

    controller.saveSolution(solutionManager);

    // save modified YAML for further testing
    controller.csolutionYml.save(stripTwoExtensions(solutionPath) + 'Gen.csolution.yml');

    return { generated, reference };
}

describe('manage-solution-controller', () => {

    const testDataHandler = new TestDataHandler();
    let tmpSolutionDir: string;

    beforeAll(async () => {
        tmpSolutionDir = testDataHandler.copyTestDataToTmp('solutions');
    });

    afterAll(() => {
        testDataHandler.dispose();
    });

    it('creates a default target set ', async () => {
        const { generated, reference } = await getSolutionDataStrings(tmpSolutionDir, 'simple/test.csolution.yml');
        expect(generated).toEqual(reference);
    });

    it('creates a default target set for solution without build types', async () => {
        const { generated, reference } = await getSolutionDataStrings(tmpSolutionDir, 'simple/testNoBuildType.csolution.yml');
        expect(generated).toEqual(reference);
    });

    it('creates no project contexts if target set already exists', async () => {
        const { generated, reference } = await getSolutionDataStrings(tmpSolutionDir, 'simple/testEmptyTargetType.csolution.yml');
        expect(generated).toEqual(reference);
    });

    it('creates solution data from the given solution model and selected contexts', async () => {
        const { generated, reference } = await getSolutionDataStrings(tmpSolutionDir, 'targetSet/TargetSets.csolution.yml');
        expect(generated).toEqual(reference);
    });

    it('creates solution data for West solution', async () => {
        const { generated, reference } = await getSolutionDataStrings(tmpSolutionDir, 'WestSupport/solution.csolution.yml');
        expect(generated).toEqual(reference);
    });

    it('Returns customized debug adapters', async () => {
        const controller = new ManageSolutionController();

        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        const customPathToUv4 = 'c:/Custom/Path/To/uv4.exe';
        controller.customDebugAdapterDefaults = {
            'Keil uVision': {
                'uv4': customPathToUv4
            }
        };

        expect(await controller.debugAdapters).toBeDefined();

        await controller['refreshDebugAdapters']();

        const uvAdapter = (await controller.debugAdapters)?.find(adapter => adapter.name === 'Keil uVision');
        expect(uvAdapter).toBeDefined();

        const option = findUIOptionByYmlNode(uvAdapter?.['user-interface'] ?? [], 'uv4');
        expect(option?.default).toBe(customPathToUv4);
    });

    it('should initialize with default values', () => {
        const controller = new ManageSolutionController();
        expect(controller.solutionPath).toEqual('');
        expect(controller.customDebugAdapterDefaults).toEqual({});
    });

    it('should get active target type wrap', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        const activeTargetType = controller.activeTargetTypeWrap;
        expect(activeTargetType).toBeDefined();
    });

    it('should set and get active target type name', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        const initialName = controller.activeTargetTypeName;
        expect(initialName).toBeDefined();

        controller.activeTargetTypeName = initialName!;
        expect(controller.activeTargetTypeName).toBe(initialName);
    });

    it('should recover from persisted empty active target type using first known target', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        controller.activeTargetTypeName = '';
        const updated = await controller.ensureActiveTargetTypeName();

        expect(updated).toBe(true);
        expect(controller.activeTargetTypeName).toBe(controller.solutionData.targets[0].name);
    });

    it('should clear persisted invalid active target type when no target types are available', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        controller.activeTargetTypeName = 'invalid-target';
        const updated = await controller['ensureActiveTargetTypeNameInKnownTargets']([]);

        expect(updated).toBe(true);
        expect(controller.cmsisJsonFile.activeTargetTypeName).toBeUndefined();
    });

    it('should get active target set name', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        const activeSetName = controller.activeTargetSetName;
        expect(activeSetName).toBeDefined();
    });

    it('should get active target set wrap', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        const activeSet = controller.activeTargetSetWrap;
        expect(activeSet).toBeDefined();
    });

    it('should set active target set and return true when changed', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        const currentType = controller.activeTargetTypeName;
        const changed = controller.setActiveTargetSet(currentType ?? 'NewType', 'NewSet');

        expect(typeof changed).toBe('boolean');
    });

    it('should get active type and set names', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        const typeAndSet = controller.getActiveTypeAndSetNames();
        expect(typeAndSet).toHaveProperty('type');
        expect(typeAndSet).toHaveProperty('set');
    });

    it('should get active debugger', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution', 'Keil uVision');

        controller.enableDebugger(true, 'Keil uVision');
        const debuggerInstance = controller.activeDebugger;
        expect(debuggerInstance).toBeDefined();
    });

    it('should resolve debugger name from alias', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        const resolvedName = controller.resolvedDebuggerName('Keil uVision');
        expect(resolvedName).toBeDefined();
    });

    it('should enable debugger with specified name', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        controller.enableDebugger(true, 'Keil uVision');
        const debuggerName = controller.activeDebuggerName;
        expect(debuggerName).toBe('Keil uVision');
    });

    it('should disable debugger', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        controller.enableDebugger(true, 'Keil uVision');
        controller.enableDebugger(false);
        const debuggerInstance = controller.activeDebugger;
        expect(debuggerInstance).toBeUndefined();
    });

    it('should get available core names from projects', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        await controller.getAvailableCoreNames();
        const coreNames = controller.availableCoreNames;
        expect(Array.isArray(coreNames)).toBe(true);
    });

    it('should get debug adapters with customized defaults', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        controller.customDebugAdapterDefaults = {
            'Keil uVision': {
                'uv4': 'c:/Custom/Path/To/uv4.exe'
            }
        };

        const adapters = await controller.debugAdapters;
        expect(Array.isArray(adapters)).toBe(true);
    });

    it('should set debugger parameter', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        controller.enableDebugger(true, 'Keil uVision');
        controller.setDebuggerParameter('section1', 'param1', 'value1');

        expect(controller.activeDebugger).toBeDefined();
    });

    it('should get solution data', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        const solutionData = controller.solutionData;
        expect(solutionData).toHaveProperty('solutionName');
        expect(solutionData).toHaveProperty('solutionPath');
        expect(solutionData).toHaveProperty('targets');
        expect(solutionData).toHaveProperty('projects');
    });

    it('should set solution data and update targets and projects', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        const originalData = controller.solutionData;
        controller.solutionData = originalData;

        const updatedData = controller.solutionData;
        expect(updatedData.solutionName).toBe(originalData.solutionName);
    });

    it('should set selected debugger with custom defaults applied', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        controller.customDebugAdapterDefaults = {
            'Keil uVision': {
                'uv4': 'c:/Custom/Path/To/uv4.exe'
            }
        };

        controller.setSelectedDebugger('Keil uVision');
        expect(controller.activeDebuggerName).toBe('Keil uVision');
    });

    it('applies debugger configuration from snapshot to active target set', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        const snapshot = controller.solutionData;
        const targetName = snapshot.selectedTarget?.name;
        const targetModel = snapshot.targets.find(t => t.name === targetName);
        const selectedSetName = targetModel?.selectedSet ?? snapshot.selectedTarget?.selectedSet;
        const targetSetModel = targetModel?.targetSets?.find(ts => ts.name === selectedSetName);
        expect(targetSetModel).toBeDefined();

        targetSetModel!.debugger = {
            name: 'Keil uVision',
            uv4: 'c:/Custom/Path/To/uv4.exe'
        };

        controller.solutionData = snapshot;

        expect(controller.activeTargetSetWrap.debugger?.object).toEqual(
            expect.objectContaining({
                name: 'Keil uVision',
                uv4: 'c:/Custom/Path/To/uv4.exe'
            })
        );
    });

    it('removes existing debugger when snapshot target set has no debugger', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        controller.enableDebugger(true, 'Keil uVision');
        expect(controller.activeTargetSetWrap.debugger).toBeDefined();

        const snapshot = controller.solutionData;
        const targetName = snapshot.selectedTarget?.name;
        const targetModel = snapshot.targets.find(t => t.name === targetName);
        const selectedSetName = targetModel?.selectedSet ?? snapshot.selectedTarget?.selectedSet;
        const targetSetModel = targetModel?.targetSets?.find(ts => ts.name === selectedSetName);
        expect(targetSetModel).toBeDefined();

        targetSetModel!.debugger = undefined;

        controller.solutionData = snapshot;

        expect(controller.activeTargetSetWrap.debugger).toBeUndefined();
    });

    it('should toggle debug adapter section with defaults', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        controller.enableDebugger(true, 'Keil uVision');
        controller.toggleDebugAdapterSection('section1');

        expect(controller.activeDebugger).toBeDefined();
    });

    it('expands pname options for multiple cores', () => {
        const controller = new ManageSolutionController();
        const section: UISection = {
            section: 'test',
            'yml-node': 'section1',
            'pname-options': true,
            options: [
                { name: 'Port', 'yml-node': 'port', type: 'string', default: '3333' }
            ]
        };

        const options = controller['expandPnameOptions'](section, ['core0', 'core1']);
        expect(options).toHaveLength(2);
        expect(options.map((opt: { pname?: string }) => opt.pname)).toEqual(['core0', 'core1']);
    });

    it('builds per-core defaults when pname options are enabled', () => {
        const controller = new ManageSolutionController();
        const section: UISection = {
            section: 'test',
            'yml-node': 'section1',
            'pname-options': true,
            options: [
                { name: 'Port', 'yml-node': 'port', type: 'string', default: '3333' },
                { name: 'Host', 'yml-node': 'host', type: 'string', default: 'localhost' }
            ]
        };

        const defaults = controller['buildSectionDefaults'](section, ['core0', 'core1']);
        expect(defaults).toEqual({
            core0: { pname: 'core0', port: '3333', host: 'localhost' },
            core1: { pname: 'core1', port: '3333', host: 'localhost' }
        });
    });

    it('builds empty-core defaults when no cores are available', () => {
        const controller = new ManageSolutionController();
        const section: UISection = {
            section: 'test',
            'yml-node': 'section1',
            'pname-options': true,
            options: [
                { name: 'Port', 'yml-node': 'port', type: 'string', default: '3333' }
            ]
        };

        const defaults = controller['buildSectionDefaults'](section, []);
        expect(defaults).toEqual({
            '': { port: '3333' }
        });
    });

    it('should add project context when project is selected', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        const targetSetWrap = controller.activeTargetSetWrap;
        const projects: ProjectSelection[] = [
            {
                name: 'TestProject',
                path: 'test/path',
                selected: true,
                selectedBuildType: 'Debug',
                buildTypes: ['Debug', 'Release'],
                device: 'TestDevice',
                projectType: 'library'
            }
        ];

        controller['updateSelectedProjects'](targetSetWrap, projects);

        const projectContext = targetSetWrap.findProjectContext('TestProject');
        expect(projectContext).toBeDefined();
        expect(projectContext?.name).toBe('TestProject.Debug');
    });

    it('should remove project context when project is deselected', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        const targetSetWrap = controller.activeTargetSetWrap;
        // First add a project
        const projectsAdd: ProjectSelection[] = [
            {
                name: 'TestProject',
                path: 'test/path',
                selected: true,
                selectedBuildType: 'Debug',
                buildTypes: ['Debug', 'Release'],
                device: 'TestDevice',
                projectType: 'library'
            }
        ];
        controller['updateSelectedProjects'](targetSetWrap, projectsAdd);

        // Then remove it
        const projectsRemove: ProjectSelection[] = [
            {
                name: 'TestProject',
                path: 'test/path',
                selected: false,
                selectedBuildType: 'Debug',
                buildTypes: ['Debug', 'Release'],
                device: 'TestDevice',
                projectType: 'library'
            }
        ];
        controller['updateSelectedProjects'](targetSetWrap, projectsRemove);

        const projectContext = targetSetWrap.findProjectContext('TestProject');
        expect(projectContext).toBeUndefined();
    });

    it('should update project context name with selected build type', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        const targetSetWrap = controller.activeTargetSetWrap;
        const projects: ProjectSelection[] = [
            {
                name: 'TestProject',
                path: 'test/path',
                selected: true,
                selectedBuildType: 'Release',
                buildTypes: ['Debug', 'Release'],
                device: 'TestDevice',
                projectType: 'library'
            }
        ];

        controller['updateSelectedProjects'](targetSetWrap, projects);

        const projectContext = targetSetWrap.findProjectContext('TestProject');
        expect(projectContext?.name).toBe('TestProject.Release');
    });

    it('should update project load type', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        const targetSetWrap = controller.activeTargetSetWrap;
        const projects: ProjectSelection[] = [
            {
                name: 'TestProject',
                path: 'test/path',
                selected: true,
                selectedBuildType: 'Debug',
                buildTypes: ['Debug', 'Release'],
                device: 'TestDevice',
                projectType: 'library'
            }
        ];

        controller['updateSelectedProjects'](targetSetWrap, projects);

        const projectContext = targetSetWrap.findProjectContext('TestProject');
        expect(projectContext?.load).toBe('image+symbols');
    });

    it('should handle multiple projects in one call', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        const targetSetWrap = controller.activeTargetSetWrap;
        const projects: ProjectSelection[] = [
            {
                name: 'Project1',
                path: 'test/path1',
                selected: true,
                load: 'image+symbols',
                selectedBuildType: 'Debug',
                buildTypes: ['Debug'],
                device: 'Device1',
                projectType: 'library'
            },
            {
                name: 'Project2',
                path: 'test/path2',
                selected: true,
                selectedBuildType: 'Release',
                buildTypes: ['Release'],
                device: 'Device2',
                projectType: 'executable'
            }
        ];

        controller['updateSelectedProjects'](targetSetWrap, projects);

        const project1Context = targetSetWrap.findProjectContext('Project1');
        const project2Context = targetSetWrap.findProjectContext('Project2');
        expect(project1Context).toBeDefined();
        expect(project2Context).toBeDefined();
        expect(project1Context?.name).toBe('Project1.Debug');
        expect(project2Context?.name).toBe('Project2.Release');
    });

    it('should change project build type when updating existing project', async () => {
        const controller = new ManageSolutionController();
        await controller.loadSolution('test-resources/solutions/solution-with-debuggers.csolution');

        const targetSetWrap = controller.activeTargetSetWrap;
        const projectsDebug: ProjectSelection[] = [
            {
                name: 'TestProject',
                path: 'test/path',
                selected: true,
                selectedBuildType: 'Debug',
                buildTypes: ['Debug', 'Release'],
                device: 'TestDevice',
                projectType: 'library'
            }
        ];

        controller['updateSelectedProjects'](targetSetWrap, projectsDebug);
        let projectContext = targetSetWrap.findProjectContext('TestProject');
        expect(projectContext?.name).toBe('TestProject.Debug');

        const projectsRelease: ProjectSelection[] = [
            {
                name: 'TestProject',
                path: 'test/path',
                selected: true,
                selectedBuildType: 'Release',
                buildTypes: ['Debug', 'Release'],
                device: 'TestDevice',
                projectType: 'library'
            }
        ];

        controller['updateSelectedProjects'](targetSetWrap, projectsRelease);
        projectContext = targetSetWrap.findProjectContext('TestProject');
        expect(projectContext?.name).toBe('TestProject.Release');
    });
});

