/**
 * Copyright 2023-2026 Arm Limited
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
