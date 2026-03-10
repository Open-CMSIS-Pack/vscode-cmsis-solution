/**
 * Copyright 2026 Arm Limited
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
import { CommandsProvider } from '../../../vscode-api/commands-provider';
import { COutlineItem } from '../tree-structure/solution-outline-item';
import { PACKAGE_NAME, README_FILE_PATH } from '../../../manifest';
import path from 'path';
import { SolutionManager } from '../../../solutions/solution-manager';
import { IOpenFileExternal } from '../../../open-file-external-if';
import { contextDescriptorFromString } from '../../../solutions/descriptors/descriptors';


export class OpenCommand {
    public static readonly openSolutionCommandId = `${PACKAGE_NAME}.openSolutionFile`;
    public static readonly openProjectCommandId = `${PACKAGE_NAME}.openProjectFile`;
    public static readonly openPrjConfCommandId = `${PACKAGE_NAME}.openPrjConfFile`;
    public static readonly openLayerCommandId = `${PACKAGE_NAME}.openLayerFile`;
    public static readonly openLinkerCommandId = `${PACKAGE_NAME}.openLinkerMapFile`;
    public static readonly openDocCommandId = `${PACKAGE_NAME}.openDocFile`;
    public static readonly openHelpCommandId = `${PACKAGE_NAME}.openHelp`;
    public static readonly openZephyrTerminalCommandId = `${PACKAGE_NAME}.openZephyrTerminal`;

    constructor(
        private readonly solutionManager: SolutionManager,
        private readonly commandsProvider: CommandsProvider,
        private readonly openFileExternal: IOpenFileExternal,
    ) { }

    public async activate(context: Pick<vscode.ExtensionContext, 'subscriptions'>) {
        const keilPack = vscode.extensions.getExtension<void>('arm.keil-studio-pack');
        let helpFilePath : string | undefined = undefined;
        if (keilPack?.extensionPath) {
            helpFilePath = path.join(keilPack.extensionPath, 'guide');
        }

        context.subscriptions.push(
            this.commandsProvider.registerCommand(OpenCommand.openSolutionCommandId, () =>
                (this.solutionManager.loadState.solutionPath) ? this.openFile(this.solutionManager.loadState.solutionPath) : undefined, this),
            this.commandsProvider.registerCommand(OpenCommand.openProjectCommandId, (node: COutlineItem) => {
                this.commandHandler(OpenCommand.openProjectCommandId, node);
            }, this),
            this.commandsProvider.registerCommand(OpenCommand.openPrjConfCommandId, (node: COutlineItem) => {
                this.commandHandler(OpenCommand.openPrjConfCommandId, node);
            }, this),
            this.commandsProvider.registerCommand(OpenCommand.openLayerCommandId, (node: COutlineItem) => {
                this.commandHandler(OpenCommand.openLayerCommandId, node);
            }, this),
            this.commandsProvider.registerCommand(OpenCommand.openLinkerCommandId, (node: COutlineItem) => {
                this.commandHandler(OpenCommand.openLinkerCommandId, node);
            }, this),
            this.commandsProvider.registerCommand(OpenCommand.openDocCommandId, (node: COutlineItem) => {
                this.commandHandler(OpenCommand.openDocCommandId, node);
            }, this),
            this.commandsProvider.registerCommand(OpenCommand.openZephyrTerminalCommandId, (node: COutlineItem) => {
                this.openTerminal(node);
            }, this),
            this.commandsProvider.registerCommand(OpenCommand.openHelpCommandId, (section: string = 'index.html') => {
                if (helpFilePath) {
                    this.openFile(`${helpFilePath}/${section}`, true);
                } else {
                    this.openFile(README_FILE_PATH, false);
                }
            }, this),
        );
    }

    private async commandHandler(command: string, node: COutlineItem) {
        const filePath = this.getFilePathForCommand(command, node);
        if (filePath) {
            const openExternal = command === OpenCommand.openDocCommandId;
            this.openFile(filePath, openExternal);
        }
    }

    private getFilePathForCommand(command: string, node: COutlineItem): string | undefined {
        if (command === OpenCommand.openDocCommandId) {
            return node.getAttribute('docPath');
        } else if (command === OpenCommand.openPrjConfCommandId) {
            return node.getAttribute('prjConfPath');
        }
        return node.getAttribute('resourcePath');
    }

    private openFile(path: string, openExternal?: boolean): void {
        if (openExternal) {
            this.openFileExternal.openFile(path);
        } else if (path.toLocaleLowerCase().endsWith('.md')) {
            this.commandsProvider.executeCommand('markdown.showPreview', vscode.Uri.file(path));
        } else {
            this.commandsProvider.executeCommand('vscode.open', vscode.Uri.file(path));
        }
    }

    private openTerminal(node: COutlineItem): void {
        const context = node.getAttribute('label');
        if (context) {
            const cbuildMap = this.solutionManager.getCsolution()?.cbuildYmlRoot;
            if (cbuildMap) {
                const cbuild = [...cbuildMap.keys()].find(
                    key => path.basename(key, '.cbuild.yml') === context) ?? undefined;
                if (cbuild) {
                    const zephyrBuildDir = path.dirname(cbuild);
                    const terminal = vscode.window.createTerminal({
                        name: `Zephyr ${contextDescriptorFromString(context).projectName}`,
                        cwd: zephyrBuildDir,
                    });
                    terminal.show();
                }
            }
        }
    }
}
