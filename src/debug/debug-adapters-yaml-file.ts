/**
 * Copyright 2025-2026 Arm Limited
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

import { PathType } from '../views/manage-solution/messages';
import { createInterfaceFactory } from '../generic/interface-factory';
import { ETextFileResult } from '../generic/text-file';
import { ITreeItem, CTreeItem } from '../generic/tree-item';
import { CTreeItemYamlFile, ITreeItemFile } from '../generic/tree-item-file';
import { Optional } from '../generic/type-helper';
import { DEBUG_ADAPTERS_YAML_FILE_PATH } from '../manifest';
import type { PathType } from '../views/manage-solution/types';


export type UIOption<T extends string, V> = {
    name: string;                                   //Label text for the option in the user interface.
    description?: string;                           //Hover over text.
    'yml-node': string;                             //Name of the node in the csolution file under debugger: section.
    type: T;                                        //Type of the option [number, enum, string, file]
    pname?: string;                                 //If present, the option is pname based. Then the same property will be created for each pname instance.
    'path-type'?: PathType;                         //If the type is file, indicates if the path is absolute or relative to the solution file directory. Default is relative.
} & V;

export type UIEnumValue = {
    name: string;                                   //Label text for the enum value in the user interface.
    value: string;                                  //Actual value to be used in the csolution file.
    description?: string;                           //Hover over text.
}

export type UISectionChildren =
    UIOption<'number', {
        range?: [number, number];
        scale?: number;
        default?: number;
    }> |
    UIOption<'enum', {
        values: UIEnumValue[];
        default?: string;
    }> |
    UIOption<'string', {
        default?: string;
    }> |
    UIOption<'file', {
        default?: string;
    }>;

export type UISection = {
    section: string;                    // Label text for the section in the tab group.
    description?: string;               // Hover over text.
    'yml-node'?: string;                // If present, options are under this group node in the debugger: section.
    select?: boolean;                   // If present, the section can be enabled. Applies to all options.
    options: UISectionChildren[];       // List of available options.
    'pname-options'?: boolean;          // Indicates if the option is pname based. Then the same property will be created for each pname instance.
}


export interface DebugAdapter {
    name: string,
    aliasName?: string[],
    template?: string,
    'user-interface'?: UISection[],
}

export interface DebugAdaptersYamlFile extends ITreeItemFile {
    listAdapterNames(): string[];
    readonly debugAdapters: DebugAdapter[];
    getAdapterByName(name?: string): DebugAdapter | undefined;
};

class DebugAdaptersYamlFileImpl extends CTreeItemYamlFile implements DebugAdaptersYamlFile {
    constructor(fileName?: string) {
        super(fileName);
        this.readOnly = true;
    }

    public get debugAdapters(): DebugAdapter[] {
        return this.rootItem
            ?.getGrandChildren('debug-adapters')
            ?.map(DebugAdaptersYamlFileImpl.toAdapter)
            ?.filter(adapter => adapter !== undefined) ?? [];
    }

    public listAdapterNames(): string[] {
        return this.debugAdapters.map(adapter => adapter.name);
    }

    /** Normalize UI specification to long form
     *
     * accepted formats:
     *
     * values: [jtag, swd]          # implicit short form
     * values:                      # explicit short form
     *   - name: jtag
     *   - value: swd
     * values:                      # long form with optional description
     *   - name: JTAG
     *     value: jtag
     *     description: Use JTAG protocol for debugging
     *   - name: SWD
     *     value: swd
     */
    protected static normalizeUserInterface(ui: Optional<UISection[]>): UISection[] {
        ui = (ui ?? []) as UISection[];
        ui.forEach(section => section.options.forEach(option => {
            if (option.type === 'enum' && Array.isArray(option.values)) {
                option.values = option.values.map(v => {
                    if (typeof v === 'string') {
                        return { name: v, value: v };
                    } else {
                        return { name: v.name ?? v.value, value: v.value ?? v.name, description: v.description };
                    }
                });
            }
        }));

        return ui;
    }

    protected static toAdapter(item: ITreeItem<CTreeItem>): Optional<DebugAdapter> {
        const name = item.getChild('name')?.getValueAsString();
        const aliasName = item.getChild('alias-name')?.getValuesAsArray();
        const template = item.getChild('template')?.getValueAsString();
        const ui = DebugAdaptersYamlFileImpl.normalizeUserInterface(item.getChild('user-interface')?.toObject() as Optional<UISection[]>);

        if (name && template) {
            return {
                name,
                aliasName,
                template,
                'user-interface': ui
            };
        }
        return undefined;
    }

    protected static matchAdapterByName(adapter: DebugAdapter, name: string) {
        return adapter.name === name || adapter.aliasName?.includes(name) === true;
    }

    public getAdapterByName(name?: string) {
        if (!name) {
            return undefined;
        }
        const adapterItem = this.debugAdapters
            .find(adapter => DebugAdaptersYamlFileImpl.matchAdapterByName(adapter, name));
        return adapterItem;
    }
};

export const DebugAdaptersYamlFile = createInterfaceFactory<DebugAdaptersYamlFile>(DebugAdaptersYamlFileImpl);


export async function loadDebugAdaptersYml(): Promise<DebugAdaptersYamlFile | undefined> {
    const debugAdaptersYmlFile = new DebugAdaptersYamlFile();
    const result = await debugAdaptersYmlFile.load(DEBUG_ADAPTERS_YAML_FILE_PATH);
    if (result === ETextFileResult.Error || result === ETextFileResult.NotExists) {
        console.error('Failed to load debug-adapters.yml file!', DEBUG_ADAPTERS_YAML_FILE_PATH);
        return undefined;
    }
    return debugAdaptersYmlFile;
}

