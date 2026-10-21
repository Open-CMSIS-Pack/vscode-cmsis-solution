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
import type { CsolutionApiV3, CsolutionExtension } from '../../api/csolution';

async function runToolsEnvironment(): Promise<void> {
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

async function runLoadedPacks(missingFixture: boolean): Promise<void> {
    const folders = vscode.workspace.workspaceFolders;
    assert.equal(folders?.length, 1, 'Open a disposable copy of test-data/api-v3-packs.');
    const folder = folders![0].uri;
    const solution = vscode.Uri.joinPath(folder, missingFixture ? 'Missing.csolution.yml' : 'Components.csolution.yml');
    const project = vscode.Uri.joinPath(folder, 'Components.cproject.yml');
    const configuration = vscode.workspace.getConfiguration('cmsis-csolution', folder);
    assert.equal(configuration.get('downloadPacks'), false, 'Fixture must disable pack downloads.');
    assert.equal(configuration.get('useWebServices'), false, 'Fixture must disable web services.');
    const originals = await Promise.all([solution, project].map(uri => vscode.workspace.fs.readFile(uri)));
    const extension = vscode.extensions.getExtension<CsolutionExtension>('Arm.cmsis-csolution');
    assert.ok(extension);
    const exports = await extension.activate();
    const api = exports.getApi(3);
    try {
        await vscode.commands.executeCommand('cmsis-csolution.activateSolution', solution.fsPath);
        const context = 'Components.Debug+CM3';
        const deadline = Date.now() + 30000;
        let usedPacks: CsolutionApiV3.PackQueryResult;
        for (;;) {
            try {
                usedPacks = await api.getPacks({ scope: 'used', context });
                break;
            } catch (error) {
                const loading = error instanceof Error
                    && /requires a loaded solution|a valid solution must be loaded before proceeding/.test(error.message);
                if (!loading || Date.now() >= deadline) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 250));
            }
        }
        const selectedSolution = await vscode.commands.executeCommand('cmsis-csolution.getSolutionFile');
        assert.equal(selectedSolution, solution.fsPath);
        const missingPacks = await api.getPacks({ scope: 'missing', context });
        if (missingFixture) {
            assert.ok(missingPacks.packs.some(pack => pack.pack === 'ApiV3Fixture::DeliberatelyMissing@1.0.0'),
                'RPC must report the deliberately missing requirement.');
        } else {
            assert.deepEqual(missingPacks.packs, []);
        }
        for (const pack of missingPacks.packs) {
            assert.equal(typeof pack.pack, 'string');
            assert.equal(typeof pack.origin, 'string');
            assert.ok(pack.resolvedPack === undefined || typeof pack.resolvedPack === 'string');
            assert.ok(Object.keys(pack).every(key => ['pack', 'origin', 'resolvedPack'].includes(key)));
        }
        assert.deepEqual(JSON.parse(JSON.stringify(missingPacks)), missingPacks);
        assert.deepEqual(await api.getPacks({ scope: 'missing', context }), missingPacks);
        for (const text of ['', 'dElIbErAtElYmIsSiNg', '[.*]', ' DeliberatelyMissing ']) {
            assert.deepEqual(await api.getPacks({ scope: 'missing', context, filter: { text } }), {
                packs: missingPacks.packs.filter(pack => pack.pack?.toLowerCase().includes(text.toLowerCase())),
            });
        }
        assert.deepEqual(await api.getPacks({ scope: 'missing', context }), missingPacks);
        await assert.rejects(api.getPacks({ scope: 'missing', context: 'Missing.Debug+CM3' }), /Unknown pack context/);
        assert.ok(usedPacks.packs.some(pack => pack.id?.startsWith('ARM::CMSIS@')),
            'Fixture requires installed ARM::CMSIS and ARM::CMSIS_DFP packs.');
        for (const pack of usedPacks.packs) {
            assert.equal(typeof pack.id, 'string');
            assert.ok(pack.version && pack.version.length > 0);
            assert.ok(pack.id?.endsWith(`@${pack.version}`));
            assert.ok(pack.installed === undefined || pack.installed === true);
            assert.ok(pack.path === undefined || typeof pack.path === 'string');
            assert.ok(Object.keys(pack).every(key => ['id', 'version', 'installed', 'path', 'description'].includes(key)));
        }
        assert.deepEqual(JSON.parse(JSON.stringify(usedPacks)), usedPacks);
        assert.deepEqual(await api.getPacks({ scope: 'used', context }), usedPacks);
        for (const text of ['', 'cMsIs', '[.*]', ' CMSIS ']) {
            assert.deepEqual(await api.getPacks({ scope: 'used', context, filter: { text } }), {
                packs: usedPacks.packs.filter(pack => pack.id?.toLowerCase().includes(text.toLowerCase())
                    || pack.description?.toLowerCase().includes(text.toLowerCase())),
            });
        }
        assert.deepEqual(await api.getPacks({ scope: 'used', context }), usedPacks);
        await assert.rejects(api.getPacks({ scope: 'used', context: 'Missing.Debug+CM3' }), /Unknown pack context/);
        assert.equal(await vscode.commands.executeCommand('cmsis-csolution.getSolutionFile'), selectedSolution);
        const after = await Promise.all([solution, project].map(uri => vscode.workspace.fs.readFile(uri)));
        assert.deepEqual(after, originals, 'Pack queries must not edit solution/project inputs.');
        assert.equal(vscode.workspace.workspaceFolders?.[0].uri.toString(), folder.toString());
        console.log(`API V3 packs: ${usedPacks.packs.length} used, ${missingPacks.packs.length} missing; filters, serialization, repeatability, invalid context and unchanged inputs passed.`);
    } finally {
        api.dispose();
    }
}

