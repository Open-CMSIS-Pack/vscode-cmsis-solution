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

import { renderHook } from '@testing-library/react';
import { useDisableContextMenu } from './use-disable-context-menu';

const dispatchContextMenu = (target: Element): MouseEvent => {
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
};

describe('useDisableContextMenu', () => {
    afterEach(() => {
        document.body.replaceChildren();
    });

    it('prevents the context menu outside editable fields', () => {
        const target = document.createElement('div');
        document.body.appendChild(target);
        const { unmount } = renderHook(() => useDisableContextMenu());

        expect(dispatchContextMenu(target).defaultPrevented).toBe(true);

        unmount();
    });

    it('prevents the context menu when non-editable text is selected', () => {
        const target = document.createElement('div');
        target.textContent = 'Selectable text';
        document.body.appendChild(target);
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(target);
        selection?.addRange(range);
        const { unmount } = renderHook(() => useDisableContextMenu());

        expect(dispatchContextMenu(target).defaultPrevented).toBe(true);

        selection?.removeAllRanges();
        unmount();
    });

    it.each([
        ['text input', '<input type="text">'],
        ['search input', '<input type="search">'],
        ['number input', '<input type="number">'],
        ['textarea', '<textarea></textarea>'],
        ['contenteditable region', '<div contenteditable="true"><span></span></div>'],
    ])('allows the context menu in a writable %s', (_name, markup) => {
        document.body.innerHTML = markup;
        const target = document.body.querySelector('span, input, textarea')!;
        const { unmount } = renderHook(() => useDisableContextMenu());

        expect(dispatchContextMenu(target).defaultPrevented).toBe(false);

        unmount();
    });

    it.each([
        ['read-only input', '<input type="text" readonly>'],
        ['disabled input', '<input type="text" disabled>'],
        ['checkbox', '<input type="checkbox">'],
        ['non-editable content', '<div contenteditable="false"><span></span></div>'],
    ])('prevents the context menu in a %s', (_name, markup) => {
        document.body.innerHTML = markup;
        const target = document.body.querySelector('span, input')!;
        const { unmount } = renderHook(() => useDisableContextMenu());

        expect(dispatchContextMenu(target).defaultPrevented).toBe(true);

        unmount();
    });

    it('removes the context menu listener on unmount', () => {
        const target = document.createElement('div');
        document.body.appendChild(target);
        const { unmount } = renderHook(() => useDisableContextMenu());

        unmount();

        expect(dispatchContextMenu(target).defaultPrevented).toBe(false);
    });
});
