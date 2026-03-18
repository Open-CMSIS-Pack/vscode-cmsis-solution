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
import { constructor } from '../generic/constructor';
import { Board, CsolutionService, Device, VariablesResult } from '../json-rpc/csolution-rpc-client';
import { CSolution } from './csolution';



/**
 * Interface to query and cache RPC data
 */
export interface SolutionRpcData {

    /**
     * Returns board info data
     */
    get board(): Board | undefined;

    /**
     * Returns device board info data
     */
    get device(): Device | undefined;

    /** Resolves a single variable for a context
     * @param context resolving context
     * @param variable name without surrounding '$' chars
     * @return variable value if resolved, undefined otherwise
    */
    resolveVariable(context: string, variable?: string): string | undefined;
    /**
     * Updates internal data cache
     */
    update(solution: CSolution): Promise<void>;
    /**
     * Expands string for given context substituting variable with corresponding values
     * @param context resolving context
     * @return expanded string
     */
    expandString(str: string, context: string): string
}

class SolutionRpcDataImpl implements SolutionRpcData {
    private readonly contextVariables = new Map<string, Map<string, string>>();
    private _board?: Board = undefined;
    private _device?: Device = undefined;

    constructor(
        private readonly csolutionService: CsolutionService,
    ) {
    }
    clear() {
        this.contextVariables.clear();
        this._board = undefined;
        this._device = undefined;
    }

    public get board(): Board | undefined {
        return this._board;
    }

    public get device(): Device | undefined {
        return this._device;
    }

    async update(solution: CSolution): Promise<void> {
        this.clear();
        const activeTargetType = solution.getActiveTargetTypeWrap();
        if (!activeTargetType) {
            return;
        }
        const activeTarget = activeTargetType.name;
        if (activeTargetType.device) {
            const deviceInfo = await this.csolutionService.getDeviceInfo({ id: activeTargetType.device });
            if (deviceInfo.success) {
                this._device = deviceInfo.device;
            };
        }
        if (activeTargetType.board) {
            const boardInfo = await this.csolutionService.getBoardInfo({ id: activeTargetType.board });
            if (boardInfo.success) {
                this._board = boardInfo.board;
            };
        }

        const res = await this.csolutionService.loadSolution(
            {
                solution: solution.solutionPath,
                activeTarget: activeTarget
            });
        if (!res.success) {
            return;
        }
        const contexts = solution.getContextNames();
        for (const context of contexts) {
            const data = await this.csolutionService.getVariables({ context: context });
            if (data.success) {
                this.contextVariables.set(context, this.variablesFromRpcData(data));
            }
        }
    }

    private variablesFromRpcData(data: VariablesResult) {
        const vars = new Map<string, string>();
        for (const [key, value] of Object.entries(data.variables)) {
            vars.set('$' + key + '$', value);
        }
        return vars;
    }

    public resolveVariable(context: string, variable?: string): string | undefined {
        if (variable) {
            const variables = this.contextVariables.get(context);
            if (variables) {
                return variables.get(variable);
            }
        }
        return undefined;
    }


    public expandString(str: string, context: string): string {
        const variables = this.contextVariables.get(context);
        if (!str.includes('$') || !variables || variables.size == 0) {
            return str;
        }

        let expanded = str;
        for (const [name, value] of variables.entries()) {
            expanded = expanded.replaceAll(name, value);
        }
        return expanded;
    }
}

export const SolutionRpcData = constructor<typeof SolutionRpcDataImpl, SolutionRpcData>(SolutionRpcDataImpl);

