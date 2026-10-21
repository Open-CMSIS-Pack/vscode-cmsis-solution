/*
 * Copyright (C) 2026 Arm Limited
 */

import { CsolutionService } from './csolution-rpc-client';
import { EnvironmentManager } from '../desktop/env-manager';
import { CommandsProvider } from '../vscode-api/commands-provider';
import { SolutionEventHub } from '../solutions/solution-event-hub';

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
