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

jest.mock('vscode');

import path from 'path';
import * as vscode from 'vscode';
import { createItemCommand, solutionOutlineUriScheme, TreeViewProviderImpl } from './treeview-provider';
import { COutlineItem } from './tree-structure/solution-outline-item';
import { OpenCommand } from './commands/open-command';
import { extensionContextFactory } from '../../vscode-api/extension-context.factories';
import { FileChangeHandlers } from '../../vscode-api/file-watcher-provider';

const sourceOpener = (): Pick<OpenCommand, 'resolveSourceFileCommand' | 'isConfigWizardCandidate'> => ({
    resolveSourceFileCommand: jest.fn(async uri => ({ command: 'vscode.open', title: 'Open', arguments: [uri] })),
    isConfigWizardCandidate: jest.fn(() => true),
});

const createProvider = () => new TreeViewProviderImpl<COutlineItem>('cmsis.test', sourceOpener());

describe('createItemCommand', () => {
    beforeAll(() => {
        vscode.Uri.file = (filePath: string) => ({
            fsPath: filePath,
            path: filePath,
            scheme: 'file',
            authority: '',
            query: '',
            fragment: '',
            with: () => null as unknown,
            toString: () => filePath,
            toJSON: () => filePath,
        } as unknown as vscode.Uri);
    });

    it('uses explicit command from item attributes when provided', () => {
        const node = new COutlineItem('file');
        node.setAttribute('command', 'cmsis-csolution.someExplicitCommand');
        node.setAttribute('description', 'Run explicit action');

        const command = createItemCommand(node);

        expect(command).toEqual({
            command: 'cmsis-csolution.someExplicitCommand',
            title: 'Run explicit action',
            arguments: [node],
        });
    });

    it('does not create default command for project and layer nodes', () => {
        const projectNode = new COutlineItem('project');
        const layerNode = new COutlineItem('layer');

        expect(createItemCommand(projectNode)).toBeUndefined();
        expect(createItemCommand(layerNode)).toBeUndefined();
    });

    it('does not create command when resource path is missing', () => {
        const fileNode = new COutlineItem('file');

        expect(createItemCommand(fileNode)).toBeUndefined();
    });

    it('opens markdown with markdown preview', () => {
        const markdownNode = new COutlineItem('file');
        markdownNode.setAttribute('resourcePath', path.join('tmp', 'notes.md'));

        const command = createItemCommand(markdownNode);

        expect(command).toMatchObject({
            command: 'markdown.showPreview',
            title: 'Open Preview',
            arguments: [
                {
                    fsPath: path.join('tmp', 'notes.md'),
                    path: path.join('tmp', 'notes.md'),
                },
            ],
        });
    });

    it('defers non-markdown commands until lazy resolution', () => {
        const sourceNode = new COutlineItem('file');
        sourceNode.setAttribute('resourcePath', path.join('tmp', 'device.h'));

        const command = createItemCommand(sourceNode);

        expect(command).toBeUndefined();
    });
});

describe('TreeViewProviderImpl tooltip rendering', () => {
    it('uses markdown tooltip with theme icons enabled when tooltip text is available', () => {
        const provider = createProvider();
        const node = new COutlineItem('file');
        node.setAttribute('label', 'node');
        node.setAttribute('tooltip', 'tooltip with $(link-external)');

        const treeItem = provider.getTreeItem(node);
        const tooltip = treeItem.tooltip as vscode.MarkdownString;

        expect(String(tooltip)).toBe('tooltip with $(link-external)');
        expect(tooltip.supportThemeIcons).toBe(true);
    });

    it('does not set a tooltip when tooltip text is missing', () => {
        const provider = createProvider();
        const node = new COutlineItem('file');
        node.setAttribute('label', 'node');

        const treeItem = provider.getTreeItem(node);

        expect(treeItem.tooltip).toBeUndefined();
    });

    it.each(['group', 'component'])('uses the label instead of the synthetic URI as the %s tooltip', tag => {
        const provider = createProvider();
        const node = new COutlineItem(tag);
        node.setAttribute('label', 'Outline item');

        const treeItem = provider.getTreeItem(node);

        expect(treeItem.tooltip).toBe('Outline item');
        expect(String(treeItem.tooltip)).not.toContain(solutionOutlineUriScheme);
    });
});

