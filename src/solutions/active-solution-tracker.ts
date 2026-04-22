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

import * as vscode from 'vscode';
import * as manifest from '../manifest';
import * as path from 'path';
import debounce from 'lodash.debounce';
import { MessageProvider } from '../vscode-api/message-provider';
import { CommandsProvider } from '../vscode-api/commands-provider';
import { FileWatcherProvider } from '../vscode-api/file-watcher-provider';
import { WorkspaceFoldersProvider } from '../vscode-api/workspace-folders-provider';
import { isUri } from '../util';
import { WorkspaceFsProvider } from '../vscode-api/workspace-fs-provider';
import { SOLUTION_SUFFIX } from './constants';
import { ConfigurationProvider } from '../vscode-api/configuration-provider';
import { pathIsAncestor, pathsEqual } from '../utils/path-utils';
import { stripTwoExtensions } from '../utils/string-utils';

export const COMMAND_OPEN_SOLUTION = `${manifest.PACKAGE_NAME}.openSolution`;
export const COMMAND_ACTIVATE_SOLUTION = `${manifest.PACKAGE_NAME}.activateSolution`;
export const COMMAND_DEACTIVATE_SOLUTION = `${manifest.PACKAGE_NAME}.deactivateSolution`;
export const COMMAND_GET_SOLUTION_FILE = `${manifest.PACKAGE_NAME}.getSolutionFile`;
/** @deprecated */
export const COMMAND_GET_SOLUTION_PATH = `${manifest.PACKAGE_NAME}.getSolutionPath`;


// this pattern covers csolution, project, layer and global generator files
export const solutionFileWatchPattern =
    '**/{cdefault,*.csolution,*.cproject,*.clayer,*.cgen}.{yaml,yml}';


export interface SolutionDetails {
    displayName: string;
    path: string;
}

/**
 * Tracks the solution chosen as active by the user. Note: this might not match
 * the solution currently loaded in Core Tools if unsaved changes prevent switching.
 */
export interface ActiveSolutionTracker {

    /**
     * Event fired when the available solutions in the workspace changes
     */
    readonly onDidChangeSolutions: vscode.Event<void>;

    /**
     * Event fired when the active solution changes, with the file path of the new solution.
     */
    readonly onDidChangeActiveSolution: vscode.Event<void>;

    /**
     * Event fired when files that belong to the active solution change.
     */
    readonly onActiveSolutionFilesChanged: vscode.Event<void>;

    /**
     * Get or set the absolute file path of the current active solution's csolution.yml.
     * Undefined if no solution is active.
     */
    activeSolution: string | undefined;

    /**
     * Get the absolute file paths for available csolution.yml files in the workspace.
     */
    readonly solutions: string[];

    activate(context: vscode.ExtensionContext): Promise<void>;

    getSolutionDetails(solutionPath: string): SolutionDetails;

    suspendWatch: boolean;
}

type SolutionState = 'active' | 'inactive' | 'none';

export class ActiveSolutionTrackerImpl implements ActiveSolutionTracker {
    public static readonly GLOB_PATTERN = '**/*.csolution.{yaml,yml}';

    public static readonly ACTIVE_SOLUTION_KEY = 'activeSolution';
    public static readonly ACTIVE_SOLUTION_STATE_KEY = 'activeSolutionState';
    public static readonly ACTIVE_SOLUTION_STATE = `${manifest.PACKAGE_NAME}.${ActiveSolutionTrackerImpl.ACTIVE_SOLUTION_STATE_KEY}`;
    public static readonly ACTIVE_SOLUTION = `${manifest.PACKAGE_NAME}.${ActiveSolutionTrackerImpl.ACTIVE_SOLUTION_KEY}`;

    private readonly changeSolutionsEmitter = new vscode.EventEmitter<void>();
    public readonly onDidChangeSolutions: vscode.Event<void> = this.changeSolutionsEmitter.event;

    private readonly changeActiveSolutionEmitter = new vscode.EventEmitter<void>();
    public readonly onDidChangeActiveSolution = this.changeActiveSolutionEmitter.event;

    private readonly debouncedRefresh;
    private readonly activeSolutionFilesChangedEmitter = new vscode.EventEmitter<void>();
    public readonly onActiveSolutionFilesChanged = this.activeSolutionFilesChangedEmitter.event;
    private readonly debouncedActiveSolutionFilesChanged: () => void;

    private _activeSolution: string | undefined;
    private _solutions: string[] = [];
    private workspaceState: vscode.Memento | undefined;
    private _suspendWatch = false;

