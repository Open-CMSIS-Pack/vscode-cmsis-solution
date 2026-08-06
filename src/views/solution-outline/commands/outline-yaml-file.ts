/**
 * Copyright 2026 Arm Limited
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

import { CTreeItem } from '@open-cmsis-pack/cmsis-common/tree-item';
import { ITreeItemFile } from '@open-cmsis-pack/cmsis-common/tree-item-file';
import { ETextFileResult } from '@open-cmsis-pack/cmsis-common/text-file';
import { SolutionManager } from '../../../solutions/solution-manager';
import { COutlineItem } from '../tree-structure/solution-outline-item';

export const getOutlineYamlFile = (
    solutionManager: Pick<SolutionManager, 'getCsolution'>,
    node: COutlineItem,
): ITreeItemFile => {
    const csolution = solutionManager.getCsolution();
    if (!csolution) {
        throw new Error('No solution is loaded');
    }

    const layerPath = node.getAttribute('layerUri');
    const projectPath = node.getAttribute('projectUri') ?? node.getAttribute('resourcePath');
    const yamlFile = layerPath
        ? csolution.getClayerYamlFile(layerPath)
        : csolution.getCproject(projectPath);

    if (!yamlFile) {
        throw new Error(`Unable to find loaded YAML file '${layerPath ?? projectPath ?? ''}'`);
    }
    if (!yamlFile.topItem) {
        throw new Error(`Loaded YAML file '${yamlFile.fileName}' has no top item`);
    }
    return yamlFile;
};

export const mutateAndSaveOutlineYamlFile = async (
    solutionManager: Pick<SolutionManager, 'getCsolution'>,
    node: COutlineItem,
    mutate: (topItem: CTreeItem) => boolean,
): Promise<boolean> => {
    const yamlFile = getOutlineYamlFile(solutionManager, node);
    const topItem = yamlFile.topItem;
    if (!topItem || !mutate(topItem)) {
        return false;
    }

    const saveResult = await yamlFile.save();
    if (saveResult === ETextFileResult.Success || saveResult === ETextFileResult.Unchanged) {
        return true;
    }

    await yamlFile.load();
    throw new Error(`Failed to save '${yamlFile.fileName}'`);
};
