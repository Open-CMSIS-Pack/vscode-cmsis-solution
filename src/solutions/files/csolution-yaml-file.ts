/**
 * Copyright 2024-2026 Arm Limited
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

import { CTreeItemYamlFile, ITreeItemFile } from '@open-cmsis-pack/cmsis-common/tree-item-file';
import { CTreeItem, ETreeItemKind } from '@open-cmsis-pack/cmsis-common/tree-item';
import { constructor } from '@open-cmsis-pack/cmsis-common/constructor';
import { CSolutionWrap, ICSolutionWrap, ProjectRefWrap, TargetSetWrap, TargetTypeWrap } from './csolution-wrap';
import { ETextFileResult } from '@open-cmsis-pack/cmsis-common/text-file';
import { constructProjectYamlFile, CProjectYamlFile } from './cproject-yaml-file';
import { getFileNameNoExt } from '../../utils/path-utils';
import { extractVersion } from '@open-cmsis-pack/cmsis-common/string-utils';
import * as semver from 'semver';
import { MIN_TOOLBOX_VERSION } from '../../manifest';
import { appendSequenceMapEntry, setContextRestrictions } from './yaml-creation-helpers';

const SUPPORTED_COMPILERS = ['AC6', 'GCC', 'IAR', 'CLANG'] as const;


/**
 * High-level typed interface for a .csolution.yml file.
 * Wraps the underlying YAML tree with convenience accessors for target types,
 * target sets, build types and project references.
 * Represents a YAML file for a CMSIS solution, extending both {@link ITreeItemFile} and {@link ICSolutionWrap}.
 * Provides additional convenience methods not present on {@link CSolutionWrap}.
 *
 * @remarks
 * This interface is designed to facilitate interaction with CMSIS solution YAML files,
 * offering methods to access solution wrappers and target sets.
 */
export interface CSolutionYamlFile extends ITreeItemFile, ICSolutionWrap {
    /**
     * Loads a solution template without loading projects or synthesizing target sets,
     * then rebases the parsed tree onto a destination file.
     */
    loadTemplate(templateFileName: string, destinationFileName: string): Promise<ETextFileResult>;

    /**
     * Gets the underlying {@link CSolutionWrap} instance associated with this YAML file.
     */
    get solutionWrap(): CSolutionWrap;

    /**
     * Returns all loaded CMSIS project YAML files referenced by this solution
     * The collection is derived from the solution's project references and may be empty
     * if no projects have been loaded yet.
     * @returns map of name to CProjectYamlFile
     */

    get projects(): Map<string, CProjectYamlFile>;

    /**
     * Returns all used compilers in solution and its projects
     * @returns array of strings
     */
    get compilers(): string[];

    /**
     * Gets or sets the solution compiler. Unsupported compiler identifiers are rejected.
     */
    get compiler(): string | undefined;
    set compiler(compiler: string | undefined);

    /**
     * Appends creation data while preserving request order.
     */
    appendProjectRef(reference: string): ProjectRefWrap;
    appendTargetType(name: string, device?: string, board?: string): TargetTypeWrap;
    addPack(pack: string, forContext?: readonly string[], notForContext?: readonly string[]): CTreeItem;

    /**
     * Returns cproject for given projectName or path
     * @param pathOrName project full path or just name (names are unique)
     * @returns CProjectYamlFile if found or undefined
     */
    getProject(pathOrName?: string): CProjectYamlFile | undefined;


    /**
     * Remove project context images that refer to non-existing projects (i.e. the project was renamed/deleted)
     */
    purgeAllProjectContexts(): void;

    /**
     * Ensures value created for: CMSIS-Toolbox exists and contains satisfied version
     */
    ensureCreatedForRequiredToolboxVersion(): void;
}


class CSolutionYamlFileImpl extends CTreeItemYamlFile implements CSolutionYamlFile {
    private _solutionWrap?: CSolutionWrap;
    private readonly _cprojects = new Map<string, CProjectYamlFile>();

    public override ensureTopItem(tag?: string): CTreeItem {
        const topItem = super.ensureTopItem(tag);
        topItem.createChild('target-types', true).setKind(ETreeItemKind.Sequence);
        return topItem;
    }

    async loadTemplate(templateFileName: string, destinationFileName: string): Promise<ETextFileResult> {
        const result = await super.load(templateFileName);
        if (result === ETextFileResult.Success || result === ETextFileResult.Unchanged) {
            this._solutionWrap = undefined;
            this._cprojects.clear();
            this.fileName = destinationFileName;
            if (this.rootItem) {
                this.rootItem.rootFileName = destinationFileName;
            }
        }
        return result;
    }

    get solutionWrap(): CSolutionWrap {
        if (!this._solutionWrap) {
            this._solutionWrap = new CSolutionWrap(this.ensureTopItem('solution'));
        }
        return this._solutionWrap;
    }

    get projects() {
        return this._cprojects;
    }

    getProject(pathOrName?: string): CProjectYamlFile | undefined {
        if (pathOrName === undefined) {
            // get first one
            return this.projects.values().next().value;
        }
        const exactProject = this._cprojects.get(pathOrName);
        if (exactProject) {
            return exactProject;
        }
        const name = getFileNameNoExt(pathOrName);
        return name ? this._cprojects.get(name) : undefined;
    }

    get compilers(): string[] {
        const compilers = new Set<string>;
        let c = this.topItem?.getValue('compiler');
        if (c) {
            compilers.add(c);
        }
        for (const project of this.projects.values()) {
            c = project?.topItem?.getValue('compiler');
            if (c) {
                compilers.add(c);
            }
        }
        return Array.from(compilers);
    }

