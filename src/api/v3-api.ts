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
import type { DataManager } from '../data-manager/data-manager';
import type { CsolutionService } from '../json-rpc/csolution-rpc-client';
import { splitPackId } from '../data-manager/pack-data';

export class CsolutionApiV3Impl implements CsolutionApiV3 {
    constructor(
        private readonly existingApi: CsolutionApiV2 & Disposable,
        private readonly dataManager: DataManager,
        private readonly solutionManager: Pick<SolutionManager, 'getCsolution' | 'loadState'>,
        private readonly csolutionService: Pick<CsolutionService, 'getPacksInfo'>,
        private readonly toolsEnvironment: Pick<ToolsEnvironment, 'getToolsEnvironment'>,
    ) {}

    public getToolsEnvironment(): Promise<string> {
        const state = this.solutionManager.loadState;
        return this.toolsEnvironment.getToolsEnvironment(state.loaded ? state.solutionPath : undefined);
    }

    public async getPacks(options?: CsolutionApiV3.PackQuery): Promise<CsolutionApiV3.PackQueryResult> {
        const text = options?.filter?.text?.toLowerCase() ?? '';
        const matches = (pack: CsolutionApiV3.PackData) => !text || !!pack.id?.toLowerCase().includes(text)
            || !!pack.description?.toLowerCase().includes(text);
        if (options?.scope !== 'used' && options?.scope !== 'missing') {
            const result = await this.dataManager.getPacks(options?.scope);
            return text ? { ...result, packs: result.packs.filter(matches) } : result;
        }
        const scope = options.scope;
        const queryName = scope === 'used' ? 'Used' : 'Missing';
        const context = options.context;
        if (typeof context !== 'string' || !context.trim()) {
            throw new Error(`${queryName} pack query requires an explicit context`);
        }
        const solution = this.solutionManager.getCsolution();
        if (!solution || !this.solutionManager.loadState.loaded) {
            throw new Error(`${queryName} pack query requires a loaded solution`);
        }
        const hasContext = () => solution.getActiveTargetSetWrap()?.projectContexts.some(projectContext =>
            `${projectContext.name}+${solution.getActiveTargetType()}` === context);
        if (!hasContext()) {
            throw new Error(`Unknown pack context: ${context}`);
        }
        const result = await this.csolutionService.getPacksInfo({ context, all: true });
        if (!result.success) {
            throw new Error(result.message ?? `Unable to query ${scope} packs`);
        }
        if (this.solutionManager.getCsolution() !== solution || !this.solutionManager.loadState.loaded
            || !hasContext()) {
            throw new Error(`Solution or context changed during ${scope} pack query`);
        }
        if (scope === 'missing') {
            const packs = result.packs.flatMap(pack => (pack.references ?? [])
                .filter(reference => reference.missing === true)
                .map(reference => ({
                    pack: reference.pack,
                    origin: reference.origin,
                    ...(reference.resolvedPack === undefined ? {} : { resolvedPack: reference.resolvedPack }),
                })));
            return { packs: packs.filter(pack => !text || pack.pack.toLowerCase().includes(text)) };
        }
        const packs = result.packs.filter(pack => pack.used === true).map(pack => {
            const { version } = splitPackId(pack.id);
            if (!version) {
                throw new Error(`Used pack has no version: ${pack.id}`);
            }
            const reference = pack.references?.find(item => item.resolvedPack === pack.id && !item.missing);
            return {
                id: pack.id,
                version,
                ...(pack.description === undefined ? {} : { description: pack.description }),
                ...(reference ? { installed: true } : {}),
                ...(reference?.path === undefined ? {} : { path: reference.path }),
            };
        });
        return { packs: packs.filter(matches) };
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
