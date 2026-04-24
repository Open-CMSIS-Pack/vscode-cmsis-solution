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
            'Starting generator my-gen for project debug...'
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

    it('does not show output channel on success', async () => {
        solutionManager.getCsolution.mockReturnValue(csolutionFactory({ solutionPath: 'mock/path.csolution.yml' }));
        cmsisToolboxManager.runCmsisTool.mockResolvedValue([0, undefined]);

        await generatorCommand.handleRunGenerator('gen-ok', 'release');

        const channel = outputChannelProvider.mockGetCreatedChannelByName(CMSIS_SOLUTION_OUTPUT_CHANNEL);
        expect(channel?.show).not.toHaveBeenCalled();
    });

    it('appends the start message to the output channel', async () => {
        solutionManager.getCsolution.mockReturnValue(csolutionFactory({ solutionPath: 'mock/path.csolution.yml' }));

        await generatorCommand.handleRunGenerator('my-gen', 'debug');

        const channel = outputChannelProvider.mockGetCreatedChannelByName(CMSIS_SOLUTION_OUTPUT_CHANNEL);
        expect(channel?.mockAppendedStrings).toContain('Starting generator my-gen for project debug...');
    });

    describe('command dispatch', () => {
        beforeEach(async () => {
            await generatorCommand.activate(context as unknown as vscode.ExtensionContext);
            solutionManager.getCsolution.mockReturnValue(csolutionFactory({ solutionPath: 'mock/path.csolution.yml' }));
        });

        it('dispatches handleRunGenerator when input is a component-gen COutlineItem-like node', async () => {
            const node = {
                getAttribute: (name: string) => ({ type: 'component-gen', generator: 'STM32CubeMX', 'cbuild-context': '.debug+target' }[name]),
            };

            await commandsProvider.mockRunRegistered(GeneratorCommand.runGeneratorCommandType, node);

            expect(cmsisToolboxManager.runCmsisTool).toHaveBeenCalledWith(
                'csolution',
                expect.arrayContaining(['-g', 'STM32CubeMX', '-c', '.debug+target']),
                expect.any(Function),
                undefined,
                undefined,
                true
            );
        });

        it('does not dispatch when input is a COutlineItem-like node with wrong type', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
            const node = {
                getAttribute: (name: string) => ({ type: 'component', generator: 'STM32CubeMX', 'cbuild-context': '.debug+target' }[name]),
            };

            await commandsProvider.mockRunRegistered(GeneratorCommand.runGeneratorCommandType, node);

            expect(cmsisToolboxManager.runCmsisTool).not.toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it('dispatches handleRunGenerator when input is a plain RunGeneratorRequest object', async () => {
            await commandsProvider.mockRunRegistered(GeneratorCommand.runGeneratorCommandType, {
                generator: 'plain-gen',
                context: 'test+board',
            });

            expect(cmsisToolboxManager.runCmsisTool).toHaveBeenCalledWith(
                'csolution',
                expect.arrayContaining(['-g', 'plain-gen', '-c', 'test+board']),
                expect.any(Function),
                undefined,
                undefined,
                true
            );
        });

        it('logs an error and does not dispatch when input is invalid', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

            await commandsProvider.mockRunRegistered(GeneratorCommand.runGeneratorCommandType, undefined);

            expect(cmsisToolboxManager.runCmsisTool).not.toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });
});
