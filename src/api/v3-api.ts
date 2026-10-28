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

import { Disposable } from 'vscode';
import { Mutex } from 'async-mutex';
import { ETextFileResult } from '@open-cmsis-pack/cmsis-common/text-file';
import { CmsisSettingsJsonFile } from '../global/cmsis-settings-json-file';
import { REFRESH_COMMAND_ID } from '../manifest';
import { CsolutionApiV2, CsolutionApiV3 } from '../../api/csolution';
import type { SolutionManager } from '../solutions/solution-manager';
import type { ToolsEnvironment } from '../solutions/tools-environment';
import type { DataManager } from '../data-manager/data-manager';
import type { CsolutionService } from '../json-rpc/csolution-rpc-client';
import { splitPackId } from '../data-manager/pack-data';
import type { CommandsProvider } from '../vscode-api/commands-provider';
import { PackInstallCommands } from '../packs/pack-install-commands';
import { COMMAND_ACTIVATE_SOLUTION, COMMAND_DEACTIVATE_SOLUTION, COMMAND_GET_SOLUTION_FILE } from '../solutions/active-solution-tracker';
import { DebugHardwareCommands } from '../solutions/hardware/debug-hardware-commands';
import { loadDebugAdaptersYml } from '../debug/debug-adapters-yaml-file';

export class CsolutionApiV3Impl implements CsolutionApiV3 {
    private static readonly targetSelectionMutex = new Mutex();

    constructor(
        private readonly existingApi: CsolutionApiV2 & Disposable,
        private readonly dataManager: DataManager,
        private readonly solutionManager: Pick<SolutionManager, 'getCsolution' | 'loadState'>,
        private readonly csolutionService: Pick<CsolutionService, 'getPacksInfo'>,
        private readonly toolsEnvironment: Pick<ToolsEnvironment, 'getToolsEnvironment' | 'getToolchains'>,
        private readonly commandsProvider: Pick<CommandsProvider, 'executeCommand'>,
    ) {}

    public async activateSolution(solutionPath: string): Promise<void> {
        await this.commandsProvider.executeCommand(COMMAND_ACTIVATE_SOLUTION, solutionPath);
    }

    public async deactivateSolution(): Promise<void> {
        await this.commandsProvider.executeCommand(COMMAND_DEACTIVATE_SOLUTION);
    }

    public async getSolutionFile(): Promise<string | undefined> {
        return this.commandsProvider.executeCommand<string | undefined>(COMMAND_GET_SOLUTION_FILE);
    }

    public async getActiveTarget(): Promise<string> {
        return this.commandsProvider.executeCommand<string>(DebugHardwareCommands.ACTIVE_TARGET_SET_COMMAND_ID);
    }

    public async getTargets(): Promise<string[]> {
        const solution = this.solutionManager.getCsolution();
        if (!solution || !this.solutionManager.loadState.loaded) {
            return [];
        }
        return solution.csolutionYml.targetTypes.flatMap(target =>
            target.targetSetNames.map(set => set ? `${target.name}@${set}` : target.name));
    }

    public async setActiveTarget(activeTarget: string): Promise<void> {
        await CsolutionApiV3Impl.targetSelectionMutex.runExclusive(() => this.updateActiveTarget(activeTarget));
    }

