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
