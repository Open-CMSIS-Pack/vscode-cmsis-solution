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

import { AsyncStatus } from '../../../async-status';
import { DeviceHardwareOption, NewProject } from '../../cmsis-solution-types';
import { CreateSolutionState } from './reducer';
import { FieldAndInteraction } from './field-and-interaction';

const nameValidationRegex = /^([\w-]+\s)*[\w-]+$/;
const targetTypeValidationRegex = /^([a-zA-Z0-9_-]{1,32})$/;


export type ValidatedField = 'solutionName' | 'solutionLocation' | 'solutionFolder' | 'deviceSelection' | 'selectedTemplate' | 'targetType';

export type ValidationErrors = {
    [key in ValidatedField]: string
  } & {
    projects: string[]
}

export const hasErrors = (validationErrors: ValidationErrors): boolean =>
    Object.values(validationErrors).filter(value => typeof value !== 'object').some(error => !!error) || validationErrors.projects.some(error => !!error);

const validateRequiredField = <A>(value: A): string => {
    return !value ? 'This field is required.' : '';
};

const validateName = (name: string): string => {
    return name && !nameValidationRegex.test(name)
        ? 'Name should start with a letter and must only contain letters, singular spaces, numerals, underscores or hyphens.'
        : '';
};

const validateTargetType = (targetType: string): string => {
    return targetType && !targetTypeValidationRegex.test(targetType)
        ? 'Target type must be 1-32 characters long and can only contain letters, numerals, underscores or hyphens.'
        : '';
};

// Only run the given validate function if the field is modified, unless we are explicitly validating unmodified fields
const checkModified = <V, T>(
    fieldAndInteraction: FieldAndInteraction<V>,
    validateUnmodifiedFields: boolean,
    validateField: (value: V, state?: T) => string,
    state?: T,
): string => {
    return validateUnmodifiedFields || fieldAndInteraction.hadInteraction
        ? validateField(fieldAndInteraction.value, state)
        : '';
};

const validateDeviceSelection = (deviceSelection: DeviceHardwareOption | undefined): string => {
    return validateRequiredField(deviceSelection);
};

const validateProjectName = (project: NewProject, projectState?: NewProject[]): string => {
    projectState?.splice(projectState.indexOf(project), 1);
    const isDuplicate = projectState?.some((p) => p.name === project.name);
    return isDuplicate ? 'Project name should be unique.' : validateNameField(project.name);
};

const validateNameField = (name: string): string => {
    return validateRequiredField(name) || validateName(name);
};

const validateFolderField = (name: string): string => {
    return validateRequiredField(name) || validateName(name);
};

const validateSolutionLocation = (solutionExistsCheck: AsyncStatus<boolean>, solutionName: string) => (solutionLocation: string): string => {
    let error = validateRequiredField(solutionLocation);
    if (solutionLocation && solutionName && solutionExistsCheck.type === 'loaded') {
        if (solutionExistsCheck.result) {
            error = `A solution with the chosen name "${solutionName}" already exists at this location.`;
        }
    }
    return error;
};

const validateTargetTypeField = (targetType: string): string => {
    return validateRequiredField(targetType) || validateTargetType(targetType);
};

export const validate = (
    fieldState: Pick<CreateSolutionState, keyof ValidationErrors>,
    solutionExistsCheck: AsyncStatus<boolean>,
    validateUnmodifiedFields: boolean,
): ValidationErrors => {
    return {
        deviceSelection: checkModified(fieldState.deviceSelection, validateUnmodifiedFields, validateDeviceSelection),
        projects: fieldState.projects.map((project) => checkModified(project, validateUnmodifiedFields, validateProjectName, fieldState.projects.map((proj) => proj.value))),
        solutionName: checkModified(fieldState.solutionName, validateUnmodifiedFields, validateNameField),
        solutionFolder: checkModified(fieldState.solutionFolder, validateUnmodifiedFields, validateFolderField),
        targetType: checkModified(fieldState.targetType, validateUnmodifiedFields, validateTargetTypeField),
        solutionLocation: checkModified(
            fieldState.solutionLocation,
            validateUnmodifiedFields,
            validateSolutionLocation(solutionExistsCheck, fieldState.solutionFolder.value),
        ),
        selectedTemplate: checkModified(fieldState.selectedTemplate, validateUnmodifiedFields, validateRequiredField)
    };
};
