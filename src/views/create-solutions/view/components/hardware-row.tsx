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
import { AsyncStatus, switchAsyncStatus } from '../../../async-status';
import { DropdownSelect } from '../../../common/components/dropdown-select';
import { SearchableTreeView } from '../../../common/components/searchable-tree-view';
import { TreeViewCategory, TreeViewItem } from '../../../common/components/tree-view';
import { MessageHandler } from '../../../message-handler';
import { BoardHardwareOption, DeviceHardwareOption, compareDeviceId, labelForHardwareOption } from '../../cmsis-solution-types';
import { HardwareLists, IncomingMessage, OutgoingMessage } from '../../messages';
import { HardwareSelection } from '../state/hardware-selection';
import { CreateSolutionAction, CreateSolutionState, emptyHardwareLists } from '../state/reducer';
import { ValidationErrors, validate } from '../state/validation';
import './create-solution.css';
import { HardwarePanel } from './hardware-panel';
import './hardware-row.css';
import { validationError } from './validation-message';

export type HardwareRowProps = {
    state: CreateSolutionState;
    disabled: boolean;
    messageHandler: MessageHandler<IncomingMessage, OutgoingMessage>;
    dispatch: React.Dispatch<CreateSolutionAction>;
    validationErrors: Pick<ValidationErrors, 'deviceSelection' | 'targetType'>;
    webServicesEnabled: boolean;
    targetTypeFieldEnabled: boolean;
    onOpen?: () => void;
    onClose?: () => void;
}

export const HardwareRow = (props: HardwareRowProps) => {
    const { state, disabled, webServicesEnabled, targetTypeFieldEnabled, messageHandler, dispatch } = props;
    const validationErrors = validate(state, state.solutionExists, false);
    const dropdownProps = { dispatch, messageHandler, hardwareInfo: state.hardwareInfo, disabled, };
    const targetBoardMsg = 'Target selection includes microcontroller (MCU) devices, development boards and virtual platforms. The target for your solution is used to determine appropriate startup software and configure the build system';
    const targetDeviceMsg = 'The microcontroller (MCU) device that is present on the development board, or a standalone microcontroller device, for example on a custom PCB';


    const clearSelection = (): void => {
        dispatch({ type: 'CLEAR_BOARD_SELECTION' });
    };

    const convertHardwareSelection = (
        hardware: { boardSelection?: BoardHardwareOption, deviceSelection?: DeviceHardwareOption }
    ): HardwareSelection | undefined => {
        if (hardware.boardSelection) {
            return { type: 'Boards', value: hardware.boardSelection };
        }
        if (hardware.deviceSelection) {
            return { type: 'Devices', value: hardware.deviceSelection };
        }
        return undefined;
    };

    const getHardwareAsyncStatus = (hardwareList: AsyncStatus<HardwareLists>, selectText: string, hardwareSelection: HardwareSelection | undefined) => {
        const loadingCase = () => ({
            boardsList: emptyHardwareLists.boards,
            devicesList: emptyHardwareLists.devices,
            hardwareText: webServicesEnabled ? 'Loading using Web Service…' : 'Loading…',
        });
        const { boardsList, devicesList, hardwareText } = switchAsyncStatus(hardwareList, {
            loaded: treeViewList => ({
                boardsList: treeViewList.boards,
                devicesList: treeViewList.devices,
                hardwareText: hardwareSelection ? labelForHardwareOption(hardwareSelection.value) : selectText
            }),
            error: () => ({
                boardsList: emptyHardwareLists.boards,
                devicesList: emptyHardwareLists.devices,
                hardwareText: selectText
            }),
            loading: loadingCase,
            idle: loadingCase,
        });
        return { boardsList, devicesList, hardwareText };
    };

    const { devicesList, hardwareText: deviceText } = getHardwareAsyncStatus(
        state.hardwareLists,
        'Select Device',
        convertHardwareSelection({ deviceSelection: state.deviceSelection.value })
    );

    const { boardsList, hardwareText: boardText } = getHardwareAsyncStatus(
        state.hardwareLists,
        'Select Board',
        convertHardwareSelection({ boardSelection: state.boardSelection.value })
    );

    const getNoEntriesFoundAsyncStatus = (hardwareList: AsyncStatus<HardwareLists>, entryCategory: string): React.JSX.Element => {
        const loadingCase = () => ({
            message: <div><br />{webServicesEnabled ? `Loading ${entryCategory}s using Web Service…` : `Loading ${entryCategory}s…`}</div>
        });
        const { message } = switchAsyncStatus(hardwareList, {
            loaded: () => ({
                message: <div>
                    {!webServicesEnabled && <div>
                        <br />
                        {`${entryCategory} not found?`}
                        <br />
                        <br />
                        {'Enable'} <a href="vscode://settings/cmsis-csolution.useWebServices">Use Web Services</a> {'under'}
                        <br />
                        {'Settings - Extensions - CMSIS Solution'}
                        <br />
                    </div>}
                    {webServicesEnabled && <div>
                        <br />
                        {`No ${entryCategory}s found.`}
                    </div>}
                </div>,
            }),
            error: () => ({
                message: <div></div>
            }),
            loading: loadingCase,
            idle: loadingCase,
        });
        return message;
    };


    return (
        <div id="create-solution-hardware" className='form-row'>
            <div className='hardware-config-row'>
                <div className={'form-row' + (state.boardSelection ? '' : ' dropdown-select-placeholder')} title={targetBoardMsg}>
                    <HardwareDropdown<BoardHardwareOption>
                        rowProps={{ ...dropdownProps }}
                        info={{ label: 'Target Board (Optional)', dropdownId: 'create-solution-board-target', text: boardText }}
                        hardwareSelection={convertHardwareSelection({ boardSelection: state.boardSelection.value })}
                        hardwarePreview={convertHardwareSelection({ boardSelection: state.boardPreview })}
                        treeViewSearch={state.boardTreeViewSearch}
                        noEntriesMessage={getNoEntriesFoundAsyncStatus(state.hardwareLists, 'Board')}
                        treeViewList={boardsList}
                        onChange={(val: string) => { dispatch({ type: 'SET_BOARD_TREE_VIEW_SEARCH', search: val }); }}
                        onSelect={(item: BoardHardwareOption) => {
                            dispatch({ type: 'SET_BOARD_PREVIEW', boardPreview: item });
                        }}
                        onClear={state.boardSelection.value ? clearSelection : undefined}
                        onOpen={props.onOpen}
                        onClose={props.onClose}
                    />
                </div>
                <div className={'form-row' + (state.deviceSelection ? '' : ' dropdown-select-placeholder')} title={targetDeviceMsg}>
                    <HardwareDropdown<DeviceHardwareOption>
                        rowProps={{ ...dropdownProps }}
                        info={{ label: 'Target Device', dropdownId: 'create-solution-device-target', text: deviceText }}
                        hardwareSelection={convertHardwareSelection({ deviceSelection: state.deviceSelection.value })}
                        hardwarePreview={convertHardwareSelection({ deviceSelection: state.devicePreview })}
                        treeViewSearch={state.deviceTreeViewSearch}
                        treeViewList={devicesList}
                        noEntriesMessage={getNoEntriesFoundAsyncStatus(state.hardwareLists, 'Device')}
                        onChange={(val: string) => { dispatch({ type: 'SET_DEVICE_TREE_VIEW_SEARCH', search: val }); }}
                        onSelect={(item: DeviceHardwareOption) => {
                            dispatch({ type: 'SET_DEVICE_PREVIEW', devicePreview: item });
                        }}
                        itemPredicate={state.boardSelection.value && state.boardSelection.value.mountedDevices.length > 0 ?
                            (item: TreeViewItem<DeviceHardwareOption>) =>
                                !!state.boardSelection.value?.mountedDevices.some(md => compareDeviceId(md.id)(item.value.id))
                            : undefined}
                        onOpen={props.onOpen}
                        onClose={props.onClose}
                    />
                    {validationError(validationErrors.deviceSelection)}
                </div>
                {targetTypeFieldEnabled && <div className='form-row'>
                    <label htmlFor='create-solution-target-type'>Target Type</label>
                    <input
                        id="create-solution-target-type"
                        onChange={e => dispatch({ type: 'SET_TARGET_TYPE', targetType: e.target.value })}
                        value={state.targetType.value}
                        disabled={disabled}
                        placeholder="Enter target type"
                        title='A descriptive name for your target' />
                    {validationError(validationErrors.targetType)}
                </div>
                }</div>
        </div>
    );
};

