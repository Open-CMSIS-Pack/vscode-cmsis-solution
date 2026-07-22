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
import yaml from 'yaml';
import { clangDActiveContextKey, ClangdManager } from './clangd-manager';
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
import { cbuildFileFactory } from './files/cbuild-file.factory';

type MockArmclangDefineGetter = jest.Mocked<ArmclangDefineGetter>;
type MockCompileCommandsParser = jest.Mocked<Pick<CompileCommandsParser, 'getAllIncludeCommands'>>;
const mockFs = workspaceFsProviderFactory();
const TEST_DEBOUNCE_MILLIS = 1;

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

        expect(mockFs.writeUtf8File).toHaveBeenCalledTimes(2);

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

        expect(mockFs.writeUtf8File).not.toHaveBeenCalled();
    });

    it('generates language-specific clangd fragments when compile macros headers are available', async () => {
        mockConfigurationProvider.getConfigVariable.mockReturnValue(true);
        mockConfigurationProvider.setConfigVariable.mockReturnValue(Promise.resolve());
        const csolution = mockSolutionManager.getCsolution();
        csolution!.getContextDescriptors = jest.fn().mockReturnValue([activeContexts[0]]);
        mockFs.exists.mockResolvedValue(true);
        mockFs.readUtf8File.mockResolvedValue('If:\n  PathMatch: stale\nCompileFlags:\n  Add: [-DSTALE]\n');

        const outputDirectory = path.join(path.dirname(activeContexts[0].projectPath!), 'out');
        const compileMacrosCFile = path.join(outputDirectory, 'compile_macros_c.h');
        const compileMacrosCxxFile = path.join(outputDirectory, 'compile_macros_cxx.h');

        mockSolutionManager.onUpdatedCompileCommandsEmitter.fire();
        await waitTimeout();

        expect(mockFs.writeUtf8File).toHaveBeenCalledTimes(1);
        expect(mockFs.readUtf8File).not.toHaveBeenCalled();
        const [writtenPath, writtenContent] = mockFs.writeUtf8File.mock.calls[0];
        expect(writtenPath).toEqual(expect.lowercaseEquals(path.join(path.dirname(activeContexts[0].projectPath!), '.clangd')));
        const generatedFragments = yaml.parseAllDocuments(writtenContent)
            .map(document => document.toJS())
            .filter(fragment => fragment.If?.PathMatch?.startsWith('.*'));
        expect(writtenContent).not.toContain('stale');
        expect(writtenContent).not.toContain('-DSTALE');
        expect(generatedFragments).toHaveLength(2);
        expect(generatedFragments).toContainEqual(expect.objectContaining({
            If: { PathMatch: '.*\\.(c|C|h)$' },
            CompileFlags: expect.objectContaining({ Add: ['-include', expect.lowercaseEquals(compileMacrosCFile)] })
        }));
        expect(generatedFragments).toContainEqual(expect.objectContaining({
            If: { PathMatch: '.*\\.(cpp|c\\+\\+|C\\+\\+|cxx|cc|CC|hpp)$' },
            CompileFlags: expect.objectContaining({ Add: ['-include', expect.lowercaseEquals(compileMacrosCxxFile)] })
        }));
    });

    it.each([
        ['C', 'compile_macros_c.h', '.*\\.(c|C|h)$'],
        ['C++', 'compile_macros_cxx.h', '.*\\.(cpp|c\\+\\+|C\\+\\+|cxx|cc|CC|hpp)$'],
    ])('generates a clangd fragment for a %s-only project', async (_, availableFile, expectedPathMatch) => {
        mockConfigurationProvider.getConfigVariable.mockReturnValue(true);
        mockConfigurationProvider.setConfigVariable.mockReturnValue(Promise.resolve());
        const csolution = mockSolutionManager.getCsolution();
        csolution!.getContextDescriptors = jest.fn().mockReturnValue([activeContexts[0]]);
        mockFs.exists.mockImplementation(async filePath => filePath.endsWith(availableFile));

        mockSolutionManager.onUpdatedCompileCommandsEmitter.fire();
        await waitTimeout();

        expect(mockFs.writeUtf8File).toHaveBeenCalledTimes(1);
        const [, writtenContent] = mockFs.writeUtf8File.mock.calls[0];
        const generatedFragments = yaml.parseAllDocuments(writtenContent)
            .map(document => document.toJS())
            .filter(fragment => fragment.If?.PathMatch?.startsWith('.*'));
        expect(generatedFragments).toEqual([
            expect.objectContaining({
                If: { PathMatch: expectedPathMatch },
                CompileFlags: expect.objectContaining({
                    Add: ['-include', expect.lowercaseEquals(path.join(path.dirname(activeContexts[0].projectPath!), 'out', availableFile))]
                })
            })
        ]);
    });

    it('does not generate compile macros fragments for CLANG', async () => {
        mockConfigurationProvider.getConfigVariable.mockReturnValue(true);
        mockConfigurationProvider.setConfigVariable.mockReturnValue(Promise.resolve());
        const csolution = mockSolutionManager.getCsolution();
        csolution!.getContextDescriptors = jest.fn().mockReturnValue([activeContexts[0]]);
        const cbuildFiles = csolution!.cbuildIdxFile!.cbuildFiles;
        const cbuild = cbuildFiles.get(activeContexts[0].projectName)!;
        cbuildFiles.set(activeContexts[0].projectName, cbuildFileFactory({
            compiler: 'CLANG',
            outDir: cbuild.outDir,
        }));
        mockFs.exists.mockResolvedValue(true);

        mockSolutionManager.onUpdatedCompileCommandsEmitter.fire();
        await waitTimeout();

        expect(mockFs.writeUtf8File).toHaveBeenCalled();
        for (const [, writtenContent] of mockFs.writeUtf8File.mock.calls) {
            expect(writtenContent).not.toContain('compile_macros');
        }
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

    it('returns out directory for the active clangd context', async () => {
        mockConfigurationProvider.getConfigVariable.mockReturnValue(true);
        mockConfigurationProvider.setConfigVariable.mockReturnValue(Promise.resolve());

        mockSolutionManager.onUpdatedCompileCommandsEmitter.fire();
        await waitTimeout();

        const infoPath = await mockCommandsProvider.mockRunRegistered<string>(ClangdManager.getInfoPathCommandId);
        expect(path.normalize(infoPath)).toEqual(path.join(path.dirname(activeContexts[0].projectPath!), 'out'));
    });

    it('returns an empty string when no active clangd context exists', async () => {
        const infoPath = await mockCommandsProvider.mockRunRegistered<string>(ClangdManager.getInfoPathCommandId);
        expect(infoPath).toEqual('');
    });

});
