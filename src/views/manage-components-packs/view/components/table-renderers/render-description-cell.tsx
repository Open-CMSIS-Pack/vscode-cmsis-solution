/**
 * Copyright (C) 2025-2026 Arm Limited
 */

import '@vscode/codicons/dist/codicon.css';
import React from 'react';
import { ComponentRowDataType } from '../../../data/component-tools';
import { getValidationMessage } from '../../helpers/components-packs-helpers';

/**
 * Renders the description cell with a link to the documentation file if available.
 * @param value The description value to render
 * @param record The record of the row
 * @param openDocFile Callback to open the documentation file
 * @returns The rendered cell with a link to the documentation file if available
 */
export const renderDescriptionCell = (
    value: string,
    record: ComponentRowDataType,
    state: { componentTree: ComponentRowDataType[], componentScope: string },
    openDocFile: (link: string) => void
): React.ReactNode => {
    const link = record.data.doc || record.api?.doc || '';
    const text = record.aggregate.result
        ? getValidationMessage(record, state)
        : record.data.description || record.api?.description || value || '';
    if (!text) return null;
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        e.stopPropagation();
        openDocFile(link);
    };
    return (
        <span>
            {link &&
                <>
                    <span className="codicon codicon-book" style={{ fontSize: '16px', color: 'var(--vscode-foreground)', verticalAlign: 'text-bottom' }}></span>
                    &nbsp;
                </>
            }
            {link
                ? <a
                    href={link}
                    onClick={handleClick}
                    className="external-link"
                    target='_blank'
                    rel='noreferrer'
                    tabIndex={0}
                    title={link ? `Open Documentation for ${record.name}` : undefined}
                    aria-label={`Open documentation for ${record.name}`}
                >{text}</a>
                : text}
        </span>
    );
};
