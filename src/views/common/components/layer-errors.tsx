/*
 * Copyright (c) 2023-2026 Arm Limited
 */

import React, { ReactNode } from 'react';
import { LayerError } from '../../manage-layers/view/state/reducer';
import './layer-errors.css';


export type LayerErrorsProps = {
    layerErrors: LayerError[],
    /**
     * Unique id for this element.
     */
    id: string;
}

export const LayerErrors = (props: LayerErrorsProps) => {
    const { layerErrors, id } = props;

    const messageField = (message: string): ReactNode => {
        return (
            <div className='message col2'>
            - {message}
            </div>
        );
    };

    const errorsDisplay = layerErrors.map((value, index) => {
        const key = `KEY_${value}_${index}`;

        return (
            <label className='project' key={key}>
                <div className='entry'>
                    <div className='col1'>
                        {index}:
                    </div>
                    <div className='col2'>
                        Project: {value.project} (Configuration: {value.configuration})
                        <div className='messages'>
                            {value.messages?.map(messageField)}
                        </div>
                    </div>
                </div>
            </label>
        );
    });

    return <div id={id} className="layer-errors">
        <div className='header'>
            <h3>Layer Errors</h3>
        </div>
        {errorsDisplay}
    </div>;
};