    private async updateActiveTarget(activeTarget: string): Promise<void> {
        if (typeof activeTarget !== 'string' || !activeTarget.trim()) {
            throw new Error('Target set must be a non-empty string');
        }
        const [targetType, set, ...extra] = activeTarget.split('@');
        if (!targetType || (set !== undefined && !set) || extra.length) {
            throw new Error(`Invalid target set: ${activeTarget}`);
        }
        const solution = this.solutionManager.getCsolution();
        if (!solution || !this.solutionManager.loadState.loaded) {
            throw new Error('Setting the active target set requires a loaded solution');
        }
        const target = solution.csolutionYml.getTargetType(targetType);
        const setIndex = target?.targetSetNames.indexOf(set ?? '') ?? -1;
        if (!target || setIndex < 0) {
            throw new Error(`Unknown target set: ${activeTarget}`);
        }
        const settings = new CmsisSettingsJsonFile(solution.cmsisJsonFile.fileName);
        settings.solutionPath = solution.solutionPath;
        const loadResult = await settings.load();
        if (loadResult !== ETextFileResult.NotExists && (loadResult === ETextFileResult.Error || settings.errors.length)) {
            throw new Error(`Unable to load target selection: ${settings.errors.join('; ')}`);
        }
        if (loadResult === ETextFileResult.NotExists) {
            settings.clear();
        }
        if (this.solutionManager.getCsolution() !== solution || !this.solutionManager.loadState.loaded) {
            throw new Error('Solution changed while setting the active target set');
        }
        settings.activeTargetTypeName = targetType;
        settings.set(`targetSet.${settings.solutionDisplayName}.${targetType}`, setIndex);
        settings.setActiveSelection(targetType, set);
        const saveResult = await settings.save();
        if (saveResult !== ETextFileResult.Success && saveResult !== ETextFileResult.Unchanged) {
            throw new Error(`Unable to save target selection: ${settings.errors.join('; ')}`);
        }
        if (this.solutionManager.getCsolution() !== solution || !this.solutionManager.loadState.loaded) {
            throw new Error('Solution changed while setting the active target set');
        }
        if (solution.cmsisJsonFile.copyFrom(settings) === ETextFileResult.Error) {
            throw new Error(`Unable to update target selection: ${solution.cmsisJsonFile.errors.join('; ')}`);
        }
        await this.commandsProvider.executeCommand(REFRESH_COMMAND_ID);
    }

    public async getDeviceName(): Promise<string> {
        return this.commandsProvider.executeCommand<string>(DebugHardwareCommands.DEVICE_NAME_COMMAND_ID);
    }

    public async getBoardName(): Promise<string> {
        return this.commandsProvider.executeCommand<string>(DebugHardwareCommands.BOARD_NAME_COMMAND_ID);
    }

    public async getDfpName(): Promise<string> {
        return this.commandsProvider.executeCommand<string>(DebugHardwareCommands.DFP_NAME_COMMAND_ID);
    }

    public async getBspName(): Promise<string> {
        return this.commandsProvider.executeCommand<string>(DebugHardwareCommands.BSP_NAME_COMMAND_ID);
    }

    public async getDfpPath(): Promise<string> {
        return this.commandsProvider.executeCommand<string>(DebugHardwareCommands.DFP_PATH_COMMAND_ID);
    }

    public async getBspPath(): Promise<string> {
        return this.commandsProvider.executeCommand<string>(DebugHardwareCommands.BSP_PATH_COMMAND_ID);
    }

    public async getPackRootPath(): Promise<string> {
        return this.commandsProvider.executeCommand<string>(DebugHardwareCommands.PACK_ROOT_PATH_COMMAND_ID);
    }

    public async getCbuildRunFile(): Promise<string> {
        return this.commandsProvider.executeCommand<string>(DebugHardwareCommands.CBUILD_RUN_PATH_COMMAND_ID);
    }

    public getToolsEnvironment(): Promise<string> {
        const state = this.solutionManager.loadState;
        return this.toolsEnvironment.getToolsEnvironment(state.loaded ? state.solutionPath : undefined);
    }

    public async getDebuggers(): Promise<string[]> {
        const catalog = await loadDebugAdaptersYml();
        if (!catalog) {
            throw new Error('Unable to load debugger adapters');
        }
        return catalog.listAdapterNames();
    }

    public getToolchains(): Promise<CsolutionApiV3.Toolchain[]> {
        return this.toolsEnvironment.getToolchains();
    }