    public constructor(
        protected readonly messageProvider: MessageProvider,
        protected readonly commandsProvider: CommandsProvider,
        protected readonly fileWatcherProvider: FileWatcherProvider,
        protected readonly workspaceFoldersProvider: WorkspaceFoldersProvider,
        protected readonly workspaceFsProvider: WorkspaceFsProvider,
        protected readonly configurationProvider: ConfigurationProvider,
        protected readonly debounceMillis = 1000,
        protected readonly activeSolutionFilesDebounceMillis = 500,
    ) {
        this.debouncedRefresh = debounce(this.refresh, this.debounceMillis);
        this.debouncedActiveSolutionFilesChanged = debounce(() => {
            this.triggerReload();
        }, this.activeSolutionFilesDebounceMillis);
    }

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        this.workspaceState = context.workspaceState;

        context.subscriptions.push(
            // No need to listen to change events here: this class just maintains a list of csolution files,
            // it doesn't care about their contents. Renames come through as a delete and create event.
            this.fileWatcherProvider.watchFiles(ActiveSolutionTrackerImpl.GLOB_PATTERN, {
                onCreate: this.debouncedRefresh,
            },this),
            // VS Code already watches the workspace folders recursively, so this doesn't have an adverse performance impact
            this.fileWatcherProvider.watchFiles('**/*', {
                onDelete: this.handleFileDeleted,
            },this),
            this.activeSolutionFilesChangedEmitter,
            this.fileWatcherProvider.watchFiles(solutionFileWatchPattern, {
                onChange: this.handleActiveSolutionFileChange,
                onCreate: this.handleActiveSolutionFileChange,
            }, this),
            this.commandsProvider.registerCommand(COMMAND_OPEN_SOLUTION, this.handleActivateSolution, this),
            this.commandsProvider.registerCommand(COMMAND_ACTIVATE_SOLUTION, this.handleActivateSolution, this),
            this.commandsProvider.registerCommand(COMMAND_DEACTIVATE_SOLUTION, this.handleDeactivateSolution, this),
            this.commandsProvider.registerCommand(COMMAND_GET_SOLUTION_FILE, this.handleGetSolutionFile, this),
            this.commandsProvider.registerCommand(COMMAND_GET_SOLUTION_PATH, this.handleGetSolutionFile, this),
            this.workspaceFoldersProvider.onDidChangeWorkspaceFolders(this.debouncedRefresh, this),
            this.changeActiveSolutionEmitter,
        );

        this.configurationProvider.onChangeConfiguration(this.debouncedRefresh.bind(this), manifest.CONFIG_EXCLUDE);

