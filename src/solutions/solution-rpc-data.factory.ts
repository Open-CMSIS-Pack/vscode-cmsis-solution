/**
 * Copyright 2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { csolutionServiceFactory } from '../json-rpc/csolution-rpc-client.factory';
import { Board, Device, Variables } from '../json-rpc/csolution-rpc-client';
import { SolutionRpcData, SolutionRpcDataImpl } from './solution-rpc-data';


export class SolutionRpcDataMock extends SolutionRpcDataImpl {
    constructor() {
        super(csolutionServiceFactory());
    }

    public seedBoard(board?: Board): SolutionRpcDataMock {
        this._board = board;
        return this;
    }

    public seedDevice(device?: Device): SolutionRpcDataMock {
        this._device = device;
        return this;
    }

    public seedVariables(context: string, variables: Variables): SolutionRpcDataMock {
        this.contextVariables.set(context, this.variablesFromRpcData(variables));
        return this;
    }
}

export function solutionRpcDataFactory(
    options: Partial<SolutionRpcData> = {}
): SolutionRpcDataMock {
    const solutionRpcDataMock = new SolutionRpcDataMock();

    Object.assign(solutionRpcDataMock, options);

    return solutionRpcDataMock;
}

export type SolutionRpcDataLike = SolutionRpcData | SolutionRpcDataMock;
