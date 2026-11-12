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
import { Checkbox, type CheckboxChangeEvent } from 'antd';
import type { AdapterHeader as Header } from '../../settings-contract';
import { CompactDropdown } from '../../../common/components/compact-dropdown';

export type AdapterHeaderProps = {
    header: Header;
    onAction: (id: string, value: string | boolean) => void;
};

/** Renders prepared adapter, processor, and automatic update controls without interpreting host configuration. */
export const AdapterHeader = ({ header, onAction }: AdapterHeaderProps) => {
    const availableAdapters = header.adapters.map(choice => choice.value);
    const availableProcessors = header.processors.map(choice => choice.value);

    /** Resolves the display label while retaining an unknown adapter value verbatim. */
    function getAdapterLabel(value: string): string {
        return header.adapters.find(choice => choice.value === value)?.label ?? value;
    }

    /** Resolves the display label while retaining an unknown processor value verbatim. */
    function getProcessorLabel(value: string): string {
        return header.processors.find(choice => choice.value === value)?.label ?? value;
    }

    /** Dispatches the requested enabled state when the host provides a toggle action. */
    function handleDebuggerChange(event: CheckboxChangeEvent): void {
        if (!header.toggleDebuggerAction) {
            return;
        }
        onAction(header.toggleDebuggerAction, event.target.checked);
    }

    /** Dispatches an adapter selection when the host provides its action. */
    function handleAdapterChange(value: string): void {
        if (!header.selectAdapterAction) {
            return;
        }
        onAction(header.selectAdapterAction, value);
    }

    /** Dispatches a start processor selection when the host provides its action. */
    function handleProcessorChange(value: string): void {
        if (!header.selectProcessorAction) {
            return;
        }
        onAction(header.selectProcessorAction, value);
    }

    /** Dispatches the automatic update preference when the host provides its action. */
    function handleAutoUpdateChange(event: CheckboxChangeEvent): void {
        if (!header.autoUpdateAction) {
            return;
        }
        onAction(header.autoUpdateAction, event.target.checked);
    }

    return (
        <div className='settings-adapter-header'>
            <Checkbox
                aria-label='Enable debug adapter'
                checked={header.enabled}
                disabled={!header.toggleDebuggerAction}
                onChange={handleDebuggerChange}
            />
            <CompactDropdown
                warning={header.adapterWarning}
                addonBefore='Debug Adapter'
                available={availableAdapters}
                selected={header.selectedAdapter}
                displayText={getAdapterLabel}
                disabled={!header.selectAdapterAction}
                onChange={handleAdapterChange}
            />

            {header.showProcessor && (
                <CompactDropdown
                    addonBefore='Start Processor'
                    available={availableProcessors}
                    selected={header.selectedProcessor}
                    displayText={getProcessorLabel}
                    disabled={!header.selectProcessorAction}
                    onChange={handleProcessorChange}
                />
            )}

            <Checkbox
                checked={header.autoUpdate}
                disabled={!header.autoUpdateAction}
                onChange={handleAutoUpdateChange}
            >
                Update launch.json and tasks.json
            </Checkbox>
        </div>
    );
};
