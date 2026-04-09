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
import * as vscode from 'vscode';
import { constructor } from '../generic/constructor';
import { LogMessages, VariablesConfiguration } from '../json-rpc/csolution-rpc-client';
import { Severity } from './constants';

/**
 * Event data for solution conversion request
 */
export interface ConvertRequestData {
    solutionPath?: string;
    targetSet?: string;
    updateRte?: boolean;
    restartRpc?: boolean;
    lockAbort?: boolean;
}

/**
 * Event data for configure solution readiness
 */
export interface ConfigureSolutionData {
    availableCompilers: string[];
    availableConfigurations: VariablesConfiguration[] | undefined;
}

/**
 * Event data for solution conversion result
 */
export interface ConvertResultData {
    severity: Severity;
    detection: boolean;
    logMessages: LogMessages;
    toolsOutputMessages?: string[];
}

/**
 * Centralized event hub for managing and coordinating solution-related events.
 * Provides bidirectional asynchronous event processing with type-safe event registration and firing.
 */
export interface SolutionEventHub {

    /**
     * Activates and registers events
     * @param context Extension context to register
     */
    activate(context: vscode.ExtensionContext): Promise<void>;

    /**
     * Fire solution conversion request event
     * @param updateRte Whether to update RTE during conversion
     * @param restartRpc Whether to restart RPC connection after conversion
     */
    fireConvertRequest(data: ConvertRequestData): Promise<void>;
    /**
     * Event fired when solution conversion is requested
     */
    readonly onDidConvertRequested: vscode.Event<ConvertRequestData>;
    /**
     * Fire solution conversion completion event
     */
    fireConvertCompleted(data: ConvertResultData): Promise<void>;
    /**
     * Event fired when solution conversion is completed
     */
    readonly onDidConvertCompleted: vscode.Event<ConvertResultData>;
    /**
     * Fire configure solution data ready event
     */
    fireConfigureSolutionDataReady(data: ConfigureSolutionData): Promise<void>;
    /**
     * Event fired when configure solution data is ready (compilers / layer configurations detected)
     */
    readonly onDidConfigureSolutionDataReady: vscode.Event<ConfigureSolutionData>;
}

class SolutionEventHubImpl {

    private readonly convertRequestEmitter = new vscode.EventEmitter<ConvertRequestData>();
    public readonly onDidConvertRequested: vscode.Event<ConvertRequestData> = this.convertRequestEmitter.event;

    private readonly convertCompleteEmitter = new vscode.EventEmitter<ConvertResultData>();
    public readonly onDidConvertCompleted: vscode.Event<ConvertResultData> = this.convertCompleteEmitter.event;

    private readonly configureSolutionDataEmitter = new vscode.EventEmitter<ConfigureSolutionData>();
    public readonly onDidConfigureSolutionDataReady: vscode.Event<ConfigureSolutionData> = this.configureSolutionDataEmitter.event;

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(this.convertRequestEmitter);
        context.subscriptions.push(this.convertCompleteEmitter);
        context.subscriptions.push(this.configureSolutionDataEmitter);
    }

    public async fireConvertRequest(data: ConvertRequestData): Promise<void> {
        this.convertRequestEmitter.fire(data);
    }

    public async fireConvertCompleted(data: ConvertResultData): Promise<void> {
        this.convertCompleteEmitter.fire(data);
    }

    public async fireConfigureSolutionDataReady(data: ConfigureSolutionData): Promise<void> {
        this.configureSolutionDataEmitter.fire(data);
    }
}

export const SolutionEventHub = constructor<typeof SolutionEventHubImpl, SolutionEventHub>(SolutionEventHubImpl);

