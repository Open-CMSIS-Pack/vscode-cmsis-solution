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

import { Mutex } from 'async-mutex';
import _ from 'lodash';
import path from 'path';
import * as vscode from 'vscode';
import * as fs from 'node:fs';
import { HandleBuildEnoent } from '../../src/tasks/build/handle-enoent';
import { CTreeItem, ITreeItem } from '../generic/tree-item';
import { ProcessManager, isProcessResult } from '../vscode-api/runner/process-manager';
import { CancellationToken } from '../vscode-api/runner/runner';
import which from 'which';
import { SemVer } from 'semver';
import { MIN_TOOLBOX_VERSION } from '../manifest';
import { Optional } from '../generic/type-helper';
import { CsolutionService } from '../json-rpc/csolution-rpc-client';
import type * as rpc from '../json-rpc/csolution-rpc-client';

type RpcMethod = 'ConvertSolution' | 'ListMissingPacks' | 'DiscoverLayers' | 'GetLogMessages' | 'Shutdown' | 'LoadPacks';
type ToolboxTool = 'csolution' | 'cbuild' | 'cpackget';
type ToolboxCall = { tool: ToolboxTool | RpcMethod; args: string[]; }

const MIN_TOOL_VERSIONS : Record<ToolboxTool, Optional<SemVer>> = {
    csolution: new SemVer(MIN_TOOLBOX_VERSION),
    cbuild: new SemVer(MIN_TOOLBOX_VERSION),
    cpackget: undefined,
};

const isErrnoException = (e: unknown): e is NodeJS.ErrnoException => Boolean(e) && e instanceof Error;

export interface CmsisToolboxManager {
    activate(context: vscode.ExtensionContext): Promise<void>

    readonly onRunCmsisTool: vscode.Event<[boolean, boolean?]>;

    /** Run CMSIS Tool
    * @param tool name of CMSIS command line tool to be executed
    * @param args list of strings arguments to be passed into the command line
    * @param onOutput output lines captured in the command line during execution
    * @param cancellationToken token to request process cancellation
    * @param terminal dimensions
    * @param useEmbeddedToolbox whether to use embedded toolbox binaries
    * @return number process return code
    */
    runCmsisTool(
        tool: ToolboxTool,
        args: string[],
        onOutput: (line: string) => void,
        cancellationToken?: CancellationToken,
        dimensions?: vscode.TerminalDimensions,
        useEmbeddedToolbox?: boolean,
        emitExecuteLine?: boolean
    ): Promise<[number, string?]>

    /** Run csolution RPC method
    * @param method name of RPC method to be executed
    * @param args list of arguments to be passed into the method request
    * @return method result according to each RPC method signature
    */
    runCsolutionRpc(
        method: RpcMethod,
        args: unknown,
    ): Promise<unknown>

    /** Collect Setup Messages
    * @param cBuildIdxYml CTreeItem with cbuild-idx.yml data
    * @return severity ('error', 'warning') or undefined
    */
    collectSetupMessages(cBuildIdxYml?: CTreeItem): string | undefined

    /** Get Setup Messages
    * @return array of setup messages for given context
    * @param selected context
    */
    getSetupMessages(context: string): string[] | undefined

    /** Check whether CMSIS tools are running
    * @return true if the queue is not empty or mutex is locked
    */
    isRunning(): boolean
}

/**
 *  CmsisToolboxManagerImpl maintains queue of calls to run cbuild and other toolbox executables.
 *  The executables may install CMSIS packs. Therefore the class also watches for pack.idx file changes and
 *  triggers reload of core tools to be in sync with toolbox. The reload is done once after queue gets empty.
 */
export class CmsisToolboxManagerImpl implements CmsisToolboxManager {

    constructor(
        private readonly processManager: ProcessManager,
        private readonly handleBuildEnoent: HandleBuildEnoent,
        private readonly csolutionService: CsolutionService,
    ) {
    }

    private readonly runCmsisToolEmitter = new vscode.EventEmitter<[boolean, boolean?]>();
    public readonly onRunCmsisTool = this.runCmsisToolEmitter.event;

    private readonly toolboxMutex = new Mutex();
    private readonly toolboxQueue: ToolboxCall[] = [];

