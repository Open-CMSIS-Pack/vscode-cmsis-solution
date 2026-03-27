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
