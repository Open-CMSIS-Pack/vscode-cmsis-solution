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

import { COutlineItem } from './solution-outline-item';
import { CSolution } from '../../../solutions/csolution';
import path from 'path';
import * as fsUtils from '../../../utils/fs-utils';
import { CTreeItem } from '../../../generic/tree-item';
import * as manifest from '../../../manifest';
import { HardwareItem } from './solution-outline-hardware-item';
import { ProjectItemsBuilder } from './solution-outline-project-items';
import { getFileNameNoExt } from '../../../utils/path-utils';
import { setMergeDescription } from './solution-outline-utils';
import { CProjectYamlFile } from '../../../solutions/files/cproject-yaml-file';


export class SolutionOutlineTree {
    csolution?: CSolution;
    constructor() { }

    public createTree(csolution: CSolution | undefined): COutlineItem {
        this.csolution = csolution;
        const rootItem = new COutlineItem('solution');

        if (!csolution) {
            this.addLoadError(rootItem);
            return rootItem;
        }

        const treeNodeItems = csolution.cbuildYmlRoot.size > 0
            ? this.processBuildFiles(rootItem, csolution)
            : this.createProjectsFromCsolution(rootItem, csolution);

        if (treeNodeItems.length === 0) {
            this.addLoadError(rootItem);
        }

        this.addNodeItems(rootItem, treeNodeItems);
        return rootItem;
    }

    private addLoadError(rootItem: COutlineItem): void {
        this.createErrorNode(rootItem, 'Solution could not be loaded', 'Solution could not be loaded');
    }

    private createErrorNode(rootItem: COutlineItem, message: string, description: string): COutlineItem {
        const errorItem = new COutlineItem(message, rootItem);
        errorItem.setAttribute('iconPath', 'error');
        errorItem.setAttribute('description', description);
        rootItem.addChild(errorItem);
        return rootItem;
    }

    private createProjectsFromCsolution(rootItem: COutlineItem, csolution: CSolution): COutlineItem[] {
        const projectItems: COutlineItem[] = [];
        // no build files are available (yet)
        for (const cprojectYml of csolution.projects.values()) {
            if (cprojectYml) {
                projectItems.push(this.createProjectNode(rootItem, cprojectYml));
            }
        }
        COutlineItem.sortTreeNodesByLabel(projectItems);
        return projectItems;
    }

    private addNodeItems(rootItem: COutlineItem, treeNodeItems: COutlineItem[]): void {
        for (const item of treeNodeItems) {
            rootItem.addChild(item);
        }
    }

    private processBuildFiles(parent: COutlineItem, csolution: CSolution): COutlineItem[] {
        const hardwareTreeNode: Map<string, COutlineItem> = new Map();
        let treeNodes: COutlineItem[] = [];
        const projectsTreeNode: COutlineItem[] = [];

        for (const cbuildYml of csolution.cbuildYmlRoot) {
            const cbuild = cbuildYml[1].getChildItem();
            const cprojectYml = csolution.getCprojectForCbuild(cbuild, true);
            if (cprojectYml) {
                // add project nodes
                const projectTreeNode = this.createProjectNode(parent, cprojectYml, cbuild);
                projectsTreeNode.push(projectTreeNode);

                // add hardware nodes
                const hardwareTreeItem = new HardwareItem();
                const hardware = hardwareTreeItem.createHardwareNodes(csolution, cbuild);

                hardware.forEach((value, key) => {
                    hardwareTreeNode.set(key, value);
                });
            }
        }
        const hardwareTreeNodes = [...hardwareTreeNode.values()];
        COutlineItem.sortTreeNodesByLabel(projectsTreeNode);
        treeNodes = [...hardwareTreeNodes, ...projectsTreeNode];
        return treeNodes;
    }

    private createProjectNode(parent: COutlineItem, cprojectFile: CProjectYamlFile, cbuild?: CTreeItem): COutlineItem {
        const cproject = cprojectFile.topItem;
        const projectType = cprojectFile.projectType;
        const absolutePath = cproject?.rootFileName ?? '';
        const projectFile = path.basename(absolutePath);
        const projectName = getFileNameNoExt(projectFile);
        const context = cbuild?.getValueAsString('context');
        const project = context ? context : projectName;

        // create project node
        const cprojectItem = this.createProjectItem(parent, project, absolutePath, projectType);

        // add children
        if (cproject) {
            const projectItems = new ProjectItemsBuilder();
            projectItems.addProjectChildren(this.csolution, cprojectItem, cprojectFile, cbuild);

            // get prioritized component list and set merge description if available
            const prioritizedList = projectItems.lastPrioritizedComponentList;
            if (prioritizedList && prioritizedList.length > 0) {
                const fileStatus = prioritizedList[0].getAttribute('status');
                if (fileStatus) {
                    setMergeDescription(cprojectItem, fileStatus);

                    // set tooltip
                    const existingTooltip = cprojectItem.getAttribute('tooltip');
                    const description = cprojectItem.getAttribute('description');
                    const newTooltip = `- ${description} Component config files: ${fileStatus}`;

                    if (existingTooltip) {
                        cprojectItem.setAttribute('tooltip', existingTooltip + '\n' + newTooltip);
                    } else {
                        cprojectItem.setAttribute('tooltip', newTooltip);
                    }
                }
            }
        } else {
            cprojectItem.setAttribute('description', 'error loading project');
        }

        return cprojectItem;
    }

    private createProjectItem(parent: COutlineItem, project: string, absolutePath: string, projectType?: string): COutlineItem {
        const cprojectItem = new COutlineItem('project', parent);

        cprojectItem.setAttribute('label', project);
        cprojectItem.setAttribute('expandable', '2');
        cprojectItem.setAttribute('type', 'projectFile');
        cprojectItem.setAttribute('iconPath', 'file-submodule');
        cprojectItem.addFeature(`${manifest.PROJECT_CONTEXT}${absolutePath}`);
        cprojectItem.setAttribute('resourcePath', absolutePath);
        cprojectItem.setAttribute('projectUri', absolutePath);

        // Add West-specific features
        if (projectType === 'West') {
            // Check for prj.conf and set path
            const prjConfPath = this.findPrjConfPath(absolutePath);
            if (prjConfPath) {
                cprojectItem.setAttribute('prjConfPath', prjConfPath);
            }
        }

        if (projectType) {
            cprojectItem.setAttribute('description', `(${projectType})`);
            cprojectItem.setAttribute('tooltip', `- Project type: \` ${projectType} \``);
        } else {
            cprojectItem.setAttribute('tooltip', `- File: \` ${absolutePath} \``);
        }
        return cprojectItem;
    }

    private findPrjConfPath(projectPath: string): string | undefined {
        const appPath = path.dirname(projectPath);
        const prjConfPath = path.join(appPath, 'prj.conf');

        if (fsUtils.fileExists(prjConfPath)) {
            return prjConfPath;
        }
        return undefined;
    }
}
