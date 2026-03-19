/**
 * Copyright 2023-2026 Arm Limited
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

import 'jest';
import { reconcileSolutionFiles } from './solution-file-reconciler';
import { MockWorkspaceFsProvider, workspaceFsProviderFactory } from '../../vscode-api/workspace-fs-provider.factories';
import { SolutionData } from '../../core-tools/client/solutions_pb';

const projectPath = '/project/path';

describe('reconcileSolutionFiles', () => {
    let loadSolutionFiles: jest.Mock;
    let reconcileSolutionDocument: jest.Mock;
    let reconcileProjectDocument: jest.Mock;
    let workspaceFsProvider: MockWorkspaceFsProvider;

    beforeEach(() => {
        loadSolutionFiles = jest.fn();
        reconcileSolutionDocument = jest.fn();
        reconcileProjectDocument = jest.fn();
        workspaceFsProvider = workspaceFsProviderFactory();

        loadSolutionFiles.mockResolvedValue({
            solution: { file: { path: '/solution/path' }, cloneYamlDocument: () => ({ toString: () => 'solution YAML' }) },
            projects: [
                { file: { path: projectPath }, cloneYamlDocument: () => ({ toString: () => 'project YAML' }) },
            ],
        });
    });

    it('does not update files if there are no changes', async () => {
        reconcileProjectDocument.mockReturnValue(false);
        reconcileSolutionDocument.mockReturnValue(false);

        const solutionData = {
            packsList: [],
            projectsList: [{ id: { id: projectPath } }],
        };

        await reconcileSolutionFiles(
            workspaceFsProvider,
            '/path/to/solution.csolution',
            [],
            solutionData as unknown as SolutionData.AsObject,
            loadSolutionFiles,
            reconcileSolutionDocument,
            reconcileProjectDocument
        );

        expect(workspaceFsProvider.writeUtf8File).not.toHaveBeenCalled();
    });

    it('updates files if there are changes', async () => {
        reconcileProjectDocument.mockReturnValue(true);
        reconcileSolutionDocument.mockReturnValue(true);

        const solutionData = {
            packsList: [],
            projectsList: [{ id: { id: projectPath } }],
        };

        await reconcileSolutionFiles(
            workspaceFsProvider,
            '/path/to/solution.csolution',
            [],
            solutionData as unknown as SolutionData.AsObject,
            loadSolutionFiles,
            reconcileSolutionDocument,
            reconcileProjectDocument
        );

        expect(workspaceFsProvider.writeUtf8File).toHaveBeenCalledWith(expect.anything(), 'solution YAML');
        expect(workspaceFsProvider.writeUtf8File).toHaveBeenCalledWith(expect.anything(), 'project YAML');
    });
});
