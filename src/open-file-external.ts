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

import { exec } from 'child_process';
import { IOpenFileExternal } from './open-file-external-if';
import { isWebAddress } from './util';
import * as fs from 'fs';
import { tmpNameSync } from 'tmp';

import { backToForwardSlashes } from './utils/path-utils';

export const CMSIS_VSCODE_REDIRECTION_FILE_HTML = 'cmsis_vscode_redirectionFile.html';

/**
 *  Class to call node_modules/open
 */
export class OpenFileExternal implements IOpenFileExternal {

    public openFile(filePath: string) {
        const adjustedFilePath = this.adjustFilePath(filePath);
        this.doOpenFile(this.getCommand(adjustedFilePath));
        if (adjustedFilePath !== filePath) {
            setTimeout(() => {
                try {
                    fs.unlinkSync(adjustedFilePath);
                } catch (error) {
                    console.error(`Error deleting redirection file ${adjustedFilePath}:`, error);
                }
            }, 60000);
        }
        return adjustedFilePath;
    }

    protected adjustFilePath(filePath: string) {
        if (!isWebAddress(filePath) && filePath.indexOf('#') > 0) {
            return this.writeRedirectionFile(filePath);
        }
        return filePath;
    }

    /**
     * Writes redirection file
     * @param filePath path to redirect
     * @returns redirected absolute filename
     */
    protected writeRedirectionFile(filePath: string) {
        filePath = backToForwardSlashes(filePath);
        filePath = `file:///${filePath}`;

        const redirectionFileName = tmpNameSync({ postfix: 'redirect.html' });
        const content = `
        <html>
        <head>
            <title>Help Redirect after 0 seconds</title>
            <meta http-equiv="refresh" content="0; URL=${filePath}">
            <meta name="keywords" content="automatic redirection">
        </head>
        <body>
            <p>If the automatic redirection is failing, click <a href="${filePath}">Help Redirect</a>.</p>
        </body>
        </html>
        `;

        try {
            fs.writeFileSync(redirectionFileName, content, 'utf8');
        } catch (error) {
            console.error(`Error writing file ${redirectionFileName}:`, error);
            return filePath; // in case of error, try opening the original link
        }

        return redirectionFileName;
    }

    protected getCommand(path: string) {
        switch (process.platform) {
            case 'darwin':
                return `open "${path}"`;
            case 'win32':
                return `start "" "${path}"`;
            default:
                return `xdg-open "${path}"`;
        }
    }

    protected doOpenFile(command: string) {
        return exec(command, (error) => {
            if (error) {
                console.error(`Error executing command: ${command}`, error);
            }
        });
    }
}
