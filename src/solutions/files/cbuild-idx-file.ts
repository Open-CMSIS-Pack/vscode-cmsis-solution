/**
 * Copyright 2024-2026 Arm Limited
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

import '../../generic/map';
import { CTreeItemYamlFile, ITreeItemFile } from '../../generic/tree-item-file';
import { ETextFileResult } from '../../generic/text-file';
import { CTreeItem, ITreeItem } from '../../generic/tree-item';
import { ContextDescriptor, contextDescriptorFromString, LayerDescriptor } from '../descriptors/descriptors';
import { getFileNameNoExt } from '../../utils/path-utils';
import { CbuildFile } from './cbuild-file';
import { constructor } from '../../generic/constructor';

export interface CbuildIdxFile extends ITreeItemFile {
    get activeContexts(): ContextDescriptor[];
    get cbuildFiles(): Map<string, CbuildFile>;
    /**
     * Result of last load of cbuild files
     */
    readonly cbuildLoadResult : ETextFileResult;

    /**
     * Returns contexts for given project name or path
     * @param pathOrName project full path or just name (names are unique)
     * @returns ContextDescriptor if found or undefined
     */
    getContext(pathOrName?: string): ContextDescriptor | undefined;
}

class CbuildIdxFileImpl extends CTreeItemYamlFile implements CbuildIdxFile {

    protected _activeContexts: ContextDescriptor[] = [];
    protected _projectMap = new Map<string, string>();
    protected _cbuildFiles = new Map<string, CbuildFile>();
    protected _cbuildLoadResult = ETextFileResult.Unchanged;

    constructor() {
        super();
    }

    public get activeContexts() {
        return this._activeContexts;
    }

    public get cbuildFiles() {
        return this._cbuildFiles;
    };

    public get cbuildLoadResult() {
        return this._cbuildLoadResult;
    };

    public getContext(pathOrName?: string): ContextDescriptor | undefined {
        const projectName = getFileNameNoExt(pathOrName);
        return this.activeContexts.find(c => c.projectName === projectName);
    }

    override async load(fileName: string): Promise<ETextFileResult> {
        let result = await super.load(fileName);
        this._activeContexts = [];
        this._projectMap.clear();
        this._cbuildLoadResult = ETextFileResult.Unchanged;
        // Don't clear _cbuildFiles - update incrementally
        if (result <= ETextFileResult.Success) {
            this._projectMap = this.collectProjects();
            this._cbuildLoadResult = await this.loadCbuildFiles();
            if (result < this._cbuildLoadResult) {
                result = this._cbuildLoadResult;
            }
        } else {
            this._cbuildFiles.clear();
        }
        return result;
    }

    private async loadCbuildFiles() : Promise<ETextFileResult> {
        const cbuilds = this.topItem?.getGrandChildren('cbuilds') ?? [];
        const newProjectNames = new Set<string>();

        let result = ETextFileResult.Unchanged;
        // Load/update cbuild files
        for (const child of cbuilds) {
            const cbuildFileName = child.getValueAsString('cbuild');
            const context = contextDescriptorFromString(getFileNameNoExt(cbuildFileName));
            newProjectNames.add(context.projectName);
            const res = await this.loadCbuild(child);
            if (result < res) {
                result = res;
            }
        }

        // Remove cbuild files that are no longer in the index
        for (const projectName of this._cbuildFiles.keys()) {
            if (!newProjectNames.has(projectName)) {
                this._cbuildFiles.delete(projectName);
                if (result === ETextFileResult.Unchanged) {
                    result = ETextFileResult.Success;
                }
            }
        }
        return result;
    }

    protected async loadCbuild(cbuild: ITreeItem<CTreeItem>): Promise<ETextFileResult> {
        const cbuildFileName = cbuild.getValueAsString('cbuild');
        const context = contextDescriptorFromString(getFileNameNoExt(cbuildFileName));

        // Reuse existing CbuildFile if available, otherwise create new
        let cbuildFile = this._cbuildFiles.get(context.projectName);
        if (!cbuildFile) {
            cbuildFile = new CbuildFile(this.resolvePath(cbuildFileName));
            this._cbuildFiles.set(context.projectName, cbuildFile);
        }

        const result = await cbuildFile.load();
        if (result <= ETextFileResult.Success) {
            context.projectPath = cbuildFile.projectPath;
            context.layers = this.collectLayers(cbuild);
        }
        this._activeContexts.push(context);
        return result;
    }

    protected collectLayers(cbuild: ITreeItem<CTreeItem>): LayerDescriptor[] {
        const layers: LayerDescriptor[] = [];
        const clayers = cbuild.getChild('clayers');
        if (clayers) {
            for (const l of clayers.getSequenceValues('clayer')) {
                layers.push({
                    displayName: getFileNameNoExt(l),
                    absolutePath: this.resolvePath(l)
                });
            }
        }
        return layers;
    }

    protected collectProjects(): Map<string, string> {
        const projectMap = new Map<string, string>();
        const top = this.topItem;
        if (!top) {
            return projectMap;
        }
        const projects = this.topItem?.getGrandChildren('cprojects') ?? [];
        for (const child of projects) {
            const projectFile = child.getValueAsString('cproject');
            if (projectFile) {
                const projectName = getFileNameNoExt(projectFile);
                const projectPath = top.resolvePath(projectFile);
                projectMap.set(projectName, projectPath);
            }
        }
        return projectMap;
    }
}

export const CbuildIdxFile = constructor<typeof CbuildIdxFileImpl, CbuildIdxFile>(CbuildIdxFileImpl);
