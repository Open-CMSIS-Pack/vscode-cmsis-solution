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
import * as path from 'path';
import * as os from 'os';
import { Uri } from 'vscode';
import { CMSIS_SOLUTION_OUTPUT_CHANNEL, PACKAGE_NAME, UV2CSOLUTION_FOLDER, UV2CSOLUTION_PATH_ENV_VAR } from '../../manifest';
import { CommandsProvider } from '../../vscode-api/commands-provider';
import { ProcessManager } from '../../vscode-api/runner/process-manager';
import { OutputChannelProvider } from '../../vscode-api/output-channel-provider';
import { mdkProjectFileExtensions } from './mdk-projects';
import { WorkspaceFoldersProvider } from '../../vscode-api/workspace-folders-provider';
import { openNewSolutionModal } from '../../new-solution-modal';
import { MessageProvider } from '../../vscode-api/message-provider';
import { WorkspaceFsProvider } from '../../vscode-api/workspace-fs-provider';
import { CsolutionGlobalState, GlobalState } from '../../vscode-api/global-state';
import { CreatedSolution } from '../solution-creator';
import { globSync } from 'glob';

export type ParsedConverterOutput = {
    warnings: string[];
    errors: string[];
    csolutionFileUri: Uri | undefined;
}

const isFileAtRootOfWorkspace = (fileUri: vscode.Uri): boolean => {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(fileUri);
    if (workspaceFolder) {
        return workspaceFolder.uri.fsPath === Uri.joinPath(fileUri, '..').fsPath;
    }
    return false;
};

export const parseConverterOutput = (output: string[]): ParsedConverterOutput => {
    let inErrorsSection = false;
    let inWarningsSection = false;

    const errors: string[] = [];
    const warnings: string[] = [];
    let csolutionFileUri: Uri | undefined;

    for (const line of output) {
        const lineStartsWithWhitespace = /^\W/.test(line);

        if (lineStartsWithWhitespace) {
            const sectionArray = inErrorsSection ? errors : inWarningsSection ? warnings : undefined;
            sectionArray?.push(line.trim());
        } else {
            inErrorsSection = false;
            inWarningsSection = false;
        }

        if (line.startsWith('Errors:'))  {
            inErrorsSection = true;
        }

        if (line.startsWith('Warnings:')) {
            inWarningsSection = true;
        }

        const createdSolutionLineMatch = line.match(/Created solution:\s+(.*)/);

        if (createdSolutionLineMatch && createdSolutionLineMatch.length >= 2) {
            csolutionFileUri = Uri.file(createdSolutionLineMatch[1]);
        }
    }

    return { errors, warnings, csolutionFileUri };
};

const conversionStatusFromParsedOutput = (parsedOutput: ParsedConverterOutput, success: boolean): CreatedSolution['conversionStatus'] => {
    if (parsedOutput.errors.length > 0 || !parsedOutput.csolutionFileUri) {
        return 'errors';
    } else if (parsedOutput.warnings.length > 0 || !success) {
        return 'warnings';
    } else {
        return 'none';
    }
};

export interface MdkToCsolutionConverter {
    convert(fileUri: Uri): Promise<CreatedSolution>;
}

export class ConvertMdkToCsolutionCommand implements MdkToCsolutionConverter {
    public static readonly commandType = `${PACKAGE_NAME}.convertMicroVisionToCsolution`;

