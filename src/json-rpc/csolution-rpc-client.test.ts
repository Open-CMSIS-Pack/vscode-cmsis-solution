/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * Copyright (C) 2026 Arm Limited
 */

import path from 'path';
import fs from 'node:fs';
import * as pathUtils from '../utils/path-utils';
import * as childProcess from 'node:child_process';
import * as jsonrpc from 'vscode-jsonrpc/node';
import * as vscode from 'vscode';
import { CsolutionService } from './csolution-rpc-client';
import { VcpkgManager } from '../vcpkg/vcpkg-manager';
import { Environment, EnvironmentManager } from '../desktop/env-manager';
import { CommandsProvider } from '../vscode-api/commands-provider';
import { SolutionEventHub } from '../solutions/solution-event-hub';

jest.mock('node:child_process', () => ({
    ...jest.requireActual('node:child_process'),
    spawn: jest.fn(),
}));

jest.mock('vscode-jsonrpc/node', () => ({
    createMessageConnection: jest.fn(),
    StreamMessageReader: jest.fn(),
    StreamMessageWriter: jest.fn(),
}));

type LoadPacksResult = Awaited<ReturnType<CsolutionService['loadPacks']>>;

describe('CsolutionService pack catalog readiness', () => {
    it('waits for packs before GetPacksInfo without loading a solution', async () => {
        const service = new CsolutionService({} as EnvironmentManager, {} as CommandsProvider, {} as SolutionEventHub);
        const internal = service as unknown as {
            initializePacks(): Promise<LoadPacksResult>;
            transceive(method: string, args?: unknown): Promise<unknown>;
            onTerminate(): void;
        };
        let finishLoading!: (result: LoadPacksResult) => void;
        const loading = new Promise<LoadPacksResult>(resolve => { finishLoading = resolve; });
        const initialize = jest.spyOn(internal, 'initializePacks').mockReturnValue(loading);
        const transceive = jest.spyOn(internal, 'transceive').mockResolvedValue({ success: true });
        const initialLoad = service.loadPacks();
        const args = { context: '', all: true };
        const request = service.getPacksInfo(args);
        expect(transceive).not.toHaveBeenCalled();
        finishLoading({ success: true });
        await initialLoad;
        await request;
        expect(transceive).toHaveBeenCalledWith('GetPacksInfo', args);
        expect(initialize).toHaveBeenCalledTimes(1);
        await service.getPacksInfo(args);
        expect(initialize).toHaveBeenCalledTimes(1);
        internal.onTerminate();
        await service.getPacksInfo(args);
        expect(initialize).toHaveBeenCalledTimes(2);
        expect(transceive.mock.calls.map(call => call[0])).not.toContain('LoadSolution');
    });

    it('rejects failed initialization and retries on a later pack query', async () => {
        const service = new CsolutionService({} as EnvironmentManager, {} as CommandsProvider, {} as SolutionEventHub);
        const internal = service as unknown as {
            initializePacks(): Promise<LoadPacksResult>;
            transceive(method: string, args?: unknown): Promise<unknown>;
        };
        const initialize = jest.spyOn(internal, 'initializePacks').mockResolvedValue({ success: false, message: 'Pack index failed' });
        const transceive = jest.spyOn(internal, 'transceive').mockResolvedValue({ success: true, packs: [] });
        const args = { context: '', all: true };
        await expect(service.getPacksInfo(args)).rejects.toThrow('Pack index failed');
        expect(transceive).not.toHaveBeenCalled();
        initialize.mockResolvedValueOnce({ success: true });
        await expect(service.getPacksInfo(args)).resolves.toEqual({ success: true, packs: [] });
        initialize.mockRejectedValueOnce(new Error('RPC offline'));
        await expect(service.loadPacks()).rejects.toThrow('RPC offline');
        initialize.mockResolvedValue({ success: true });
        await expect(service.getPacksInfo(args)).resolves.toEqual({ success: true, packs: [] });
        expect(initialize).toHaveBeenCalledTimes(4);
    });

    it('does not retry a failed load for queries already waiting on it', async () => {
        const service = new CsolutionService({} as EnvironmentManager, {} as CommandsProvider, {} as SolutionEventHub);
        const internal = service as unknown as {
            initializePacks(): Promise<LoadPacksResult>;
            transceive(method: string, args?: unknown): Promise<unknown>;
        };
        let finishLoading!: (result: LoadPacksResult) => void;
        const loading = new Promise<LoadPacksResult>(resolve => { finishLoading = resolve; });
        const initialize = jest.spyOn(internal, 'initializePacks').mockReturnValueOnce(loading).mockResolvedValue({ success: true });
        const transceive = jest.spyOn(internal, 'transceive').mockResolvedValue({ success: true, packs: [] });
        const args = { context: '', all: true };
        const first = service.getPacksInfo(args);
        const second = service.getPacksInfo(args);
        finishLoading({ success: false, message: 'Pack index failed' });
        await expect(first).rejects.toThrow('Pack index failed');
        await expect(second).rejects.toThrow('Pack index failed');
        expect(initialize).toHaveBeenCalledTimes(1);
        expect(transceive).not.toHaveBeenCalled();
        await expect(service.getPacksInfo(args)).resolves.toEqual({ success: true, packs: [] });
        expect(initialize).toHaveBeenCalledTimes(2);
    });

    it('waits for new pack initialization after a session terminates', async () => {
        const service = new CsolutionService({} as EnvironmentManager, {} as CommandsProvider, {} as SolutionEventHub);
        const internal = service as unknown as {
            initializePacks(): Promise<LoadPacksResult>;
            transceive(method: string, args?: unknown): Promise<unknown>;
            onTerminate(): void;
        };
        let rejectOld!: (error: Error) => void;
        let finishNew!: (result: LoadPacksResult) => void;
        const oldLoad = new Promise<LoadPacksResult>((_, reject) => { rejectOld = reject; });
        const newLoad = new Promise<LoadPacksResult>(resolve => { finishNew = resolve; });
        jest.spyOn(internal, 'initializePacks').mockReturnValueOnce(oldLoad).mockReturnValueOnce(newLoad);
        const transceive = jest.spyOn(internal, 'transceive').mockResolvedValue({ success: true, packs: [] });
        const request = service.getPacksInfo({ context: '', all: true });
        internal.onTerminate();
        rejectOld(new Error('Old session closed'));
        await Promise.resolve();
        expect(transceive).not.toHaveBeenCalled();
        finishNew({ success: true });
        await expect(request).resolves.toEqual({ success: true, packs: [] });
        expect(transceive).toHaveBeenCalledTimes(1);
    });

    it('waits for overlapping pack loads to finish in order', async () => {
        const service = new CsolutionService({} as EnvironmentManager, {} as CommandsProvider, {} as SolutionEventHub);
        const internal = service as unknown as {
            initializePacks(): Promise<LoadPacksResult>;
            transceive(method: string, args?: unknown): Promise<unknown>;
        };
        let finishFirst!: (result: LoadPacksResult) => void;
        let finishSecond!: (result: LoadPacksResult) => void;
        const firstLoad = new Promise<LoadPacksResult>(resolve => { finishFirst = resolve; });
        const secondLoad = new Promise<LoadPacksResult>(resolve => { finishSecond = resolve; });
        const initialize = jest.spyOn(internal, 'initializePacks').mockReturnValueOnce(firstLoad).mockReturnValueOnce(secondLoad);
        const transceive = jest.spyOn(internal, 'transceive').mockResolvedValue({ success: true, packs: [] });
        const initialLoad = service.loadPacks();
        const reload = service.loadPacks();
        const request = service.getPacksInfo({ context: '', all: true });
        expect(initialize).toHaveBeenCalledTimes(1);
        finishFirst({ success: true });
        await initialLoad;
        await Promise.resolve();
        expect(initialize).toHaveBeenCalledTimes(2);
        expect(transceive).not.toHaveBeenCalled();
        finishSecond({ success: true });
        await reload;
        await expect(request).resolves.toEqual({ success: true, packs: [] });
        expect(transceive).toHaveBeenCalledTimes(1);
    });

    it('does not run a queued load after termination', async () => {
        const service = new CsolutionService({} as EnvironmentManager, {} as CommandsProvider, {} as SolutionEventHub);
        const internal = service as unknown as {
            initializePacks(): Promise<LoadPacksResult>;
            onTerminate(): void;
        };
        let finishOld!: (result: LoadPacksResult) => void;
        const oldLoad = new Promise<LoadPacksResult>(resolve => { finishOld = resolve; });
        const initialize = jest.spyOn(internal, 'initializePacks').mockReturnValueOnce(oldLoad).mockResolvedValue({ success: true });
        const initialLoad = service.loadPacks();
        const queuedLoad = service.loadPacks();
        internal.onTerminate();
        finishOld({ success: true });
        await initialLoad;
        await expect(queuedLoad).resolves.toEqual({ success: false, message: 'Pack load superseded' });
        expect(initialize).toHaveBeenCalledTimes(1);
        await service.loadPacks();
        expect(initialize).toHaveBeenCalledTimes(2);
    });
});

