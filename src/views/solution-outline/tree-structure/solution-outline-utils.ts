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

import { COutlineItem } from './solution-outline-item';
import * as manifest from '../../../manifest';
import * as fs from 'fs';
import { CTreeItem, ITreeItem } from '../../../generic/tree-item';
import path from 'path';

export function setContextMenuAttributes(item: COutlineItem, fileUri: string, rootFileName: string, topTag?: string): void {
    item.setAttribute('fileUri', fileUri);
    item.setAttribute('projectUri', rootFileName);
    if (topTag === 'layer') {
        item.setAttribute('layerUri', rootFileName);
    }
}

export function setHeaderContext(node: COutlineItem): void {
    node.addFeature(`${manifest.HEADER_CONTEXT}`);
    node.setAttribute('header', node.getAttribute('label'));
}

export function setDocContext(node: COutlineItem): void {
    node.addFeature(`${manifest.DOC_CONTEXT}`);
    node.setAttribute('type', 'docFile');
}

export function setMergeFileContext(node: COutlineItem): void {
    node.addFeature(`${manifest.MERGE_FILE_CONTEXT}`);
}

export function setMergeFiles(component: COutlineItem, file: ITreeItem<CTreeItem>): void {
    const localPath = file.getValue('local');
    const updatePath = file.getValue('update');
    const basePath = file.getValue('base');

    component.setAttribute('local', localPath);
    component.setAttribute('update', updatePath);
    component.setAttribute('base', basePath);
}

export function getStatusTooltip(label: string, status: string): string | undefined {
    switch (status) {
        case 'update suggested':
            return `- (?) '${label}' has corrections. A file update is suggested.`;
        case 'update recommended':
            return `- (!) '${label}' has new features. A file update is recommended.`;
        case 'update required':
            return `- (X) '${label}' is incompatible. A file update is mandatory.`;
        default:
            return undefined;
    }
}

export function setLinkerContext(node: COutlineItem, mapFilePath: string): void {
    node.addFeature(`${manifest.LINKER_CONTEXT}`);
    node.setAttribute('type', 'linkerMapFile');
    node.setAttribute('resourcePath', mapFilePath);
}

export function getMapFilePath(cbuild: CTreeItem): string | undefined {
    const outDirPath = getOutdirPath(cbuild);
    if (!outDirPath || !fs.existsSync(outDirPath)) {
        return undefined;
    }

    const output = cbuild.getChild('output');
    const mapFile = findMapFile(output);

    return mapFile ? path.join(outDirPath, mapFile) : findFirstMapFile(outDirPath);
}

export function setMergeDescription(node: COutlineItem, fileStatus: string): void {
    const desc = getMergeStatusSymbol(fileStatus);
    if (desc !== undefined) {
        node.setAttribute('description', desc);
    }
}

export function setMergeUpdate(node: COutlineItem, fileStatus: string): void {
    const update = getMergeStatusSymbol(fileStatus);
    if (update !== undefined) {
        node.setAttribute('update', update);
    }
}

function getOutdirPath(cbuild: CTreeItem): string | undefined {
    const outputDirs = cbuild.getChild('output-dirs');
    const outdir = outputDirs?.getValue('outdir');
    return outdir ? cbuild.resolvePath(outdir) : undefined;
}

function findMapFile(outputNode: ITreeItem<CTreeItem> | undefined): string | undefined {
    if (!outputNode) {
        return undefined;
    }

    const children = outputNode.getChildren();
    for (const item of children) {
        const type = item.getValue('type');
        if (type === 'map') {
            return item.getValue('file');
        }
    }
    return undefined;
}

function findFirstMapFile(dirPath: string): string | undefined {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        if (file.endsWith('.map')) {
            return path.join(dirPath, file);
        }
    }
    return undefined;
}

function getMergeStatusSymbol(fileStatus: string): string | undefined {
    switch (fileStatus) {
        case 'update required':
            return '(X)';
        case 'update recommended':
            return '(!)';
        case 'update suggested':
            return '(?)';
        default:
            return undefined;
    }
}
