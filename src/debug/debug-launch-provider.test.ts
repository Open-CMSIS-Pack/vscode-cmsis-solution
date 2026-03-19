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

import * as fs from 'node:fs';
import * as fsUtils from '../utils/fs-utils';
import { EtaExt } from '../generic/eta-ext';
import { CSolution } from '../solutions/csolution';
import { CbuildRunYaml, CbuildRunYamlFile, DebugTopology } from '../solutions/files/cbuild-run-yaml-file';
import { solutionManagerFactory } from '../solutions/solution-manager.factories';
import { commandsProviderFactory } from '../vscode-api/commands-provider.factories';
import { AdapterJson } from './adapter-json-file';
import { DebugLaunchProviderImpl } from './debug-launch-provider';
import { Configuration, LaunchJsonFile } from './launch-json-file';
import { DebugAdapter, DebugAdaptersYamlFile, UISection } from './debug-adapters-yaml-file';
import path from 'path';
import { configurationProviderFactory } from '../vscode-api/configuration-provider.factories';
import { DEBUG_ADAPTERS_YAML_FILE_PATH, DEBUG_TEMPLATES_FOLDER, PACKAGE_NAME } from '../manifest';
import { Uri } from 'vscode';
import { TestDataHandler } from '../__test__/test-data';
import yaml from 'yaml';
import { csolutionFactory } from '../solutions/csolution.factory';

class DebugLaunchProviderTest extends DebugLaunchProviderImpl   {

    constructor(
        readonly commandsProviderMock = commandsProviderFactory(),
        readonly solutionManagerMock = solutionManagerFactory(),
        readonly configurationProviderMock = configurationProviderFactory(),
        readonly etaMock = jest.mocked(new EtaExt({ useWith: true })),
    ) {
        super(
            commandsProviderMock,
            solutionManagerMock,
            configurationProviderMock,
            etaMock,
        );

        etaMock.renderObject = jest.fn().mockImplementation((obj, _) => obj);
    }

    loadCbuildRunYml() {
        return super.loadCbuildRunYml();
    }

    loadDebugAdaptersYml() {
        return super.loadDebugAdaptersYml();
    }

    handleUpdateDebugTasks() {
        return super.handleUpdateDebugTasks();
    }

    renderTemplate<T extends object>(obj: T, vars: Map<string, unknown>): T {
        return super.renderTemplate(obj, vars);
    }

    updateTasksJson(workspaceFolder: string, templateTasks: AdapterJson['tasks'], vars: Map<string, unknown>) {
        return super.updateTasksJson(workspaceFolder, templateTasks, vars);
    }

    updateLaunchConfiguration(launchJson: LaunchJsonFile, template: Configuration | undefined, vars: Map<string, unknown>, updatedConfigs? : string[]) {
        return super.updateLaunchConfiguration(launchJson, template, vars, updatedConfigs);
    }

    updateLaunchJson(workspaceFolder: string, templates: AdapterJson['launch'], options: { processors: string[]; }, vars: Map<string, unknown>) {
        return super.updateLaunchJson(workspaceFolder, templates, options, vars);
    }

    updateDebugTasks(workspaceFolder: string, params: {
        debug: CbuildRunYaml['cbuild-run']['debugger'],
        debugAdapter: DebugAdapter,
        deviceName: string,
        targetType: string,
        processors: DebugTopology['processors'],
        image_files: CbuildRunYaml['cbuild-run']['output'],
        symbol_files: CbuildRunYaml['cbuild-run']['output'],
    }) {
        return super.updateDebugTasks(workspaceFolder, params);
    };
}

