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
// generated with AI
/**
 * Shared Playwright Fixtures
 *
 * Provides a worker-scoped `vsCodeDriver` fixture that starts a single VS Code
 * instance for the entire worker (all test files in one run share the same
 * instance). Tests use `switchToWorkspace` and `cleanupTestState` to isolate
 * themselves without paying the cost of a full restart per use case.
 *
 */

import { test as base } from '@playwright/test';
import { VsCodeDriver } from './infrastructure/vscode-driver';
import { installRequiredExtensions } from './utils/install-extensions';
import { log } from './utils/logger';

type WorkerFixtures = {
    vsCodeDriver: VsCodeDriver;
};

type TestFixtures = Record<never, never>;

const MAX_START_ATTEMPTS = 2;

const stopStartedDriver = async (driver: VsCodeDriver) => {
    try {
        await driver.stop();
    } catch (error) {
        log('warn', 'Failed to stop VS Code after startup attempt failure:', error);
    }
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
    // eslint-disable-next-line no-empty-pattern
    vsCodeDriver: [async ({}, use) => {
        let startupError: unknown;
        let driver: VsCodeDriver | undefined;

        for (let attempt = 1; attempt <= MAX_START_ATTEMPTS; attempt++) {
            driver = new VsCodeDriver();
            try {
                log('info', `🚀 Starting shared VS Code worker instance (attempt ${attempt}/${MAX_START_ATTEMPTS})...`);
                await driver.startWithWorkspaceContents(undefined);
                await installRequiredExtensions();
                await driver.mockShowMessageBoxResponse('Always Allow', { persist: true });
                log('info', '✅ Shared VS Code worker instance ready');
                break;
            } catch (error) {
                startupError = error;
                if (driver) {
                    await stopStartedDriver(driver);
                }
                driver = undefined;
                log('warn', `VS Code startup attempt ${attempt}/${MAX_START_ATTEMPTS} failed:`, error);
            }
        }

        if (!driver) {
            throw startupError instanceof Error
                ? startupError
                : new Error('Unable to start VS Code test environment.');
        }

        const readyDriver = driver;
        await use(readyDriver);
        log('info', '🛑 Stopping shared VS Code worker instance...');
        await readyDriver.stop();
    }, { scope: 'worker' }],
});

export { expect } from '@playwright/test';
