/*
 * Copyright (C) 2025-2026 Arm Limited
 */

import { makeFactory } from '../__test__/test-data-factory';
import { CsolutionService } from './csolution-rpc-client';

export const csolutionServiceFactory = makeFactory<
    jest.Mocked<CsolutionService>
>({
    activate: () => jest.fn(),
    getVersion: () => jest.fn(),
    shutdown: () => jest.fn(),
    apply: () => jest.fn().mockImplementation(async (_args: { context: string }) => ({ result: 'success', message: '' })),
    resolve: () => jest.fn(),
    loadPacks: () => jest.fn(),
    loadSolution: () => jest.fn(),
    getPacksInfo: () => jest.fn(),
    getUsedItems: () => jest.fn().mockResolvedValue({ components: [], packs: [] }),
    getContextInfo: () => jest.fn(),
    getComponentsTree: () => jest.fn(),
    selectComponent: () => jest.fn(),
    selectVariant: () => jest.fn(),
    selectBundle: () => jest.fn(),
    validateComponents: () => jest.fn().mockResolvedValue({ result: 'success', validation: [] }),
    getLogMessages: () => jest.fn(),
    getDeviceList: () => jest.fn(),
    getDeviceInfo: () => jest.fn(),
    getBoardList: () => jest.fn(),
    getBoardInfo: () => jest.fn(),
    getDraftProjects: () => jest.fn(),
    convertSolution: () => jest.fn(),
    discoverLayers: () => jest.fn(),
    listMissingPacks: () => jest.fn(),
    getCsolutionBin: () => jest.fn(),
    waitForExit: () => jest.fn(),
    selectPack: () => jest.fn(),
    getVariables: () => jest.fn(),
});
