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

import path from 'path';
import { CTreeItem, ITreeItem } from '../../../generic/tree-item';
import { buildDocFilePath } from '../../../util';
import { FileItemBuilder } from './solution-outline-file-item';
import { COutlineItem } from './solution-outline-item';
import * as manifest from '../../../manifest';
import { CSolution } from '../../../solutions/csolution';
import { getMapFilePath, setDocContext, setHeaderContext, setLinkerContext } from './solution-outline-utils';
import { CProjectYamlFile } from '../../../solutions/files/cproject-yaml-file';
import { SolutionOutlineItemBuilder } from './solution-outline-item-builder';

export class ProjectItemsBuilder extends SolutionOutlineItemBuilder {
    private readonly _lastPrioritizedComponentList: COutlineItem[] = [];

    public get lastPrioritizedComponentList(): COutlineItem[] {
        return this._lastPrioritizedComponentList;
    }
    public addProjectChildren(csolution: CSolution | undefined, cprojectItem: COutlineItem, cprojectFile: CProjectYamlFile, cbuild?: CTreeItem): void {
        this.csolution = csolution;
        // Get context from cbuild (contains full context: PROJECT.BUILD-TYPE+TARGET-TYPE)
        // Falls back to actionContext if cbuild is not available
        this.context = cbuild?.getValueAsString('context') ?? csolution?.actionContext;
        const cproject = cprojectFile.topItem;
        if (!cproject) {
            return;
        }
        if (cbuild && cprojectFile.projectType === 'West') {
            this.createGroupTree(cprojectItem, cbuild, '');
            return; // there is nothing else available for West for now
        }
        this.createGroupTree(cprojectItem, cproject, '');

        if (cbuild) {
            this.addGroup(cprojectItem, cbuild.getChild('constructed-files'));
            this.addGroup(cprojectItem, cbuild.getChild('linker'), undefined, getMapFilePath(cbuild));
        }

        this.createComponentTree(cprojectItem, cproject, cbuild);
        this.createLayerNodes(cprojectItem, cbuild);
    }

    // groups node
    private createGroupTree(cprojectItem: COutlineItem, groupParent: CTreeItem, parentGroupPath: string) {
        groupParent.getGrandChildren('groups').map(group => {
            this.addGroup(cprojectItem, group, parentGroupPath);
        });
        cprojectItem.sortChildrenByLabel();
    }

    private addGroup(cprojectItem: COutlineItem, group?: ITreeItem<CTreeItem>, parentGroupPath?: string, mapFilePath?: string) {
        if (group) {
            this.createGroupNode(cprojectItem, group as CTreeItem, parentGroupPath ?? '', mapFilePath);
        }
    }

    private createGroupNode(cprojectItem: COutlineItem, group: CTreeItem, parentGroupPath: string, mapFilePath?: string) {
        const topTag = group.getRoot()?.getChild()?.getTag() ?? '';

        const cgroupItem = this.createGroupTreeItem(cprojectItem, group, parentGroupPath, topTag, mapFilePath);

        this.createGroupChildren(cgroupItem, group, topTag);

        this.setExpandableAttribute(cgroupItem);
    }

    private createGroupTreeItem(cprojectItem: COutlineItem, group: CTreeItem, parentGroupPath: string, topTag: string, mapFilePath?: string): COutlineItem {
        const tag = group.getTag() ?? '';
        const rootFileName = group.rootFileName;
        const mutable = topTag === 'project' || topTag === 'layer';

        const isRegularGroup = mutable && (!tag || tag === '-');
        const name = group.getValue('group') ?? tag;
        const groupPath = this.buildGroupPath(parentGroupPath, name);
        const cgroupItem = this.createGroupItem(cprojectItem, name, mutable);

        if (isRegularGroup) {
            this.setRegularGroupAttributes(cgroupItem as COutlineItem, groupPath, rootFileName, topTag);
        }

        // add map file to 'linker' group
        if (mapFilePath) {
            setLinkerContext(cgroupItem, mapFilePath);
        }

        return cgroupItem;
    }

    private buildGroupPath(parentGroupPath: string, name: string): string {
        if (parentGroupPath.length > 0) {
            return parentGroupPath + ';' + name;
        }
        return name;
    }

    private createGroupItem(cprojectItem: COutlineItem, name: string, mutable: boolean): COutlineItem {
        const cgroupItem = cprojectItem.createChild('group');
        cgroupItem.setAttribute('label', name);
        cgroupItem.setAttribute('iconPath', 'csolution-files');
        if (mutable) {
            cgroupItem.addFeature('group');
            cgroupItem.mutable = mutable;
        }
        return cgroupItem;
    }

