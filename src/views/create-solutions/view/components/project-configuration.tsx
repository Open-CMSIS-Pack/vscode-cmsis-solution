/*
 * Copyright (c) 2023-2026 Arm Limited
 */

import * as React from 'react';
import './project-configuration.css';
import { DeviceHardwareOption, NewProject, ProcessorInfo, Trustzone, validTrustZone } from '../../cmsis-solution-types';
import { VSCodeButton, VSCodeDropdown, VSCodeOption } from '@vscode/webview-ui-toolkit/react';
import { CreateSolutionAction } from '../state/reducer';
import { validationError } from './validation-message';
import { FieldAndInteraction } from '../state/field-and-interaction';

type ProjectConfigurationProps = {
    device: DeviceHardwareOption;
    projects: FieldAndInteraction<NewProject>[];
    errors: string[];
    dispatch: React.Dispatch<CreateSolutionAction>;
}

export const ProjectConfiguration = (props: ProjectConfigurationProps) => {
    const { projects, device, dispatch, errors } = props;
    const showTrustZoneText: boolean = device.processors.some(validTrustZone);

    return (
        <React.Fragment>
            <div className='project-config-row layout-header'>
                <div>Project Name</div>
                <div>Core</div>
                <div>TrustZone</div>
            </div>
            {projects.map((project, index) => <ProjectConfigurationRow key={index} index={index} rowInfo={project.value} error={errors[index]} device={device} dispatch={dispatch} removeDisabled={projects.length === 1}/>)}
            <VSCodeButton
                className='add-project-config-row button'
                title='Add a new project configuration row'
                onClick={() => dispatch({ type: 'MODIFY_PROJECT', request: { type: 'ADD_PROJECT' } })}
            >
            Add Project
            </VSCodeButton>
            {showTrustZoneText && (
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
    rowInfo: NewProject;
    error: string;
    removeDisabled: boolean;
    dispatch: React.Dispatch<CreateSolutionAction>;
    device: DeviceHardwareOption;
};

const ProjectConfigurationRow = (props: ProjectConfigurationRowProps) => {
    const { index, rowInfo, device, error, removeDisabled, dispatch } = props;

    const processor: ProcessorInfo | undefined = device.processors.find(processor => processor.name === rowInfo.processorName);

    const trustzoneOptions = processor && validTrustZone(processor)
        ? ['secure', 'non-secure', 'off']
        : ['off'];

    const coreDropdownOptions = device.processors.length === 1
        ? [<VSCodeOption key={processor?.core} value={processor?.core}>{processor?.core}</VSCodeOption>]
        : device.processors.map(processor => (
            <VSCodeOption
                key={processor.name}
                value={processor.name}
                onClick={(e) => dispatch({
                    type: 'MODIFY_PROJECT',
                    request: { type: 'UPDATE_PROJECT_CORE', index: index, processorName: (e.target as HTMLInputElement).value },
                })}
            >{processor.name}</VSCodeOption>
        ));

    const trustZoneDropdownOptions = trustzoneOptions.map(option =>
        <VSCodeOption
            key={`${rowInfo.name}-${option}`}
            value={option}
            onClick={() => dispatch({
                type: 'MODIFY_PROJECT',
                request: { type: 'UPDATE_PROJECT_TRUSTZONE', index: index, trustzone: option as Trustzone },
            })}
        >{option}</VSCodeOption>);

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
            <VSCodeDropdown
                className='dropdownCore'
                disabled={coreDropdownOptions.length > 1 ? false : true}
                title={coreDropdownOptions.length > 1 ? 'The Arm core that the project will run on, as determined by the cores on the selected microcontroller (MCU) device' : 'No additional core options to select from the dropdown'}
                value={device.processors.length === 1 ? processor?.core : rowInfo.processorName}
            >{coreDropdownOptions}</VSCodeDropdown>
            <VSCodeDropdown
                className='dropdownTrustzone'
                disabled={!(trustzoneOptions.length > 1)}
                title={trustZoneDropdownOptions.length > 1 ? 'TrustZone reduces the potential for attack by isolating the critical security firmware, assets and private information from the rest of the application' : 'No additional trustzone options to select from the dropdown'}
                value={rowInfo.trustzone}
            >{trustZoneDropdownOptions}</VSCodeDropdown>
            <VSCodeButton
                appearance="icon"
                aria-label="Delete"
                disabled={removeDisabled}
                onClick={() => dispatch({ type: 'MODIFY_PROJECT', request: { type: 'REMOVE_PROJECT', index: index } })}
                title='Remove the current project configuration row'
            >
                <span className="codicon codicon-trash"></span>
            </VSCodeButton>
            {validationError(error)}
        </div>
    );
};
