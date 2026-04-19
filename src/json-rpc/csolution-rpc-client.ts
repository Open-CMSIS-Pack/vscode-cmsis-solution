/*
 * Copyright (C) 2026 Arm Limited
 */

import * as vscode from 'vscode';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as manifest from '../manifest';
import { ChildProcess, spawn } from 'node:child_process';
import { MessageConnection } from 'vscode-jsonrpc';
import { createMessageConnection, StreamMessageReader, StreamMessageWriter } from 'vscode-jsonrpc/node';
import { RpcMethods, RpcInterface } from './interface/rpc-interface';
import { constructor } from '../generic/constructor';
import { Optional } from '../generic/type-helper';
import { debounce } from 'lodash';
import { getCmsisPackRoot, getCmsisToolboxRoot } from '../utils/path-utils';
import { VcpkgManager } from '../vcpkg/vcpkg-manager';
import { Environment, EnvironmentManager } from '../desktop/env-manager';
import { Mutex } from 'async-mutex';
import { CommandsProvider } from '../vscode-api/commands-provider';
export * from './interface/rpc-interface';


declare module './interface/rpc-interface' {
    export interface Condition {
        selectedAggregate?: string; // only used in UI to keep the selection in the dropdown
    }
}

export interface CsolutionService extends RpcInterface {
    activate(context: Pick<vscode.ExtensionContext, 'subscriptions'>): Promise<void>;
    getCsolutionBin(): string;
    waitForExit(): Promise<void>;
}

class CsolutionServiceImpl extends RpcMethods implements CsolutionService {
    public static readonly reloadPacksCommandId = `${manifest.PACKAGE_NAME}.reloadPacks`;

    // private members and functions for client handling ---------------------------------
    private child: ChildProcess | undefined;
    private connection: MessageConnection | undefined;
    private idxWatcher: Optional<fs.FSWatcher> = undefined;
    private readonly debouncedLoadPacks = debounce(super.loadPacks.bind(this), 1000);
    private csolutionBin = 'csolution';
    private exitPromise: Promise<void> | undefined;
    private hasReportedVersionForSession = false;
    private readonly mutex: Mutex;

    constructor(
        private readonly environmentManager: EnvironmentManager,
        private readonly commandsProvider: CommandsProvider,
    ) {
        super();
        this.mutex = new Mutex();
    }

