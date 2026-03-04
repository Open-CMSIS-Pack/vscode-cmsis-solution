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

import * as fs from 'node:fs';
import * as vscode from 'vscode';
import { CSolution } from '../../../solutions/csolution';
import { CTreeItem, ITreeItem } from '../../../generic/tree-item';
import * as path from 'path';


function readTemplateFile(src: string) : string {
    if (!fs.existsSync(src)) {
        return '';
    }
    return fs.readFileSync(src, 'utf8');
}

/**
 * Check if template file exists and has %Instance%
 * @param src file to check
 * @returns true if file exists and has %Instance%
 */
function checkTemplateFile(src: string) {
    const input = readTemplateFile(src);
    if (!input) {
        return false;
    }
    return input.includes('%Instance%');
}


export function copyTemplateFile(src: string, dst: string, index?: number) {
    const input = readTemplateFile(src);
    if (!input) {
        return;
    }
    const indexStr = index !== undefined ? `${index}` : '';
    // replace placeholders with instance-specific values
    const output = input.replaceAll('%Instance%', indexStr);
    // write the modified content to the destination file
    fs.writeFileSync(dst, output, 'utf8');
}

export async function queryOverwriteIfExists(fileName: string): Promise<boolean> {
    if (!fs.existsSync(fileName)) {
        return true;
    }

    const result = await vscode.window.showWarningMessage(
        `The file "${fileName}" already exists. Do you want to overwrite it?`,
        { modal: true },
        'Yes', 'No'
    );

    return result === 'Yes';
}


export class CodeTemplate {
    // the user-friendly display name for a template is called a "select" in the CMSIS spec.
    public files: string[] = [];
    public instances: number = 1;
    public maxInstances: number = 1;
    public useIndex: boolean = false; // use index = 0  even if maxInstance is 1
    component: string;
    select: string;
    constructor(component: string,  select: string, instances: number, maxInstances: number) {
        this.component = component;
        this.select = select;
        this.instances = instances;
        this.maxInstances = maxInstances;
        this.useIndex = maxInstances > 1;
    }

    public async copy(destinationDir: string, index? : number) : Promise<string []> {
        if (!index && this.useIndex) {
            index = 0;
        }
        const indexSuffix = index !== undefined ? `_${index}` : '';
        const result : string[] = [];
        for (const file of this.files) {
            const dst = path.join(destinationDir, `${path.basename(file, path.extname(file))}${indexSuffix}${path.extname(file)}`);
            result.push(dst);
            if (await queryOverwriteIfExists(dst)) {
                copyTemplateFile(file, dst, index);
            }
        }
        return result;
    }

    public getDescription(index? : number) {
        if (!index && this.useIndex) {
            index = 0;
        }
        return this.useIndex ? `${this.select} [${index}]` : this.select;
    }
}

export const buildTemplatesFromCbuild = (csolution: CSolution | undefined, cmsisPackRoot: string): CodeTemplate[] => {
    if (!csolution) {
        return [];
    }

    const codeTemplates: CodeTemplate[] = [];

    // look for components in all available cbuild files
    for (const cbuildYml of csolution.cbuildYmlRoot) {
        const cbuild = cbuildYml[1].getChildItem();

        // get components from cbuild
        const cbuildComponents = cbuild?.getGrandChildren('components');
        if (cbuildComponents) {
            for (const cbuildComponent of cbuildComponents) {
                const templates = getTemplateFiles(cbuildComponent, cmsisPackRoot);
                codeTemplates.push(...templates);
            }
        }
    }
    return codeTemplates;
};

export function getTemplateFiles(cbuildComponent: ITreeItem<CTreeItem>, cmsisPackRoot: string): CodeTemplate[] {
    const codeTemplates = new Map<string, CodeTemplate>();
    const compFiles = cbuildComponent.getGrandChildren('files');
    const compInstancesRaw = cbuildComponent.getValue('instances') ?? '1';
    const compInstances = parseInt(compInstancesRaw, 10);
    const compInstancesInt = isNaN(compInstances) ? 1 : compInstances;
    const compMaxInstances = cbuildComponent.getValueAsString('maxInstances', compInstancesRaw);
    const compMaxInstancesInt = parseInt(compMaxInstances, 10);
    const basedir =  cbuildComponent.rootFileDir;
    if (compFiles) {
        for (const componentFile of compFiles) {
            if ('template' !== componentFile.getValue('attr')) {
                continue;
            }
            const select = componentFile.getValue('select') ?? '';
            const selectedBy = cbuildComponent.getValueAsString('selected-by') ?? '';
            const selectID = select + selectedBy;
            const file = componentFile.getValue('file');
            let codeTemplate = codeTemplates.get(selectID);
            if (!codeTemplate) {
                codeTemplate = new CodeTemplate(selectedBy, select, compInstancesInt, compMaxInstancesInt);
                codeTemplates.set(selectID, codeTemplate);
            }
            if (file) {
                const filePath = path.resolve(basedir, file.replace('${CMSIS_PACK_ROOT}', cmsisPackRoot));
                // check if file has %Instance%
                if (!codeTemplate.useIndex && checkTemplateFile(filePath)) {
                    codeTemplate.useIndex = true;
                }

                codeTemplate.files.push(filePath);
            }
        }
    }
    return Array.from(codeTemplates.values());
}
