/**
 * Copyright 2023-2026 Arm Limited
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

import * as path from 'path';
import { CTreeItem, ETreeItemKind, ITreeItem } from '../generic/tree-item';
import { ETextFileResult } from '../generic/text-file';
import { parseYamlToCTreeItem } from '../generic/tree-item-yaml-parser';
import { CbuildRunYamlFile } from './files/cbuild-run-yaml-file';
import { optional, arrayOf, nullable, Schema, string, InferType } from '../generic/schema';
import { Optional, ArrayElement } from '../generic/type-helper';
import { extractSuffix, stripPrefix, stripSuffix, stripTwoExtensions } from '../utils/string-utils';
import { getFileNameNoExt } from '../utils/path-utils';
import { CbuildIdxFile } from './files/cbuild-idx-file';
import { ContextDescriptor, contextDescriptorFromString } from './descriptors/descriptors';
import { CmsisSettingsJsonFile } from '../global/cmsis-settings-json-file';
import { CSolutionYamlFile } from './files/csolution-yaml-file';
import { CProjectYamlFile } from './files/cproject-yaml-file';
import { CbuildPackFile } from './files/cbuild-pack-file';

export const targetTypeSchema = new Schema({
    'type': string,
    'target-set': optional(arrayOf({
        'set': nullable(string),
        'images': optional(arrayOf({
            'project-context': optional(string),
            'image': optional(string),
        })),
        'debugger': optional({
            'name': string,
            'start-pname': optional(string),
        }),
    })),
});

type TargetType = InferType<typeof targetTypeSchema>;

export class CSolution {
    // TODO: implement ICsolution interface

    // file name
    solutionPath: string = '';
    solutionDir: string = '';

    // solution files:
    csolutionYml = new CSolutionYamlFile();

    // build files:
    cbuildIdxFile = new CbuildIdxFile();

    public get cbuildIdxYmlRoot() {
        return this.cbuildIdxFile?.rootItem;
    }

    cbuildPackFile = new CbuildPackFile();

    cbuilds?: ITreeItem<CTreeItem>[];
    cbuildYmlRoot: Map<string, CTreeItem> = new Map();
    clayerYmlRoot: Map<string, CTreeItem> = new Map();

    // local configuration
    cbuildSetYmlFileName = '';
    cmsisJsonFile = new CmsisSettingsJsonFile();

    public get projects() {
        return this.csolutionYml.projects;
    }

    private _targetTypes: Optional<Map<string, CTreeItem>>;
    public get targetTypes() {
        if (this._targetTypes !== undefined) {
            return this._targetTypes;
        }
        const csolutionTop = this.csolutionYml.topItem;
        const tts = csolutionTop?.getGrandChildren('target-types') ?? [];
        this._targetTypes = new Map<string, CTreeItem>();
        tts.map(tt => this._targetTypes!.set(tt.getValueAsString('type'), tt as CTreeItem));
        return this._targetTypes!;
    }

    /**Context name prior to action execution, volatile! */
    private _actionContext: string = '';

    public set actionContext(value: string) {
        this._actionContext = value;
    }
    public get actionContext() {
        return this._actionContext;
    }

    public effectiveActionContext(context?: string): string {
        return context ?? this.actionContext;
    }

    /**
     * Expands path by replacing access sequences and variables in supplied path
     * @param pathName source path name to substitute
     * @returns path with replacements
     */
    public expandPath(pathName: string, targetType?: string): string {
        // replace variables if any
        let result = pathName;
        for (const variable of this.getVariables(targetType)) {
            result = result.replaceAll(variable[0], variable[1]);
        }
        return result.replaceAll('$SolutionDir()$', this.solutionDir);
    }

    public getCbuildTop(context?: string): CTreeItem | undefined {
        const actionContext = this.effectiveActionContext(context);
        for (const cbuild of this.cbuildYmlRoot.values()) {
            const cbuildTop = cbuild.getChildItem();
            if (cbuildTop && (actionContext.length == 0 || actionContext === cbuildTop.getValueAsString('context'))) {
                return cbuildTop;
            }
        }
        return undefined;
    }

    public getCbuildValue(key: string, context?: string): string {
        return this.getCbuildTop(context)?.getValueAsString(key) ?? '';
    }

    public getDevicePack(context?: string): string {
        return this.getCbuildValue('device-pack', context);
    }

    public getFullDeviceName(context?: string): string {
        return stripPrefix(this.getCbuildValue('device', context), '::');
    }

    public getDeviceName(context?: string): string {
        return stripSuffix(this.getFullDeviceName(context), ':');
    }

    public getProcessorName(): string {
        const [, activeTargetSet] = this.getActiveTargetSet();
        return activeTargetSet?.debugger?.['start-pname'] ?? extractSuffix(this.getFullDeviceName(), ':');
    }

    public getBoardName(context?: string): string {
        return this.getCbuildValue('board', context);
    }

    public getDeviceNameWithVendor(context?: string): string {
        return this.getCbuildValue('device', context);
    }

    public getBoardPack(context?: string): string {
        return this.getCbuildValue('board-pack', context);
    }

    public getDefaultTargetTypeItem(targetType?: string): CTreeItem | undefined {
        const key = targetType ?? this.getActiveTargetType();
        if (key) {
            return this.targetTypes.get(key);
        } else if (this.targetTypes.size > 0) {
            return this.targetTypes.values().next().value;
        }
        return undefined;
    }

    public saveTargetSet(targetSet: ArrayElement<TargetType['target-set']>) {
        const updateTreeItemChild = (item: ITreeItem<CTreeItem>, key: string, obj: unknown) => {
            if (obj) {
                item.createChild(key, true).fromObject(obj);
            } else {
                item.removeChild(item.getChild(key));
            }
        };
        const updateTargetSet = (item: ITreeItem<CTreeItem>) => {
            targetSet.images
                ?.filter(image => 'load' in image && image.load === 'image+symbols')
                .forEach(image => { if ('load' in image) delete image.load; });
            item.createChild('set', true)
                .setKind(ETreeItemKind.Scalar)
                .setText(targetSet.set ?? undefined);
            updateTreeItemChild(item, 'images', targetSet.images);
            updateTreeItemChild(item, 'debugger', targetSet.debugger);
        };

        const activeTargetType = this.getDefaultTargetTypeItem();
        if (!activeTargetType) {
            return;
        }
        const targetSets = activeTargetType.createChild('target-set', true);
        const currentTargetSet = targetSets.getChildren().find(c => c.getChild('set')?.getValueAsString() === (targetSet.set ?? ''));
        if (currentTargetSet) {
            updateTargetSet(currentTargetSet);
        } else {
            const newTargetSet = targetSets.createChild('-');
            newTargetSet.setKind(ETreeItemKind.Map);
            updateTargetSet(newTargetSet);
        }
    }

    public setActiveTargetType(type: string): void {
        this.cmsisJsonFile.activeTargetTypeName = type;
    }

    public getActiveTargetType(): string | undefined {
        return this.cmsisJsonFile.activeTargetTypeName ?? this.csolutionYml.getTargetType()?.name;
    }

    public getActiveTargetTypeWrap() {
        const activeTarget = this.getActiveTargetType() ?? '';
        return this.csolutionYml.getTargetType(activeTarget);
    }
    public getActiveTargetSetWrap() {
        const activeTargetWrap = this.getActiveTargetTypeWrap();
        if (activeTargetWrap) {
            const activeTargetSetIdx = this.cmsisJsonFile.getSelectedSet(activeTargetWrap.name);
            return activeTargetWrap.getTargetSetFromIndex(activeTargetSetIdx);
        }
        return undefined;
    }

    public getActiveTargetSet(): [TargetType['type'], Optional<ArrayElement<TargetType['target-set']>>] {
        const activeTarget = this.getActiveTargetType() ?? '';
        const activeTargetWrap = this.getActiveTargetTypeWrap();
        const activeTargetObject = activeTargetWrap?.object;
        const activeTargetSetWrap = this.getActiveTargetSetWrap();
        const activeTargetSetObject = activeTargetSetWrap?.object;
        return [
            activeTarget,
            targetTypeSchema.validate(activeTargetObject) ? activeTargetSetObject as ArrayElement<TargetType['target-set']> : undefined
        ];
    }

    /**
     * Returns the active target set name from the solution manager.
     * @returns active target set name (TARGET_TYPE@TARGET_SET) or in case of default target set only (TARGET_TYPE)
     */
    public getActiveTargetSetName() {
        const [targetType, activeTargetSet] = this.getActiveTargetSet();
        if (!activeTargetSet) {
            return undefined;
        }
        if (!activeTargetSet?.set) {
            return targetType;
        }
        return `${targetType}@${activeTargetSet.set}`;
    };

    public getVariables(targetType?: string): Map<string, string> {
        const variables = new Map<string, string>();
        const tt = this.getDefaultTargetTypeItem(targetType);
        if (tt) {
            for (const child of tt.getGrandChildren('variables')) {
                const keyVal = child.getKeyValue();
                variables.set(`$${keyVal[0]}$`, keyVal[1]);
            }
        }
        return variables;
    }

    public getPacks(): Map<string, string> {
        const packs = new Map<string, string>();
        const cbuildTop = this.getCbuildTop();
        if (cbuildTop) {
            for (const child of cbuildTop.getGrandChildren('packs')) {
                const pack = child.getValue('pack');
                const path = child.getValue('path');

                if (pack && path) {
                    packs.set(pack, path);
                }
            }
        }
        return packs;
    }


    public async load(solutionPath: string): Promise<ETextFileResult> {
        if (solutionPath !== this.solutionPath) {
            this.clear();
            this.solutionPath = solutionPath;
            this.solutionDir = path.dirname(solutionPath);
        }
        this.cmsisJsonFile.solutionPath = this.solutionPath;
        this.cmsisJsonFile.load(); // first load settings
        // load csolution and its cproject.yml files
        const solutionResult = await this.csolutionYml.load(this.solutionPath);
        await this.loadBuildFiles(); // can already be available
        return solutionResult;
    }

    private clear() {
        this.csolutionYml.clear();
        this._targetTypes = undefined;
        this.clearBuildFiles();
    }

    private clearBuildFiles() {
        this.cbuildIdxFile?.clear();
        this.cbuildYmlRoot = new Map();
        this.clayerYmlRoot = new Map();
    }

    private async loadClayerYmlFiles(parent?: ITreeItem<CTreeItem>): Promise<void> {
        this.cbuilds = parent?.getGrandChildren('cbuilds');
        if (!this.cbuilds) {
            return;
        }
        for (const cbuild of this.cbuilds) {
            const clayers: CTreeItem[] = [];
            for (const clayer of cbuild.getGrandChildren('clayers')) {
                const clayerYml = await this.loadChildYml('clayer', clayer, this.clayerYmlRoot);
                if (clayerYml) {
                    clayers.push(clayerYml);
                }
            }
            const cbuildFile = path.join(this.solutionDir, cbuild.getValue('cbuild') ?? '');
            const cbuildYml = this.cbuildYmlRoot.get(cbuildFile);
            // store layers directly in cbuild
            cbuildYml?.setProperty('clayers', clayers);
        }
    }

    private async loadChildYml(tag: string, element: ITreeItem<CTreeItem>, collection: Map<string, CTreeItem>): Promise<CTreeItem | undefined> {
        const fileName = path.join(this.solutionDir, element.getValue(tag) ?? '');
        const loaded = collection.get(fileName);
        if (loaded !== undefined) {
            return loaded; // already read
        }
        const yml = parseYamlToCTreeItem('', fileName) as CTreeItem;
        if (yml) {
            collection.set(fileName, yml); //add to the supplied map
        }
        return yml;
    }

    public async loadBuildFiles(): Promise<ETextFileResult> {
        this.clearBuildFiles();
        if (!this.csolutionYml) {
            return ETextFileResult.NotExists;
        }
        await this.loadCbuildPackYml(this.solutionPath);
        return await this.loadCbuildIdxYml(this.solutionPath);
    }

    public get solutionName() {
        return getFileNameNoExt(this.solutionPath);
    }

    public get cbuildRunYml() {
        // Lookup path in cbuild-idx.yml, it contains the path to the file including target type
        if (this.cbuildIdxYmlRoot) {
            const cbuildRunFile = this.cbuildIdxYmlRoot?.getChild('build-idx')?.getValue('cbuild-run');
            if (cbuildRunFile) {
                const cbuildRunPath = this.cbuildIdxYmlRoot.resolvePath(cbuildRunFile);
                return new CbuildRunYamlFile(cbuildRunPath);
            }
        }
        return undefined;
    }

    public async getDefaultDebugAdapterName() {
        const cbuildRunYml = this.cbuildRunYml;
        if (!cbuildRunYml?.exists()) {
            return '';
        }
        await cbuildRunYml?.load();
        try {
            return cbuildRunYml?.getDebugger().name ?? '';
        } catch (e) {
            console.error('Error getting default debug adapter name:', e);
            return '';
        }
    }


    private async loadCbuildIdxYml(solutionPath: string): Promise<ETextFileResult> {
        const cbuildIdxPath = stripTwoExtensions(solutionPath) + '.cbuild-idx.yml';
        const result = await this.cbuildIdxFile.load(cbuildIdxPath);
        for (const cbuild of this.cbuildIdxFile.cbuildFiles.values()) {
            if (cbuild.rootItem) {
                this.cbuildYmlRoot.set(cbuild.fileName, cbuild.rootItem);
            }
        }
        await this.loadClayerYmlFiles(this.cbuildIdxFile.topItem);
        return result;
    }

    private async loadCbuildPackYml(solutionPath: string): Promise<void> {
        const cbuildPackPath = stripTwoExtensions(solutionPath) + '.cbuild-pack.yml';
        await this.cbuildPackFile.load(cbuildPackPath);
    }

    public getContextNames() {
        const targetSet = this.getActiveTargetTypeWrap();
        if (targetSet) {
            return targetSet.getContexts();
        }
        return [];
    }

    public getContextDescriptors(): ContextDescriptor[] {
        return this.cbuildIdxFile.activeContexts;
    }

    /**
     * Returns contexts for given project name or path
     * @param pathOrName project full path or just name (names are unique)
     * @returns ContextDescriptor if found or undefined
     */
    public getContextDescriptor(pathOrName?: string): ContextDescriptor | undefined {
        return this.cbuildIdxFile.getContext(pathOrName);
    }


    /**
     * Gets the first cproject path that matches the given name
     * @param name the project name without extension
     * @returns the first matching key or undefined if not found
     */
    public getCprojectPath(name?: string): string | undefined {
        return this.getCproject(name)?.fileName;
    }

    /**
     * Returns CTreeItemYamlFile item associated with cproject.yml file
     * @param fileName
     * @returns CTreeItemYamlFile or undefined
     */
    public getCproject(fileName?: string): CProjectYamlFile | undefined {
        return this.csolutionYml.getProject(fileName);
    }

    /**
     * Returns CTreeItemYamlFile item associated with clayer.yml file
     * @param fileName
     * @returns CTreeItem or undefined
     */
    public getClayer(fileName: string): CTreeItem | undefined {
        const absPath = path.resolve(this.solutionDir, fileName);
        return this.clayerYmlRoot.get(absPath);
    }

    /**
     * Returns first child of cproject.yml file for specified cbuild item
     * @param cbuild cbuild item (first child of cbuild.yml file)
     * @param onlyInActiveContext optional flag to check if cbuild is in an active context
     * @returns CTreeItem or undefined
     */
    public getCprojectForCbuild(cbuild?: CTreeItem, _onlyInActiveContext?: boolean): CProjectYamlFile | undefined {
        if (cbuild) {
            let cprojectName = cbuild.getValueAsString('project');
            if (!cprojectName) {
                const context = contextDescriptorFromString(getFileNameNoExt(cbuild.rootFileName));
                cprojectName = context.projectName;
            }
            return this.getCproject(cprojectName);
        }
        return undefined;
    }

    public getCompilers(): string[] {
        return this.csolutionYml.compilers;
    }

};

export function expandPath(path: string, csolution?: CSolution, targetType?: string,): string {
    return csolution ? csolution.expandPath(path, targetType) : path;
}
