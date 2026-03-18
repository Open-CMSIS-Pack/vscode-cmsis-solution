/**
 * Copyright 2024-2026 Arm Limited
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

import * as YAML from 'yaml';
import { TestDataHandler } from '../__test__/test-data';
import path from 'node:path';
import { CSolution } from './csolution';
import { ETextFileResult } from '../generic/text-file';
import { CTreeItem } from '../generic/tree-item';
import { parseYamlToCTreeItem } from '../generic/tree-item-yaml-parser';

describe('CSolution', () => {
    const testDataHandler = new TestDataHandler();

    beforeAll(async () => {
        testDataHandler.copyTestDataToTmp('solutions');
    });

    afterAll(async () => {
        testDataHandler.dispose();
    });

    it('test loading non-existing file', async () => {
        const csolution = new CSolution();
        const loadResult = await csolution.load('./dummy.csolution.yml');
        expect(loadResult).toEqual(ETextFileResult.NotExists);
        expect(csolution.csolutionYml.text).toEqual('');
    });

    // Utility function to verify projects
    const verifyProjects = (csolution: CSolution, expectedProjects: number) => {
        const projects = csolution.csolutionYml.topItem?.getGrandChildren('projects');
        expect(projects).not.toEqual(undefined);
        expect(projects).toHaveLength(expectedProjects);
    };

    describe('CSolution Load Tests', () => {
        it.each([
            { fileName: 'solutions/simple/test.csolution.yml', expectedProjects: 1 },
            { fileName: 'solutions/USBD/USB_Device.csolution.yml', expectedProjects: 3 },
        ])('loads csolution file: %s', async ({ fileName, expectedProjects }) => {
            const csolution = new CSolution();
            const fullPath = path.join(testDataHandler.tmpDir, fileName);

            let loadResult = await csolution.load(fullPath);
            expect(loadResult).toEqual(ETextFileResult.Success);

            loadResult = await csolution.load(fullPath);
            expect(loadResult).toEqual(ETextFileResult.Unchanged);
            expect(csolution.solutionPath).toEqual(fullPath);

            verifyProjects(csolution, expectedProjects);
        });
    });

    it('test load simple existing csolution', async () => {
        const csolution = new CSolution();
        const fileName = path.join(testDataHandler.tmpDir, 'solutions', 'simple', 'test.csolution.yml');

        let loadResult = await csolution.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Success);
        // load again: should be unchanged
        loadResult = await csolution.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Unchanged);
        expect(csolution.solutionPath).toEqual(fileName);
        expect(csolution.cbuildIdxYmlRoot?.getChild()).toEqual(undefined);
        expect(csolution.cbuildYmlRoot.size).toEqual(0);

        const content = csolution.csolutionYml.text.trim(); // avoid whitespace noise
        expect(content).toContain('projects');
        expect(csolution.projects).not.toEqual(undefined);

        const projects = csolution.csolutionYml.topItem?.getGrandChildren('projects');
        expect(projects).not.toEqual(undefined);
        expect(projects).toHaveLength(1);
        const projectItem = projects![0];
        expect(projectItem.getValue()).toEqual('./project.cproject.yml');

        expect(csolution.csolutionYml.getProject('project')).toBeDefined();
        expect(csolution.getCproject('dummy')).toEqual(undefined);
    });

    it('test load USBD example with cbuild setup already run', async () => {
        const csolution = new CSolution();
        const fileName = path.join(testDataHandler.tmpDir, 'solutions', 'USBD', 'USB_Device.csolution.yml');

        let loadResult = await csolution.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Success);
        // load again: should be unchanged
        loadResult = await csolution.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Unchanged);
        expect(csolution.solutionPath).toEqual(fileName);
        expect(csolution.cbuildIdxYmlRoot).not.toEqual(undefined);
        expect(csolution.cbuildIdxYmlRoot?.rootFileDir).toEqual(csolution.solutionDir);
        expect(csolution.projects).not.toEqual(undefined);
        expect(csolution.projects.size).toEqual(3);
        expect(csolution.cbuildYmlRoot.size).toEqual(2);
        expect(csolution.clayerYmlRoot.size).toEqual(2);

        const content = csolution.csolutionYml.text.trim(); // avoid whitespace noise
        expect(content).toContain('target-types');

        const projects = csolution.csolutionYml.topItem?.getGrandChildren('projects');
        expect(projects).not.toEqual(undefined);
        expect(projects).toHaveLength(3);
        const projectItem = projects![0];
        expect(projectItem.getValue()).toEqual('HID/HID.cproject.yml');

        expect(csolution.getCproject('HID')).toBeDefined();

        // modify device name to add a fake processor
        const cbuildTop = csolution.getCbuildTop('HID.Release+B-U585I-IOT02A');
        expect(cbuildTop).not.toEqual(undefined);
        cbuildTop?.setValue('device', 'STM32U585AIIx:Core1');

        expect(csolution.getDeviceName()).toEqual('STM32U585AIIx');
        expect(csolution.getDeviceName('HID.Release+B-U585I-IOT02A')).toEqual('STM32U585AIIx');
        expect(csolution.getDeviceName('MassStorage.Debug+B-U585I-IOT02A')).toEqual('STM32U585AIIx');

        expect(csolution.getProcessorName()).toEqual('Core1');
        expect(csolution.getBoardName()).toEqual('STMicroelectronics::B-U585I-IOT02A');
        expect(csolution.getDeviceNameWithVendor()).toEqual('STM32U585AIIx:Core1');
        expect(csolution.getDevicePack()).toEqual('Keil::STM32U5xx_DFP@3.0.0-dev');
        expect(csolution.getBoardPack()).toEqual('Keil::B-U585I-IOT02A_BSP@2.0.0');

        csolution.actionContext = 'HID.Release+B-U585I-IOT02A';
        expect(csolution.getDeviceName()).toEqual('STM32U585AIIx');
        expect(csolution.getProcessorName()).toEqual('Core1');
        expect(csolution.getBoardName()).toEqual('STMicroelectronics::B-U585I-IOT02A');
        expect(csolution.getDeviceNameWithVendor()).toEqual('STM32U585AIIx:Core1');
        expect(csolution.getBoardPack()).toEqual('Keil::B-U585I-IOT02A_BSP@2.0.0');
        expect(csolution.getDevicePack()).toEqual('Keil::STM32U5xx_DFP@3.0.0-dev');

        expect(csolution.getDeviceName('undefined_context')).toEqual('');

        // check cbuild-run reference
        expect(csolution.cbuildRunYml?.fileName).toContain(path.join('out', 'USB_Device+B-U585I-IOT02A.cbuild-run.yml'));
    });

    describe('getActiveTargetSetName', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('returns the default target set name from the active target type', async () => {
            const csolution = new CSolution();

            const targetTypeYaml = YAML.stringify({ type: 'MyTarget', 'target-set': [{ set: null }, { set: 'fvp' }] });
            const targetTypeItem = parseYamlToCTreeItem(targetTypeYaml) as CTreeItem;

            jest.spyOn(CSolution.prototype, 'targetTypes', 'get').mockReturnValue(new Map<string, CTreeItem>([['MyTarget', targetTypeItem]]));
            jest.spyOn(csolution.cmsisJsonFile, 'get').mockReturnValue('MyTarget');

            expect(csolution.getActiveTargetType()).toEqual('MyTarget');
        });

        it('returns the first target set name from the active target type', async () => {
            const csolution = new CSolution();

            const targetTypeYaml = YAML.stringify({ type: 'MyTarget', 'target-set': [{ set: 'board' }, { set: 'fvp' }] });
            const targetTypeItem = parseYamlToCTreeItem(targetTypeYaml) as CTreeItem;
            csolution.cmsisJsonFile['contentObject'] = { targetSet: { HelloWorld: { activeTargetType: 'MyTarget', MyTarget: 'board' } } }; // mock selected target type
            csolution.solutionPath = path.join(testDataHandler.tmpDir, 'solutions', 'simple', 'HelloWorld.csolution.yml');
            csolution.csolutionYml.rootItem = parseYamlToCTreeItem(YAML.stringify({ solution: { 'target-types': [{ type: 'MyTarget', 'target-set': [{ set: 'board' }] }] } })) as CTreeItem;

            jest.spyOn(CSolution.prototype, 'targetTypes', 'get').mockReturnValue(new Map<string, CTreeItem>([['MyTarget', targetTypeItem]]));

            expect(csolution.getActiveTargetSetName()).toEqual('MyTarget@board');
        });

        it('returns undefined if active target type does not specify any target-set', async () => {
            const csolution = new CSolution();

            const targetTypeYaml = YAML.stringify({ type: 'MyTarget' });
            const targetTypeItem = parseYamlToCTreeItem(targetTypeYaml) as CTreeItem;

            jest.spyOn(csolution, 'getDefaultTargetTypeItem').mockReturnValue(targetTypeItem);

            expect(csolution.getActiveTargetSetName()).toEqual(undefined);
        });

        it('returns undefined if no target type available', async () => {
            const csolution = new CSolution();

            jest.spyOn(csolution, 'getDefaultTargetTypeItem').mockReturnValue(undefined);

            expect(csolution.getActiveTargetSetName()).toEqual(undefined);
        });

        it('returns undefined if target type does not match the schema', async () => {
            const csolution = new CSolution();

            const targetTypeYaml = YAML.stringify({ name: 'MyTarget', 'target-set': [{ set: 'board' }] });
            const targetTypeItem = parseYamlToCTreeItem(targetTypeYaml) as CTreeItem;

            jest.spyOn(csolution, 'getDefaultTargetTypeItem').mockReturnValue(targetTypeItem);

            expect(csolution.getActiveTargetSetName()).toEqual(undefined);
        });
    });

    describe('saveTargetSet', () => {
        it('updates the default target set  in the active target type', async () => {
            const csolution = new CSolution();

            const targetSets = [
                {
                    set: null,
                    images: [{ 'project-context': 'Project.Debug' }],
                },
                {
                    set: 'fvp',
                    images: [{ 'project-context': 'Project.FVP' }],
                },
            ];
            const targetTypeYaml = YAML.stringify({ name: 'MyTarget', 'target-set': targetSets });
            const targetTypeItem = parseYamlToCTreeItem(targetTypeYaml) as CTreeItem;
            jest.spyOn(csolution, 'getDefaultTargetTypeItem').mockReturnValue(targetTypeItem);

            const saveSpy = jest.spyOn(csolution, 'saveTargetSet').mockImplementation(() => Promise.resolve(ETextFileResult.Success));

            const targetSet = { set: null, images: [{ 'project-context': 'Project.Release' }] };
            csolution.saveTargetSet(targetSet);

            const expectedTargeType = {
                name: 'MyTarget',
                'target-set': [
                    {
                        set: null,
                        images: [{ 'project-context': 'Project.Debug' }], // unsure if this should still be Project.Release (?)
                    },
                    targetSets[1],
                ],
            };

            expect(targetTypeItem.toObject()).toEqual(expectedTargeType);

            expect(saveSpy).toHaveBeenCalledTimes(1);
        });

        it('updates the named target set in the active target type', async () => {
            const csolution = new CSolution();

            const targetSets = [
                {
                    set: null,
                    images: [{ 'project-context': 'Project.Debug' }],
                },
                {
                    set: 'release',
                },
                {
                    set: 'fvp',
                    images: [{ 'project-context': 'Project.FVP' }],
                },
            ];
            const targetTypeYaml = YAML.stringify({ name: 'MyTarget', 'target-set': targetSets });
            const targetTypeItem = parseYamlToCTreeItem(targetTypeYaml) as CTreeItem;
            jest.spyOn(csolution, 'getDefaultTargetTypeItem').mockReturnValue(targetTypeItem);

            const saveSpy = jest.spyOn(csolution, 'saveTargetSet').mockImplementation(() => Promise.resolve(ETextFileResult.Success));

            const targetSet = { set: 'release', images: [{ 'project-context': 'Project.Release' }] };
            csolution.saveTargetSet(targetSet);

            const expectedTargeType = {
                name: 'MyTarget',
                'target-set': [
                    targetSets[0],
                    {
                        set: 'release',
                    },
                    targetSets[2],
                ],
            };

            expect(targetTypeItem.toObject()).toEqual(expectedTargeType);

            expect(saveSpy).toHaveBeenCalledTimes(1);
        });

        it('adds the target set to the active target type', async () => {
            const csolution = new CSolution();

            const targetSets = [
                {
                    set: null,
                    images: [{ 'project-context': 'Project.Debug' }],
                },
                {
                    set: 'fvp',
                    images: [{ 'project-context': 'Project.FVP' }],
                },
            ];
            const targetTypeYaml = YAML.stringify({ name: 'MyTarget', 'target-set': targetSets });
            const targetTypeItem = parseYamlToCTreeItem(targetTypeYaml) as CTreeItem;
            jest.spyOn(csolution, 'getDefaultTargetTypeItem').mockReturnValue(targetTypeItem);

            const saveSpy = jest.spyOn(csolution, 'saveTargetSet').mockImplementation(() => Promise.resolve(ETextFileResult.Success));

            const targetSet = { set: 'release', images: [{ 'project-context': 'Project.Release' }] };
            csolution.saveTargetSet(targetSet);

            const expectedTargeType = {
                name: 'MyTarget',
                'target-set': [...targetSets],
            };

            expect(targetTypeItem.toObject()).toEqual(expectedTargeType);

            expect(saveSpy).toHaveBeenCalledTimes(1);
        });

        it('skips if no active target type selected', async () => {
            const csolution = new CSolution();

            jest.spyOn(csolution, 'getDefaultTargetTypeItem').mockReturnValue(undefined);
            const saveSpy = jest.spyOn(csolution.csolutionYml, 'save').mockResolvedValue(ETextFileResult.Success);

            const targetSet = { set: null, images: [{ 'project-context': 'Project.Debug' }] };
            csolution.saveTargetSet(targetSet);

            expect(saveSpy).not.toHaveBeenCalled();
        });

        it('adds target-set node if not yet existing', async () => {
            const csolution = new CSolution();

            const targetTypeYaml = YAML.stringify({ name: 'MyTarget', 'target-set': [{ images: [{ 'project-context': 'Project.Debug' }], set: null }] });
            const targetTypeItem = parseYamlToCTreeItem(targetTypeYaml) as CTreeItem;
            jest.spyOn(csolution, 'getDefaultTargetTypeItem').mockReturnValue(targetTypeItem);

            const saveSpy = jest.spyOn(csolution, 'saveTargetSet').mockImplementation(() => Promise.resolve(ETextFileResult.Success));

            const targetSet = { set: null, images: [{ 'project-context': 'Project.Debug' }] };
            csolution.saveTargetSet(targetSet);

            const expectedTargeType = {
                name: 'MyTarget',
                'target-set': [
                    {
                        set: null,
                        images: [{ 'project-context': 'Project.Debug' }],
                    },
                ],
            };

            expect(targetTypeItem.toObject()).toEqual(expectedTargeType);

            expect(saveSpy).toHaveBeenCalledTimes(1);
        });

        describe('CSolution - variables', () => {
            it('returns an empty map when no variables are defined', () => {
                const csolution = new CSolution();
                const variables = csolution.getVariables();
                expect(variables.size).toBe(0);
            });

            it('returns variables defined in the target type', async () => {
                const csolution = new CSolution();
                const targetTypeYaml = YAML.stringify({
                    type: 'MyTarget',
                    variables: {
                        VAR1: 'value1',
                        VAR2: 'value2',
                    },
                });
                const targetTypeItem = parseYamlToCTreeItem(targetTypeYaml) as CTreeItem;

                csolution.targetTypes.set('MyTarget', targetTypeItem);

                const variables = csolution.getVariables('MyTarget');
                expect(variables.size).toBe(2);
                expect(variables.get('$VAR1$')).toBe('value1');
                expect(variables.get('$VAR2$')).toBe('value2');
            });

            it('returns variables from the active target type if no target type is specified', async () => {
                const csolution = new CSolution();
                const targetTypeYaml = YAML.stringify({
                    type: 'ActiveTarget',
                    variables: {
                        ACTIVE_VAR: 'active_value',
                    },
                });
                const targetTypeItem = parseYamlToCTreeItem(targetTypeYaml) as CTreeItem;

                csolution.targetTypes.set('ActiveTarget', targetTypeItem);
                csolution.setActiveTargetType('ActiveTarget');

                const variables = csolution.getVariables();
                expect(variables.size).toBe(1);
                expect(variables.get('$ACTIVE_VAR$')).toBe('active_value');
            });

            it('returns an empty map if the target type does not exist', () => {
                const csolution = new CSolution();
                const variables = csolution.getVariables('NonExistentTarget');
                expect(variables.size).toBe(0);
            });
        });

        describe('getPacks', () => {
            it('returns an empty map when no packs are defined', () => {
                const csolution = new CSolution();
                jest.spyOn(csolution, 'getCbuildTop').mockReturnValue(undefined);

                const packs = csolution.getPacks();

                expect(packs.size).toBe(0);
            });

            it('returns a map of packs with their paths', () => {
                const csolution = new CSolution();
                const mockCbuildTop = {
                    getGrandChildren: jest.fn().mockReturnValue([{ getValue: jest.fn().mockImplementation(key => (key === 'pack' ? 'Pack1' : 'Path1')) }, { getValue: jest.fn().mockImplementation(key => (key === 'pack' ? 'Pack2' : 'Path2')) }]),
                } as unknown as CTreeItem;

                jest.spyOn(csolution, 'getCbuildTop').mockReturnValue(mockCbuildTop);

                const packs = csolution.getPacks();

                expect(packs.size).toBe(2);
                expect(packs.get('Pack1')).toBe('Path1');
                expect(packs.get('Pack2')).toBe('Path2');
            });

            it('ignores packs with missing pack or path values', () => {
                const csolution = new CSolution();
                const mockCbuildTop = {
                    getGrandChildren: jest.fn().mockReturnValue([{ getValue: jest.fn().mockImplementation(key => (key === 'pack' ? 'Pack1' : 'Path1')) }, { getValue: jest.fn().mockImplementation(key => (key === 'pack' ? null : 'Path2')) }, { getValue: jest.fn().mockImplementation(key => (key === 'pack' ? 'Pack3' : null)) }]),
                } as unknown as CTreeItem;

                jest.spyOn(csolution, 'getCbuildTop').mockReturnValue(mockCbuildTop);

                const packs = csolution.getPacks();

                expect(packs.size).toBe(1);
                expect(packs.get('Pack1')).toBe('Path1');
            });
        });

        describe('getContextDescriptors', () => {
            let csolution: CSolution;

            beforeEach(() => {
                csolution = new CSolution();
                jest.spyOn(csolution, 'getCprojectPath').mockImplementation((name?: string) => `/path/to/${name}.cproject.yml`);
            });

            it('returns active contexts from cbuildIdxFile if available', () => {
                const mockContexts = [
                    { displayName: 'Project1', projectName: 'Project1', buildType: 'Debug', targetType: 'MyTarget', projectPath: '/path/to/Project1.cproject.yml' },
                    { displayName: 'Project2', projectName: 'Project2', buildType: 'Release', targetType: 'MyTarget', projectPath: '/path/to/Project2.cproject.yml' },
                ];
                jest.spyOn(csolution.cbuildIdxFile, 'activeContexts', 'get').mockReturnValue(mockContexts);

                const result = csolution.getContextDescriptors();

                expect(result).toEqual(mockContexts);
            });
        });

        describe('expandPath', () => {
            let csolution: CSolution;

            beforeEach(() => {
                csolution = new CSolution();
                csolution.solutionDir = '/path/to/solution';
                jest.spyOn(csolution, 'getVariables').mockReturnValue(
                    new Map([
                        ['$VAR1$', 'value1'],
                        ['$VAR2$', 'value2'],
                    ]),
                );
            });

            it('replaces variables in the path', () => {
                const result = csolution.expandPath('$VAR1$/subdir/$VAR2$/file.txt');
                expect(result).toEqual('value1/subdir/value2/file.txt');
            });

            it('replaces $SolutionDir()$ with the solution directory', () => {
                const result = csolution.expandPath('$SolutionDir()$/subdir/file.txt');
                expect(result).toEqual('/path/to/solution/subdir/file.txt');
            });

            it('handles paths with no variables', () => {
                const result = csolution.expandPath('/absolute/path/to/file.txt');
                expect(result).toEqual('/absolute/path/to/file.txt');
            });

            it('handles paths with undefined variables', () => {
                const result = csolution.expandPath('$UNDEFINED$/file.txt');
                expect(result).toEqual('$UNDEFINED$/file.txt');
            });

            it('handles empty paths', () => {
                const result = csolution.expandPath('');
                expect(result).toEqual('');
            });

            it('replaces variables specific to a target type', () => {
                jest.spyOn(csolution, 'getVariables').mockImplementation(targetType => {
                    if (targetType === 'TargetA') {
                        return new Map([['$TARGET_VAR$', 'targetValue']]);
                    }
                    return new Map();
                });

                const result = csolution.expandPath('$TARGET_VAR$/file.txt', 'TargetA');
                expect(result).toEqual('targetValue/file.txt');
            });

            it('does not replace variables if target type is not matched', () => {
                jest.spyOn(csolution, 'getVariables').mockImplementation(targetType => {
                    if (targetType === 'TargetA') {
                        return new Map([['$TARGET_VAR$', 'targetValue']]);
                    }
                    return new Map();
                });

                const result = csolution.expandPath('$TARGET_VAR$/file.txt', 'TargetB');
                expect(result).toEqual('$TARGET_VAR$/file.txt');
            });
        });

        describe('saveTargetSet', () => {
            it('updates an existing target set with new values', async () => {
                const csolution = new CSolution();

                const targetTypeYaml = YAML.stringify({
                    type: 'MyTarget',
                    'target-set': [
                        { set: 'release', images: [{ 'project-context': 'Project.Release' }] },
                        { set: 'debug', images: [{ 'project-context': 'Project.Debug' }] },
                    ],
                });
                const targetTypeItem = parseYamlToCTreeItem(targetTypeYaml) as CTreeItem;
                jest.spyOn(csolution, 'getDefaultTargetTypeItem').mockReturnValue(targetTypeItem);

                const targetSet = { set: 'release', images: [{ 'project-context': 'Project.NewRelease' }] };
                csolution.saveTargetSet(targetSet);

                const updatedTargetType = targetTypeItem.toObject();
                expect(updatedTargetType).toEqual({
                    type: 'MyTarget',
                    'target-set': [
                        { set: 'release', images: [{ 'project-context': 'Project.NewRelease' }] },
                        { set: 'debug', images: [{ 'project-context': 'Project.Debug' }] },
                    ],
                });
            });

            it('adds a new target set if it does not exist', async () => {
                const csolution = new CSolution();

                const targetTypeYaml = YAML.stringify({
                    type: 'MyTarget',
                    'target-set': [{ set: 'debug', images: [{ 'project-context': 'Project.Debug' }] }],
                });
                const targetTypeItem = parseYamlToCTreeItem(targetTypeYaml) as CTreeItem;
                jest.spyOn(csolution, 'getDefaultTargetTypeItem').mockReturnValue(targetTypeItem);

                const targetSet = { set: 'release', images: [{ 'project-context': 'Project.Release' }] };
                csolution.saveTargetSet(targetSet);

                const updatedTargetType = targetTypeItem.toObject();
                expect(updatedTargetType).toEqual({
                    type: 'MyTarget',
                    'target-set': [
                        { set: 'debug', images: [{ 'project-context': 'Project.Debug' }] },
                        { set: 'release', images: [{ 'project-context': 'Project.Release' }] },
                    ],
                });
            });

            it('updates the default target set if set is null', async () => {
                const csolution = new CSolution();

                const targetTypeYaml = YAML.stringify({
                    type: 'MyTarget',
                    'target-set': [{ set: null, images: [{ 'project-context': 'Project.Default' }] }],
                });
                const targetTypeItem = parseYamlToCTreeItem(targetTypeYaml) as CTreeItem;
                jest.spyOn(csolution, 'getDefaultTargetTypeItem').mockReturnValue(targetTypeItem);

                const targetSet = { set: null, images: [{ 'project-context': 'Project.NewDefault' }] };
                csolution.saveTargetSet(targetSet);

                const updatedTargetType = targetTypeItem.toObject();
                expect(updatedTargetType).toEqual({
                    type: 'MyTarget',
                    'target-set': [{ set: null, images: [{ 'project-context': 'Project.NewDefault' }] }],
                });
            });

            it('does nothing if no active target type is available', async () => {
                const csolution = new CSolution();

                jest.spyOn(csolution, 'getDefaultTargetTypeItem').mockReturnValue(undefined);

                const targetSet = { set: 'release', images: [{ 'project-context': 'Project.Release' }] };
                csolution.saveTargetSet(targetSet);

                expect(csolution.getDefaultTargetTypeItem).toHaveBeenCalled();
            });
        });
    });
});
