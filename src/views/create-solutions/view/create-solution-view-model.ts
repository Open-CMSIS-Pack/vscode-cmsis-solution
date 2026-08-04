/**
 * Copyright 2026 Arm Limited
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

import { dedupe } from '../../../array';
import { TargetType } from '../../../solutions/parsing/solution-file';
import { serialiseBoardIdWithoutVendor, serialiseDeviceWithoutVendor, serialisePackReference } from '../../../solutions/solution-serialisers';
import { TreeViewCategory, TreeViewItem } from '../../common/components/tree-view';
import { MessageHandler } from '../../message-handler';
import { DeviceHardwareOption, NewProject, Trustzone, validTrustZone } from '../cmsis-solution-types';
import { PackRequirement } from '../create-solution-dto';
import { addRequestId, IncomingMessage, OutgoingMessage, RequestMessage, RequestMessagePayload } from '../messages';
import { FieldAndInteraction } from './state/field-and-interaction';
import { CreateSolutionAction, CreateSolutionState, createSolutionReducer, DraftProject, initialState } from './state/reducer';
import { CSolutionTemplate, hardwareTemplateOptions } from './state/templates';
import { ValidationErrors, hasErrors, validate } from './state/validation';

const MESSAGE_TIMEOUT = 10000;
const TEMPLATE_PREFIX = 'template::';

type ResponseChannel =
    | 'connectedDevice'
    | 'draftProject'
    | 'draftProjects'
    | 'hardwareInfo'
    | 'platform'
    | 'solutionLocation'
    | 'targets'
    | 'webServices';

type PendingRequest = {
    requestType: RequestMessage['type'];
    resolve: () => void;
    reject: (error: Error) => void;
    timeout: ReturnType<typeof setTimeout>;
};

export interface ProjectConfigurationRow {
    project: FieldAndInteraction<NewProject>;
    coreOptions: string[];
    selectedCore: string;
    trustzoneOptions: Trustzone[];
}

export interface CreateSolutionViewModelSnapshot {
    state: CreateSolutionState;
    validationErrors: ValidationErrors;
    canCreate: boolean;
    disabled: boolean;
    enableSetSolutionName: boolean;
    targetTypeFieldEnabled: boolean;
    exampleEntries: Array<TreeViewCategory<string>>;
    selectedExampleText: string;
    projectRows: ProjectConfigurationRow[];
    showTrustzoneInfo: boolean;
}

export class CreateSolutionViewModel {
    private state: CreateSolutionState;
    private snapshot: CreateSolutionViewModelSnapshot;
    private readonly listeners = new Set<() => void>();
    private readonly latestRequestByChannel = new Map<ResponseChannel, string>();
    private readonly pendingRequests = new Map<string, PendingRequest>();
    private unsubscribeMessages: (() => void) | undefined;
    private lastExistenceQuery = '';
    private latestExistenceRequestId = '';
    private dropdownOpen = false;

    public constructor(
        private readonly messageHandler: MessageHandler<IncomingMessage, OutgoingMessage>,
        state: CreateSolutionState = initialState,
    ) {
        this.state = state;
        this.snapshot = this.createSnapshot();
    }

    public getSnapshot = (): CreateSolutionViewModelSnapshot => this.snapshot;

    private createSnapshot(): CreateSolutionViewModelSnapshot {
        const validationErrors = validate(this.state, this.state.solutionExists, false);
        const templateOptions = hardwareTemplateOptions(this.state.deviceSelection.value, this.state.datamanagerApps);
        const exampleEntries: Array<TreeViewCategory<string>> = [];
        if (templateOptions.length) {
            exampleEntries.push({
                categories: [],
                header: 'Templates',
                items: templateOptions.map((template): TreeViewItem<string> => ({
                    label: template.name,
                    value: `${TEMPLATE_PREFIX}${template.name}`,
                    tooltip: template.description,
                    className: 'template',
                })),
            });
        }
        exampleEntries.push(...this.state.datamanagerApps);

        const selectedTemplate = this.state.selectedTemplate.value;
        const selectedExampleText = selectedTemplate?.value.name ?? 'Select Project';
        const enableSetSolutionName = selectedTemplate?.type === 'template';
        const draftProjectType = selectedTemplate?.type === 'dataManagerApp'
            ? selectedTemplate.value.draftType
            : undefined;

        return {
            state: this.state,
            validationErrors,
            canCreate: !!this.state.deviceSelection.value?.key
                && !!this.state.solutionLocation.value
                && !!selectedTemplate
                && !hasErrors(validationErrors)
                && !this.dropdownOpen,
            disabled: this.state.createProgress !== 'idle',
            enableSetSolutionName,
            targetTypeFieldEnabled: enableSetSolutionName || draftProjectType === 'Template',
            exampleEntries,
            selectedExampleText,
            projectRows: this.createProjectRows(),
            showTrustzoneInfo: this.state.deviceSelection.value?.processors.some(validTrustZone) ?? false,
        };
    }

    public subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    public initialize(): void {
        if (this.unsubscribeMessages) {
            return;
        }

        this.unsubscribeMessages = this.messageHandler.subscribe(this.handleIncomingMessage);
        this.request({ type: 'GET_PLATFORM' });
        this.request({ type: 'GET_STATE_USE_WEBSERVICES' });
        this.request({ type: 'DATA_GET_TARGETS' });
        this.request({ type: 'DATA_GET_DEFAULT_LOCATION' });
    }

    public dispose(): void {
        this.unsubscribeMessages?.();
        this.unsubscribeMessages = undefined;
        for (const pending of this.pendingRequests.values()) {
            clearTimeout(pending.timeout);
            pending.reject(new Error('Create Solution view disposed'));
        }
        this.pendingRequests.clear();
    }

    public dispatch = (action: CreateSolutionAction): void => {
        const previousState = this.state;
        const nextState = createSolutionReducer(this.state, action);
        if (nextState !== this.state) {
            this.state = nextState;
            this.snapshot = this.createSnapshot();
            this.listeners.forEach(listener => listener());
            this.requestDependentData(previousState, action);
        }
    };

    public request(request: RequestMessagePayload): RequestMessage {
        const message = addRequestId(request);
        const channel = this.getRequestChannel(message.type);
        if (channel) {
            this.latestRequestByChannel.set(channel, message.requestId);
        }
        this.messageHandler.push(message);
        return message;
    }

    public close(): void {
        this.messageHandler.push({ type: 'WEBVIEW_CLOSE' });
    }

    public setDropdownOpen(open: boolean): void {
        if (this.dropdownOpen !== open) {
            this.dropdownOpen = open;
            this.snapshot = this.createSnapshot();
            this.listeners.forEach(listener => listener());
        }
    }

    public openFilePicker(): void {
        this.request({ type: 'OPEN_FILE_PICKER', solutionLocation: this.state.solutionLocation.value });
    }

    public openHelp(): void {
        this.request({ type: 'HELP_OPEN' });
    }

    public selectExample(value: string): void {
        if (value.startsWith(TEMPLATE_PREFIX)) {
            const templateName = value.slice(TEMPLATE_PREFIX.length);
            const template = hardwareTemplateOptions(this.state.deviceSelection.value, this.state.datamanagerApps)
                .find(candidate => candidate.name === templateName);
            if (template) {
                this.dispatch({ type: 'SET_SELECTED_TEMPLATE', template: { type: 'template', value: template } });
            }
        } else {
            this.dispatch({ type: 'SET_SELECTED_DRAFTPROJECT_ID', id: value });
        }
    }

    public async createSolution(): Promise<void> {
        this.dispatch({ type: 'CREATION_CHECK_START' });

        const solutionExists = await this.checkSolutionExists(
            this.state.solutionLocation.value,
            this.state.solutionName.value,
            this.state.solutionFolder.value,
        );
        if (hasErrors(validate(this.state, { type: 'loaded', result: solutionExists }, true))) {
            this.dispatch({ type: 'CREATION_END' });
            return;
        }

        this.dispatch({ type: 'CREATION_START' });
        try {
            await this.awaitRequest(buildNewSolutionMessage(this.state)).promise;
        } catch {
            this.dispatch({ type: 'CREATION_END' });
            return;
        }

        this.close();
    }

    public async checkSolutionExists(
        solutionLocation: string,
        solutionName: string,
        solutionFolder: string,
    ): Promise<boolean> {
        this.dispatch({ type: 'START_SOLUTION_EXISTS_CHECK' });
        const pending = this.awaitRequest({
            type: 'CHECK_SOLUTION_DOES_NOT_EXIST',
            solutionLocation,
            solutionName,
            solutionFolder,
        });
        this.latestExistenceRequestId = pending.requestId;

        let solutionExists = false;
        try {
            await pending.promise;
        } catch (error) {
            solutionExists = error instanceof Error && error.message.includes('already exists');
        }

        if (this.latestExistenceRequestId === pending.requestId) {
            this.dispatch({ type: 'END_SOLUTION_EXISTS_CHECK', result: solutionExists });
        }
        return solutionExists;
    }

    private readonly handleIncomingMessage = (message: IncomingMessage): void => {
        if (message.type === 'REQUEST_SUCCESSFUL' || message.type === 'REQUEST_FAILED') {
            const pending = this.pendingRequests.get(message.requestId);
            if (!pending || pending.requestType !== message.requestType) {
                return;
            }
            clearTimeout(pending.timeout);
            this.pendingRequests.delete(message.requestId);
            if (message.type === 'REQUEST_SUCCESSFUL') {
                pending.resolve();
            } else {
                pending.reject(new Error(`CMSIS Request Failed: ${message.errorMessage ?? 'unknown error'}`));
            }
            return;
        }

        const channel = this.getResponseChannel(message.type);
        if (channel && this.latestRequestByChannel.get(channel) !== message.requestId) {
            return;
        }
        this.dispatch({ type: 'INCOMING_MESSAGE', message });
    };

    private awaitRequest(request: RequestMessagePayload): { requestId: string; promise: Promise<void> } {
        const message = addRequestId(request);
        const promise = new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pendingRequests.delete(message.requestId);
                reject(new Error(`CMSIS Request Failed: extension didn't respond within the timeout limit (${MESSAGE_TIMEOUT}ms)`));
            }, MESSAGE_TIMEOUT);
            this.pendingRequests.set(message.requestId, {
                requestType: message.type,
                resolve,
                reject,
                timeout,
            });
        });
        this.messageHandler.push(message);
        return { requestId: message.requestId, promise };
    }

    private requestDependentData(previousState: CreateSolutionState, action: CreateSolutionAction): void {
        const existenceQuery = [
            this.state.solutionLocation.value,
            this.state.solutionName.value,
            this.state.solutionFolder.value,
        ].join('\n');
        if (this.state.solutionLocation.value
            && this.state.solutionName.value
            && this.state.solutionFolder.value
            && existenceQuery !== this.lastExistenceQuery) {
            this.lastExistenceQuery = existenceQuery;
            void this.checkSolutionExists(
                this.state.solutionLocation.value,
                this.state.solutionName.value,
                this.state.solutionFolder.value,
            );
        }

        if (previousState.boardSelection !== this.state.boardSelection
            || previousState.deviceSelection !== this.state.deviceSelection
            || previousState.fromAllPackVersions !== this.state.fromAllPackVersions) {
            const board = this.state.boardSelection.value?.key;
            const device = this.state.deviceSelection.value?.key;
            if (board || device) {
                this.request({
                    type: 'DATA_GET_DATAMANAGER_APPS',
                    board,
                    device,
                    fromAllPackVersions: this.state.fromAllPackVersions,
                });
            }
        }

        if (previousState.hardwareLists.type !== 'loaded' && this.state.hardwareLists.type === 'loaded') {
            this.request({ type: 'DATA_GET_CONNECTED_DEVICE' });
        }
        if (previousState.selectedDraftProjectId !== this.state.selectedDraftProjectId
            && this.state.selectedDraftProjectId) {
            this.request({ type: 'DATA_GET_DRAFTPROJECT_INFO', id: this.state.selectedDraftProjectId });
        }
        if (action.type === 'SET_BOARD_PREVIEW') {
            this.request({ type: 'DATA_GET_BOARD_INFO', boardKey: action.boardPreview.key });
        } else if (action.type === 'SET_DEVICE_PREVIEW') {
            this.request({ type: 'DATA_GET_DEVICE_INFO', deviceKey: action.devicePreview.key });
        }
    }

    private createProjectRows(): ProjectConfigurationRow[] {
        const device = this.state.deviceSelection.value;
        if (!device) {
            return [];
        }
        return this.state.projects.map(project => {
            const processor = device.processors.find(candidate => candidate.name === project.value.processorName);
            const coreOptions = device.processors.map(candidate => candidate.name);
            return {
                project,
                coreOptions,
                selectedCore: coreOptions.length === 1 ? processor?.core ?? '' : project.value.processorName,
                trustzoneOptions: processor && validTrustZone(processor)
                    ? ['secure', 'non-secure', 'off']
                    : ['off'],
            };
        });
    }

    private getRequestChannel(type: RequestMessage['type']): ResponseChannel | undefined {
        switch (type) {
            case 'DATA_GET_TARGETS': return 'targets';
            case 'OPEN_FILE_PICKER':
            case 'DATA_GET_DEFAULT_LOCATION': return 'solutionLocation';
            case 'DATA_GET_BOARD_INFO':
            case 'DATA_GET_DEVICE_INFO': return 'hardwareInfo';
            case 'DATA_GET_CONNECTED_DEVICE': return 'connectedDevice';
            case 'GET_PLATFORM': return 'platform';
            case 'DATA_GET_DATAMANAGER_APPS': return 'draftProjects';
            case 'GET_STATE_USE_WEBSERVICES': return 'webServices';
            case 'DATA_GET_DRAFTPROJECT_INFO': return 'draftProject';
            default: return undefined;
        }
    }

    private getResponseChannel(type: Exclude<IncomingMessage['type'], 'REQUEST_SUCCESSFUL' | 'REQUEST_FAILED'>): ResponseChannel {
        switch (type) {
            case 'TARGET_DATA': return 'targets';
            case 'SOLUTION_LOCATION': return 'solutionLocation';
            case 'HARDWARE_INFO': return 'hardwareInfo';
            case 'CONNECTED_BOARD': return 'connectedDevice';
            case 'PLATFORM': return 'platform';
            case 'DATAMANAGER_APPS_DATA': return 'draftProjects';
            case 'STATE_USE_WEBSERVICES': return 'webServices';
            case 'DRAFTPROJECT_INFO': return 'draftProject';
        }
    }
}

type BoardDeviceState = Pick<CreateSolutionState, 'boardSelection' | 'deviceSelection'>;
type BoardDeviceTargetState = BoardDeviceState & Pick<CreateSolutionState, 'targetType'>;

const getTargetTypeFromHardwareSelection = (state: BoardDeviceTargetState): TargetType => {
    const deviceReference = state.deviceSelection.value?.id;
    const boardId = state.boardSelection.value?.id;
    return {
        type: state.targetType.value,
        ...(boardId ? { board: serialiseBoardIdWithoutVendor({ ...boardId, revision: boardId.revision ?? '' }) } : {}),
        ...(deviceReference ? { device: serialiseDeviceWithoutVendor({ ...deviceReference, processor: '' }) } : {}),
    };
};

const getSerialisedPacksFromState = (state: BoardDeviceState): string[] => {
    const packs: string[] = [];
    const boardPack = state.boardSelection.value?.pack;
    const devicePack = state.deviceSelection.value?.pack;
    if (boardPack) packs.push(serialisePackReference(boardPack));
    if (devicePack) packs.push(serialisePackReference(devicePack));
    packs.push('ARM::CMSIS');
    return dedupe<string>()(packs);
};

export const buildNewSolutionMessage = (state: CreateSolutionState): Extract<RequestMessagePayload, { type: 'NEW_SOLUTION' }> => ({
    type: 'NEW_SOLUTION',
    gitInit: state.initGit,
    showOpenDialog: state.showOpenDialog,
    solutionName: state.solutionName.value,
    projects: state.projects.map(({ value }) => value),
    solutionLocation: state.solutionLocation.value,
    solutionFolder: state.solutionFolder.value,
    targetTypes: [getTargetTypeFromHardwareSelection(state)],
    packs: getSerialisedPacksFromState(state).map((pack): PackRequirement => ({ pack, forContext: [], notForContext: [] })),
    compiler: state.compiler === 'Arm Compiler 6' ? 'AC6' : state.compiler === 'LLVM' ? 'CLANG' : state.compiler,
    selectedDraftId: state.selectedTemplate.value?.type === 'dataManagerApp'
        ? state.selectedTemplate.value.value.id
        : undefined,
});

export const selectTemplate = (template: CSolutionTemplate): DraftProject => ({
    type: 'template',
    value: template,
});
}