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

import './file-path-picker.css';
import * as React from 'react';
import { CreateSolutionAction } from '../../create-solutions/view/state/reducer';
import { Button } from 'antd';

export interface FileLocationPickerProps {
    disabled: boolean;
    location: string;
    dispatch: React.Dispatch<CreateSolutionAction>;
    openFilePicker: () => void;
    /**
     * Unique id for this toggle button.
     */
    id: string;
}

export const FileLocationPicker = ({ id, disabled, location, dispatch, openFilePicker }: FileLocationPickerProps) => (
    <div className='file-location-picker'>
        <input
            id={id}
            placeholder='Choose a location'
            onChange={event => dispatch({
                type: 'SET_SOLUTION_LOCATION',
                solutionLocation: event.target.value,
            })}
            value={location}
            disabled={disabled} />
        <Button
            title='Browse'
            disabled={disabled}
            style={{ height: 'var(--arm-input-height)' }}
            onClick={() => openFilePicker()}
        >
            Browse
        </Button>
    </div>
);
