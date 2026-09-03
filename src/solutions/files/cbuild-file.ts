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

import { constructor } from '@open-cmsis-pack/cmsis-common/constructor';
import { CTreeItemYamlFile, ITreeItemFile } from '@open-cmsis-pack/cmsis-common/tree-item-file';
import { CTreeItem, ITreeItem } from '@open-cmsis-pack/cmsis-common/tree-item';
import path from 'node:path';
import { expandRootVars } from '../../utils/path-utils';
import { getVirtualProjectDescriptor } from './virtual-project';

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

    /**
     * Returns code-related files used by this build as normalized absolute paths.
     */
    getSourceFiles(): string[];
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
        }

        const solution = this.topItem?.getValueAsString('solution');
        const defaultCmakeSource = solution ? path.dirname(solution) : '';
        const virtualProject = getVirtualProjectDescriptor(this.topItem, defaultCmakeSource);
        return virtualProject ? this.resolvePath(virtualProject.project) : undefined;
    }

    public getSourceFiles(): string[] {
        const sourceFiles: string[] = [];
        const build = this.topItem;
        if (!build) {
            return sourceFiles;
        }

        this.collectGroupFiles(build, sourceFiles);
        this.collectContainerFiles(build, 'components', sourceFiles);
        this.collectContainerFiles(build, 'apis', sourceFiles);

        const linker = build.getChild('linker');
        for (const key of ['script', 'regions']) {
            const fileName = linker?.getValueAsString(key);
            if (fileName) {
                sourceFiles.push(this.resolveSourcePath(fileName));
            }
        }

        return sourceFiles;
    }

    private collectGroupFiles(parent: ITreeItem<CTreeItem>, sourceFiles: string[]): void {
        for (const group of parent.getGrandChildren('groups')) {
            this.collectFiles(group, sourceFiles);
            this.collectGroupFiles(group, sourceFiles);
        }
    }

    private collectContainerFiles(parent: ITreeItem<CTreeItem>, container: string, sourceFiles: string[]): void {
        for (const item of parent.getGrandChildren(container)) {
            this.collectFiles(item, sourceFiles);
        }
    }

    private collectFiles(parent: ITreeItem<CTreeItem>, sourceFiles: string[]): void {
        for (const file of parent.getGrandChildren('files')) {
            const category = file.getValue('category');
            if (file.getValue('attr') === 'template' || category === 'include' || category === 'doc' || category === 'other') {
                continue;
            }
            const fileName = file.getValue('file');
            if (fileName) {
                sourceFiles.push(this.resolveSourcePath(fileName));
            }
        }
    }

    private resolveSourcePath(fileName: string): string {
        return this.resolvePath(expandRootVars(fileName));
    }
}

export const CbuildFile = constructor<typeof CbuildFileImpl, CbuildFile>(CbuildFileImpl);


