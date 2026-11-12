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
import { Input, InputNumber } from 'antd';
import type { SettingsField as Field } from '../../settings-contract';
import type { SettingsDraft } from '../state/settings-reducer';
import type { SettingsCallbacks } from './settings-callbacks';
import { CompactDropdown } from '../../../common/components/compact-dropdown';
import { SettingsFileActions } from './settings-file-actions';

export type SettingsFieldProps = SettingsCallbacks & {
    field: Field;
    draft?: SettingsDraft;
};
type TypedFieldProps<T extends Field['type']> = Omit<SettingsFieldProps, 'field'> & {
    field: Extract<Field, { type: T }>;
};

/** Blurs the actual input on Enter after text composition has finished. */
function blurOnEnter(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (!event.nativeEvent.isComposing && event.target instanceof HTMLInputElement) {
        event.target.blur();
    }
}

/** Retains raw numeric drafts until blur so that validation and normalization remain in the host. */
export const SettingsNumberField = ({ field, draft, onAction, onEdit, onFocus }: TypedFieldProps<'number'>) => {
    /** Marks the numeric draft as focused without editing its value. */
    function handleFocus(): void {
        onFocus(field.id, true);
    }

    /** Retains typed text or a stepped value without normalizing it in the browser. */
    function handleInput(value: string | number): void {
        onEdit(field.id, value);
    }

    /** Releases focus and commits only a draft that was actually edited. */
    function handleBlur(): void {
        onFocus(field.id, false);
        if (draft?.dirty && field.editAction) {
            onAction(field.editAction, draft.value, field.id);
        }
    }

    return (
        <InputNumber
            aria-label={field.label}
            addonBefore={field.label}
            title={field.description}
            value={draft?.value ?? field.value}
            min={field.min}
            max={field.max}
            disabled={field.disabled}
            changeOnBlur={false}
            onPressEnter={blurOnEnter}
            onFocus={handleFocus}
            onInput={handleInput}
            onStep={handleInput}
            onBlur={handleBlur}
        />
    );
};

/** Commits edited text on blur, with Enter using the same commit path. */
export const SettingsStringField = ({ field, draft, onAction, onEdit, onFocus }: TypedFieldProps<'string'>) => {
    /** Marks the text draft as focused without editing its value. */
    function handleFocus(): void {
        onFocus(field.id, true);
    }

    /** Retains typed text until the field loses focus. */
    function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
        onEdit(field.id, event.target.value);
    }

    /** Releases focus and commits only a draft that was actually edited. */
    function handleBlur(): void {
        onFocus(field.id, false);
        if (draft?.dirty && field.editAction) {
            onAction(field.editAction, draft.value, field.id);
        }
    }

    return (
        <Input
            aria-label={field.label}
            addonBefore={field.label}
            title={field.description}
            value={draft?.value ?? field.value}
            disabled={field.disabled}
            onPressEnter={blurOnEnter}
            onFocus={handleFocus}
            onChange={handleChange}
            onBlur={handleBlur}
        />
    );
};

/** Commits a selected enum choice immediately while retaining host-provided labels and warnings. */
export const SettingsEnumField = ({ field, draft, onAction, onEdit }: TypedFieldProps<'enum'>) => {
    const availableChoices = field.choices.map(choice => choice.value);
    const selectedValue = String(draft?.value ?? field.value);

    /** Resolves the prepared label while preserving an unknown choice value verbatim. */
    function getChoiceLabel(value: string): string {
        return field.choices.find(choice => choice.value === value)?.label ?? value;
    }

    /** Resolves the prepared description used by a choice's tooltip. */
    function getChoiceDescription(value: string): string {
        return field.choices.find(choice => choice.value === value)?.description ?? '';
    }

    /** Retains and immediately commits the chosen enum value. */
    function handleChange(value: string): void {
        onEdit(field.id, value);
        if (field.editAction) {
            onAction(field.editAction, value, field.id);
        }
    }

    return (
        <CompactDropdown
            addonBefore={field.label}
            title={field.description}
            disabled={field.disabled}
            warning={field.warning}
            available={availableChoices}
            selected={selectedValue}
            displayText={getChoiceLabel}
            titleText={getChoiceDescription}
            tagLabels={field.choices.map(choice => choice.description ?? '')}
            onChange={handleChange}
        />
    );
};

/** Commits typed paths immediately and delegates file dialogs and opening to host actions. */
export const SettingsFileField = ({ field, draft, onAction, onEdit, onFocus }: TypedFieldProps<'file'>) => {
    /** Marks the file path draft as focused without editing it. */
    function handleFocus(): void {
        onFocus(field.id, true);
    }

    /** Releases focus without committing the path a second time. */
    function handleBlur(): void {
        onFocus(field.id, false);
    }

    /** Retains and immediately commits the typed path. */
    function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const value = event.target.value;
        onEdit(field.id, value);
        if (field.editAction) {
            onAction(field.editAction, value, field.id);
        }
    }

    /** Tracks Browse as a pending write and dispatches Open without changing the draft. */
    function handleFileAction(actionId: string): void {
        if (actionId === field.browseAction) {
            onAction(actionId, undefined, field.id);
        } else {
            onAction(actionId);
        }
    }

    const fileActions = (
        <SettingsFileActions
            label={field.label}
            browseAction={field.browseAction}
            openAction={field.openAction}
            onAction={handleFileAction}
        />
    );

    return (
        <Input
            aria-label={field.label}
            addonBefore={field.label}
            title={field.description}
            value={draft?.value ?? field.value}
            disabled={field.disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            suffix={fileActions}
        />
    );
};

/** Selects the input component matching the host-prepared field type. */
function renderFieldInput(props: SettingsFieldProps): React.ReactElement {
    const { field } = props;
    switch (field.type) {
        case 'number':
            return (
                <SettingsNumberField
                    {...props}
                    field={field}
                />
            );
        case 'string':
            return (
                <SettingsStringField
                    {...props}
                    field={field}
                />
            );
        case 'enum':
            return (
                <SettingsEnumField
                    {...props}
                    field={field}
                />
            );
        case 'file':
            return (
                <SettingsFileField
                    {...props}
                    field={field}
                />
            );
    }
}

/** Renders a prepared field with its optional processor label and warning. */
export const SettingsField = (props: SettingsFieldProps) => {
    const { field } = props;
    const input = renderFieldInput(props);

    return (
        <div
            className='settings-field'
            title={field.warning}
        >
            {field.processor && <span className='settings-processor'>{field.processor}</span>}

            {input}

            {field.warning && (
                <span
                    className='settings-warning'
                    role='status'
                >
                    {field.warning}
                </span>
            )}
        </div>
    );
};
