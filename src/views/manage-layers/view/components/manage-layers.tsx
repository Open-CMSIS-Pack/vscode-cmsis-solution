/**
 * Copyright (C) 2023-2026 Arm Limited
 */

import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import * as React from 'react';
import { LayerErrors } from '../../../common/components/layer-errors';
import { RadioButton } from '../../../common/components/radio-button';
import { MessageHandler } from '../../../message-handler';
import { IncomingMessage, OutgoingMessage } from '../../messages';
import { ChangeLayerActions } from '../actions';
import { initialState, manageLayersReducer } from '../state/reducer';
import { hasErrors, validate } from '../state/validation';
import { CreateLayer } from './create-layer';
import './manage-layers.css';

export interface ManageLayersProps {
    /**
     * Responsible for communication with the extension backend.
     */
    messageHandler: MessageHandler<IncomingMessage, OutgoingMessage>;
    /**
     * Actions to perform during solution creation.
     */
    changeLayerActions: ChangeLayerActions;
}

export const ManageLayers = ({ changeLayerActions, messageHandler }: ManageLayersProps) => {
    const [state, dispatch] = React.useReducer(manageLayersReducer, initialState);

    React.useEffect(() => {
        const unsubscribe = messageHandler.subscribe(message => {
            dispatch({ type: 'INCOMING_MESSAGE', message });
        });
        messageHandler.push({ type: 'GET_PLATFORM' });

        // cbuild setup is called on "project open", which triggers read of cbuild-idx.yml file
        messageHandler.push({ type: 'DATA_UPDATE_BOARD_LAYERS' });

        return unsubscribe;
    }, [messageHandler]);

    React.useEffect(() => {
        const currentLayer = state.layers[state.currentLayerNumber];
        if (currentLayer) {
            for (let idx = 0; idx < currentLayer.variables.length; idx++) {
                const variable = currentLayer.variables[idx];
                if (!variable.disabled)  {
                    messageHandler.push({ type: 'CHECK_LAYER_DOES_NOT_EXIST', layerFolder: variable.copyTo, variableId: idx });
                }
            }
        }
    }, [messageHandler, dispatch, state.layers, state.currentLayerNumber, changeLayerActions]);

    const validation = validate(state);

    const currentLayerNumber = state.currentLayerNumber;
    const currentLayer = state.layers[currentLayerNumber];
    const numOfLayers = Object.keys(state.layers).length;
    const disabled = !numOfLayers;
    const loading = state.changeLayerProgress == 'loading';
    const stateText = loading ? 'Loading...' : 'No Layers available';
    const numOfCompilers = state.availableCompilers.length;
    const layerErrors = state.layerErrors;
    const showLayer = !!numOfLayers || loading || !!layerErrors.length;
    const activeTargetName = state.activeTargetType?.length ? state.activeTargetType : 'unknown';

    return (
        <React.StrictMode>
            <div className='manage-layers-frame'>
                <form id='manage-layers-form' autoComplete='off' onSubmit={e => { e.preventDefault(); }}>

                    {showLayer &&
                    <div>
                        <div className='manage-layers-header'>
                            <h2>{'Add Software Layer'}</h2>
                            <a href="https://open-cmsis-pack.github.io/cmsis-toolbox/build-overview/#software-layers"
                                className="codicon codicon-link-external">
                            </a>
                        </div>
                        <div className='section-description-text'>
                            <p>{'Reference Applications are hardware agnostic and require '}
                                <a href='https://open-cmsis-pack.github.io/cmsis-toolbox/build-overview/#software-layers'>{'software layers'}</a>
                                {' with API drivers to connect to specific target hardware, typically an evaluation board.'}</p>
                            <p>{'The following software layers are available in packs to complete the Reference Application.'}
                                <br/>{'Click OK to copy these software layers to a sub-directory of the solution.'}</p>
                        </div>

                        <div>
                            <p>{`Configuration options for Active Target: ${activeTargetName}`}</p>
                        </div>

                        {!!numOfLayers && <div className='select-layer-button-strip'>
                            <div className='select-layer-col1'>
                                <div className='select-layer-option-text'>
                                    {`OPTION ${currentLayerNumber + (numOfLayers ? 1 : 0)} OF ${numOfLayers}`}
                                </div>
                                <div className='select-layer-buttons'>
                                    <VSCodeButton
                                        title='Btn_Prev'
                                        disabled={disabled}
                                        onClick={() => dispatch({ type: 'PREV_LAYER' })} >
                                        {'Prev'}
                                    </VSCodeButton>
                                    <VSCodeButton
                                        title='Btn_Next'
                                        disabled={disabled}
                                        onClick={() => dispatch({ type: 'NEXT_LAYER' })} >
                                        {'Next'}
                                    </VSCodeButton>
                                </div>
                            </div>
                            <div className='select-layer-col2'>
                                <div className='select-layer-option-description'>
                                    {'Copy to sub-directory'}
                                </div>
                            </div>
                        </div>}
                        {currentLayer && <CreateLayer
                            layer={currentLayer}
                            dispatch={dispatch}
                            errors={validation}
                        />}

                        {!numOfLayers && loading &&
                            <div className='noLayersAvailable'>
                                {stateText}
                            </div>}
                    </div>}

                    {!!layerErrors.length && <>
                        <div className='manage-layers-layer-errors'>
                            <LayerErrors
                                layerErrors={layerErrors}
                                id='layer-errors-display'
                            ></LayerErrors>

                        </div></>
                    }

                    {!!numOfCompilers && <>
                        <div>
                            <div className='manage-layers-section-end'></div>
                            <div className='select-compilers-header'>
                                <h2>{'Select Compiler'}</h2>
                                <a href="https://open-cmsis-pack.github.io/cmsis-toolbox/build-overview/#compiler-selection"
                                    className="codicon codicon-link-external"></a>
                            </div>
                            <div className='section-description-text'>
                                {'This is a toolchain agnostic project that requires compiler selection.'}
                            </div>

                            <div className='dropdown-select-label'>
                                <label htmlFor='manage-layer-compiler-selector'>Compiler</label>
                            </div>
                            <RadioButton
                                id='manage-layer-compiler-selector'
                                values={state.availableCompilers}
                                selectedValue={state.selectedCompiler}
                                onChange={newValue => dispatch({ type: 'SET_COMPILER', compiler: newValue })}
                                disabled={false}
                            />
                        </div></>
                    }

                    {!numOfLayers && !numOfCompilers && !loading && <>
                        <div className='nothing-to-configure'>
                            <p>{'Nothing to configure'}</p>
                        </div></>
                    }

                    <footer className='manage-layers-footer'>
                        <div className='manage-layers-button-strip'>
                            <VSCodeButton title='Cancel' appearance='secondary' disabled={state.changeLayerProgress !== 'idle'}
                                onClick={() => { messageHandler.push({ type: 'WEBVIEW_CLOSE' }); }} >
                                {'Cancel'}
                            </VSCodeButton>

                            <VSCodeButton
                                title='OK'
                                disabled={disabled && !numOfCompilers && hasErrors(validation) }
                                onClick={() => changeLayerActions.changeLayer(dispatch, state, messageHandler)} >
                                {'OK'}
                            </VSCodeButton>
                        </div>
                    </footer>
                </form>
            </div>
        </React.StrictMode>
    );
};
