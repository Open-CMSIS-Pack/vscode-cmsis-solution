/**
 * Copyright 2022-2026 Arm Limited
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

import * as vscode from 'vscode';
import * as manifest from '../manifest';
import { CommandsProvider } from '../vscode-api/commands-provider';
import { ActiveSolutionTracker } from './active-solution-tracker';
import { CSolution } from './csolution';
import { UPDATE_DEBUG_TASKS_COMMAND_ID } from '../debug/debug-launch-provider';
import { Severity } from './constants';
import { SolutionEventHub, ConvertResultData } from './solution-event-hub';
import { ExtensionApiProvider } from '../vscode-api/extension-api-provider';
import { EnvironmentManagerApiV1 } from '@arm-software/vscode-environment-manager';
import { ETextFileResult } from '../generic/text-file';
import { debounce } from 'lodash';


export interface SolutionLoadState {
    solutionPath?: string;
    loaded?: boolean;     // solution.yml + project.yml files loaded
    converted?: boolean;  // conversion executed and cbuild*.yml files are loaded.
};

export const solutionLoadStatesEqual = (a: SolutionLoadState, b: SolutionLoadState): boolean => {
    return a.solutionPath === b.solutionPath
        && a.loaded === b.loaded
        && a.converted === b.converted;
};

export interface SolutionLoadStateChangeEvent {
    previousState: SolutionLoadState;
    newState: SolutionLoadState;
}

/**
 * Main interface to data about the current solution.
 */
export interface SolutionManager {

    readonly loadState: SolutionLoadState;

    readonly getCsolution: () => CSolution | undefined;

    readonly onDidChangeLoadState: vscode.Event<SolutionLoadStateChangeEvent>;

    readonly onLoadedBuildFiles: vscode.Event<[Severity, boolean]>;

    readonly onUpdatedCompileCommands: vscode.Event<void>;

    readonly workspaceFolder: vscode.Uri | undefined;

    // triggers reload of solution
    refresh(): Promise<void>;
}

export class SolutionManagerImpl implements SolutionManager {
    public static readonly refreshCommandId = `${manifest.PACKAGE_NAME}.refresh`;

    private readonly loadStateChangeEmitter = new vscode.EventEmitter<SolutionLoadStateChangeEvent>();
    public readonly onDidChangeLoadState = this.loadStateChangeEmitter.event;

    private readonly loadBuildFilesEmitter = new vscode.EventEmitter<[Severity, boolean]>();
    public readonly onLoadedBuildFiles = this.loadBuildFilesEmitter.event;

    private readonly updatedCompileCommandsEmitter = new vscode.EventEmitter<void>();
    public readonly onUpdatedCompileCommands = this.updatedCompileCommandsEmitter.event;

    private readonly debouncedHandleEnvironmentChange = debounce(this.handleEnvironmentChange.bind(this), 500);
    private _loadState: Readonly<SolutionLoadState> = { solutionPath: undefined };
    private csolution?: CSolution;

