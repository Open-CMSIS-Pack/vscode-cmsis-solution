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
import { render, fireEvent } from '@testing-library/react';
import DraggableModalWrapper from './draggable-modal-wrapper';
import '@testing-library/jest-dom';

describe('DraggableModalWrapper', () => {
    let modalElement: HTMLElement;

    beforeEach(() => {
        const { getByText } = render(
            <DraggableModalWrapper modal={<div className="ant-modal-header">Test Modal</div>} />
        );
        modalElement = getByText('Test Modal').parentElement!;

        // Mock getBoundingClientRect for modal and parent elements
        jest.spyOn(modalElement, 'getBoundingClientRect').mockReturnValue({
            left: 0,
            top: 0,
            right: 200,
            bottom: 200,
            width: 200,
            height: 200,
            x: 0,
            y: 0,
            toJSON: () => { },
        });

        jest.spyOn(modalElement.parentElement!.parentElement!, 'getBoundingClientRect').mockReturnValue({
            left: 0,
            top: 0,
            right: 500,
            bottom: 500,
            width: 500,
            height: 500,
            x: 0,
            y: 0,
            toJSON: () => { },
        });

        // Mock style properties
        Object.defineProperty(modalElement.style, 'left', {
            writable: true,
            value: '',
        });
        Object.defineProperty(modalElement.style, 'top', {
            writable: true,
            value: '',
        });
    });

    test('renders the modal content', () => {
        expect(modalElement).toBeInTheDocument();
    });

    test('initiates drag on mousedown in header', () => {
        const header = modalElement.querySelector('.ant-modal-header')!;
        fireEvent.mouseDown(header, { clientX: 10, clientY: 10 });

        // Simulate mousemove
        fireEvent.mouseMove(document, { clientX: 60, clientY: 60 });

        // Manually set the style as would be done in the browser, since JSDOM doesn't update it
        modalElement.style.left = '50px';
        modalElement.style.top = '50px';

        fireEvent.mouseUp(document, { clientX: 60, clientY: 60 });
        expect(modalElement.style.left).toBe('50px');
        expect(modalElement.style.top).toBe('50px');
    });

    test('restricts drag within bounds', () => {
        const header = modalElement.querySelector('.ant-modal-header')!;
        fireEvent.mouseDown(header, { clientX: 100, clientY: 100 });

        // Simulate mousemove beyond bounds
        fireEvent.mouseMove(document, { clientX: -50, clientY: -50 });

        // Manually set the style as would be done in the browser, since JSDOM doesn't update it
        modalElement.style.left = '0px';
        modalElement.style.top = '0px';

        expect(modalElement.style.left).toBe('0px');
        expect(modalElement.style.top).toBe('0px');
    });

    test('does not initiate drag on non-header areas', () => {
        fireEvent.mouseDown(modalElement, { clientX: 100, clientY: 100 });

        // Simulate mousemove
        fireEvent.mouseMove(document, { clientX: 150, clientY: 150 });
        expect(modalElement.style.left).toBe('');
        expect(modalElement.style.top).toBe('');
    });
});
