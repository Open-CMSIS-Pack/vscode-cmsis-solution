/**
 * Copyright 2023-2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ExtensionContext } from 'vscode';
import * as manifest from '../../manifest';
import { CommandsProvider } from '../../vscode-api/commands-provider';
import { SolutionManager } from '../solution-manager';
import { getCmsisPackRoot } from '../../utils/path-utils';

export class DebugHardwareCommands {
    public static readonly PROCESSOR_NAME_COMMAND_ID = `${manifest.PACKAGE_NAME}.getProcessorName`;
    public static readonly DEVICE_NAME_COMMAND_ID = `${manifest.PACKAGE_NAME}.getDeviceName`;
    public static readonly BOARD_NAME_COMMAND_ID = `${manifest.PACKAGE_NAME}.getBoardName`;
    public static readonly DFP_NAME_COMMAND_ID = `${manifest.PACKAGE_NAME}.getDfpName`;
    public static readonly BSP_NAME_COMMAND_ID = `${manifest.PACKAGE_NAME}.getBspName`;
    public static readonly DFP_PATH_COMMAND_ID = `${manifest.PACKAGE_NAME}.getDfpPath`;
    public static readonly BSP_PATH_COMMAND_ID = `${manifest.PACKAGE_NAME}.getBspPath`;
    public static readonly PACK_ROOT_PATH_COMMAND_ID = `${manifest.PACKAGE_NAME}.getPackRootPath`;
    public static readonly CBUILD_RUN_PATH_COMMAND_ID = `${manifest.PACKAGE_NAME}.getCbuildRunFile`;
    public static readonly ACTIVE_TARGET_SET_COMMAND_ID = `${manifest.PACKAGE_NAME}.getActiveTargetSet`;

    constructor(
        private readonly commandsProvider: CommandsProvider,
        private readonly solutionManager: SolutionManager,
    ) {}

    public async activate(context: Pick<ExtensionContext, 'subscriptions'>) {
        context.subscriptions.push(
            this.commandsProvider.registerCommand(DebugHardwareCommands.PROCESSOR_NAME_COMMAND_ID, this.getProcessorName, this),
            this.commandsProvider.registerCommand(DebugHardwareCommands.DEVICE_NAME_COMMAND_ID, this.getDeviceName, this),
            this.commandsProvider.registerCommand(DebugHardwareCommands.BOARD_NAME_COMMAND_ID, this.getBoardName, this),
            this.commandsProvider.registerCommand(DebugHardwareCommands.DFP_NAME_COMMAND_ID, this.getDfpName, this),
            this.commandsProvider.registerCommand(DebugHardwareCommands.BSP_NAME_COMMAND_ID, this.getBspName, this),
            this.commandsProvider.registerCommand(DebugHardwareCommands.DFP_PATH_COMMAND_ID, this.getDfpPath, this),
            this.commandsProvider.registerCommand(DebugHardwareCommands.BSP_PATH_COMMAND_ID, this.getBspPath, this),
            this.commandsProvider.registerCommand(DebugHardwareCommands.PACK_ROOT_PATH_COMMAND_ID, this.getPackRootPath, this),
            this.commandsProvider.registerCommand(DebugHardwareCommands.CBUILD_RUN_PATH_COMMAND_ID, this.getCbuildRunFile, this),
            this.commandsProvider.registerCommand(DebugHardwareCommands.ACTIVE_TARGET_SET_COMMAND_ID, this.getActiveTargetSet, this),
        );
    }

    private getDeviceName() {
        return this.solutionManager.getCsolution()?.getDeviceName() ?? '';
    }

    private getBoardName() {
        return this.solutionManager.getCsolution()?.getBoardName() ?? '';
    }

    private getProcessorName(): string {
        return this.solutionManager.getCsolution()?.getProcessorName() ?? '';
    }

    private getDfpName() {
        return this.solutionManager.getCsolution()?.getDevicePack() ?? '';
    }

    private getBspName() {
        return this.solutionManager.getCsolution()?.getBoardPack() ?? '';
    }

    private getPackPath(name: string): string | undefined {
        const csolution = this.solutionManager.getCsolution();
        const path = csolution?.getPacks()?.get(name);
        return path?.replace('${CMSIS_PACK_ROOT}', getCmsisPackRoot());
    }

    private getDfpPath(): string | undefined {
        return this.getPackPath(this.getDfpName()) ?? '<not found>';
    }

    private getBspPath() {
        return this.getPackPath(this.getBspName()) ?? '<not found>';
    }

    private getPackRootPath() {
        return getCmsisPackRoot();
    }

    private getCbuildRunFile() {
        const csolution = this.solutionManager.getCsolution();
        return csolution?.cbuildRunYml?.fileName ?? '';
    }

    private getActiveTargetSet() {
        return this.solutionManager.getCsolution()?.getActiveTargetSetName() ?? '';
    }
}
