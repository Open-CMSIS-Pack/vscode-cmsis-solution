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

import { CTreeItem, ETreeItemKind } from '@open-cmsis-pack/cmsis-common/tree-item';
import { CTreeItemYamlFile } from '@open-cmsis-pack/cmsis-common/tree-item-file';
import { DebugAdaptersYamlFile, type DebugAdapter, type UISection } from '../../debug/debug-adapters-yaml-file';
import { DebugAdapterSections } from '../../debug/debug-adapter-sections';
import { effectiveDebugConfiguration, templateDevice, templateProcessors, type DeviceWithTrace } from '../../debug/debug-adapter-templates';
import { DebuggerWrap } from '../../solutions/files/csolution-wrap';
import { AdapterSettingsPresenter } from '../manage-solution/adapter-settings-presenter';
import type { AdapterSnapshot, SettingsActionRequest, SettingsActionResult } from '../manage-solution/settings-contract';
import type { PreviewState } from './messages';

/** Owns detached debugger trees and uses the production model without writing source or solution files. */
export class PreviewSession {
    private adapters: DebugAdapter[] = [];
    private adapter = '';
    private device?: DeviceWithTrace;
    private usedProcessors: string[] = [];
    private generation = 0;
    private readonly presenter = new AdapterSettingsPresenter();
    private readonly configurations = new Map<string, DebuggerWrap>();
    private snapshot?: AdapterSnapshot;
    private error?: string;

    /** Binds action identities to the source document rather than the active editor. */
    constructor(private readonly uri: string) {}

    /** Invalidates actions immediately, including while a debounced buffer parse is pending. */
    public suspend(message: string): void {
        this.generation++;
        this.error = message;
    }

    /** Parses an unsaved buffer using the existing file owner and retains the last valid preview on failure. */
    public update(text: string, trusted: boolean): void {
        this.suspend('Updating preview…');
        try {
            if (!trusted) {
                throw new Error('Trust this workspace to evaluate debug adapter UI expressions.');
            }
            const buffer = new CTreeItemYamlFile();
            buffer.text = text;
            const root = buffer.parse();
            if (buffer.parser?.errors.length) {
                throw new Error(buffer.parser.errors.join('\n'));
            }
            const entries = root?.getGrandChildren('debug-adapters') ?? [];
            if (!entries.length) {
                throw new Error('Expected a debug-adapters sequence containing a named adapter.');
            }
            // A template is irrelevant to UI authoring, but required by the runtime file owner.
            // Supply it only in this detached tree so its normalization can be reused unchanged.
            for (const entry of entries) {
                if (!entry.getValue('name')) {
                    throw new Error('Each debug adapter needs a name.');
                }
                entry.setValue('template', entry.getValue('template') || 'preview');
            }
            const file = new DebugAdaptersYamlFile();
            file.rootItem = root;
            const adapters = file.debugAdapters;
            if (new Set(adapters.map(adapter => adapter.name)).size !== adapters.length) {
                throw new Error('Debug adapter names must be unique.');
            }
            const adapter = adapters.some(candidate => candidate.name === this.adapter) ? this.adapter : adapters[0].name;
            // Compile before committing the new declarations, keeping a failed edit transactional.
            const previous = this.adapters;
            const previousName = this.adapter;
            this.adapters = adapters;
            this.adapter = adapter;
            try {
                this.prepare();
            } catch (error) {
                this.adapters = previous;
                this.adapter = previousName;
                throw error;
            }
            this.error = undefined;
        } catch (error) {
            this.error = error instanceof Error ? error.message : String(error);
        }
    }

    /** Changes the preview definition while retaining each adapter/device's temporary configuration. */
    public selectAdapter(name: string): void {
        if (!this.error && this.adapters.some(adapter => adapter.name === name)) {
            this.adapter = name;
            this.generation++;
            this.prepare();
        }
    }

    /** Injects the complete csolution response, preserving unnamed processor records. */
    public selectDevice(device?: DeviceWithTrace): void {
        this.device = device;
        this.usedProcessors = this.processors;
        this.generation++;
        if (!this.error) {
            this.prepare();
        }
    }

    /** Restricts the effective cores while leaving device.processors intact. */
    public selectProcessors(names: string[]): void {
        if (!this.error && names.length && names.every(name => this.processors.includes(name))) {
            this.usedProcessors = [...new Set(names)];
            this.generation++;
            this.prepare();
        }
    }

