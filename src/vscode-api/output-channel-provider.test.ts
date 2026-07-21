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

import * as vscode from 'vscode';
import { OutputChannelProviderImpl } from './output-channel-provider';

describe('OutputChannelProvider', () => {
    it('creates and registers each named channel once', () => {
        const channel = { dispose: jest.fn() } as unknown as vscode.OutputChannel;
        const createOutputChannel = jest.fn().mockReturnValue(channel);
        (vscode.window as unknown as { createOutputChannel: typeof vscode.window.createOutputChannel }).createOutputChannel = createOutputChannel;
        const subscriptions: vscode.Disposable[] = [];
        const subscriptionsPush = jest.spyOn(subscriptions, 'push');
        const provider = new OutputChannelProviderImpl({ subscriptions });

        const firstChannel = provider.getOrCreate('test channel');
        const secondChannel = provider.getOrCreate('test channel');

        expect(secondChannel).toBe(firstChannel);
        expect(createOutputChannel).toHaveBeenCalledTimes(1);
        expect(createOutputChannel).toHaveBeenCalledWith('test channel');
        expect(subscriptionsPush).toHaveBeenCalledTimes(1);
        expect(subscriptionsPush).toHaveBeenCalledWith(firstChannel);
        expect(subscriptions).toHaveLength(1);
        expect(subscriptions[0]).toBe(firstChannel);
    });
});
