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

import { Disposable } from 'vscode';
import { CsolutionApiV2, CsolutionApiV3 } from '../../api/csolution';
import type { SolutionManager } from '../solutions/solution-manager';
import type { ToolsEnvironment } from '../solutions/tools-environment';

export class CsolutionApiV3Impl implements CsolutionApiV3 {
    constructor(
        private readonly existingApi: CsolutionApiV2 & Disposable,
        private readonly solutionManager: Pick<SolutionManager, 'loadState'>,
        private readonly toolsEnvironment: Pick<ToolsEnvironment, 'getToolsEnvironment'>,
    ) {}

    public getToolsEnvironment(): Promise<string> {
        const state = this.solutionManager.loadState;
        return this.toolsEnvironment.getToolsEnvironment(state.loaded ? state.solutionPath : undefined);
    }

    public dispose() {
        this.existingApi.dispose();
    }

    public getBoards(...args: Parameters<CsolutionApiV2['getBoards']>) {
        return this.existingApi.getBoards(...args);
    }

    public getDevices(...args: Parameters<CsolutionApiV2['getDevices']>) {
        return this.existingApi.getDevices(...args);
    }

    public getDraftProjects(...args: Parameters<CsolutionApiV2['getDraftProjects']>) {
        return this.existingApi.getDraftProjects(...args);
    }

    public createNewSolution(...args: Parameters<CsolutionApiV2['createNewSolution']>) {
        return this.existingApi.createNewSolution(...args);
    }

    public build(...args: Parameters<CsolutionApiV2['build']>) {
        return this.existingApi.build(...args);
    }
}