    /** Restores defaults for the currently selected adapter/device/processor scenario. */
    public reset(): void {
        if (!this.error) {
            this.configurations.delete(this.key);
            this.generation++;
            this.prepare();
        }
    }

    /** Applies detached settings changes and cancels visual-only file actions without external operations. */
    public act(request: SettingsActionRequest, enabled = true): SettingsActionResult | undefined {
        if (!this.snapshot) {
            return undefined;
        }
        const action = this.presenter.resolve(request);
        let status: SettingsActionResult['status'] = 'rejected';
        if (enabled && !this.error && action) {
            const model = this.model();
            switch (action.kind) {
                case 'edit':
                    model.setParameter(action.root, action.path, action.option!['yml-node'], action.value as string | number, action.option?.pname);
                    status = 'applied';
                    break;
                case 'toggle':
                    model.setEnabled(action.root, action.path, action.value as boolean);
                    status = 'applied';
                    break;
                case 'add':
                    model.add(action.root, action.path);
                    status = 'applied';
                    break;
                case 'remove':
                    model.remove(action.root, action.path);
                    status = 'applied';
                    break;
                case 'browse':
                case 'open':
                    status = 'cancelled';
                    break;
            }
            this.prepare();
        }
        return { requestId: request.requestId, status, snapshot: this.snapshot };
    }

    /** Returns the named cores offered by the selected device. */
    private get processors(): string[] {
        return this.device?.processors?.flatMap(processor => processor.name ? [processor.name] : []) ?? [];
    }

    /** Separates temporary values for independently selectable preview scenarios. */
    private get key(): string {
        return JSON.stringify([this.adapter, this.device?.id ?? '', this.usedProcessors]);
    }

    /** Lazily creates a debugger tree owned exclusively by this session. */
    private get debugger(): DebuggerWrap {
        let debuggerWrap = this.configurations.get(this.key);
        if (!debuggerWrap) {
            debuggerWrap = new DebuggerWrap(new CTreeItem('debugger').setKind(ETreeItemKind.Map));
            debuggerWrap.name = this.adapter;
            this.configurations.set(this.key, debuggerWrap);
        }
        return debuggerWrap;
    }

    /** Projects legacy processor options locally, preserving the existing production controller unchanged. */
    private declarations(): UISection[] {
        /** Clones declarations and expands the legacy processor-option flag at every depth. */
        const expand = (sections: UISection[]): UISection[] => sections.map(section => ({
            ...section,
            options: section['pname-options'] === undefined ? section.options
                : (this.usedProcessors.length ? this.usedProcessors : ['']).flatMap(pname => section.options.map(option => ({ ...option, pname }))),
            subsections: section.subsections ? expand(section.subsections) : undefined,
        }));
        return expand(this.adapters.find(adapter => adapter.name === this.adapter)?.['user-interface'] ?? []);
    }

    /** Creates a production model over the currently selected detached tree. */
    private model(): DebugAdapterSections {
        return new DebugAdapterSections(this.declarations(), () => this.debugger, () => this.debugger, this.device, this.usedProcessors);
    }

    /** Publishes production control visibility with action identities scoped to this preview session. */
    private prepare(): void {
        const snapshot = this.presenter.prepare({
            identity: [this.uri, String(this.generation), this.key],
            adapter: this.adapter,
            adapters: this.adapters.map(adapter => adapter.name),
            processors: this.usedProcessors,
            startProcessor: '',
            autoUpdate: false,
            sections: this.model().sections,
            debugger: this.debugger,
        });
        this.snapshot = snapshot;
    }

    /** Serializes the sandbox and effective expression inputs for inspection in the webview. */
    public state(): Omit<PreviewState, 'devices' | 'loading' | 'deviceError'> {
        const yaml = new CTreeItemYamlFile();
        yaml.ensureRootItem().addChild(this.debugger.item!.clone());
        return {
            adapters: this.adapters.map(adapter => adapter.name),
            adapter: this.adapter,
            device: this.device?.id ?? '',
            processors: this.processors,
            usedProcessors: this.usedProcessors,
            error: this.error,
            snapshot: this.snapshot,
            yaml: yaml.stringify(),
            context: JSON.stringify({
                device: templateDevice(this.device),
                processors: templateProcessors(this.device, this.usedProcessors),
                config: effectiveDebugConfiguration(this.declarations(), this.debugger.object),
            }, null, 2),
        };
    }
}