    private setRegularGroupAttributes(cgroupItem: COutlineItem, groupPath: string, rootFileName: string, topTag: string): void {
        cgroupItem.setAttribute('type', 'group');
        cgroupItem.setAttribute('groupPath', groupPath);
        cgroupItem.setAttribute('projectUri', rootFileName);

        if (topTag === 'layer') {
            cgroupItem.setAttribute('layerUri', rootFileName);
        }
    }

    private createGroupChildren(cgroupItem: COutlineItem, group: CTreeItem, topTag: string): void {
        const isRegularGroup = !group.getTag() || group.getTag() === '-';
        const fileTreeItem = new FileItemBuilder(this.csolution, this.rpcData, this.context, topTag);

        if (isRegularGroup) {
            this.createGroupTree(cgroupItem, group, cgroupItem.getAttribute('groupPath') ?? '');
            fileTreeItem.createFileNodes(cgroupItem, group.getGrandChildren('files'), undefined, undefined, true);
        } else {
            fileTreeItem.createFileNodes(cgroupItem, group.getChildren());
        }
    }

    private setExpandableAttribute(cgroupItem: COutlineItem): void {
        const children = cgroupItem.getChildren();
        const topTag = cgroupItem.getRoot()?.getChild()?.getTag() ?? '';
        const editable = (topTag === 'project' || topTag === 'layer');
        const expandable = editable ? '2' : '1';

        cgroupItem.setAttribute('expandable', children.length > 0 ? expandable : '0');
    }

    // layers node
    private createLayerNodes(cprojectItem: COutlineItem, cbuild?: CTreeItem) {
        const clayers = cbuild?.getRoot().getProperty('clayers') as CTreeItem[];
        if (cbuild && clayers) {
            this.processLayerNodes(cprojectItem, clayers, cbuild);
        }
    }

    private processLayerNodes(cprojectItem: COutlineItem, clayers: CTreeItem[], cbuild: CTreeItem): void {
        for (const clayer of clayers as CTreeItem[]) {
            if (!clayer.rootFileName.endsWith('.clayer.yml')) {
                continue; // skip generator files
            }
            this.createLayerNode(cprojectItem, clayer.getChildItem(), cbuild);
        }
    }

    private createLayerNode(node: COutlineItem, clayer?: CTreeItem, cbuild?: CTreeItem, idGenerator?: string) {
        if (!clayer) {
            return undefined;
        }

        const absolutePath = clayer.rootFileName;
        const tag = clayer.getTag() ?? '';
        const noType = tag === 'generator-import' ? idGenerator + ' generated' : 'Layer: ' + path.basename(absolutePath);
        const type = clayer.getValue('type');
        const label = type ? 'Layer Type: ' + type : noType;

        // create layer
        const clayerItem = node.createChild('layer');
        clayerItem.setAttribute('label', label);
        clayerItem.setAttribute('expandable', '1');
        clayerItem.addFeature(`${manifest.LAYER_CONTEXT}`);
        clayerItem.setAttribute('type', 'layerFile');
        clayerItem.setAttribute('resourcePath', absolutePath);
        clayerItem.setAttribute('iconPath', 'csolution-layer');
        clayerItem.setAttribute('tooltip', '- File: ` ' + absolutePath + ' `');

        // create children
        this.createGroupTree(clayerItem as COutlineItem, clayer, '');
        if (this.createComponentTree(clayerItem as COutlineItem, clayer, cbuild)) {
            clayerItem.addFeature('components');
        }
    }

    // components node
    private createComponentTree(cprojectItem: COutlineItem, cproject: CTreeItem, cbuild?: CTreeItem) {
        const componentsContainer = cproject.getChild('components');
        if (!componentsContainer) {
            return false;
        }

        const children = componentsContainer.getChildren();
        const size = children.length;

        const componentsItem = cprojectItem.createChild('components');

        componentsItem.setAttribute('label', 'Components' + ` (${size})`);
        componentsItem.setAttribute('expandable', size > 0 ? '1' : '0');
        componentsItem.setAttribute('iconPath', 'csolution-components');
        componentsItem.setAttribute('type', 'components');
        componentsItem.addFeature('components');

        // create components from project
        const topTag = cproject.getRoot()?.getChild()?.getTag() ?? '';
        const componentNodes = this.createComponentNodes(componentsItem as COutlineItem, children, topTag, cproject.rootFileName);

        if (cbuild) {
            this.addComponentDataFromCbuild(componentNodes, cbuild);
        }

        this.addComponentOptions(componentNodes);
        return true; // do have components to edit
    }

