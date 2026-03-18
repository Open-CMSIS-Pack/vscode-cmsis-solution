/**
 * Copyright 2022-2026 Arm Limited
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

import 'jest';
import * as path from 'path';
import dedent from 'dedent';
import { setContext as setContextImport } from '@eclipse-cdt-cloud/clangd-contexts';
import { clangDActiveContextKey, ClangdManager, ClangdConfig } from './clangd-manager';
import { MockConfigurationProvider, configurationProviderFactory } from '../vscode-api/configuration-provider.factories';
import { ArmclangDefineGetter } from './intellisense/armclang-define-getter';
import { waitTimeout } from '../__test__/test-waits';
import { workspaceFsProviderFactory } from '../vscode-api/workspace-fs-provider.factories';
import { CONFIG_CLANGD_ARGUMENTS, CONFIG_CLANGD_EXTNAME, CONFIG_CLANGD_GENERATE_SETUP } from '../manifest';
import { MockCommandsProvider, commandsProviderFactory } from '../vscode-api/commands-provider.factories';
import { MockSolutionManager, solutionManagerFactory } from './solution-manager.factories';
import { CompileCommandsParser } from './intellisense/compile-commands-parser';
import { ExtensionContext, Memento } from 'vscode';
import { mementoFactory } from '../vscode-api/memento.factories';
import { faker } from '@faker-js/faker';
import { ContextDescriptor } from './descriptors/descriptors';
import { CSolution } from './csolution';
import { cbuildIdxFileFactory } from './files/cbuild-idx-file.factory';
import { URI } from 'vscode-uri';

jest.mock('@eclipse-cdt-cloud/clangd-contexts', () => ({
    setContext: jest.fn()
}));

const mockSetContext = setContextImport as jest.Mock;
type MockArmclangDefineGetter = jest.Mocked<ArmclangDefineGetter>;
type MockCompileCommandsParser = jest.Mocked<Pick<CompileCommandsParser, 'getAllIncludeCommands'>>;
const mockFs = workspaceFsProviderFactory();
const TEST_DEBOUNCE_MILLIS = 1;

class ClangdManagerTest extends ClangdManager {
    async getConfigFragments(configFilePath: URI) {
        return super.getConfigFragments(configFilePath);
    }

    async writeConfigFragments(newFragments: ClangdConfig[], configFilePath: URI) {
        return super.writeConfigFragments(newFragments, configFilePath);
    }
}

describe('ClangdManagerTest', () => {
    let clangdManager: ClangdManagerTest;

    const configPath = URI.file(faker.system.filePath());
    const clangdConfig = dedent`
        ---
        If:
          PathMatch: 'Debug'
        CompileFlags:
          CompilationDatabase: >-
            Debug
          Add:
            - '-DDEBUG'
        ---
        If:  
          PathMatch: 'Release'
        CompileFlags:
          CompilationDatabase: >-
            Release
          Add:
            - '-DNDEBUG'
        `;
    const configFragments: ClangdConfig[] = [
        {
            If: {
                PathMatch: 'Debug'
            },
            CompileFlags: {
                CompilationDatabase: 'Debug',
                Add: ['-DDEBUG']
            }
        },
        {
            If: {
                PathMatch: 'Release'
            },
            CompileFlags: {
                CompilationDatabase: 'Release',
                Add: ['-DNDEBUG']
            }
        }
    ];

    beforeEach(() => {
        clangdManager = new ClangdManagerTest(
            {} as unknown as MockSolutionManager,
            {} as unknown as MockConfigurationProvider,
            {} as unknown as MockArmclangDefineGetter,
            {} as unknown as MockCompileCommandsParser,
            mockFs,
            {} as unknown as MockCommandsProvider,
            TEST_DEBOUNCE_MILLIS,
        );
    });

    describe('getConfigFragments', () => {
        it('Load multi-fragment config', async () => {
            mockFs.readUtf8File.mockResolvedValue(clangdConfig);
            const fragments = await clangdManager.getConfigFragments(configPath);
            expect(fragments).toEqual(configFragments);
            expect(mockFs.readUtf8File).toHaveBeenCalledWith(configPath.fsPath);
        });
    });

    describe('writeConfigFragments', () => {
        it('writes config fragments to file', async () => {
            clangdManager.getConfigFragments = jest.fn().mockResolvedValue(configFragments);
            await clangdManager.writeConfigFragments(configFragments, configPath);
            expect(mockFs.createDirectory).toHaveBeenCalledWith(path.dirname(configPath.fsPath));
            expect(mockFs.writeUtf8File).toHaveBeenCalledWith(configPath.fsPath, expect.yamlEquals(clangdConfig));
        });
    });
});

describe('ClangdManager', () => {
    let clangdManager: ClangdManager;
    let stubWorkspaceState: Memento;
    let mockSolutionManager: MockSolutionManager;
    let mockConfigurationProvider: MockConfigurationProvider;

    const mockCommandsProvider: MockCommandsProvider = commandsProviderFactory();
    const mockArmclangDefineGetter: MockArmclangDefineGetter = { getClangdDefineFlags: jest.fn() } as unknown as MockArmclangDefineGetter;
    const mockCompileCommandsParser: MockCompileCommandsParser = { getAllIncludeCommands: jest.fn() } as unknown as MockCompileCommandsParser;

    const rootPath = path.join(__dirname, 'some', 'path');
    const solutionPath = path.join(rootPath, 'solution.csolution.yml');
    const activeContexts: ContextDescriptor[] = [
        {
            displayName: 'Project1.BuildType-1+TargetType-1',
            targetType: 'TargetType-1',
            buildType: 'BuildType-1',
            projectPath: path.join(rootPath, 'Project1', 'Project1.cproject.yml'),
            projectName: 'Project1',
        },
        {
            displayName: 'Project2.BuildType-2+TargetType-1',
            targetType: 'TargetType-1',
            buildType: 'BuildType-2',
            projectPath: path.join(rootPath, 'Project2', 'Project2.cproject.yml'),
            projectName: 'Project2',
        }
    ];

    const compileCommandsDirFlag = (projectPath: string | undefined) => `--compile-commands-dir=${path.join(path.dirname(projectPath!), 'out')}`;

    beforeEach(async () => {
        mockConfigurationProvider = configurationProviderFactory({
            [CONFIG_CLANGD_GENERATE_SETUP]: true,
            [CONFIG_CLANGD_ARGUMENTS]: [],
        });

        const mockCSolution = {} as jest.Mocked<CSolution>;
        mockCSolution.solutionPath = solutionPath;
        mockCSolution.getContextDescriptors = jest.fn().mockReturnValue(activeContexts);
        mockCSolution.getContextDescriptor = jest.fn().mockReturnValue(activeContexts[0]);
        mockCSolution.cbuildIdxFile = cbuildIdxFileFactory({ activeContexts });

        mockSolutionManager = solutionManagerFactory({
            getCsolution: jest.fn(() => mockCSolution),
        });

        clangdManager = new ClangdManager(
            mockSolutionManager,
            mockConfigurationProvider,
            mockArmclangDefineGetter,
            mockCompileCommandsParser,
            mockFs,
            mockCommandsProvider,
            TEST_DEBOUNCE_MILLIS,
        );

        const defineFlags = [
            '-D__ARMCC_VERSION=6210000',
            '-D__ARMCOMPILER_VERSION=6210000'
        ];
        const includeFlags = [
            '-I/fake/path/a',
            '-I/fake/path/b',
        ];
        mockArmclangDefineGetter.getClangdDefineFlags.mockResolvedValue(defineFlags);
        mockCompileCommandsParser.getAllIncludeCommands.mockResolvedValue(includeFlags);

        jest.clearAllMocks();
        stubWorkspaceState = mementoFactory();
        await clangdManager.activate({ workspaceState: stubWorkspaceState, subscriptions: [] } as unknown as ExtensionContext);
    });

    it('generates a clangd file for each context when the context list changes and the auto generate configuration is true', async () => {
        mockConfigurationProvider.getConfigVariable.mockReturnValue(true);
        mockConfigurationProvider.setConfigVariable.mockReturnValue(Promise.resolve());

        mockSolutionManager.onUpdatedCompileCommandsEmitter.fire();

        await waitTimeout();

        expect(mockSetContext).toHaveBeenCalledTimes(2);

        expect(mockConfigurationProvider.setConfigVariable).toHaveBeenCalledWith(
            CONFIG_CLANGD_ARGUMENTS,
            [expect.lowercaseEquals(compileCommandsDirFlag(activeContexts[0].projectPath))],
            CONFIG_CLANGD_EXTNAME,
            true,
        );

        const state = stubWorkspaceState.get<Record<string, string>>(clangDActiveContextKey);
        const solutionPath = mockSolutionManager!.getCsolution()!.solutionPath;
        expect(state).toBeDefined();
        expect(solutionPath in state!).toBeTruthy();
        expect(state![solutionPath]).toEqual(activeContexts[0].projectPath);
    });

    it('loads clangd context from workspace state', async () => {
        mockConfigurationProvider.getConfigVariable.mockReturnValue(true);
        mockConfigurationProvider.setConfigVariable.mockReturnValue(Promise.resolve());
        mockFs.exists.mockResolvedValue(false);

        const solutionPath = mockSolutionManager!.getCsolution()!.solutionPath;
        stubWorkspaceState.update(clangDActiveContextKey, {
            [solutionPath]: activeContexts[1].projectPath,
        });

        mockSolutionManager.onUpdatedCompileCommandsEmitter.fire();

        await waitTimeout();

        expect(mockConfigurationProvider.setConfigVariable).toHaveBeenCalledWith(
            CONFIG_CLANGD_ARGUMENTS,
            [expect.lowercaseEquals(compileCommandsDirFlag(activeContexts[1].projectPath))],
            CONFIG_CLANGD_EXTNAME,
            true,
        );

        const state = stubWorkspaceState.get<Record<string, string>>(clangDActiveContextKey);
        expect(state).toBeDefined();
        expect(solutionPath in state!).toBeTruthy();
        expect(state![solutionPath]).toEqual(activeContexts[1].projectPath);

        const diagnosticsSuppress = 'Diagnostics:\n  Suppress: [\'*\']';
        const expectedOutDir1 = mockSolutionManager.getCsolution()?.cbuildIdxFile?.cbuildFiles?.get(activeContexts[0].projectName)?.outDir;
        const expectedOutDir2 = mockSolutionManager.getCsolution()?.cbuildIdxFile?.cbuildFiles?.get(activeContexts[1].projectName)?.outDir;
        expect(mockFs.writeUtf8File).toHaveBeenCalledWith(
            expect.lowercaseEquals(path.join(expectedOutDir1!, '.clangd')),
            diagnosticsSuppress,
        );
        expect(mockFs.writeUtf8File).toHaveBeenCalledWith(
            expect.lowercaseEquals(path.join(expectedOutDir2!, '.clangd')),
            diagnosticsSuppress,
        );
    });

    it('set default clangd context if context in workspace state is invalid', async () => {
        mockConfigurationProvider.getConfigVariable.mockReturnValue(true);
        mockConfigurationProvider.setConfigVariable.mockReturnValue(Promise.resolve());

        const solutionPath = mockSolutionManager!.getCsolution()!.solutionPath;
        stubWorkspaceState.update(clangDActiveContextKey, {
            [solutionPath]: faker.system.filePath(),
        });

        mockSolutionManager.onUpdatedCompileCommandsEmitter.fire();

        await waitTimeout();

        const state = stubWorkspaceState.get<Record<string, string>>(clangDActiveContextKey);
        expect(state).toBeDefined();
        expect(solutionPath in state!).toBeTruthy();
        expect(state![solutionPath]).toEqual(activeContexts[0].projectPath);
    });

    it('resets invalid workspace state', async () => {
        mockConfigurationProvider.getConfigVariable.mockReturnValue(true);
        mockConfigurationProvider.setConfigVariable.mockReturnValue(Promise.resolve());

        const solutionPath = mockSolutionManager!.getCsolution()!.solutionPath;
        stubWorkspaceState.update(clangDActiveContextKey, solutionPath);

        mockSolutionManager.onUpdatedCompileCommandsEmitter.fire();

        await waitTimeout();

        const state = stubWorkspaceState.get<Record<string, string>>(clangDActiveContextKey);
        expect(state).toBeDefined();
        expect(solutionPath in state!).toBeTruthy();
    });

    it('does not generate a clangd file for each context when the context changes but the auto generate configuration is false', async () => {
        mockConfigurationProvider.getConfigVariable.mockReturnValue(false);
        mockConfigurationProvider.setConfigVariable.mockReturnValue(Promise.resolve());

        mockSolutionManager.onUpdatedCompileCommandsEmitter.fire();
        await waitTimeout();

        expect(mockSetContext).toHaveBeenCalledTimes(0);
    });

    it('generates a clangd file when compile_macros.h is available', async () => {
        mockConfigurationProvider.getConfigVariable.mockReturnValue(true);
        mockConfigurationProvider.setConfigVariable.mockReturnValue(Promise.resolve());
        const csolution = mockSolutionManager.getCsolution();
        csolution!.getContextDescriptors = jest.fn().mockReturnValue([activeContexts[0]]);
        mockFs.exists.mockResolvedValue(true);

        const compileMacrosFile = path.join(path.dirname(activeContexts[0].projectPath!), 'out', 'compile_macros.h');

        mockSolutionManager.onUpdatedCompileCommandsEmitter.fire();
        await waitTimeout();

        expect(mockFs.writeUtf8File).toHaveBeenCalledTimes(1);
        const [writtenPath, writtenContent] = mockFs.writeUtf8File.mock.calls[0];
        expect(writtenPath).toEqual(expect.lowercaseEquals(path.join(path.dirname(activeContexts[0].projectPath!), '.clangd')));
        expect(writtenContent).toContain('-include');
        expect(writtenContent.toLowerCase()).toContain(compileMacrosFile.toLowerCase());
    });

    it('writes diagnostics suppress .clangd in outDir when missing', async () => {
        const csolution = mockSolutionManager.getCsolution();
        const context = activeContexts[0];
        const outDir = csolution?.cbuildIdxFile?.cbuildFiles?.get(context.projectName)?.outDir;
        const expectedClangdPath = path.join(outDir!, '.clangd');

        mockFs.exists.mockResolvedValue(false);

        await (clangdManager as unknown as {
            setClangdConfigDiagnosticsSuppress: (contextDescriptor: ContextDescriptor) => Promise<void>;
        }).setClangdConfigDiagnosticsSuppress(context);

        expect(mockFs.exists).toHaveBeenCalledWith(expect.lowercaseEquals(expectedClangdPath));
        expect(mockFs.writeUtf8File).toHaveBeenCalledWith(expect.lowercaseEquals(expectedClangdPath), 'Diagnostics:\n  Suppress: [\'*\']');
    });
});
