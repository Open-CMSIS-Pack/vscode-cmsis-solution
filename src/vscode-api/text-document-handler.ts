/**
 * Copyright 2023-2026 Arm Limited
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
import { Uri } from 'vscode';

export interface TextDocumentHandler {
    getDocumentText(path:string): Promise<string>;
    openFile(filePath: string, preview?: boolean): Promise<void>;
}

export class TextDocumentHandlerImpl implements TextDocumentHandler {
    public async getDocumentText(path: string): Promise<string> {
        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(path));
        return doc.getText();
    }

    public async openFile(filePath: string, preview?: boolean): Promise<void> {
        await vscode.window.showTextDocument(Uri.file(filePath), { preview: !!preview });
    }
}
