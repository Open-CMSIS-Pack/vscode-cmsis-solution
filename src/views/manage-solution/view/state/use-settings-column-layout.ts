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

import * as React from 'react';
import type { SettingsSection } from '../../settings-contract';

/** Copies presentation markup into an inert measurement area without duplicating document identities. */
function measurementCopy(element: HTMLElement): HTMLElement {
    const copy = element.cloneNode(true) as HTMLElement;
    copy.removeAttribute('id');
    for (const child of copy.querySelectorAll('[id]')) {
        child.removeAttribute('id');
    }
    return copy;
}

/**
 * Aligns visible static subsection headers using intrinsic sizes independent of their current wrapping.
 * Observes pane and row resizing, content changes, theme changes and font loading until unmounted.
 */
export function useSettingsColumnLayout(
    containerRef: React.RefObject<HTMLElement>,
    sections: SettingsSection[],
    activeId: string | undefined,
    expanded: Record<string, boolean>,
): void {
    React.useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container || typeof ResizeObserver === 'undefined') {
            return;
        }

        const probe = document.createElement('div');
        probe.className = 'settings-layout-probe';
        probe.setAttribute('aria-hidden', 'true');
        probe.inert = true;
        container.append(probe);
        let frame: number | undefined;
        let disposed = false;
        const observedRows = new Set<HTMLElement>();

        /** Measures natural headers and controls, then changes only layout attributes and shared column width. */
        function measure(): void {
            frame = undefined;
            const rows = Array.from(container!.querySelectorAll<HTMLElement>('.settings-inline-row'))
                .filter(row => !probe.contains(row) && row.getBoundingClientRect().width > 0);
            const currentRows = new Set(rows);
            for (const row of observedRows) {
                if (!currentRows.has(row)) {
                    resizeObserver.unobserve(row);
                    observedRows.delete(row);
                }
            }

            let headerWidth = 0;
            let controlsWidth = 0;
            for (const row of rows) {
                if (!observedRows.has(row)) {
                    resizeObserver.observe(row);
                    observedRows.add(row);
                }
                const sample = row.cloneNode(false) as HTMLElement;
                sample.removeAttribute('id');
                sample.removeAttribute('data-inline-layout');
                sample.classList.add('settings-layout-sample');
                const header = row.querySelector<HTMLElement>(':scope > .settings-section-header');
                const headerCopy = header ? measurementCopy(header) : undefined;
                const body = document.createElement('div');
                body.className = 'settings-section-body';
                for (const field of row.querySelectorAll<HTMLElement>(':scope > .settings-section-body > .settings-field')) {
                    body.append(measurementCopy(field));
                }
                if (headerCopy) {
                    sample.append(headerCopy);
                }
                sample.append(body);
                probe.append(sample);
                if (headerCopy) {
                    headerWidth = Math.max(headerWidth, headerCopy.getBoundingClientRect().width);
                }
                controlsWidth = Math.max(controlsWidth, body.getBoundingClientRect().width);
            }
            probe.replaceChildren();

            const columnWidth = `${Math.ceil(headerWidth)}px`;
            if (container!.style.getPropertyValue('--settings-header-width') !== columnWidth) {
                container!.style.setProperty('--settings-header-width', columnWidth);
            }
            for (const row of rows) {
                const gap = Number.parseFloat(getComputedStyle(row).columnGap) || 0;
                const fits = row.getBoundingClientRect().width >= Math.ceil(headerWidth) + gap + Math.ceil(controlsWidth);
                const layout = fits ? 'columns' : 'stacked';
                if (row.dataset.inlineLayout !== layout) {
                    row.dataset.inlineLayout = layout;
                }
            }
        }

        /** Batches observer notifications into one measurement before the next paint. */
        function schedule(): void {
            if (!disposed && frame === undefined) {
                frame = requestAnimationFrame(measure);
            }
        }

        const resizeObserver = new ResizeObserver(schedule);
        resizeObserver.observe(container);
        const contentObserver = new MutationObserver(records => {
            if (records.some(record => !probe.contains(record.target))) {
                schedule();
            }
        });
        contentObserver.observe(container, { childList: true, characterData: true, subtree: true });
        const themeObserver = new MutationObserver(schedule);
        themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class', 'style'] });
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
        const fonts = document.fonts;
        fonts?.addEventListener('loadingdone', schedule);
        void fonts?.ready.then(schedule);
        measure();

        return () => {
            disposed = true;
            if (frame !== undefined) {
                cancelAnimationFrame(frame);
            }
            resizeObserver.disconnect();
            contentObserver.disconnect();
            themeObserver.disconnect();
            fonts?.removeEventListener('loadingdone', schedule);
            probe.remove();
            container.style.removeProperty('--settings-header-width');
            for (const row of observedRows) {
                delete row.dataset.inlineLayout;
            }
        };
    }, [containerRef, sections, activeId, expanded]);
}
