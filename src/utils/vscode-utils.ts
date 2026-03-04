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

import * as vscode from 'vscode';

/**
 * Displays an error message in the VS Code UI.
 *
 * This function acts as a proxy to `vscode.window.showErrorMessage` and can be mocked for testing purposes.
 *
 * @param msg - The error message to display. If not provided, no message is shown.
 */
export function showErrorMessage(msg?: string) {
    if (msg) {
        vscode.window.showErrorMessage(msg);
    }
}

/**
 * Retrieves the file system path of the first workspace folder in the current VS Code session.
 *
 * @returns The file system path of the first workspace folder, or an empty string if no workspace is open.
 */
export function getWorkspaceFolder() {
    return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? '';
}

