/**
 * Copyright 2023-2026 Arm Limited
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

import path from 'path';
import * as vscode from 'vscode';
import { CmsisToolboxManager, CmsisToolboxManagerImpl } from './cmsis-toolbox';
import { CTreeItem } from '../generic/tree-item';
import { HandleBuildEnoent } from '../../src/tasks/build/handle-enoent';
import { MockProcessManager, processManagerFactory } from '../vscode-api/runner/process-manager.factories';
import { csolutionServiceFactory } from '../json-rpc/csolution-rpc-client.factory';

jest.mock('which', () => jest.fn((cmd) => Promise.resolve(path.join('path', 'to', cmd))));

describe('CmsisToolbox', () => {
    let mockProcessManager: MockProcessManager;
    let mockHandleBuildEnoent : jest.MockedFunction<HandleBuildEnoent>;
    let toolbox: CmsisToolboxManager;
    let context: { subscriptions: Array<{ dispose: () => Promise<void> }>, workspaceState: { get: jest.Mock, update: jest.Mock } };
    let mockCsolutionService: jest.Mocked<ReturnType<typeof csolutionServiceFactory>>;

    const onOutput = (line: string) => console.log(line);

    beforeEach(async () => {
        mockProcessManager = processManagerFactory();
        mockHandleBuildEnoent = jest.fn();
        context = {
            subscriptions: [],
            workspaceState: { get: jest.fn(), update: jest.fn() }
        };
        mockCsolutionService = csolutionServiceFactory();

        toolbox = new CmsisToolboxManagerImpl(
            mockProcessManager,
            mockHandleBuildEnoent,
            mockCsolutionService,
        );
    });

    it('run tools sequentially in the right order', async () => {
        await toolbox.activate(context as unknown as vscode.ExtensionContext);
        mockProcessManager.mockOutputLines(['Finished successfully']);
        // call runCmsisTool concurrently
        const result1 = toolbox.runCmsisTool('cpackget',  ['arg1', 'arg2'], onOutput);
        const result2 = toolbox.runCmsisTool('csolution', ['arg1', 'arg2'], onOutput);
        const result3 = toolbox.runCmsisTool('cbuild',    ['arg1', 'arg2'], onOutput);
        const result4 = toolbox.runCmsisTool('cbuild',    ['arg1', 'arg2', 'arg3'], onOutput);

        // check cmsis tool is running
        expect(toolbox.isRunning()).toEqual(true);

        // wait promises completion before checking expected values
        expect(await result1).toEqual([0, path.join('path', 'to', 'cpackget')]);
        expect(await result2).toEqual([0, path.join('path', 'to', 'csolution')]);
        expect(await result3).toEqual([0, path.join('path', 'to', 'cbuild')]);
        expect(await result4).toEqual([0, path.join('path', 'to', 'cbuild')]);

        // check cmsis tool is not running
        expect(toolbox.isRunning()).toEqual(false);

        expect(mockProcessManager.spawn).toHaveBeenCalledTimes(7);
        expect(mockProcessManager.spawn).toHaveBeenNthCalledWith(1,
            path.join('path', 'to', 'cpackget'),  ['arg1', 'arg2'],         expect.any(Object), expect.any(Function), undefined, undefined);
        expect(mockProcessManager.spawn).toHaveBeenNthCalledWith(3,
            path.join('path', 'to', 'csolution'), ['arg1', 'arg2'],         expect.any(Object), expect.any(Function), undefined, undefined);
        expect(mockProcessManager.spawn).toHaveBeenNthCalledWith(5,
            path.join('path', 'to', 'cbuild'),    ['arg1', 'arg2'],         expect.any(Object), expect.any(Function), undefined, undefined);
        expect(mockProcessManager.spawn).toHaveBeenNthCalledWith(7,
            path.join('path', 'to', 'cbuild'),    ['arg1', 'arg2', 'arg3'], expect.any(Object), expect.any(Function), undefined, undefined);
    });

    it('skip enqueuing redundant calls', async () => {
        mockProcessManager.mockOutputLines(['Finished successfully']);
        // call runCmsisTool concurrently
        const result1 = toolbox.runCmsisTool('cbuild', ['arg1', 'arg2'], onOutput);
        const result2 = toolbox.runCmsisTool('cbuild', ['arg1', 'arg2'], onOutput);
        // wait promises completion before checking expected values
        expect(await result1).toEqual([0, expect.anything()]);
        expect(await result2).toEqual([0, undefined]);
        expect(mockProcessManager.spawn).toHaveBeenCalledTimes(2);
        expect(mockProcessManager.spawn).toHaveBeenCalledWith(
            path.join('path', 'to', 'cbuild'), ['arg1', 'arg2'], expect.any(Object), expect.any(Function), undefined, undefined);
    });

    it('check error from underlying process', async () => {
        const logSpy = jest.spyOn(console, 'log');
        mockProcessManager.mockOutputLinesAndReject([],'Error running tool');
        const result = toolbox.runCmsisTool('cbuild', ['arg1', 'arg2'], onOutput);
        expect(await result).toEqual([-1, expect.anything()]);
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Completed: cbuild failed with exit code -1: Error running tool'));
        expect(mockProcessManager.spawn).toHaveBeenCalledTimes(2);
        expect(mockProcessManager.spawn).toHaveBeenCalledWith(
            expect.stringContaining('cbuild'), ['arg1', 'arg2'], expect.any(Object), expect.any(Function), undefined, undefined);
    });

    it('check error cmsis tool does not exist', async () => {
        const logSpy = jest.spyOn(console, 'log');
        mockProcessManager.rejectCode('ENOENT');
        const result = toolbox.runCmsisTool('cbuild', ['arg1', 'arg2'], onOutput);
        expect(await result).toEqual([-2, expect.anything()]);
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Completed: cbuild failed with exit code -2: Error: ENOENT\r\nCMSIS-Toolbox is not in the PATH'));
        expect(mockProcessManager.spawn).toHaveBeenCalledTimes(2);
        expect(mockProcessManager.spawn).toHaveBeenCalledWith(
            expect.stringContaining('cbuild'), ['arg1', 'arg2'], expect.any(Object), expect.any(Function), undefined, undefined);
    });

    it('check cmsis toolbox path', async () => {
        await toolbox.runCmsisTool('cbuild', [], onOutput);
        expect(mockProcessManager.spawn).toHaveBeenCalledWith(
            path.join('path', 'to', 'cbuild'), [], expect.any(Object), expect.any(Function), undefined, undefined);
    });

    it('emits execute line by default', async () => {
        const outputSpy = jest.fn();

        await toolbox.runCmsisTool('cpackget', ['arg1', 'arg2'], outputSpy);

        expect(outputSpy).toHaveBeenCalledWith('cpackget arg1 arg2\r\n');
    });

    it('does not emit execute line when emitExecuteLine is false', async () => {
        const outputSpy = jest.fn();

        await toolbox.runCmsisTool('cbuild', ['arg1', 'arg2'], outputSpy, undefined, undefined, undefined, false);

        expect(outputSpy).not.toHaveBeenCalledWith('cbuild arg1 arg2\r\n');
    });

    it('collect setup messages', () => {
        // severity undefined
        const cBuildIdxYml: CTreeItem = new CTreeItem();
        expect(toolbox.collectSetupMessages(cBuildIdxYml)).toBeUndefined();

        // create cbuild-idx content
        const cbuildItem = cBuildIdxYml.createChild('build-idx').createChild('cbuilds').createChild('-');
        cbuildItem.setValue('cbuild', 'path/to/context1.build+target.cbuild.yml');
        const messages = cbuildItem.createChild('messages');

        // severity warning
        const warnings = messages.createChild('warnings');
        warnings.setValue('-', 'context1.build+target warns');
        expect(toolbox.collectSetupMessages(cBuildIdxYml)).toBe('warning');
        expect(toolbox.getSetupMessages('context1.build+target')).toEqual([
            'warning: context1.build+target warns'
        ]);

        // severity error
        const errors = messages.createChild('errors');
        errors.setValue('-', 'context1.build+target fails');
        expect(toolbox.collectSetupMessages(cBuildIdxYml)).toBe('error');
        expect(toolbox.getSetupMessages('context1.build+target')).toEqual([
            'warning: context1.build+target warns',
            'error: context1.build+target fails',
        ]);
    });
});
