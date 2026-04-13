/**
 * Copyright 2019-2026 Arm Limited
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

import './dropdown.css';
import * as React from 'react';
import { KeyboardEvent, ReactNode, RefObject } from 'react';

// Magic number for the ESC key
const ESC_KEY = 27;

export interface DropdownProps {
    content: ReactNode;
    dropdownClass?: string;
    expanded: boolean;
    onClose: () => void;
    /**
     * A ref to the element which triggers the dropdown. If given, clicks inside this
     * element do not close the dropdown.
     */
    triggerRef?: RefObject<Element>;
    className?: string;
}

/**
 * Dropdown component with a triangular arrow in the top border. Closed on body click
 * or escape key.
 */
export const Dropdown = (props: DropdownProps) => {
    const { expanded, dropdownClass, content, triggerRef, onClose } = props;
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        const handleBodyClick = (event: MouseEvent) => {
            const targetNode = event.target as Node;
            const dropdownEl = dropdownRef.current;
            const triggerEl = triggerRef ? triggerRef.current : undefined;

            // If the user clicks outside the dropdown, close it. If there is a trigger node ignore
            // that too - this will be handled by the parent component.
            if (
                document.body.contains(targetNode) &&
                dropdownEl && !dropdownEl.contains(targetNode) &&
                (!triggerEl || !triggerEl.contains(targetNode))
            ) {
                onClose();
            }
        };

        document.body.addEventListener('click', handleBodyClick, { capture: true });
        return () => {
            document.body.removeEventListener('click', handleBodyClick, { capture: true });
        };
    }, [onClose, triggerRef ]);

    const handleDropdownKey = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.keyCode === ESC_KEY) {
            onClose();
        }
    };

    return (
        <div className="mbs-dropdown-anchor">
            {expanded && (
                <div
                    className={`mbs-dropdown ${dropdownClass}`}
                    ref={dropdownRef}
                    onKeyDown={handleDropdownKey}
                >
                    {content}
                </div>
            )}
        </div>
    );

};
