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

import * as React from 'react';
import './project-configuration.css';
import { Trustzone } from '../../cmsis-solution-types';
import { CreateSolutionAction } from '../state/reducer';
import { validationError } from './validation-message';
import { Button } from 'antd';
import { CompactDropdown } from '../../../common/components/compact-dropdown';
import { CmsisCodicon } from '../../../common/components/cmsis-codicon';
import { ProjectConfigurationRow } from '../create-solution-view-model';

type ProjectConfigurationProps = {
    rows: ProjectConfigurationRow[];
    showTrustzoneInfo: boolean;
    errors: string[];
    dispatch: React.Dispatch<CreateSolutionAction>;
}

export const ProjectConfiguration = (props: ProjectConfigurationProps) => {
    const { rows, showTrustzoneInfo, dispatch, errors } = props;

    return (
        <React.Fragment>
            <div className='project-config-row layout-header'>
                <div>Project Name</div>
                <div>Core</div>
                <div>TrustZone</div>
            </div>
            {rows.map((row, index) => <ProjectConfigurationRowComponent key={index} index={index} row={row} error={errors[index]} dispatch={dispatch} removeDisabled={rows.length === 1} />)}
            <Button
                className='add-project-config-row button'
                title='Add a new project configuration row'
                onClick={() => dispatch({ type: 'MODIFY_PROJECT', request: { type: 'ADD_PROJECT' } })}
            >
                Add Project
            </Button>
            {showTrustzoneInfo && (
                <div className='trustzone-info'>
                    <span className="codicon codicon-info"></span>
                    Some TrustZone devices will be shipped with secure firmware by the manufacturer.<br />Please check your device&apos;s specification before adding your own secure project.
                </div>
            )}
        </React.Fragment>
    );
};

type ProjectConfigurationRowProps = {
    index: number;
    row: ProjectConfigurationRow;
    error: string;
    removeDisabled: boolean;
    dispatch: React.Dispatch<CreateSolutionAction>;
};

const ProjectConfigurationRowComponent = (props: ProjectConfigurationRowProps) => {
    const { index, row, error, removeDisabled, dispatch } = props;
    const { coreOptions, project, selectedCore, trustzoneOptions } = row;
    const rowInfo = project.value;

    return (
        <div className='project-config-row layout-config-info'>
            <input
                onChange={e => dispatch({
                    type: 'MODIFY_PROJECT',
                    request: { type: 'UPDATE_PROJECT_NAME', index: index, name: e.target.value },
                })}
                type='text'
                placeholder="Project name"
                value={rowInfo.name}
                title='Provide a descriptive name for each project contained in your solution'
            >
            </input>
            <CompactDropdown
                disabled={coreOptions.length <= 1}
                title={coreOptions.length > 1 ? 'The Arm core that the project will run on, as determined by the cores on the selected microcontroller (MCU) device' : 'No additional core options to select from the dropdown'}
                selected={selectedCore}
                available={coreOptions}
                style={{ width: 'auto' }}
                className='dropdownCore'
                onChange={(option) => {
                    dispatch({
                        type: 'MODIFY_PROJECT',
                        request: { type: 'UPDATE_PROJECT_CORE', index: index, processorName: option },
                    });
                }}
            />
            <CompactDropdown
                disabled={!(trustzoneOptions.length > 1)}
                title={trustzoneOptions.length > 1 ? 'TrustZone reduces the potential for attack by isolating the critical security firmware, assets and private information from the rest of the application' : 'No additional trustzone options to select from the dropdown'}
                selected={rowInfo.trustzone}
                available={trustzoneOptions.map(option => option)}
                style={{ width: 'auto' }}
                className='dropdownTrustzone'
                onChange={(option) => {
                    dispatch({
                        type: 'MODIFY_PROJECT',
                        request: { type: 'UPDATE_PROJECT_TRUSTZONE', index: index, trustzone: option as Trustzone },
                    });
                }}
            />
            <Button
                icon={<CmsisCodicon name='trash' />}
                type="default"
                variant="text"
                aria-label="Delete"
                disabled={removeDisabled}
                onClick={() => dispatch({ type: 'MODIFY_PROJECT', request: { type: 'REMOVE_PROJECT', index: index } })}
                title='Remove the current project configuration row'
            />
            {validationError(error)}
        </div>
    );
};
