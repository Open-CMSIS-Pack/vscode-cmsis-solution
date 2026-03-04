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

import { Eta, EtaConfig } from 'eta';
import { ITreeItem } from './tree-item';

import '../generic/array';
import '../generic/map';

function render<T extends string>(eta: Eta, value: T, data: object): string | object;
function render<T extends []>(eta: Eta, value: T, data: object): T
function render<T extends object>(eta: Eta, value: T, data: object): T;
function render<T>(eta: Eta, value: T, data: object): T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function render(eta: Eta, value: any, data: object): unknown {
    let result = value;
    if (typeof value === 'string') {
        const renderedValue = eta.renderString(value, data).trim();
        try {
            result = JSON.parse(renderedValue);
        } catch {
            result = renderedValue;
        }
    } else if (Array.isArray(value)) {
        result = renderArray(eta, value, data);
    } else if (typeof value === 'object' && value !== null) {
        result = renderObject(eta, value, data);
    }
    return result;
}

function renderArray<T extends string>(eta: Eta, value: T[], data: object): string[];
function renderArray<T extends []>(eta: Eta, value: T, data: object): T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderArray(eta: Eta, value: any[], data: object): unknown[] {
    if (value.length > 0 && value.every(e => typeof e === 'string')) {
        const newValue = eta.renderString(value.join('\n'), data);
        return newValue.split('\n');
    }
    return value.map(e => render(eta, e, data));
}

function renderObject<T extends object>(eta: Eta, value: T, data: object): T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newValue = {} as any;
    for (const key in value) {
        const newKey = render(eta, key, data);
        if (typeof newKey === 'string') {
            newValue[newKey] = render(eta, value[key], data);
        }
    }
    return newValue;
};

/**
 * Extends the Eta class to add support for rendering objects and arrays, recursively.
 */
export class EtaExt extends Eta {

    /**
     * Create an extended ETA template engine
     * By default, autoFilter is enabled and a filter function that converts null/undefined to empty string and stringifies objects is used.
     * To disable the default behavior, set autoFilter to false or provide your own filter function.
     *
     * @param options Configuration options
     */
    constructor(options?: Partial<EtaConfig>) {
        const filter = (val: unknown) => {
            if (val === null || val === undefined) {
                return '';
            }
            switch (typeof val) {
                case 'string':
                    return val;
                case 'number':
                    return val.toString();
                case 'boolean':
                    return val.toString();
                case 'object':
                    if (val instanceof Map) {
                        return JSON.stringify(val.toObject());
                    }
                    return JSON.stringify(val);
            };
            return '';
        };
        super({ ...options,
            autoEscape: options?.autoEscape ?? (options?.escapeFunction !== undefined),
            autoFilter: options?.autoFilter ?? true,
            filterFunction: options?.filterFunction ?? filter
        });
    }

    /**
     * Renders a string, object, or array using the provided data.
     * @template T Type of the object to be rendered
     * @template V Type of the data to be used for rendering
     * @param obj Render all strings recursively in the object
     * @param data Data to be used for rendering
     * @returns Object with all strings rendered
     */
    renderObject<T extends object, V extends object>(obj: T, data: V): T {
        return render(this, obj, data);
    }
}

/**
 * Modifies supplied data by rendering data into it
 * @param item item to be modified
 * @param eta  the renderer
 * @param data data to be used for rendering
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderTreeItem(item: ITreeItem<any>, eta: Eta, data: object) {
    // Render attributes
    item.getAttributes()?.forEach((value, key) => {
        if (typeof value === 'string') {
            item.setAttribute(key, eta.renderString(value, data));
        }
    });
    // Render text
    const text = item.getText();
    if (typeof text === 'string') {
        item.setText(eta.renderString(text, data));
    }
    // Visit children recursively
    for (const child of item.getChildren()) {
        renderTreeItem(child, eta, data);
    }
}

