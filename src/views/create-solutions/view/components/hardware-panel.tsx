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
import './hardware-panel.css';
import { HardwareInfo, debugInterfaceAdaptersAreEqual, labelForHardwareOption } from '../../cmsis-solution-types';
import { messageServiceAwaitResult } from './message-service';
import { MessageHandler } from '../../../message-handler';
import { IncomingMessage, OutgoingMessage } from '../../messages';
import { formatBytes } from '../../units-conversion';
import { HardwareSelection } from '../state/hardware-selection';
import { VSCodeButton, VSCodeProgressRing } from '@vscode/webview-ui-toolkit/react';
import * as Messages from '../../messages';
import { dedupe } from '../../../../array';
import { DebugInterface } from '../../../../core-tools/client/packs_pb';
import { CreateSolutionAction } from '../state/reducer';
import { serialisePackId } from '../../../../packs/pack-id';

interface HardwarePanelProps {
    hardwareInfo: HardwareInfo | undefined;
    hardwareSelection: HardwareSelection | undefined;
    previewHardware: HardwareSelection | undefined;
    messageHandler: MessageHandler<IncomingMessage, OutgoingMessage>;
    onClick: () => void;
    // Feature flag IOTIDE-5591, enable once URL slugs are sorted
    enableWebsiteLinks?: boolean;
    dispatch: React.Dispatch<CreateSolutionAction>;
}

export const HardwarePanel = (props: HardwarePanelProps) => {
    const { dispatch, enableWebsiteLinks = false, hardwareInfo, messageHandler, onClick } = props;
    let { previewHardware } = props;

    const dispatchSelect = (previewHardware: HardwareSelection | undefined) => {
        if (previewHardware?.type === 'Boards') {
            dispatch({ type: 'SET_BOARD_SELECTION', boardSelection: previewHardware.value });
        } else if (previewHardware?.type === 'Devices') {
            dispatch({ type: 'SET_DEVICE_SELECTION', deviceSelection: previewHardware.value });
        }
    };

    const boardPreview = previewHardware?.type === 'Boards' ? previewHardware.value : undefined;
    const devicePreview = previewHardware?.type === 'Devices' ? previewHardware.value : undefined;

    React.useEffect(() => {
        if (boardPreview) {
            const message: Messages.OutgoingMessage = { type: 'DATA_GET_BOARD_INFO', boardId: { ...boardPreview.id, key: boardPreview.key } };
            messageServiceAwaitResult(messageHandler, message);
        } else if (devicePreview) {
            const message: Messages.OutgoingMessage = { type: 'DATA_GET_DEVICE_INFO', deviceId: { ...devicePreview.id, key: devicePreview.key } };
            messageServiceAwaitResult(messageHandler, message);
        }
    }, [boardPreview, devicePreview, messageHandler]);

    let content;
    if (hardwareInfo && previewHardware) {
        if (hardwareInfo?.boardInfo) {
            previewHardware = { type: 'Boards', value: hardwareInfo.boardInfo };
        } else if (hardwareInfo?.deviceInfo) {
            previewHardware = { type: 'Devices', value: hardwareInfo.deviceInfo };
        }

        const processorList = previewHardware.type === 'Boards' ?
            previewHardware.value.mountedDevices.flatMap(device => device.processors) :
            previewHardware.value.processors;

        const coreCounts: {[key in string]: number} = {};
        processorList.forEach(processorInfo => {
            coreCounts[processorInfo.core] = (coreCounts[processorInfo.core] ?? 0) + 1;
        });

        const packInfoElement = (previewHardware.value.pack) ?
            <>
                <p className='title'>Pack</p>
                <ul className='hardware-grid-info pack-id'>
                    <li key={0}>{serialisePackId(previewHardware.value.pack)}</li>
                </ul>
            </>
            : undefined;

        const coreElement = processorList.length ?
            <>
                <p className='title'>Cores</p>
                <ul className='hardware-grid-info cores'>{Object.keys(coreCounts).map((core, i) => (
                    <li key={i}>{coreCounts[core] > 1 ? `${coreCounts[core]} x ${core}` : core}</li>
                ))}</ul>
            </>
            : undefined;

        const memoryInfo = hardwareInfo?.memoryInfo ?? {};

        const memoryElement = Object.keys(memoryInfo).length ? (
            <><p className='title'>Memory</p>
                <ul className='hardware-grid-info ram'>{Object.keys(memoryInfo).map((memoryName, i) => (
                    <li
                        key={i}>{`${memoryInfo[memoryName].count} x ${formatBytes(memoryInfo[memoryName].size)} ${memoryName}`}
                    </li>
                ))}</ul>
            </>
        ) : undefined;

        const headingText = labelForHardwareOption(previewHardware.value);

        const debugAdapters = hardwareInfo?.debugInterfacesList &&
            dedupe<DebugInterface.AsObject>(debugInterfaceAdaptersAreEqual)(hardwareInfo.debugInterfacesList)
                .map(debugInterface => debugInterface.adapter);

        content = (
            <><div className='hardware-panel-header'>
                <div className='details-header-item'>
                    <h2 id="board-device" title={headingText}>{headingText}</h2>
                    <p id="vendor">{previewHardware.value.id.vendor}</p>
                    {enableWebsiteLinks && (
                        <a href={'/add-url'}>Product page <i className='codicon codicon-link-external'></i></a>
                    )}
                </div>
                <img src={hardwareInfo?.image ?? ''} alt="hardware-image" />
            </div><div className='details-grid'>
                {coreElement}
                {(previewHardware.type === 'Boards' && previewHardware.value.mountedDevices.length) ? (
                    <><p className='title'>Mounted Devices</p>
                        <ul className='hardware-grid-info mounted-dev'>{previewHardware.value.mountedDevices.map((p, i) => (
                            <li key={i}>{p.id.name}</li>
                        ))}</ul>
                    </>
                ) : undefined}
                {debugAdapters?.length ? (
                    <><p className='title'>Debug Interface</p>
                        <ul className='hardware-grid-info debug-int'>{debugAdapters.map((adapter, i) => (
                            <li key={i}>{adapter}</li>
                        ))}</ul>
                    </>
                ) : undefined}
                {memoryElement}
                {packInfoElement}
            </div><div className='select-button'>
                <VSCodeButton
                    title="Select" disabled={false} onClick={() => {
                        dispatchSelect(previewHardware);
                        onClick();
                    } }>Select</VSCodeButton>
            </div></>
        );
    } else if (previewHardware && !hardwareInfo) {
        content = <div className='loading-spinner'><VSCodeProgressRing></VSCodeProgressRing></div>;
    } else {
        content = (
            <div className='hardware-panel-placeholder'>
                <p>Please select a target</p>
                <div className='select-button'>
                    <VSCodeButton
                        title="Select" disabled={true} onClick={onClick}
                    >Select</VSCodeButton>
                </div>
            </div>
        );
    }
    return <div className='hardware-panel-container'>{content}</div>;
};
