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
import semver from 'semver';

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

export function findMergeFiles(localPath: string): { update: string | undefined; base: string | undefined } {
    const dir = path.dirname(localPath);
    const fileName = path.basename(localPath);

    let fileNames: string[];
    try {
        fileNames = fs.readdirSync(dir);
    } catch {
        return { update: undefined, base: undefined };
    }

    const updatePrefix = `${fileName}.update@`;
    const basePrefix = `${fileName}.base@`;

    const updateMatches = fileNames.filter(name => name.startsWith(updatePrefix));
    const baseMatches = fileNames.filter(name => name.startsWith(basePrefix));

    const update = selectMergeSibling(updateMatches, updatePrefix);
    const base = selectMergeSibling(baseMatches, basePrefix);

    if (!update || !base) {
        return { update: undefined, base: undefined };
    }

    return {
        update: update ? path.join(dir, update) : undefined,
        base: base ? path.join(dir, base) : undefined,
    };
}

function selectMergeSibling(fileNames: string[], prefix: string): string | undefined {
    if (fileNames.length === 0) {
        return undefined;
    }

    // If multiple versions exist, pick the highest version suffix after '@'.
    return [...fileNames].sort((left, right) => {
        const leftVersion = left.slice(prefix.length);
        const rightVersion = right.slice(prefix.length);
        return semver.rcompare(leftVersion, rightVersion);
    })[0];
}

