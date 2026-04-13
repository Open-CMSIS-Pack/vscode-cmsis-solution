/**
 * Copyright 2025-2026 Arm Limited
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
import { CommandsProvider } from '../../../vscode-api/commands-provider';
import { PACKAGE_NAME } from '../../../manifest';
import { exec, ExecException, execSync } from 'child_process';
import { COutlineItem } from '../tree-structure/solution-outline-item';
import path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { ActiveSolutionTracker } from '../../../solutions/active-solution-tracker';
import { findMergeFiles } from '../tree-structure/solution-outline-utils';

export class MergeCommand {
    public static readonly mergeFile = `${PACKAGE_NAME}.mergeFile`;
    private static readonly disallowedCmdChars = /[\r\n&|<>^%"']/;

    constructor(
        private readonly commandsProvider: CommandsProvider,
        private readonly activeSolutionTracker: ActiveSolutionTracker
    ) { }

    public async activate(context: Pick<vscode.ExtensionContext, 'subscriptions'>) {
        context.subscriptions.push(
            this.commandsProvider.registerCommand(MergeCommand.mergeFile, (node: COutlineItem) => {
                this.runVSCodeMerge(node);
            }, this),
        );
    }

    private async runVSCodeMerge(node: COutlineItem): Promise<void> {
        if (!node) {
            vscode.window.showErrorMessage('File data is not available for merge operation.');
            return;
        }

        const mergeFiles = this.discoverMergeFiles(node);
        if (!mergeFiles) {
            return;
        }

        let { local, update, base } = mergeFiles;

        const codePath = this.getVSCodeExecutablePath();
        if (!codePath) {
            vscode.window.showErrorMessage('Visual Studio Code executable not found. Please ensure it is installed and available in your PATH.');
            return;
        }

        // create merged file path
        let merged = local + '.merged';

        // make a copy of local to create merged file
        fs.copyFileSync(local, merged);
        node.setAttribute('merged', merged);

        // ensure all paths are absolute
        local = path.resolve(local);
        update = path.resolve(update);
        base = path.resolve(base);
        merged = path.resolve(merged);

        // get the modification time of the merged file before merge
        let mergedMTimeBefore = 0;
        if (fs.existsSync(merged)) {
            mergedMTimeBefore = fs.statSync(merged).mtimeMs;
        }

        try {
            const command = this.buildMergeCommand(codePath, local, update, base, merged);
            const exitCode = await this.doOpen3WayMerge(command);

            // get the modification time after merge
            let mergedMTimeAfter = 0;
            if (fs.existsSync(merged)) {
                mergedMTimeAfter = fs.statSync(merged).mtimeMs;
            }

            if (exitCode !== 0) {
                console.warn(`Merge exited with code ${exitCode}. Conflicts may exist.`);
                return;
            }

            if (exitCode === 0 && mergedMTimeAfter > mergedMTimeBefore) {
                this.performPostMergeOperations(local, update, base, merged);
            }

        } catch (err) {
            console.error('Merge operations failed:', err);
            const details = err instanceof Error ? err.message : String(err);
            vscode.window.showErrorMessage(`Merge operation failed: ${details}`);
        }
    }

    private discoverMergeFiles(node: COutlineItem): { local: string; update: string; base: string } | undefined {
        const local = node.getAttribute('local');
        if (!local) {
            vscode.window.showErrorMessage('Required local file is missing to perform merge.');
            return undefined;
        }

        const discovered = findMergeFiles(local);
        const update = discovered.update;
        if (!update) {
            vscode.window.showErrorMessage('Required update file is missing to perform merge.');
            return undefined;
        }

        const base = discovered.base;
        if (!base) {
            vscode.window.showErrorMessage('Required base file is missing to perform merge.');
            return undefined;
        }

        return { local, update, base };
    }

    private performPostMergeOperations(local: string, update: string, base: string, merged: string): void {
        // create .bak file of local file
        const backupPath = `${local}.bak`;
        fs.copyFileSync(local, backupPath);

        // delete local file
        if (fs.existsSync(local)) {
            fs.unlinkSync(local);
        }

        // delete base file
        if (fs.existsSync(base)) {
            fs.unlinkSync(base);
        }

        // rename update file to base file
        const newBaseFileName = path.basename(update).replaceAll('update', 'base');
        const baseDirPath = path.dirname(update);
        const newBase = path.join(baseDirPath, newBaseFileName);
        fs.renameSync(update, newBase);

        // rename merged file to local file
        fs.renameSync(merged, local);

        // refresh tree view to update file status
        this.activeSolutionTracker.triggerReload();
    }

    private getVSCodeExecutablePath(): string | undefined {
        const platform = os.platform();

        if (platform === 'win32') {
            // Typical locations for code.cmd on Windows
            const possiblePaths = [
                path.join(process.env['APPDATA'] || '', 'Code', 'bin', 'code.cmd'),
                path.join(process.env['LOCALAPPDATA'] || '', 'Programs', 'Microsoft VS Code', 'bin', 'code.cmd'),
                path.join('C:', 'Program Files', 'Microsoft VS Code', 'bin', 'code.cmd'),
                path.join('C:', 'Program Files (x86)', 'Microsoft VS Code', 'bin', 'code.cmd'),
            ];

            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    return p;
                }
            }
        } else {
            // Linux or macOS: look for 'code' binary
            const possiblePaths = [
                '/usr/bin/code',
                '/usr/local/bin/code',
                '/snap/bin/code',
                '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code', // macOS
            ];

            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    return p;
                }
            }

            // fallback to using 'which code'
            try {
                const resolved = execSync('which code', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
                if (resolved && fs.existsSync(resolved)) return resolved;
            } catch (err) {
                vscode.window.showWarningMessage(`Could not resolve 'code' binary via 'which': ${err instanceof Error ? err.message : String(err)}`);
                return undefined;
            }
        }
        return undefined;
    }

    private buildMergeCommand(
        codePath: string,
        local: string,
        update: string,
        base: string,
        merged: string,
    ): string {
        const safeCodePath = this.assertMergeFilePath(codePath, 'VS Code CLI path');
        const safeLocal = this.assertMergeFilePath(local, 'local file');
        const safeUpdate = this.assertMergeFilePath(update, 'update file');
        const safeBase = this.assertMergeFilePath(base, 'base file');
        const safeMerged = this.assertMergeFilePath(merged, 'merged file');

        return `"${safeCodePath}" --wait --merge "${safeLocal}" "${safeUpdate}" "${safeBase}" "${safeMerged}"`;
    }

    private assertMergeFilePath(filePath: string, label: string): string {
        if (!path.isAbsolute(filePath)) {
            throw new Error(`Invalid ${label}: path must be absolute.`);
        }

        if (MergeCommand.disallowedCmdChars.test(filePath)) {
            throw new Error(`Invalid ${label}: contains unsupported shell-sensitive characters.`);
        }

        return filePath;
    }

    private doOpen3WayMerge(command: string): Promise<number> {
        return new Promise((resolve, reject) => {
            exec(command, { windowsHide: true }, (error: ExecException | null) => {
                if (error) {
                    console.error(`Error executing command: ${command}`, error);

                    if (typeof error.code === 'number') {
                        resolve(error.code);
                    } else {
                        reject(new Error(`Command failed and exit code is not available: ${error.message}`));
                    }
                } else {
                    resolve(0);
                }
            });
        });
    }
}
