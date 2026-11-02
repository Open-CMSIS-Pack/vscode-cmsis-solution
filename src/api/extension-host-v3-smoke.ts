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
import { ETextFileResult, JsonFile, YamlFile } from '@open-cmsis-pack/cmsis-common';
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
        assert.ok(!('getDebuggers' in exports.getApi(2)));
        assert.ok(!('getToolchains' in exports.getApi(2)));
        const selected = await vscode.commands.executeCommand('cmsis-csolution.getSolutionFile');
        const catalog = new YamlFile(
            path.join(extension.extensionPath, 'templates', 'debug', 'debug-adapters.yml'),
        );
        assert.equal(await catalog.load(), ETextFileResult.Success);
        const adapters = catalog.content as { 'debug-adapters': { name: string }[] };
        const debuggerNames = adapters['debug-adapters'].map(adapter => adapter.name);
        assert.ok(debuggerNames.length > 0);
        assert.deepEqual(await api.getDebuggers(), debuggerNames);
        const changedNames = await api.getDebuggers();
        changedNames.push('Not a registered debugger');
        assert.deepEqual(await api.getDebuggers(), debuggerNames);
        const registrationVariable = 'SMOKE_TOOLCHAIN_1_2_3';
        const registeredPath = path.join(folders[0], 'compiler with spaces', 'bin');
        await configuration.update('environmentVariables', {
            WINDOW_VALUE: 'current', [registrationVariable]: registeredPath,
        }, vscode.ConfigurationTarget.Workspace);
        const expectedToolchain = { name: 'SMOKE', version: '1.2.3', path: registeredPath, registrationVariable };
        const toolchains = await api.getToolchains();
        assert.deepEqual(toolchains.find(toolchain => toolchain.registrationVariable === registrationVariable), expectedToolchain);
        assert.deepEqual(JSON.parse(JSON.stringify(toolchains)), toolchains);
        assert.deepEqual(await api.getToolchains(), toolchains);
        for (const toolchain of toolchains) {
            assert.deepEqual(Object.keys(toolchain).sort(), ['name', 'path', 'registrationVariable', 'version']);
            assert.ok(Object.values(toolchain).every(value => typeof value === 'string' && value.length > 0));
        }
        toolchains.find(toolchain => toolchain.registrationVariable === registrationVariable)!.path = 'changed';
        assert.deepEqual((await api.getToolchains()).find(toolchain => toolchain.registrationVariable === registrationVariable), expectedToolchain);
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
        const updatedPath = path.join(folders[1], 'compiler', 'bin');
        await configuration.update('environmentVariables', {
            WINDOW_VALUE: 'current', [registrationVariable]: updatedPath,
        }, vscode.ConfigurationTarget.Workspace);
        assert.deepEqual((await api.getToolchains()).find(toolchain => toolchain.registrationVariable === registrationVariable), {
            ...expectedToolchain, path: updatedPath,
        });
        assert.equal(await vscode.commands.executeCommand('cmsis-csolution.getSolutionFile'), selected);
        console.log('API V3 tools: exact debugger names, live toolchain registrations, multi-root window environment, no solution, repeatability, V2 compatibility and no generated files passed.');
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
            'Fixture requires installed ARM::CMSIS and ARM::Cortex_DFP packs.');
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

