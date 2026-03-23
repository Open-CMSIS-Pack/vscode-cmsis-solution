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

import { test, expect } from '@playwright/test';
import * as path from 'path';
import { VsCodeDriver } from './infrastructure/vscode-driver';
import { getExampleRepos, loadExamples } from './utils/examples';
import { installRequiredExtensions } from './utils/install-extensions';
import { VcpkgDriver } from './drivers/vcpkg-driver';
import { OutputDriver } from './drivers/output-driver';
import { TerminalDriver } from './drivers/Terminal-driver';
import * as helpers from './utils/helper';
import { log } from './utils/logger';
import { CONTEXT_LINK_TIMEOUT_MS, DEFAULT_TIMEOUT_MS } from './constants';

/**
 * E2E Test Suite: CMSIS Solution Build Validation
 *
 * This test suite validates the complete workflow of building CMSIS solutions using the extension.
 * It tests against multiple example projects with different build contexts.
 *
 * Test Flow:
 * 1. Verifies extension installation and activation
 * 2. For each example project:
 *    - Switches to the project workspace
 *    - Waits for vcpkg activation and solution loading
 *    - Validates initial cbuild setup execution
 *    - Triggers manual build via UI button
 *    - Verifies successful build completion
 *
 */
test.describe('CMSIS Solution Build Validation', () => {
    let vsCodeDriver: VsCodeDriver;

    test.beforeAll(async () => {
        log('info', '🚀 Starting test setup...');

        // Initialize single VS Code instance that will be reused across all tests
        vsCodeDriver = new VsCodeDriver();
        log('info', '🔧 Initializing VS Code driver...');
        await vsCodeDriver.startWithWorkspaceContents(undefined);

        // Install all required extensions once
        log('info', '📦 Installing required extensions once...');
        await installRequiredExtensions();

        log('debug', '📸 Taking initial screenshot...');
        await vsCodeDriver.page.screenshot('Create Solution - after start');

        // Clone example repositories needed for testing
        await getExampleRepos();
        log('info', '✅ Test setup completed');
    });

    test.afterEach(async () => {
        // Clean up test state after each test
        if (vsCodeDriver) {
            log('debug', '🧹 Cleaning up test state after test...');
            await vsCodeDriver.cleanupTestState();
        }
    });

    test.afterAll(async () => {
        // Clean up VS Code instance after all tests complete
        if (vsCodeDriver) {
            await vsCodeDriver.stop();
        }
    });

    /**
     * Test: Verify CMSIS Extension Installation and Activation
     *
     * Validates that the Arm CMSIS Solution extension is properly installed and appears
     * in the running extensions list. This is a prerequisite check before running build tests.
     *
     * Steps:
     * 1. Opens the CMSIS panel to trigger extension activation
     * 2. Opens the Running Extensions view via command palette
     * 3. Verifies "Arm CMSIS Solution" extension is visible and active
     */
    test('should verify CMSIS extension is installed and running', async () => {
        await vsCodeDriver.page.openCmsisPanel();
        log('info', '✅ CMSIS panel opened successfully');

        await vsCodeDriver.page.getCommands().runCommandFromPalette('Show Running Extensions');
        await vsCodeDriver.page.getTextByName('Running Extensions').waitFor({ state: 'visible' });
        await vsCodeDriver.page.screenshot('Check CMSIS csolution extension installation');
        await expect(vsCodeDriver.page.getTextByName('Arm CMSIS Solution')).toBeVisible();
    });

    // Load example projects from test configuration
    const examples = loadExamples();

    // Generate test cases for each example project and its build contexts
    for (const example of examples) {
        for (const context of example.contexts) {
            const title = `${example.name} / ${context}`;

            test.describe(title, () => {
                const sourceWorkspace = path.resolve(__dirname, 'data', example.name);

                /**
                 * Test: Build CMSIS Solution for Specific Context
                 *
                 * Validates the complete build workflow for a CMSIS solution project:
                 * - Workspace isolation: Switches to test workspace (reloads VS Code)
                 * - Dependency management: Waits for vcpkg activation and solution loading
                 * - Configuration: Handles optional compiler selection dialog if needed
                 * - Initial build: Waits for automatic cbuild completion after loading
                 * - Manual build: Triggers build via UI button and validates success
                 *
                 * Success Criteria:
                 * - Build output contains "Build summary:" indicating completion
                 * - No build errors occur during the process
                 */
                test('should build solution successfully for context', async ({ page: _page }, testInfo) => {
                    log('info', 'Executing Test:', testInfo.title, 'for:', example.name);

                    // ==================== STEP 1: Workspace Setup ====================
                    log('info', `🔄 Switching to workspace: ${sourceWorkspace}`);
                    const switchStartTime = Date.now();
                    await vsCodeDriver.switchToWorkspace(sourceWorkspace);
                    const switchDuration = Date.now() - switchStartTime;
                    log('debug', `✅ Workspace switch completed in ${switchDuration}ms`);
                    await vsCodeDriver.page.screenshot(`${example.name}/After workspace switch`);

                    // Verify workspace isolation (not modifying source data)
                    expect(vsCodeDriver.testWorkspaceDirectory).toBeDefined();
                    expect(vsCodeDriver.testWorkspaceDirectory).not.toBe(sourceWorkspace);

                    try {
                        // ==================== STEP 2: Wait for Tool Activation ====================
                        log('info', '⏳ Waiting for Arm Environment Manager to activate tools...');
                        const vcpkg = new VcpkgDriver(vsCodeDriver);
                        await vsCodeDriver.page.screenshot(`${example.name}/Before tool activation`);
                        await vcpkg.waitForActivation();
                        await vsCodeDriver.page.screenshot(`${example.name}/After tool activation`);

                        // ==================== STEP 3: Handle Compiler Selection (if needed) ====================
                        if (example.selectCompiler) {
                            log('info', '🎯 Handling compiler selection dialog...');
                            await vsCodeDriver.page.screenshot(`${example.name}/Before compiler selection`);

                            const frame = vsCodeDriver.page.getWebviewByTitle('Configure Solution');
                            await frame.getByRole('heading', { name: 'Select Compiler' }).waitFor();

                            const okButton = frame
                                .locator('.manage-layers-frame')
                                .getByRole('button', { name: 'ok' });
                            await okButton.click();

                            await vsCodeDriver.page.screenshot(`${example.name}/After compiler selection`);
                        }

                        // ==================== STEP 4: Wait for Solution Load ====================
                        log('info', `⏳ Waiting for solution to load with target: ${helpers.getTargetFromContext(context)}...`);
                        const targetName = helpers.getTargetFromContext(context);
                        const solutionLoadStartTime = Date.now();
                        await vsCodeDriver.page.screenshot(`${example.name}/Before solution load`);
                        await vcpkg.waitForLoadedSolution(targetName);
                        const solutionLoadDuration = Date.now() - solutionLoadStartTime;
                        log('info', `✅ Solution loaded in ${solutionLoadDuration}ms`);
                        await vsCodeDriver.page.screenshot(`${example.name}/After solution load`);

                        // ==================== STEP 5: Verify Initial Auto-Build ====================
                        log('info', '🔍 Verifying initial automatic build completed...');
                        const outputView = new OutputDriver(vsCodeDriver);
                        await vsCodeDriver.page.screenshot(`${example.name}/Before output panel open`);
                        await outputView.showOutputFrom('CMSIS Solution');
                        await vsCodeDriver.page.screenshot(`${example.name}/Output panel - CMSIS Solution`);
                        await outputView.waitForOutputEntry('Convert solution completed');
                        await vsCodeDriver.page.screenshot(`${example.name}/After initial cbuild - ${context}`);

                        // ==================== STEP 6: Select Build Context ====================
                        log('info', '🎯 Selecting build context in CMSIS view...');
                        await vsCodeDriver.page.getCommands().runCommandFromPalette('View: Show CMSIS');

                        log('debug', `⏳ Waiting for context link "${context}" to become visible (timeout: ${CONTEXT_LINK_TIMEOUT_MS}ms)...`);
                        const contextParts = context.split('+');
                        const buildContext = contextParts[0] ?? context;
                        const targetContext = contextParts[1] ?? helpers.getTargetFromContext(context);
                        const contextPattern = new RegExp(`${helpers.escapeRegExp(buildContext)}\\s*\\+\\s*${helpers.escapeRegExp(targetContext)}`, 'i');
                        let contextLink = vsCodeDriver.page.getLocator('a').filter({ hasText: contextPattern });

                        // Check if element exists at all before waiting
                        let count = await contextLink.count();
                        if (count === 0 && targetContext) {
                            contextLink = vsCodeDriver.page.getLocator('a').filter({ hasText: targetContext });
                            count = await contextLink.count();
                        }
                        log('debug', `Found ${count} matching link(s) for context "${context}"`);

                        await contextLink.first().waitFor({ state: 'visible', timeout: Math.max(CONTEXT_LINK_TIMEOUT_MS, DEFAULT_TIMEOUT_MS) });
                        log('info', `✅ Context link "${context}" is now visible`);

                        await contextLink.first().click();
                        log('debug', `Clicked context link "${context}"`);
                        await vsCodeDriver.page.screenshot(`${example.name}/After context selection - ${context}`);

                        // ==================== STEP 7: Trigger Manual Build ====================
                        log('info', '🔨 Triggering manual build...');
                        const buildButton = vsCodeDriver.page.getRoleByName('button', { name: 'Build solution' });
                        await buildButton.waitFor();
                        await buildButton.click();
                        await vsCodeDriver.page.screenshot(`${example.name}/After build button click - ${context}`);

                        // ==================== STEP 8: Switch to Build Terminal ====================
                        log('info', '🖥️ Switching to build terminal...');
                        const terminalDriver = new TerminalDriver(vsCodeDriver);
                        await terminalDriver.switchTerminal('Build');
                        await vsCodeDriver.page.screenshot(`${example.name}/After terminal switch - ${context}`);

                        // Wait for build task to be visible
                        const buildTask = vsCodeDriver.page.getRoleByName('button', { name: /^Focus Terminal.*Split Terminal/ });
                        await helpers.waitForBuild(buildTask);
                        await vsCodeDriver.page.screenshot(`${example.name}/Build task visible - ${context}`);

                        // ==================== STEP 9: Wait for Build Completion ====================
                        log('info', `⏳ Waiting for build to complete (max ${DEFAULT_TIMEOUT_MS / 1000} seconds)...`);
                        await vsCodeDriver.page.screenshot(`${example.name}/Build in progress - ${context}`);
                        await expect.poll(async () => {
                            const output = await helpers.copyTerminalText(vsCodeDriver);
                            return /Program Size:\s*Code=\d+\s+RO-data=\d+\s+RW-data=\d+\s+ZI-data=\d+/i.test(output);
                        }, {
                            timeout: DEFAULT_TIMEOUT_MS,
                            intervals: [4000]
                        }).toBeTruthy();

                        await vsCodeDriver.page.screenshot(`${example.name}/After build complete - ${context}`);
                        log('info', '✅ Build completed successfully');

                        // ==================== STEP 10: Final Cleanup ====================
                        await vsCodeDriver.page.getCommands().runCommandFromPalette('Clear All Notifications');
                        await vsCodeDriver.page.getCommands().runCommandFromPalette('Clean all out and tmp directories');
                        log('info', '✅ Build test completed successfully');

                    } catch (error) {
                        log('error', '❌ Test failed:', error);
                        await vsCodeDriver.page.screenshot(`${example.name}/Test failure - ${context}`);
                        throw error;
                    }
                });
            });
        }
    }
});
