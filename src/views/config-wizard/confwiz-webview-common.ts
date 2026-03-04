/**
 * Copyright 2023-2026 Arm Limited
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

import { NotificationType } from 'vscode-messenger-common';
import { EditRect } from './parser/cw-utils';

export enum GuiTypes {
    none,
    root,
    group,
    check,
    dropdown,
    edit
}

export interface MultiEdit {
    text: string;
    editRect: EditRect;
}

export interface GuiValue {
    value: string;
    checked? : boolean;
    readOnly: boolean;
    editRect?: EditRect;
    editStr?: string;
    hasChanged?: boolean;
    multiEdit?: MultiEdit[];
    inconsistent?: boolean;
    notFound?: boolean;
    overflow?: boolean;
    overflowValue?: number;
    extractedValue?: number;
    bitWidth?: number;
}

export interface ConfigWizardData {
    element: TreeNodeElement,
    documentPath: string;
    noAnnotationsFound: boolean;
}

export interface TreeNodeElement {
    guiId: number;
    name: string;
    type: GuiTypes;
    group: boolean,
    value: GuiValue;
    newValue: GuiValue;
    infoItems?: string[];
    dropItems?: string[];
    children?: TreeNodeElement[];
    errors?: string[];
}

// Host to Webview
export const setWizardDataType: NotificationType<ConfigWizardData> = { method: 'setWizardData' };
export const setPanelActiveType: NotificationType<{ active: boolean }> = { method: 'setPanelActive' };

// Webview to Host
export const readyType: NotificationType<void> = { method: 'ready' };
export const logMessageType: NotificationType<string> = { method: 'logMessage' };
export const saveElement: NotificationType<ConfigWizardData> = { method: 'saveElement' };
export const markDocumentDirty: NotificationType<{ documentPath: string }> = { method: 'markDocumentDirty' };