    constructor(
        private readonly activeSolutionTracker: ActiveSolutionTracker,
        private readonly eventHub: SolutionEventHub,
        private readonly commandsProvider: CommandsProvider,
        private readonly environmentManagerApiProvider: ExtensionApiProvider<Pick<EnvironmentManagerApiV1, 'onDidActivate' | 'getActiveTools'>>,

    ) { }

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(
            this.activeSolutionTracker.onDidChangeActiveSolution(this.handleChangeActiveSolution, this),
            this.activeSolutionTracker.onActiveSolutionFilesChanged(this.handleActiveSolutionFilesChanged, this),
            this.eventHub.onDidConvertCompleted(this.handleSolutionConvertCompleted, this),
            this.commandsProvider.registerCommand(SolutionManagerImpl.refreshCommandId, this.refresh, this),
            this.environmentManagerApiProvider.onActivate(environmentManagerApi => {
                environmentManagerApi.onDidActivate(this.debouncedHandleEnvironmentChange, this, context.subscriptions);
            }),
            this.loadStateChangeEmitter,
            this.loadBuildFilesEmitter,
            this.updatedCompileCommandsEmitter,
        );
    }

    public getCsolution(): CSolution | undefined {
        return this.csolution;
    }

    public get loadState(): SolutionLoadState {
        return this._loadState;
    }

    public get workspaceFolder() {
        const solutionPath = this.csolution?.solutionPath ?? '';
        return vscode.workspace.getWorkspaceFolder(vscode.Uri.file(solutionPath))?.uri;
    }

    private async handleEnvironmentChange(): Promise<void> {
        if (!this.loadState.solutionPath) {
            return;
        }
        await this.loadSolution();
        this.requestConvert(false, true, false);
    }


    private async handleChangeActiveSolution(): Promise<void> {
        const solutionPath = this.activeSolutionTracker.activeSolution;
        this.csolution = undefined; // clear data model
        // Create new state object
        const newState: SolutionLoadState = {
            solutionPath: solutionPath
        };

        if (solutionPath) {
            this.setLoadState(newState, false);
            await this.loadSolution();
            // trigger solution convert without RTE update
            this.requestConvert(false, false, true);
        } else {
            this.setLoadState(newState, true);
        }
    }

    private async handleActiveSolutionFilesChanged(): Promise<void> {
        if (!this.loadState.solutionPath) {
            return;
        }
        await this.loadSolution();
        this.requestConvert(true, false, false);
    }

    public async refresh() {
        // does the same as file change
        await this.handleActiveSolutionFilesChanged();
    }

    private async requestConvert(updateRte?: boolean, restartRpc?: boolean, lockAbort?: boolean) {
        if (!this.csolution || !this.csolution.solutionPath) {
            return;
        }

        // check if updateRte is forced
        updateRte = await this.hasForceUpdateRte() || updateRte;

        // Create new state object with converted flag reset
        const newState: SolutionLoadState = {
            ...this.loadState,
            converted: false
        };
        this.setLoadState(newState, false);

        this.eventHub.fireConvertRequest({
            solutionPath: this.csolution.solutionPath,
            targetSet: this.csolution.getActiveTargetSetName(),
            updateRte: updateRte,
            restartRpc: restartRpc,
            lockAbort: lockAbort,
        });
    }

    private async loadSolution(): Promise<void> {
        if (!this.loadState.solutionPath) {
            return;
        }

        try {
            this.csolution = new CSolution();
            await this.csolution.load(this.loadState.solutionPath);

            // Create new state object with loaded flag
            const newState: SolutionLoadState = {
                ...this.loadState,
                loaded: true
            };
            this.setLoadState(newState, true);
        } catch (error) {
            console.error(`Failed to load ${this.loadState.solutionPath}`, error);
        }
    }

    private async handleSolutionConvertCompleted(data: ConvertResultData) {
        await this.loadSolutionBuildFiles();
        if (data.severity != 'error') {
            await this.commandsProvider.executeCommandIfRegistered(UPDATE_DEBUG_TASKS_COMMAND_ID);
        }
        this.loadBuildFilesEmitter.fire([data.severity, data.detection]);
        this.updatedCompileCommandsEmitter.fire();
    }

    public async loadSolutionBuildFiles() {
        if (this.loadState.solutionPath && this.csolution) {
            const result = await this.csolution.loadBuildFiles();
            const newState: SolutionLoadState = {
                ...this.loadState,
                converted: true
            };
            this.setLoadState(newState, result !== ETextFileResult.Unchanged);
        }
    }

    private setLoadState(newState: SolutionLoadState, emit: boolean) {
        const previousState: SolutionLoadState = { ...this.loadState, };
        this._loadState = newState;
        if (emit) {
            this.loadStateChangeEmitter.fire({ previousState, newState });
        }
    }

    private async hasForceUpdateRte(): Promise<boolean> {
        const cmsisJson = this.getCsolution()?.cmsisJsonFile;
        if (cmsisJson) {
            const forceUpdateRte = await cmsisJson.getAndDelete('force-update-rte');
            return forceUpdateRte === true;
        }
        return false;
    }
}