    get compiler(): string | undefined {
        return this.topItem?.getValue('compiler');
    }

    set compiler(compiler: string | undefined) {
        if (compiler && !SUPPORTED_COMPILERS.includes(compiler as typeof SUPPORTED_COMPILERS[number])) {
            throw new Error(`Unsupported compiler '${compiler}'`);
        }
        this.ensureTopItem('solution').setValue('compiler', compiler || undefined);
    }

    appendProjectRef(reference: string): ProjectRefWrap {
        return new ProjectRefWrap(appendSequenceMapEntry(this.ensureTopItem('solution'), 'projects', 'project', reference));
    }

    appendTargetType(name: string, device?: string, board?: string): TargetTypeWrap {
        const targetType = new TargetTypeWrap(appendSequenceMapEntry(this.ensureTopItem('solution'), 'target-types', 'type', name));
        targetType.device = device;
        targetType.board = board;
        return targetType;
    }

    addPack(pack: string, forContext: readonly string[] = [], notForContext: readonly string[] = []): CTreeItem {
        const packs = this.ensureTopItem('solution').createChild('packs', true).setKind(ETreeItemKind.Sequence);
        const existingPack = packs.getChildren().find(item => item.getValue('pack') === pack) as CTreeItem | undefined;
        if (existingPack) {
            setContextRestrictions(existingPack, forContext, notForContext);
            return existingPack;
        }
        const packItem = appendSequenceMapEntry(this.ensureTopItem('solution'), 'packs', 'pack', pack);
        setContextRestrictions(packItem, forContext, notForContext);
        return packItem;
    }

    purgeProjectContexts(targetSet: TargetSetWrap) {
        for (const image of targetSet.projectContexts) {
            const ref = this.getProjectRef(image.projectName);
            if (!ref) {
                image.remove();
            }
        }
        targetSet.purgeImages();
    }

    purgeAllProjectContexts() {
        for (const targetType of this.targetTypes) {
            for (const targetSet of targetType.targetSets) {
                this.purgeProjectContexts(targetSet);
            }
        }
    }

    /**
     * Clears all cached state associated with the solution file.
     * - Empties the loaded project map
     * - Discards the cached CSolutionWrap so it will be recreated on next access
     * Also invokes the base class clear() to reset underlying tree / file state.
     */
    public override clear(): void {
        super.clear();
        this._solutionWrap = undefined;
        this._cprojects.clear();
    }

    public override async load(fileName?: string): Promise<ETextFileResult> {
        const result = await super.load(fileName);
        if (result !== ETextFileResult.Unchanged) {
            this._solutionWrap = undefined;
        }
        await this.loadProjects();
        this.ensureTargetSets();
        return result;
    }

    protected override doSave(): ETextFileResult {
        if (!this.readOnly) {
            this.ensureCreatedForRequiredToolboxVersion();
        }
        return super.doSave();
    }

    public ensureCreatedForRequiredToolboxVersion() {
        // ensure created for minimum required toolbox version
        const topItem = this.ensureTopItem();
        const toolBoxVersion = extractVersion(topItem.getValueAsString('created-for'));
        if (!toolBoxVersion || !semver.gte(toolBoxVersion, MIN_TOOLBOX_VERSION)) {
            topItem.setValue('created-for', `CMSIS-Toolbox@${MIN_TOOLBOX_VERSION}`);
        }
    }

    protected async loadProjects() {
        this._cprojects.clear();
        for (const projectRef of this.projectRefs) {
            const cproject = constructProjectYamlFile(projectRef);
            const res = await cproject.load();
            if (res !== ETextFileResult.NotExists && res !== ETextFileResult.Error) {
                this._cprojects.set(projectRef.projectName, cproject);
            }
        }
    }

    // Proxy implementations required by CSolutionYamlFile
    getTargetSet(targetTypeName: string, targetSetName?: string) {
        return this.solutionWrap.getTargetSet(targetTypeName, targetSetName);
    }

    ensureTargetTypeAndSet(targetTypeName: string, targetSetName?: string) {
        return this.solutionWrap.ensureTargetTypeAndSet(targetTypeName, targetSetName);
    }

    ensureTargetSets() {
        return this.solutionWrap.ensureTargetSets();
    }


    // --- ICSolutionWrap proxy properties/methods ---
    get targetTypes() { return this.solutionWrap.targetTypes; }
    get targetTypeNames() { return this.solutionWrap.targetTypeNames; }
    getTargetType(name?: string): TargetTypeWrap | undefined { return this.solutionWrap.getTargetType(name); }
    addTargetType(name?: string) { return this.solutionWrap.addTargetType(name); }

    get buildTypes() { return this.solutionWrap.buildTypes; }
    get buildTypeNames() { return this.solutionWrap.buildTypeNames; }
    getBuildType(name?: string) { return this.solutionWrap.getBuildType(name); }
    addBuildType(name?: string) { return this.solutionWrap.addBuildType(name); }

    get projectRefs() { return this.solutionWrap.projectRefs; }
    get projectNames() { return this.solutionWrap.projectNames; }
    getProjectRef(name: string) { return this.solutionWrap.getProjectRef(name); }
    addProjectRef(name?: string) { return this.solutionWrap.addProjectRef(name); }
}

export const CSolutionYamlFile = constructor<typeof CSolutionYamlFileImpl, CSolutionYamlFile>(CSolutionYamlFileImpl);
