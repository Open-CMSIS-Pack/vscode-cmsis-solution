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

import { Disposable, window } from 'vscode';
import * as path from 'path';
import { ETextFileResult, TextFile } from '@open-cmsis-pack/cmsis-common/text-file';
import { CTreeItem } from '@open-cmsis-pack/cmsis-common/tree-item';
import { CSolution } from '../solutions/csolution';
import { CmsisSettingsJsonFile } from '../global/cmsis-settings-json-file';
import { CsolutionApiV2 } from '../../api/csolution';
import { dataManagerFactory, draftProjectDataFactory } from '../data-manager/data-manager.factories';
import { SolutionManager } from '../solutions/solution-manager';
import { CsolutionApiV3Impl } from './v3-api';
import * as debugAdapters from '../debug/debug-adapters-yaml-file';

describe('CsolutionApiV3Impl', () => {
    let existingApi: jest.Mocked<CsolutionApiV2 & Disposable>;
    let api: CsolutionApiV3Impl;
    const solutionManager: { getCsolution: jest.Mock; loadState: SolutionManager['loadState'] } = { getCsolution: jest.fn(), loadState: {} };
    const csolutionService = { getPacksInfo: jest.fn() };
    const toolsEnvironment = { getToolsEnvironment: jest.fn(), getToolchains: jest.fn() };
    const solutionWithContexts = (contexts: string[]) => ({
        getActiveTargetType: () => 'Board',
        getActiveTargetSetWrap: () => ({ projectContexts: contexts.map(name => ({ name: name.replace(/\+Board$/, '') })) }),
    });
    const commandsProvider = { executeCommand: jest.fn() };

    beforeEach(() => {
        existingApi = {
            dispose: jest.fn(),
            getBoards: jest.fn(),
            getDevices: jest.fn(),
            getDraftProjects: jest.fn(),
            createNewSolution: jest.fn(),
            build: jest.fn(),
        };
        solutionManager.loadState = { loaded: true };
        solutionManager.getCsolution.mockReset();
        csolutionService.getPacksInfo.mockReset();
        toolsEnvironment.getToolsEnvironment.mockReset();
        toolsEnvironment.getToolchains.mockReset();
        commandsProvider.executeCommand.mockReset();
        jest.spyOn(window, 'showInformationMessage').mockClear();
        api = new CsolutionApiV3Impl(existingApi, dataManagerFactory(), solutionManager, csolutionService, toolsEnvironment, commandsProvider);
    });

    afterEach(() => jest.restoreAllMocks());

    it('lists toolchains without a solution and propagates provider failures', async () => {
        solutionManager.loadState = {};
        const toolchains = [{ name: 'AC6', version: '6.24.0', path: '/compiler/bin', registrationVariable: 'AC6_TOOLCHAIN_6_24_0' }];
        toolsEnvironment.getToolchains.mockResolvedValueOnce(toolchains).mockResolvedValueOnce([])
            .mockRejectedValueOnce(new Error('activation failed'));
        await expect(api.getToolchains()).resolves.toEqual(toolchains);
        await expect(api.getToolchains()).resolves.toEqual([]);
        await expect(api.getToolchains()).rejects.toThrow('activation failed');
        expect(toolsEnvironment.getToolchains).toHaveBeenCalledWith();
        expect(solutionManager.getCsolution).not.toHaveBeenCalled();
        expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
    });

    describe('getDebuggers', () => {
        it('returns exact canonical adapter names without a loaded solution', async () => {
            solutionManager.loadState = {};
            const catalog = new debugAdapters.DebugAdaptersYamlFile();
            catalog.text = 'debug-adapters:\n  - name: CMSIS-DAP@pyOCD\n    alias-name: [CMSIS-DAP]\n    template: pyocd.json\n  - name: J-Link Server\n    template: jlink.json\n';
            catalog.rootItem = catalog.parse() as CTreeItem;
            jest.spyOn(debugAdapters, 'loadDebugAdaptersYml').mockResolvedValue(catalog);

            const names = await api.getDebuggers();
            expect(names).toEqual(['CMSIS-DAP@pyOCD', 'J-Link Server']);
            names.push('changed');
            await expect(api.getDebuggers()).resolves.toEqual(['CMSIS-DAP@pyOCD', 'J-Link Server']);
            expect(solutionManager.getCsolution).not.toHaveBeenCalled();
            expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
        });

        it('rejects when the adapter catalog cannot be loaded', async () => {
            jest.spyOn(debugAdapters, 'loadDebugAdaptersYml').mockResolvedValue(undefined);
            await expect(api.getDebuggers()).rejects.toThrow('Unable to load debugger adapters');
        });
    });

    describe('non-interactive command getters', () => {
        const getters = [
            ['getSolutionFile', 'C:\\workspace\\App.csolution.yml', undefined],
            ['getActiveTarget', 'Board@Debug', ''],
            ['getDeviceName', 'STM32U585AIIx', ''],
            ['getBoardName', 'STMicroelectronics::B-U585I-IOT02A', ''],
            ['getDfpName', 'Keil::STM32U5xx_DFP@3.0.0', ''],
            ['getBspName', 'Keil::B-U585I-IOT02A_BSP@2.0.0', ''],
            ['getDfpPath', 'C:\\packs\\Keil\\STM32U5xx_DFP\\3.0.0', '<not found>'],
            ['getBspPath', 'C:\\packs\\Keil\\B-U585I-IOT02A_BSP\\2.0.0', '<not found>'],
            ['getPackRootPath', 'C:\\packs', 'C:\\packs'],
            ['getCbuildRunFile', 'C:\\workspace\\App+Board.cbuild-run.yml', ''],
        ] as const;

        it.each(getters)('wires %s without arguments and preserves current results', async (method, value, unavailable) => {
            solutionManager.loadState = {};
            commandsProvider.executeCommand.mockResolvedValueOnce(value).mockResolvedValueOnce(unavailable);
            const prompts = [
                jest.spyOn(window, 'showQuickPick'),
                jest.spyOn(window, 'showInformationMessage'),
                jest.spyOn(window, 'showWarningMessage'),
                jest.spyOn(window, 'showErrorMessage'),
            ];
            prompts.forEach(prompt => prompt.mockClear());

            await expect(api[method]()).resolves.toBe(value);
            await expect(api[method]()).resolves.toBe(unavailable);

            const command = method === 'getActiveTarget' ? 'getActiveTargetSet' : method;
            expect(commandsProvider.executeCommand.mock.calls).toEqual([
                [`cmsis-csolution.${command}`],
                [`cmsis-csolution.${command}`],
            ]);
            expect(solutionManager.getCsolution).not.toHaveBeenCalled();
            expect(csolutionService.getPacksInfo).not.toHaveBeenCalled();
            prompts.forEach(prompt => expect(prompt).not.toHaveBeenCalled());
        });

        it.each(getters)('propagates %s command failures without prompting', async method => {
            commandsProvider.executeCommand.mockRejectedValueOnce(new Error('command failed'));
            await expect(api[method]()).rejects.toThrow('command failed');
            expect(commandsProvider.executeCommand).toHaveBeenCalledTimes(1);
            expect(window.showInformationMessage).not.toHaveBeenCalled();
        });
    });

    describe('solution activation commands', () => {
        const operations = [
            { method: 'activateSolution', args: ['C:\\workspace\\App.csolution.yml'] },
            { method: 'deactivateSolution', args: [] },
        ] as const;

        it.each(operations)('wires $method and waits for command completion', async ({ method, args }) => {
            let finishCommand!: () => void;
            commandsProvider.executeCommand.mockImplementation(() => new Promise<void>(resolve => { finishCommand = resolve; }));
            let completed = false;
            const operation = (method === 'activateSolution' ? api.activateSolution(args[0]!) : api.deactivateSolution())
                .then(() => { completed = true; });
            await Promise.resolve();

            expect(commandsProvider.executeCommand.mock.calls).toEqual([[`cmsis-csolution.${method}`, ...args]]);
            expect(completed).toBe(false);
            expect(solutionManager.getCsolution).not.toHaveBeenCalled();
            finishCommand();
            await operation;
            expect(completed).toBe(true);
        });

        it.each(operations)('propagates $method command failures', async ({ method, args }) => {
            commandsProvider.executeCommand.mockRejectedValueOnce(new Error('command failed'));
            const operation = method === 'activateSolution' ? api.activateSolution(args[0]!) : api.deactivateSolution();
            await expect(operation).rejects.toThrow('command failed');
            expect(commandsProvider.executeCommand).toHaveBeenCalledTimes(1);
        });
    });

    describe('getTargets', () => {
        it('lists every named and unnamed set in declaration order without changing the solution', async () => {
            const solution = new CSolution();
            solution.csolutionYml.rootItem = new CTreeItem().fromObject({ solution: { 'target-types': [
                { type: 'Board', 'target-set': [{ set: 'Debug' }, { set: '' }, { set: 'Release' }] },
                { type: 'Other', 'target-set': [{ set: 'Debug' }] },
            ] } });
            solutionManager.getCsolution.mockReturnValue(solution);
            const original = solution.csolutionYml.rootItem!.toObject();

            const targets = await api.getTargets();
            expect(targets).toEqual(['Board@Debug', 'Board', 'Board@Release', 'Other@Debug']);
            targets.pop();
            await expect(api.getTargets()).resolves.toEqual(['Board@Debug', 'Board', 'Board@Release', 'Other@Debug']);
            expect(solution.csolutionYml.rootItem!.toObject()).toEqual(original);
            expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
            expect(csolutionService.getPacksInfo).not.toHaveBeenCalled();
        });

        it('returns an empty array for a loaded solution without targets', async () => {
            solutionManager.getCsolution.mockReturnValue(new CSolution());
            await expect(api.getTargets()).resolves.toEqual([]);
        });

        it.each([
            [false, false], [false, true], [true, false],
        ])('returns an empty array without a loaded solution (loaded: %s, model present: %s)', async (loaded, modelPresent) => {
            solutionManager.getCsolution.mockReturnValue(modelPresent ? new CSolution() : undefined);
            solutionManager.loadState = { loaded };
            await expect(api.getTargets()).resolves.toEqual([]);
            expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
        });
    });

    describe('setActiveTarget', () => {
        const settingsPath = path.resolve('api-target-selection', 'cmsis.json');
        let files: Map<string, string>;
        let solution: CSolution;
        let write: jest.Mock;

        beforeEach(() => {
            files = new Map();
            write = jest.fn((name: string, content: string) => { files.set(name, content); });
            TextFile.setFileSystem({
                exists: name => files.has(name),
                read: name => files.get(name) ?? '',
                write,
                unlink: name => { files.delete(name); },
                dirname: path.dirname,
                resolve: path.resolve,
            });
            solution = new CSolution();
            solution.solutionPath = path.resolve('api-target-selection', 'App.csolution.yml');
            solution.cmsisJsonFile = new CmsisSettingsJsonFile(settingsPath);
            solution.cmsisJsonFile.solutionPath = solution.solutionPath;
            solution.csolutionYml.rootItem = new CTreeItem().fromObject({ solution: { 'target-types': [
                { type: 'Board', 'target-set': [{ set: 'Debug' }, { set: '' }, { set: 'Release' }] },
                { type: 'Other', 'target-set': [{ set: 'Debug' }] },
            ] } });
            solutionManager.getCsolution.mockReturnValue(solution);
        });

        afterEach(() => TextFile.setFileSystem());

        it.each([
            ['Board@Release', 'Board', 2],
            ['Board', 'Board', 1],
            ['Other@Debug', 'Other', 0],
        ])('persists %s and refreshes before resolving', async (selection, type, index) => {
            const initial = new CmsisSettingsJsonFile(settingsPath);
            initial.set('unrelated', 'preserved');
            expect(await initial.save()).toBe(ETextFileResult.Success);
            let finishRefresh!: () => void;
            let startRefresh!: () => void;
            const refreshStarted = new Promise<void>(resolve => { startRefresh = resolve; });
            commandsProvider.executeCommand.mockImplementation(() => new Promise<void>(resolve => {
                finishRefresh = resolve;
                startRefresh();
            }));
            let completed = false;
            const change = api.setActiveTarget(selection).then(() => { completed = true; });
            await refreshStarted;

            expect(commandsProvider.executeCommand).toHaveBeenCalledWith('cmsis-csolution.refresh');
            expect(completed).toBe(false);
            expect(solution.getActiveTargetSetName()).toBe(selection);
            const saved = new CmsisSettingsJsonFile(settingsPath);
            expect(await saved.load()).toBe(ETextFileResult.Success);
            expect(saved.get('unrelated')).toBe('preserved');
            expect(saved.get('activeTarget')).toBe(selection);
            saved.solutionPath = solution.solutionPath;
            expect(saved.activeTargetTypeName).toBe(type);
            expect(saved.getSelectedSet(type)).toBe(index);
            finishRefresh();
            await change;
        });

        it.each(['', ' ', '@Debug', 'Board@', 'Board@Debug@extra', 'Missing', 'Board@Missing', 'Other'])('rejects invalid or unknown selection %j without saving or refreshing', async selection => {
            await expect(api.setActiveTarget(selection)).rejects.toThrow();
            expect(write).not.toHaveBeenCalled();
            expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
        });

        it.each([undefined, solutionWithContexts([])])('rejects an unloaded solution before changing settings', async current => {
            solutionManager.getCsolution.mockReturnValue(current);
            solutionManager.loadState = {};
            await expect(api.setActiveTarget('Board@Debug')).rejects.toThrow('requires a loaded solution');
            expect(write).not.toHaveBeenCalled();
            expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
        });

        it('rejects malformed settings without overwriting them', async () => {
            files.set(settingsPath, '{invalid');
            await expect(api.setActiveTarget('Board@Debug')).rejects.toThrow('Unable to load target selection');
            expect(write).not.toHaveBeenCalled();
            expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
        });

        it('rejects save failures without changing the loaded selection or refreshing', async () => {
            write.mockImplementation(() => { throw new Error('read only'); });
            await expect(api.setActiveTarget('Board@Release')).rejects.toThrow('Unable to save target selection');
            expect(solution.cmsisJsonFile.activeTargetTypeName).toBeUndefined();
            expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
        });

        it('rejects if the loaded solution changes before saving', async () => {
            solutionManager.getCsolution.mockReturnValueOnce(solution).mockReturnValue(undefined);
            await expect(api.setActiveTarget('Board@Debug')).rejects.toThrow('Solution changed');
            expect(write).not.toHaveBeenCalled();
            expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
        });

        it('does not refresh a different solution if selection changes during save', async () => {
            write.mockImplementation((name: string, content: string) => {
                files.set(name, content);
                solutionManager.getCsolution.mockReturnValue(undefined);
            });
            await expect(api.setActiveTarget('Board@Debug')).rejects.toThrow('Solution changed');
            expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
        });

        it('allows selecting the same target set repeatedly', async () => {
            await api.setActiveTarget('Board@Debug');
            await api.setActiveTarget('Board@Debug');
            expect(solution.getActiveTargetSetName()).toBe('Board@Debug');
            expect(commandsProvider.executeCommand).toHaveBeenCalledTimes(2);
        });

        it('serializes overlapping selections across API instances through refresh', async () => {
            const otherApi = new CsolutionApiV3Impl(existingApi, dataManagerFactory(), solutionManager,
                csolutionService, toolsEnvironment, commandsProvider);
            commandsProvider.executeCommand.mockImplementation(async () => {
                const refreshed = new CSolution();
                refreshed.solutionPath = solution.solutionPath;
                refreshed.csolutionYml.rootItem = solution.csolutionYml.rootItem;
                refreshed.cmsisJsonFile = new CmsisSettingsJsonFile(settingsPath);
                refreshed.cmsisJsonFile.solutionPath = refreshed.solutionPath;
                await refreshed.cmsisJsonFile.load();
                solutionManager.getCsolution.mockReturnValue(refreshed);
            });

            await expect(Promise.all([
                api.setActiveTarget('Board@Release'),
                otherApi.setActiveTarget('Other@Debug'),
            ])).resolves.toEqual([undefined, undefined]);

            expect(commandsProvider.executeCommand).toHaveBeenCalledTimes(2);
            expect(solutionManager.getCsolution().getActiveTargetSetName()).toBe('Other@Debug');
            const saved = new CmsisSettingsJsonFile(settingsPath);
            saved.solutionPath = solution.solutionPath;
            expect(await saved.load()).toBe(ETextFileResult.Success);
            expect(saved.get('activeTarget')).toBe('Other@Debug');
            expect(saved.getSelectedSet('Board')).toBe(2);
            expect(saved.getSelectedSet('Other')).toBe(0);
        });

        it('propagates refresh failures after persisting the selection', async () => {
            commandsProvider.executeCommand.mockRejectedValue(new Error('refresh failed'));
            await expect(api.setActiveTarget('Board@Debug')).rejects.toThrow('refresh failed');
            expect(solution.getActiveTargetSetName()).toBe('Board@Debug');
        });
    });

    it('delegates tools export without a loaded solution', async () => {
        solutionManager.loadState = {};
        toolsEnvironment.getToolsEnvironment.mockResolvedValue('tools YAML');
        await expect(api.getToolsEnvironment()).resolves.toBe('tools YAML');
        expect(toolsEnvironment.getToolsEnvironment).toHaveBeenCalledWith(undefined);
    });

    it('supplies metadata only for a loaded solution', async () => {
        solutionManager.loadState = { loaded: true, solutionPath: '/workspace/test.csolution.yml' };
        toolsEnvironment.getToolsEnvironment.mockResolvedValue('solution tools YAML');
        await expect(api.getToolsEnvironment()).resolves.toBe('solution tools YAML');
        expect(toolsEnvironment.getToolsEnvironment).toHaveBeenLastCalledWith('/workspace/test.csolution.yml');
        solutionManager.loadState.loaded = false;
        await api.getToolsEnvironment();
        expect(toolsEnvironment.getToolsEnvironment).toHaveBeenLastCalledWith(undefined);
    });

    it('propagates environment export failures', async () => {
        toolsEnvironment.getToolsEnvironment.mockRejectedValue(new Error('export failed'));
        await expect(api.getToolsEnvironment()).rejects.toThrow('export failed');
    });

    it('queries catalogs without a loaded or active solution', async () => {
        solutionManager.loadState = {};
        const dataManager = dataManagerFactory();
        const packs = [{ id: 'ARM::CMSIS@6.0.0', version: '6.0.0', installed: true }];
        const query = jest.spyOn(dataManager, 'getPacks').mockResolvedValue({ packs });
        const catalogApi = new CsolutionApiV3Impl(existingApi, dataManager, solutionManager, csolutionService, toolsEnvironment, commandsProvider);
        await expect(catalogApi.getPacks()).resolves.toEqual({ packs });
        await expect(catalogApi.getPacks({ scope: 'installed' })).resolves.toEqual({ packs });
        expect(query).toHaveBeenNthCalledWith(1, undefined);
        expect(query).toHaveBeenNthCalledWith(2, 'installed');
        expect(solutionManager.getCsolution).not.toHaveBeenCalled();
        expect(csolutionService.getPacksInfo).not.toHaveBeenCalled();
    });

    it('requires a loaded solution and an explicit known context for used packs before RPC', async () => {
        await expect(api.getPacks({ scope: 'used' } as never)).rejects.toThrow('explicit context');
        await expect(api.getPacks({ scope: 'used', context: ' ' })).rejects.toThrow('explicit context');
        const options = { scope: 'used' as const, context: 'App.Debug+Board' };
        await expect(api.getPacks(options)).rejects.toThrow('loaded solution');
        solutionManager.getCsolution.mockReturnValue(solutionWithContexts([options.context]));
        solutionManager.loadState.loaded = false;
        await expect(api.getPacks(options)).rejects.toThrow('loaded solution');
        solutionManager.loadState.loaded = true;
        await expect(api.getPacks({ ...options, context: 'Other' })).rejects.toThrow('Unknown pack context');
        expect(csolutionService.getPacksInfo).not.toHaveBeenCalled();
    });

    it.each(['used', 'missing'] as const)('validates %s contexts against the selected non-first target set', async scope => {
        const targetSets = [solutionWithContexts(['First.Debug+Board']).getActiveTargetSetWrap(),
            solutionWithContexts(['Second.Release+Board']).getActiveTargetSetWrap()];
        let selectedSetIndex = 1;
        solutionManager.getCsolution.mockReturnValue({
            getActiveTargetType: () => 'Board',
            getActiveTargetSetWrap: () => targetSets[selectedSetIndex],
        });
        csolutionService.getPacksInfo.mockResolvedValue({ success: true, packs: [] });
        await expect(api.getPacks({ scope, context: 'Second.Release+Board' })).resolves.toEqual({ packs: [] });
        await expect(api.getPacks({ scope, context: 'First.Debug+Board' })).rejects.toThrow('Unknown pack context');
        csolutionService.getPacksInfo.mockImplementationOnce(async () => {
            selectedSetIndex = 0;
            return { success: true, packs: [] };
        });
        await expect(api.getPacks({ scope, context: 'Second.Release+Board' }))
            .rejects.toThrow(`changed during ${scope} pack query`);
        expect(csolutionService.getPacksInfo).toHaveBeenCalledTimes(2);
    });

    it('copies only RPC-used packs in order with reference-backed installation evidence', async () => {
        solutionManager.getCsolution.mockReturnValue(solutionWithContexts(['App.Debug+Board']));
        const id = 'Arm::CMSIS@6.0.0';
        const packs = [
            { id: 'Unused', used: false },
            { id, used: true, description: 'Core', references: [{ resolvedPack: id, path: '/packs/CMSIS', missing: false }] },
            { id: 'Vendor::BSP@1.0.0', used: true, references: [{ resolvedPack: 'Other', path: '/wrong' }] },
            { id: 'Vendor::DFP@2.0.0', used: true, references: [{ resolvedPack: 'Vendor::DFP@2.0.0', missing: true, path: '/missing' }] },
            { id: 'Vendor::Other@3.0.0', used: true },
            { id, used: true, references: [{ resolvedPack: id }] },
            { id: 'Unspecified' },
        ];
        csolutionService.getPacksInfo.mockResolvedValue({ success: true, packs });
        expect(await api.getPacks({ scope: 'used', context: 'App.Debug+Board' })).toEqual({
            packs: [
                { id, version: '6.0.0', description: 'Core', installed: true, path: '/packs/CMSIS' },
                { id: 'Vendor::BSP@1.0.0', version: '1.0.0' },
                { id: 'Vendor::DFP@2.0.0', version: '2.0.0' },
                { id: 'Vendor::Other@3.0.0', version: '3.0.0' },
                { id, version: '6.0.0', installed: true },
            ],
        });
        expect(csolutionService.getPacksInfo).toHaveBeenCalledWith({ context: 'App.Debug+Board', all: true });
        expect(packs[1]).not.toHaveProperty('installed');
        for (const method of Object.values(existingApi)) {
            expect(method).not.toHaveBeenCalled();
        }
    });

    it('preserves empty used packs and rejects RPC failures, unversioned records and changed solutions', async () => {
        solutionManager.getCsolution.mockReturnValue(solutionWithContexts(['App.Debug+Board']));
        const options = { scope: 'used' as const, context: 'App.Debug+Board' };
        csolutionService.getPacksInfo.mockResolvedValueOnce({ success: true, packs: [] });
        expect(await api.getPacks(options)).toEqual({ packs: [] });
        csolutionService.getPacksInfo.mockResolvedValueOnce({ success: false, message: 'RPC unavailable' });
        await expect(api.getPacks(options)).rejects.toThrow('RPC unavailable');
        csolutionService.getPacksInfo.mockResolvedValueOnce({ success: false });
        await expect(api.getPacks(options)).rejects.toThrow('Unable to query used packs');
        csolutionService.getPacksInfo.mockRejectedValueOnce(new Error('transport failed'));
        await expect(api.getPacks(options)).rejects.toThrow('transport failed');
        csolutionService.getPacksInfo.mockResolvedValueOnce({ success: true, packs: [{ id: 'Arm::CMSIS', used: true }] });
        await expect(api.getPacks(options)).rejects.toThrow('Used pack has no version');
        csolutionService.getPacksInfo.mockResolvedValueOnce({ success: true, packs: [{ id: 'Invalid', used: true }] });
        await expect(api.getPacks(options)).rejects.toThrow('Invalid pack ID format');
        csolutionService.getPacksInfo.mockImplementationOnce(async () => {
            solutionManager.getCsolution.mockReturnValue(undefined);
            return { success: true, packs: [] };
        });
        await expect(api.getPacks(options)).rejects.toThrow('changed during used pack query');
    });

    it.each(['unloaded', 'context removed'])('rejects used packs when %s during the RPC query', async change => {
        const contexts = ['App.Debug+Board'];
        solutionManager.getCsolution.mockReturnValue(solutionWithContexts(contexts));
        csolutionService.getPacksInfo.mockImplementationOnce(async () => {
            if (change === 'unloaded') {
                solutionManager.loadState.loaded = false;
            } else {
                contexts.length = 0;
            }
            return { success: true, packs: [] };
        });
        await expect(api.getPacks({ scope: 'used', context: 'App.Debug+Board' }))
            .rejects.toThrow('changed during used pack query');
    });

    it('returns only explicit missing references, preserving requirements, origins, order and duplicates', async () => {
        solutionManager.getCsolution.mockReturnValue(solutionWithContexts(['App.Debug+Board']));
        const reference = { pack: 'Vendor::Missing@1.0.0:2.0.0', origin: '/App.csolution.yml', missing: true, selected: false };
        csolutionService.getPacksInfo.mockResolvedValue({ success: true, packs: [
            { id: 'Unresolved', references: [reference, { ...reference, missing: false }, { ...reference, missing: undefined }] },
            { id: 'Unused', used: false, references: [{ ...reference, pack: 'Vendor::Other', resolvedPack: 'Vendor::Other@1.0.0', path: '/not-evidence' }, reference] },
            { id: 'NoReferences' },
        ] });
        const result = await api.getPacks({ scope: 'missing', context: 'App.Debug+Board' });
        expect(result).toEqual({ packs: [
            { pack: reference.pack, origin: reference.origin },
            { pack: 'Vendor::Other', origin: reference.origin, resolvedPack: 'Vendor::Other@1.0.0' },
            { pack: reference.pack, origin: reference.origin },
        ] });
        expect(JSON.parse(JSON.stringify(result))).toEqual(result);
        expect(csolutionService.getPacksInfo).toHaveBeenCalledWith({ context: 'App.Debug+Board', all: true });
        expect(reference).toEqual({ pack: 'Vendor::Missing@1.0.0:2.0.0', origin: '/App.csolution.yml', missing: true, selected: false });
    });

    it('gates missing-pack queries and propagates empty results and RPC failures', async () => {
        const options = { scope: 'missing' as const, context: 'App.Debug+Board' };
        await expect(api.getPacks({ ...options, context: ' ' })).rejects.toThrow('explicit context');
        await expect(api.getPacks(options)).rejects.toThrow('loaded solution');
        solutionManager.getCsolution.mockReturnValue(solutionWithContexts([options.context]));
        solutionManager.loadState.loaded = false;
        await expect(api.getPacks(options)).rejects.toThrow('loaded solution');
        solutionManager.loadState.loaded = true;
        await expect(api.getPacks({ ...options, context: 'Unknown' })).rejects.toThrow('Unknown pack context');
        expect(csolutionService.getPacksInfo).not.toHaveBeenCalled();
        csolutionService.getPacksInfo.mockResolvedValueOnce({ success: true, packs: [] });
        expect(await api.getPacks(options)).toEqual({ packs: [] });
        csolutionService.getPacksInfo.mockResolvedValueOnce({ success: false, message: 'RPC failed' });
        await expect(api.getPacks(options)).rejects.toThrow('RPC failed');
        csolutionService.getPacksInfo.mockResolvedValueOnce({ success: false });
        await expect(api.getPacks(options)).rejects.toThrow('Unable to query missing packs');
        csolutionService.getPacksInfo.mockRejectedValueOnce(new Error('Transport failed'));
        await expect(api.getPacks(options)).rejects.toThrow('Transport failed');
    });

    it.each(['replaced', 'unloaded', 'context removed'])('rejects missing packs when %s during RPC', async change => {
        const contexts = ['App.Debug+Board'];
        solutionManager.getCsolution.mockReturnValue(solutionWithContexts(contexts));
        csolutionService.getPacksInfo.mockImplementationOnce(async () => {
            if (change === 'replaced') {
                solutionManager.getCsolution.mockReturnValue(undefined);
            } else if (change === 'unloaded') {
                solutionManager.loadState.loaded = false;
            } else {
                contexts.length = 0;
            }
            return { success: true, packs: [] };
        });
        await expect(api.getPacks({ scope: 'missing', context: 'App.Debug+Board' }))
            .rejects.toThrow('changed during missing pack query');
    });

    it.each([undefined, 'all', 'installed'] as const)('filters %s pack catalogs without changing records', async scope => {
        const packs = [
            { id: 'Arm::CMSIS@6.0.0', version: '6.0.0' },
            { id: 'Vendor::Driver@1.0.0', version: '1.0.0', description: 'CMSIS [UART]' },
            { id: 'Other::Pack@2.0.0', version: '2.0.0' },
        ];
        const dataManager = dataManagerFactory();
        const query = jest.spyOn(dataManager, 'getPacks').mockResolvedValue({ packs });
        const catalogApi = new CsolutionApiV3Impl(existingApi, dataManager, solutionManager, csolutionService, toolsEnvironment, commandsProvider);
        for (const [text, expected] of [
            [undefined, packs], ['', packs], ['cMsIs', packs.slice(0, 2)],
            ['[uart]', [packs[1]]], ['.*', []], [' CMSIS ', []], ['no match', []],
        ] as const) {
            const result = await catalogApi.getPacks({ scope, filter: { text } });
            expect(result.packs).toEqual(expected);
            expect(result).toEqual({ packs: expected });
            result.packs.forEach(record => expect(packs).toContain(record));
        }
        expect(packs).toHaveLength(3);
        expect(query).toHaveBeenLastCalledWith(scope);
        expect(csolutionService.getPacksInfo).not.toHaveBeenCalled();
        const filter = { text: '[UART]' };
        query.mockImplementationOnce(async () => {
            filter.text = 'no match';
            return { packs };
        });
        expect((await catalogApi.getPacks({ scope, filter })).packs).toEqual([packs[1]]);
        query.mockRejectedValueOnce(new Error('Catalog failed'));
        await expect(catalogApi.getPacks({ scope, filter })).rejects.toThrow('Catalog failed');
    });

    it('filters used pack ids and descriptions after mapping, retaining order and duplicates', async () => {
        const context = 'App.Debug+Board';
        solutionManager.getCsolution.mockReturnValue(solutionWithContexts([context]));
        const packs = [
            { id: 'Arm::CMSIS@6.0.0', used: true },
            { id: 'Vendor::Driver@1.0.0', description: 'CMSIS [UART]', used: true },
            { id: 'Arm::CMSIS@6.0.0', used: true },
        ];
        csolutionService.getPacksInfo.mockResolvedValue({ success: true, packs });
        const records = (await api.getPacks({ scope: 'used', context })).packs;
        for (const [text, expected] of [
            [undefined, records], ['', records], ['cMsIs', records],
            ['[uart]', [records[1]]], ['arm::', [records[0], records[2]]], ['.*', []], [' CMSIS ', []],
        ] as const) {
            expect((await api.getPacks({ scope: 'used', context, filter: { text } })).packs).toEqual(expected);
        }
        const filter = { text: '[UART]' };
        csolutionService.getPacksInfo.mockImplementationOnce(async () => {
            filter.text = 'no match';
            return { success: true, packs };
        });
        expect((await api.getPacks({ scope: 'used', context, filter })).packs).toEqual([records[1]]);
        csolutionService.getPacksInfo.mockResolvedValueOnce({ success: true, packs: [{ id: 'Invalid', used: true }] });
        await expect(api.getPacks({ scope: 'used', context, filter })).rejects.toThrow('Invalid pack ID');
        expect(csolutionService.getPacksInfo).toHaveBeenLastCalledWith({ context, all: true });
    });

    it('filters only original missing requirements, preserving duplicate references and captured text', async () => {
        const context = 'App.Debug+Board';
        solutionManager.getCsolution.mockReturnValue(solutionWithContexts([context]));
        const reference = { pack: 'Vendor::Missing@1.0.0:2.0.0', origin: '/Origin.csolution.yml', resolvedPack: 'Resolved::Pack@1.0.0', missing: true };
        const packs = [{ id: 'Unused', description: 'Description', references: [reference, reference,
            { ...reference, pack: 'Other::Pack' }] }];
        csolutionService.getPacksInfo.mockResolvedValue({ success: true, packs });
        const records = (await api.getPacks({ scope: 'missing', context })).packs;
        for (const [text, expected] of [
            [undefined, records], ['', records], ['mIsSiNg', records.slice(0, 2)],
            ['1.0.0:2.0.0', records.slice(0, 2)], ['origin', []], ['resolved', []],
            ['description', []], ['.*', []], [' Missing ', []],
        ] as const) {
            expect((await api.getPacks({ scope: 'missing', context, filter: { text } })).packs).toEqual(expected);
        }
        const filter = { text: 'missing' };
        csolutionService.getPacksInfo.mockImplementationOnce(async () => {
            filter.text = 'other';
            return { success: true, packs };
        });
        expect((await api.getPacks({ scope: 'missing', context, filter })).packs).toEqual(records.slice(0, 2));
        expect(reference.pack).toBe('Vendor::Missing@1.0.0:2.0.0');
        expect(csolutionService.getPacksInfo).toHaveBeenLastCalledWith({ context, all: true });
        solutionManager.loadState.loaded = false;
        await expect(api.getPacks({ scope: 'missing', context, filter })).rejects.toThrow('loaded solution');
    });

    it('installs approved packs without prompting and reports each pack in order, including failures', async () => {
        commandsProvider.executeCommand.mockResolvedValueOnce('/packs/Arm/First/1.0.0')
            .mockResolvedValueOnce(undefined)
            .mockRejectedValueOnce(new Error('offline'));

        await expect(api.installPacks({ packs: ['Arm::First@1.0.0', 'Arm::Second', 'Arm::Third'], approved: true })).resolves.toEqual([
            { pack: 'Arm::First@1.0.0', status: 'installed', path: '/packs/Arm/First/1.0.0' },
            { pack: 'Arm::Second', status: 'failed', error: 'Unable to install Arm::Second' },
            { pack: 'Arm::Third', status: 'failed', error: 'offline' },
        ]);
        expect(window.showInformationMessage).not.toHaveBeenCalled();
        expect(commandsProvider.executeCommand.mock.calls).toEqual([
            ['cmsis-csolution.installPack', 'Arm', 'First', '1.0.0'],
            ['cmsis-csolution.installPack', 'Arm', 'Second', undefined],
            ['cmsis-csolution.installPack', 'Arm', 'Third', undefined],
        ]);
    });

    it.each([false, undefined, null, 'true', 1])('reports cancellation for approval %p without prompting or running commands', async approved => {
        await expect(api.installPacks({ packs: ['Arm::First', 'Arm::Second'], approved: approved as boolean })).resolves.toEqual([
            { pack: 'Arm::First', status: 'cancelled' },
            { pack: 'Arm::Second', status: 'cancelled' },
        ]);
        expect(window.showInformationMessage).not.toHaveBeenCalled();
        expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
    });

    it.each([true, false])('rejects sparse pack arrays with approval %p before running commands', async approved => {
        const sparsePacks = new Array<string>(3);
        sparsePacks[0] = 'Arm::First';
        sparsePacks[2] = 'Arm::Second';
        for (const packs of [new Array<string>(1), sparsePacks]) {
            await expect(api.installPacks({ packs, approved })).rejects.toThrow('Pack IDs must be an array of strings');
        }
        expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
    });

    it('installs only the submitted snapshot when the caller mutates the batch', async () => {
        let completeFirst!: (value: string) => void;
        commandsProvider.executeCommand.mockReturnValueOnce(new Promise<string>(resolve => {
            completeFirst = resolve;
        })).mockResolvedValueOnce('/packs/Arm/Second/1.0.0');
        const packs = ['Arm::First', 'Arm::Second'];
        const pending = api.installPacks({ packs, approved: true });
        packs.splice(1, 1, 'Arm::Replacement', 'Arm::Appended');
        completeFirst('/packs/Arm/First/1.0.0');

        await expect(pending).resolves.toEqual([
            { pack: 'Arm::First', status: 'installed', path: '/packs/Arm/First/1.0.0' },
            { pack: 'Arm::Second', status: 'installed', path: '/packs/Arm/Second/1.0.0' },
        ]);
        expect(commandsProvider.executeCommand.mock.calls).toEqual([
            ['cmsis-csolution.installPack', 'Arm', 'First', undefined],
            ['cmsis-csolution.installPack', 'Arm', 'Second', undefined],
        ]);
    });

    it('reports an explicitly empty version as failed and continues installing valid packs', async () => {
        commandsProvider.executeCommand.mockResolvedValueOnce('/packs/ARM/CMSIS/6.1.0')
            .mockResolvedValueOnce('/packs/ARM/Cortex_DFP/1.2.0');

        await expect(api.installPacks({
            packs: ['ARM::CMSIS@', 'ARM::CMSIS', 'ARM::Cortex_DFP@1.2.0'],
            approved: true,
        })).resolves.toEqual([
            { pack: 'ARM::CMSIS@', status: 'failed', error: 'Invalid pack ID format: ARM::CMSIS@' },
            { pack: 'ARM::CMSIS', status: 'installed', path: '/packs/ARM/CMSIS/6.1.0' },
            { pack: 'ARM::Cortex_DFP@1.2.0', status: 'installed', path: '/packs/ARM/Cortex_DFP/1.2.0' },
        ]);
        expect(commandsProvider.executeCommand.mock.calls).toEqual([
            ['cmsis-csolution.installPack', 'ARM', 'CMSIS', undefined],
            ['cmsis-csolution.installPack', 'ARM', 'Cortex_DFP', '1.2.0'],
        ]);
    });

    it('does not prompt for an empty batch and reports invalid IDs individually', async () => {
        await expect(api.installPacks({ packs: [], approved: false })).resolves.toEqual([]);
        expect(window.showInformationMessage).not.toHaveBeenCalled();
        await expect(api.installPacks({ packs: ['bad-id'], approved: true })).resolves.toEqual([
            { pack: 'bad-id', status: 'failed', error: 'Invalid pack ID format: bad-id' },
        ]);
        expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
    });

    it('delegates board queries', () => {
        const filter = { vendor: 'Arm', name: 'board' };
        const result = Promise.resolve([]);
        existingApi.getBoards.mockReturnValue(result);

        expect(api.getBoards(filter)).toBe(result);
        expect(existingApi.getBoards).toHaveBeenCalledWith(filter);
    });

    it('delegates device queries', () => {
        const filter = { vendor: 'Arm', name: 'device' };
        const result = Promise.resolve([]);
        existingApi.getDevices.mockReturnValue(result);

        expect(api.getDevices(filter)).toBe(result);
        expect(existingApi.getDevices).toHaveBeenCalledWith(filter);
    });

    it('delegates draft project queries', () => {
        const board = { key: 'Arm::board', vendor: 'Arm', name: 'board', revision: undefined };
        const device = { key: 'Arm::device', vendor: 'Arm', name: 'device' };
        const result = Promise.resolve([]);
        existingApi.getDraftProjects.mockReturnValue(result);

        expect(api.getDraftProjects(board, device)).toBe(result);
        expect(existingApi.getDraftProjects).toHaveBeenCalledWith(board, device);
    });

    it('delegates solution creation', () => {
        const options: CsolutionApiV2.CreateNewSolutionOptions = {
            draft: draftProjectDataFactory() as CsolutionApiV2.DraftProjectData,
            folder: '/workspace',
        };
        const result = Promise.resolve();
        existingApi.createNewSolution.mockReturnValue(result);

        expect(api.createNewSolution(options)).toBe(result);
        expect(existingApi.createNewSolution).toHaveBeenCalledWith(options);
    });

    it('delegates builds', () => {
        const options = { rebuild: true };
        const result = Promise.resolve({ task: {} as import('vscode').Task, terminate: jest.fn() });
        existingApi.build.mockReturnValue(result);

        expect(api.build(options)).toBe(result);
        expect(existingApi.build).toHaveBeenCalledWith(options);
    });

    it('disposes the wrapped API', () => {
        api.dispose();
        expect(existingApi.dispose).toHaveBeenCalledTimes(1);
    });
});