async function runPackCatalog(mode: string): Promise<void> {
    assert.equal(vscode.workspace.workspaceFolders?.length ?? 0, 0, 'Run this test in an empty VS Code window.');
    const extension = vscode.extensions.getExtension<CsolutionExtension>('Arm.cmsis-csolution');
    assert.ok(extension);
    const exports = await extension.activate();
    const api = exports.getApi(3);
    try {
        assert.ok(!('getPacks' in exports.getApi(2)));
        for (const scope of ['used', 'missing'] as const) {
            await assert.rejects(api.getPacks({ scope, context: ' ' }), /explicit context/);
            await assert.rejects(api.getPacks({ scope, context: 'App.Debug+Board' }), /loaded solution/);
        }
        const installed = await api.getPacks({ scope: 'installed' });
        assert.ok(installed.packs.length > 0, 'Pack smoke requires local installed packs.');
        assert.ok(installed.packs.every(pack => pack.installed && pack.id && pack.version));
        assert.deepEqual(await api.getPacks({ scope: 'installed' }), installed);
        if (mode === 'index') {
            const catalog = await api.getPacks();
            assert.ok(installed.packs.every(pack => catalog.packs.some(candidate => candidate.id === pack.id && candidate.installed)));
            assert.ok(catalog.packs.some(pack => pack.installed === false), 'Pack index must contain a non-installed pack.');
            assert.deepEqual(JSON.parse(JSON.stringify(catalog)), catalog);
            console.log(`API V3 index catalog: ${installed.packs.length} installed, ${catalog.packs.length} total before solution loading.`);
        } else {
            console.log(`API V3 installed packs: ${installed.packs.length} installed before solution loading.`);
        }
        assert.equal(await vscode.commands.executeCommand('cmsis-csolution.getSolutionFile'), undefined);
    } finally {
        api.dispose();
    }
}

export async function run(): Promise<void> {
    const mode = process.env.CMSIS_V3_SMOKE_MODE;
    if (mode === 'loaded' || mode === 'missing') {
        await runLoadedPacks(mode === 'missing');
    } else if (mode === 'index' || mode === 'installed') {
        await runPackCatalog(mode);
    } else if (mode === undefined || mode === 'tools') {
        await runToolsEnvironment();
    } else {
        throw new Error(`Unknown API V3 smoke mode: ${mode}`);
    }
}
