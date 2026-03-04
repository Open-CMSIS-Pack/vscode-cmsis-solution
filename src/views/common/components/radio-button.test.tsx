/*
 * Copyright (c) 2023-2026 Arm Limited
 */

import 'jest';
import { Simulate } from 'react-dom/test-utils';
import { RadioButton, RadioButtonProps } from './radio-button';
import { createRoot } from 'react-dom/client';
import React from 'react';

const baseProps: RadioButtonProps<string> = {
    onChange: jest.fn(),
    selectedValue: 'value1',
    values: ['value1', 'value2', 'value3'],
    disabled: false,
    id: 'test-id',
};

describe('RadioButton', () => {
    let container = document.createElement('div');

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
    });

    it('renders one radio option for each value', () => {
        const testValues = baseProps.values;
        React.act(() => {
            createRoot(container).render(<RadioButton {...baseProps} />);
        });

        const labelEls = container.querySelectorAll('label');
        expect(labelEls.length).toBe(3);
        expect(labelEls[0].textContent).toBe(testValues[0]);
        expect(labelEls[0].querySelector('input[type=radio]')).toBeTruthy();
        expect(labelEls[1].textContent).toBe(testValues[1]);
        expect(labelEls[1].querySelector('input[type=radio]')).toBeTruthy();
        expect(labelEls[2].textContent).toBe(testValues[2]);
        expect(labelEls[2].querySelector('input[type=radio]')).toBeTruthy();
    });

    it('adds the selected value to the label representing the selected value', () => {
        const newSelected: RadioButtonProps<string> = { ...baseProps, selectedValue: 'value3' };
        React.act(() => {
            createRoot(container).render(<RadioButton {...newSelected} />);
        });

        const labelEls = container.querySelectorAll('label');
        expect(labelEls[0].classList).not.toContain('selected');
        expect(labelEls[1].classList).not.toContain('selected');
        expect(labelEls[2].classList).toContain('selected');
    });

    it('calls onChange when a radio button is clicked', () => {
        const value = baseProps.values[2];
        const onChange = jest.fn();

        React.act(() => {
            createRoot(container).render(<RadioButton id={baseProps.id} onChange={onChange} values={baseProps.values} selectedValue='value1' disabled={baseProps.disabled} />);
        });

        const inputEl = container.querySelectorAll('input')[2];

        React.act(() => {
            Simulate.change(inputEl!);
        });

        expect(onChange).toHaveBeenCalledWith(value);
    });
});
