/**
 * Copyright 2026 Arm Limited
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

import * as fs from 'fs';
import * as path from 'path';
import type { Page } from '@playwright/test';

/**
 * Custom screenshot utility that saves to specific paths without Playwright's automatic numbering
 */
export async function saveScreenshot(page: Page, screenshotPath: string): Promise<void> {
    const outputDir = path.join(process.cwd(), 'e2e-screenshots');
    const fullPath = path.join(outputDir, screenshotPath + '.png');
    const dir = path.dirname(fullPath);

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Take screenshot and save to custom path
    const screenshot = await page.screenshot({ type: 'png' });
    fs.writeFileSync(fullPath, screenshot);
}
