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

import 'jest';
import * as vscode from 'vscode';
import { GeneratorCommand } from './generator-command';
import { commandsProviderFactory } from '../../vscode-api/commands-provider.factories';
import { solutionManagerFactory } from '../../solutions/solution-manager.factories';
import { outputChannelProviderFactory } from '../../vscode-api/output-channel-provider.factories';
import { cmsisToolboxManagerFactory } from '../../solutions/cmsis-toolbox.factories';
import { extensionContextFactory } from '../../vscode-api/extension-context.factories';
import { csolutionFactory } from '../../solutions/csolution.factory';
import { CMSIS_SOLUTION_OUTPUT_CHANNEL } from '../../manifest';

describe('GeneratorCommand', () => {
    let solutionManager: ReturnType<typeof solutionManagerFactory>;
    let outputChannelProvider: ReturnType<typeof outputChannelProviderFactory>;
    let cmsisToolboxManager: ReturnType<typeof cmsisToolboxManagerFactory>;
    let generatorCommand: GeneratorCommand;
    const commandsProvider = commandsProviderFactory();
    let context: ReturnType<typeof extensionContextFactory>;

    beforeEach(() => {
        jest.clearAllMocks();
        context = extensionContextFactory();
        solutionManager = solutionManagerFactory();
        outputChannelProvider = outputChannelProviderFactory();
        cmsisToolboxManager = cmsisToolboxManagerFactory();
        generatorCommand = new GeneratorCommand(commandsProvider, solutionManager, outputChannelProvider, cmsisToolboxManager);
    });

    afterEach(async () => {
        for (const { dispose } of context.subscriptions) {
            await dispose();
        }
    });

    it('should register generator command on activation', async () => {
        await generatorCommand.activate(context as unknown as vscode.ExtensionContext);
        expect(commandsProvider.registerCommand).toHaveBeenCalledWith(
            GeneratorCommand.runGeneratorCommandType,
            expect.any(Function),
            generatorCommand
        );
    });


    it('shows an error if no solution file is found', async () => {
        solutionManager.getCsolution.mockReturnValue(undefined);
        await generatorCommand.handleRunGenerator('gen', 'ctx');
        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Solution file does not exist');
    });

    it('runs generator and shows info on success', async () => {
        solutionManager.getCsolution.mockReturnValue(csolutionFactory({ solutionPath: 'mock/path.csolution.yml' }));

        await generatorCommand.handleRunGenerator('my-gen', 'debug');

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            'Starting generator my-gen for context debug...'
        );

        expect(cmsisToolboxManager.runCmsisTool).toHaveBeenCalledWith(
            'csolution',
            ['run', 'mock/path.csolution.yml', '-g', 'my-gen', '-c', 'debug'],
            expect.any(Function),
            undefined,
            undefined,
            true
        );
    });

    it('shows error if generator fails', async () => {
        solutionManager.getCsolution.mockReturnValue(csolutionFactory({ solutionPath: 'mock/path.csolution.yml' }));
        cmsisToolboxManager.runCmsisTool.mockResolvedValue([1, undefined]);

        await generatorCommand.handleRunGenerator('gen-fail', 'dev');

        const mockGetCreatedChannelByName = outputChannelProvider.mockGetCreatedChannelByName(CMSIS_SOLUTION_OUTPUT_CHANNEL);

        expect(mockGetCreatedChannelByName?.show).toHaveBeenCalled();
        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Failed to launch Generator gen-fail!');
    });
});
