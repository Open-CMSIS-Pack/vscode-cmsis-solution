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

import { CTreeItemYamlFile } from '@open-cmsis-pack/cmsis-common/tree-item-file';
import { ETextFileResult } from '@open-cmsis-pack/cmsis-common/text-file';
import path from 'node:path';
import { CSolution } from '../../../solutions/csolution';
import { CProjectYamlFile } from '../../../solutions/files/cproject-yaml-file';
import { SolutionManager } from '../../../solutions/solution-manager';
import { COutlineItem } from '../tree-structure/solution-outline-item';
import { getOutlineYamlFile, mutateAndSaveOutlineYamlFile } from './outline-yaml-file';

const projectPath = path.resolve('project', 'test.cproject.yml');
const layerPath = path.resolve('layers', 'test.clayer.yml');

const fixture = () => {
    const projectFile = new CProjectYamlFile(projectPath);
    projectFile.ensureTopItem();
    const layerFile = new CTreeItemYamlFile(layerPath);
    layerFile.ensureTopItem();
    const csolution = {
        getCproject: jest.fn(() => projectFile),
        getClayerYamlFile: jest.fn(() => layerFile),
    } as unknown as CSolution;
    const solutionManager = {
        getCsolution: jest.fn(() => csolution),
    } as Pick<SolutionManager, 'getCsolution'>;
    const node = new COutlineItem('group');
    node.setAttribute('projectUri', projectPath);
    return { csolution, layerFile, node, projectFile, solutionManager };
};

describe('outline YAML file persistence', () => {
    it('resolves the loaded project wrapper', () => {
        const { csolution, node, projectFile, solutionManager } = fixture();

        expect(getOutlineYamlFile(solutionManager, node)).toBe(projectFile);
        expect(csolution.getCproject).toHaveBeenCalledWith(projectPath);
    });

    it('gives a loaded layer wrapper precedence over the project wrapper', () => {
        const { csolution, layerFile, node, solutionManager } = fixture();
        node.setAttribute('layerUri', layerPath);

        expect(getOutlineYamlFile(solutionManager, node)).toBe(layerFile);
        expect(csolution.getClayerYamlFile).toHaveBeenCalledWith(layerPath);
        expect(csolution.getCproject).not.toHaveBeenCalled();
    });

    it('does not save when the mutation makes no change', async () => {
        const { node, projectFile, solutionManager } = fixture();
        const save = jest.spyOn(projectFile, 'save');

        await expect(mutateAndSaveOutlineYamlFile(solutionManager, node, () => false)).resolves.toBe(false);
        expect(save).not.toHaveBeenCalled();
    });

    it.each([ETextFileResult.Success, ETextFileResult.Unchanged])(
        'accepts save result %s without reloading',
        async saveResult => {
            const { node, projectFile, solutionManager } = fixture();
            const save = jest.spyOn(projectFile, 'save').mockResolvedValue(saveResult);
            const load = jest.spyOn(projectFile, 'load');

            await expect(mutateAndSaveOutlineYamlFile(solutionManager, node, () => true)).resolves.toBe(true);
            expect(save).toHaveBeenCalledTimes(1);
            expect(load).not.toHaveBeenCalled();
        },
    );

    it('reloads the same wrapper and rejects when saving fails', async () => {
        const { node, projectFile, solutionManager } = fixture();
        jest.spyOn(projectFile, 'save').mockResolvedValue(ETextFileResult.Error);
        const load = jest.spyOn(projectFile, 'load').mockResolvedValue(ETextFileResult.Success);

        await expect(mutateAndSaveOutlineYamlFile(solutionManager, node, () => true))
            .rejects.toThrow(`Failed to save '${projectFile.fileName}'`);
        expect(load).toHaveBeenCalledTimes(1);
    });
});