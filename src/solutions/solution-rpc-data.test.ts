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

import { beforeEach, describe, expect, it } from '@jest/globals';
import { csolutionServiceFactory } from '../json-rpc/csolution-rpc-client.factory';
import { csolutionFactory, CSolutionMock } from './csolution.factory';
import { SolutionRpcData } from './solution-rpc-data';

describe('SolutionRpcData', () => {
    let csolutionService: jest.Mocked<ReturnType<typeof csolutionServiceFactory>>;
    let rpcData: SolutionRpcData;
    let solution: CSolutionMock;

    beforeEach(() => {
        csolutionService = csolutionServiceFactory();
        solution = csolutionFactory({
            solutionPath: 'path/to/solution.csolution.yml',
            getActiveTargetTypeWrap: jest.fn().mockReturnValue({ name: 'ActiveTarget' }),
            getContextNames: jest.fn().mockReturnValue(['ctx']),
        });
        rpcData = new SolutionRpcData(csolutionService);
    });

    it('loads context data when loadSolution succeeds', async () => {
        csolutionService.loadSolution.mockResolvedValue({ success: true });
        csolutionService.getVariables.mockResolvedValue({ success: true, variables: { FOO: 'bar' } });

        await rpcData.update(solution);

        expect(csolutionService.loadSolution).toHaveBeenCalledWith({
            solution: solution.solutionPath,
            activeTarget: 'ActiveTarget',
        });
        expect(csolutionService.getVariables).toHaveBeenCalledWith({ context: 'ctx' });
        expect(rpcData.resolveVariable('ctx', '$FOO$')).toBe('bar');
        expect(rpcData.resolveVariable('ctx', '$MISSING$')).toBeUndefined();
    });

    it('does not fetch context data when loadSolution fails', async () => {
        csolutionService.loadSolution.mockResolvedValue({ success: false });

        await rpcData.update(solution);

        expect(csolutionService.getVariables).not.toHaveBeenCalled();
        expect(rpcData.resolveVariable('ctx', 'FOO')).toBeUndefined();
    });

    it('expands $VAR$ placeholders for a context', async () => {
        csolutionService.loadSolution.mockResolvedValue({ success: true });
        csolutionService.getVariables.mockResolvedValue({ success: true, variables: { FOO: 'bar', HELLO: 'world' } });

        await rpcData.update(solution);

        expect(rpcData.expandString('Value: $FOO$ and $HELLO$', 'ctx')).toBe('Value: bar and world');
    });

    it('returns original string when no variables are available', () => {
        expect(rpcData.expandString('plain string', 'ctx')).toBe('plain string');
    });
});
