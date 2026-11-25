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

import '@testing-library/jest-dom';
import * as React from 'react';
import { act, render, screen } from '@testing-library/react';
import type { SettingsSection } from '../../settings-contract';
import { useSettingsColumnLayout } from './use-settings-column-layout';

/** Keeps layout notifications independent of host snapshot updates in these DOM-boundary tests. */
const sections: SettingsSection[] = [];

/** Retains a stable expansion state while layout and text change independently. */
const expanded: Record<string, boolean> = {};

/** Exercises the production hook with ordinary section markup and native focusable controls. */
function Layout({ labels, action = false }: { labels: string[]; action?: boolean }) {
    const ref = React.useRef<HTMLDivElement>(null);
    useSettingsColumnLayout(ref, sections, 'root', expanded);
    return (
        <div ref={ref} data-testid='pane'>
            {labels.map((label, index) => (
                <section key={index} className='settings-inline-row' style={{ columnGap: 16 }}>
                    <div className='settings-section-header'>
                        <span className='settings-label'>{label}</span>
                        {action && <button aria-label='Remove section'>×</button>}
                    </div>
                    <div className='settings-section-body'>
                        <div className='settings-field'><input aria-label={`Value ${index}`} defaultValue='saved' /></div>
                    </div>
                </section>
            ))}
        </div>
    );
}

describe('intrinsic settings columns', () => {
    let availableWidth: number;
    let resize: ResizeObserverCallback;
    let observer: ResizeObserver;
    let disconnect: jest.Mock;
    let observe: jest.Mock;
    let originalObserver: typeof ResizeObserver;

    beforeEach(() => {
        jest.useFakeTimers();
        availableWidth = 600;
        originalObserver = global.ResizeObserver;
        disconnect = jest.fn();
        observe = jest.fn();
        global.ResizeObserver = class {
            observe = observe;
            unobserve = jest.fn();
            disconnect = disconnect;
            constructor(callback: ResizeObserverCallback) {
                resize = callback;
                observer = this;
            }
        };
        jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
            let width = availableWidth;
            if (this.closest('.settings-layout-probe')) {
                width = 240;
                if (this.classList.contains('settings-section-header')) {
                    width = (this.querySelector('.settings-label')?.textContent?.length ?? 0) * 8;
                    if (this.querySelector('button')) {
                        width += 32;
                    }
                }
            }
            return { width, height: 32, top: 0, left: 0, right: width, bottom: 32, x: 0, y: 0, toJSON: () => ({}) };
        });
    });

    afterEach(() => {
        global.ResizeObserver = originalObserver;
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it('shares the longest natural header width and includes header actions without scheduling itself', async () => {
        const { container } = render(<Layout labels={['M0', 'Application']} action />);
        expect(screen.getByTestId('pane')).toHaveStyle({ '--settings-header-width': '120px' });
        for (const row of container.querySelectorAll('.settings-inline-row')) {
            expect(row).toHaveAttribute('data-inline-layout', 'columns');
        }
        expect(screen.getAllByRole('textbox')).toHaveLength(2);
        expect(container.querySelector('.settings-layout-probe')).toBeEmptyDOMElement();
        await act(async () => {});
        expect(jest.getTimerCount()).toBe(0);
    });

    it('stacks and restores columns without shrinking the natural header measurement or remounting inputs', () => {
        const { container } = render(<Layout labels={['M0', 'Application']} />);
        const field = screen.getByRole('textbox', { name: 'Value 0' });
        field.focus();
        availableWidth = 320;
        act(() => {
            resize([], observer);
            jest.runOnlyPendingTimers();
        });
        for (const row of container.querySelectorAll('.settings-inline-row')) {
            expect(row).toHaveAttribute('data-inline-layout', 'stacked');
        }
        expect(screen.getByTestId('pane')).toHaveStyle({ '--settings-header-width': '88px' });
        expect(field).toHaveFocus();
        availableWidth = 600;
        act(() => {
            resize([], observer);
            jest.runOnlyPendingTimers();
        });
        expect(container.querySelector('.settings-inline-row')).toHaveAttribute('data-inline-layout', 'columns');
        expect(screen.getByRole('textbox', { name: 'Value 0' })).toBe(field);
    });

    it('remeasures changed label text and cleans up observers and scheduled work on unmount', async () => {
        const { rerender, unmount, container } = render(<Layout labels={['M0']} />);
        expect(screen.getByTestId('pane')).toHaveStyle({ '--settings-header-width': '16px' });
        rerender(<Layout labels={['ApplicationProcessorWithAVeryLongName']} />);
        await act(async () => {});
        act(() => {
            jest.runOnlyPendingTimers();
        });
        expect(screen.getByTestId('pane')).toHaveStyle({ '--settings-header-width': '296px' });
        expect(observe).toHaveBeenCalledTimes(2);
        act(() => resize([], observer));
        unmount();
        expect(disconnect).toHaveBeenCalledTimes(1);
        expect(container.querySelector('.settings-layout-probe')).not.toBeInTheDocument();
        expect(jest.getTimerCount()).toBe(0);
    });

    it('keeps the shared column measurement local to each content pane', () => {
        render(<><Layout labels={['M0']} /><Layout labels={['Application']} /></>);
        const panes = screen.getAllByTestId('pane');
        expect(panes[0]).toHaveStyle({ '--settings-header-width': '16px' });
        expect(panes[1]).toHaveStyle({ '--settings-header-width': '88px' });
    });
});