    private addComponentOptions(componentNodes: Map<string, COutlineItem>) {
        const components = componentNodes.values();

        for (const component of components) {
            // add copy header (if it applies) to component nodes
            const header = this.getHeaderFile(component);
            // set context
            if (header) {
                setHeaderContext(component);
                const label = header.getAttribute('label');
                component.setAttribute('header', label);
            }
        }
    }

    private getHeaderFile(component: COutlineItem): COutlineItem | undefined {
        // look for api files and header files
        for (const child of component.getChildren()) {
            const fileName = child.getAttribute('label');
            if (fileName?.endsWith('.h')) {
                return child as COutlineItem;
            }
        }
        return undefined;
    }

    private createComponentNodes(componentsItem: COutlineItem, projectComponents: ITreeItem<CTreeItem>[], topTag: string, rootFileName: string): Map<string, COutlineItem> {
        const componentNodes = new Map<string, COutlineItem>();
        const editable = topTag === 'project' || topTag === 'layer';

        for (const component of projectComponents) {
            const refId = component.getValue();
            if (!refId) {
                continue;
            }

            // create child
            const componentItem = componentsItem.createChild('component');
            componentItem.setAttribute('label', refId);
            componentItem.setAttribute('expandable', '0');
            componentItem.setAttribute('iconPath', 'csolution-software-component');
            if (editable) {
                componentItem.addFeature('component');
                componentItem.setAttribute('projectUri', topTag === 'project' ? rootFileName : undefined);
                componentItem.setAttribute('layerUri', topTag === 'layer' ? rootFileName : undefined);
            }

            componentNodes.set(refId, componentItem as COutlineItem);
        }
        return componentNodes;
    }

    private addComponentDataFromCbuild(componentNodes: Map<string, COutlineItem>, cbuild: CTreeItem) {
        const apis = cbuild.getChild('apis');

        // look for components
        for (const component of cbuild.getGrandChildren('components')) {
            const refId = component.getValueAsString('selected-by');
            const node = componentNodes.get(refId);
            if (!node) {
                continue;
            }

            // look for api
            const api = component.getValueAsString('implements');
            if (api) {
                const apiChild = apis?.getChildByValue('api', api);
                this.addApiData(apiChild, node);
            }

            this.addComponentData(node, component, cbuild);
        }
    }

    private addApiData(apiChild: ITreeItem<CTreeItem> | undefined, node: COutlineItem) {
        if (apiChild == undefined) {
            return;
        }

        const docs: ITreeItem<CTreeItem>[] = [];
        const apiFiles = apiChild.getGrandChildren('files');

        const fileTreeItem = new FileItemBuilder(this.csolution, this.rpcData, this.context);
        fileTreeItem.createFileNodes(node, apiFiles, docs, true);

        const fileNodes = node.getChildren();
        for (const fileNode of fileNodes) {
            this.addDocFile(fileNode as COutlineItem, docs?.[0]);
        }
    }

    private addComponentData(node: COutlineItem, component: ITreeItem<CTreeItem>, cbuild: CTreeItem) {
        // add files
        const docs: ITreeItem<CTreeItem>[] = [];
        const fileTreeItem = new FileItemBuilder(this.csolution, this.rpcData, this.context);
        const componentFiles = component.getGrandChildren('files');
        fileTreeItem.createFileNodes(node, componentFiles, docs);

        // add doc file
        if (docs.length > 0) {
            this.addDocFile(node, docs[0]);
        }

        // create generator import if available
        this.addGenerator(node, component, cbuild);

        const children = node.getChildren();
        node.setAttribute('expandable', children.length > 0 ? '1' : '0');
    }

    private addDocFile(node: COutlineItem, docFile?: ITreeItem<CTreeItem>) {
        const filePath = buildDocFilePath(docFile);
        if (!filePath) {
            return;
        }
        setDocContext(node);
        node.setAttribute('docPath', filePath);
    }

    private addGenerator(node: COutlineItem, component: ITreeItem<CTreeItem>, cbuild: CTreeItem) {
        const generator = component.getChild('generator');
        let tooltip =
            '- component: ` ' + component.getValueAsString('component') + ' `\n' +
            '- from pack: ` ' + component.getValueAsString('from-pack') + ' `';

        if (generator) {
            const id = generator.getValueAsString('id');
            node.addFeature('component-gen');
            node.setAttribute('type', 'component-gen');
            node.setAttribute('generator', id);
            node.setAttribute('cbuild-context', cbuild.getValue('context'));

            tooltip += '\n' + '- generator: ` ' + id + ' `';
            const fileName = component.resolvePath(generator.getValueAsString('path'));
            const cgenYml = this.csolution?.getClayer(fileName);

            this.createLayerNode(node, cgenYml?.getChildItem(), cbuild, id);
        }
        node.setAttribute('tooltip', tooltip);
    }

}
