/**
 * Copyright 2024-2026 Arm Limited
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

import { existsSync } from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { CTreeItem, ITreeItem } from '../../generic/tree-item';
import * as manifest from '../../manifest';
import { SolutionManager } from '../../solutions/solution-manager';
import { CommandsProvider } from '../../vscode-api/commands-provider';
import { MessageProvider } from '../../vscode-api/message-provider';
import { WebviewManager, WebviewManagerOptions } from '../webview-manager';
import { copyLayerToProject } from './board-layer';
import * as Messages from './messages';
import { ChangeLayerMessage } from './messages';
import { ConfigurationVariable, LayerError, TargetConfiguration, VariableSet } from './view/state/reducer';
import { LayerVariable, VariablesConfiguration, SettingsType } from '../../json-rpc/csolution-rpc-client';

function mapSet(settings: SettingsType[]): VariableSet[] {
    const variableSettings: VariableSet[] = [];
    settings.forEach(setting => {
        variableSettings.push({ set: setting.set });
    });
    return variableSettings;
}

function mapVariable(variable: LayerVariable): ConfigurationVariable {
    const path = variable.path ?? '';
    const file = variable.file ?? '';

    return {
        variableName: variable.name,
        variableValue: variable.clayer,
        description: variable.description ?? '',
        path: path,
        file: file,
        copyTo: variable['copy-to'] ?? '',
        copyToOrig: variable['copy-to'] ?? '',
        settings: mapSet(variable.settings ?? []),
        disabled: !path.length && !file.length,
    };
}

function mapTargetConfiguration(variables: LayerVariable[]): TargetConfiguration {
    const vars: ConfigurationVariable[] = [];
    variables.forEach(variable => {
        vars.push(mapVariable(variable));
    });
    return { variables: vars };
}

function getDataBoardLayers(configurations: VariablesConfiguration[]): TargetConfiguration[] {
    const layers: TargetConfiguration[] = [];
    configurations.forEach(configuration => {
        layers.push(mapTargetConfiguration(configuration.variables));
    });
    return layers;
}

function checkError(error: ITreeItem<CTreeItem>) {
    return error.getValueAsString();
}

function filterError(cBuildError: ITreeItem<CTreeItem>) {
    const message = cBuildError.getValueAsString();
    const found = message.indexOf('no compatible software layer found') != -1;
    return found;
}

function checkCbuildForErrors(cBuild: ITreeItem<CTreeItem>): LayerError {
    return {
        name: cBuild.getValueAsString('cbuild'),
        project: cBuild.getValueAsString('project'),
        configuration: cBuild.getValueAsString('configuration'),
        messages: cBuild.findChild(['messages', 'errors'])?.
            getChildren().
            filter(filterError).
            map(checkError),
    };
}

function filterErrorsTag(cBuild: ITreeItem<CTreeItem>) {
    const cbuildErrors = cBuild.getValueAsString('errors') == 'true' ? true : false;
    const cbuildMessages = !!cBuild.findChild(['messages', 'errors'])?.getChildren().filter(filterError).length;
    return cbuildErrors && cbuildMessages;
}

function getAvailableCbuildErrors(avCBuilds: ITreeItem<CTreeItem>[]) {
    return avCBuilds?.
        filter(filterErrorsTag).
        map(checkCbuildForErrors);
}

export const MANAGE_LAYERS_WEBVIEW_OPTIONS: Readonly<WebviewManagerOptions> = {
    title: 'Configure Solution',
    scriptPath: path.join('dist', 'views', 'configureSolution.js'),
    viewType: 'cmsis.configureSolution',
    commandId: `${manifest.PACKAGE_NAME}.configureSolution`,
    iconName: {
        dark: 'cmsis-icn.svg',
        light: 'cmsis-icn-light.svg'
    }
};

export class ManageLayersWebviewMain {
    private readonly webviewManager: WebviewManager<Messages.IncomingMessage, Messages.OutgoingMessage>;

    constructor(
        readonly context: vscode.ExtensionContext,
        private readonly commandsProvider: CommandsProvider,
        private readonly messageProvider: MessageProvider,
        private readonly solutionManager: SolutionManager,
        webviewManager?: WebviewManager<Messages.IncomingMessage, Messages.OutgoingMessage>,
    ) {
        this.webviewManager = webviewManager || new WebviewManager(context, MANAGE_LAYERS_WEBVIEW_OPTIONS, this.commandsProvider);
        this.solutionManager.onLoadedBuildFiles((() => this.onLoadedBuildFiles()).bind(this));
    }

    private async sendPlatform() {
        this.webviewManager.sendMessage({ type: 'PLATFORM', data: { name: 'vscode' } });
    }


    private async applyOrChangeLayer(layer: TargetConfiguration) {
        const csolution = this.solutionManager.getCsolution();

        if (csolution && csolution.variablesConfigurations) {
            const activeTarget = csolution?.getActiveTargetType() || '';
            const activeTargetTypeItem = csolution.getDefaultTargetTypeItem(activeTarget);
            if (!activeTargetTypeItem || !activeTarget) {
                return; // error
            }

            const variables = activeTargetTypeItem.createChild('variables', true);
            layer.variables.forEach(variable => {
                const key = variable.variableName;
                const value = (variable.copyTo.length && variable.file.length) ? '$SolutionDir()$/' + variable.copyTo + '/' + variable.file : '';

                if (key.length && value.length) {
                    let item = variables.getChildByValue(key);
                    if (item) {
                        item.setValue(value);
                    } else {
                        item = variables.createChild('-', false).setValue(key, value);
                    }

                    const srcValue = variable.variableValue;
                    if (srcValue.length) {
                        item.setValue('copied-from', srcValue);
                    }
                }
            });
            await csolution.csolutionYml.save();
            await copyLayerToProject(layer, csolution.solutionDir);
        }
    }

    private async applyOrChangeCompiler(compilerSelection: string) {
        const csolution = this.solutionManager.getCsolution();
        const solutionNode = csolution?.csolutionYml.topItem;
        if (csolution && solutionNode && compilerSelection.length) {
            solutionNode?.setValue('compiler', compilerSelection);
            await csolution.csolutionYml.save();
        }
    }


    private async applyConfiguration(message: ChangeLayerMessage): Promise<void> {
        try {
            await this.applyOrChangeLayer(message.layer);
            await this.applyOrChangeCompiler(message.compiler);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : error;
            this.messageProvider.showErrorMessage(`Failed to apply changes: ${errorMessage}`);
            this.webviewManager.sendMessage({
                type: 'REQUEST_FAILED',
                requestType: 'APPLY_CONFIGURE',
                errorMessage: `Failed to apply changes: ${errorMessage}`
            });
            return;
        }
    }

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(
            this.webviewManager.onDidReceiveMessage(this.handleMessage, this),
        );
        this.webviewManager.activate(context);
    }

    private onLoadedBuildFiles(): void {
        const csolution = this.solutionManager.getCsolution();
        const activeTarget = csolution?.getActiveTargetType() || '';
        if (!csolution) {
            this.webviewManager.sendMessage({
                type: 'BOARD_LAYER_NODATA',
                activeTargetType: activeTarget,
                availableCompilers: [],
            });
            return;
        }

        this.getDataUserChoice();
    }

    private showPanel(show: boolean) {
        if (!show) {
            return;
        }

        this.webviewManager.createOrShowPanel();
    }

    private sendConfigurations(configurations: VariablesConfiguration[] | undefined, activeTarget: string, avComps: string[] | undefined) {

        if (!configurations) {
            this.webviewManager.sendMessage({
                type: 'BOARD_LAYER_NODATA',
                activeTargetType: activeTarget,
                availableCompilers: avComps ?? [],
            });
            return;
        }

        const layers = getDataBoardLayers(configurations);
        this.webviewManager.sendMessage({
            type: 'BOARD_LAYER_DATA',
            layers,
            activeTargetType: activeTarget,
            availableCompilers: avComps ?? [],
        });
    }

    private checkForLayerErrors(avCBuilds: ITreeItem<CTreeItem>[] | undefined): boolean {
        if (!avCBuilds) {
            return false;
        }

        const layerErrors = getAvailableCbuildErrors(avCBuilds);
        this.webviewManager.sendMessage({
            type: 'BOARD_LAYER_DATA_ERRORS',
            layerErrors,
        });

        // send message to GUI with error strins

        return !!layerErrors?.length;
    }

    private getDataUserChoice() {
        const csolution = this.solutionManager.getCsolution();
        const cBuildIdxYml = csolution?.cbuildIdxYmlRoot;
        if (!cBuildIdxYml) {
            this.webviewManager.sendMessage({
                type: 'LOADING'
            });
            return;
        }

        const avComps = csolution?.selectCompiler;
        const configurations = csolution?.variablesConfigurations;
        const avCBuilds = cBuildIdxYml.findChild(['build-idx', 'cbuilds'])?.getChildren();
        const avErrors = this.checkForLayerErrors(avCBuilds);
        const activeTarget = csolution?.getActiveTargetType() || '';

        if (avComps?.length == 1) { // just one compiler, add it automagically
            const availableCompilers = avComps;
            if (availableCompilers.length) {
                this.applyOrChangeCompiler(availableCompilers[0]);
                return; // return here as the change triggers cbuild and another reload
            }
        }

        this.showPanel(!!avComps || !!configurations || avErrors);
        this.sendConfigurations(configurations, activeTarget, avComps);
    }

    private localFolderExists(localPath: string): boolean {
        const csolution = this.solutionManager.getCsolution();
        if (!csolution) {
            return false;
        }

        return existsSync(path.join(csolution.solutionDir, localPath));
    }

    private async handleMessage(message: Messages.OutgoingMessage): Promise<void> {
        try {
            switch (message.type) {
                case 'APPLY_CONFIGURE':
                    await this.applyConfiguration(message);
                    break;
                case 'GET_PLATFORM':
                    await this.sendPlatform();
                    break;
                case 'DATA_UPDATE_BOARD_LAYERS':
                    this.getDataUserChoice();
                    break;
                case 'WEBVIEW_CLOSE':
                    this.webviewManager.disposePanel();
                    break;
                case 'CHECK_LAYER_DOES_NOT_EXIST': {
                    const layerExists = this.localFolderExists(message.layerFolder);
                    this.webviewManager.sendMessage({ type: 'RESULT_LAYER_EXISTS_CHECK', variableId: message.variableId, result: layerExists });
                    return; // early exit
                }
            }
            this.webviewManager.sendMessage({ type: 'REQUEST_SUCCESSFUL', requestType: message.type });
        } catch (err) {
            const _err = err as Error;
            this.messageProvider.showErrorMessage(`Solution service failure: ${_err.message}\n${_err.stack}`);
            console.log(err);
        }
    }
}
