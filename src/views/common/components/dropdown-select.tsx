/**
 * Copyright (C) 2019-2026 Arm Limited
 */
import './dropdown-select.css';
import * as React from 'react';
import { ReactNode } from 'react';
import { Dropdown } from './dropdown';

// Helper to compute container classes
function getContainerClasses(className: string | undefined, expanded: boolean) {
    const containerClasses = ['dropdown-select'];
    if (className) containerClasses.push(className);
    if (expanded) containerClasses.push('expanded');
    return containerClasses.join(' ');
}

// Helper to compute dropdown content classes
function getDropdownContentClasses(dropdownClass: string | undefined) {
    const dropdownContentClasses = ['dropdown-select-content'];
    if (dropdownClass) dropdownContentClasses.push(dropdownClass);
    return dropdownContentClasses.join(' ');
}

// Event handler helpers
function useDropdownHandlers({ onOpen, onClose, onClear, disabled }: { onOpen?: () => void, onClose?: () => void, onClear?: () => void, disabled?: boolean }) {
    const [expanded, setExpanded] = React.useState(false);
    const inputRef = React.useRef(null);

    const closeDropdown = React.useCallback(() => {
        if (onClose) onClose();
        setExpanded(false);
    }, [onClose]);

    const toggleDropdown = React.useCallback(() => {
        if (disabled) return;
        if (expanded) {
            if (onClose) onClose();
        } else {
            if (onOpen) onOpen();
        }
        setExpanded(!expanded);
    }, [disabled, expanded, onOpen, onClose]);

    const handleOnClear = React.useCallback((event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        if (onClear) {
            event.stopPropagation();
            onClear();
        }
    }, [onClear]);

    // Main input click handler delegates to toggleDropdown
    const handleInputClick = React.useCallback(() => {
        toggleDropdown();
    }, [toggleDropdown]);

    return { expanded, setExpanded, inputRef, closeDropdown, handleInputClick, handleOnClear };
}

/**
 * Props for the DropdownSelect component
 */
export interface DropdownSelectProps {
    /**
     * Render the content for the dropdown, given a function to close the dropdown.
     */
    dropdownContent: (closeDropdown: () => void) => ReactNode;
    /**
     * Id, to make it easy for functional tests to locate the control to click.
     */
    id?: string;
    /**
     * Text for the label before the "select".
     */
    label?: ReactNode;
    /**
     * Content displayed inside the "select".
     */
    text: ReactNode;
    /**
     * Optional tooltip text.
     */
    title?: string;
    /**
     * Optional content to display to the right of the label.
     */
    topRightContent?: ReactNode;
    /**
     * Optional boolean to disable the control
     */
    disabled?: boolean;
    /**
     * set the className for the dropdown control
     */
    className?: string;
    /**
     * set the className for the dropdown content
     */
    dropdownClass?: string
    /**
     * called when the selection is cleared
     */
    onClear?: () => void;
    /**
     * called when the dropdown element is opened
     */
    onOpen?: () => void;
    /**
     * called when the dropdown element is closed
     */
    onClose?: () => void;
}

/**
 * Dropdown select component
 * @param props DropdownSelectProps
 * @returns JSX.Element
 */
export const DropdownSelect = (props: DropdownSelectProps) => {
    const { className, dropdownContent, label, text, id, disabled = false, title, dropdownClass, onClear, onOpen, onClose } = props;
    const { expanded, inputRef, closeDropdown, handleInputClick, handleOnClear } = useDropdownHandlers({ onOpen, onClose, onClear, disabled });

    return (
        <div className={getContainerClasses(className, expanded)}>
            {label && (
                <div className="dropdown-select-label">
                    <span className="dropdown-select-label-text">{label}</span>
                </div>
            )}
            <div id={id}
                className="dropdown-select-input"
                onClick={handleInputClick}
                title={title}
                ref={inputRef}
                aria-disabled={disabled}
            >
                <span className="dropdown-select-input-text">{text}</span>
                {onClear && (
                    <span className="clear-select-button codicon codicon-close" title="clear-selection" onClick={handleOnClear} />
                )}
                <span className="codicon codicon-chevron-down" />
            </div>
            <Dropdown dropdownClass={getDropdownContentClasses(dropdownClass)}
                content={dropdownContent(closeDropdown)}
                expanded={expanded}
                onClose={closeDropdown}
                triggerRef={inputRef}
            />
        </div>
    );
};
