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

import 'jest';
import type { OutputChannel } from 'vscode';
import { OutputChannelProvider } from './output-channel-provider';

export type MockOutputChannel = jest.Mocked<OutputChannel> & {
    name: OutputChannel['name'];
    readonly mockAppendedStrings: readonly string[];
}

export type MockOutputChannelProvider = jest.Mocked<OutputChannelProvider> & {
    mockGetCreatedChannelByName: (name: string) => MockOutputChannel | undefined;
}

export const outputChannelProviderFactory = (): MockOutputChannelProvider => {
    const createdChannels: {[key in string]?: MockOutputChannel} = {};

    return {
        getOrCreate: jest.fn((name: string): MockOutputChannel => {
            let channel = createdChannels[name];
            if (channel) {
                return channel;
            }

            const appendedStrings: string[] = [];
            channel = {
                name,
                append: jest.fn(input => { appendedStrings.push(input); }),
                appendLine: jest.fn(line =>{ appendedStrings.push(line); }),
                clear: jest.fn(),
                dispose: jest.fn(),
                replace: jest.fn(),
                show: jest.fn(),
                hide: jest.fn(),
                mockAppendedStrings: appendedStrings,
            };

            createdChannels[name] = channel;
            return channel;
        }),
        mockGetCreatedChannelByName: name => createdChannels[name],
    };
};
