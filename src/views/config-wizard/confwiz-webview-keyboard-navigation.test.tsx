/**
 * Copyright 2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { ConfWizKeyboardNavigation } from './confwiz-webview-keyboard-navigation';

type KeyboardEventLike = React.KeyboardEvent;

const makeEvent = (key: string): KeyboardEventLike => ({
    key,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
} as unknown as KeyboardEventLike);

describe('ConfWizKeyboardNavigation', () => {
    it('uses the first visible key as default active', () => {
        const setActiveKey = jest.fn();
        const nav = new ConfWizKeyboardNavigation(setActiveKey);

        nav.addVisibleKey('first');
        nav.addVisibleKey('second');

        expect(nav.isActiveKey('first')).toBe(true);
        expect(nav.isActiveKey('second')).toBe(false);
    });

    it('moves focus to the next visible key', () => {
        const setActiveKey = jest.fn();
        const nav = new ConfWizKeyboardNavigation(setActiveKey);

        nav.addVisibleKey('a');
        nav.addVisibleKey('b');

        const rowA = document.createElement('span');
        const rowB = document.createElement('span');
        const focusSpy = jest.spyOn(rowB, 'focus');

        nav.registerRowRef('a')(rowA);
        nav.registerRowRef('b')(rowB);

        nav.moveFocusBy(1, 'a');

        expect(setActiveKey).toHaveBeenCalledWith('b');
        expect(focusSpy).toHaveBeenCalled();
    });

    it('handles ArrowDown and ArrowUp to move focus', () => {
        const setActiveKey = jest.fn();
        const nav = new ConfWizKeyboardNavigation(setActiveKey);

        nav.addVisibleKey('a');
        nav.addVisibleKey('b');
        nav.addVisibleKey('c');

        const rowA = document.createElement('span');
        const rowB = document.createElement('span');
        const rowC = document.createElement('span');
        const focusSpyB = jest.spyOn(rowB, 'focus');
        const focusSpyA = jest.spyOn(rowA, 'focus');

        nav.registerRowRef('a')(rowA);
        nav.registerRowRef('b')(rowB);
        nav.registerRowRef('c')(rowC);

        const downEvent = makeEvent('ArrowDown');
        nav.onRowKeyDown(downEvent, 'a');

        expect(downEvent.preventDefault).toHaveBeenCalled();
        expect(setActiveKey).toHaveBeenCalledWith('b');
        expect(focusSpyB).toHaveBeenCalled();

        const upEvent = makeEvent('ArrowUp');
        nav.onRowKeyDown(upEvent, 'b');

        expect(upEvent.preventDefault).toHaveBeenCalled();
        expect(setActiveKey).toHaveBeenCalledWith('a');
        expect(focusSpyA).toHaveBeenCalled();
    });

    it('handles Home and End to move to first or last visible row', () => {
        const setActiveKey = jest.fn();
        const nav = new ConfWizKeyboardNavigation(setActiveKey);

        nav.addVisibleKey('a');
        nav.addVisibleKey('b');
        nav.addVisibleKey('c');

        const rowA = document.createElement('span');
        const rowC = document.createElement('span');
        const focusSpyA = jest.spyOn(rowA, 'focus');
        const focusSpyC = jest.spyOn(rowC, 'focus');

        nav.registerRowRef('a')(rowA);
        nav.registerRowRef('c')(rowC);

        const homeEvent = makeEvent('Home');
        nav.onRowKeyDown(homeEvent, 'b');

        expect(homeEvent.preventDefault).toHaveBeenCalled();
        expect(setActiveKey).toHaveBeenCalledWith('a');
        expect(focusSpyA).toHaveBeenCalled();

        const endEvent = makeEvent('End');
        nav.onRowKeyDown(endEvent, 'a');

        expect(endEvent.preventDefault).toHaveBeenCalled();
        expect(setActiveKey).toHaveBeenCalledWith('c');
        expect(focusSpyC).toHaveBeenCalled();
    });

    it('toggles the row expander on ArrowRight', () => {
        const setActiveKey = jest.fn();
        const nav = new ConfWizKeyboardNavigation(setActiveKey);

        const tr = document.createElement('tr');
        const td = document.createElement('td');
        const row = document.createElement('span');
        const toggler = document.createElement('button');

        toggler.className = 'p-treetable-toggler';
        toggler.setAttribute('aria-expanded', 'false');
        const clickSpy = jest.spyOn(toggler, 'click');

        td.appendChild(row);
        tr.appendChild(td);
        tr.appendChild(toggler);
        document.body.appendChild(tr);

        nav.registerRowRef('row')(row);

        const event = makeEvent('ArrowRight');
        nav.onRowKeyDown(event, 'row');

        expect(event.preventDefault).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalled();

        document.body.removeChild(tr);
    });

    it('moves focus on ArrowRight when already expanded', () => {
        const setActiveKey = jest.fn();
        const nav = new ConfWizKeyboardNavigation(setActiveKey);

        nav.addVisibleKey('a');
        nav.addVisibleKey('b');

        const rowA = document.createElement('span');
        const rowB = document.createElement('span');
        const focusSpyB = jest.spyOn(rowB, 'focus');

        const tr = document.createElement('tr');
        const td = document.createElement('td');
        const toggler = document.createElement('button');
        toggler.className = 'p-treetable-toggler';
        toggler.setAttribute('aria-expanded', 'true');

        td.appendChild(rowA);
        tr.appendChild(td);
        tr.appendChild(toggler);
        document.body.appendChild(tr);

        nav.registerRowRef('a')(rowA);
        nav.registerRowRef('b')(rowB);

        const event = makeEvent('ArrowRight');
        nav.onRowKeyDown(event, 'a');

        expect(event.preventDefault).toHaveBeenCalled();
        expect(setActiveKey).toHaveBeenCalledWith('b');
        expect(focusSpyB).toHaveBeenCalled();

        document.body.removeChild(tr);
    });

    it('toggles the row expander on ArrowLeft when expanded', () => {
        const setActiveKey = jest.fn();
        const nav = new ConfWizKeyboardNavigation(setActiveKey);

        const tr = document.createElement('tr');
        const td = document.createElement('td');
        const row = document.createElement('span');
        const toggler = document.createElement('button');

        toggler.className = 'p-treetable-toggler';
        toggler.setAttribute('aria-expanded', 'true');
        const clickSpy = jest.spyOn(toggler, 'click');

        td.appendChild(row);
        tr.appendChild(td);
        tr.appendChild(toggler);
        document.body.appendChild(tr);

        nav.registerRowRef('row')(row);

        const event = makeEvent('ArrowLeft');
        nav.onRowKeyDown(event, 'row');

        expect(event.preventDefault).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalled();

        document.body.removeChild(tr);
    });

    it('moves focus on ArrowLeft when already collapsed', () => {
        const setActiveKey = jest.fn();
        const nav = new ConfWizKeyboardNavigation(setActiveKey);

        nav.addVisibleKey('a');
        nav.addVisibleKey('b');

        const rowA = document.createElement('span');
        const rowB = document.createElement('span');
        const focusSpyA = jest.spyOn(rowA, 'focus');

        const tr = document.createElement('tr');
        const td = document.createElement('td');
        const toggler = document.createElement('button');
        toggler.className = 'p-treetable-toggler';
        toggler.setAttribute('aria-expanded', 'false');

        td.appendChild(rowB);
        tr.appendChild(td);
        tr.appendChild(toggler);
        document.body.appendChild(tr);

        nav.registerRowRef('a')(rowA);
        nav.registerRowRef('b')(rowB);

        const event = makeEvent('ArrowLeft');
        nav.onRowKeyDown(event, 'b');

        expect(event.preventDefault).toHaveBeenCalled();
        expect(setActiveKey).toHaveBeenCalledWith('a');
        expect(focusSpyA).toHaveBeenCalled();

        document.body.removeChild(tr);
    });

    it('focuses the value widget on Enter', () => {
        const setActiveKey = jest.fn();
        const nav = new ConfWizKeyboardNavigation(setActiveKey);

        const valueWrapper = document.createElement('div');
        const input = document.createElement('input');
        const focusSpy = jest.spyOn(input, 'focus');
        valueWrapper.appendChild(input);

        nav.registerValueRef('row')(valueWrapper);

        const event = makeEvent('Enter');
        nav.onRowKeyDown(event, 'row');

        expect(event.preventDefault).toHaveBeenCalled();
        expect(focusSpy).toHaveBeenCalled();
    });

    it('focuses the value widget on F2', () => {
        const setActiveKey = jest.fn();
        const nav = new ConfWizKeyboardNavigation(setActiveKey);

        const valueWrapper = document.createElement('div');
        const input = document.createElement('input');
        const focusSpy = jest.spyOn(input, 'focus');
        valueWrapper.appendChild(input);

        nav.registerValueRef('row')(valueWrapper);

        const event = makeEvent('F2');
        nav.onRowKeyDown(event, 'row');

        expect(event.preventDefault).toHaveBeenCalled();
        expect(focusSpy).toHaveBeenCalled();
    });

    it('ignores unrelated keys', () => {
        const setActiveKey = jest.fn();
        const nav = new ConfWizKeyboardNavigation(setActiveKey);

        const event = makeEvent('Tab');
        nav.onRowKeyDown(event, 'row');

        expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('returns focus to the row on Escape from a value widget', () => {
        const setActiveKey = jest.fn();
        const nav = new ConfWizKeyboardNavigation(setActiveKey);

        const row = document.createElement('span');
        const focusSpy = jest.spyOn(row, 'focus');
        nav.registerRowRef('row')(row);

        const event = makeEvent('Escape');
        const handled = nav.onValueKeyDown(event, 'row');

        expect(handled).toBe(true);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
        expect(setActiveKey).toHaveBeenCalledWith('row');
        expect(focusSpy).toHaveBeenCalled();
    });
});
