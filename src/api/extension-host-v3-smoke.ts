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

import * as assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { YamlFile } from '@open-cmsis-pack/cmsis-common';
import * as vscode from 'vscode';
import type { CsolutionExtension } from '../../api/csolution';

export async function run(): Promise<void> {
    assert.equal(vscode.workspace.workspaceFolders?.length, 2, 'Open two disposable empty folders.');
    const extension = vscode.extensions.getExtension<CsolutionExtension>('Arm.cmsis-csolution');
    assert.ok(extension);
    const exports = await extension.activate();
    const api = exports.getApi(3);
    const folders = vscode.workspace.workspaceFolders!.map(folder => folder.uri.fsPath);
    const configuration = vscode.workspace.getConfiguration('cmsis-csolution');
    const previousVariables = configuration.inspect('environmentVariables')?.workspaceValue;
    const errors: unknown[] = [];
    try {
        assert.ok(!('getToolsEnvironment' in exports.getApi(2)));
        const selected = await vscode.commands.executeCommand('cmsis-csolution.getSolutionFile');
        await configuration.update('environmentVariables', { WINDOW_VALUE: 'current' }, vscode.ConfigurationTarget.Workspace);
        for (const folder of folders) {
            const content = await api.getToolsEnvironment();
            const document = new YamlFile();
            document.text = content;
            const result = document.parse() as { 'cmsis-tools-environment': {
                version: string;
                solution?: string;
                environment: { variables: Record<string, string>; path: string[] };
                tools: { name: string }[];
            } };
            const tools = result['cmsis-tools-environment'];
            assert.equal(tools.version, '1.1.0');
            assert.equal(tools.solution, undefined);
            assert.equal(tools.environment.variables.WINDOW_VALUE, 'current');
            assert.ok(tools.tools.some(tool => tool.name === 'CMSIS-Toolbox'));
            assert.ok(tools.environment.path.length > 0);
            assert.equal(await api.getToolsEnvironment(), content);
            await assert.rejects(fs.stat(path.join(folder, '.cmsis')), { code: 'ENOENT' });
        }
        assert.equal(await vscode.commands.executeCommand('cmsis-csolution.getSolutionFile'), selected);
        console.log('API V3 tools: multi-root window environment, no solution, repeatability, V2 compatibility and no generated files passed.');
    } catch (error) {
        errors.push(error);
    } finally {
        try {
            await configuration.update('environmentVariables', previousVariables, vscode.ConfigurationTarget.Workspace);
        } catch (error) {
            errors.push(error);
        } finally {
            try {
                api.dispose();
            } catch (error) {
                errors.push(error);
            }
        }
    }
    if (errors.length > 0) {
        errors.slice(1).forEach(error => console.error('API V3 smoke cleanup failed:', error));
        throw errors[0];
    }
}
