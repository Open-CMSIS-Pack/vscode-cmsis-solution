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
import { SyntheticEvent } from 'react';
import { Dropdown } from './dropdown';
import { SearchList } from './search-list';
import './compact-dropdown.css';

export interface CompactDropdownProps {
    displayText?: (value: string) => string;
    titleText?: (value: string) => string;
    available: string[];
    selected: string;
    tagLabels?: string[]
    unselectedLabel?: string;
    onChange: (newValue: string) => void;
    tag?: JSX.Element;
    disabled?: boolean;
    style?: React.CSSProperties;
    className?: string;
    addonBefore?: React.ReactNode;
    addonAfter?: React.ReactNode;
    title?: string;
    warning?: boolean | string;
}

/**
 * A <select>-like dropdown suitable for including in contexts such as a data table.
 * If there is only one option, just a string is rendered.
 */
export const CompactDropdown = (props: CompactDropdownProps) => {
    const [expanded, setExpanded] = React.useState(false);
    const triggerRef = React.useRef(null);
    const rootRef = React.useRef<HTMLDivElement>(null);

    const toggleDropdown = (event: SyntheticEvent) => {
        event.stopPropagation();
        if (!props.disabled) {
            setExpanded(current => !current);
        }
    };

    const closeDropdown = () => {
        setExpanded(false);
    };

    const tagLabel = props.tagLabels
        ? (value: string) => {
            const { tagLabels, available } = props;
            const idx = available.indexOf(value);
            return tagLabels && idx >= 0 ? tagLabels[idx] : '';
        }
        : undefined;

    const toolTip = (value: string) => {
        const { title, titleText } = props;
        const texts = [];
        if (title) {
            texts.push(title);
        }
        if (titleText) {
            const tt = titleText(value);
            if (tt) {
                texts.push(tt);
            }
        }
        return texts.join('\n');
    };

    const searchList = (
        <SearchList
            onSelect={value => {
                props.onChange(value);
                closeDropdown();
            }}
            values={props.available}
            displayText={props.displayText}
            titleText={props.titleText}
            searchable={false}
            tagLabel={tagLabel}
        />
    );

    React.useEffect(() => {
        const root = rootRef.current;
        if (!root) {
            return;
        }

        const listItems = root.querySelectorAll<HTMLLIElement>('.search-list-values li[data-value]');
        for (const li of Array.from(listItems)) {
            if (expanded && li.dataset.value === props.selected) {
                li.classList.add('compact-dropdown-selected');
            } else {
                li.classList.remove('compact-dropdown-selected');
            }
        }
    }, [expanded, props.selected, props.available]);

    return (
        <div className={expanded ? `${props.className} compact-dropdown expanded` : `${props.className} compact-dropdown`} style={props.style} ref={rootRef}>
            <div className='compact-dropdown-inner'>
                {props.addonBefore && <div className="compact-dropdown-addon-before">{props.addonBefore}</div>}
                <div className={`compact-dropdown-trigger ${props.disabled ? ' disabled' : ''}`} onClick={toggleDropdown} ref={triggerRef} title={toolTip(props.selected)} tabIndex={0}>
                    {props.displayText ? props.displayText(props.selected) : props.selected || props.unselectedLabel} {props.tag}
                    {props.warning && <span className="codicon codicon-warning compact-dropdown-warn" title={typeof props.warning === 'string' ? props.warning : ''} />}
                    {props.available.length > 1 && <span className="fa-solid fa-angle-down compact-dropdown-caret" />}
                </div>
                {props.addonAfter && <div className="compact-dropdown-addon-after">{props.addonAfter}</div>}
            </div>
            {props.available.length > 1 && (
                <Dropdown
                    expanded={expanded}
                    content={searchList}
                    onClose={closeDropdown}
                    dropdownClass='compact-dropdown-popover'
                    triggerRef={triggerRef}
                />
            )}
        </div>
    );
};
