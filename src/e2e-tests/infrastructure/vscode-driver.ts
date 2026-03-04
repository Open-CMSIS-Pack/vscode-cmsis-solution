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

/**
 * VS Code Driver - Main Test Orchestration Layer
 *
 * This is the primary interface for controlling VS Code during E2E tests. VsCodeDriver
 * manages the complete lifecycle of a VS Code instance, including startup, workspace
 * switching, state cleanup, and shutdown.
 *
 * Key responsibilities:
 * - VS Code instance lifecycle management (start, stop, state tracking)
 * - Workspace switching via reload mechanism (maintains single VS Code instance)
 * - Test state cleanup (close editors, clear notifications, dismiss dialogs)
 * - Page driver access for UI interactions
 * - Message box response mocking for automated testing
 */

import { Page, ElectronApplication } from 'playwright';
import { ELECTRON_APPLICATION_CLOSED_MESSAGE, getPage, mockShowMessageBoxResponse, setupElectronLogging } from './electron';
import { TestDirectories, tryCleanTestDirectories, createTestDirectories, createWorkspace } from './test-directories';
import { getVsCode, installExtension, launchVsCode } from './vscode';
import { PageDriver } from '../drivers/page-driver';
import { initializeExtensionCache } from '../utils/install-extensions';
import { log } from '../utils/logger';
import { DEFAULT_TIMEOUT_MS } from '../constants';

type RunningApp = {
    pageDriver: PageDriver;
    electronApp: ElectronApplication;
    testDirectories: TestDirectories;
}

type State
    = { type: 'idle' }
    | { type: 'starting', cancelled: boolean }
    | { type: 'running' } & RunningApp
    | { type: 'stopping' }

const requireRunning = (state: State): RunningApp => {
    if (state.type !== 'running') {
        throw new Error(`Tried to get page driver when the application was not running. The app state is ${state.type}.`);
    }

    return state;
};

export class VsCodeDriver {
    private state: State = { type: 'idle' };

    async startWithWorkspaceContents(workspaceSourceDir: string | undefined): Promise<void> {
        if (this.state.type !== 'idle') {
            throw new Error('Tried to start app multiple times');
        }

        this.state = { type: 'starting', cancelled: false };

        let runningApp: RunningApp;

        try {
            runningApp = await this.setupAndStartApp(workspaceSourceDir);
        } catch (error) {
            this.state = { type: 'idle' };
            throw error;
        }

        const finalState = this.state;
        this.state = { type: 'running', ...runningApp };

        if (finalState.cancelled) {
            this.stop();
        }
    }

    private async setupAndStartApp(workspaceSourceDir: string | undefined): Promise<RunningApp> {
        const testDirectories = await this.setupTestDirectories(workspaceSourceDir);

        try {
            // Only install Environment Manager if we're starting with an actual workspace
            // This avoids errors when starting with empty workspace (undefined)
            const extensionsToInstall = workspaceSourceDir ? ['Arm.environment-manager'] : [];
            const vsCodeExecutablePath = await this.setupVsCodeAndGetExecutable(testDirectories, extensionsToInstall);

            initializeExtensionCache(vsCodeExecutablePath, testDirectories);

            const electronApp = await launchVsCode({ testDirectories, vsCodeExecutablePath, defaultTimeoutMillis: DEFAULT_TIMEOUT_MS });
            try {
                const page = await this.setupPage(electronApp);
                const pageDriver = new PageDriver(page);
                try {
                    await pageDriver.waitForVsCodeToBeReady();
                    await pageDriver.waitForActionItem('CMSIS');
                } catch (error) {
                    await pageDriver.screenshot('After failed start');
                    throw error;
                }
                return { pageDriver, electronApp, testDirectories };
            } catch (error) {
                await electronApp.close();
                throw error;
            }
        } catch (error) {
            await tryCleanTestDirectories(testDirectories);
            throw error;
        }
    }