async function runPackInstall(): Promise<void> {
    assert.equal(vscode.workspace.workspaceFolders?.length ?? 0, 0, 'Run this test in an empty VS Code window.');
    const extension = vscode.extensions.getExtension<CsolutionExtension>('Arm.cmsis-csolution');
    assert.ok(extension);
    const exports = await extension.activate();
    const api = exports.getApi(3);
    try {
        assert.ok(!('installPacks' in exports.getApi(2)));
        const selected = await vscode.commands.executeCommand('cmsis-csolution.getSolutionFile');
        assert.deepEqual(await api.installPacks({ packs: [], approved: false }), []);
        await assert.rejects(api.installPacks({ packs: 'ARM::CMSIS@6.0.0' as unknown as string[], approved: true }), {
            name: 'Error',
            message: 'Pack IDs must be an array of strings',
        });
        await assert.rejects(api.installPacks({ packs: [undefined as unknown as string], approved: true }), /array of strings/);
        const packs = ['ARM::CMSIS@6.0.0', 'ARM::Cortex_DFP@1.2.0'];
        assert.deepEqual(await api.installPacks({ packs, approved: false }),
            packs.map(pack => ({ pack, status: 'cancelled' })));
        console.log(`API V3 install: installing pre-approved packs ${packs.join(', ')}.`);
        const results = await api.installPacks({ packs, approved: true });
        assert.deepEqual(results.map(result => result.pack), packs, 'Return one result per pack in input order.');
        for (const result of results) {
            assert.equal(result.status, 'installed', `${result.pack}: ${result.error ?? result.status}`);
            assert.equal(result.error, undefined);
            assert.ok(result.path, `${result.pack}: installation must return a path.`);
            const [vendor, name, version] = result.pack.split(/::|@/);
            assert.equal(path.basename(result.path), version, `${result.pack}: installed version must match.`);
            const pdsc = path.join(result.path, `${vendor}.${name}.pdsc`);
            assert.ok((await fs.stat(pdsc)).isFile(), `${result.pack}: expected installed PDSC at ${pdsc}.`);
        }
        assert.equal(await vscode.commands.executeCommand('cmsis-csolution.getSolutionFile'), selected);
        console.log('API V3 install: two real packs, installed files, empty batch, invalid input, V2 compatibility and unchanged selection passed.');
    } finally {
        api.dispose();
    }
}

const solutionGetters = [
    'getSolutionFile', 'getActiveTarget', 'getDeviceName', 'getBoardName',
    'getDfpName', 'getBspName', 'getDfpPath', 'getBspPath', 'getPackRootPath', 'getCbuildRunFile',
] as const;

function checkSolutionApi(exports: CsolutionExtension, api: CsolutionApiV3): void {
    const v2 = exports.getApi(2);
    for (const method of [...solutionGetters, 'getTargets', 'setActiveTarget', 'activateSolution', 'deactivateSolution'] as const) {
        assert.equal(typeof api[method], 'function', `V3 must expose ${method}.`);
        assert.ok(!(method in v2), `V2 must not expose ${method}.`);
    }
}

async function runEmptySolutionGetters(): Promise<void> {
    assert.equal(vscode.workspace.workspaceFolders?.length ?? 0, 0, 'Run in an empty window.');
    const extension = vscode.extensions.getExtension<CsolutionExtension>('Arm.cmsis-csolution');
    assert.ok(extension);
    const exports = await extension.activate();
    const api = exports.getApi(3);
    const configuration = vscode.workspace.getConfiguration('cmsis-csolution');
    const previousVariables = configuration.inspect<Record<string, string>>('environmentVariables')?.workspaceValue;
    try {
        checkSolutionApi(exports, api);
        await api.deactivateSolution();
        assert.equal(await api.getSolutionFile(), undefined);
        for (const method of solutionGetters.filter(method => method !== 'getSolutionFile' && method !== 'getPackRootPath')) {
            const expected = method === 'getDfpPath' || method === 'getBspPath' ? '<not found>' : '';
            assert.equal(await api[method](), expected, `${method} without a solution`);
        }
        assert.deepEqual(await api.getTargets(), []);
        await assert.rejects(api.setActiveTarget('CM3'), /requires a loaded solution/);
        const originalRoot = await api.getPackRootPath();
        assert.ok(path.isAbsolute(originalRoot));
        for (const name of ['pack-root-one', 'pack-root-two']) {
            const root = path.join(path.dirname(vscode.workspace.workspaceFile!.fsPath), name);
            await configuration.update('environmentVariables', { ...previousVariables, CMSIS_PACK_ROOT: root },
                vscode.ConfigurationTarget.Workspace);
            assert.equal(await api.getPackRootPath(), root, 'Pack root must use the current extension-supplied environment.');
        }
        await configuration.update('environmentVariables', previousVariables, vscode.ConfigurationTarget.Workspace);
        assert.equal(await api.getPackRootPath(), originalRoot);
        assert.equal(await api.getSolutionFile(), undefined);
        console.log('API V3 solution getters: empty-window defaults, dynamic pack-root environment, setter rejection and V2 isolation passed.');
    } finally {
        try {
            await configuration.update('environmentVariables', previousVariables, vscode.ConfigurationTarget.Workspace);
        } finally {
            api.dispose();
        }
    }
}

