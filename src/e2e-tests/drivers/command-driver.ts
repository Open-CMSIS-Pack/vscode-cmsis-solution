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
 * Command Palette Driver
 *
 * This driver provides high-level automation for VS Code's command palette,
 * enabling tests to execute commands as a user would through the UI.
 *
 * Key responsibilities:
 * - Open command palette with keyboard shortcuts (cross-platform)
 * - Type and execute commands by name
 * - Provide shortcuts for common CMSIS commands (build, install packs)
 * - Wait for command completion dialogs
 */

import { Page } from 'playwright';
import { BUILDING_DIALOG_TIMEOUT_MS, PACK_INSTALL_TIMEOUT_MS } from '../constants';

export class CommandDriver {
    public constructor (private readonly page: Page) {}

    async runCommandFromPalette(command: string): Promise<void> {
        await this.page.keyboard.press(`${getMetaKey()}+Shift+KeyP`);
        await this.page.locator('.quick-input-box').waitFor({ state: 'visible' });
        await this.page.keyboard.type(command);
        this.page.locator('.quick-input-list').getByRole('link', { name: command });
        await this.page.keyboard.press('Enter');
    }

    async build(): Promise<void> {
        await this.runCommandFromPalette('CMSIS: Build');
        await this.page.getByRole('dialog', { name: 'Building' }).waitFor({ timeout: BUILDING_DIALOG_TIMEOUT_MS });
        await this.page.getByRole('dialog', { name: 'Building' }).waitFor({ state: 'hidden' });
    }

    async installMissingPacks(): Promise<void> {
        await this.runCommandFromPalette('CMSIS: Install required packs for active solution');
        await this.page.getByRole('dialog', { name: 'packs installed' }).waitFor({ timeout: PACK_INSTALL_TIMEOUT_MS });
    }
}

const getMetaKey = (): string => {
    if (process.platform === 'darwin') {
        return 'Meta';
    } else {
        return 'Control';
    }
};
