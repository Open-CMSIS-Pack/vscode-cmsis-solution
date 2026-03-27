/**
 * Copyright (C) 2024-2026 Arm Limited
 */

import * as React from 'react';
import { ConfigurationVariable, ManageLayersAction, TargetConfiguration, VariableSet } from '../state/reducer';
import { ValidationErrors } from '../state/validation';
import './manage-layers.css';
import { validationError } from './validation-message';
import { Button } from 'antd';


export type CreateLayerProps = {
    layer: TargetConfiguration;
    dispatch: React.Dispatch<ManageLayersAction>;
    errors: ValidationErrors;
}

export function CreateLayer(props: CreateLayerProps): React.ReactElement {
    const { layer } = props;
    const result: React.ReactElement[] = [];

    for (let idx = 0; idx < layer.variables.length; idx) {
        const curVariable = layer.variables[idx];
        const curErrStr = props.errors.layerValidation[idx].pathError;
        result.push(createVariable(curVariable, curErrStr, idx++, props));
    }

    return <>{result}</>;
}

function createVariable(curVariable: ConfigurationVariable, errStr: string, idx: number, props: CreateLayerProps): React.ReactElement {
    const settings = curVariable.settings;
    const variableName = curVariable.variableName;
    const variableValue = curVariable.variableValue;
    const description = curVariable.description;
    const copyTo = curVariable.copyTo;
    const key = curVariable.variableName + idx.toString();
    const disabled = curVariable.disabled;

    return (
        <div className='select-layer-display-element' key={key}>
            <div className='select-layer-col1'>
                {variableName}
            </div>
            <div className='select-layer-col2'>
                <div className='select-layer-edit-path'>
                    {createEdit(variableName, copyTo, idx, props, disabled, variableValue)}
                    {createDefaultSelection(idx, props, disabled)}
                </div>
                {validationError(errStr)}
                {description && createDescription(description)}
                {settings && createSettings(settings, variableName)}
            </div>
        </div>
    );
}

function createDescription(description: string) {
    return (
        <div className='select-layer-display-element-description'>
            {description}
        </div>
    );
}

function createSettings(settings: VariableSet[], name: string) {
    if (!settings.length) {
        return <div></div>;
    }

    const listItems: React.JSX.Element[] = [];
    for (const setting of settings) {
        listItems.push(<li key={setting.set}>{setting.set}</li>);
    }

    return (
        <div className='select-layer-display-element-settings'>
            {`Apply these settings to hardware for ${name}:`}
            <ul key='settings-list'>{listItems}</ul>
        </div>
    );
}

function createEdit(name: string, value: string, idx: number, props: CreateLayerProps, disabled: boolean, disabledText?: string): React.ReactElement {
    if (disabled) {
        value = disabledText ? disabledText : '<not required>';
    }

    return <input className='select-layer-edit-field'
        value={value}
        disabled={disabled}
        readOnly={false}
        title={name}
        onChange={(event) => {
            props.dispatch({ type: 'CURRENT_LAYER_PATH_COPYTO', variableId: idx, newPath: event.target.value });
        }}
    />;
}

function createDefaultSelection(idx: number, props: CreateLayerProps, disabled: boolean): React.ReactElement {

    return (
        <Button
            title='Set default path'
            disabled={disabled}
            onClick={() => {
                props.dispatch({ type: 'CURRENT_LAYER_PATH_COPYTO_DEFAULT', variableId: idx });
            }}>
            Default
        </Button>
    );
}