async function runTargetSelection(): Promise<void> {
    assert.equal(vscode.workspace.workspaceFolders?.length, 1, 'Open the disposable selection fixture.');
    const folder = vscode.workspace.workspaceFolders![0].uri;
    const solution = vscode.Uri.joinPath(folder, 'Selection.csolution.yml');
    const project = vscode.Uri.joinPath(folder, 'Components.cproject.yml');
    const originals = await Promise.all([solution, project].map(uri => vscode.workspace.fs.readFile(uri)));
    const configuration = vscode.workspace.getConfiguration('cmsis-csolution', folder);
    assert.equal(configuration.get('downloadPacks'), false);
    assert.equal(configuration.get('useWebServices'), false);
    const extension = vscode.extensions.getExtension<CsolutionExtension>('Arm.cmsis-csolution');
    assert.ok(extension);
    const exports = await extension.activate();
    const api = exports.getApi(3);
    let originalSelection: string | undefined;
    try {
        checkSolutionApi(exports, api);
        await api.activateSolution(solution.fsPath);
        assert.equal(await api.getSolutionFile(), solution.fsPath, 'Activation must select the solution before resolving.');
        await api.activateSolution(solution.fsPath);
        assert.equal(await api.getSolutionFile(), solution.fsPath, 'Repeated activation must preserve the selection.');
        const deadline = Date.now() + 60000;
        // Activation converts asynchronously; wait for observable generated hardware data, not just selection.
        while (await api.getDeviceName() !== 'ARMCM3' || !await api.getCbuildRunFile()) {
            assert.ok(Date.now() < deadline, 'Fixture conversion must provide ARMCM3 hardware data and a cbuild-run file. Check installed ARM::CMSIS and ARM::Cortex_DFP packs/tooling.');
            await new Promise(resolve => setTimeout(resolve, 250));
        }
        originalSelection = await api.getActiveTarget();
        assert.equal(originalSelection, 'CM3');
        const targets = ['CM3', 'CM3@Smoke'];
        assert.deepEqual(await api.getTargets(), targets);
        assert.equal(await api.getActiveTarget(), originalSelection, 'Enumeration must not change selection.');
        assert.equal(await api.getSolutionFile(), solution.fsPath);
        assert.equal(await api.getBoardName(), '');
        assert.equal(await api.getBspName(), '');
        assert.equal(await api.getBspPath(), '<not found>');
        const dfp = await api.getDfpName();
        assert.match(dfp, /^ARM::Cortex_DFP@\d/);
        const dfpPath = await api.getDfpPath();
        assert.equal(path.normalize(dfpPath), path.join(await api.getPackRootPath(), 'ARM', 'Cortex_DFP', dfp.split('@')[1]));
        assert.ok((await fs.stat(path.join(dfpPath, 'ARM.Cortex_DFP.pdsc'))).isFile());
        const cbuildRun = await api.getCbuildRunFile();
        assert.ok(path.normalize(cbuildRun).startsWith(path.normalize(folder.fsPath) + path.sep));
        assert.match(cbuildRun, /\.cbuild-run\.yml$/);
        assert.ok((await fs.stat(cbuildRun)).isFile());
        for (const method of solutionGetters) {
            const command = method === 'getActiveTarget' ? 'getActiveTargetSet' : method;
            assert.equal(await api[method](), await vscode.commands.executeCommand(`cmsis-csolution.${command}`),
                `${method} must match the registered command.`);
        }
        for (const [selection, index] of [['CM3@Smoke', 1], ['CM3@Smoke', 1], ['CM3', 0]] as const) {
            await api.setActiveTarget(selection);
            assert.equal(await api.getActiveTarget(), selection, 'Setter must refresh selection before resolving.');
            const settings = new JsonFile(path.join(folder.fsPath, '.vscode', 'cmsis.json'));
            assert.notEqual(await settings.load(), ETextFileResult.Error);
            assert.deepEqual(settings.errors, []);
            const content = settings.content as {
                activeTarget: string;
                targetSet: { Selection: { activeTargetType: string; CM3: number } };
            };
            assert.equal(content.activeTarget, selection);
            assert.equal(content.targetSet.Selection.activeTargetType, 'CM3');
            assert.equal(content.targetSet.Selection.CM3, index);
            await vscode.commands.executeCommand('cmsis-csolution.refresh');
            assert.equal(await api.getActiveTarget(), selection, 'Selection must survive a fresh settings reload.');
            assert.deepEqual(await api.getTargets(), targets, 'Available targets must not depend on selection.');
        }
        const settingsUri = vscode.Uri.joinPath(folder, '.vscode', 'cmsis.json');
        const settingsBefore = await vscode.workspace.fs.readFile(settingsUri);
        for (const invalid of ['', 'CM3@', 'CM3@Smoke@extra', 'CM3@Unknown', 'Unknown']) {
            await assert.rejects(api.setActiveTarget(invalid), /non-empty string|Invalid target set|Unknown target set/);
            assert.equal(await api.getActiveTarget(), 'CM3');
        }
        assert.deepEqual(await vscode.workspace.fs.readFile(settingsUri), settingsBefore, 'Rejected selections must not change settings.');
        assert.deepEqual(await Promise.all([solution, project].map(uri => vscode.workspace.fs.readFile(uri))), originals,
            'Getters and selection must not rewrite solution/project inputs.');
        assert.equal(await api.getSolutionFile(), solution.fsPath);
        await api.deactivateSolution();
        assert.equal(await api.getSolutionFile(), undefined, 'Deactivation must clear selection before resolving.');
        assert.equal(await api.getActiveTarget(), '');
        assert.equal(await api.getDeviceName(), '');
        assert.equal(await api.getCbuildRunFile(), '');
        assert.deepEqual(await api.getTargets(), []);
        await assert.rejects(api.setActiveTarget('CM3'), /requires a loaded solution/);
        await api.deactivateSolution();
        assert.equal(await api.getSolutionFile(), undefined, 'Repeated deactivation must leave selection cleared.');
        await api.activateSolution(solution.fsPath);
        assert.equal(await api.getSolutionFile(), solution.fsPath, 'Activation must restore the cleared selection.');
        const reactivationDeadline = Date.now() + 60000;
        while (await api.getDeviceName() !== 'ARMCM3' || await api.getActiveTarget() !== 'CM3') {
            assert.ok(Date.now() < reactivationDeadline, 'Reactivated fixture must load its hardware data and persisted target selection.');
            await new Promise(resolve => setTimeout(resolve, 250));
        }
        await api.deactivateSolution();
        assert.equal(await api.getSolutionFile(), undefined);
        console.log('API V3 solution getters and selection: API activation/deactivation, repeated lifecycle calls, target enumeration, hardware data, paths, command parity, named/default persistence, refresh, repeat selection, invalid input and unchanged sources passed.');
    } finally {
        try {
            if (originalSelection && await api.getSolutionFile() === solution.fsPath
                && await api.getActiveTarget() !== originalSelection) {
                await api.setActiveTarget(originalSelection);
            }
        } finally {
            api.dispose();
        }
    }
}