describe('csolution-rpc-client', () => {
    type AnyService = Record<string, any>;
    let eventHub: SolutionEventHub;

    function createService(envManager?: EnvironmentManager, commandsProvider?: AnyService): AnyService {
        // `constructor(...)` wrapper shape is repo-specific; treat as constructible in tests.
        const mockEnvManager = envManager ?? ({
            augmentEnv: jest.fn().mockReturnValue(new Environment({}))
        } as unknown as EnvironmentManager);
        const mockCommandsProvider = commandsProvider ?? ({
            executeCommand: jest.fn().mockResolvedValue(undefined),
            registerCommand: jest.fn(),
        });
        return new (CsolutionService as unknown as new (em: EnvironmentManager, cp: AnyService, hub: SolutionEventHub) => AnyService)(mockEnvManager, mockCommandsProvider, eventHub);
    }

    beforeEach(() => {
        eventHub = new SolutionEventHub();
        jest.spyOn(console, 'log').mockImplementation(() => undefined);
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        jest.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('csolution-rpc-client transceive', () => {
        let service: AnyService;

        beforeEach(() => {
            service = createService();
        });

        it('returns undefined when no child is running and launch() returns false, and always releases the mutex', async () => {
            const release = jest.fn();
            const acquire = jest.fn().mockResolvedValue(release);
            service.mutex = { acquire };

            const launch = jest.spyOn(service as any, 'launch').mockResolvedValue(false);

            service.child = undefined;
            service.connection = { sendRequest: jest.fn() };

            const result = await service.transceive('someMethod', { a: 1 });

            expect(result).toBeUndefined();
            expect(launch).toHaveBeenCalledTimes(1);
            expect(service.connection.sendRequest).not.toHaveBeenCalled();

            expect(acquire).toHaveBeenCalledTimes(1);
            expect(release).toHaveBeenCalledTimes(1);
        });

        it('calls launch() when no child is running, then sends request with params', async () => {
            const release = jest.fn();
            service.mutex = { acquire: jest.fn().mockResolvedValue(release) };

            const sendRequest = jest.fn().mockResolvedValue({ ok: true });
            const launch = jest.spyOn(service as any, 'launch').mockImplementation(async () => {
                service.child = { pid: 123 } as any;
                service.connection = { sendRequest };
                return true;
            });

            service.child = undefined;
            service.connection = undefined;

            const result = await service.transceive('m', { x: 1 });

            expect(launch).toHaveBeenCalledTimes(1);
            expect(sendRequest).toHaveBeenCalledTimes(1);
            expect(sendRequest).toHaveBeenCalledWith('m', { x: 1 });
            expect(result).toEqual({ ok: true });

            expect(release).toHaveBeenCalledTimes(1);
        });

        it('does not call launch() when child is already running, and sends request with params', async () => {
            const release = jest.fn();
            service.mutex = { acquire: jest.fn().mockResolvedValue(release) };

            const sendRequest = jest.fn().mockResolvedValue({ ok: true });
            service.child = { pid: 123 } as any;
            service.connection = { sendRequest };

            const launch = jest.spyOn(service as any, 'launch');

            const result = await service.transceive('m', { x: 1 });

            expect(launch).not.toHaveBeenCalled();
            expect(sendRequest).toHaveBeenCalledTimes(1);
            expect(sendRequest).toHaveBeenCalledWith('m', { x: 1 });
            expect(result).toEqual({ ok: true });

            expect(release).toHaveBeenCalledTimes(1);
        });

        it('sends request without params when params are undefined', async () => {
            const release = jest.fn();
            service.mutex = { acquire: jest.fn().mockResolvedValue(release) };

            const sendRequest = jest.fn().mockResolvedValue({ ok: true });
            service.child = { pid: 123 } as any;
            service.connection = { sendRequest };

            const result = await service.transceive('m');

            expect(sendRequest).toHaveBeenCalledTimes(1);
            expect(sendRequest).toHaveBeenCalledWith('m');
            expect(result).toEqual({ ok: true });

            expect(release).toHaveBeenCalledTimes(1);
        });

        it('wraps sendRequest error into a { success:false, message } response and releases the mutex', async () => {
            const release = jest.fn();
            service.mutex = { acquire: jest.fn().mockResolvedValue(release) };

            const sendRequest = jest.fn().mockRejectedValue(new Error('boom'));
            service.child = { pid: 123 } as any;
            service.connection = { sendRequest };

            const result = await service.transceive('m', { x: 1 });

            expect(sendRequest).toHaveBeenCalledTimes(1);
            expect(sendRequest).toHaveBeenCalledWith('m', { x: 1 });
            expect(result).toEqual({ success: false, message: 'boom' });

            expect(release).toHaveBeenCalledTimes(1);
        });
    });

    describe('csolution-rpc-client getVersion cache', () => {
        let service: AnyService;

        beforeEach(() => {
            service = createService();
            service.cachedVersion = { success: false };
        });

        it('caches version after first request and reuses it', async () => {
            const transceiveSpy = jest.spyOn(service as any, 'transceive')
                .mockResolvedValue({ success: true, version: '1.2.3', apiVersion: '0.0.9' });

            const first = await service.getVersion();
            const second = await service.getVersion();

            expect(first).toEqual({ success: true, version: '1.2.3', apiVersion: '0.0.9' });
            expect(second).toEqual({ success: true, version: '1.2.3', apiVersion: '0.0.9' });
            expect(transceiveSpy).toHaveBeenCalledTimes(1);
            expect(transceiveSpy).toHaveBeenCalledWith('GetVersion', undefined);
        });

        it('resets cached version on terminate and fetches again on next getVersion', async () => {
            const transceiveSpy = jest.spyOn(service as any, 'transceive')
                .mockResolvedValue({ success: true, version: '1.2.3', apiVersion: '0.0.9' });
            const idxWatcherClose = jest.fn();
            const localRepositoryIdxWatcherClose = jest.fn();
            service.idxWatcher = { close: idxWatcherClose };
            service.localRepositoryIdxWatcher = { close: localRepositoryIdxWatcherClose };

            await service.getVersion();
            expect(transceiveSpy).toHaveBeenCalledTimes(1);

            // Simulate daemon termination lifecycle.
            service.onTerminate();
            expect(service.cachedVersion).toEqual({ success: false });
            expect(idxWatcherClose).toHaveBeenCalledTimes(1);
            expect(localRepositoryIdxWatcherClose).toHaveBeenCalledTimes(1);
            expect(service.idxWatcher).toBeUndefined();
            expect(service.localRepositoryIdxWatcher).toBeUndefined();

            await service.getVersion();
            expect(transceiveSpy).toHaveBeenCalledTimes(2);
        });

        it('primes version cache in loadPacks before LoadPacks RPC', async () => {
            service.idxWatcher = { close: jest.fn() };
            service.localRepositoryIdxWatcher = { close: jest.fn() };
            const sequence: string[] = [];

            const transceiveSpy = jest.spyOn(service as any, 'transceive').mockImplementation(async (...args: unknown[]) => {
                const method = String(args[0]);
                sequence.push(method);
                if (method === 'GetVersion') {
                    return { success: true, version: '1.2.3', apiVersion: '0.0.9' };
                }
                if (method === 'LoadPacks') {
                    return { success: true };
                }
                return { success: false };
            });

            await service.loadPacks();

            expect(transceiveSpy).toHaveBeenCalledWith('GetVersion', undefined);
            expect(transceiveSpy).toHaveBeenCalledWith('LoadPacks', undefined);
            expect(sequence.indexOf('GetVersion')).toBeLessThan(sequence.indexOf('LoadPacks'));
            expect(service.commandsProvider.executeCommand).not.toHaveBeenCalled();
        });

        it('emits a reload event without running a refresh command', async () => {
            const neverResolves = new Promise<void>(() => undefined);
            const listener = jest.fn();
            eventHub.onDidReloadPacks(listener);
            service = createService(undefined, {
                executeCommand: jest.fn().mockReturnValue(neverResolves),
                registerCommand: jest.fn(),
            });
            service.idxWatcher = { close: jest.fn() };
            service.localRepositoryIdxWatcher = { close: jest.fn() };
            jest.spyOn(service as any, 'transceive').mockImplementation(async (...args: unknown[]) => {
                const method = String(args[0]);
                if (method === 'GetVersion') {
                    return { success: true, version: '1.2.3', apiVersion: '0.0.9' };
                }
                if (method === 'LoadPacks') {
                    return { success: true };
                }
                return { success: false };
            });

            const result = await service.reloadPacks();

            expect(result).toEqual({ success: true });
            expect(listener).toHaveBeenCalledTimes(1);
            expect(service.commandsProvider.executeCommand).not.toHaveBeenCalled();
        });

        it('does not emit a reload event when loading packs fails', async () => {
            const listener = jest.fn();
            eventHub.onDidReloadPacks(listener);
            jest.spyOn(service as any, 'loadPacks').mockResolvedValue({ success: false });

            expect(await service.reloadPacks()).toEqual({ success: false });
            expect(listener).not.toHaveBeenCalled();
        });
    });


    describe('csolution-rpc-client watchPackIdxFile', () => {
        let service: AnyService;

        beforeEach(() => {
            service = createService();

            jest.spyOn(pathUtils, 'getCmsisPackRoot').mockReturnValue('/cmsis-packs');
            jest.spyOn(fs, 'statSync');
            jest.spyOn(fs, 'watch');

            // Avoid real debounce/timers; we only need to observe that it would be invoked.
            service.debouncedLoadPacks = jest.fn();

            (fs.statSync as unknown as jest.Mock).mockReset();
            (fs.watch as unknown as jest.Mock).mockReset();
        });

        it('loadPacks watches pack.idx and local_repository.pidx when watchers are missing', async () => {
            const packIdx = path.join('/cmsis-packs', 'pack.idx');
            const localRepositoryPidx = path.join('/cmsis-packs', '.Local', 'local_repository.pidx');

            (fs.statSync as unknown as jest.Mock).mockReturnValue({ mtimeMs: 1 });
            (fs.watch as unknown as jest.Mock).mockImplementation((_file: string, _listener: any) => ({ close: jest.fn() }));
            jest.spyOn(service as any, 'transceive').mockImplementation(async (...args: unknown[]) => {
                const method = String(args[0]);
                if (method === 'GetVersion') {
                    return { success: true, version: '1.2.3', apiVersion: '0.0.9' };
                }
                if (method === 'LoadPacks') {
                    return { success: true };
                }
                return { success: false };
            });

            await service.loadPacks();

            expect(pathUtils.getCmsisPackRoot).toHaveBeenCalledTimes(2);
            expect(fs.statSync).toHaveBeenCalledWith(packIdx);
            expect(fs.statSync).toHaveBeenCalledWith(localRepositoryPidx);
            expect(fs.watch).toHaveBeenCalledTimes(2);
            expect((fs.watch as unknown as jest.Mock).mock.calls[0][0]).toBe(packIdx);
            expect((fs.watch as unknown as jest.Mock).mock.calls[1][0]).toBe(localRepositoryPidx);
            expect(service.idxWatcher).toBeDefined();
            expect(service.localRepositoryIdxWatcher).toBeDefined();
        });

        it('watches both indexes under the RPC environment pack root', () => {
            const environmentManager = {
                augmentEnv: jest.fn().mockReturnValue(new Environment({ CMSIS_PACK_ROOT: '/configured/packs' })),
            } as unknown as EnvironmentManager;
            service = createService(environmentManager);
            jest.mocked(pathUtils.getCmsisPackRoot).mockImplementation(environment => environment?.CMSIS_PACK_ROOT ?? '/process/packs');
            (fs.statSync as unknown as jest.Mock).mockReturnValue({ mtimeMs: 1 });
            (fs.watch as unknown as jest.Mock).mockReturnValue({ close: jest.fn() });

            service.watchPackIdxFile();
            service.watchLocalRepositoryPidxFile();

            expect(fs.watch).toHaveBeenNthCalledWith(1, path.join('/configured/packs', 'pack.idx'), expect.any(Function));
            expect(fs.watch).toHaveBeenNthCalledWith(2, path.join('/configured/packs', '.Local', 'local_repository.pidx'), expect.any(Function));
            expect(environmentManager.augmentEnv).toHaveBeenCalledTimes(2);
        });

        it('watches <packRoot>/pack.idx and reads initial mtime', () => {
            const packIdx = path.join('/cmsis-packs', 'pack.idx');

            (fs.statSync as unknown as jest.Mock).mockReturnValue({ mtimeMs: 1 });

            const close = jest.fn();
            (fs.watch as unknown as jest.Mock).mockImplementation((_file: string, _listener: any) => ({ close }));

            service.watchPackIdxFile();

            expect(pathUtils.getCmsisPackRoot).toHaveBeenCalledTimes(1);
            expect(fs.statSync).toHaveBeenCalledTimes(1);
            expect(fs.statSync).toHaveBeenCalledWith(packIdx);

            expect(fs.watch).toHaveBeenCalledTimes(1);
            expect((fs.watch as unknown as jest.Mock).mock.calls[0][0]).toBe(packIdx);
            expect(typeof (fs.watch as unknown as jest.Mock).mock.calls[0][1]).toBe('function');

            expect(service.idxWatcher).toBeDefined();
            expect(service.idxWatcher.close).toBe(close);
        });

        it('watches <packRoot>/.Local/local_repository.pidx and reads initial mtime', () => {
            const localRepositoryPidx = path.join('/cmsis-packs', '.Local', 'local_repository.pidx');

            (fs.statSync as unknown as jest.Mock).mockReturnValue({ mtimeMs: 1 });

            const close = jest.fn();
            (fs.watch as unknown as jest.Mock).mockImplementation((_file: string, _listener: any) => ({ close }));

            service.watchLocalRepositoryPidxFile();

            expect(pathUtils.getCmsisPackRoot).toHaveBeenCalledTimes(1);
            expect(fs.statSync).toHaveBeenCalledTimes(1);
            expect(fs.statSync).toHaveBeenCalledWith(localRepositoryPidx);

            expect(fs.watch).toHaveBeenCalledTimes(1);
            expect((fs.watch as unknown as jest.Mock).mock.calls[0][0]).toBe(localRepositoryPidx);
            expect(typeof (fs.watch as unknown as jest.Mock).mock.calls[0][1]).toBe('function');

            expect(service.localRepositoryIdxWatcher).toBeDefined();
            expect(service.localRepositoryIdxWatcher.close).toBe(close);
        });

        it('calls debouncedLoadPacks when pack.idx mtime changes on change event', () => {
            const packIdx = path.join('/cmsis-packs', 'pack.idx');

            let watcherCallback: ((eventType: string) => void) | undefined;

            (fs.statSync as unknown as jest.Mock)
                .mockReturnValueOnce({ mtimeMs: 10 }) // initial
                .mockReturnValueOnce({ mtimeMs: 11 }); // after change

            (fs.watch as unknown as jest.Mock).mockImplementation((_file: string, listener: any) => {
                watcherCallback = listener;
                return { close: jest.fn() };
            });

            service.watchPackIdxFile();

            expect(watcherCallback).toBeDefined();
            watcherCallback!('change');

            expect(fs.statSync).toHaveBeenCalledTimes(2);
            expect(fs.statSync).toHaveBeenLastCalledWith(packIdx);
            expect(service.debouncedLoadPacks).toHaveBeenCalledTimes(1);
        });

        it('calls debouncedLoadPacks when local_repository.pidx mtime changes on change event', () => {
            const localRepositoryPidx = path.join('/cmsis-packs', '.Local', 'local_repository.pidx');

            let watcherCallback: ((eventType: string) => void) | undefined;

            (fs.statSync as unknown as jest.Mock)
                .mockReturnValueOnce({ mtimeMs: 10 }) // initial
                .mockReturnValueOnce({ mtimeMs: 11 }); // after change

            (fs.watch as unknown as jest.Mock).mockImplementation((_file: string, listener: any) => {
                watcherCallback = listener;
                return { close: jest.fn() };
            });

            service.watchLocalRepositoryPidxFile();

            expect(watcherCallback).toBeDefined();
            watcherCallback!('change');

            expect(fs.statSync).toHaveBeenCalledTimes(2);
            expect(fs.statSync).toHaveBeenLastCalledWith(localRepositoryPidx);
            expect(service.debouncedLoadPacks).toHaveBeenCalledTimes(1);
        });

        it('does not call debouncedLoadPacks when pack.idx mtime does not change on change event', () => {
            let watcherCallback: ((eventType: string) => void) | undefined;

            (fs.statSync as unknown as jest.Mock)
                .mockReturnValueOnce({ mtimeMs: 20 }) // initial
                .mockReturnValueOnce({ mtimeMs: 20 }); // unchanged

            (fs.watch as unknown as jest.Mock).mockImplementation((_file: string, listener: any) => {
                watcherCallback = listener;
                return { close: jest.fn() };
            });

            service.watchPackIdxFile();

            watcherCallback!('change');

            expect(fs.statSync).toHaveBeenCalledTimes(2);
            expect(service.debouncedLoadPacks).not.toHaveBeenCalled();
        });

        it('does not call debouncedLoadPacks when local_repository.pidx mtime does not change on change event', () => {
            let watcherCallback: ((eventType: string) => void) | undefined;

            (fs.statSync as unknown as jest.Mock)
                .mockReturnValueOnce({ mtimeMs: 20 }) // initial
                .mockReturnValueOnce({ mtimeMs: 20 }); // unchanged

            (fs.watch as unknown as jest.Mock).mockImplementation((_file: string, listener: any) => {
                watcherCallback = listener;
                return { close: jest.fn() };
            });

            service.watchLocalRepositoryPidxFile();

            watcherCallback!('change');

            expect(fs.statSync).toHaveBeenCalledTimes(2);
            expect(service.debouncedLoadPacks).not.toHaveBeenCalled();
        });

        it('ignores non-change events (does not stat or reload)', () => {
            let watcherCallback: ((eventType: string) => void) | undefined;

            (fs.statSync as unknown as jest.Mock).mockReturnValue({ mtimeMs: 30 });

            (fs.watch as unknown as jest.Mock).mockImplementation((_file: string, listener: any) => {
                watcherCallback = listener;
                return { close: jest.fn() };
            });

            service.watchPackIdxFile();

            watcherCallback!('rename');

            expect(fs.statSync).toHaveBeenCalledTimes(1); // only initial
            expect(service.debouncedLoadPacks).not.toHaveBeenCalled();
        });

        it('ignores non-change events for local_repository.pidx (does not stat or reload)', () => {
            let watcherCallback: ((eventType: string) => void) | undefined;

            (fs.statSync as unknown as jest.Mock).mockReturnValue({ mtimeMs: 30 });

            (fs.watch as unknown as jest.Mock).mockImplementation((_file: string, listener: any) => {
                watcherCallback = listener;
                return { close: jest.fn() };
            });

            service.watchLocalRepositoryPidxFile();

            watcherCallback!('rename');

            expect(fs.statSync).toHaveBeenCalledTimes(1); // only initial
            expect(service.debouncedLoadPacks).not.toHaveBeenCalled();
        });

        it('closes existing watcher before creating a new one', () => {
            const prevClose = jest.fn();
            service.idxWatcher = { close: prevClose };

            (fs.statSync as unknown as jest.Mock).mockReturnValue({ mtimeMs: 1 });
            (fs.watch as unknown as jest.Mock).mockImplementation((_file: string, _listener: any) => ({ close: jest.fn() }));

            service.watchPackIdxFile();

            expect(prevClose).toHaveBeenCalledTimes(1);
            expect(fs.watch).toHaveBeenCalledTimes(1);
            expect(service.idxWatcher).toBeDefined();
            expect(service.idxWatcher.close).not.toBe(prevClose);
        });

        it('closes existing local repository watcher before creating a new one', () => {
            const prevClose = jest.fn();
            service.localRepositoryIdxWatcher = { close: prevClose };

            (fs.statSync as unknown as jest.Mock).mockReturnValue({ mtimeMs: 1 });
            (fs.watch as unknown as jest.Mock).mockImplementation((_file: string, _listener: any) => ({ close: jest.fn() }));

            service.watchLocalRepositoryPidxFile();

            expect(prevClose).toHaveBeenCalledTimes(1);
            expect(fs.watch).toHaveBeenCalledTimes(1);
            expect(service.localRepositoryIdxWatcher).toBeDefined();
            expect(service.localRepositoryIdxWatcher.close).not.toBe(prevClose);
        });

        it('suppresses pack.idx-triggered reload while suspended and runs once after resume', () => {
            let watcherCallback: ((eventType: string) => void) | undefined;

            (fs.statSync as unknown as jest.Mock)
                .mockReturnValueOnce({ mtimeMs: 40 }) // initial
                .mockReturnValueOnce({ mtimeMs: 41 }); // changed

            (fs.watch as unknown as jest.Mock).mockImplementation((_file: string, listener: any) => {
                watcherCallback = listener;
                return { close: jest.fn() };
            });

            service.watchPackIdxFile();
            service.suspendPackIdxWatcher();

            watcherCallback!('change');
            expect(service.debouncedLoadPacks).not.toHaveBeenCalled();

            service.resumePackIdxWatcher();
            expect(service.debouncedLoadPacks).toHaveBeenCalledTimes(1);
        });

        it('suppresses local_repository.pidx-triggered reload while suspended and runs once after resume', () => {
            let watcherCallback: ((eventType: string) => void) | undefined;

            (fs.statSync as unknown as jest.Mock)
                .mockReturnValueOnce({ mtimeMs: 40 }) // initial
                .mockReturnValueOnce({ mtimeMs: 41 }); // changed

            (fs.watch as unknown as jest.Mock).mockImplementation((_file: string, listener: any) => {
                watcherCallback = listener;
                return { close: jest.fn() };
            });

            service.watchLocalRepositoryPidxFile();
            service.suspendPackIdxWatcher();

            watcherCallback!('change');
            expect(service.debouncedLoadPacks).not.toHaveBeenCalled();

            service.resumePackIdxWatcher();
            expect(service.debouncedLoadPacks).toHaveBeenCalledTimes(1);
        });

        it('can resume without running pending reload when skipPendingReload is true', () => {
            let watcherCallback: ((eventType: string) => void) | undefined;

            (fs.statSync as unknown as jest.Mock)
                .mockReturnValueOnce({ mtimeMs: 50 }) // initial
                .mockReturnValueOnce({ mtimeMs: 51 }); // changed

            (fs.watch as unknown as jest.Mock).mockImplementation((_file: string, listener: any) => {
                watcherCallback = listener;
                return { close: jest.fn() };
            });

            service.watchPackIdxFile();
            service.suspendPackIdxWatcher();

            watcherCallback!('change');
            expect(service.debouncedLoadPacks).not.toHaveBeenCalled();

            service.resumePackIdxWatcher(true);
            expect(service.debouncedLoadPacks).not.toHaveBeenCalled();
        });

        it('triggers pending reload when resuming with depth already zero', () => {
            service.pendingPackIdxChange = true;
            service.packIdxWatcherSuspendDepth = 0;

            service.resumePackIdxWatcher();

            expect(service.debouncedLoadPacks).toHaveBeenCalledTimes(1);
            expect(service.pendingPackIdxChange).toBe(false);
            expect(service.packIdxWatcherSuspendDepth).toBe(0);
        });

        it('is a no-op when resuming with depth zero and no pending change', () => {
            service.pendingPackIdxChange = false;
            service.packIdxWatcherSuspendDepth = 0;

            service.resumePackIdxWatcher();

            expect(service.debouncedLoadPacks).not.toHaveBeenCalled();
            expect(service.pendingPackIdxChange).toBe(false);
            expect(service.packIdxWatcherSuspendDepth).toBe(0);
        });

        it('gracefully handles missing pack.idx file', () => {
            const packIdx = path.join('/cmsis-packs', 'pack.idx');
            const error = new Error('ENOENT: no such file or directory');
            (error as any).code = 'ENOENT';

            (fs.statSync as unknown as jest.Mock).mockImplementation(() => {
                throw error;
            });
            (fs.watch as unknown as jest.Mock).mockImplementation((_file: string, _listener: any) => ({ close: jest.fn() }));

            // Should not throw
            expect(() => service.watchPackIdxFile()).not.toThrow();

            // Should still attempt to get pack root and call statSync
            expect(pathUtils.getCmsisPackRoot).toHaveBeenCalledTimes(1);
            expect(fs.statSync).toHaveBeenCalledWith(packIdx);

            // fs.watch should not be set up since statSync failed
            expect(fs.watch).not.toHaveBeenCalled();
            expect(service.idxWatcher).toBeUndefined();
            expect(console.warn).not.toHaveBeenCalled();
        });

        it('gracefully handles missing local_repository.pidx file', () => {
            const localRepositoryPidx = path.join('/cmsis-packs', '.Local', 'local_repository.pidx');
            const error = new Error('ENOENT: no such file or directory');
            (error as any).code = 'ENOENT';

            (fs.statSync as unknown as jest.Mock).mockImplementation(() => {
                throw error;
            });
            (fs.watch as unknown as jest.Mock).mockImplementation((_file: string, _listener: any) => ({ close: jest.fn() }));

            // Should not throw
            expect(() => service.watchLocalRepositoryPidxFile()).not.toThrow();

            // Should still attempt to get pack root and call statSync
            expect(pathUtils.getCmsisPackRoot).toHaveBeenCalledTimes(1);
            expect(fs.statSync).toHaveBeenCalledWith(localRepositoryPidx);

            // fs.watch should not be set up since statSync failed
            expect(fs.watch).not.toHaveBeenCalled();
            expect(service.localRepositoryIdxWatcher).toBeUndefined();
            expect(console.warn).not.toHaveBeenCalled();
        });

        it('logs non-ENOENT errors and leaves watcher undefined', () => {
            const permError = new Error('EACCES: permission denied');
            (permError as any).code = 'EACCES';

            (fs.statSync as unknown as jest.Mock).mockImplementation(() => {
                throw permError;
            });
            (fs.watch as unknown as jest.Mock).mockImplementation((_file: string, _listener: any) => ({ close: jest.fn() }));

            // Should not throw
            expect(() => service.watchPackIdxFile()).not.toThrow();

            // Should log the error
            expect(console.warn).toHaveBeenCalledWith('Failed to watch pack.idx file:', permError);

            // fs.watch should not be set up
            expect(fs.watch).not.toHaveBeenCalled();
            expect(service.idxWatcher).toBeUndefined();
        });

        it('logs non-ENOENT errors for local_repository.pidx and leaves watcher undefined', () => {
            const permError = new Error('EACCES: permission denied');
            (permError as any).code = 'EACCES';

            (fs.statSync as unknown as jest.Mock).mockImplementation(() => {
                throw permError;
            });
            (fs.watch as unknown as jest.Mock).mockImplementation((_file: string, _listener: any) => ({ close: jest.fn() }));

            // Should not throw
            expect(() => service.watchLocalRepositoryPidxFile()).not.toThrow();

            // Should log the error
            expect(console.warn).toHaveBeenCalledWith('Failed to watch local_repository.pidx file:', permError);

            // fs.watch should not be set up
            expect(fs.watch).not.toHaveBeenCalled();
            expect(service.localRepositoryIdxWatcher).toBeUndefined();
        });
    });

    describe('csolution-rpc-client launch', () => {
        const originalEnv = { ...process.env };
        const mockExtensionPath = path.resolve(__dirname, '../../');
        let environmentManager: EnvironmentManager;

        let spawnMock: jest.Mock;
        let existsSyncMock: jest.SpyInstance;
        let statSyncMock: jest.SpyInstance;
        let createMessageConnectionMock: jest.Mock;
        let awaitActivationMock: jest.SpyInstance;

        beforeEach(() => {
            jest.clearAllMocks();

            environmentManager = {
                augmentEnv: jest.fn().mockReturnValue(new Environment({})),
            } as unknown as EnvironmentManager;

            spawnMock = childProcess.spawn as unknown as jest.Mock;
            spawnMock.mockReset();
            spawnMock.mockImplementation(jest.fn() as any);

            existsSyncMock = jest.spyOn(fs, 'existsSync').mockImplementation(jest.fn() as any);
            statSyncMock = jest.spyOn(fs, 'statSync').mockImplementation(jest.fn() as any);

            createMessageConnectionMock = jsonrpc.createMessageConnection as unknown as jest.Mock;
            createMessageConnectionMock.mockReset();
            createMessageConnectionMock.mockImplementation(jest.fn() as any);

            awaitActivationMock = jest.spyOn(VcpkgManager.instance, 'awaitActivation').mockResolvedValue(undefined);

            // Default workspace folder used for cwd in spawn options.
            (vscode.workspace as any).workspaceFolders = [{ uri: { fsPath: '/ws' } }];
        });

        afterEach(() => {
            process.env = { ...originalEnv };
        });

        function binaryNameForPlatform(): string {
            return process.platform === 'win32' ? 'csolution.exe' : 'csolution';
        }

        function makeChild(overrides?: Partial<any>) {
            const stderrOn = jest.fn();
            const on = jest.fn().mockReturnThis();

            return {
                pid: 123,
                stdout: {},
                stdin: {},
                stderr: { on: stderrOn },
                on,
                ...overrides,
            };
        }

        function makeConnection() {
            return {
                listen: jest.fn(),
                onError: jest.fn(),
                dispose: jest.fn(),
                sendRequest: jest.fn(),
            };
        }

        it('spawns csolution from CMSIS Toolbox installation directory when present and wires up the json-rpc connection', async () => {
            environmentManager = {
                augmentEnv: jest.fn().mockReturnValue(new Environment({ CSOLUTION_ARGS: 'a, b' })),
            } as unknown as EnvironmentManager;

            const service = createService(environmentManager);

            const cmsisToolboxBin = path.resolve(mockExtensionPath, 'tools', 'cmsis-toolbox', 'bin');
            const binaryName = binaryNameForPlatform();
            const possiblePath = path.join(cmsisToolboxBin, binaryName);

            existsSyncMock.mockImplementation((p: string) => {
                if (p === cmsisToolboxBin) return true;
                if (p === possiblePath) return true;
                return false;
            });

            statSyncMock.mockImplementation((p: string) => {
                if (p === cmsisToolboxBin) return { isDirectory: () => true };
                if (p === possiblePath) return { isFile: () => true };
                return { isDirectory: () => false, isFile: () => false };
            });

            const child = makeChild();
            spawnMock.mockReturnValue(child);

            const connection = makeConnection();
            createMessageConnectionMock.mockReturnValue(connection);

            await expect((service as any).launch()).resolves.toBe(true);

            const expectedBin = path.resolve(cmsisToolboxBin, binaryName);
            expect(service.getCsolutionBin()).toBe(expectedBin);

            expect(awaitActivationMock).toHaveBeenCalledTimes(1);
            expect(environmentManager.augmentEnv).toHaveBeenCalledTimes(1);

            expect(spawnMock).toHaveBeenCalledTimes(1);
            const spawnCall = spawnMock.mock.calls[0];
            expect(spawnCall[0]).toBe(expectedBin);
            expect(spawnCall[1]).toEqual(['rpc', '--content-length', 'a', 'b']);
            expect(spawnCall[2]).toEqual({
                cwd: '/ws',
                env: expect.objectContaining({ CSOLUTION_ARGS: 'a, b' }),
            });

            expect(createMessageConnectionMock).toHaveBeenCalledTimes(1);
            expect(connection.onError).toHaveBeenCalledTimes(1);
            expect(connection.listen).toHaveBeenCalledTimes(1);

            // child event listeners are registered
            expect(child.on).toHaveBeenCalledWith('exit', expect.any(Function));
            expect(child.on).toHaveBeenCalledWith('error', expect.any(Function));
            expect(child.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
            expect(child.on).toHaveBeenCalledWith('close', expect.any(Function));
            expect(child.stderr.on).toHaveBeenCalledWith('data', expect.any(Function));
        });

        it('uses CMSIS_SOLUTION_TOOLBOX when set (overrides CMSIS Toolbox path)', async () => {
            environmentManager = {
                augmentEnv: jest.fn().mockReturnValue(new Environment({
                    CMSIS_SOLUTION_TOOLBOX: path.join(mockExtensionPath, 'custom'),
                    CSOLUTION_ARGS: 'x'
                })),
            } as unknown as EnvironmentManager;

            const service = createService(environmentManager);

            existsSyncMock.mockReturnValue(true);
            statSyncMock.mockReturnValue({ isDirectory: () => false, isFile: () => true });

            const child = makeChild();
            spawnMock.mockReturnValue(child);

            const connection = makeConnection();
            createMessageConnectionMock.mockReturnValue(connection);

            await expect((service as any).launch()).resolves.toBe(true);

            const expectedBin = path.resolve(path.join(mockExtensionPath, 'custom', 'bin'), binaryNameForPlatform());
            expect(service.getCsolutionBin()).toBe(expectedBin);

            expect(spawnMock).toHaveBeenCalledTimes(1);
            expect(spawnMock.mock.calls[0][0]).toBe(expectedBin);
            expect(spawnMock.mock.calls[0][1]).toEqual(['rpc', '--content-length', 'x']);
        });

        it('waits for activation before using csolution from PATH', async () => {
            environmentManager = {
                augmentEnv: jest.fn().mockReturnValue(new Environment({
                    PATH: '/after-activation',
                    CSOLUTION_ARGS: 'after',
                })),
            } as unknown as EnvironmentManager;

            const service = createService(environmentManager);

            existsSyncMock.mockReturnValue(false);
            statSyncMock.mockReturnValue({ isDirectory: () => false, isFile: () => false });

            const child = makeChild();
            spawnMock.mockReturnValue(child);

            const connection = makeConnection();
            createMessageConnectionMock.mockReturnValue(connection);

            await expect((service as any).launch()).resolves.toBe(true);

            expect(service.getCsolutionBin()).toBe('csolution');
            expect(awaitActivationMock).toHaveBeenCalledTimes(1);
            expect(environmentManager.augmentEnv).toHaveBeenCalledTimes(1);
            expect(awaitActivationMock.mock.invocationCallOrder[0])
                .toBeLessThan((environmentManager.augmentEnv as jest.Mock).mock.invocationCallOrder[0]);
            expect(spawnMock).toHaveBeenCalledTimes(1);
            expect(spawnMock.mock.calls[0][0]).toBe('csolution');
            expect(spawnMock.mock.calls[0][1]).toEqual(['rpc', '--content-length', 'after']);
            expect(spawnMock.mock.calls[0][2].env).toEqual(expect.objectContaining({
                PATH: '/after-activation',
                CSOLUTION_ARGS: 'after',
            }));
        });

        it('does not spawn a new process when one is already running', async () => {
            const service = createService(environmentManager);

            (service as any).child = { pid: 999 };
            (service as any).connection = makeConnection();

            await expect((service as any).launch()).resolves.toBe(true);

            expect(spawnMock).not.toHaveBeenCalled();
            expect(createMessageConnectionMock).not.toHaveBeenCalled();
        });

        it('throws when spawn returns a child without pid/stdout/stdin', async () => {
            const service = createService(environmentManager);
            (service as any).extensionRoot = '/ext';

            existsSyncMock.mockReturnValue(false);
            statSyncMock.mockReturnValue({ isDirectory: () => false, isFile: () => false });

            const badChild = makeChild({ pid: undefined, stdout: undefined, stdin: undefined });
            spawnMock.mockReturnValue(badChild);

            const connection = makeConnection();
            createMessageConnectionMock.mockReturnValue(connection);

            await expect((service as any).launch()).rejects.toThrow('csolution rpc launch failed');
        });

        it('passes cwd from the first workspace folder (falls back to "./" if missing)', async () => {
            const prevWorkspaceFolders = (vscode.workspace as any).workspaceFolders;
            (vscode.workspace as any).workspaceFolders = undefined;

            const service = createService(environmentManager);
            (service as any).extensionRoot = '/ext';

            existsSyncMock.mockReturnValue(false);
            statSyncMock.mockReturnValue({ isDirectory: () => false, isFile: () => false });

            const child = makeChild();
            spawnMock.mockReturnValue(child);

            const connection = makeConnection();
            createMessageConnectionMock.mockReturnValue(connection);

            await expect((service as any).launch()).resolves.toBe(true);

            expect(spawnMock).toHaveBeenCalledTimes(1);
            expect(spawnMock.mock.calls[0][2].cwd).toBe('./');

            (vscode.workspace as any).workspaceFolders = prevWorkspaceFolders;
        });
    });
});