describe('TreeViewProviderImpl resource URI', () => {
    it('preserves file URIs for resource-backed items', () => {
        const provider = createProvider();
        const filePath = path.join('tmp', 'device.h');
        const node = new COutlineItem('file');
        node.setAttribute('resourcePath', filePath);

        const treeItem = provider.getTreeItem(node);

        expect(treeItem.resourceUri?.scheme).toBe('file');
        expect(treeItem.resourceUri?.fsPath).toBe(filePath);
    });

    it('assigns unique structural URIs to groups with duplicate labels', () => {
        const provider = createProvider();
        const root = new COutlineItem('root');
        const firstGroup = root.createChild('group');
        const secondGroup = root.createChild('group');
        firstGroup.setAttribute('label', 'Sources');
        secondGroup.setAttribute('label', 'Sources');

        const firstTreeItem = provider.getTreeItem(firstGroup);
        const secondTreeItem = provider.getTreeItem(secondGroup);

        expect(firstTreeItem.resourceUri?.scheme).toBe(solutionOutlineUriScheme);
        expect(firstTreeItem.resourceUri?.path).toBe('/group/0');
        expect(secondTreeItem.resourceUri?.path).toBe('/group/1');
    });

    it('assigns a structural URI without a command to components', () => {
        const provider = createProvider();
        const components = new COutlineItem('components');
        const component = components.createChild('component');
        component.setAttribute('label', 'Device:Startup');

        const treeItem = provider.getTreeItem(component);

        expect(treeItem.resourceUri?.scheme).toBe(solutionOutlineUriScheme);
        expect(treeItem.resourceUri?.path).toBe('/component/0');
        expect(treeItem.command).toBeUndefined();
    });

    it('keeps group and component identity structural when resource paths are present', () => {
        const provider = createProvider();
        const group = new COutlineItem('group');
        group.setAttribute('resourcePath', path.join('tmp', 'group.yml'));

        const treeItem = provider.getTreeItem(group);

        expect(treeItem.resourceUri?.scheme).toBe(solutionOutlineUriScheme);
    });

    it('does not assign a URI to structural container nodes', () => {
        const provider = createProvider();
        const components = new COutlineItem('components');

        const treeItem = provider.getTreeItem(components);

        expect(treeItem.resourceUri).toBeUndefined();
    });
});