type HardwareDropdownProps<A extends BoardHardwareOption | DeviceHardwareOption> = {
    rowProps: Pick<HardwareRowProps['state'], 'hardwareInfo'> & Pick<HardwareRowProps, 'messageHandler' | 'dispatch'> & { disabled: boolean }
    info: { dropdownId: string, label: string, text: string },
    hardwareSelection: HardwareSelection | undefined;
    hardwarePreview: HardwareSelection | undefined;
    treeViewSearch: string;
    treeViewList: TreeViewCategory<A>[];
    noEntriesMessage: React.ReactNode;
    onChange: (val: string) => void;
    onSelect: (item: A) => void;
    itemPredicate?: (item: TreeViewItem<A>) => boolean;
    onClear?: () => void;
    onOpen?: () => void;
    onClose?: () => void;
}

const HardwareDropdown = <A extends BoardHardwareOption | DeviceHardwareOption>(props: HardwareDropdownProps<A>) => {
    const { hardwareSelection, hardwarePreview, rowProps: state, treeViewSearch, info, noEntriesMessage, onChange, onSelect, itemPredicate, onClear, onOpen, onClose } = props;

    const dropdown = (closeDropdown: () => void) =>
        <div className='searchtree-container'>
            <div className='searchtreeview'>
                <SearchableTreeView<A>
                    onChange={val => onChange(val)}
                    searchValue={treeViewSearch}
                    topLevelCategories={props.treeViewList}
                    itemPredicate={itemPredicate}
                    onSelect={item => {
                        onSelect(item.value);
                    }}
                    noEntriesMessage={noEntriesMessage}
                ></SearchableTreeView>
            </div>
            <div className='hardware-panel'>
                <HardwarePanel
                    hardwareSelection={hardwareSelection}
                    hardwareInfo={state.hardwareInfo}
                    messageHandler={state.messageHandler}
                    onClick={closeDropdown}
                    previewHardware={hardwarePreview}
                    dispatch={state.dispatch} />
            </div>
        </div>;

    const dropDownSelect = (
        <DropdownSelect
            id={info.dropdownId}
            dropdownContent={dropdown}
            label={info.label}
            text={info.text}
            disabled={state.disabled}
            onClear={onClear}
            onOpen={onOpen}
            onClose={onClose}
        />
    );

    return dropDownSelect;
};
