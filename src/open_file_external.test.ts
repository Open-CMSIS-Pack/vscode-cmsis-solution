/**
 * Copyright 2024-2026 Arm Limited
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
import * as path from 'path';
import * as fs from 'node:fs';
import { MockOpenFileExternal } from './open-file-external.factories';
import { CMSIS_VSCODE_REDIRECTION_FILE_HTML, OpenFileExternal } from './open-file-external';
import { backToForwardSlashes } from './utils/path-utils';

describe('Open-file-external', () => {
    describe('openFile', () => {
        it('opens file which contains plain absolute path', async () => {
            const mockOpenFileExternal = new MockOpenFileExternal();
            const testFilePath = path.join(__dirname, '..', 'test-data', 'documentation', 'Documentation_with_Anchor.html');
            mockOpenFileExternal.openFile(testFilePath);
            console.log(`Command:  ${mockOpenFileExternal.calledCommand}`);
            expect(mockOpenFileExternal.calledCommand.includes(testFilePath)).toBe(true);
        });

        it('opens file with URL', async () => {
            const mockOpenFileExternal = new MockOpenFileExternal();
            const url = 'https://www.arm.com';
            mockOpenFileExternal.openFile(url);
            console.log(`Command:  ${mockOpenFileExternal.calledCommand}`);
            expect(mockOpenFileExternal.calledCommand.includes(url)).toBe(true);
        });

        it('writes redirection file', async () => {
            const mockOpenFileExternal = new MockOpenFileExternal();
            const redirectionFileName = OpenFileExternal.getRedirectionFileName();
            console.log(`Redirection file:  ${redirectionFileName}`);

            const testFilePath = backToForwardSlashes(path.join(__dirname, '..', 'test-data', 'documentation', 'Documentation_with_Anchor.html#HID'));
            if (fs.existsSync(redirectionFileName)) {
                fs.rmSync(redirectionFileName);
            }
            expect(fs.existsSync(redirectionFileName)).toBe(false);

            mockOpenFileExternal.openFile(testFilePath);
            console.log(`Command:  ${mockOpenFileExternal.calledCommand}`);
            // check if redirection file was created
            expect(fs.existsSync(redirectionFileName)).toBe(true);
            expect(mockOpenFileExternal.calledCommand.includes(CMSIS_VSCODE_REDIRECTION_FILE_HTML)).toBe(true);

            const content = fs.readFileSync(redirectionFileName, 'utf8');
            expect(content.includes(testFilePath)).toBe(true);
            fs.rmSync(redirectionFileName);
        });
    });
});
