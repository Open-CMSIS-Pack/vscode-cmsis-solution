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

import { CTreeItemYamlFile, ITreeItemFile } from '../../generic/tree-item-file';
import { CTreeItem, ETreeItemKind } from '../../generic/tree-item';
import { constructor } from '../../generic/constructor';
import { extractPname } from '../../utils/string-utils';
import { ProjectRefWrap } from './csolution-wrap';
import { ETextFileResult } from '../../generic/text-file';


/**
 * High-level typed interface for a .cproject.yml file.
 * Wraps the underlying YAML tree with convenience accessors for target types,
 * target sets, build types and project references.
 * Represents a YAML file for a CMSIS project, extending both {@link ITreeItemFile} .

 */
export interface CProjectYamlFile extends ITreeItemFile {
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
}


class CProjectYamlFileImpl extends CTreeItemYamlFile implements CProjectYamlFile {

    private _projectType?: string;

    public override ensureTopItem(tag?: string): CTreeItem {
        const topItem = super.ensureTopItem(tag ?? 'project');
        topItem.setKind(ETreeItemKind.Map);
        return topItem;
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
