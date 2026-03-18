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

import * as vscode from 'vscode';
import { CmsisToolboxManager } from './cmsis-toolbox';

export type MockCmsisToolboxManager =
    jest.Mocked<Omit<CmsisToolboxManager, 'onRunCmsisTool'>> &
    {
        onRunCmsisTool: CmsisToolboxManager['onRunCmsisTool']
        mockTriggerOnRunCmsisTool: (start: boolean, packs: boolean) => void
    }

export const cmsisToolboxManagerFactory = (): MockCmsisToolboxManager => {
    const onRunCmsisToolEventEmitter = new vscode.EventEmitter<[boolean, boolean?]>();
    return {
        runCmsisTool: jest.fn().mockResolvedValue([0, undefined]),
        runCsolutionRpc: jest.fn().mockResolvedValue({ success: true }),
        isRunning: jest.fn(),
        collectSetupMessages: jest.fn(),
        getSetupMessages: jest.fn(),
        onRunCmsisTool: onRunCmsisToolEventEmitter.event,
        mockTriggerOnRunCmsisTool: (start: boolean, packs: boolean) => {
            onRunCmsisToolEventEmitter.fire([start, packs]);
        },
        activate: jest.fn(),
    };
};
