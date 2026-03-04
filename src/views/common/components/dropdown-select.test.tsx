/**
 * Copyright (C) 2022-2026 Arm Limited
 */



import { createRoot, Root } from 'react-dom/client';
import * as React from 'react';
import { Simulate } from 'react-dom/test-utils';
import { DropdownSelect, DropdownSelectProps } from './dropdown-select';

const baseProps: DropdownSelectProps = {
    text: 'Initial text',
    id: 'test-id',
    dropdownContent: () => <div id='the-content' />,
    label: '',
    disabled: false
};

describe('DropdownSelect', () => {
    let root: Root;
    let container: Element;

    beforeEach(() => {
        container = document.createElement('div');
        root = createRoot(container);
    });

    afterEach(() => {
        container.remove();
    });

    it('renders the input text', () => {
        React.act(() => {
            root.render(<DropdownSelect {...baseProps} />);
        });

        const inputEl = container.querySelector('.dropdown-select-input');
        expect(inputEl).toBeTruthy();
        expect(inputEl!.textContent).toContain(baseProps.text);
    });

    it('does not render the close icon when clearSelection is not provided', () => {
        React.act(() => {
            root.render(<DropdownSelect {...baseProps} />);
        });

        const clearButton = container.querySelector('[title="clear-selection"]');
        expect(clearButton).toBeNull();
    });

    it('calls the clearSelection function when the close icon is clicked', () => {
        baseProps.onClear = jest.fn();

        React.act(() => {
            root.render(<DropdownSelect {...baseProps} />);
        });
        const clearButton = container.querySelector('[title="clear-selection"]') as HTMLButtonElement;

        React.act(() => {
            Simulate.click(clearButton);
        });

        expect(baseProps.onClear).toHaveBeenCalledTimes(1);
    });

    it('does not disable the input when the disabled prop is false', () => {
        React.act(() => {
            root.render(<DropdownSelect {...baseProps} disabled={false} />);
        });

        const inputEl = container.querySelector('.dropdown-select-input') as HTMLDivElement;
        expect(inputEl!.getAttribute('aria-disabled')).toBe('false');
    });

    it('disables the input when the disabled prop is true', () => {
        React.act(() => {
            root.render(<DropdownSelect {...baseProps} disabled={true} />);
        });

        const inputEl = container.querySelector('.dropdown-select-input') as HTMLDivElement;
        expect(inputEl?.getAttribute('aria-disabled')).toBe('true');
    });

    it('renders the extra className if provided', () => {
        React.act(() => {
            root.render(<DropdownSelect {...baseProps} className='extra-class' />);
        });

        const inputEl = container.querySelector('.dropdown-select');
        expect(inputEl!.classList).toContain('extra-class');
    });

    it('initially renders the dropdown closed', () => {
        React.act(() => {
            root.render(<DropdownSelect {...baseProps} />);
        });

        expect(container.querySelector('#the-content')).toBeFalsy();
    });

    it('opens the dropdown on clicking the input', () => {
        React.act(() => {
            root.render(<DropdownSelect {...baseProps} />);
        });

        const inputEl = container.querySelector('.dropdown-select-input');

        React.act(() => {
            Simulate.click(inputEl!);
        });

        expect(container.querySelector('#the-content')).toBeTruthy();
    });

    it('closes the dropdown on click outside of the input element', () => {
        React.act(() => {
            root.render(<DropdownSelect {...baseProps} />);
        });

        const inputEl = container.querySelector('.dropdown-select-input');

        React.act(() => {
            Simulate.click(inputEl!);
            Simulate.click(container);
        });

        expect(container.querySelector('#the-content')).toBeTruthy();
    });
});
