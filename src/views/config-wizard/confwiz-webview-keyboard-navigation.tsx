/**
 * Copyright 2026 Arm Limited
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

import React from 'react';

/**
 * Implements the roving tabindex interaction pattern for keyboard navigation in the 'Config Wizard' webview.
 */
export class ConfWizKeyboardNavigation {
    /*
     * Keyboard Navigation Reference
     *
     * | Key                        | Behavior                                                              |
     * |----------------------------|-----------------------------------------------------------------------|
     * | ArrowDown / ArrowUp        | Move to the next/previous visible row                                 |
     * | Home / End                 | Move to the first/last visible row                                    |
     * | ArrowRight                 | Expand row if collapsed and has children; otherwise move to next row  |
     * | ArrowLeft                  | Collapse row if expanded; otherwise move to previous row              |
     * | Enter / F2                 | Focus the value control of the active row                             |
     * | Escape (in value control)  | Return focus to the active row                                        |
     */

    // Roving tabindex: only the active row is focusable, others are tabIndex=-1.
    private readonly rowRefs = new Map<string, HTMLElement>();
    private readonly valueRefs = new Map<string, HTMLElement>();
    private visibleKeys: string[] = [];
    private readonly setActiveKey: (key: string) => void;

    public constructor(setActiveKey: (key: string) => void) {
        this.setActiveKey = setActiveKey;
    }

    public reset(): void {
        this.rowRefs.clear();
        this.valueRefs.clear();
        this.visibleKeys = [];
    }

    public resetVisibleKeys(): void {
        // Rebuilt each render from the visible rows in order.
        this.visibleKeys = [];
    }

    public addVisibleKey(key: string): void {
        this.visibleKeys.push(key);
    }

    public getVisibleKeys(): string[] {
        return this.visibleKeys;
    }

    public isActiveKey(key: string, activeKey?: string): boolean {
        if (activeKey) {
            return activeKey === key;
        }
        // Default focus goes to the first visible row.
        return this.visibleKeys[0] === key;
    }

    public readonly registerRowRef = (key: string) => (element: HTMLElement | null): void => {
        if (element) {
            this.rowRefs.set(key, element);
        } else {
            this.rowRefs.delete(key);
        }
    };

    public readonly registerValueRef = (key: string) => (element: HTMLElement | null): void => {
        if (element) {
            this.valueRefs.set(key, element);
        } else {
            this.valueRefs.delete(key);
        }
    };

    public focusRowByKey(key: string): void {
        const rowElement = this.rowRefs.get(key);
        if (rowElement) {
            rowElement.focus();
        }
    }

    public focusValueByKey(key: string): void {
        const valueElement = this.valueRefs.get(key);
        if (!valueElement) {
            return;
        }

        const focusTarget = valueElement.querySelector<HTMLElement>(
            'input, select, textarea, vscode-checkbox, vscode-text-field, vscode-dropdown, [tabindex]'
        );
        focusTarget?.focus();
    }

    public moveFocusBy(delta: number, key: string): void {
        // Arrow/Home/End shift the active row and programmatically focus it.
        if (this.visibleKeys.length === 0) {
            return;
        }
        const currentIndex = Math.max(0, this.visibleKeys.indexOf(key));
        const nextIndex = Math.min(this.visibleKeys.length - 1, Math.max(0, currentIndex + delta));
        const nextKey = this.visibleKeys[nextIndex];
        if (nextKey) {
            this.setActiveKey(nextKey);
            this.focusRowByKey(nextKey);
        }
    }

    public onRowKeyDown(event: React.KeyboardEvent, key: string): void {
        // Handle navigation only when the row itself has focus.
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.moveFocusBy(1, key);
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.moveFocusBy(-1, key);
                break;
            case 'Home':
                event.preventDefault();
                if (this.visibleKeys.length > 0) {
                    const firstKey = this.visibleKeys[0];
                    this.setActiveKey(firstKey);
                    this.focusRowByKey(firstKey);
                }
                break;
            case 'End':
                event.preventDefault();
                if (this.visibleKeys.length > 0) {
                    const lastKey = this.visibleKeys[this.visibleKeys.length - 1];
                    this.setActiveKey(lastKey);
                    this.focusRowByKey(lastKey);
                }
                break;
            case 'ArrowRight': {
                event.preventDefault();
                const toggler = this.getRowToggler(key);
                if (toggler && toggler.getAttribute('aria-expanded') !== 'true') {
                    toggler.click();
                } else {
                    this.moveFocusBy(1, key);
                }
                break;
            }
            case 'ArrowLeft': {
                event.preventDefault();
                const toggler = this.getRowToggler(key);
                if (toggler && toggler.getAttribute('aria-expanded') === 'true') {
                    toggler.click();
                } else {
                    this.moveFocusBy(-1, key);
                }
                break;
            }
            case 'Enter':
            case 'F2':
                event.preventDefault();
                this.focusValueByKey(key);
                break;
            default:
                break;
        }
    }

    public onValueKeyDown(event: React.KeyboardEvent, key: string): boolean {
        // Escape returns focus from a value widget back to the row.
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            this.setActiveKey(key);
            this.focusRowByKey(key);
            return true;
        }

        return false;
    }

    private getRowToggler(key: string): HTMLButtonElement | null {
        const rowElement = this.rowRefs.get(key);
        const rowContainer = rowElement?.closest('tr');
        if (!rowContainer) {
            return null;
        }
        return rowContainer.querySelector<HTMLButtonElement>('.p-treetable-toggler');
    }
}
