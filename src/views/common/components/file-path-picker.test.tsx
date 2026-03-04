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
        const browseBtn = container.querySelector('.file-location-picker vscode-button') as HTMLButtonElement;

        expect(mockOpenFilePicker).toHaveBeenCalledTimes(0);

        React.act(() => {
            browseBtn!.click();
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
        expect(dispatch).toHaveBeenCalledWith({ type: 'SET_SOLUTION_LOCATION' , solutionLocation: 'my-location' });
    });
});
