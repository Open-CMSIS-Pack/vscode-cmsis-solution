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

import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import yaml from 'yaml';
import { ITextFileSystem, TextFile, YamlFile } from '@open-cmsis-pack/cmsis-common';
import { ActiveTool, VcpkgResults } from '@arm-software/vscode-environment-manager';
import { TestDataHandler } from '../__test__/test-data';
import { EnvironmentManager } from '../desktop/env-manager';
import { CMSIS_TOOLBOX_FOLDER } from '../manifest';
import { extensionApiProviderFactory } from '../vscode-api/extension-api-provider.factories';
import { ToolsEnvironment } from './tools-environment';

describe('ToolsEnvironment', () => {
    const testDataHandler = new TestDataHandler();
    const tempDir = testDataHandler.tmpDir;
    const toolsEnvironmentSchema = JSON.parse(fs.readFileSync(
        path.join(__dirname, '../../schemas/tools-environment.schema.json'),
        'utf8',
    ));
    const ajv = new Ajv({ strict: true });
    addFormats(ajv);
    const validateToolsEnvironment = ajv.compile(toolsEnvironmentSchema);
    const toPortablePath = (value: string): string => value.replace(/\\/g, '/');
    let fileSystem: jest.Mocked<ITextFileSystem>;

    beforeEach(() => {
        fileSystem = {
            exists: jest.fn().mockReturnValue(false),
            read: jest.fn(),
            write: jest.fn(),
            unlink: jest.fn(),
            dirname: jest.fn(path.dirname),
            resolve: jest.fn(path.resolve),
        };
        TextFile.setFileSystem(fileSystem);
        (vscode.extensions.getExtension as jest.Mock).mockReturnValue(undefined);
    });

    afterEach(() => {
        TextFile.setFileSystem();
        TextFile.setErrorReporter();
        jest.restoreAllMocks();
    });

    afterAll(() => {
        testDataHandler.dispose();
    });

    it('lists current toolchain registrations with contribution precedence and original paths', async () => {
        const variables: NodeJS.ProcessEnv = {
            AC6_TOOLCHAIN_6_24_0: 'C:\\Arm Compiler\\bin',
            GCC_TOOLCHAIN_14_3_1: '/old/gcc/bin',
            GCC_TOOLCHAIN_13_2_0: '/gcc13/bin',
            CLANG_TOOLCHAIN_1_2_3: '',
            IAR_TOOLCHAIN_1_2_3: '   ',
            OTHER_TOOLCHAIN_1_2_3: undefined,
            GCC_TOOLCHAIN_14_3: '/invalid/bin',
            GCC_TOOLCHAIN_14_3_1_EXTRA: '/invalid/bin',
            PATH: '/unregistered/compiler/bin',
            CMSIS_COMPILER_ROOT: '/compiler/configs',
        };
        const environmentManager = {
            getEnvironmentVariables: jest.fn(() => variables),
        } as unknown as EnvironmentManager;
        const owner = new ToolsEnvironment(environmentManager, extensionApiProviderFactory(), {
            version: 1, variables: { gcc_TOOLCHAIN_14_3_1: '/new/gcc/bin' }, paths: { PATH: [] }, tools: {},
        });
        const expected = [
            { name: 'AC6', version: '6.24.0', path: 'C:\\Arm Compiler\\bin', registrationVariable: 'AC6_TOOLCHAIN_6_24_0' },
            { name: 'gcc', version: '14.3.1', path: '/new/gcc/bin', registrationVariable: 'gcc_TOOLCHAIN_14_3_1' },
            { name: 'GCC', version: '13.2.0', path: '/gcc13/bin', registrationVariable: 'GCC_TOOLCHAIN_13_2_0' },
        ];
        const result = await owner.getToolchains();
        expect(result).toEqual(expected);
        result[0].path = 'changed';
        await expect(owner.getToolchains()).resolves.toEqual(expected);
        delete variables.AC6_TOOLCHAIN_6_24_0;
        owner.updateVcpkgResults({ version: 1, variables: {}, paths: { PATH: [] }, tools: {} });
        await expect(owner.getToolchains()).resolves.toEqual([
            { name: 'GCC', version: '14.3.1', path: '/old/gcc/bin', registrationVariable: 'GCC_TOOLCHAIN_14_3_1' },
            expected[2],
        ]);
    });

    it('waits for activation before listing contributed toolchains and returns empty when unregistered', async () => {
        const onDidActivate = new vscode.EventEmitter<VcpkgResults>();
        const onDidFailActivation = new vscode.EventEmitter<vscode.Uri>();
        let subscribed!: () => void;
        const subscriptionReady = new Promise<void>(resolve => { subscribed = resolve; });
        let isActivating = true;
        const environmentManager = { getEnvironmentVariables: jest.fn().mockReturnValue({}) } as unknown as EnvironmentManager;
        const owner = new ToolsEnvironment(environmentManager, extensionApiProviderFactory({
            getActiveTools: jest.fn(),
            isActivating: () => isActivating,
            onDidActivate: listener => {
                const subscription = onDidActivate.event(listener);
                subscribed();
                return subscription;
            },
            onDidFailActivation: onDidFailActivation.event,
        }));
        try {
            const pending = owner.getToolchains();
            await subscriptionReady;
            expect(environmentManager.getEnvironmentVariables).not.toHaveBeenCalled();
            isActivating = false;
            onDidActivate.fire({ version: 1, variables: { AC6_TOOLCHAIN_6_24_0: '/arm/bin' }, paths: { PATH: [] }, tools: {} });
            await expect(pending).resolves.toEqual([
                { name: 'AC6', version: '6.24.0', path: '/arm/bin', registrationVariable: 'AC6_TOOLCHAIN_6_24_0' },
            ]);
            owner.updateVcpkgResults({ version: 1, variables: {}, paths: { PATH: [] }, tools: {} });
            await expect(owner.getToolchains()).resolves.toEqual([]);
        } finally {
            onDidActivate.dispose();
            onDidFailActivation.dispose();
        }
    });

    it('renders a solution-free snapshot without global activation state', () => {
        const toolsEnvironment = new ToolsEnvironment(
            {} as EnvironmentManager,
            extensionApiProviderFactory({ getActiveTools: jest.fn() }),
            { version: 1, variables: { OTHER_FOLDER: 'secret' }, paths: { PATH: [] }, tools: {} },
        );
        const content = toolsEnvironment.render({
            folder: tempDir,
            environment: { OTHER_FOLDER: 'secret' },
            configuredVariables: {},
            installedTools: [],
        });
        expect(validateToolsEnvironment(yaml.parse(content))).toBe(true);
        const document = yaml.parse(content)['cmsis-tools-environment'];
        expect(document.version).toBe('1.1.0');
        expect(document).not.toHaveProperty('solution');
        expect(document.environment.variables).toEqual({});
        expect(document.tools[0].name).toBe('CMSIS-Toolbox');
    });

    it('exports the current environment without a solution', async () => {
        const environmentManager = {
            getEnvironmentVariables: jest.fn().mockReturnValue({ WINDOW_VALUE: 'current' }),
            getConfiguredEnvironmentVariables: jest.fn().mockReturnValue({ WINDOW_VALUE: 'current' }),
        } as unknown as EnvironmentManager;
        const owner = new ToolsEnvironment(environmentManager, extensionApiProviderFactory());
        const content = await owner.getToolsEnvironment();
        const document = yaml.parse(content);
        expect(validateToolsEnvironment(document)).toBe(true);
        expect(document['cmsis-tools-environment'].version).toBe('1.1.0');
        expect(document['cmsis-tools-environment']).not.toHaveProperty('solution');
        expect(document['cmsis-tools-environment'].environment.variables.WINDOW_VALUE).toBe('current');
    });

    it('exports an already-active environment without cached activation results', async () => {
        const compilerBin = path.join(tempDir, 'compiler', 'bin');
        const environmentManager = {
            getEnvironmentVariables: jest.fn().mockReturnValue({
                PATH: ['/unrelated/bin', compilerBin].join(path.delimiter),
                GCC_TOOLCHAIN_14_3_1: compilerBin,
                UNRELATED_VALUE: 'private',
            }),
            getConfiguredEnvironmentVariables: jest.fn().mockReturnValue({}),
        } as unknown as EnvironmentManager;
        const owner = new ToolsEnvironment(environmentManager, extensionApiProviderFactory({
            isActivating: jest.fn().mockReturnValue(false),
            getActiveTools: jest.fn().mockReturnValue([{
                name: 'gcc', path: 'bin/gcc', fullPath: path.join(compilerBin, 'gcc'),
            }]),
        }));

        const document = yaml.parse(await owner.getToolsEnvironment())['cmsis-tools-environment'];

        expect(document.environment.path).toContain(toPortablePath(compilerBin));
        expect(document.environment.path).not.toContain('/unrelated/bin');
        expect(document.environment.variables).toEqual({ GCC_TOOLCHAIN_14_3_1: toPortablePath(compilerBin) });
        expect(document.tools).toContainEqual(expect.objectContaining({
            name: 'gcc', directory: toPortablePath(compilerBin),
        }));
    });

    it('writes the resolved environment next to the solution', async () => {
        const artifactsRoot = path.join('/home/user', '.vcpkg', 'artifacts', 'registry');
        const toolboxRoot = path.join(artifactsRoot, 'tools.open.cmsis.pack.cmsis.toolbox', '2.14.1');
        const toolboxBin = path.join(toolboxRoot, 'bin');
        const gccRoot = path.join(artifactsRoot, 'compilers.arm.arm.none.eabi.gcc', '14.3.1');
        const gccBin = path.join(gccRoot, 'bin');
        const cmakeRoot = path.join(artifactsRoot, 'tools.kitware.cmake', '3.31.12');
        const cmakeBin = path.join(cmakeRoot, 'bin');
        const builtInToolboxBin = path.join(CMSIS_TOOLBOX_FOLDER, 'bin');
        const debuggerExtensionPath = path.join(tempDir, 'cmsis-debugger');
        const pyocdPath = path.join(debuggerExtensionPath, 'tools', 'pyocd');
        const gdbBin = path.join(debuggerExtensionPath, 'tools', 'gdb', 'bin');
        const sdsExtensionPath = path.join(tempDir, 'cmsis-sds');
        const sdsToolsPath = path.join(sdsExtensionPath, 'tools');

        fs.mkdirSync(pyocdPath, { recursive: true });
        fs.mkdirSync(gdbBin, { recursive: true });
        fs.mkdirSync(sdsToolsPath, { recursive: true });
        fs.writeFileSync(path.join(pyocdPath, 'version.txt'), '0.38.0\n');
        fs.writeFileSync(path.join(debuggerExtensionPath, 'tools', 'gdb', 'version.txt'), '15.2.rel1\n');
        fs.writeFileSync(path.join(sdsToolsPath, 'sdsio-server.exe'), '');
        fs.writeFileSync(path.join(sdsToolsPath, 'version.txt'), '1.2.3\n');
        (vscode.extensions.getExtension as jest.Mock).mockImplementation((extensionId: string) => {
            if (extensionId === 'arm.cmsis-csolution') {
                return { packageJSON: { version: '1.70.1-41-20260902' } };
            }
            if (extensionId === 'arm.vscode-cmsis-debugger') {
                return { extensionPath: debuggerExtensionPath };
            }
            if (extensionId === 'arm.cmsis-sds') {
                return { extensionPath: sdsExtensionPath };
            }
            return undefined;
        });
        const environmentManager = {
            getEnvironmentVariables: jest.fn().mockReturnValue({
                PATH: [
                    '/usr/local/bin', pyocdPath, builtInToolboxBin, toolboxBin, gccBin, cmakeBin, gdbBin, sdsToolsPath,
                ].join(path.delimiter),
                CMSIS_PACK_ROOT: '/packs',
                CMSIS_COMPILER_ROOT: '/compilers',
                ARM_CONFIGURED_VAR: 'configured',
                USERPROFILE: '/home/user',
            }),
            getConfiguredEnvironmentVariables: jest.fn().mockReturnValue({
                ARM_CONFIGURED_VAR: 'configured',
            }),
        } as unknown as EnvironmentManager;
        const installedTools: ActiveTool[] = [
            {
                name: 'tools.open.cmsis.pack.cmsis.toolbox',
                path: 'bin/cbuild',
                fullPath: path.join(toolboxBin, 'cbuild'),
            },
            {
                name: 'tools.open.cmsis.pyocd',
                path: 'bin/pyocd.exe',
                fullPath: '/vcpkg/pyocd/bin/pyocd.exe',
            },
            {
                name: 'tools.open.cmsis.arm-none-eabi-gdb',
                path: 'bin/arm-none-eabi-gdb.exe',
                fullPath: '/vcpkg/gdb/bin/arm-none-eabi-gdb.exe',
            },
            {
                name: 'tools.open.cmsis.cmake',
                path: 'bin/cmake',
                fullPath: path.join(cmakeBin, 'cmake'),
            },
        ];
        const vcpkgResults: VcpkgResults = {
            version: 1,
            variables: {
                GCC_TOOLCHAIN_14_3_1: gccBin,
            },
            paths: {
                PATH: [cmakeBin, gccBin, toolboxBin],
            },
            tools: {
                GCC_TOOLCHAIN_14_3_1: gccBin,
                cmake: path.join(cmakeBin, 'cmake'),
            },
        };
        const environmentManagerApiProvider = extensionApiProviderFactory({
            getActiveTools: jest.fn().mockReturnValue(installedTools),
        });
        const toolsEnvironment = new ToolsEnvironment(
            environmentManager,
            environmentManagerApiProvider,
            vcpkgResults,
        );
        const solutionPath = path.join('/workspace', 'project.csolution.yml');

        await toolsEnvironment.write(solutionPath);

        expect(fileSystem.write).toHaveBeenCalledWith(
            path.join('/workspace', '.cmsis', 'tools-environment.yml'),
            expect.any(String),
        );
        const content = fileSystem.write.mock.calls[0][1];
        expect(await toolsEnvironment.getToolsEnvironment(solutionPath)).toBe(content);
        expect(content).toBe(toolsEnvironment.render({
            folder: path.dirname(solutionPath), solutionPath, installedTools, vcpkgResults,
            environment: environmentManager.getEnvironmentVariables(),
            configuredVariables: environmentManager.getConfiguredEnvironmentVariables(),
        }));
        expect(yaml.parse(content)).toEqual({
            'cmsis-tools-environment': {
                version: '1.1.0',
                'generated-by': 'arm.cmsis-csolution version 1.70.1-41-20260902',
                solution: '../project.csolution.yml',
                environment: {
                    path: [pyocdPath, builtInToolboxBin, gccBin, cmakeBin, gdbBin, sdsToolsPath].map(toPortablePath),
                    variables: {
                        CMSIS_PACK_ROOT: '/packs',
                        CMSIS_COMPILER_ROOT: '/compilers',
                        ARM_CONFIGURED_VAR: 'configured',
                        GCC_TOOLCHAIN_14_3_1: toPortablePath(gccBin),
                    },
                },
                tools: [
                    {
                        name: 'pyOCD',
                        version: '0.38.0',
                        origin: 'built-in',
                        provider: {
                            type: 'vscode-extension',
                            id: 'arm.vscode-cmsis-debugger',
                        },
                        directory: toPortablePath(pyocdPath),
                        manual: 'https://pyocd.io/docs/',
                    },
                    {
                        name: 'CMSIS-Toolbox',
                        version: expect.stringMatching(/^\d+\.\d+\.\d+(?:[-+].+)?$/),
                        origin: 'built-in',
                        provider: {
                            type: 'vscode-extension',
                            id: 'arm.cmsis-csolution',
                        },
                        directory: toPortablePath(builtInToolboxBin),
                        manual: 'https://open-cmsis-pack.github.io/cmsis-toolbox/',
                    },
                    {
                        name: 'compilers.arm.arm.none.eabi.gcc',
                        version: '14.3.1',
                        origin: 'installed',
                        provider: {
                            type: 'vcpkg',
                            id: 'arm.environment-manager',
                        },
                        directory: toPortablePath(gccRoot),
                    },
                    {
                        name: 'tools.kitware.cmake',
                        version: '3.31.12',
                        origin: 'installed',
                        provider: {
                            type: 'vcpkg',
                            id: 'arm.environment-manager',
                        },
                        directory: toPortablePath(cmakeRoot),
                    },
                    {
                        name: 'Arm GNU GDB',
                        version: '15.2.rel1',
                        origin: 'built-in',
                        provider: {
                            type: 'vscode-extension',
                            id: 'arm.vscode-cmsis-debugger',
                        },
                        directory: toPortablePath(gdbBin),
                        manual: 'https://developer.arm.com/Tools%20and%20Software/GNU%20Toolchain',
                    },
                    {
                        name: 'sdsio-server',
                        version: '1.2.3',
                        origin: 'built-in',
                        provider: {
                            type: 'vscode-extension',
                            id: 'arm.cmsis-sds',
                        },
                        directory: toPortablePath(sdsToolsPath),
                        manual: 'https://arm-software.github.io/SDS-Framework/main/utilities.html#sdsio-server',
                    },
                ],
            },
        });
    });

    it.each(['unreadable', 'malformed'])('silently replaces %s output when Environment Manager is unavailable', async failure => {
        const environmentManager = {
            getEnvironmentVariables: jest.fn().mockReturnValue({
                PATH: '/configured/bin',
                CMSIS_SOLUTION_TOOLBOX: '/external/toolbox',
            }),
            getConfiguredEnvironmentVariables: jest.fn().mockReturnValue({
                PATH: '/configured/bin',
            }),
        } as unknown as EnvironmentManager;
        fileSystem.exists.mockReturnValue(true);
        fileSystem.read.mockImplementation(() => {
            if (failure === 'unreadable') {
                throw new Error('unreadable');
            }
            return 'invalid: [unterminated';
        });
        const errorReporter = jest.fn();
        TextFile.setErrorReporter(errorReporter);
        jest.spyOn(console, 'error').mockImplementation(() => undefined);
        const toolsEnvironment = new ToolsEnvironment(
            environmentManager,
            extensionApiProviderFactory(),
        );

        await toolsEnvironment.write(path.join('/workspace', 'project.csolution.yml'));

        expect(errorReporter).not.toHaveBeenCalled();
        const content = fileSystem.write.mock.calls[0][1];
        expect(yaml.parse(content)).toMatchObject({
            'cmsis-tools-environment': {
                environment: {
                    path: ['/configured/bin'],
                    variables: {},
                },
                tools: [],
            },
        });
    });

    it('waits for Environment Manager activation before capturing content', async () => {
        const environmentManager = {
            getEnvironmentVariables: jest.fn().mockReturnValue({}),
            getConfiguredEnvironmentVariables: jest.fn().mockReturnValue({}),
        } as unknown as EnvironmentManager;
        const activateEmitter = new vscode.EventEmitter<VcpkgResults>();
        const failEmitter = new vscode.EventEmitter<vscode.Uri>();
        let isActivating = true;
        const toolsEnvironment = new ToolsEnvironment(
            environmentManager,
            extensionApiProviderFactory({
                getActiveTools: jest.fn().mockReturnValue([]),
                isActivating: jest.fn(() => isActivating),
                onDidActivate: activateEmitter.event,
                onDidFailActivation: failEmitter.event,
            }),
        );

        const scheduling = toolsEnvironment.captureAndQueueWrite(path.join('/workspace', 'project.csolution.yml'));
        await Promise.resolve();
        expect(environmentManager.getEnvironmentVariables).not.toHaveBeenCalled();

        isActivating = false;
        activateEmitter.fire({ version: 1, variables: {}, paths: { PATH: [] }, tools: {} });
        await scheduling;

        expect(environmentManager.getEnvironmentVariables).toHaveBeenCalledTimes(1);
    });

    it('captures after Environment Manager activation fails', async () => {
        const environmentManager = {
            getEnvironmentVariables: jest.fn().mockReturnValue({}),
            getConfiguredEnvironmentVariables: jest.fn().mockReturnValue({}),
        } as unknown as EnvironmentManager;
        const activateEmitter = new vscode.EventEmitter<VcpkgResults>();
        const failEmitter = new vscode.EventEmitter<vscode.Uri>();
        let isActivating = true;
        let markWriteFinished!: () => void;
        const writeFinished = new Promise<void>(resolve => { markWriteFinished = resolve; });
        fileSystem.write.mockImplementation(() => { markWriteFinished(); });
        const toolsEnvironment = new ToolsEnvironment(
            environmentManager,
            extensionApiProviderFactory({
                getActiveTools: jest.fn().mockReturnValue([]),
                isActivating: jest.fn(() => isActivating),
                onDidActivate: activateEmitter.event,
                onDidFailActivation: failEmitter.event,
            }),
        );

        const scheduling = toolsEnvironment.captureAndQueueWrite(path.join('/workspace', 'project.csolution.yml'));
        await Promise.resolve();
        expect(environmentManager.getEnvironmentVariables).not.toHaveBeenCalled();

        isActivating = false;
        failEmitter.fire(vscode.Uri.file('/workspace'));
        await scheduling;
        await writeFinished;

        expect(environmentManager.getEnvironmentVariables).toHaveBeenCalledTimes(1);
    });

    it('captures immediately when Environment Manager activation is idle', async () => {
        const environmentManager = {
            getEnvironmentVariables: jest.fn().mockReturnValue({}),
            getConfiguredEnvironmentVariables: jest.fn().mockReturnValue({}),
        } as unknown as EnvironmentManager;
        const activateEmitter = new vscode.EventEmitter<VcpkgResults>();
        const failEmitter = new vscode.EventEmitter<vscode.Uri>();
        let markWriteFinished!: () => void;
        const writeFinished = new Promise<void>(resolve => { markWriteFinished = resolve; });
        fileSystem.write.mockImplementation(() => { markWriteFinished(); });
        const toolsEnvironment = new ToolsEnvironment(
            environmentManager,
            extensionApiProviderFactory({
                getActiveTools: jest.fn().mockReturnValue([]),
                isActivating: jest.fn(() => false),
                onDidActivate: activateEmitter.event,
                onDidFailActivation: failEmitter.event,
            }),
        );

        await toolsEnvironment.captureAndQueueWrite(path.join('/workspace', 'project.csolution.yml'));
        await writeFinished;

        expect(environmentManager.getEnvironmentVariables).toHaveBeenCalledTimes(1);
    });

    it('keeps queued writes in snapshot order', async () => {
        let configuredValue = 'first';
        const environmentManager = {
            getEnvironmentVariables: jest.fn(() => ({ CONFIGURED_VALUE: configuredValue })),
            getConfiguredEnvironmentVariables: jest.fn(() => ({ CONFIGURED_VALUE: configuredValue })),
        } as unknown as EnvironmentManager;
        let finishFirstWrite!: () => void;
        let markFirstWriteStarted!: () => void;
        const firstWriteStarted = new Promise<void>(resolve => { markFirstWriteStarted = resolve; });
        let markSecondWriteFinished!: () => void;
        const secondWriteFinished = new Promise<void>(resolve => { markSecondWriteFinished = resolve; });
        const save = YamlFile.prototype.save;
        jest.spyOn(YamlFile.prototype, 'save').mockImplementationOnce(async function (this: YamlFile) {
            markFirstWriteStarted();
            await new Promise<void>(resolve => { finishFirstWrite = resolve; });
            return save.call(this);
        });
        fileSystem.write.mockImplementationOnce(() => undefined)
            .mockImplementationOnce(() => { markSecondWriteFinished(); });
        const toolsEnvironment = new ToolsEnvironment(
            environmentManager,
            extensionApiProviderFactory(),
        );
        const solutionPath = path.join('/workspace', 'project.csolution.yml');

        await toolsEnvironment.captureAndQueueWrite(solutionPath);
        await firstWriteStarted;
        configuredValue = 'second';
        await toolsEnvironment.captureAndQueueWrite(solutionPath);
        expect(fileSystem.write).not.toHaveBeenCalled();

        finishFirstWrite();
        await secondWriteFinished;

        expect(fileSystem.write).toHaveBeenCalledTimes(2);
        const firstContent = fileSystem.write.mock.calls[0][1];
        const secondContent = fileSystem.write.mock.calls[1][1];
        expect(firstContent).toContain('CONFIGURED_VALUE: first');
        expect(secondContent).toContain('CONFIGURED_VALUE: second');
    });

    it('continues queued writes after an earlier write fails', async () => {
        let configuredValue = 'first';
        const environmentManager = {
            getEnvironmentVariables: jest.fn(() => ({ CONFIGURED_VALUE: configuredValue })),
            getConfiguredEnvironmentVariables: jest.fn(() => ({ CONFIGURED_VALUE: configuredValue })),
        } as unknown as EnvironmentManager;
        const writeError = new Error('write failed');
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        let finishFirstWrite!: () => void;
        let markFirstWriteStarted!: () => void;
        const firstWriteStarted = new Promise<void>(resolve => { markFirstWriteStarted = resolve; });
        let markSecondWriteFinished!: () => void;
        const secondWriteFinished = new Promise<void>(resolve => { markSecondWriteFinished = resolve; });
        const save = YamlFile.prototype.save;
        jest.spyOn(YamlFile.prototype, 'save').mockImplementationOnce(async function (this: YamlFile) {
            markFirstWriteStarted();
            await new Promise<void>(resolve => { finishFirstWrite = resolve; });
            return save.call(this);
        });
        fileSystem.write.mockImplementationOnce(() => { throw writeError; })
            .mockImplementationOnce(() => { markSecondWriteFinished(); });
        const toolsEnvironment = new ToolsEnvironment(
            environmentManager,
            extensionApiProviderFactory(),
        );
        const solutionPath = path.join('/workspace', 'project.csolution.yml');

        try {
            await toolsEnvironment.captureAndQueueWrite(solutionPath);
            await firstWriteStarted;
            configuredValue = 'second';
            await toolsEnvironment.captureAndQueueWrite(solutionPath);
            expect(fileSystem.write).not.toHaveBeenCalled();

            finishFirstWrite();
            await secondWriteFinished;

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                `Failed to write tools environment for '${solutionPath}'`,
                expect.objectContaining({ message: expect.stringContaining('write failed') }),
            );
            expect(fileSystem.write).toHaveBeenCalledTimes(2);
            expect(fileSystem.write.mock.calls[1][1]).toContain('CONFIGURED_VALUE: second');
        } finally {
            consoleErrorSpy.mockRestore();
        }
    });

    it('preserves resolved PATH precedence when vcpkg variables contain mixed-case Path', async () => {
        const builtInToolboxBin = path.join(CMSIS_TOOLBOX_FOLDER, 'bin');
        const environmentManager = {
            getEnvironmentVariables: jest.fn().mockReturnValue({
                PATH: [builtInToolboxBin, '/stale/bin'].join(path.delimiter),
            }),
            getConfiguredEnvironmentVariables: jest.fn().mockReturnValue({}),
        } as unknown as EnvironmentManager;
        const vcpkgPath = path.join('/vcpkg', 'tool', 'bin');
        const toolsEnvironment = new ToolsEnvironment(
            environmentManager,
            extensionApiProviderFactory(),
            {
                version: 1,
                variables: { Path: vcpkgPath },
                paths: { PATH: [vcpkgPath] },
                tools: {},
            },
        );

        await toolsEnvironment.write(path.join('/workspace', 'project.csolution.yml'));

        const content = fileSystem.write.mock.calls[0][1];
        expect(yaml.parse(content)['cmsis-tools-environment'].environment).toEqual({
            path: [builtInToolboxBin, vcpkgPath].map(toPortablePath),
            variables: {},
        });
    });

    it('writes a document conforming to the tools environment schema', async () => {
        const environmentManager = {
            getEnvironmentVariables: jest.fn().mockReturnValue({
                PATH: '/configured/bin',
                CMSIS_SOLUTION_TOOLBOX: '/external/toolbox',
            }),
            getConfiguredEnvironmentVariables: jest.fn().mockReturnValue({
                PATH: '/configured/bin',
            }),
        } as unknown as EnvironmentManager;
        const toolsEnvironment = new ToolsEnvironment(
            environmentManager,
            extensionApiProviderFactory({
                getActiveTools: jest.fn().mockReturnValue([{
                    name: 'configured-tool',
                    path: 'bin/configured-tool',
                    fullPath: '/configured/bin/configured-tool',
                }]),
            }),
        );

        await toolsEnvironment.write(path.join('/workspace', 'project.csolution.yml'));

        const document = yaml.parse(fileSystem.write.mock.calls[0][1]);
        expect(validateToolsEnvironment(document)).toBe(true);
        expect(validateToolsEnvironment.errors).toBeNull();
    });

    it('uses unknown versions when extension metadata files are unavailable', async () => {
        const debuggerExtensionPath = path.join(tempDir, 'cmsis-debugger-without-metadata');
        const pyocdPath = path.join(debuggerExtensionPath, 'tools', 'pyocd');
        const gdbBin = path.join(debuggerExtensionPath, 'tools', 'gdb', 'bin');
        (vscode.extensions.getExtension as jest.Mock).mockImplementation((extensionId: string) => {
            if (extensionId === 'arm.vscode-cmsis-debugger') {
                return { extensionPath: debuggerExtensionPath };
            }
            return undefined;
        });
        const environmentManager = {
            getEnvironmentVariables: jest.fn().mockReturnValue({
                PATH: [pyocdPath, gdbBin].join(path.delimiter),
            }),
            getConfiguredEnvironmentVariables: jest.fn().mockReturnValue({}),
        } as unknown as EnvironmentManager;
        const toolsEnvironment = new ToolsEnvironment(
            environmentManager,
            extensionApiProviderFactory(),
        );

        await toolsEnvironment.write(path.join('/workspace', 'project.csolution.yml'));

        const document = yaml.parse(fileSystem.write.mock.calls[0][1]);
        expect(document['cmsis-tools-environment']['generated-by']).toBe('arm.cmsis-csolution version unknown');
        expect(document['cmsis-tools-environment'].tools).toEqual(expect.arrayContaining([
            expect.objectContaining({
                name: 'pyOCD',
                version: 'unknown',
                directory: toPortablePath(pyocdPath),
            }),
            expect.objectContaining({
                name: 'Arm GNU GDB',
                version: 'unknown',
                directory: toPortablePath(gdbBin),
            }),
        ]));
    });

    it('requires directory as the installed tool location', () => {
        const baseDocument = {
            'cmsis-tools-environment': {
                version: '1.1.0',
                'generated-by': 'arm.cmsis-csolution version 1.70.0',
                solution: '../project.csolution.yml',
                environment: { path: [], variables: {} },
                tools: [],
            },
        };
        const provider = { type: 'vcpkg', id: 'Arm.environment-manager' };
        const document = JSON.parse(JSON.stringify(baseDocument));
        document['cmsis-tools-environment'].tools.push({
            name: 'tool', origin: 'installed', provider, directory: '/package',
        });
        expect(validateToolsEnvironment(document)).toBe(true);

        document['cmsis-tools-environment'].tools[0] = {
            name: 'tool', origin: 'installed', provider, executable: '/package/bin/tool',
        };
        expect(validateToolsEnvironment(document)).toBe(false);
    });
});
