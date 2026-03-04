/*
 * Copyright (c) 2023-2026 Arm Limited
 */

import React from 'react';
import './radio-button.css';

export type RadioButtonProps<A extends string> = {
    onChange: (newValue: A) => void;
    selectedValue: A;
    values: A[];
    disabled: boolean;
    /**
     * Unique id for this toggle button.
     */
    id: string;
}

export const RadioButton = <A extends string>(props: RadioButtonProps<A>) => {
    const { id, onChange, values, selectedValue, disabled } = props;

    const radioInputs = values.map(value => (
        <label className={value === selectedValue ? 'selected' : ''} key={value}>
            <span className="custom-radio" />
            <input
                name={value}
                type="radio"
                checked={value === selectedValue}
                onChange={() => {
                    if (value !== selectedValue) {
                        onChange(value);
                    }
                }}
                disabled={disabled}
            />{value}
        </label>
    ));

    return <div id={id} className="radio-button">{radioInputs}</div>;
};