describe('lazy source command lifecycle', () => {
    const token = () => ({ isCancellationRequested: false, onCancellationRequested: jest.fn() });
    const file = (filePath = path.join('tmp', 'config.h')) => {
        const node = new COutlineItem('file');
        node.setAttribute('resourcePath', filePath);
        return node;
    };
    let opener: ReturnType<typeof sourceOpener>;
    let watchFiles: jest.Mock;
    let provider: TreeViewProviderImpl<COutlineItem>;

    beforeEach(() => {
        jest.spyOn(vscode.window, 'createTreeView').mockReturnValue({
            onDidCollapseElement: jest.fn(() => ({ dispose: jest.fn() })),
            onDidExpandElement: jest.fn(() => ({ dispose: jest.fn() })),
            dispose: jest.fn(),
        } as unknown as vscode.TreeView<COutlineItem>);
        opener = sourceOpener();
        watchFiles = jest.fn(() => ({ dispose: jest.fn() }));
        provider = new TreeViewProviderImpl('cmsis.test', opener, { watchFiles });
    });

    afterEach(() => {
        provider.dispose();
        jest.restoreAllMocks();
    });

    it('does not scan or watch during tree construction', () => {
        provider.getTreeItem(file());
        provider.refresh();
        provider.getTreeItem(file());
        expect(opener.resolveSourceFileCommand).not.toHaveBeenCalled();
        expect(watchFiles).not.toHaveBeenCalled();
    });

    it.each(['vscode.open', OpenCommand.openSourceSmartCommandId])('deduplicates watchers by URI for %s, including external files', async command => {
        jest.mocked(opener.resolveSourceFileCommand).mockImplementation(async uri => ({ command, title: 'Open', arguments: [uri] }));
        const filename = path.resolve('..', 'external-pack', 'config.h');
        const first = file(filename);
        const second = file(filename);
        const items = [provider.getTreeItem(first), provider.getTreeItem(second)];
        await Promise.all(items.map((item, index) => provider.resolveTreeItem(item, [first, second][index], token())));
        expect(items.map(item => item.command?.command)).toEqual([command, command]);
        expect(watchFiles).toHaveBeenCalledTimes(1);
        expect(vscode.RelativePattern).toHaveBeenLastCalledWith(expect.objectContaining({ fsPath: path.dirname(filename) }), 'config.h');
        await provider.resolveTreeItem(items[0], first, token());
        expect(watchFiles).toHaveBeenCalledTimes(1);
    });

    it.each(['onChange', 'onCreate', 'onDelete'] as const)('invalidates commands and releases watchers on %s', async event => {
        const node = file();
        await provider.resolveTreeItem(provider.getTreeItem(node), node, token());
        const watcher = watchFiles.mock.results[0].value;
        const changed = jest.fn();
        provider.onDidChangeTreeData(changed);
        const handlers: FileChangeHandlers = watchFiles.mock.calls[0][1];
        handlers[event]?.(node.getAttribute('resourcePath')!);
        expect(changed).toHaveBeenCalledWith(undefined);
        expect(watcher.dispose).toHaveBeenCalledTimes(1);
        jest.mocked(opener.resolveSourceFileCommand).mockResolvedValue({ command: OpenCommand.openSourceSmartCommandId, title: 'Open' });
        const item = await provider.resolveTreeItem(provider.getTreeItem(node), node, token());
        expect(item.command?.command).toBe(OpenCommand.openSourceSmartCommandId);
        expect(watchFiles).toHaveBeenCalledTimes(2);
    });

    it('does not watch unsupported extensions', async () => {
        jest.mocked(opener.isConfigWizardCandidate).mockReturnValue(false);
        const text = file('notes.txt');
        await provider.resolveTreeItem(provider.getTreeItem(text), text, token());
        expect(watchFiles).not.toHaveBeenCalled();
    });

    it.each([path.join('tmp', 'config.h'), path.resolve('..', 'external-pack', 'config.h')])('invalidates Wizard routing after annotation removal in %s', async filename => {
        const node = file(filename);
        jest.mocked(opener.resolveSourceFileCommand).mockResolvedValueOnce({ command: OpenCommand.openSourceSmartCommandId, title: 'Open' });
        const wizardItem = await provider.resolveTreeItem(provider.getTreeItem(node), node, token());
        expect(wizardItem.command?.command).toBe(OpenCommand.openSourceSmartCommandId);
        expect(watchFiles).toHaveBeenCalledTimes(1);
        const watcher = watchFiles.mock.results[0].value;
        const changed = jest.fn();
        provider.onDidChangeTreeData(changed);
        const handlers: FileChangeHandlers = watchFiles.mock.calls[0][1];
        handlers.onChange?.(filename);
        expect(changed).toHaveBeenCalledWith(undefined);
        expect(watcher.dispose).toHaveBeenCalledTimes(1);
        const nativeItem = await provider.resolveTreeItem(provider.getTreeItem(node), node, token());
        expect(nativeItem.command?.command).toBe('vscode.open');
        expect(watchFiles).toHaveBeenCalledTimes(2);
    });

    it('escapes glob metacharacters in exact filenames', async () => {
        const node = file(path.join('tmp', 'config[0].h'));
        await provider.resolveTreeItem(provider.getTreeItem(node), node, token());
        expect(vscode.RelativePattern).toHaveBeenLastCalledWith(expect.anything(), 'config[[]0[]].h');
    });

    it('releases active watchers exactly once when disposed', async () => {
        const node = file();
        await provider.resolveTreeItem(provider.getTreeItem(node), node, token());
        const watcher = watchFiles.mock.results[0].value;
        provider.dispose();
        provider.dispose();
        expect(watcher.dispose).toHaveBeenCalledTimes(1);
    });

    it.each(['project', 'layer', 'markdown', 'explicit'])('preserves %s commands during resolution', async kind => {
        const node = file(kind === 'markdown' ? 'notes.md' : 'config.h');
        if (kind === 'project' || kind === 'layer') {
            const project = new COutlineItem(kind);
            project.setAttribute('resourcePath', 'project.yml');
            await provider.resolveTreeItem(provider.getTreeItem(project), project, token());
        } else {
            if (kind === 'explicit') node.setAttribute('command', 'explicit.command');
            const item = provider.getTreeItem(node);
            const command = item.command;
            await provider.resolveTreeItem(item, node, token());
            expect(item.command).toBe(command);
        }
        expect(opener.resolveSourceFileCommand).not.toHaveBeenCalled();
    });

    it.each(['cancel', 'refresh', 'replace', 'solution', 'dispose'])('does not publish or watch an obsolete resolution after %s', async action => {
        let complete!: (command: vscode.Command) => void;
        jest.mocked(opener.resolveSourceFileCommand).mockReturnValueOnce(new Promise(resolve => { complete = resolve; }));
        const node = file();
        const item = provider.getTreeItem(node);
        const cancellation = token();
        const resolving = provider.resolveTreeItem(item, node, cancellation);
        if (action === 'cancel') cancellation.isCancellationRequested = true;
        if (action === 'refresh') provider.refresh();
        if (action === 'replace') provider.getTreeItem(node);
        if (action === 'solution') provider.updateTree(new COutlineItem('root'));
        if (action === 'dispose') provider.dispose();
        complete({ command: 'vscode.open', title: 'Open' });
        expect((await resolving).command).toBeUndefined();
        expect(watchFiles).not.toHaveBeenCalled();
    });

    it('does not resolve already cancelled items', async () => {
        const node = file();
        await provider.resolveTreeItem(provider.getTreeItem(node), node, { ...token(), isCancellationRequested: true });
        expect(opener.resolveSourceFileCommand).not.toHaveBeenCalled();
    });

    it('does not accumulate watchers across refreshes or solution changes', async () => {
        for (let i = 0; i < 3; i++) {
            const node = file();
            await provider.resolveTreeItem(provider.getTreeItem(node), node, token());
            provider.updateTree(new COutlineItem('root'));
        }
        expect(watchFiles).toHaveBeenCalledTimes(3);
        for (const result of watchFiles.mock.results) expect(result.value.dispose).toHaveBeenCalledTimes(1);
    });

    it('subscribes once and disposes group and tree subscriptions', () => {
        const groups = new vscode.EventEmitter<vscode.TabGroupChangeEvent>();
        const subscribe = jest.spyOn(vscode.window.tabGroups, 'onDidChangeTabGroups').mockImplementation(groups.event);
        const changed = jest.fn();
        provider.onDidChangeTreeData(changed);
        const context = extensionContextFactory();
        provider.activate(context);
        provider.activate(context);
        groups.fire({ opened: [], closed: [], changed: [] });
        expect(changed).toHaveBeenCalledTimes(1);
        expect(subscribe).toHaveBeenCalledTimes(1);
        expect(context.subscriptions).toContain(provider);
        provider.dispose();
        const results = jest.mocked(vscode.window.createTreeView).mock.results;
        expect(results[results.length - 1].value.dispose).toHaveBeenCalledTimes(1);
        subscribe.mockRestore();
    });
});
