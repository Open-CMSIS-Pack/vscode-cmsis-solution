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

import * as vscode from 'vscode';
import { createLocalDefinitionFromUriOrSolutionNode } from './build-task-definition';
import { COutlineItem } from '../../views/solution-outline/tree-structure/solution-outline-item';

describe('createLocalDefinitionFromUriOrSolutionNode', () => {
    it('builds the local definition from URI', () => {
        const uri = vscode.Uri.file('/path/to/my-solution.csolution.yml');

        const taskDefinition = createLocalDefinitionFromUriOrSolutionNode(uri, uri.fsPath);

        expect(taskDefinition).toEqual({
            type: 'cmsis-csolution.build',
            solution: uri.fsPath,
            schemaCheck: false,
        });
    });

    it('throws an error if trying to build a URI that is not of type *.csolution.yml', () => {
        const uri = vscode.Uri.file('/path/to/invalid-file.txt');

        const createDefinition = () => createLocalDefinitionFromUriOrSolutionNode(uri, '');

        expect(createDefinition).toThrow(`Building ${uri.fsPath} is not supported`);
    });

    it('builds the local definition from solution node', () => {
        const projectPath = 'path/to/my-project.cproject.yml';
        const solutionPath = 'path/to/my-solution.csolution.yml';

        const cprojectItem = new COutlineItem('project');
        cprojectItem.setAttribute('label', 'my-project');
        cprojectItem.setAttribute('expandable', '2');
        cprojectItem.setAttribute('type', 'projectFile');
        cprojectItem.setAttribute('resourcePath', projectPath);

        const taskDefinition = createLocalDefinitionFromUriOrSolutionNode(cprojectItem, solutionPath);

        expect(taskDefinition).toEqual({
            type: 'cmsis-csolution.build',
            solution: solutionPath,
            schemaCheck: false,
        });
    });

    it('builds the default local definition', () => {
        const solutionPath = 'path/to/my-solution.csolution.yml';
        const taskDefinition = createLocalDefinitionFromUriOrSolutionNode(undefined, solutionPath);

        expect(taskDefinition).toEqual({
            type: 'cmsis-csolution.build',
            solution: solutionPath,
            schemaCheck: false,
        });
        // also if a node of non-project type is selected
        const cgroupItem = new COutlineItem('group');
        cgroupItem.setAttribute('label', 'my-project');
        cgroupItem.setAttribute('expandable', '2');
        cgroupItem.setAttribute('type', 'group');
        cgroupItem.setAttribute('groupPath', 'group-path');
        cgroupItem.setAttribute('projectUri', 'project-uri');
        cgroupItem.setAttribute('layerUri', 'project-uri');

        const taskDefinition1 = createLocalDefinitionFromUriOrSolutionNode(cgroupItem, solutionPath);
        expect(taskDefinition1).toEqual(taskDefinition);

    });
});