    private async setupTestDirectories(workspaceSourceDir: string | undefined): Promise<TestDirectories> {
        const testDirectories = await createTestDirectories();

        await createWorkspace({
            sourceDir: workspaceSourceDir,
            testDirectories
        });

        return testDirectories;
    }

    private async setupVsCodeAndGetExecutable(testDirectories: TestDirectories, extensionIds: string[]): Promise<string> {
        const vsCodeExecutablePath = await getVsCode();
        for (const extensionId of extensionIds) {
            await installExtension({ extensionId, vsCodeExecutablePath, testDirectories });
        }
        return vsCodeExecutablePath;
    }

    private async setupPage(electronApp: ElectronApplication): Promise<Page> {
        let page: Page;
        try {
            page = await getPage(electronApp);
        } catch (e) {
            if (e instanceof Error && e.message === ELECTRON_APPLICATION_CLOSED_MESSAGE) {
                throw new Error(
                    e.message +
                    ', this can happen if VS Code is not properly isolated from the user system.' +
                    'Please check arguments used to launch VS Code.' +
                    'Alternatively, close any other running instances of VS Code and try again'
                );
            } else {
                throw e;
            }
        }
        setupElectronLogging(page);
        return page;
    }

    async stop(): Promise<void> {
        const initialState = this.state;

        if (initialState.type === 'running') {
            this.state = { type: 'stopping' };
            await initialState.electronApp.close();
            await tryCleanTestDirectories(initialState.testDirectories);
        } else if (this.state.type === 'starting') {
            this.state = { type: 'starting', cancelled: true };
        } else {
            throw new Error('Tried to stop when the app was not running');
        }
    }

    get page(): PageDriver {
        const runningApp = requireRunning(this.state);
        return runningApp.pageDriver;
    }

    get testWorkspaceDirectory(): string {
        const runningApp = requireRunning(this.state);
        return runningApp.testDirectories.workspace;
    }

    /**
     * Mock electron's native message box dialog.
     * @param buttonNameToClick Name of the button to click in the next dialog opened during the test run
     */
    async mockShowMessageBoxResponse(buttonNameToClick: string) {
        const runningApp = requireRunning(this.state);
        await mockShowMessageBoxResponse(runningApp.electronApp, buttonNameToClick);
    }

    /**
     * Switches the current VS Code instance to a new workspace.
     * Allows reusing the same VS Code instance across tests while isolating workspaces.
     */
    async switchToWorkspace(sourceWorkspaceDir: string): Promise<void> {
        const runningApp = requireRunning(this.state);

        log('debug', `📁 Copying workspace from ${sourceWorkspaceDir} to test directory...`);

        await createWorkspace({
            sourceDir: sourceWorkspaceDir,
            testDirectories: runningApp.testDirectories
        });

        await mockShowMessageBoxResponse(runningApp.electronApp, 'Always Allow');

        // log('debug', '🔄 Reloading VS Code to load new workspace content...');
        // await runningApp.pageDriver.getCommands().runCommandFromPalette('Developer: Reload Window');
        // await new Promise(resolve => setTimeout(resolve, WORKSPACE_RELOAD_DELAY_MS));

        log('info', `✅ Switched to workspace: ${runningApp.testDirectories.workspace}`);
    }

    /**
     * Cleans up test-specific state while keeping VS Code running.
     */
    async cleanupTestState(): Promise<void> {
        const runningApp = requireRunning(this.state);

        try {
            await runningApp.pageDriver.getCommands().runCommandFromPalette('View: Close All Editors');
            await runningApp.pageDriver.getCommands().runCommandFromPalette('Notifications: Clear All Notifications');
            await runningApp.pageDriver.getCommands().runCommandFromPalette('View: Kill All Terminals');
            await runningApp.pageDriver.getCommands().runCommandFromPalette('View: Reset View Locations');

            log('info', '🧹 Test state cleaned up successfully');
        } catch (error) {
            log('warn', '⚠️ Some cleanup operations failed:', error);
        }
    }
}