async function runConvertSolution(): Promise<void> {
    assert.equal(vscode.workspace.workspaceFolders?.length, 1, 'Open the disposable conversion fixture.');
    const folder = vscode.workspace.workspaceFolders![0].uri;
    const solution = vscode.Uri.joinPath(folder, 'Selection.csolution.yml');
    const project = vscode.Uri.joinPath(folder, 'Components.cproject.yml');
    const originals = await Promise.all([solution, project].map(uri => vscode.workspace.fs.readFile(uri)));
    const configuration = vscode.workspace.getConfiguration('cmsis-csolution', folder);
    assert.equal(configuration.get('downloadPacks'), false);
    assert.equal(configuration.get('useWebServices'), false);
    assert.equal(configuration.get('autoConvertOnFileChange'), false);
    const extension = vscode.extensions.getExtension<CsolutionExtension>('Arm.cmsis-csolution');
    assert.ok(extension);
    const exports = await extension.activate();
    const api = exports.getApi(3);
    try {
        assert.equal(typeof api.convertSolution, 'function');
        assert.ok(!('convertSolution' in exports.getApi(2)));
        await api.deactivateSolution();
        await assert.rejects(api.convertSolution(), /requires a loaded solution/);
        await api.activateSolution(solution.fsPath);
        const deadline = Date.now() + 60000;
        while ((await api.getTargets()).length === 0) {
            assert.ok(Date.now() < deadline, 'Conversion fixture must finish loading.');
            await new Promise(resolve => setTimeout(resolve, 250));
        }
        assert.equal(await api.getActiveTarget(), 'CM3');
        for (const options of [undefined, { updateRte: true }] as const) {
            const result = await api.convertSolution(options);
            console.log(`API V3 convert ${options ? 'updateRte=true' : 'defaults'} result:`, JSON.stringify(result));
            assert.deepEqual(Object.keys(result).sort(), ['detection', 'logMessages', 'severity', 'success', 'toolsOutputMessages']);
            assert.equal(result.success, true, 'Fixture conversion must succeed. Check installed ARM::CMSIS and ARM::Cortex_DFP packs/tooling.');
            assert.ok(['success', 'warning', 'info'].includes(result.severity), `Unexpected severity: ${result.severity}`);
            assert.equal(result.detection, false, 'The fixture must not require interactive configuration.');
            assert.equal(result.logMessages.success, true);
            assert.deepEqual(result.logMessages.errors, []);
            assert.ok(Array.isArray(result.logMessages.warnings));
            assert.ok(result.logMessages.warnings.every(message => typeof message === 'string'));
            assert.ok(Array.isArray(result.logMessages.info));
            assert.ok(result.logMessages.info.every(message => typeof message === 'string'));
            assert.deepEqual(result.toolsOutputMessages, []);
            assert.deepEqual(JSON.parse(JSON.stringify(result)), result);
            assert.ok((await fs.stat(path.join(folder.fsPath, 'Selection.cbuild-idx.yml'))).isFile());
            assert.ok((await fs.stat(path.join(folder.fsPath, 'out', 'Components', 'CM3', 'Debug', 'Components.Debug+CM3.cbuild.yml'))).isFile());
            assert.equal(await api.getSolutionFile(), solution.fsPath);
            assert.equal(await api.getActiveTarget(), 'CM3');
        }
        assert.deepEqual(await Promise.all([solution, project].map(uri => vscode.workspace.fs.readFile(uri))), originals,
            'Conversion must not rewrite solution/project inputs.');
        await api.deactivateSolution();
        assert.equal(await api.getSolutionFile(), undefined);
        await assert.rejects(api.convertSolution({ updateRte: true }), /requires a loaded solution/);
        console.log('API V3 convert: real default/updateRte conversions, completion payload, serialization, generated artifacts, unchanged inputs/selection, unloaded rejection and V2 isolation passed.');
    } finally {
        try {
            await api.deactivateSolution();
        } finally {
            api.dispose();
        }
    }
}

export async function run(): Promise<void> {
    const mode = process.env.CMSIS_V3_SMOKE_MODE;
    if (mode === 'getters') {
        await runEmptySolutionGetters();
    } else if (mode === 'selection') {
        await runTargetSelection();
    } else if (mode === 'convert') {
        await runConvertSolution();
    } else if (mode === 'loaded' || mode === 'missing') {
        await runLoadedPacks(mode === 'missing');
    } else if (mode === 'index' || mode === 'installed') {
        await runPackCatalog(mode);
    } else if (mode === 'install') {
        await runPackInstall();
    } else if (mode === undefined || mode === 'tools') {
        await runToolsEnvironment();
    } else {
        throw new Error(`Unknown API V3 smoke mode: ${mode}`);
    }
}
