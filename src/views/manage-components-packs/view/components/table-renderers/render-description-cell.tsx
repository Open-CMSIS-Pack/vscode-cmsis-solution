/**
 * Copyright 2025-2026 Arm Limited
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
