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
import * as manifest from './manifest';
import { CmsisToolboxManager } from './solutions/cmsis-toolbox';
import { SolutionLoadStateChangeEvent, SolutionManager } from './solutions/solution-manager';
import { ThemeProvider } from './vscode-api/theme-provider';
import { ContextDescriptor } from './solutions/descriptors/descriptors';
import { Severity } from './solutions/constants';
import path from 'path';
import { backToForwardSlashes } from './utils/path-utils';

enum ECbuildSetupStatus {
    Idle,
    Detection,
    Success,
    Error,
    Warning,
}

export class StatusBar {
    public static readonly commandType = `${manifest.PACKAGE_NAME}.showContextSelection`;
    private statusBarItemIcon = '$(target)';
    private cbuildSetupStatus = ECbuildSetupStatus.Idle;

    public constructor(
        protected readonly solutionManager: SolutionManager,
        protected readonly cmsisToolboxManager: CmsisToolboxManager,
        protected readonly themeProvider: ThemeProvider,
    ) {}

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.name = 'CMSIS Context';
        statusBarItem.command = StatusBar.commandType;
        statusBarItem.text = '$(sync~spin) Loading Solution...';

        context.subscriptions.push(
            vscode.commands.registerCommand(StatusBar.commandType, () => this.runOnClick()),
            this.cmsisToolboxManager.onRunCmsisTool(([start, packs]) => this.updateIconStatus(statusBarItem, start, packs)),
            this.solutionManager.onLoadedBuildFiles(([severity, detection]) => this.updateCbuildSetupStatus(statusBarItem, severity, detection)),
            this.solutionManager.onDidChangeLoadState((event) => this.handleLoadStateChange(statusBarItem, event)),
            statusBarItem,
        );
    }

    public runOnClick(): void {
        if (this.cmsisToolboxManager.isRunning() || this.cbuildSetupStatus === ECbuildSetupStatus.Error || this.cbuildSetupStatus === ECbuildSetupStatus.Warning) {
            // show output channel view if there are cbuild setup errors/warnings
            vscode.commands.executeCommand(
                `workbench.action.output.show.extension-output-Arm.${manifest.PACKAGE_NAME}-#1-${manifest.CMSIS_SOLUTION_OUTPUT_CHANNEL}`
            );
        }
        // open context selection webview
        vscode.commands.executeCommand('cmsis-csolution.manageSolution');
    }

    protected handleLoadStateChange(statusBarItem: vscode.StatusBarItem, event: SolutionLoadStateChangeEvent): void {
        if (event.newState.solutionPath) {
            statusBarItem.show();
        } else {
            statusBarItem.hide();
        }
    }

    protected updateContext(contextItem: vscode.StatusBarItem): void {
        if (this.cbuildSetupStatus !== ECbuildSetupStatus.Idle) {
            const csolution = this.solutionManager.getCsolution();
            const activeTargetType = csolution?.getActiveTargetSetName() ?? csolution?.getActiveTargetType();
            if (activeTargetType) {
                contextItem.text = `${this.statusBarItemIcon} ${activeTargetType}`;
                contextItem.show();
                contextItem.tooltip = this.contextSetToolTip();
            } else {
                contextItem.text = '$(error) [Solution invalid]';
                contextItem.show();
                contextItem.tooltip = 'Solution does not have active target-set!';
            }
        }
    }

    protected contextSetToolTip(): vscode.MarkdownString {
        const csolution = this.solutionManager.getCsolution();
        if (!csolution) {
            return new vscode.MarkdownString('No solution loaded');
        }
        const workspaceFolder = this.solutionManager.workspaceFolder?.fsPath ?? csolution.solutionDir;
        const solutionDir = backToForwardSlashes(path.relative(workspaceFolder, csolution.solutionDir));
        const contexts = csolution?.getContextDescriptors();
        const tooltips = contexts?.map(this.contextToolTip.bind(this)) ?? [];
        return new vscode.MarkdownString(`**${solutionDir}${solutionDir ? '/' : ''}${csolution.solutionName}**\n${tooltips.join('\n')}`);
    }

    protected contextToolTip(context: ContextDescriptor): string {
        const messages = this.cmsisToolboxManager.getSetupMessages(context.displayName)?.map(m => `   - ${m}`) ?? [];
        const build = context.buildType ? `.${context.buildType}` : '';
        return ` - ${context.projectName}${build}\n${messages.join('\n')}\n`;
    }

    protected updateIconStatus(statusBarItem: vscode.StatusBarItem, start: boolean, packs?: boolean): void {
        // Animation from: https://code.visualstudio.com/api/references/icons-in-labels
        this.statusBarItemIcon = start ? '$(sync~spin)' : '$(target)';
        if (packs) {
            statusBarItem.text = `${this.statusBarItemIcon} Downloading Packs...`;
            statusBarItem.show();
        } else {
            this.updateContext(statusBarItem);
        }
    }

    protected retrieveCbuildSetupStatus(severity: Severity, detection: boolean): void {
        this.cmsisToolboxManager.collectSetupMessages(this.solutionManager.getCsolution()?.cbuildIdxYmlRoot);
        this.cbuildSetupStatus = detection ? ECbuildSetupStatus.Detection :
            severity == 'error' ? ECbuildSetupStatus.Error :
                severity == 'warning' ? ECbuildSetupStatus.Warning : ECbuildSetupStatus.Success;
    }

    protected updateCbuildSetupStatus(statusBarItem: vscode.StatusBarItem, severity: Severity, detection: boolean) {
        this.retrieveCbuildSetupStatus(severity, detection);
        // Color references from: https://code.visualstudio.com/api/references/theme-color#status-bar-colors
        const color = this.cbuildSetupStatus === ECbuildSetupStatus.Error ? 'statusBarItem.errorBackground' :
            this.cbuildSetupStatus === ECbuildSetupStatus.Warning ? 'statusBarItem.warningBackground' : 'statusBarItem.background';
        statusBarItem.backgroundColor = this.themeProvider.getThemeColor(color);
        this.updateContext(statusBarItem);
    }
}