    constructor(
        private readonly commandsProvider: CommandsProvider,
        private readonly processManager: ProcessManager,
        private readonly outputChannelProvider: OutputChannelProvider,
        private readonly workspaceFoldersProvider: WorkspaceFoldersProvider,
        private readonly messageProvider: MessageProvider,
        private readonly workspaceFsProvider: WorkspaceFsProvider,
        private readonly globalStateProvider: GlobalState<CsolutionGlobalState>,
        private readonly environment = process.env,
    ) {}

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(
            this.commandsProvider.registerCommand(ConvertMdkToCsolutionCommand.commandType, this.handleConvertCommand, this),
        );
    }

    private async checkOverwrite(fileUri: Uri) {
        const solutionUri = fileUri.fsPath.replace(/\.(uvprojx|uvmpw)$/i, '.csolution.{yaml,yml}');
        const csolutionFiles = globSync(solutionUri, { nocase: true });
        if (csolutionFiles.length > 0) {
            const existing = path.basename(csolutionFiles[0]);
            const selected = await vscode.window.showInformationMessage(
                `The solution file '${existing}' already exists in the same directory. Do you want to overwrite it?`,
                'Overwrite',
                'Cancel'
            );

            return (selected === 'Overwrite');
        }
        return true;
    }

    private async handleConvertCommand(fileUri?: Uri) {
        if (fileUri === undefined) {
            fileUri = await this.promptForFile();
            if (fileUri === undefined) {
                return;
            }
        }

        if (!await this.checkOverwrite(fileUri)) {
            return;
        }

        const createdProject = await this.convert(fileUri);

        if (createdProject.conversionStatus !== 'errors') {
            await this.commandsProvider.executeCommandIfRegistered('keil-studio.initialise-project', createdProject.solutionDir);
        }

        const hasOpenWorkspace = !!this.workspaceFoldersProvider.workspaceFolders && this.workspaceFoldersProvider.workspaceFolders.length > 0;

        if (!hasOpenWorkspace || !isFileAtRootOfWorkspace(fileUri)) {
            openNewSolutionModal(
                createdProject,
                { message: this.messageProvider, workspaceFolders: this.workspaceFoldersProvider, commands: this.commandsProvider },
                this.globalStateProvider
            );
        }
    }

    private async promptForFile(): Promise<Uri | undefined> {
        const options: vscode.OpenDialogOptions = {
            canSelectMany: false,
            openLabel: 'Select',
            filters: {
                'uVision files': mdkProjectFileExtensions
            }
        };

        const selectedUris = await vscode.window.showOpenDialog(options);
        return selectedUris && selectedUris.length > 0 ? selectedUris[0] : undefined;
    }

    public async convert(fileUri: Uri): Promise<CreatedSolution> {
        const outputChannel = this.outputChannelProvider.getOrCreate(CMSIS_SOLUTION_OUTPUT_CHANNEL);
        outputChannel?.show(true);
        const binaryPath = this.getBinaryPath();
        outputChannel?.appendLine(`${binaryPath} ${fileUri.fsPath}`);
        const outputLines: string[] = [];
        let success = false;

        try {
            await this.processManager.spawn(this.getBinaryPath(), [fileUri.fsPath], {}, outputLine => {
                outputChannel?.appendLine(outputLine);
                outputLines.push(outputLine);
            });
            success = true;
        } catch {
            success = false;
        }

        const parsedOutput = parseConverterOutput(outputLines);

        await this.writeUv2csolutionLogFile(fileUri, outputLines);

        return {
            vcpkgConfigured: true,
            solutionDir: Uri.joinPath(fileUri, '..'),
            solutionFile: parsedOutput.csolutionFileUri,
            conversionStatus: conversionStatusFromParsedOutput(parsedOutput, success),
            forceRteUpdate: true,
        };
    }

    private getBinaryPath(): string {
        if (this.environment[UV2CSOLUTION_PATH_ENV_VAR]) {
            return this.environment[UV2CSOLUTION_PATH_ENV_VAR];
        }
        const binaryName = `uv2csolution${os.platform() === 'win32' ? '.exe' : ''}`;
        return path.join(UV2CSOLUTION_FOLDER, binaryName);
    }

    private async writeUv2csolutionLogFile(fileUri: Uri, outputLines: string[]) {
        const logFileUri = Uri.joinPath(fileUri, '../uv2csolution.log');

        try {
            await this.workspaceFsProvider.writeUtf8File(logFileUri.fsPath, outputLines.join(os.EOL));
        } catch (error) {
            console.error('Failed to write uv2csolution log file', error);
        }
    }
}
