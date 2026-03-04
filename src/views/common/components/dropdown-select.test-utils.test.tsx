/**
 * Copyright (C) 2024-2026 Arm Limited
 */

import { simulateClickEvent } from '../../../__test__/dom-events';

describe('Dropdown Select Utils', () => {
    it('nop', () => {
        /*
            These utilities are test-only exports intended for use in dropdown-select.test.tsx.
            However, qlty requires these test utilities to have associated tests. As a result,
            this file is named as a .test.tsx file and includes an empty test stub.
        */
    });
});

export const openDropdown = (containsDropdown: Element) => {
    const dropdownToggle = containsDropdown.querySelector('.dropdown-select-input');
    simulateClickEvent(dropdownToggle!);
};

export const openCompactDropdown = (containsDropdown: Element) => {
    const dropdownToggle = containsDropdown.querySelector('.compact-dropdown-trigger');
    simulateClickEvent(dropdownToggle!);
};

export const selectCompactDropdownOption = (containsDropdown: Element, byValue: string) => {
    simulateClickEvent(containsDropdown.querySelector(`li[data-value=${byValue}]`)!);
};

export const getSelected = (containsDropdown: Element) => {
    const dropdownSelected = containsDropdown.querySelector('.dropdown-select-input-text');
    return dropdownSelected!.innerHTML;
};

export const isDisabled = (containsDropdown: Element): boolean => {
    const dropdownToggle = containsDropdown.querySelector('.dropdown-select-input');
    const disabled = dropdownToggle?.getAttribute('aria-disabled') == 'true';
    return disabled;
};

export const findOption = (containsDropdown: Element, byText: string): Element => {
    const options = containsDropdown.querySelectorAll('li');
    for (const option of options) {
        if (option.innerHTML.includes(byText)) {
            return option;
        }
    }
    throw new Error(`option "${byText}" not found in dropdown`);
};

export const findInOption = (containsDropdown: Element, byText: string, selector: string) => {
    const optionEl = findOption(containsDropdown, byText);
    return optionEl.querySelector(selector);
};

export const hasOption = (containsDropdown: Element, withText: string): boolean => {
    try {
        findOption(containsDropdown, withText);
    } catch {
        return false;
    }
    return true;
};

export const selectOption = (containsDropdown: Element, byText: string) => {
    const option = findOption(containsDropdown, byText);
    simulateClickEvent(option);
};
