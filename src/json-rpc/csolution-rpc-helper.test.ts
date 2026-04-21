/* eslint-disable @typescript-eslint/no-explicit-any */
/*
* Copyright (C) 2025-2026 Arm Limited
*/

import path from 'path';
import fs from 'node:fs';
import * as pathUtils from '../utils/path-utils';
import * as childProcess from 'node:child_process';
import * as jsonrpc from 'vscode-jsonrpc/node';
import * as vscode from 'vscode';
import { CsolutionService } from './csolution-rpc-client';
import { splitBoardId, splitDeviceId, splitPackId } from './csolution-rpc-helper';
import { VcpkgManager } from '../vcpkg/vcpkg-manager';
import { Environment, EnvironmentManager } from '../desktop/env-manager';

jest.mock('node:child_process', () => ({
    ...jest.requireActual('node:child_process'),
    spawn: jest.fn(),
}));

jest.mock('vscode-jsonrpc/node', () => ({
    createMessageConnection: jest.fn(),
    StreamMessageReader: jest.fn(),
    StreamMessageWriter: jest.fn(),
}));

describe('csolution-rpc-client', () => {
    type AnyService = Record<string, any>;

    function createService(envManager?: EnvironmentManager): AnyService {
        // `constructor(...)` wrapper shape is repo-specific; treat as constructible in tests.
        const mockEnvManager = envManager ?? ({
            augmentEnv: jest.fn().mockReturnValue(new Environment({}))
        } as unknown as EnvironmentManager);
        return new (CsolutionService as unknown as new (em: EnvironmentManager) => AnyService)(mockEnvManager);
    }

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => undefined);
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        jest.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('splitPackId', () => {
        it('splits a valid pack ID', () => {
            const result = splitPackId('vendor::name@1.0.0');
            expect(result).toEqual({ vendor: 'vendor', name: 'name', version: '1.0.0' });
        });

        it('splits a valid pack ID without version', () => {
            const result = splitPackId('vendor::name');
            expect(result).toEqual({ vendor: 'vendor', name: 'name', version: undefined });
        });

        it('throws an error for invalid pack ID format', () => {
            expect(() => splitPackId('invalid-pack-id')).toThrow('Invalid pack ID format: invalid-pack-id');
        });
    });

    describe('splitBoardId', () => {
        it('splits a valid full board ID', () => {
            const result = splitBoardId('vendor::name:rev1');
            expect(result).toEqual({ vendor: 'vendor', name: 'name', revision: 'rev1' });
        });

        it('splits a valid board ID without revision', () => {
            const result = splitBoardId('vendor::name');
            expect(result).toEqual({ vendor: 'vendor', name: 'name', revision: undefined });
        });

        it('splits a valid board ID without vendor', () => {
            const result = splitBoardId('name:rev1');
            expect(result).toEqual({ vendor: undefined, name: 'name', revision: 'rev1' });
        });

        it('accepts simple name as board id', () => {
            const result = splitBoardId('name');
            expect(result).toEqual({ vendor: undefined, name: 'name', revision: undefined });
        });
    });

    describe('splitDeviceId', () => {
        it('splits a valid full device ID', () => {
            const result = splitDeviceId('vendor::name:core');
            expect(result).toEqual({ vendor: 'vendor', name: 'name' });
        });

        it('splits a valid device ID without vendor', () => {
            const result = splitDeviceId('name:core');
            expect(result).toEqual({ vendor: undefined, name: 'name' });
        });

        it('accepts simple name as device id', () => {
            const result = splitDeviceId('name');
            expect(result).toEqual({ vendor: undefined, name: 'name' });
        });
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

            await service.getVersion();
            expect(transceiveSpy).toHaveBeenCalledTimes(1);

            // Simulate daemon termination lifecycle.
            service.onTerminate();
            expect(service.cachedVersion).toEqual({ success: false });

            await service.getVersion();
            expect(transceiveSpy).toHaveBeenCalledTimes(2);
        });

        it('primes version cache in loadPacks before LoadPacks RPC', async () => {
            service.idxWatcher = { close: jest.fn() };
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

        it('closes existing watcher before creating a new one', () => {
            const prevClose = jest.fn();
            service.idxWatcher = { close: prevClose };

            (fs.statSync as unknown as jest.Mock).mockReturnValue({ mtimeMs: 1 });
            (fs.watch as unknown as jest.Mock).mockImplementation((_file: string, _listener: any) => ({ close: jest.fn() }));

            service.watchPackIdxFile();

            expect(prevClose).toHaveBeenCalledTimes(1);
            expect(fs.watch).toHaveBeenCalledTimes(1);
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

        it('csolution executable is not found', async () => {
            environmentManager = {
                augmentEnv: jest.fn().mockReturnValue(new Environment({})),
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
            expect(spawnMock).toHaveBeenCalledTimes(1);
            expect(spawnMock.mock.calls[0][0]).toBe('csolution');
            expect(spawnMock.mock.calls[0][1]).toEqual(['rpc', '--content-length']);
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
