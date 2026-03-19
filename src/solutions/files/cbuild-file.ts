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

import { constructor } from '../../generic/constructor';
import { CTreeItemYamlFile, ITreeItemFile } from '../../generic/tree-item-file';
import { getFileNameNoExt } from '../../utils/path-utils';
import { PROJECT_WEST_SUFFIX } from '../constants';

/**
 * Access a <context>.cbuild.yml file
 */
export interface CbuildFile extends ITreeItemFile {
    /**
     * Access build/compiler, defaults to AC6
     */
    get compiler(): string;

    /**
     * Access build/output-dirs/outdir resolved to enclosing file directory.
     * Fallback to file's base directory if outdir is not set.
     */
    get outDir(): string;

    /**
     * Returns absolute path to associated project or undefined
     */
    get projectPath(): string | undefined;
}

class CbuildFileImpl extends CTreeItemYamlFile implements CbuildFile {
    constructor(fileName: string) {
        super(fileName);
        this.readOnly = true;
    }

    public get compiler() {
        return this.topItem?.getValueAsString('compiler') ?? 'AC6';
    }

    public get outDir() {
        const outdir = this.topItem?.findChild(['output-dirs', 'outdir']);
        return this.resolvePath(outdir?.getValue() ?? '.');
    }

    public get projectPath(): string | undefined {
        const project = this.topItem?.getValue('project');
        if (project) {
            return this.resolvePath(project);
        } else {
            const west = this.topItem?.getChild('west');
            if (west) {
                const projPath = west.getChild('app-path')?.getValueAsString();
                if (projPath) {
                    let projId = west.getChild('project-id')?.getValueAsString();
                    if (!projId) {
                        projId = getFileNameNoExt(projPath);
                    }
                    return this.resolvePath(projPath + '/' + projId + PROJECT_WEST_SUFFIX);
                }
            }
        }
        return undefined;
    }
}

export const CbuildFile = constructor<typeof CbuildFileImpl, CbuildFile>(CbuildFileImpl);