        // No await here to avoid unnecessarily slowing extension start
        context.extension.activate().then(() => this.debouncedRefresh());
    }

    private handleFileDeleted(fsPath: string) {
        const normalisedFsPath = path.resolve(fsPath);

        const deletionAffectsSolution = this._solutions.some(solutionPath => {
            const normalisedSolutionPath = path.resolve(solutionPath);
            return normalisedSolutionPath.startsWith(normalisedFsPath);
        });

        if (deletionAffectsSolution) {
            this.debouncedRefresh();
        }
    }

    private async getSolutionPaths(): Promise<string[]> {
        const uris = await this.workspaceFoldersProvider.findFiles(ActiveSolutionTrackerImpl.GLOB_PATTERN, this.getExcludeGlob());
        return uris.map(uri => uri.fsPath).sort();
    }

    /**
     * Reload list of available solutions, check active solution is still present.
     */
    private async refresh() {
        const previousSolutions = this._solutions;
        this._solutions = await this.getSolutionPaths();

        const solutionsChanged = previousSolutions.length !== this.solutions.length
            || previousSolutions.some((solution, index) => solution !== this.solutions[index]);

        if (solutionsChanged) {
            this.changeSolutionsEmitter.fire();
        }

        const previous = this._activeSolution || this.workspaceState?.get<string>(ActiveSolutionTrackerImpl.ACTIVE_SOLUTION_KEY);
        const previousState = this.workspaceState?.get<SolutionState>(ActiveSolutionTrackerImpl.ACTIVE_SOLUTION_STATE_KEY);

        if (previous && this.solutions.includes(previous)) {
            this.activeSolution = previous;
        } else if (previousState === undefined || previousState === 'active') {
            const defaultSolution = this._solutions?.find(s => path.dirname(s) === this.workspaceFoldersProvider.getWorkspaceFolder(s)?.uri?.fsPath);
            this.activeSolution = defaultSolution;
        } else {
            this.activeSolution = undefined;
        }
    }

    public get solutions(): string[] {
        return this._solutions;
    }

    public get activeSolution(): string | undefined {
        return this._activeSolution;
    }

    protected set activeSolutionState(state: SolutionState) {
        const newState: SolutionState = this._solutions?.length > 0 ? state : 'none';
        this.commandsProvider.executeCommand('setContext', ActiveSolutionTrackerImpl.ACTIVE_SOLUTION_STATE, newState);
        this.workspaceState?.update(ActiveSolutionTrackerImpl.ACTIVE_SOLUTION_STATE_KEY, newState);
    }

    public set activeSolution(newPath: string | undefined) {
        // Only update if the new path exists
        if (!newPath || this._solutions.includes(newPath)) {
            const previousActiveSolution = this._activeSolution;
            this._activeSolution = newPath;
            this.workspaceState?.update(ActiveSolutionTrackerImpl.ACTIVE_SOLUTION_KEY, newPath);
            this.commandsProvider.executeCommand('setContext', ActiveSolutionTrackerImpl.ACTIVE_SOLUTION, Object.fromEntries([[newPath, true]]));

            // Only fire the change event if the active solution is different
            if (previousActiveSolution !== newPath) {
                this.changeActiveSolutionEmitter.fire();
            }
            this.activeSolutionState = newPath ? 'active' : 'inactive';
        }
    }

    public getSolutionDetails(solutionPath: string): SolutionDetails {
        const relativePath = this.workspaceFoldersProvider.asRelativePath(solutionPath);
        const displayName = stripTwoExtensions(relativePath);
        return { displayName, path: solutionPath };
    }

    private async handleActivateSolution(inputSolution: unknown): Promise<void> {
        const newSolution = await this.readSolutionPathFromCommandInput(inputSolution) ?? await this.promptUserToSelectSolution();

        if (newSolution) {
            this.activeSolution = newSolution;
        }
    }

    private async handleDeactivateSolution(): Promise<void> {
        this.activeSolution = undefined;
    }

    // Using unknown here rather than Uri | string because VS Code can call the command handler with objects other than URIs on Windows
    private async readSolutionPathFromCommandInput(inputSolution: unknown): Promise<string | undefined> {
        let inputSolutionPath: string | undefined;
        if (typeof inputSolution === 'string') {
            inputSolutionPath = inputSolution;
        } else if (isUri(inputSolution)) {
            inputSolutionPath = inputSolution.fsPath;
        }
        if (!inputSolutionPath) {
            return;
        }
        const inputFsPath = await this.getCsolutionFile(inputSolutionPath);

        // A request can arrive before the debounced activation path triggers refresh.
        // Avoid updating the cached solutions list here so the normal refresh path can
        // still detect changes and notify onDidChangeSolutions listeners.
        const solutions = this._solutions.length === 0
            ? await this.getSolutionPaths()
            : this.solutions;

        return solutions.includes(inputFsPath) ? inputFsPath : undefined;
    }

    private async getCsolutionFile(inputSolutionPath: string): Promise<string> {
        if (inputSolutionPath.endsWith(SOLUTION_SUFFIX) || inputSolutionPath.endsWith('.csolution.yaml')) {
            return inputSolutionPath;
        }
        const files = await this.workspaceFsProvider.readDirectory(inputSolutionPath);
        const csolutionFiles = files.filter(f => f[1] === 'file' && (f[0].endsWith('.csolution.yml') || f[0].endsWith('.csolution.yaml')));
        const csolutionFileName = csolutionFiles[0][0];
        return path.join(inputSolutionPath, csolutionFileName);
    }

    private async promptUserToSelectSolution(): Promise<string | undefined> {
        const solutions = this.solutions;
        const items = this.solutions
            .map(solutionPath => this.getSolutionDetails(solutionPath).displayName);
        const result = await vscode.window.showQuickPick(items, { placeHolder: 'Select a solution' });
        return result && solutions[items.indexOf(result)];
    }

    private async handleGetSolutionFile(): Promise<string | undefined> {
        return this._activeSolution;
    }

    private getExcludeGlob(): string | undefined {
        return this.configurationProvider.getConfigVariable<string>(manifest.CONFIG_EXCLUDE) || undefined;
    }

    private triggerReload(): void {
        this.activeSolutionFilesChangedEmitter.fire();
    }

    public get suspendWatch(): boolean {
        return this._suspendWatch;
    }

    public set suspendWatch(value: boolean) {
        this._suspendWatch = value;
    }

    private handleActiveSolutionFileChange(changedPath: string): void {
        if (this.suspendWatch) {
            return;
        }
        const solutionFilePath = this.activeSolution;

        if (solutionFilePath) {
            // Assume all projects and layers associated with a solution are ancestors of the solution file base directory
            const solutionRoot = path.dirname(solutionFilePath);
            const isSolutionFileChange = changedPath.endsWith('csolution.yml') || changedPath.endsWith('csolution.yaml');

            if (pathsEqual(changedPath, solutionFilePath) || (pathIsAncestor(solutionRoot, changedPath) && !isSolutionFileChange)) {
                this.debouncedActiveSolutionFilesChanged();
            }
        }
    }
}

