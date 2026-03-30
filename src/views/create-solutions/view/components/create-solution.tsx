/**
 * Copyright (C) 2024-2026 Arm Limited
 */

import * as React from 'react';
import { FileLocationPicker } from '../../../common/components/file-path-picker';
import { TooltipQuestion } from '../../../common/components/tooltip-question';
import { MessageHandler } from '../../../message-handler';
import { IncomingMessage, OutgoingMessage } from '../../messages';
import { CreationActions } from '../actions';
import { createSolutionReducer, initialState } from '../state/reducer';
import { hardwareTemplateOptions } from '../state/templates';
import { validate } from '../state/validation';
import './create-solution.css';
import { ExampleDropdownTree } from './example-dropdown-tree';
import { HardwareRow } from './hardware-row';
import { ProjectConfiguration } from './project-configuration';
import { validationError } from './validation-message';
import { Button, Checkbox, ConfigProvider, theme, Tooltip } from 'antd';
import { useVSCodeTheme } from '../../../hooks/use-vscode-theme';
import { SettingOutlined } from '@ant-design/icons';

export interface CreateSolutionProps {
    /**
     * Responsible for communication with the extension backend.
     */
    messageHandler: MessageHandler<IncomingMessage, OutgoingMessage>;

    /**
     * Actions to perform during solution creation.
     */
    creationActions: CreationActions;
}

const SettingsLink = ({ setting, children }: { setting: string, children?: React.ReactNode }) => (
    <>
        {children}
        <a href={'vscode://settings/cmsis-csolution.' + setting}
            className="preferences-link"
            title='Preferences: Open Settings'
        >
            <SettingOutlined style={{ marginLeft: '4px' }} />
        </a>
    </>
);

const WebServiceIndicator = ({ enabled, errors }: { enabled: boolean; errors: string[] }) => {
    const enabledIndicator = (<span>enabled</span>);
    const disabledIndicator = (<span>disabled</span>);
    const errorIndicator = (<Tooltip
        placement="bottomRight"
        title={(
            <>
                <div>Check your network connection and try again.</div>
                {errors.map((error, index) => (
                    <div className='offline-tooltip' key={index} data-tone={index % 2 ? 'odd' : 'even'}>
                        {error}
                    </div>
                ))}
            </>
        )}
    >
        <span className="offline-indicator">unreachable</span>
    </Tooltip>);
    const indicator = enabled ? (errors.length > 0 ? errorIndicator : enabledIndicator) : disabledIndicator;

    return (
        <div className='web-service-indicator'>
            Web Services&nbsp;{indicator}<SettingsLink setting="useWebServices" />
        </div>
    );
};

