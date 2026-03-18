/**
 * Copyright 2022-2026 Arm Limited
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

import { BoardId, DeviceReference } from '../../../core-tools/client/packs_pb';
import { dedupe } from '../../../array';
import { PackReference } from '../../../solutions/parsing/common-file-parsing';
import { TargetType } from '../../../solutions/parsing/solution-file';
import { serialiseBoardIdWithoutVendor, serialiseDeviceWithoutVendor, serialisePackReference } from '../../../solutions/solution-serialisers';
import { MessageHandler } from '../../message-handler';
import { IncomingMessage, OutgoingMessage } from '../messages';
import { messageServiceAwaitResult } from './components/message-service';
import { CreateSolutionAction, CreateSolutionState } from './state/reducer';
import { hasErrors, validate } from './state/validation';

type BoardDeviceState = Pick<CreateSolutionState, 'boardSelection' | 'deviceSelection'>

type BoardDeviceTargetState = BoardDeviceState & Pick<CreateSolutionState, 'targetType'>

const getTargetTypeFromHardwareSelection = (state: BoardDeviceTargetState): TargetType => {
    const deviceReference: DeviceReference.AsObject | undefined = state.deviceSelection.value?.id;
    const boardId: BoardId.AsObject | undefined = state.boardSelection.value?.id;
    const serDeviceFunc = serialiseDeviceWithoutVendor; // serialiseDevice
    const serBoardFunc = serialiseBoardIdWithoutVendor; // serialiseBoardId

    return {
        type: state.targetType.value,
        ...(boardId ? { board: serBoardFunc(boardId) } : {}),
        ...(deviceReference ? { device: serDeviceFunc({ ...deviceReference, processor: '' }) } : {}),
    };
};

const getSerialisedPacksFromState = (state: BoardDeviceState): string[] => {
    const packs: string[] = [];

    const boardPack = state.boardSelection.value?.pack;
    if (boardPack) {
        packs.push(serialisePackReference(boardPack));
    }

    const devicePack = state.deviceSelection.value?.pack;
    if (devicePack) {
        packs.push(serialisePackReference(devicePack));
    }

    packs.push('ARM::CMSIS');

    return dedupe<string>()(packs);
};

export const buildNewSolutionMessage = (state: CreateSolutionState): OutgoingMessage => {
    const targetType = getTargetTypeFromHardwareSelection(state);
    const packs = getSerialisedPacksFromState(state).map((pack): PackReference => ({ pack, forContext: [], notForContext: [] }));

    return {
        type: 'NEW_SOLUTION',
        gitInit: state.initGit,
        showOpenDialog: state.showOpenDialog,
        solutionName: state.solutionName.value,
        projects: state.projects.map(({ value }) => value),
        solutionLocation: state.solutionLocation.value,
        solutionFolder: state.solutionFolder.value,
        targetTypes: [targetType],
        packs,
        compiler: state.compiler === 'Arm Compiler 6' ? 'AC6' : state.compiler === 'LLVM' ? 'CLANG' : state.compiler,
        selectedTemplate: state.selectedTemplate.value,
    };
};

export const createSolution = async (
    dispatch: (action: CreateSolutionAction) => void,
    state: CreateSolutionState,
    messageHandler: MessageHandler<IncomingMessage, OutgoingMessage>,
): Promise<void> => {
    dispatch({ type: 'CREATION_CHECK_START' });

    const solutionExists = await checkSolutionExists(messageHandler, dispatch, state.solutionLocation.value, state.solutionName.value, state.solutionFolder.value);
    const hasValidationErrors = hasErrors(validate(state, { type: 'loaded', result: solutionExists }, true));

    if (hasValidationErrors) {
        dispatch({ type: 'CREATION_END' });
        return;
    }

    dispatch({ type: 'CREATION_START' });

    try {
        await messageServiceAwaitResult(
            messageHandler,
            buildNewSolutionMessage(state),
        );
    } catch {
        dispatch({ type: 'CREATION_END' });
        return;
    }

    messageHandler.push({ type: 'WEBVIEW_CLOSE' });
};

export const checkSolutionExists = async (
    messageHandler: MessageHandler<IncomingMessage, OutgoingMessage>,
    dispatch: (action: CreateSolutionAction) => void,
    solutionLocation: string,
    solutionName: string,
    solutionFolder: string,
): Promise<boolean> => {
    dispatch({ type: 'START_SOLUTION_EXISTS_CHECK' });
    try {
        await messageServiceAwaitResult(
            messageHandler,
            {
                type: 'CHECK_SOLUTION_DOES_NOT_EXIST',
                solutionLocation,
                solutionName: solutionName,
                solutionFolder: solutionFolder,
            }
        );
    } catch (err) {
        if ((err as Error).message.includes('already exists')) {
            dispatch({ type: 'END_SOLUTION_EXISTS_CHECK', result: true });
            return true;
        }
    }

    dispatch({ type: 'END_SOLUTION_EXISTS_CHECK', result: false });
    return false;
};

export const creationActions = {
    checkSolutionExists,
    createSolution,
} as const;

export type CreationActions = typeof creationActions;
