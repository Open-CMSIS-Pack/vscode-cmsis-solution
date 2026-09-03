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

import { CTreeItem, ETreeItemKind } from '@open-cmsis-pack/cmsis-common/tree-item';
import { CProjectYamlFile } from '../../../solutions/files/cproject-yaml-file';
import { COutlineItem } from './solution-outline-item';
import { ProjectItemsBuilder } from './solution-outline-project-items';

describe('ProjectItemsBuilder', () => {
    it('renders generated groups for a read-only CMake project', () => {
        const cproject = new CProjectYamlFile();
        cproject.readOnly = true;
        cproject.projectType = 'CMake';
        cproject.ensureTopItem('project');

        const cbuild = new CTreeItem('build');
        const groups = cbuild.createChild('groups');
        groups.setKind(ETreeItemKind.Sequence);
        groups.createChild('-').setValue('group', 'Generated Sources');
        const projectItem = new COutlineItem('project');

        new ProjectItemsBuilder().addProjectChildren(undefined, projectItem, cproject, cbuild);

        expect(projectItem.getChildren().map(child => child.getAttribute('label'))).toEqual(['Generated Sources']);
    });

    it('does not render synthetic project contents before generated build data exists', () => {
        const cproject = new CProjectYamlFile();
        cproject.readOnly = true;
        cproject.projectType = 'CMake';
        const project = cproject.ensureTopItem('project');
        const groups = project.createChild('groups');
        groups.setKind(ETreeItemKind.Sequence);
        groups.createChild('-').setValue('group', 'Synthetic Group');
        const projectItem = new COutlineItem('project');

        new ProjectItemsBuilder().addProjectChildren(undefined, projectItem, cproject);

        expect(projectItem.getChildren()).toHaveLength(0);
    });
});
