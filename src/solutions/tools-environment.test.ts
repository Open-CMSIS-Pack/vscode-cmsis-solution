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
import { ActiveTool, VcpkgResults } from '@arm-software/vscode-environment-manager';
import { EnvironmentManager } from '../desktop/env-manager';
import { CMSIS_TOOLBOX_FOLDER } from '../manifest';
import { extensionApiProviderFactory } from '../vscode-api/extension-api-provider.factories';
import { workspaceFsProviderFactory } from '../vscode-api/workspace-fs-provider.factories';
import { ToolsEnvironment } from './tools-environment';

describe('ToolsEnvironment', () => {
    const toolsEnvironmentSchema = JSON.parse(fs.readFileSync(
        path.join(__dirname, '../../schemas/tools-environment.schema.json'),
        'utf8',
    ));
    const ajv = new Ajv({ strict: true });
    addFormats(ajv);
    const validateToolsEnvironment = ajv.compile(toolsEnvironmentSchema);
    const toPortablePath = (value: string): string => value.replace(/\\/g, '/');

    beforeEach(() => {
        (vscode.extensions.getExtension as jest.Mock).mockReturnValue(undefined);
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
        const debuggerExtensionPath = fs.mkdtempSync(path.join(__dirname, 'cmsis-debugger-'));
        const pyocdPath = path.join(debuggerExtensionPath, 'tools', 'pyocd');
        const gdbBin = path.join(debuggerExtensionPath, 'tools', 'gdb', 'bin');
        fs.mkdirSync(pyocdPath, { recursive: true });
        fs.mkdirSync(gdbBin, { recursive: true });
        fs.writeFileSync(path.join(pyocdPath, 'version.txt'), '0.38.0\n');
        fs.writeFileSync(path.join(debuggerExtensionPath, 'tools', 'gdb', 'version.txt'), '15.2.rel1\n');
        (vscode.extensions.getExtension as jest.Mock).mockImplementation((extensionId: string) => {
            if (extensionId === 'arm.cmsis-csolution') {
                return { packageJSON: { version: '1.70.1-41-20260902' } };
            }
            if (extensionId === 'arm.vscode-cmsis-debugger') {
                return { extensionPath: debuggerExtensionPath };
            }
            return undefined;
        });
        const environmentManager = {
            getEnvironmentVariables: jest.fn().mockReturnValue({
                PATH: [
                    '/usr/local/bin', pyocdPath, builtInToolboxBin, toolboxBin, gccBin, cmakeBin, gdbBin,
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
        const workspaceFsProvider = workspaceFsProviderFactory();
        const toolsEnvironment = new ToolsEnvironment(
            environmentManager,
            environmentManagerApiProvider,
            workspaceFsProvider,
            vcpkgResults,
        );
        const solutionPath = path.join('/workspace', 'project.csolution.yml');

        await toolsEnvironment.write(solutionPath);

        expect(workspaceFsProvider.createDirectory).toHaveBeenCalledWith(path.join('/workspace', '.cmsis'));
        expect(workspaceFsProvider.writeUtf8File).toHaveBeenCalledWith(
            path.join('/workspace', '.cmsis', 'tools-environment.yml'),
            expect.any(String),
        );
        const content = workspaceFsProvider.writeUtf8File.mock.calls[0][1];
        expect(yaml.parse(content)).toEqual({
            'cmsis-tools-environment': {
                version: '1.0.0',
                'generated-by': 'arm.cmsis-csolution version 1.70.1-41-20260902',
                solution: '../project.csolution.yml',
                environment: {
                    path: [pyocdPath, builtInToolboxBin, gccBin, cmakeBin, gdbBin].map(toPortablePath),
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
                        version: expect.stringMatching(/^2\.14\.1-/),
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
                ],
            },
        });

        workspaceFsProvider.readUtf8File.mockResolvedValue(content);
        workspaceFsProvider.createDirectory.mockClear();
        workspaceFsProvider.writeUtf8File.mockClear();

        await toolsEnvironment.write(solutionPath);

        expect(workspaceFsProvider.createDirectory).not.toHaveBeenCalled();
        expect(workspaceFsProvider.writeUtf8File).not.toHaveBeenCalled();

        fs.rmSync(debuggerExtensionPath, { recursive: true, force: true });
    });

    it('writes a minimal environment when Environment Manager is unavailable and replaces unreadable output', async () => {
        const environmentManager = {
            getEnvironmentVariables: jest.fn().mockReturnValue({
                PATH: '/configured/bin',
                CMSIS_SOLUTION_TOOLBOX: '/external/toolbox',
            }),
            getConfiguredEnvironmentVariables: jest.fn().mockReturnValue({
                PATH: '/configured/bin',
            }),
        } as unknown as EnvironmentManager;
        const workspaceFsProvider = workspaceFsProviderFactory();
        workspaceFsProvider.readUtf8File.mockRejectedValue(new Error('unreadable'));
        const toolsEnvironment = new ToolsEnvironment(
            environmentManager,
            extensionApiProviderFactory(),
            workspaceFsProvider,
        );

        await toolsEnvironment.write(path.join('/workspace', 'project.csolution.yml'));

        const content = workspaceFsProvider.writeUtf8File.mock.calls[0][1];
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
            workspaceFsProviderFactory(),
        );

        const scheduling = toolsEnvironment.captureAndQueueWrite(path.join('/workspace', 'project.csolution.yml'));
        await Promise.resolve();
        expect(environmentManager.getEnvironmentVariables).not.toHaveBeenCalled();

        isActivating = false;
        activateEmitter.fire({ version: 1, variables: {}, paths: { PATH: [] }, tools: {} });
        await scheduling;

        expect(environmentManager.getEnvironmentVariables).toHaveBeenCalledTimes(1);
    });

    it('keeps queued writes in snapshot order', async () => {
        let configuredValue = 'first';
        const environmentManager = {
            getEnvironmentVariables: jest.fn(() => ({ CONFIGURED_VALUE: configuredValue })),
            getConfiguredEnvironmentVariables: jest.fn(() => ({ CONFIGURED_VALUE: configuredValue })),
        } as unknown as EnvironmentManager;
        const workspaceFsProvider = workspaceFsProviderFactory();
        let finishFirstWrite!: () => void;
        let markFirstWriteStarted!: () => void;
        const firstWriteStarted = new Promise<void>(resolve => { markFirstWriteStarted = resolve; });
        let markSecondWriteFinished!: () => void;
        const secondWriteFinished = new Promise<void>(resolve => { markSecondWriteFinished = resolve; });
        workspaceFsProvider.writeUtf8File
            .mockImplementationOnce(() => {
                markFirstWriteStarted();
                return new Promise<void>(resolve => { finishFirstWrite = resolve; });
            })
            .mockImplementationOnce(async () => { markSecondWriteFinished(); });
        const toolsEnvironment = new ToolsEnvironment(
            environmentManager,
            extensionApiProviderFactory(),
            workspaceFsProvider,
        );
        const solutionPath = path.join('/workspace', 'project.csolution.yml');

        await toolsEnvironment.captureAndQueueWrite(solutionPath);
        await firstWriteStarted;
        configuredValue = 'second';
        await toolsEnvironment.captureAndQueueWrite(solutionPath);
        expect(workspaceFsProvider.writeUtf8File).toHaveBeenCalledTimes(1);

        finishFirstWrite();
        await secondWriteFinished;

        expect(workspaceFsProvider.writeUtf8File).toHaveBeenCalledTimes(2);
        const firstContent = workspaceFsProvider.writeUtf8File.mock.calls[0][1];
        const secondContent = workspaceFsProvider.writeUtf8File.mock.calls[1][1];
        expect(firstContent).toContain('CONFIGURED_VALUE: first');
        expect(secondContent).toContain('CONFIGURED_VALUE: second');
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
        const workspaceFsProvider = workspaceFsProviderFactory();
        const toolsEnvironment = new ToolsEnvironment(
            environmentManager,
            extensionApiProviderFactory(),
            workspaceFsProvider,
            {
                version: 1,
                variables: { Path: vcpkgPath },
                paths: { PATH: [vcpkgPath] },
                tools: {},
            },
        );

        await toolsEnvironment.write(path.join('/workspace', 'project.csolution.yml'));

        const content = workspaceFsProvider.writeUtf8File.mock.calls[0][1];
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
        const workspaceFsProvider = workspaceFsProviderFactory();
        const toolsEnvironment = new ToolsEnvironment(
            environmentManager,
            extensionApiProviderFactory({
                getActiveTools: jest.fn().mockReturnValue([{
                    name: 'configured-tool',
                    path: 'bin/configured-tool',
                    fullPath: '/configured/bin/configured-tool',
                }]),
            }),
            workspaceFsProvider,
        );

        await toolsEnvironment.write(path.join('/workspace', 'project.csolution.yml'));

        const document = yaml.parse(workspaceFsProvider.writeUtf8File.mock.calls[0][1]);
        expect(validateToolsEnvironment(document)).toBe(true);
        expect(validateToolsEnvironment.errors).toBeNull();
    });

    it('requires directory as the installed tool location', () => {
        const baseDocument = {
            'cmsis-tools-environment': {
                version: '1.0.0',
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
