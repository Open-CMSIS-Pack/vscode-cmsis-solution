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
import { Button, Tooltip } from 'antd';
import { FileOutlined, FolderOpenOutlined } from '@ant-design/icons';

export type SettingsFileActionsProps = {
    label: string;
    browseAction?: string;
    openAction?: string;
    onAction: (id: string) => void;
};

/** Renders compact file actions with tooltips and SVG icons that need no icon font. */
export const SettingsFileActions = ({ label, browseAction, openAction, onAction }: SettingsFileActionsProps) => {
    /** Requests a file selection when the host provides a browse action. */
    function handleBrowse(): void {
        if (browseAction) {
            onAction(browseAction);
        }
    }

    /** Requests file opening when the host provides an open action. */
    function handleOpen(): void {
        if (openAction) {
            onAction(openAction);
        }
    }

    return (
        <span className='settings-file-actions'>
            {browseAction && (
                <Tooltip title='Select File'>
                    <Button
                        type='text'
                        size='small'
                        aria-label={`Browse ${label}`}
                        icon={<FolderOpenOutlined />}
                        onClick={handleBrowse}
                    />
                </Tooltip>
            )}

            {openAction && (
                <Tooltip title='Open File'>
                    <Button
                        type='text'
                        size='small'
                        aria-label={`Open ${label}`}
                        icon={<FileOutlined />}
                        onClick={handleOpen}
                    />
                </Tooltip>
            )}
        </span>
    );
};
