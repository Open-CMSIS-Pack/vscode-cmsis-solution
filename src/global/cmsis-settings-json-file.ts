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

import * as fs from 'fs';
import * as path from 'path';
import * as vscodeUtils from '../utils/vscode-utils';
import { JsonFile } from '../generic/json-file';
import { merge } from 'lodash';
import { backToForwardSlashes, getFileNameNoExt } from '../utils/path-utils';
import { stripTwoExtensions } from '../utils/string-utils';

export type SettingsValueType = boolean | string | number | undefined | object | null;

export type ContextSelectionSettings = {
    [key: string]: SettingsValueType | ContextSelectionSettings;
};


export class CmsisSettingsJsonFile extends JsonFile {
    constructor(filename: string = 'cmsis.json') {
        super(filename);
        if (!path.isAbsolute(filename)) {
            const workspaceFolder = vscodeUtils.getWorkspaceFolder();
            if (workspaceFolder) {
                const vscodeDir = path.join(workspaceFolder, '.vscode');
                this.fileName = path.join(vscodeDir, filename);
            }
        }
    }

    get solutionName() {
        return getFileNameNoExt(this.solutionPath);
    }

    get solutionDisplayName() {
        const workspaceFolder = vscodeUtils.getWorkspaceFolder();
        return backToForwardSlashes(stripTwoExtensions(path.relative(workspaceFolder, this.solutionPath)));
    }

    public solutionPath: string = '';

    get targetSetMap(): Record<string, string | number> | undefined {
        return this.get(`targetSet.${this.solutionDisplayName}`) as Record<string, string | number>;
    }

    public set activeTargetTypeName(type: string) {
        this.set(`targetSet.${this.solutionDisplayName}.activeTargetType`, type);
    }

    public get activeTargetTypeName(): string | undefined {
        return this.get<string>(`targetSet.${this.solutionDisplayName}.activeTargetType`);
    }

    public getSelectedSet(targetType: string): number {
        const tsMap = this.targetSetMap;
        if (tsMap) {
            return (tsMap[targetType] as number !== undefined)
                ? (tsMap[targetType] as number)
                : -1;
        }
        return -1;
    }

    static getFileName(filename: string, absolutePath?: string): string {
        if (absolutePath) {
            return absolutePath;
        }
        const workspaceFolder = vscodeUtils.getWorkspaceFolder();
        if (workspaceFolder) {
            const vscodeDir = path.join(workspaceFolder, '.vscode');
            fs.mkdirSync(vscodeDir, { recursive: true });
            return path.join(vscodeDir, filename);
        }
        return path.join(process.cwd(), filename);
    }

    /**
     * Gets the settings from memory.
     */
    public getSettings(): ContextSelectionSettings {
        return this.content as ContextSelectionSettings || {};
    }

    /**
     * Sets the settings in memory.
     */
    public setSettings(settings: ContextSelectionSettings): void {
        this.text = JSON.stringify(settings);
        this.contentObject = settings;
    }

    private traverse(key: string, createMissing = false): [ContextSelectionSettings, string] | undefined {
        if (!key) return undefined;
        const keys = key.split('.');
        let result: ContextSelectionSettings = this.contentObject as ContextSelectionSettings || {};
        for (let i = 0; i < keys.length - 1; i++) {
            if (typeof result[keys[i]] !== 'object' || result[keys[i]] == null) {
                if (createMissing) {
                    result[keys[i]] = {};
                    (this.contentObject as ContextSelectionSettings)[keys[i]] = {};
                } else {
                    return undefined;
                }
            }
            result = result[keys[i]] as ContextSelectionSettings;
        }
        return [result, keys[keys.length - 1]];
    }

    /**
     * Gets a value from memory using a dot-delimited key for nested objects.
     */
    public get<T extends SettingsValueType>(key: string): T | undefined;
    public get(key: string): SettingsValueType {
        if (!key) {
            return undefined;
        }

        const keys = key.split('.');
        let result: unknown = this.content;
        for (const k of keys) {
            if (result == null || typeof result !== 'object') {
                return undefined;
            }
            result = (result as ContextSelectionSettings)[k];
        }
        return result as SettingsValueType;
    }

    /**
     * Sets a value in memory using a dot-delimited key for nested objects.
     */
    public set(key: string, value: SettingsValueType): void {
        if (!this.contentObject) this.contentObject = {};

        if (!key) return;
        const obj = key
            .split('.')
            .reverse()
            .reduce((acc, key) => ({ [key]: acc }), value);

        this.contentObject = merge({}, this.contentObject as ContextSelectionSettings, obj as ContextSelectionSettings);
        if (this.isModified()) {
            this.resetDirty();
        } else {
            this.markDirty();
        }
    }

    /**
     * Deletes a value from memory using a dot-delimited key for nested objects.
     */
    public delete(key: string): void {
        const res = this.traverse(key, false);
        if (res) delete res[0][res[1]];
    }

    /**
     * Gets value associated with the key deletes the entry if it was set.
     * @param key string key to check
     * @return key value SettingsValueType if key was set
     */
    public async getAndDelete(key?: string): Promise<SettingsValueType> {
        if (key && this.exists()) {
            await this.load();
            const res = this.get(key);
            if (res !== null) {
                this.delete(key);
                this.save();
                return res;
            }
        }
        return undefined;
    }
}