    private readonly messagesMap: Map<string, string[]> = new Map();

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(
            this.runCmsisToolEmitter,
        );
    }

    public isRunning(): boolean {
        return this.toolboxQueue.length > 0 || this.toolboxMutex.isLocked();
    }

    public async runCmsisTool(
        tool: ToolboxTool,
        args: string[],
        onOutput: (line: string) => void,
        cancellationToken?: CancellationToken,
        dimensions?: vscode.TerminalDimensions,
        useEmbeddedToolbox?: boolean,
        emitExecuteLine: boolean = true
    ): Promise<[number, string?]> {
        let msg: string;
        if (this.toolboxQueue.find((q) => _.isEqual(q.tool, tool) && _.isEqual(q.args, args))) {
            // skip redundant call already enqueued
            msg = `Skip redundant: ${tool} ${args.join(' ')}`;
            console.debug(msg);
            return [0, undefined];
        }
        // enqueue call
        msg = `Enqueue: ${tool} ${args.join(' ')}`;
        console.debug(msg);
        this.toolboxQueue.push({ tool, args });
        // wait for mutex
        const release = await this.toolboxMutex.acquire();
        // dequeue
        this.toolboxQueue.shift();
        // Check tool version
        const toolCmd = (useEmbeddedToolbox ? this.embeddedTool(tool) : undefined)
            ?? (await which(tool, { nothrow: true })) ?? tool;
        if (MIN_TOOL_VERSIONS[tool]) {
            let versionOutput = '';
            const [versionMsg, versionReturnCode] = await this.runCmd(
                toolCmd,
                ['--version'],
                (line: string) => versionOutput += line + '\n',
                cancellationToken
            );
            const version = versionOutput.match(/(\d+\.\d+(\.\d+)?)/)?.[0];
            if (versionReturnCode !== 0 || !version) {
                console.warn(`Could not determine version of ${toolCmd}`);
                console.warn(versionMsg);
            } else if (MIN_TOOL_VERSIONS[tool].compare(version) === 1) {
                msg = `Version of ${tool} is ${version}\r\n(${toolCmd})\r\nArm CMSIS Solution Extension requires version ${MIN_TOOL_VERSIONS[tool].format()} or higher.`;
                console.error(msg);
                onOutput(msg);
                // release mutex
                release();
                return [-1, toolCmd];
            }
        }
        // execute call
        if (emitExecuteLine) {
            msg = `${tool} ${args.join(' ')}\r\n`;
            console.log(msg);
            onOutput(msg);
        }
        // set 'packs' event flag when installing packs via 'cpackget add' command
        this.runCmsisToolEmitter.fire([true, tool === 'cpackget' && args.includes('add')]);

        const [cmdMsg, returnCode] = await this.runCmd(
            toolCmd,
            args,
            onOutput,
            cancellationToken,
            dimensions
        );
        // Print messages
        msg = `${returnCode === 0 ? '✅' : '🟥'} Completed: ${tool} ${cmdMsg}\r\n`;
        console.log(msg);
        // release mutex
        release();
        this.runCmsisToolEmitter.fire([false]);
        return [returnCode, toolCmd];
    }

    private async runCmd(
        toolCmd: string,
        args: string[],
        onOutput: (line: string) => void,
        cancellationToken?: CancellationToken,
        dimensions?: vscode.TerminalDimensions,
    ) : Promise<[string, number]> {
        const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? './';
        let returnCode;
        let msg = '';
        try {
            const result = await this.processManager.spawn(
                toolCmd,
                args,
                { env: process.env, cwd: cwd },
                onOutput,
                cancellationToken,
                dimensions
            );
            msg += `succeed with exit code ${result.code}`;
            returnCode = result.code;
        } catch (result) {
            [msg, returnCode] = this.handleProcessFail(msg, result);
        }
        return [msg, returnCode];
    }

    readonly rpcHandler = {
        ConvertSolution: (a: rpc.ConvertSolutionParams) => this.csolutionService.convertSolution(a),
        ListMissingPacks: (a: rpc.LoadSolutionParams) => this.csolutionService.listMissingPacks(a),
        DiscoverLayers: (a: rpc.LoadSolutionParams) => this.csolutionService.discoverLayers(a),
        GetLogMessages: () => this.csolutionService.getLogMessages(),
        Shutdown: () => this.csolutionService.shutdown(),
        LoadPacks: () => this.csolutionService.loadPacks(),
    };

    public async runCsolutionRpc(
        method: RpcMethod,
        args: unknown,
    ): Promise<unknown> {
        let msg: string;
        const argsArray = Object.entries(args as never).map(([k, v]) => `${k}: ${v}`);
        if (this.toolboxQueue.find((q) => _.isEqual(q.tool, method) && _.isEqual(q.args, argsArray))) {
            // skip redundant call already enqueued
            msg = `Skip redundant: ${method} { ${argsArray.join(', ')} }`;
            console.debug(msg);
            return { success: true } as rpc.SuccessResult;
        }
        // enqueue call
        msg = `Enqueue: ${method} { ${argsArray.join(', ')} }`;
        console.debug(msg);
        this.toolboxQueue.push({ tool: method, args: argsArray });
        // wait for mutex
        const release = await this.toolboxMutex.acquire();
        // dequeue
        this.toolboxQueue.shift();
        // call rpc method
        this.runCmsisToolEmitter.fire([true]);
        const result = await this.rpcHandler[method as keyof typeof this.rpcHandler](args as never);
        msg = `${(result as rpc.SuccessResult).success ? '☑️' : '🟥'} RPC: ${method}` +
            `${argsArray.length > 0 ? ` { ${argsArray.join(', ')} }` : ''}`;
        console.log(msg);
        if (method === 'Shutdown' && (result as rpc.SuccessResult).success) {
            // wait for csolution process to exit
            await this.csolutionService.waitForExit();
        }
        // release mutex
        release();
        this.runCmsisToolEmitter.fire([false]);
        return result;
    }

    private handleProcessFail(msg: string, result: unknown): [string, number] {
        let returnCode = -1;
        if (isProcessResult(result)) {
            msg += `failed with exit code ${result.code}`;
            msg = this.handleErrnoException(msg, result.error);
            returnCode = result.code;
        } else {
            msg += ': ' + (result as Error).message;
        }
        return [msg, returnCode];
    }

    private handleErrnoException(msg: string, error: unknown): string {
        if (isErrnoException(error)) {
            if (error !== undefined) {
                msg += ': ' + (error as Error).message;
            }
            if (error.code === 'ENOENT') {
                this.handleBuildEnoent();
                msg += '\r\n' + 'CMSIS-Toolbox is not in the PATH';
            }
        }
        return msg;
    }

    public getSetupMessages(context: string): string[] | undefined {
        return this.messagesMap.get(context);
    }

    public collectSetupMessages(cBuildIdxYml?: CTreeItem): string | undefined {
        if (cBuildIdxYml) {
            this.messagesMap.clear();
            const cbuilds = cBuildIdxYml.findChild(['build-idx', 'cbuilds']);
            if (cbuilds) {
                return this.getCbuilds(cbuilds);
            }
        }
        return undefined;
    }

    protected getCbuilds(cbuilds: ITreeItem<CTreeItem>): string | undefined {
        const severityList: string[] = [];
        for (const cbuild of cbuilds.getChildren()) {
            severityList.push(this.getMessagesNode(cbuild));
        }
        return severityList.includes('error') ? 'error' : severityList.includes('warning') ? 'warning' : undefined;
    }

    protected getMessagesNode(cbuild: ITreeItem<CTreeItem>): string {
        const messages = cbuild.findChild(['messages']);
        if (messages) {
            const errors = messages.findChild(['errors']);
            const warnings = messages.findChild(['warnings']);
            if (errors || warnings) {
                return this.getMessagesChildren(this.getContextName(cbuild), errors, warnings);
            }
        }
        return '';
    }

    protected getMessagesChildren(context: string, errors?: ITreeItem<CTreeItem>, warnings?: ITreeItem<CTreeItem>): string {
        console.log('context:', context);
        const warningMessages = this.getMessagesItems(warnings);
        const errorMessages = this.getMessagesItems(errors);
        this.messagesMap.set(context, [...warningMessages, ...errorMessages]);
        return errorMessages.length > 0 ? 'error' : warningMessages.length > 0 ? 'warning' : '';
    }

    protected getMessagesItems(items?: ITreeItem<CTreeItem>): string[] {
        return items ? this.getMessagesTexts(items) : [];
    }

    protected getMessagesTexts(items: ITreeItem<CTreeItem>): string[] {
        const messages: string[] = [];
        const label = items.getTag()?.slice(0, -1);
        for (const item of items.getChildren()) {
            const msg = item.getText() ? `${label}: ${item.getText()!}` : '';
            console.log(msg);
            messages.push(msg);
        }
        return messages;
    }

    protected getContextName(cbuild: ITreeItem<CTreeItem>): string {
        const contextPath = cbuild.getChild('cbuild')?.getText();
        return contextPath ? path.basename(contextPath, '.cbuild.yml') : '';
    }

    protected embeddedTool(tool: ToolboxTool): string | undefined {
        const embeddedCsolution = this.csolutionService.getCsolutionBin();
        if (path.isAbsolute(embeddedCsolution)) {
            const toolPath = path.join(path.dirname(embeddedCsolution), tool + path.extname(embeddedCsolution));
            if (fs.existsSync(toolPath) && fs.statSync(toolPath).isFile()) {
                return toolPath;
            }
        }
        return undefined;
    }
}
