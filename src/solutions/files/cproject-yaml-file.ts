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
import { extractPname } from '@open-cmsis-pack/cmsis-common/string-utils';
import { ProjectRefWrap } from './csolution-wrap';
import { ETextFileResult } from '@open-cmsis-pack/cmsis-common/text-file';
import { appendSequenceMapEntry, setContextRestrictions } from './yaml-creation-helpers';


/**
 * High-level typed interface for a .cproject.yml file.
 * Wraps the underlying YAML tree with convenience accessors for target types,
 * target sets, build types and project references.
 * Represents a YAML file for a CMSIS project, extending both {@link ITreeItemFile} .

 */
export interface CProjectYamlFile extends ITreeItemFile {
    /**
     * Loads a project template and rebases the parsed tree onto a destination file.
     */
    loadTemplate(templateFileName: string, destinationFileName: string): Promise<ETextFileResult>;

    /**
     * Gets and returns device processor in the format :Pname
     * @returns processor string as Pname or undefined
     */
    get deviceProcessor(): string | undefined;

    /**
     * Sets device processor in the format :Pname
     * @param pname processor string as :Pname, Pname or undefined
     */
    set deviceProcessor(pname: string | undefined);

    /**
     * Optional project type, e.g. 'West'
     */
    get projectType(): string | undefined;

    /**
     * Set project type, e.g. 'West'
     */
    set projectType(type: string | undefined);

    /**
     * Appends a component requirement while preserving request order.
     */
    addComponent(reference: string, forContext?: readonly string[], notForContext?: readonly string[]): CTreeItem;
}


class CProjectYamlFileImpl extends CTreeItemYamlFile implements CProjectYamlFile {

    private _projectType?: string;

    public override ensureTopItem(tag?: string): CTreeItem {
        const topItem = super.ensureTopItem(tag ?? 'project');
        topItem.setKind(ETreeItemKind.Map);
        return topItem;
    }

    async loadTemplate(templateFileName: string, destinationFileName: string): Promise<ETextFileResult> {
        const result = await super.load(templateFileName);
        if (result === ETextFileResult.Success || result === ETextFileResult.Unchanged) {
            this.fileName = destinationFileName;
            if (this.rootItem) {
                this.rootItem.rootFileName = destinationFileName;
            }
        }
        return result;
    }

    get deviceProcessor(): string | undefined {
        return extractPname(this.topItem?.getValue('device'));
    }

    set deviceProcessor(pname: string | undefined) {
        if (pname && !pname.startsWith(':')) {
            pname = ':' + pname;
        }
        this.ensureTopItem().setValue('device', pname);
    }

    get projectType() {
        return this._projectType;
    }

    set projectType(type: string | undefined) {
        this._projectType = type;
    }

    addComponent(reference: string, forContext: readonly string[] = [], notForContext: readonly string[] = []): CTreeItem {
        const component = appendSequenceMapEntry(this.ensureTopItem(), 'components', 'component', reference);
        setContextRestrictions(component, forContext, notForContext);
        return component;
    }
}

class CVirtualProjectYamlFileImpl extends CProjectYamlFileImpl {

    override async load(_filename?: string): Promise<ETextFileResult> {
        return ETextFileResult.Unchanged;
    }
    override async save(_filename?: string): Promise<ETextFileResult> {
        return ETextFileResult.Unchanged;
    }
}


export const CProjectYamlFile = constructor<typeof CProjectYamlFileImpl, CProjectYamlFile>(CProjectYamlFileImpl);


export function constructProjectYamlFile(projectRef?: ProjectRefWrap): CProjectYamlFile {

    if (projectRef && projectRef.west) {
        // create a dummy read-only project
        const zephyrProject = new CVirtualProjectYamlFileImpl(projectRef.projectPath);
        zephyrProject.readOnly = true;
        zephyrProject.ensureRootItem().rootFileName = projectRef.projectPath;
        zephyrProject.deviceProcessor = projectRef.deviceProcessor;
        zephyrProject.projectType = projectRef.projectType;
        return zephyrProject;
    }
    return new CProjectYamlFile(projectRef?.projectPath);
}
