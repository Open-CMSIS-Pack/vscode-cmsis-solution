/**
 * Copyright (C) 2021-2026 Arm Limited
 */



import { createRoot, Root } from 'react-dom/client';
import * as React from 'react';
import { Simulate } from 'react-dom/test-utils';
import { Dropdown } from './dropdown';

const ESC_KEY = 27;

describe('Dropdown', () => {
    let container: Element;
    let root: Root;

    beforeEach(() => {
        container = document.createElement('div');
        root = createRoot(container);
    });

    afterEach(() => {
        React.act(() => {
            root.unmount();
        });

        container.remove();
    });

    describe('expanded flag', () => {
        it('renders content when true', () => {
            React.act(() => {
                root.render(
                    <Dropdown
                        content={<li></li>}
                        expanded={true}
                        onClose={jest.fn()}
                    />
                );
            });

            expect(container.querySelector('li')).toBeDefined();
        });

        it('does not render content when false', () => {
            React.act(() => {
                root.render(
                    <Dropdown
                        content={<li></li>}
                        expanded={false}
                        onClose={jest.fn()}
                    />
                );
            });

            expect(container.querySelector('li')).toBeNull();
        });
    });

    describe('onClose', () => {
        it('is called when ESCAPE key is pressed', () => {
            const onClose = jest.fn();
            React.act(() => {
                root.render(
                    <Dropdown
                        content={<li id="test-target"></li>}
                        expanded={true}
                        onClose={onClose}
                    />,
                );
            });

            expect(onClose).not.toHaveBeenCalled();
            const dropdownElement = container.querySelector('#test-target');
            React.act(() => {
                Simulate.keyDown(dropdownElement!, { keyCode: ESC_KEY });
            });
            expect(onClose).toHaveBeenCalled();
        });

        it('is called when the body is clicked', () => {
            const onClose = jest.fn();
            React.act(() => {
                root.render(
                    <Dropdown
                        content={<ul></ul>}
                        expanded={true}
                        onClose={onClose}
                    />,
                );
            });

            expect(onClose).not.toHaveBeenCalled();
            React.act(() => {
                // We can't use Simulate for events on non-React elements
                document.body.dispatchEvent(new Event('click'));
            });
            expect(onClose).toHaveBeenCalled();
        });

        it('is not called when an element in the dropdown content is clicked', () => {
            const onClose = jest.fn();
            React.act(() => {
                root.render(
                    <Dropdown
                        content={<ul><li id="target" /></ul>}
                        expanded={true}
                        onClose={onClose}
                    />,
                );
            });

            const targetElement = container.querySelector('#target');
            React.act(() => {
                Simulate.click(targetElement!);
            });
            expect(onClose).not.toHaveBeenCalled();
        });
    });
});
