/**
 * Copyright 2024-2026 Arm Limited
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
import { FileLocationPicker } from '../../../common/components/file-path-picker';
import { TooltipQuestion } from '../../../common/components/tooltip-question';
import { CreateSolutionViewModel } from '../create-solution-view-model';
import './create-solution.css';
import { ExampleDropdownTree } from './example-dropdown-tree';
import { HardwareRow } from './hardware-row';
import { ProjectConfiguration } from './project-configuration';
import { validationError } from './validation-message';
import { Button, Checkbox, ConfigProvider, theme, Tooltip } from 'antd';
import { useVSCodeTheme } from '../../../hooks/use-vscode-theme';
import { SettingOutlined } from '@ant-design/icons';
import { useDisableContextMenu } from '../../../hooks/use-disable-context-menu';

export interface CreateSolutionProps {
    viewModel: CreateSolutionViewModel;
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

export const CreateSolution = ({ viewModel }: CreateSolutionProps) => {
    const snapshot = React.useSyncExternalStore(viewModel.subscribe, viewModel.getSnapshot);
    const {
        canCreate,
        disabled,
        enableSetSolutionName,
        exampleEntries,
        projectRows,
        selectedExampleText,
        showTrustzoneInfo,
        state,
        targetTypeFieldEnabled,
        validationErrors,
    } = snapshot;
    const dispatch = viewModel.dispatch;

    React.useEffect(() => {
        viewModel.initialize();
        return () => viewModel.dispose();
    }, [viewModel]);

    const isDarkTheme = useVSCodeTheme();
    useDisableContextMenu();

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
                        <button className="codicon codicon-link-external" onClick={() => viewModel.openHelp()} title="Open help documentation"></button>
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
                                dispatch={dispatch}
                                onClose={() => {
                                    viewModel.setDropdownOpen(false);
                                }}
                                onOpen={() => {
                                    viewModel.setDropdownOpen(true);
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
                                    entries={exampleEntries}
                                    onChange={(val: string) => {
                                        dispatch({ type: 'SET_EXAMPLES_TREE_VIEW_SEARCH', search: val });
                                    }}
                                    searchText={state.examplesTreeViewSearch}
                                    selectedText={selectedExampleText}
                                    onSelect={value => viewModel.selectExample(value)}
                                />
                                {validationError(validationErrors.selectedTemplate)}
                            </div>

                            {state.deviceSelection.value && state.projects.length > 0 && (
                                <div id="create-solution-project-configuration" className="form-row">
                                    <ProjectConfiguration rows={projectRows} showTrustzoneInfo={showTrustzoneInfo} dispatch={dispatch} errors={validationErrors.projects} />
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
                                    <FileLocationPicker id="create-solution-file-locator" disabled={disabled} location={state.solutionLocation.value} dispatch={dispatch} openFilePicker={() => viewModel.openFilePicker()} />
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
                                    onClick={() => viewModel.close()}
                                >
                                    Cancel
                                </Button>
                                <Button title="Create Solution" type="primary" disabled={disabled || !canCreate} onClick={() => void viewModel.createSolution()}>
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
