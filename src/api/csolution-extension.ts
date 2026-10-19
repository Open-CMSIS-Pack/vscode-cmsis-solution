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

import { Disposable, ExtensionContext } from 'vscode';
import { CsolutionExtension, CsolutionApiV1, CsolutionApiV2, CsolutionApiV3 } from '../../api/csolution';
import { BuildTaskProvider } from '../tasks/build/build-task-provider';
import { SolutionCreator } from '../solutions/solution-creator';
import { CsolutionApiV2Impl } from './v2-api';
import { DataManager } from '../data-manager/data-manager';
import { CsolutionApiV3Impl } from './v3-api';
import type { SolutionManager } from '../solutions/solution-manager';
import type { ToolsEnvironment } from '../solutions/tools-environment';

export class CsolutionExtensionImpl implements CsolutionExtension {
    private readonly apis: { dispose: () => unknown }[] = [];

    constructor(
        private readonly solutionCreator: SolutionCreator,
        private readonly buildTaskProvider: BuildTaskProvider,
        private readonly dataManager: DataManager,
        private readonly solutionManager: Pick<SolutionManager, 'loadState'>,
        private readonly toolsEnvironment: Pick<ToolsEnvironment, 'getToolsEnvironment'>,
    ) { }

    public async activate(context: ExtensionContext): Promise<void> {
        context.subscriptions.push(Disposable.from({
            dispose: () => {
                this.apis.forEach(api => api.dispose());
            }
        }));
    }

    // Inspired by the built-in Git extension's API: https://github.com/microsoft/vscode/blob/827636e10635a4d1b9594a2c32f4134e632b61f8/extensions/git/src/api/git.d.ts
    public getApi(version: 2) : CsolutionApiV2;
    public getApi(version: 3) : CsolutionApiV3;
    public getApi(version: number) : CsolutionApiV1 | CsolutionApiV2 | CsolutionApiV3 {
        let api = undefined;
        if (version === 2) {
            api = new CsolutionApiV2Impl(this.dataManager, this.solutionCreator, this.buildTaskProvider);
        } else if (version === 3) {
            api = new CsolutionApiV3Impl(new CsolutionApiV2Impl(this.dataManager, this.solutionCreator, this.buildTaskProvider), this.solutionManager, this.toolsEnvironment);
        }
        if (api) {
            this.apis.push(api);
            return api;
        }
        throw new Error(`No API version ${version} found`);
    }
}
