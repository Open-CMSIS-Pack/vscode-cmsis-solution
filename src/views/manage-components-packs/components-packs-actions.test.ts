/**
 * Copyright 2025-2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */


import fs from 'node:fs';

import { ComponentsPacksActions } from './components-packs-actions';

describe('ComponentsPacksActions', () => {
    const tmpDirs: string[] = [];

    afterAll(() => {
        tmpDirs.forEach(dir => {
            try {
                fs.rmSync(dir, { recursive: true, force: true });
            } catch {
                // best effort cleanup
            }
        });
    });

    const createActions = (overrides?: {
        csolutionService?: any;
        solutionManager?: any;
        messageProvider?: any;
    }) => {
        const actions = new ComponentsPacksActions();

        actions.setCsolutionService(overrides?.csolutionService ?? ({} as any));
        actions.setMessageProvider(overrides?.messageProvider ?? ({ showErrorMessage: jest.fn(), showWarningMessage: jest.fn() } as any));

        return actions;
    };

    const createAggregateTestData = (aggregateOverrides?: Record<string, unknown>) => {
        const aggregate: any = {
            id: 'Agg1',
            name: 'Agg1',
            selectedCount: 0,
            options: { layer: 'some/abs/path.clayer.yml' },
            variants: [{ name: 'v', components: [] }],
            activeVariant: 'VariantA',
            ...aggregateOverrides,
        };
        const componentTree: any = {
            success: true,
            classes: [{
                bundles: [{
                    cgroups: [{ aggregates: [aggregate] }],
                    aggregates: []
                }]
            }]
        };
        const row: any = {
            aggregate,
            data: { id: 'cmp' },
            parsed: { variant: 'BundleA', class: 'ClassA' },
        };
        return { aggregate, componentTree, row };
    };

    describe('applyPackSelection (private)', () => {
        it('updates pack metadata before delegating to selectPack', async () => {
            const selectPack = jest.fn().mockResolvedValue({ success: true });
            const actions = createActions({ csolutionService: { selectPack } });
            const pack: any = { pack: 'Vendor::Pack@1.0.0', origin: 'Old', selected: false };

            await (actions as any).applyPackSelection('ctx', pack, { selected: true, origin: 'New', packId: 'Vendor::Pack@1.1.0' });

            expect(pack).toEqual(expect.objectContaining({ selected: true, origin: 'New', pack: 'Vendor::Pack@1.1.0' }));
            expect(selectPack).toHaveBeenCalledWith({ context: 'ctx', pack });
        });
    });

    describe('selectPackage', () => {
        it('marks matching pack selected, sets origin, and calls selectPack', async () => {
            const pack: any = { pack: 'Vendor::Pack', resolvedPack: 'Vendor::Pack', origin: 'Old', selected: false };
            const usedItems: any = { packs: [pack] };

            const csolutionService = {
                getUsedItems: jest.fn().mockResolvedValue(usedItems),
                selectPack: jest.fn().mockResolvedValue({ success: true }),
            };

            const actions = createActions({ csolutionService });
            await actions.selectPackage('ctx', 'NewOrigin', 'Vendor::Pack');

            expect(pack.selected).toBe(true);
            expect(pack.origin).toBe('NewOrigin');
            expect(csolutionService.selectPack).toHaveBeenCalledWith({ context: 'ctx', pack });
        });

        it('unselects a previously selected version before selecting a new one', async () => {
            const pack: any = { pack: 'Vendor::Pack@1.0.0', resolvedPack: 'Vendor::Pack@1.0.0', origin: 'Target', selected: true };
            const usedItems: any = { packs: [pack] };
            const csolutionService = {
                getUsedItems: jest.fn().mockResolvedValue(usedItems),
                selectPack: jest.fn().mockResolvedValue({ success: true }),
            };
            const actions = createActions({ csolutionService });
            const unselectSpy = jest.spyOn(actions, 'unselectPackage').mockResolvedValue(undefined as never);

            await actions.selectPackage('ctx', 'Target', 'Vendor::Pack@1.1.0');

            expect(unselectSpy).toHaveBeenCalledWith('ctx', 'Target', 'Vendor::Pack@1.0.0');
            expect(pack.pack).toBe('Vendor::Pack@1.1.0');
            expect(pack.selected).toBe(true);
            unselectSpy.mockRestore();
        });
    });

    describe('unselectPackage', () => {
        it('unselects packs with matching id+origin (case-insensitive) and calls selectPack', async () => {
            const matching: any = { pack: 'Vendor::Pack', resolvedPack: 'Vendor::Pack', origin: 'Keil', selected: true };
            const nonMatching: any = { pack: 'Other', resolvedPack: 'Other', origin: 'Keil', selected: true };
            const usedItems: any = { packs: [matching, nonMatching] };

            const csolutionService = {
                getUsedItems: jest.fn().mockResolvedValue(usedItems),
                selectPack: jest.fn().mockResolvedValue({ success: true }),
            };

            const actions = createActions({ csolutionService });
            await actions.unselectPackage('ctx', 'kEiL', 'Vendor::Pack');

            expect(matching.selected).toBe(false);
            expect(nonMatching.selected).toBe(true);
            expect(csolutionService.selectPack).toHaveBeenCalledWith({ context: 'ctx', pack: matching });
        });
    });

    describe('changeComponentValue', () => {
        it('clears options.layer when selectedCount is falsy and calls selectComponent with count=0', async () => {
            const { componentTree, row } = createAggregateTestData({ selectedCount: 0 });

            const csolutionService = {
                selectComponent: jest.fn().mockResolvedValue(true),
                validateComponents: jest.fn().mockResolvedValue({ validation: [] }),
                getComponentsTree: jest.fn().mockResolvedValue(componentTree)
            };

            const actions = createActions({ csolutionService });

            await actions.changeComponentValue('ctx', componentTree, row);

            expect(row.aggregate.options.layer).not.toBe('');
            expect(csolutionService.selectComponent).toHaveBeenCalledWith({
                context: 'ctx',
                id: 'Agg1',
                count: 0,
                options: { layer: 'some/abs/path.clayer.yml' }
            });
        });

        it('requests log messages when selectComponent returns a falsy result', async () => {
            const { componentTree, row } = createAggregateTestData({ selectedCount: 1 });
            const csolutionService = {
                selectComponent: jest.fn().mockResolvedValue(undefined),
                validateComponents: jest.fn().mockResolvedValue({ validation: [] }),
                getComponentsTree: jest.fn().mockResolvedValue(componentTree)
            };
            const actions = createActions({ csolutionService });
            const logSpy = jest.spyOn(actions as any, 'handleRpcLogMessages').mockResolvedValue(undefined);

            await actions.changeComponentValue('ctx', componentTree, row);

            expect(logSpy).toHaveBeenCalled();
            logSpy.mockRestore();
        });

    });

    describe('changeComponentVariant', () => {
        it('returns early when the requested variant is already active', async () => {
            const actions = createActions({ csolutionService: { selectVariant: jest.fn(), getComponentsTree: jest.fn(), validateComponents: jest.fn() } });
            const { row } = createAggregateTestData({ activeVariant: 'VariantA' });

            await actions.changeComponentVariant('ctx', row, 'VariantA');

            expect((actions as any).csolutionService.selectVariant).not.toHaveBeenCalled();
        });

        it('selects the variant and refreshes the tree on success', async () => {
            const componentTreeResult = { success: true, classes: [] };
            const validationsResult = { validation: ['warn'] };
            const csolutionService = {
                selectVariant: jest.fn().mockResolvedValue({ success: true }),
                getComponentsTree: jest.fn().mockResolvedValue(componentTreeResult),
                validateComponents: jest.fn().mockResolvedValue(validationsResult),
            };
            const actions = createActions({ csolutionService });
            const { row } = createAggregateTestData({ activeVariant: 'Old' });

            await actions.changeComponentVariant('ctx', row, 'New');

            expect(csolutionService.selectVariant).toHaveBeenCalledWith({ context: 'ctx', id: row.aggregate.id, variant: 'New' });
        });

        it('shows errors when selectVariant throws', async () => {
            const componentTreeResult = { success: true, classes: [] };
            const validationsResult = { validation: [] };
            const selectVariant = jest.fn().mockRejectedValue(new Error('variant fail'));
            const csolutionService = {
                selectVariant,
                getComponentsTree: jest.fn().mockResolvedValue(componentTreeResult),
                validateComponents: jest.fn().mockResolvedValue(validationsResult),
            };
            const messageProvider = { showErrorMessage: jest.fn(), showWarningMessage: jest.fn() };
            const actions = createActions({ csolutionService, messageProvider });
            const { row } = createAggregateTestData({ activeVariant: 'Old' });
            const logSpy = jest.spyOn(actions as any, 'handleRpcLogMessages').mockResolvedValue(undefined);

            await actions.changeComponentVariant('ctx', row, 'New');

            expect(messageProvider.showErrorMessage).toHaveBeenCalledWith('variant fail');
            expect(logSpy).toHaveBeenCalled();
            logSpy.mockRestore();
        });
    });

    describe('changeBundle', () => {
        it('returns true immediately when requesting the same bundle', async () => {
            const actions = createActions({ csolutionService: { selectBundle: jest.fn() } });
            const { row } = createAggregateTestData();

            await expect(actions.changeBundle('ctx', row, 'BundleA')).resolves.toBe(true);
            expect((actions as any).csolutionService.selectBundle).not.toHaveBeenCalled();
        });

        it('selects the bundle and returns the service success flag', async () => {
            const selectBundle = jest.fn().mockResolvedValue({ success: true });
            const actions = createActions({ csolutionService: { selectBundle } });
            const { row } = createAggregateTestData({ activeVariant: 'Old' });

            await expect(actions.changeBundle('ctx', row, 'NewBundle')).resolves.toBe(true);
            expect(selectBundle).toHaveBeenCalledWith({ context: 'ctx', cclass: 'ClassA', bundle: 'NewBundle' });
        });

        it('reports errors when selectBundle rejects', async () => {
            const selectBundle = jest.fn().mockRejectedValue(new Error('bundle fail'));
            const messageProvider = { showErrorMessage: jest.fn(), showWarningMessage: jest.fn() };
            const actions = createActions({ csolutionService: { selectBundle }, messageProvider });
            const { row } = createAggregateTestData({ activeVariant: 'Old' });
            const logSpy = jest.spyOn(actions as any, 'handleRpcLogMessages').mockResolvedValue(undefined);

            await expect(actions.changeBundle('ctx', row, 'NewBundle')).resolves.toBe(false);
            expect(messageProvider.showErrorMessage).toHaveBeenCalledWith('bundle fail');
            expect(logSpy).toHaveBeenCalled();
            logSpy.mockRestore();
        });
    });

    describe('handleRpcLogMessages (private)', () => {
        it('propagates warnings and errors to the message provider', async () => {
            jest.useFakeTimers();
            const messageProvider = { showErrorMessage: jest.fn(), showWarningMessage: jest.fn() };
            const csolutionService = { getLogMessages: jest.fn().mockResolvedValue({ warnings: ['warn'], errors: ['err'] }) };
            const actions = createActions({ csolutionService, messageProvider });

            await (actions as any).handleRpcLogMessages();
            jest.runAllTimers();

            expect(messageProvider.showWarningMessage).toHaveBeenCalledWith('warn');
            expect(messageProvider.showErrorMessage).toHaveBeenCalledWith('err');
            jest.useRealTimers();
        });
    });
});