    public async activate(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            this,
            this.commandsProvider.registerCommand(CsolutionServiceImpl.reloadPacksCommandId, this.loadPacks, this),
        );
        this.loadPacks();
    }

    public async dispose() {
        await this.shutdown();
        await this.waitForExit();
    }

    async get<TArgs, TResponse>(remoteMethod: string, args?: TArgs): Promise<TResponse> {
        const response = await this.transceive<TResponse>(remoteMethod, args);
        return (response ?? {}) as TResponse;
    }

    public async loadPacks() {
        if (this.idxWatcher === undefined) {
            this.watchPackIdxFile();
        }

        // Query daemon version once per launched session right before first LoadPacks.
        if (!this.hasReportedVersionForSession) {
            try {
                const version = await super.getVersion();
                console.log('csolution version:', version);
            } catch (error) {
                console.warn('Unable to query csolution version before loadPacks:', error);
            } finally {
                this.hasReportedVersionForSession = true;
            }
        }

        return super.loadPacks();
    }

    public getCsolutionBin(): string {
        return this.csolutionBin;
    }

    public async waitForExit(): Promise<void> {
        return this.exitPromise ?? Promise.resolve();
    }

    private watchPackIdxFile() {
        this.idxWatcher?.close();
        const pack_idx = path.join(getCmsisPackRoot(), 'pack.idx');
        let mtimeMs = fs.statSync(pack_idx)?.mtimeMs;
        this.idxWatcher = fs.watch(pack_idx, eventType => {
            if (eventType === 'change') {
                const stat = fs.statSync(pack_idx);
                if (stat?.mtimeMs !== mtimeMs) {
                    mtimeMs = stat.mtimeMs;
                    this.debouncedLoadPacks();
                }
            }
        });
    }

    private async transceive<TResponse>(method: string, params?: unknown, ..._rest: unknown[]):
        Promise<TResponse | undefined> {
        const release = await this.mutex.acquire();
        try {
            if (!(this.child?.pid) && !(await this.launch())) {
                return undefined;
            }
            console.log('csolution rpc request:', method, params ? JSON.stringify(params) : '{ }');
            const start = Date.now();
            let response = undefined;
            try {
                response = params ?
                    await this.connection?.sendRequest<TResponse>(method, params) :
                    await this.connection?.sendRequest<TResponse>(method);
            } catch (error) {
                response = { success: false, message: error instanceof Error ? error.message : String(error) } as TResponse;
            }
            console.log(`csolution rpc response took ${Date.now() - start}ms:`, response);
            return response;
        } finally {
            release();
        }
    }

    private onTerminate() {
        this.child = undefined;
        this.idxWatcher?.close();
        this.idxWatcher = undefined;
        this.connection?.dispose();
        this.connection = undefined;
        this.hasReportedVersionForSession = false;
    }

    private async launch(): Promise<boolean> {
        // wait vcpkg activation to pick up environment variables
        await VcpkgManager.instance.awaitActivation().catch(() => {
            console.warn('VcpkgManager activation failed or timed out');
        }).then(() => {
            console.log('VcpkgManager activation completed');
        });

        // Augment environment
        const augmentedEnv = this.environmentManager.augmentEnv(new Environment(process.env)).vars;

        // Resolve the final path to the executable
        this.csolutionBin = path.resolve(getCmsisToolboxRoot(augmentedEnv), 'bin', `csolution${process.platform === 'win32' ? '.exe' : ''}`);

        if (fs.existsSync(this.csolutionBin) && fs.statSync(this.csolutionBin).isFile()) {
            console.log('Running csolution rpc:', this.csolutionBin);
        } else {
            console.error('csolution rpc executable not found:', this.csolutionBin);
            this.csolutionBin = 'csolution';
        }

        if (!this.child) {
            // append extra args from env.CSOLUTION_ARGS only if it is defined and not empty
            const args = augmentedEnv.CSOLUTION_ARGS?.split(',').map(s => s.trim()).filter(s => s) ?? [];
            this.child = spawn(this.csolutionBin, ['rpc', '--content-length', ...args],
                {
                    cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? './',
                    env: augmentedEnv,
                }
            );
            this.exitPromise = new Promise((resolve, reject) => {
                this.child?.on('exit', (code) => {
                    console.warn(`csolution rpc child process exited (${code})`);
                    this.onTerminate();
                    resolve();
                });
                this.child?.on('error', (error) => {
                    console.error('csolution rpc child process error:', error);
                    this.onTerminate();
                    reject();
                });
                this.child?.on('disconnect', () => {
                    console.warn('csolution rpc child process disconnected');
                    this.onTerminate();
                    reject();
                });
            });
            this.child.stderr?.on('data', (data) => {
                console.error('csolution rpc child process stderr:', data.toString());
            });

            if (!this.child?.pid || !this.child.stdout || !this.child.stdin) {
                console.error('csolution rpc launch failed');
                throw new Error('csolution rpc launch failed');
            }
            console.warn('csolution rpc started pid:', this.child.pid);

            // Use stdin and stdout for communication
            this.connection = createMessageConnection(
                new StreamMessageReader(this.child.stdout),
                new StreamMessageWriter(this.child.stdin)
            );

            // Listen for child process close event
            this.child.on('close', (code) => {
                console.warn(`csolution rpc child process closed (${code})`);
                this.onTerminate();
                throw new Error(`csolution rpc child process closed (${code})`);
            });

            // Listen for rpc connection errors
            this.connection.onError((error) => {
                console.error('csolution rpc connection error:', error);
                throw error;
            });

            // Start listening
            this.connection.listen();
        } else {
            console.log('ignoring launch request, csolution rpc already running');
        }
        return true;
    }
}

export const CsolutionService = constructor<typeof CsolutionServiceImpl, CsolutionService>(CsolutionServiceImpl);