describe('DebugLaunchProvider', () => {
    const testDataHandler = new TestDataHandler();
    const tmpDir = testDataHandler.tmpDir;
    const workspaceFolderUri  = Uri.file(tmpDir);
    const workspaceFolder = workspaceFolderUri.fsPath; // platform-specific string path
    const tasksJsonFile = path.join(workspaceFolder, '.vscode', 'tasks.json');
    const tasksJsonDir = path.join(workspaceFolder, '.vscode', 'tasks.json.d');
    const launchJsonFile = path.join(workspaceFolder, '.vscode', 'launch.json');
    const launchJsonDir = path.join(workspaceFolder, '.vscode', 'launch.json.d');
    const solutionFolder = path.join(workspaceFolder, 'solution');
    const solutionTasksJsonDir = path.join(solutionFolder, '.vscode', 'tasks.json.d');
    const solutionLaunchJsonDir = path.join(solutionFolder, '.vscode', 'launch.json.d');

    afterAll(async () => {
        testDataHandler.dispose();
    });

    afterEach(() => {
        testDataHandler.rmFile(tasksJsonFile);
        testDataHandler.rmFile(launchJsonFile);
        testDataHandler.rmDir(tasksJsonDir);
        testDataHandler.rmDir(launchJsonDir);
        testDataHandler.rmDir(solutionTasksJsonDir);
        testDataHandler.rmDir(solutionLaunchJsonDir);
    });

    describe('loadCbuildRunYml', () => {

        it('should load cbuild-run.yml file', async () => {

            const debugLaunchProvider = new DebugLaunchProviderTest();

            const cbuildRunYmlMock : jest.Mocked<CbuildRunYamlFile> = {
                exists: jest.fn().mockResolvedValue(true),
                load: jest.fn().mockResolvedValue(undefined),
                fileUri: 'file://tmp/test.cbuild-run.yml',
            } as unknown as jest.Mocked<CbuildRunYamlFile>;

            const csolutionMock = {
                cbuildRunYml: cbuildRunYmlMock,
            } as unknown as jest.Mocked<CSolution>;

            debugLaunchProvider.solutionManagerMock.getCsolution.mockReturnValue(csolutionMock);

            const cbuildRunYml = await debugLaunchProvider.loadCbuildRunYml();
            expect(cbuildRunYml).toBeDefined();
        });

    });

    describe('loadDebugAdaptersYml', () => {

        it('should load debug-adapters.yml file', async () => {
            const debugLaunchProvider = new DebugLaunchProviderTest();
            const debugAdaptersYml = await debugLaunchProvider.loadDebugAdaptersYml();
            expect(debugAdaptersYml).toBeDefined();
        });

    });

    describe('renderTemplate', () => {

        it('should render template with provided variables', () => {
            const debugLaunchProvider = new DebugLaunchProviderTest();


            const obj = jest.fn();
            const expectedObj = jest.fn();
            const data = new Map<string, unknown>([
                ['key1', 'value1'],
                ['key2', 'value2'],
            ]);

            debugLaunchProvider.etaMock.renderObject.mockReturnValue(expectedObj);

            const renderedObj = debugLaunchProvider.renderTemplate(obj, data);

            expect(renderedObj).toBe(expectedObj);
            expect(debugLaunchProvider.etaMock.renderObject).toHaveBeenCalledWith(obj, Object.fromEntries(data));
        });

        it('should log error and return original object', () => {
            const debugLaunchProvider = new DebugLaunchProviderTest();

            const obj = jest.fn();
            const data = new Map<string, unknown>([
                ['key1', 'value1'],
                ['key2', 'value2'],
            ]);

            debugLaunchProvider.etaMock.renderObject.mockImplementation(() => {
                throw new Error('Rendering error');
            });

            const renderedObj = debugLaunchProvider.renderTemplate(obj, data);

            expect(renderedObj).toBe(obj);
            expect(debugLaunchProvider.etaMock.renderObject).toHaveBeenCalledWith(obj, Object.fromEntries(data));
        });

    });

    describe('updateTasksJson', () => {

        it('should update tasks.json with new tasks', async () => {
            const debugLaunchProvider = new DebugLaunchProviderTest();
            debugLaunchProvider.solutionManagerMock.getCsolution.mockReturnValue(csolutionFactory({ solutionDir: undefined }));

            const tasks = [
                { label: 'Custom Task', type: 'shell', command: '' },
                { label: 'CMSIS Task Update', type: 'shell', command: '' },
                { label: 'CMSIS Task Remove', type: 'shell', command: '' },
            ];
            const templateTasks = [
                { label: 'CMSIS Task Update', type: 'shell', command: 'echo Task 1' },
                { label: 'CMSIS Task Add', type: 'shell', command: 'echo Task 2' },
            ];
            const vars = new Map<string, unknown>();

            const mockContent = JSON.stringify({ version: '2.0.0', tasks }, null, 4);
            fsUtils.writeTextFile(tasksJsonFile, mockContent);

            const mockChangedContent = JSON.stringify({ version: '2.0.0', tasks: [ tasks[0], ...templateTasks ] }, null, 4);
            await debugLaunchProvider.updateTasksJson(workspaceFolder, templateTasks, vars);

            const expectedContent = fs.readFileSync(tasksJsonFile, 'utf8');
            expect(expectedContent).toEqual(mockChangedContent);
        });

        it('should include all files from tasks.json.d', async () => {
            const debugLaunchProvider = new DebugLaunchProviderTest();
            debugLaunchProvider.solutionManagerMock.getCsolution.mockReturnValue(csolutionFactory({ solutionDir: solutionFolder }));

            const tasks = [
                { label: 'Existing Task', type: 'shell', command: '' },
            ];
            const extraInputs = [
                { id: 'input1', type: 'string', description: 'Input 1' },
            ];
            const extraTasks = [
                { label: 'Custom Task', type: 'shell', command: '' },
            ];
            const solutionTasks = [
                { label: 'Solution Task', type: 'shell', command: '' },
            ];

            fsUtils.writeTextFile(path.join(tasksJsonDir, 'extra.json'), JSON.stringify({ version: '2.0.0', tasks: extraTasks, inputs: extraInputs }, null, 4));
            fsUtils.writeTextFile(path.join(solutionTasksJsonDir, 'solution.json'), JSON.stringify({ version: '2.0.0', tasks: solutionTasks }, null, 4));

            const mockContent = JSON.stringify({ version: '2.0.0', tasks }, null, 4);
            fsUtils.writeTextFile(tasksJsonFile, mockContent);

            const mockChangedContent = JSON.stringify({ version: '2.0.0', inputs: [...extraInputs], tasks: [...tasks, ...extraTasks, ...solutionTasks] }, null, 4);
            await debugLaunchProvider.updateTasksJson(workspaceFolder, [], new Map<string, unknown>());

            const expectedContent = fs.readFileSync(tasksJsonFile, 'utf8');
            expect(expectedContent).toEqual(mockChangedContent);
        });
    });

    describe('updateLaunchConfiguration', () => {

        it('should add new configuration', async () => {
            const debugLaunchProvider = new DebugLaunchProviderTest();

            const vars = new Map<string, unknown>();
            const configuration: Configuration = { name: 'Release', type: 'node', request: 'attach', cmsis: { updateConfiguration: 'auto' } };
            const template: Configuration = { name: 'Debug', type: 'node', request: 'launch', cmsis: { updateConfiguration: 'auto' } };

            const launchJson = new LaunchJsonFile();
            debugLaunchProvider.updateLaunchConfiguration(launchJson, configuration, vars);
            debugLaunchProvider.updateLaunchConfiguration(launchJson, template, vars);

            expect(launchJson.configurations).toEqual([configuration, template]);
        });

        it('should update existing configuration', async () => {
            const debugLaunchProvider = new DebugLaunchProviderTest();
            const vars = new Map<string, unknown>();

            const configuration: Configuration = { name: 'Debug', type: 'node', request: 'attach', cmsis: { updateConfiguration: 'auto' } };
            const template: Configuration = { name: 'Debug', type: 'node', request: 'launch', cmsis: { updateConfiguration: 'auto' } };
            const launchJson = new LaunchJsonFile();
            debugLaunchProvider.updateLaunchConfiguration(launchJson, configuration, vars);
            debugLaunchProvider.updateLaunchConfiguration(launchJson, template, vars);

            expect(launchJson.configurations).toEqual([template]);
        });

        it('should not update existing manual configuration', async () => {
            const debugLaunchProvider = new DebugLaunchProviderTest();
            const vars = new Map<string, unknown>();

            const configuration: Configuration = { name: 'Debug', type: 'node', request: 'attach', cmsis: { updateConfiguration: 'manual' } };
            const launchJson = new LaunchJsonFile();
            debugLaunchProvider.updateLaunchConfiguration(launchJson, configuration, vars);

            const template: Configuration = { name: 'Debug', type: 'node', request: 'launch', cmsis: { updateConfiguration: 'auto' } };
            debugLaunchProvider.updateLaunchConfiguration(launchJson, template, vars);

            expect(launchJson.configurations).toEqual([configuration]);
        });
    });

    describe('updateLaunchJson', () => {

        const templates : AdapterJson['launch'] = {
            'singlecore-launch': {
                name: 'SingleCoreLaunch',
                type: 'shell',
                request: 'launch',
                cmsis: { updateConfiguration: 'auto' },
            },
            'singlecore-attach': {
                name: 'SingleCoreAttach',
                type: 'shell',
                request: 'attach',
                cmsis: { updateConfiguration: 'auto' },
            },
            'multicore-start-launch': {
                name: 'MultiCoreStartLaunch',
                type: 'shell',
                request: 'launch',
                cmsis: { updateConfiguration: 'auto' },
            },
            'multicore-start-attach': {
                name: 'MultiCoreStartAttach',
                type: 'shell',
                request: 'attach',
                cmsis: { updateConfiguration: 'auto' },
            },
            'multicore-other': {
                name: 'MultiCoreOther',
                type: 'shell',
                request: 'attach',
                cmsis: { updateConfiguration: 'auto' },
            },
        };

        it('should update launch.json with singlecore configurations (unnamed processor)', async () => {
            const debugLaunchProvider = new DebugLaunchProviderTest();
            const options = {
                processors: [],
            };
            const vars = new Map<string, unknown>();

            fsUtils.writeTextFile(launchJsonFile,'{ "configurations": [] }');
            jest.spyOn(debugLaunchProvider, 'updateLaunchConfiguration').mockImplementation((_launchJson, template, _vars) => {
                return template?.name;
            });

            await debugLaunchProvider.updateLaunchJson(workspaceFolder, templates, options, vars);

            const expectedVars = new Map(vars);
            expectedVars.set('pname', '');

            expect(debugLaunchProvider.updateLaunchConfiguration).toHaveBeenCalledTimes(2);
            expect(debugLaunchProvider.updateLaunchConfiguration).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining(templates['singlecore-launch']),
                expectedVars, expect.any(Array<string>)
            );
            expect(debugLaunchProvider.updateLaunchConfiguration).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining(templates['singlecore-attach']),
                expectedVars, expect.any(Array<string>)
            );
            expect(debugLaunchProvider.activeLaunchConfiguration).toEqual(templates['singlecore-launch']?.name);
        });

        it('should update launch.json with singlecore configurations (named processor)', async () => {
            const debugLaunchProvider = new DebugLaunchProviderTest();
            const options = {
                processors: [ 'cm33'],
            };
            const vars = new Map<string, unknown>();

            fsUtils.writeTextFile(launchJsonFile,'{ "configurations": [] }');
            jest.spyOn(debugLaunchProvider, 'updateLaunchConfiguration').mockImplementation(jest.fn());

            await debugLaunchProvider.updateLaunchJson(workspaceFolder, templates, options, vars);

            const expectedVars = new Map(vars);
            expectedVars.set('pname', 'cm33');

            expect(debugLaunchProvider.updateLaunchConfiguration).toHaveBeenCalledTimes(2);
            expect(debugLaunchProvider.updateLaunchConfiguration).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining(templates['singlecore-launch']),
                expectedVars, expect.any(Array<string>)
            );
            expect(debugLaunchProvider.updateLaunchConfiguration).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining(templates['singlecore-attach']),
                expectedVars, expect.any(Array<string>)
            );
        });

        it('should update launch.json with multicore configurations', async () => {
            const debugLaunchProvider = new DebugLaunchProviderTest();
            const options = {
                processors: ['Processor1', 'Processor2'],
            };
            const vars = new Map<string, unknown>();

            const updateLaunchConfigurationMock = jest.fn().mockImplementation((_launchJson, template, _vars) => {
                return template?.name;
            });

            fsUtils.writeTextFile(launchJsonFile, '{ "configurations": [] }');

            jest.spyOn(debugLaunchProvider, 'updateLaunchConfiguration').mockImplementation(
                (_launchJson, template, vars) => updateLaunchConfigurationMock(_launchJson, template, new Map(vars))
            );

            await debugLaunchProvider.updateLaunchJson(workspaceFolder, templates, options, vars);

            const expectedVars = new Map(vars);

            expect(updateLaunchConfigurationMock).toHaveBeenCalledTimes(3);
            expect(updateLaunchConfigurationMock).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining(templates['multicore-start-launch']),
                expectedVars.set('pname', 'Processor1'),
            );
            expect(updateLaunchConfigurationMock).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining(templates['multicore-start-attach']),
                expectedVars.set('pname', 'Processor1'),
            );
            expect(updateLaunchConfigurationMock).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining(templates['multicore-other']),
                expectedVars.set('pname', 'Processor2'),
            );
            expect(debugLaunchProvider.activeLaunchConfiguration).toEqual(templates['multicore-start-launch']?.name);
        });

        it('should include all files from launch.json.d', async () => {
            const extraConfiguration = { name: 'ExtraConfig', type: 'shell', request: 'launch' };
            fsUtils.writeTextFile(path.join(launchJsonDir, 'extra.json'), JSON.stringify({ version: '0.2.0', configurations: [ extraConfiguration ] }, null, 4));

            const debugLaunchProvider = new DebugLaunchProviderTest();
            const options = {
                processors: [],
            };
            const vars = new Map<string, unknown>();
            const updateLaunchConfigurationMock = jest.fn().mockImplementation((_launchJson, template, _vars) => {
                return template?.name;
            });

            fsUtils.writeTextFile(launchJsonFile, JSON.stringify({ version: '0.2.0', configurations: [] }, null, 4));

            jest.spyOn(debugLaunchProvider, 'updateLaunchConfiguration').mockImplementation(
                (_launchJson, template, vars) => updateLaunchConfigurationMock(_launchJson, template, new Map(vars))
            );

            await debugLaunchProvider.updateLaunchJson(workspaceFolder, templates, options, vars);

            const mockChangedContent = JSON.stringify({ version: '0.2.0', configurations: [ extraConfiguration ] }, null, 4);
            const expectedContent = fs.readFileSync(launchJsonFile, 'utf8');
            expect(expectedContent).toEqual(mockChangedContent);
        });
    });

    describe('updateDebugTasks', () => {

        it('should update tasks.json and launch.json', async () => {
            const debugLaunchProvider = new DebugLaunchProviderTest();
            const params = {
                debug: {
                    'name': 'GDB',
                    'info': 'GDB Debugger',
                    'protocol': 'swd',
                    'clock': '1000000',
                    'start-pname': 'Processor1',
                    'gdbserver': [
                        { 'port': '1234', 'pname': 'Processor1' },
                        { 'port': '5678', 'pname': 'Processor2' },
                    ],
                },
                debugAdapter: {
                    name: 'DebugAdapter',
                    template: 'template.json',
                },
                deviceName: 'DeviceName',
                targetType: 'TargetType',
                processors: [{ pname: 'Processor1' }, { pname: 'Processor2' }],
                image_files: [
                    { file: 'image1.bin', type: 'bin', info: 'Processor 1 Image', load: 'image', 'load-offset': undefined, pname: 'Processor1' },
                    { file: 'image2.bin', type: 'bin', info: 'Processor 2 Image', load: 'image', 'load-offset': undefined, pname: 'Processor2' },
                ],
                symbol_files: [
                    { file: 'image.elf', type: 'elf', info: 'Full image', load: 'symbols', 'load-offset': undefined, pname: 'Processor1' },
                ],
            };

            const adapterTemplate: AdapterJson = {
                data: { customField: 'CustomValue' },
                launch: {
                    'singlecore-launch': {
                        name: 'SingleCoreLaunch',
                        type: 'shell',
                        request: 'launch',
                        cmsis: { updateConfiguration: 'auto' },
                    },
                    'singlecore-attach': undefined,
                    'multicore-start-launch': undefined,
                    'multicore-start-attach': undefined,
                    'multicore-other': undefined,
                },
                tasks: [
                    {
                        label: 'Task 1',
                        type: 'shell',
                    }
                ],
            };

            const csolutionMock = {
                solutionPath: path.join(workspaceFolder, 'solution', 'solution.csolution.yml'),
                solutionDir: path.join(workspaceFolder, 'solution'),
            } as unknown as jest.Mocked<CSolution>;

            const expectedFilePath  = path.join(DEBUG_TEMPLATES_FOLDER, 'template.json');
            debugLaunchProvider.solutionManagerMock.getCsolution.mockReturnValue(csolutionMock);

            const readMock = jest.spyOn(fsUtils, 'readTextFile').mockReturnValue(JSON.stringify(adapterTemplate));
            jest.spyOn(fsUtils, 'fileExists').mockReturnValue(true);
            jest.spyOn(debugLaunchProvider, 'updateTasksJson').mockResolvedValue(undefined);
            jest.spyOn(debugLaunchProvider, 'updateLaunchJson').mockResolvedValue(undefined);

            await debugLaunchProvider.updateDebugTasks(workspaceFolder, params);

            const expectedVars = new Map<string, unknown>([
                ['platform', process.platform],
                ['template', expect.any(Function)],
                ['solution_folder', 'solution'],
                ['solution_path', 'solution/solution.csolution.yml'],
                ['device_name', params.deviceName],
                ['target_type', params.targetType],
                ['start_pname', params.debug['start-pname']],
                ['image_files', params.image_files],
                ['symbol_files', params.symbol_files],
                ['ports', new Map([['Processor1', '1234'], ['Processor2', '5678']])],
                ['config', params.debug],
                ['data', adapterTemplate.data ?? {}],
                ['processors', ['Processor1', 'Processor2']],
            ]);

            expect(debugLaunchProvider.updateTasksJson).toHaveBeenCalledWith(workspaceFolder, adapterTemplate.tasks, expectedVars);
            expect(debugLaunchProvider.updateLaunchJson).toHaveBeenCalledWith(workspaceFolder, adapterTemplate.launch, { processors: ['Processor1', 'Processor2'] }, expectedVars);
            expect(readMock).toHaveBeenCalledWith(expectedFilePath);
        });

        describe('Sanity check all bundled debug adapter templates', () => {

            const content = fs.readFileSync(DEBUG_ADAPTERS_YAML_FILE_PATH, 'utf8');
            const data = yaml.parse(content);

            for (const adapter of data['debug-adapters'] ?? []) {
                describe(`Adapter: ${adapter.name}`, () => {
                    beforeEach(() => {
                        fs.rmSync(tasksJsonFile, { force: true });
                        fs.rmSync(launchJsonFile, { force: true });
                    });

                    it('should evaluate template for single-core project', async () => {
                        const debugLaunchProvider = new DebugLaunchProviderTest();
                        debugLaunchProvider.etaMock.renderObject.mockImplementation(EtaExt.prototype.renderObject);

                        const csolutionMock = {
                            solutionPath: path.join(workspaceFolder, 'solution', 'solution.csolution.yml'),
                            solutionDir: path.join(workspaceFolder, 'solution'),
                        } as unknown as jest.Mocked<CSolution>;

                        debugLaunchProvider.solutionManagerMock.getCsolution.mockReturnValue(csolutionMock);

                        const params = {
                            debug: {
                                'name': adapter.name,
                                'info': `${adapter.name} Debugger`,
                                'protocol': 'swd',
                                'clock': '1000000',
                                'start-pname': '',
                                'gdbserver': [
                                    { 'port': '1234' },
                                ],
                            },
                            debugAdapter: adapter,
                            deviceName: 'DeviceName',
                            targetType: 'TargetType',
                            processors: [],
                            image_files: [
                                { file: 'image1.bin', type: 'bin', info: 'Full binary image', load: 'image' },
                            ],
                            symbol_files: [
                                { file: 'image.elf', type: 'elf', info: 'Full image', load: 'symbols' },
                            ],
                        };

                        const initYamlNode = (section: UISection) => {
                            if (section.options.every(opt => opt.default === undefined)) {
                                return undefined;
                            } else if ('pname-options' in section) {
                                return undefined;
                            } else {
                                return {};
                            }
                        };

                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const debugParams = params.debug as Record<string, any>;
                        for (const section of adapter['user-interface'] ?? []) {
                            const yamlNode = section['yml-node'] ? (debugParams[section['yml-node']] ??= initYamlNode(section)) : debugParams;
                            for (const option of section.options) {
                                if (option.default) {
                                    if ('pname-options' in section && Array.isArray(yamlNode)) {
                                        yamlNode.forEach(elem => elem[option['yml-node']] = option.default);
                                    } else if (typeof yamlNode === 'object' && yamlNode !== undefined) {
                                        if (typeof option.default === 'number' && option.scale !== undefined) {
                                            yamlNode[option['yml-node']] = option.default * option.scale;
                                        } else {
                                            yamlNode[option['yml-node']] = option.default;
                                        }
                                    }
                                }
                            }
                        }

                        await debugLaunchProvider.updateDebugTasks(workspaceFolder, params);

                        expect(fs.existsSync(tasksJsonFile)).toBe(true);
                        expect(fs.existsSync(launchJsonFile)).toBe(true);

                        const tasksJsonContent = fs.readFileSync(tasksJsonFile, 'utf8');
                        const launchJsonContent = fs.readFileSync(launchJsonFile, 'utf8');

                        expect(tasksJsonContent).not.toContain('<%=');
                        expect(launchJsonContent).not.toContain('<%=');
                    });

                    it('should evaluate template for multi-core project', async () => {
                        const debugLaunchProvider = new DebugLaunchProviderTest();
                        debugLaunchProvider.etaMock.renderObject.mockImplementation(EtaExt.prototype.renderObject);

                        const csolutionMock = {
                            solutionPath: path.join(workspaceFolder, 'solution', 'solution.csolution.yml'),
                            solutionDir: path.join(workspaceFolder, 'solution'),
                        } as unknown as jest.Mocked<CSolution>;

                        debugLaunchProvider.solutionManagerMock.getCsolution.mockReturnValue(csolutionMock);

                        const params = {
                            debug: {
                                'name': adapter.name,
                                'info': `${adapter.name} Debugger`,
                                'protocol': 'swd',
                                'clock': '1000000',
                                'start-pname': 'core0',
                                'gdbserver': [
                                    { 'pname': 'core0', 'port': '1234' },
                                    { 'pname': 'core1', 'port': '1235' },
                                ],
                            },
                            debugAdapter: adapter,
                            deviceName: 'DeviceName',
                            targetType: 'TargetType',
                            processors: [{ pname: 'core0' }, { pname: 'core1' }],
                            image_files: [
                                { file: 'image1.bin', type: 'bin', info: 'core0 binary image', load: 'image', pname: 'core0' },
                                { file: 'image2.bin', type: 'bin', info: 'core1 binary image', load: 'image', pname: 'core1' },
                            ],
                            symbol_files: [
                                { file: 'image.elf', type: 'elf', info: 'Full image', load: 'symbols' },
                            ],
                        };

                        const initYamlNode = (section: UISection) => {
                            if (section.options.every(opt => opt.default === undefined)) {
                                return undefined;
                            } else if ('pname-options' in section) {
                                if (section['yml-node'] === 'telnet') {
                                    return params.processors.map((p, idx) => ({ pname: p.pname, port: 4444 + idx }));
                                }
                                return params.processors.map(p => ({ pname: p.pname }));
                            } else {
                                return {};
                            }
                        };

                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const debugParams = params.debug as Record<string, any>;
                        for (const section of adapter['user-interface'] ?? []) {
                            const yamlNode = section['yml-node'] ? (debugParams[section['yml-node']] ??= initYamlNode(section)) : debugParams;
                            for (const option of section.options) {
                                if (option.default) {
                                    if ('pname-options' in section && Array.isArray(yamlNode)) {
                                        yamlNode.forEach(elem => elem[option['yml-node']] = option.default);
                                    } else if (typeof yamlNode === 'object' && yamlNode !== undefined) {
                                        if (typeof option.default === 'number' && option.scale !== undefined) {
                                            yamlNode[option['yml-node']] = option.default * option.scale;
                                        } else {
                                            yamlNode[option['yml-node']] = option.default;
                                        }
                                    }
                                }
                            }
                        }

                        await debugLaunchProvider.updateDebugTasks(workspaceFolder, params);

                        expect(fs.existsSync(tasksJsonFile)).toBe(true);
                        expect(fs.existsSync(launchJsonFile)).toBe(true);

                        const tasksJsonContent = fs.readFileSync(tasksJsonFile, 'utf8');
                        const launchJsonContent = fs.readFileSync(launchJsonFile, 'utf8');

                        expect(tasksJsonContent).not.toContain('<%=');
                        expect(launchJsonContent).not.toContain('<%=');
                    });
                });
            }
        });
    });

    describe('handleUpdateDebugTasks', () => {
        const relImageFilePath = 'out/project/debug/image.elf';
        const debug : CbuildRunYaml['cbuild-run']['debugger'] = {
            'name': 'GDB',
            'info': 'GDB Debugger',
            'protocol': 'swd',
            'clock': '1000000',
            'start-pname': 'Processor1',
            'gdbserver': [
                { 'port': '1234', 'pname': 'Processor1' },
                { 'port': '5678', 'pname': 'Processor2' },
            ],
        };
        const cbuildRunYml : jest.Mocked<CbuildRunYamlFile> = {
            getToolVersion: jest.fn().mockReturnValue([undefined, undefined]),
            getDebugger: jest.fn().mockReturnValue(debug),
            getDevice: jest.fn().mockReturnValue('Vendor::Device'),
            getTargetType: jest.fn().mockReturnValue('TargetType'),
            getProcessors: jest.fn().mockReturnValue([]),
            getImages: jest.fn().mockReturnValue([{
                file: path.join(workspaceFolder, relImageFilePath),
                type: 'elf',
                load: 'image+symbols',
            }]),
            getSolution: jest.fn().mockReturnValue(path.join(workspaceFolder, 'solution.csolution.yml')),
        } as unknown as jest.Mocked<CbuildRunYamlFile>;

        const debugAdapter : DebugAdapter = {
            name: 'GDB',
            template: 'gdb.adapter.json',
        };
        const debugAdaptersYml = {
            getAdapterByName: jest.fn().mockReturnValue(debugAdapter),
        } as unknown as jest.Mocked<DebugAdaptersYamlFile>;

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should update debug tasks and set hideSlowPreLaunchWarning', async () => {
            const debugLaunchProvider = new DebugLaunchProviderTest();

            debugLaunchProvider.solutionManagerMock.workspaceFolder = workspaceFolderUri;

            jest.spyOn(debugLaunchProvider, 'loadCbuildRunYml').mockResolvedValue(cbuildRunYml);
            jest.spyOn(debugLaunchProvider, 'loadDebugAdaptersYml').mockResolvedValue(debugAdaptersYml);
            const updateDebugTasksSpy = jest.spyOn(debugLaunchProvider, 'updateDebugTasks').mockResolvedValue(undefined);

            await debugLaunchProvider.handleUpdateDebugTasks();

            expect(updateDebugTasksSpy).toHaveBeenCalledWith(
                workspaceFolder, {
                    debug,
                    debugAdapter,
                    deviceName: 'Device',
                    targetType: 'TargetType',
                    processors: [],
                    image_files: [{
                        'file': relImageFilePath,
                        'load': 'image+symbols',
                        'type': 'elf',
                    }],
                    symbol_files: [{
                        'file': relImageFilePath,
                        'load': 'image+symbols',
                        'type': 'elf',
                    }],
                }
            );
            expect(debugLaunchProvider.configurationProviderMock.setConfigVariable).toHaveBeenCalledWith('hideSlowPreLaunchWarning', true, 'debug', true);
        });

        it.each([false, true])('should not change existing hideSlowPreLaunchWarning workspace setting (%s)', async (value) => {
            const debugLaunchProvider = new DebugLaunchProviderTest();

            debugLaunchProvider.solutionManagerMock.workspaceFolder = workspaceFolderUri;
            jest.spyOn(debugLaunchProvider, 'loadCbuildRunYml').mockResolvedValue(cbuildRunYml);
            jest.spyOn(debugLaunchProvider, 'loadDebugAdaptersYml').mockResolvedValue(debugAdaptersYml);
            jest.spyOn(debugLaunchProvider, 'updateDebugTasks').mockResolvedValue(undefined);

            debugLaunchProvider.configurationProviderMock.inspectConfigVariable.mockImplementation((name, ext) => ({ key: `${ext || PACKAGE_NAME}.${name}`, workspaceValue: value }));

            await debugLaunchProvider.handleUpdateDebugTasks();

            expect(debugLaunchProvider.configurationProviderMock.inspectConfigVariable).toHaveBeenCalledWith('hideSlowPreLaunchWarning', 'debug');
            expect(debugLaunchProvider.configurationProviderMock.setConfigVariable).not.toHaveBeenCalled();
        });

        it.each([false, true])('should not add hideSlowPreLaunchWarning to workspace if already set globally (%s)', async (value) => {
            const debugLaunchProvider = new DebugLaunchProviderTest();

            debugLaunchProvider.solutionManagerMock.workspaceFolder = workspaceFolderUri;
            jest.spyOn(debugLaunchProvider, 'loadCbuildRunYml').mockResolvedValue(cbuildRunYml);
            jest.spyOn(debugLaunchProvider, 'loadDebugAdaptersYml').mockResolvedValue(debugAdaptersYml);
            jest.spyOn(debugLaunchProvider, 'updateDebugTasks').mockResolvedValue(undefined);

            debugLaunchProvider.configurationProviderMock.inspectConfigVariable.mockImplementation((name, ext) => ({ key: `${ext || PACKAGE_NAME}.${name}`, globalValue: value }));

            await debugLaunchProvider.handleUpdateDebugTasks();

            expect(debugLaunchProvider.configurationProviderMock.inspectConfigVariable).toHaveBeenCalledWith('hideSlowPreLaunchWarning', 'debug');
            expect(debugLaunchProvider.configurationProviderMock.setConfigVariable).not.toHaveBeenCalled();
        });

    });

});
