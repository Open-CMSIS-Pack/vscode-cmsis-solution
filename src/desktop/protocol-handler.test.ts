/**
 * Copyright 2025-2026 Arm Limited
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

import * as vscode from 'vscode';
import { ProtocolHandler } from './protocol-handler';
import { cmsisToolboxManagerFactory, MockCmsisToolboxManager } from '../solutions/cmsis-toolbox.factories';
import { MockOutputChannelProvider, outputChannelProviderFactory } from '../vscode-api/output-channel-provider.factories';

describe('ProtocolHandler', () => {
    let cmsisToolboxManagerMock : MockCmsisToolboxManager;
    let outputChannelProviderMock : MockOutputChannelProvider;
    let protocolHandler : ProtocolHandler;

    beforeEach(() => {
        cmsisToolboxManagerMock = cmsisToolboxManagerFactory();
        outputChannelProviderMock = outputChannelProviderFactory();

        protocolHandler = new ProtocolHandler(cmsisToolboxManagerMock, outputChannelProviderMock);
    });

    describe('activate', () => {

        it('registers as a URI handler', async () => {
            const context = { subscriptions: new Array<{ dispose(): unknown; }>() } as vscode.ExtensionContext;
            const disposableMock = { dispose: jest.fn() };
            (vscode.window.registerUriHandler as jest.Mock).mockReturnValueOnce(disposableMock);

            await protocolHandler.activate(context);

            expect(vscode.window.registerUriHandler).toHaveBeenCalledWith(protocolHandler);
            expect(context.subscriptions).toContain(disposableMock);
        });

    });

    describe('handleUri /installpack?pack=<pack>', () => {

        it('runs cpackget add with given <pack> identifier and returns success', async () => {
            cmsisToolboxManagerMock.runCmsisTool.mockResolvedValueOnce([0, undefined]);

            await protocolHandler.handleUri(vscode.Uri.parse('vscode://arm.cmsis-csolution/installpack?pack=some_pack'));

            expect(cmsisToolboxManagerMock.runCmsisTool).toHaveBeenCalledWith('cpackget', ['add', '-a', 'some_pack'], expect.anything());
        });

        it('returns failure of no pack query is present', async () => {
            cmsisToolboxManagerMock.runCmsisTool.mockResolvedValueOnce([0, undefined]);

            await protocolHandler.handleUri(vscode.Uri.parse('vscode://arm.cmsis-csolution/installpack?path=My.Pack.1.0.0.pack'));

            expect(cmsisToolboxManagerMock.runCmsisTool).not.toHaveBeenCalled();
        });

    });

});