    public async getPacks(options?: CsolutionApiV3.PackQuery): Promise<CsolutionApiV3.PackQueryResult> {
        const text = options?.filter?.text?.toLowerCase() ?? '';
        const matches = (pack: CsolutionApiV3.PackData) => !text || !!pack.id?.toLowerCase().includes(text)
            || !!pack.description?.toLowerCase().includes(text);
        if (options?.scope !== 'used' && options?.scope !== 'missing') {
            const result = await this.dataManager.getPacks(options?.scope);
            return text ? { ...result, packs: result.packs.filter(matches) } : result;
        }
        const scope = options.scope;
        const queryName = scope === 'used' ? 'Used' : 'Missing';
        const context = options.context;
        if (typeof context !== 'string' || !context.trim()) {
            throw new Error(`${queryName} pack query requires an explicit context`);
        }
        const solution = this.solutionManager.getCsolution();
        if (!solution || !this.solutionManager.loadState.loaded) {
            throw new Error(`${queryName} pack query requires a loaded solution`);
        }
        const hasContext = () => solution.getActiveTargetSetWrap()?.projectContexts.some(projectContext =>
            `${projectContext.name}+${solution.getActiveTargetType()}` === context);
        if (!hasContext()) {
            throw new Error(`Unknown pack context: ${context}`);
        }
        const result = await this.csolutionService.getPacksInfo({ context, all: true });
        if (!result.success) {
            throw new Error(result.message ?? `Unable to query ${scope} packs`);
        }
        if (this.solutionManager.getCsolution() !== solution || !this.solutionManager.loadState.loaded
            || !hasContext()) {
            throw new Error(`Solution or context changed during ${scope} pack query`);
        }
        if (scope === 'missing') {
            const packs = result.packs.flatMap(pack => (pack.references ?? [])
                .filter(reference => reference.missing === true)
                .map(reference => ({
                    pack: reference.pack,
                    origin: reference.origin,
                    ...(reference.resolvedPack === undefined ? {} : { resolvedPack: reference.resolvedPack }),
                })));
            return { packs: packs.filter(pack => !text || pack.pack.toLowerCase().includes(text)) };
        }
        const packs = result.packs.filter(pack => pack.used === true).map(pack => {
            const packId = splitPackId(pack.id);
            if (!packId) {
                throw new Error(`Invalid pack ID format: ${pack.id}`);
            }
            const { version } = packId;
            if (!version) {
                throw new Error(`Used pack has no version: ${pack.id}`);
            }
            const reference = pack.references?.find(item => item.resolvedPack === pack.id && !item.missing);
            return {
                id: pack.id,
                version,
                ...(pack.description === undefined ? {} : { description: pack.description }),
                ...(reference ? { installed: true } : {}),
                ...(reference?.path === undefined ? {} : { path: reference.path }),
            };
        });
        return { packs: packs.filter(matches) };
    }

    public async installPacks(options: { packs: string[]; approved: boolean }): Promise<CsolutionApiV3.PackInstallResult[]> {
        const input = options?.packs;
        if (!Array.isArray(input)) {
            throw new Error('Pack IDs must be an array of strings');
        }
        const packs = Array.from(input);
        if (!packs.every(pack => typeof pack === 'string')) {
            throw new Error('Pack IDs must be an array of strings');
        }
        if (!packs.length) {
            return [];
        }
        if (options.approved !== true) {
            return packs.map(pack => ({ pack, status: 'cancelled' }));
        }
        const results: CsolutionApiV3.PackInstallResult[] = [];
        for (const pack of packs) {
            try {
                const packId = splitPackId(pack);
                if (!packId || packId.version === '') {
                    throw new Error(`Invalid pack ID format: ${pack}`);
                }
                const { vendor, name, version } = packId;
                const installedPath = await this.commandsProvider.executeCommand<string | undefined>(
                    PackInstallCommands.installPackCommandId, vendor, name, version,
                );
                results.push(installedPath
                    ? { pack, status: 'installed', path: installedPath }
                    : { pack, status: 'failed', error: `Unable to install ${pack}` });
            } catch (error) {
                results.push({ pack, status: 'failed', error: error instanceof Error ? error.message : String(error) });
            }
        }
        return results;
    }

    public dispose() {
        this.existingApi.dispose();
    }

    public getBoards(...args: Parameters<CsolutionApiV2['getBoards']>) {
        return this.existingApi.getBoards(...args);
    }

    public getDevices(...args: Parameters<CsolutionApiV2['getDevices']>) {
        return this.existingApi.getDevices(...args);
    }

    public getDraftProjects(...args: Parameters<CsolutionApiV2['getDraftProjects']>) {
        return this.existingApi.getDraftProjects(...args);
    }

    public createNewSolution(...args: Parameters<CsolutionApiV2['createNewSolution']>) {
        return this.existingApi.createNewSolution(...args);
    }

    public build(...args: Parameters<CsolutionApiV2['build']>) {
        return this.existingApi.build(...args);
    }
}
