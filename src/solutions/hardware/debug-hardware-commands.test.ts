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

import { describe } from '@jest/globals';
import { commandsProviderFactory } from '../../vscode-api/commands-provider.factories';
import { CSolution } from '../csolution';
import { solutionManagerFactory } from '../solution-manager.factories';
import { DebugHardwareCommands } from './debug-hardware-commands';

describe('DebugHardwareCommands', () => {
    it('is registered on activation and returns the correct csolution values', async () => {
        const commandsProvider = commandsProviderFactory();
        const solutionManager = solutionManagerFactory();
        const MockCSolution = CSolution as jest.MockedClass<typeof CSolution>;
        const csolution = new MockCSolution();

        csolution.getDeviceName = jest.fn().mockReturnValue('deviceName');
        csolution.getProcessorName = jest.fn().mockReturnValue('processorName');

        solutionManager.getCsolution.mockReturnValue(csolution as CSolution);
        const debugHardwareCommands = new DebugHardwareCommands(commandsProvider, solutionManager);
        await debugHardwareCommands.activate({ subscriptions: [] });

        expect(commandsProvider.registerCommand).toHaveBeenCalledWith(DebugHardwareCommands.DEVICE_NAME_COMMAND_ID, expect.any(Function), expect.anything());

        const deviceName = await commandsProvider.mockRunRegistered(DebugHardwareCommands.DEVICE_NAME_COMMAND_ID);
        const processorName = await commandsProvider.mockRunRegistered(DebugHardwareCommands.PROCESSOR_NAME_COMMAND_ID);
        expect(deviceName).toBe('deviceName');
        expect(processorName).toBe('processorName');
    });
});
