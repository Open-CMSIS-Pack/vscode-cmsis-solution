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

import { arrayOf, Schema, string, InferType, array, object, unionOf, optional, assureProperty } from '../generic/schema';
import { CTreeItem, ITreeItem } from '../generic/tree-item';
import { CTreeItemJsonFile } from '../generic/tree-item-file';


export const ConfigurationSchema = new Schema({
    name: string,
    type: string,
    request: string,
    cmsis: optional({
        updateConfiguration: optional(string)
    }),
});

export const LaunchJsonSchema = new Schema({
    version: string,
    configurations: arrayOf(unionOf(ConfigurationSchema, object)),
});

export type LaunchJson = InferType<typeof LaunchJsonSchema>;
export type Configuration = InferType<typeof ConfigurationSchema>;

export class LaunchJsonFile extends CTreeItemJsonFile {

    protected getContent() {
        const obj = this.object;
        assureProperty(obj, 'version', string, '0.2.0');
        assureProperty(obj, 'configurations', array, []);
        return LaunchJsonSchema.parse(obj);
    }

    public get configurations() : Configuration[] {
        const content = this.getContent();
        return content.configurations.filter((config: unknown) => ConfigurationSchema.validate(config));
    }

    public set configurations(configurations: Configuration[]) {
        const namesToKeep = configurations.map(cfg => cfg.name);
        this.removeUnlistedConfigurations(namesToKeep);
        for (const config of configurations) {
            this.addConfig(config);
        }
    }

    protected isAutoConfig(config: ITreeItem<CTreeItem>) : boolean {
        return config?.getChild('cmsis')?.getValue('updateConfiguration') === 'auto';
    }

    public override ensureRootItem(): CTreeItem {
        const root = super.ensureRootItem();
        // also ensure version property
        if (!root.getChild('version')) {
            root.createChild('version').setText('0.2.0');
        }
        return root;
    }

    /**
     * Creates 'configurations' element if not exists
     * @returns 'configurations' as CTreeItem
     */
    protected ensureConfigurations() {
        return this.ensureRootItem().createChild('configurations', true);
    }

    /**
     * Add new configuration or replace existing with the same name if 'auto' flag is set
     * @param newConfig configuration to add/replace
     */
    public addConfig(newConfig?: Configuration) {
        if (!newConfig) {
            return;
        }
        const configs = this.ensureConfigurations();
        const existingConfigItem = this.findConfigItem('name', newConfig.name);
        if (!existingConfigItem) {
            configs.createChild('-').fromObject(newConfig);
        } else if (this.isAutoConfig(existingConfigItem)) {
            existingConfigItem.fromObject(newConfig);
        }
    }

    public findConfigItem(key: string, value?: string) {
        const configs = this.rootItem?.getChild('configurations');
        return configs?.getChildByValue(key, value);
    }

    public findFirstAttachConfigName() {
        const config = this.findConfigItem('request','attach');
        return config ? config.getValue('name') : undefined;
    }

    /**
     * Removes configurations not listed in the provided array.
     * Keeps unknown and manual configurations
     * @param namesToKeep Array of configurations names to keep
     */
    public removeUnlistedConfigurations(namesToKeep: string[]) {
        const configsItem = this.rootItem?.getChild('configurations');
        if (!configsItem) {
            return;
        }
        for (const child of configsItem.getChildren().slice()) {
            const configName = child.getValue('name');
            if (!configName || namesToKeep.includes(configName) || !this.isAutoConfig(child)) {
                continue;
            }
            configsItem.removeChild(child);
        }
    }
}
