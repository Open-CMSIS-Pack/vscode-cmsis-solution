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
import _ from 'lodash';
import { PACKAGE_NAME } from '../manifest';
import { CommandsProvider } from '../vscode-api/commands-provider';
import { SolutionManager } from './solution-manager';
import { ETextFileResult } from '../generic/text-file';
import path from 'path';

export class BinaryFileLocator {
    public static readonly getBinaryFileCommandType = `${PACKAGE_NAME}.getBinaryFile`;
    public static readonly getBinaryFilesCommandType = `${PACKAGE_NAME}.getBinaryFiles`;

    public constructor(
        protected readonly solutionManager: SolutionManager,
        protected readonly commandsProvider: CommandsProvider,
    ) {}

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(
            this.commandsProvider.registerCommand(BinaryFileLocator.getBinaryFileCommandType, this.handleBinaryFileLocator, this),
            this.commandsProvider.registerCommand(BinaryFileLocator.getBinaryFilesCommandType, this.handleBinaryFilesLocator, this),
        );
    }

    public async handleBinaryFileLocator(): Promise<string> {
        const binaryFiles = await this.buildBinaryFiles();
        return _.head(binaryFiles) ?? '';
    }

    public async handleBinaryFilesLocator(): Promise<string> {
        const binaryFiles = await this.buildBinaryFiles();
        return JSON.stringify(binaryFiles);
    }

    protected async buildBinaryFiles(): Promise<string[]> {
        const csolution = this.solutionManager.getCsolution();
        const cbuildRunYml = csolution?.cbuildRunYml;
        if (!csolution || !cbuildRunYml) {
            return [];
        }
        if (await cbuildRunYml.load() !== ETextFileResult.Success) {
            return [];
        }

        const solutionFile = cbuildRunYml.getSolution();
        const workspaceFolder = this.solutionManager.workspaceFolder?.fsPath;
        const solutionFolder = solutionFile ? path.dirname(solutionFile) : workspaceFolder;
        const relativeToSolution = (file: string) => solutionFolder ? path.relative(solutionFolder, file) : file;

        return cbuildRunYml.getImages({ symbols: true }).map((img) => relativeToSolution(img.file));
    }
}
