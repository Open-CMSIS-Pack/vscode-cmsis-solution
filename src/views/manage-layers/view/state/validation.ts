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

import { ConfigurationVariable, LayerPathError, ManageLayersState } from './reducer';


const pathValidationRegex = /^\/?[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/;

export type LayerValidation = {
    path: string;
    varNumber: number;
    pathError: string;
}

export type ValidationErrors = {
    layerValidation: LayerValidation[];
}

export const hasErrors = (validationErrors: ValidationErrors): boolean =>
    validationErrors.layerValidation?.some(layerValidation => !!layerValidation?.pathError);

const validateRequiredField = <A>(value: A): string => {
    return !value ? 'This field is required.' : '';
};

const validateName = (name: string): string => {
    return name && !pathValidationRegex.test(name)
        ? 'Path contains illegal characters.'
        : '';
};

const validateConfigurationVariable = (variable: ConfigurationVariable, index: number, layerPathError: LayerPathError): LayerValidation => {
    if (!variable.disabled) {
        if (layerPathError?.variableId === index && layerPathError?.pathExists) {
            return {
                path: variable.copyTo,
                varNumber: index,
                pathError: 'Path already exists.',
            };
        }

        const requiredErr = validateRequiredField(variable.copyTo);
        if (requiredErr) {
            return {
                path: variable.copyTo,
                varNumber: index,
                pathError: requiredErr,
            };
        }

        const nameError = validateName(variable.copyTo);
        if (nameError) {
            return {
                path: variable.copyTo,
                varNumber: index,
                pathError: nameError,
            };
        }
    }

    return {
        path: variable.copyTo,
        varNumber: index,
        pathError: '',
    };
};

export const validate = (
    fieldState: ManageLayersState,
): ValidationErrors => {
    return {
        layerValidation: fieldState.layers[fieldState.currentLayerNumber]
            ?.variables.map((variable, index) => validateConfigurationVariable(variable, index, fieldState.layerPathError[index])),
    };
};
