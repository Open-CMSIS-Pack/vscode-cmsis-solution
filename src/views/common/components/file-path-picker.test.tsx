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
import { createRoot } from 'react-dom/client';
import { FileLocationPicker } from './file-path-picker';
import { simulateChangeEvent } from '../../../__test__/dom-events';

describe('FileLocationPicker', () => {
    let container: Element;
    let mockOpenFilePicker: jest.Mock;
    let dispatch: jest.Mock;

    beforeEach(() => {
        container = document.createElement('div');
    });

    afterEach(() => {
        container.remove();
    });

    it('requests to open file on the browse button', async () => {
        dispatch = jest.fn();
        mockOpenFilePicker = jest.fn();

        React.act(() => {
            createRoot(container).render(<FileLocationPicker
                id={'create-solution-file-locator'}
                disabled={false}
                location='my-path'
                dispatch={dispatch}
                openFilePicker={mockOpenFilePicker}
            />);
        });
        const browseBtn = container.querySelector('.file-location-picker button') as HTMLButtonElement;

        expect(mockOpenFilePicker).toHaveBeenCalledTimes(0);

        React.act(() => {
            if (!browseBtn) {
                throw new Error('Browse button not found. Check the selector or component rendering.');
            }
            browseBtn.click();
        });

        expect(mockOpenFilePicker).toHaveBeenCalledTimes(1);
    });

    it('sets the location ', async () => {
        dispatch = jest.fn();
        mockOpenFilePicker = jest.fn();

        React.act(() => {
            createRoot(container).render(<FileLocationPicker
                id={'create-solution-file-locator'}
                disabled={false}
                location=''
                dispatch={dispatch}
                openFilePicker={mockOpenFilePicker}
            />);
        });
        const inputBox = container.querySelector('#create-solution-file-locator')! as HTMLInputElement;

        expect(dispatch).toHaveBeenCalledTimes(0);

        simulateChangeEvent(inputBox, 'my-location');

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({ type: 'SET_SOLUTION_LOCATION', solutionLocation: 'my-location' });
    });
});
