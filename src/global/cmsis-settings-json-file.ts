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
import * as vscode from 'vscode';
import * as vscodeUtils from '../utils/vscode-utils';
import { JsonFile } from '@open-cmsis-pack/cmsis-common/json-file';
import { merge } from 'lodash';
import { backToForwardSlashes, getFileNameNoExt } from '../utils/path-utils';

export type SettingsValueType = boolean | string | number | undefined | object | null;

export type ContextSelectionSettings = {
    [key: string]: SettingsValueType | ContextSelectionSettings;
};

export type NamedSelection = {
    name: string;
    index: number;
};

export type TargetSetSelection = {
    targetType: NamedSelection;
    targetSet: NamedSelection;
};

type SolutionSelection = {
    selectedTargetType?: string;
    selectedTargetSets?: TargetSetSelection[];
    [key: string]: unknown;
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
        return backToForwardSlashes(path.relative(path.dirname(this.fileName), this.solutionPath));
    }

    public solutionPath: string = '';

    public get activeSolution(): string | null | undefined {
        const activeSolution = this.getSettings().activeSolution;
        if (activeSolution === null) {
            return null;
        }
        return typeof activeSolution === 'string'
            ? path.resolve(path.dirname(this.fileName), activeSolution)
            : undefined;
    }

    public setActiveSolution(solutionPath: string | null): void {
        this.set('activeSolution', solutionPath === null
            ? null
            : backToForwardSlashes(path.relative(path.dirname(this.fileName), solutionPath)));
    }

    public saveActiveSolution(): boolean {
        const activeSolution = this.getSettings().activeSolution;
        return this.savePartialSettings(
            settings => settings.activeSolution = activeSolution,
            error => console.warn(`Failed to persist the active CMSIS solution: ${error}`),
        );
    }

    get targetSetMap(): SolutionSelection | undefined {
        const solutionSelections = this.get<Record<string, SolutionSelection>>('solutionSelections');
        let solutionSelection = solutionSelections?.[this.solutionDisplayName];
        const legacyTargetSets = this.get<Record<string, SolutionSelection>>('targetSet');
        const legacySolutionName = [this.solutionDisplayName, ...this.legacySolutionNames]
            .find(name => legacyTargetSets?.[name]);
        if (!solutionSelection && legacySolutionName && legacyTargetSets) {
            solutionSelection = legacyTargetSets[legacySolutionName];
            this.ensureSolutionSelections()[this.solutionDisplayName] = solutionSelection;
            this.markDirty();
        }
        if (legacyTargetSets && this.deleteLegacySolutionSelections(legacyTargetSets)) {
            if (Object.keys(legacyTargetSets).length === 0) {
                delete this.getSettings().targetSet;
            }
            this.markDirty();
        }
        if (solutionSelection?.activeTargetType !== undefined) {
            solutionSelection.selectedTargetType = solutionSelection.activeTargetType as string;
            delete solutionSelection.activeTargetType;
            this.markDirty();
        }
        return solutionSelection;
    }

    public set activeTargetTypeName(type: string) {
        this.setActiveTargetType(type);
    }

    public get activeTargetTypeName(): string | undefined {
        return this.targetSetMap?.selectedTargetType;
    }

    public getActiveTargetType(targetTypeNames: readonly string[] = []): string | undefined {
        const solutionSelection = this.targetSetMap;
        const persistedTargetType = solutionSelection?.selectedTargetType;
        let renamedActiveTargetType: string | undefined;
        const invalidTargetSetSelections: TargetSetSelection[] = [];

        for (const selectedTargetSet of solutionSelection?.selectedTargetSets ?? []) {
            const previousName = selectedTargetSet.targetType.name;
            const resolvedName = this.resolveSelection(selectedTargetSet.targetType, targetTypeNames);
            if (resolvedName === undefined) {
                invalidTargetSetSelections.push(selectedTargetSet);
                continue;
            }
            if (resolvedName !== undefined && resolvedName !== previousName) {
                selectedTargetSet.targetType = {
                    name: resolvedName,
                    index: targetTypeNames.indexOf(resolvedName),
                };
                if (persistedTargetType === previousName && solutionSelection) {
                    solutionSelection.selectedTargetType = resolvedName;
                    renamedActiveTargetType = resolvedName;
                }
                this.markDirty();
            }
        }
        if (invalidTargetSetSelections.length > 0 && solutionSelection?.selectedTargetSets) {
            solutionSelection.selectedTargetSets = solutionSelection.selectedTargetSets
                .filter(entry => !invalidTargetSetSelections.includes(entry));
            this.markDirty();
        }

        if (renamedActiveTargetType !== undefined) {
            return renamedActiveTargetType;
        }

        if (persistedTargetType !== undefined && (targetTypeNames.length === 0 || targetTypeNames.includes(persistedTargetType))) {
            return persistedTargetType;
        }

        const activeEntry = solutionSelection?.selectedTargetSets?.find(entry => entry.targetType.name === persistedTargetType);
        const resolvedTargetType = this.resolveSelection(activeEntry?.targetType, targetTypeNames);
        if (resolvedTargetType !== undefined && resolvedTargetType !== persistedTargetType && solutionSelection) {
            solutionSelection.selectedTargetType = resolvedTargetType;
            this.markDirty();
        } else if (persistedTargetType !== undefined && resolvedTargetType === undefined && solutionSelection) {
            delete solutionSelection.selectedTargetType;
            this.markDirty();
        }
        return resolvedTargetType;
    }

    public setActiveTargetType(targetType: string, _targetTypeNames: readonly string[] = []): void {
        this.setSolutionSelection('selectedTargetType', targetType);
    }

    public getSelectedSet(targetType: string, targetSetNames: readonly string[] = []): number {
        const solutionSelection = this.targetSetMap;
        const selectedTargetSet = solutionSelection?.selectedTargetSets?.find(entry => entry.targetType.name === targetType);
        const selectedSet = selectedTargetSet?.targetSet ?? solutionSelection?.[targetType];
        if (typeof selectedSet === 'number') {
            return selectedSet;
        }
        const selectedSetName = this.resolveSelection(selectedTargetSet?.targetSet, targetSetNames);
        if (selectedTargetSet && selectedSetName === undefined) {
            solutionSelection!.selectedTargetSets = solutionSelection!.selectedTargetSets?.filter(entry => entry !== selectedTargetSet);
            this.markDirty();
        } else if (selectedTargetSet && selectedSetName !== undefined && selectedSetName !== selectedTargetSet.targetSet.name) {
            selectedTargetSet.targetSet = {
                name: selectedSetName,
                index: targetSetNames.indexOf(selectedSetName),
            };
            this.markDirty();
        }
        return selectedSetName === undefined ? -1 : targetSetNames.indexOf(selectedSetName);
    }

    public setSelectedSet(
        targetType: string,
        targetSet: string,
        targetSetNames: readonly string[] = [],
        targetTypeNames: readonly string[] = [],
    ): void {
        const solutionSelection = this.ensureSolutionSelection();
        const selectedTargetSets = solutionSelection.selectedTargetSets ?? [];
        const selection = selectedTargetSets.find(entry => entry.targetType.name === targetType);
        const value: TargetSetSelection = {
            targetType: { name: targetType, index: targetTypeNames.indexOf(targetType) },
            targetSet: { name: targetSet, index: targetSetNames.indexOf(targetSet) },
        };
        if (selection) {
            Object.assign(selection, value);
        } else {
            selectedTargetSets.push(value);
        }
        solutionSelection.selectedTargetSets = selectedTargetSets;
        delete solutionSelection[targetType];
        this.markDirty();
    }

    public hasSelectedSet(targetType: string): boolean {
        const solutionSelection = this.targetSetMap;
        return solutionSelection?.selectedTargetSets?.some(entry => entry.targetType.name === targetType) === true
            || solutionSelection?.[targetType] !== undefined;
    }

    public deleteSolutionSelection(key: string): void {
        const selection = this.targetSetMap;
        if (!selection) {
            return;
        }
        if (key === 'activeTargetType') {
            delete selection.selectedTargetType;
            this.markDirty();
            return;
        }
        const selectedTargetSets = selection.selectedTargetSets ?? [];
        const filteredSelections = selectedTargetSets.filter(entry => entry.targetType.name !== key);
        if (filteredSelections.length !== selectedTargetSets.length || key in selection) {
            selection.selectedTargetSets = filteredSelections;
            delete selection[key];
            this.markDirty();
        }
    }

    public async saveResolvedSelections(): Promise<boolean> {
        if (!this.isDirty) {
            return true;
        }

        const currentSelections = this.getSettings().solutionSelections as ContextSelectionSettings | undefined;
        const currentSelection = currentSelections?.[this.solutionDisplayName];
        return this.savePartialSettings(settings => {
            const latestSelections = settings.solutionSelections && typeof settings.solutionSelections === 'object'
                ? settings.solutionSelections as ContextSelectionSettings
                : {};
            if (currentSelection === undefined) {
                delete latestSelections[this.solutionDisplayName];
            } else {
                latestSelections[this.solutionDisplayName] = currentSelection;
            }
            settings.solutionSelections = latestSelections;
            if (settings.targetSet && typeof settings.targetSet === 'object') {
                const legacyTargetSets = settings.targetSet as ContextSelectionSettings;
                this.deleteLegacySolutionSelections(legacyTargetSets);
                if (Object.keys(legacyTargetSets).length === 0) {
                    delete settings.targetSet;
                }
            }
        }, error => {
            console.warn(`Failed to persist resolved CMSIS selections: ${error}`);
            void vscode.window.showWarningMessage('The CMSIS solution was loaded, but its resolved target selections could not be saved.');
        });
    }

    private savePartialSettings(
        update: (settings: ContextSelectionSettings) => void,
        reportError: (error: string) => void,
    ): boolean {
        const temporaryFile = `${this.fileName}.${process.pid}.${Date.now()}.tmp`;
        const inMemorySettings = this.getSettings();
        try {
            const latestSettings = fs.existsSync(this.fileName)
                ? JSON.parse(fs.readFileSync(this.fileName, 'utf8')) as ContextSelectionSettings
                : {};
            update(latestSettings);

            fs.mkdirSync(path.dirname(this.fileName), { recursive: true });
            const persistedText = JSON.stringify(latestSettings, null, 4);
            fs.writeFileSync(temporaryFile, persistedText, 'utf8');
            fs.renameSync(temporaryFile, this.fileName);

            this.contentObject = merge({}, latestSettings, inMemorySettings);
            this.text = persistedText;
            if (this.isModified()) {
                this.markDirty();
            } else {
                this.resetDirty();
            }
            return true;
        } catch (error) {
            try {
                fs.rmSync(temporaryFile, { force: true });
            } catch {
                // Preserve the original persistence error.
            }
            reportError(error instanceof Error ? error.message : String(error));
            return false;
        }
    }

    private get legacySolutionNames(): string[] {
        const workspaceRelativeName = backToForwardSlashes(path.relative(vscodeUtils.getWorkspaceFolder(), this.solutionPath));
        const workspaceRelativeLegacyName = workspaceRelativeName.replace(/\.csolution\.ya?ml$/i, '');
        return [...new Set([workspaceRelativeLegacyName, this.solutionName])]
            .filter(name => name !== this.solutionDisplayName);
    }

    private setSolutionSelection(key: string, value: string): void {
        const solutionSelection = this.ensureSolutionSelection();
        solutionSelection[key] = value;
        this.markDirty();
    }

    private ensureSolutionSelection(): SolutionSelection {
        const existingSelection = this.targetSetMap;
        if (existingSelection) {
            return existingSelection;
        }
        const solutionSelections = this.ensureSolutionSelections();
        if (!solutionSelections[this.solutionDisplayName] || typeof solutionSelections[this.solutionDisplayName] !== 'object') {
            solutionSelections[this.solutionDisplayName] = {};
        }
        return solutionSelections[this.solutionDisplayName];
    }

    private ensureSolutionSelections(): Record<string, SolutionSelection> {
        if (!this.contentObject) {
            this.contentObject = {};
        }
        const content = this.contentObject as ContextSelectionSettings;
        if (!content.solutionSelections || typeof content.solutionSelections !== 'object') {
            content.solutionSelections = {};
        }
        return content.solutionSelections as Record<string, SolutionSelection>;
    }

    private deleteLegacySolutionSelections(legacyTargetSets: ContextSelectionSettings): boolean {
        let deleted = false;
        for (const legacySolutionName of [this.solutionDisplayName, ...this.legacySolutionNames]) {
            if (legacySolutionName in legacyTargetSets) {
                delete legacyTargetSets[legacySolutionName];
                deleted = true;
            }
        }
        return deleted;
    }

    private resolveSelection(selection: NamedSelection | undefined, names: readonly string[]): string | undefined {
        if (selection !== undefined && (names.length === 0 || names.includes(selection.name))) {
            return selection.name;
        }
        return selection !== undefined && selection.index >= 0 && selection.index < names.length
            ? names[selection.index]
            : undefined;
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
