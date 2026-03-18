/**
 * Copyright 2024-2026 Arm Limited
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

import { commandsProviderFactory } from '../../vscode-api/commands-provider.factories';
import { CSolution } from '../csolution';
import { solutionManagerFactory } from '../solution-manager.factories';
import { TargetPackCommandImpl } from './target-pack-command';

describe('TargetPackCommand', () => {
    it('call the getTargetPack and return device pack', async () => {
        const MockCSolution = CSolution as jest.MockedClass<typeof CSolution>;
        const csolution = new MockCSolution();
        csolution.getDevicePack = jest.fn().mockReturnValue('MyVendor::MyPack@0.0.9');

        const solutionManager = solutionManagerFactory();
        solutionManager.getCsolution.mockReturnValue(csolution as CSolution);
        const commandsProvider = commandsProviderFactory();
        const targetPackCommand = new TargetPackCommandImpl(
            commandsProvider,
            solutionManager,
        );

        await targetPackCommand.activate({ subscriptions: [] });

        const result = await targetPackCommand.getTargetPack();

        expect(result).toEqual('MyVendor::MyPack@0.0.9');
    });
});