export const CreateSolution = ({ creationActions, messageHandler }: CreateSolutionProps) => {
    const [state, dispatch] = React.useReducer(createSolutionReducer, initialState);
    const disabled = state.createProgress !== 'idle';
    const [ready, setReady] = React.useState(false);

    // required to not fall into infinit loops when validating the solution sub folders
    const lastCheckedRef = React.useRef({ location: '', name: '', folder: '' });

    // Ref to track dropdown open state
    const [dropdownOpenRef, setDropdownOpenRef] = React.useState(false);

    const validationErrors = validate(state, state.solutionExists, false);
    const hasValidationErrors = Object.entries(validationErrors).some(([key, v]) => {
        if (key === 'projects' && Array.isArray(v)) {
            return v.some(Boolean);
        }
        return Array.isArray(v) ? v.length > 0 : !!v;
    });

    const isReady = React.useCallback((): boolean => {
        return state.deviceSelection.value?.key && state.solutionLocation.value && state.selectedTemplate.value && !hasValidationErrors && !dropdownOpenRef ? true : false;
    }, [dropdownOpenRef, state.deviceSelection.value?.key, state.solutionLocation.value, state.selectedTemplate.value, hasValidationErrors]);

    React.useEffect(() => {
        const unsubscribe = messageHandler.subscribe(message => {
            dispatch({ type: 'INCOMING_MESSAGE', message });
        });
        messageHandler.push({ type: 'GET_PLATFORM' });
        messageHandler.push({ type: 'GET_STATE_USE_WEBSERVICES' });
        messageHandler.push({ type: 'DATA_GET_TARGETS' });
        messageHandler.push({ type: 'DATA_GET_DEFAULT_LOCATION' });
        return unsubscribe;
    }, [messageHandler]);

    React.useEffect(() => {
        const { location, name, folder } = lastCheckedRef.current;
        if (state.solutionName.value && state.solutionLocation.value && state.solutionFolder.value && (state.solutionName.value !== name || state.solutionLocation.value !== location || state.solutionFolder.value !== folder)) {
            creationActions.checkSolutionExists(messageHandler, dispatch, state.solutionLocation.value, state.solutionName.value, state.solutionFolder.value);
            lastCheckedRef.current = {
                location: state.solutionLocation.value,
                name: state.solutionName.value,
                folder: state.solutionFolder.value,
            };
        }
        setReady(isReady());
        // the missing creationActions dependancy would trigger a warning whic is false, as the content of creationActions never changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.solutionLocation, state.solutionName, state.solutionFolder, messageHandler, isReady]);

    React.useEffect(() => {
        const boardId = state.boardSelection.value?.key;
        const deviceId = state.deviceSelection.value?.key;
        if (boardId || deviceId) {
            messageHandler.push({
                type: 'DATA_GET_DATAMANAGER_APPS',
                board: boardId,
                device: deviceId,
                fromAllPackVersions: state.fromAllPackVersions,
            });
        }
        setReady(isReady());
    }, [messageHandler, state.boardSelection, state.deviceSelection, state.fromAllPackVersions, isReady]);

    React.useEffect(() => {
        if (state.hardwareLists.type === 'loaded') {
            messageHandler.push({ type: 'DATA_GET_CONNECTED_DEVICE' });
        }
    }, [messageHandler, state.hardwareLists]);

    React.useEffect(() => {
        if (state.selectedDraftProjectId) {
            messageHandler.push({ type: 'DATA_GET_DRAFTPROJECT_INFO', id: state.selectedDraftProjectId });
        }
    }, [messageHandler, state.selectedDraftProjectId]);

    const isExternalTemplate = state.selectedTemplate.value?.type == 'template' && !!state.selectedTemplate.value.value.origin;
    const enableSetSolutionName = /*!state.selectedTemplate.value ||*/ state.selectedTemplate.value?.type == 'template' && !isExternalTemplate;
    const draftProjectType = state.selectedTemplate.value?.type == 'dataManagerApp' ? state.selectedTemplate.value.value.draftType : undefined;
    const targetTypeFieldEnabled = enableSetSolutionName || draftProjectType == 'Template';

    const isDarkTheme = useVSCodeTheme();

    return (
        <React.StrictMode>
            <ConfigProvider theme={{
                algorithm: [
                    isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm
                ],
                components: {
                    Table: { colorBgContainer: 'unset', headerBg: 'unset' }
                },
                token: { fontSize: 13, sizeStep: 4, borderRadius: 3 }
            }}>
                <div className="create-solution-frame">
                    <div className="create-solution-header">
                        <h2>Create Solution</h2>
                        <button className="codicon codicon-link-external" onClick={() => messageHandler.push({ type: 'HELP_OPEN' })} title="Open help documentation"></button>
                        <WebServiceIndicator
                            enabled={state.webServicesEnabled}
                            errors={state.servicesErrors}
                        />
                    </div>
                    <form
                        id="create-solution-form"
                        autoComplete="off"
                        onSubmit={e => {
                            e.preventDefault();
                        }}
                    >
                        <fieldset>
                            <HardwareRow
                                state={state}
                                disabled={disabled}
                                targetTypeFieldEnabled={targetTypeFieldEnabled}
                                validationErrors={validationErrors}
                                webServicesEnabled={state.webServicesEnabled}
                                messageHandler={messageHandler}
                                dispatch={dispatch}
                                onClose={() => {
                                    setDropdownOpenRef(false);
                                }}
                                onOpen={() => {
                                    setDropdownOpenRef(true);
                                }}
                            />

                            <div className={'form-row form-row--narrow'}>
                                <ExampleDropdownTree
                                    title="Select a template with boilerplate code, or a (reference) software example for your chosen hardware target"
                                    label={
                                        <>
                                            <span style={{ width: '100%' }}>Templates, Reference Applications, and Examples</span>
                                            <span className="checkbox-field">
                                                <Checkbox id={'create-solution-from-all-pack-versions'} checked={state.fromAllPackVersions} onChange={() => dispatch({ type: 'TOGGLE_ALL_PACK_VERSIONS' })} disabled={disabled} />
                                                <label htmlFor="create-solution-from-all-pack-versions">All pack versions</label>
                                                <TooltipQuestion title={'Show projects from all versions instead of latest pack version only'} />
                                            </span>
                                        </>
                                    }
                                    examples={state.examples}
                                    refApps={state.refApps}
                                    localExamples={state.localExamples}
                                    templates={hardwareTemplateOptions(state.deviceSelection.value, state.templates, state.datamanagerApps)}
                                    onChange={(val: string) => {
                                        dispatch({ type: 'SET_EXAMPLES_TREE_VIEW_SEARCH', search: val });
                                    }}
                                    searchText={state.examplesTreeViewSearch}
                                    selectedTemplate={state.selectedTemplate}
                                    datamanagerApps={state.datamanagerApps}
                                    dispatch={dispatch}
                                />
                                {validationError(validationErrors.selectedTemplate)}
                            </div>

                            {!isExternalTemplate && state.deviceSelection.value && state.projects.length > 0 && (
                                <div id="create-solution-project-configuration" className="form-row">
                                    <ProjectConfiguration device={state.deviceSelection.value} projects={state.projects} dispatch={dispatch} errors={validationErrors.projects} />
                                </div>
                            )}
                        </fieldset>
                        <fieldset>
                            {enableSetSolutionName && (
                                <div className="form-row form-row--narrow">
                                    <label htmlFor="create-solution-solution-name">Solution Name</label>
                                    <input
                                        id="create-solution-solution-name"
                                        onChange={e => {
                                            dispatch({ type: 'SET_SOLUTION_NAME', solutionName: e.target.value });
                                        }}
                                        value={state.solutionName.value}
                                        disabled={disabled}
                                        placeholder="Enter solution name"
                                    />
                                    {validationError(validationErrors.solutionName)}
                                </div>
                            )}
                            <div className="form-row form-row--narrow">
                                <label htmlFor="create-solution-solution-folder">Solution Sub Folder</label>
                                <input
                                    id="create-solution-solution-folder"
                                    onChange={e => {
                                        dispatch({ type: 'SET_SOLUTION_FOLDER', solutionFolder: e.target.value });
                                    }}
                                    value={state.solutionFolder.value}
                                    disabled={disabled}
                                    placeholder="Enter solution folder"
                                />
                                {validationError(validationErrors.solutionFolder)}
                            </div>
                            {state.platform === 'vscode' ? (
                                <div className="form-row form-row--narrow">
                                    <label htmlFor="create-solution-file-locator">Solution Base Folder</label>
                                    <FileLocationPicker id="create-solution-file-locator" disabled={disabled} location={state.solutionLocation.value} dispatch={dispatch} openFilePicker={() => messageHandler.push({ type: 'OPEN_FILE_PICKER', solutionLocation: state.solutionLocation.value })} />
                                    {validationError(validationErrors.solutionLocation)}
                                </div>
                            ) : (
                                <div className="form-row form-row--narrow">{validationError(validationErrors.solutionLocation)}</div>
                            )}
                            <div className="checkbox-field">
                                <Checkbox id={'create-solution-git-init-input'} checked={state.initGit} onChange={() => dispatch({ type: 'TOGGLE_INIT_GIT' })} disabled={disabled} />
                                <label htmlFor="create-solution-git-init-input">Initialize Git repository</label>
                                <TooltipQuestion title={'Set up your solution for Git version control, allowing you to track changes.'} />
                            </div>
                            <div className="checkbox-field">
                                <Checkbox id={'create-solution-open-modal-input'} checked={state.showOpenDialog} onChange={() => dispatch({ type: 'TOGGLE_OPEN_MODAL' })} disabled={disabled} />
                                <label htmlFor="create-solution-open-modal-input">Show project opening options</label>
                                <TooltipQuestion title={'If selected, shows project opening options dialog box. If not selected, opens the project in a new window and new workspace by default.'} />
                            </div>
                        </fieldset>
                        <footer className="create-solution-footer">
                            <div className="create-solution-button-strip">
                                <Button
                                    title="Cancel"
                                    type="default"
                                    disabled={state.createProgress !== 'idle'}
                                    onClick={() => {
                                        messageHandler.push({ type: 'WEBVIEW_CLOSE' });
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button title="Create Solution" type="primary" disabled={disabled || !ready} onClick={() => creationActions.createSolution(dispatch, state, messageHandler)}>
                                    {state.createProgress === 'checking' ? 'Checking…' : state.createProgress === 'creating' ? 'Creating…' : 'Create'}
                                </Button>
                            </div>
                        </footer>
                    </form>
                </div>
            </ConfigProvider>
        </React.StrictMode>
    );
};
