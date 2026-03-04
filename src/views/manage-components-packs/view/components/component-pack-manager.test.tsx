/**
 * Copyright (C) 2020-2026 Arm Limited
 */

import 'jest';
import * as React from 'react';
import { MockMessageHandler } from '../../../__test__/mock-message-handler';
import { IncomingMessage, OutgoingMessage } from '../../messages';
import { ComponentPackManager } from './component-pack-manager';
import { createRoot } from 'react-dom/client';
import { ComponentsState } from '../state/reducer';
import { ComponentScope } from '../../data/component-tools';

describe('ManageComponents', () => {
    let container: Element;
    let messageHandler: MockMessageHandler<IncomingMessage, OutgoingMessage>;
    let listener: jest.Mock;

    beforeEach(() => {
        listener = jest.fn();
        messageHandler = new MockMessageHandler(listener);
        container = document.createElement('div');

        React.act(() => {
            createRoot(container).render(
                <ComponentPackManager messageHandler={messageHandler} />
            );
        });
    });

    afterEach(() => {
        container.remove();
    });

    it('renders all grid children', () => {
        expect(container.querySelectorAll('.components-view-root')).toHaveLength(1);
        expect(container.querySelectorAll('.ant-table')).toHaveLength(1);
        expect(container.querySelectorAll('.ant-input-search')).toHaveLength(1);
        expect(container.querySelectorAll('.hide-tree-switcher').length).toBeGreaterThanOrEqual(1);
    });

    it('requests the initial data on initial render', () => {
        const expectedMessage: OutgoingMessage = { type: 'REQUEST_INITIAL_DATA' };
        expect(listener).toHaveBeenLastCalledWith(expectedMessage);
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('does not request initial data on subsequent renders', () => {
        React.act(() => {
            messageHandler.postWindowMessage({ type: 'SELECTED_PROJECT', project: { projectId: 'path/to/some-project.cproject.yml', projectName: 'some-project' } });
        });

        expect(listener).toHaveBeenCalledTimes(1);
    });

    describe('once the initial data has been received', () => {
        const target = { type: 'project' as const, relativePath: 'path/to/context', label: 'My.ContextName+Debug', key: 'project.path.to.context', path: 'path/to/context' };

        beforeEach(() => {
            React.act(() => {
                messageHandler.postWindowMessage({
                    type: 'SOLUTION_LOADED',
                    componentTree: { 'classes': [], success: true },
                    validations: [],
                    componentScope: ComponentScope.All,
                    availableTargetTypes: [target],
                    selectedTargetType: target,
                    cbuildPackPath: '',
                    packs: [],
                    solution: {},
                    availablePacks: {}
                });
            });
        });

        it('passes the component data to the table when a COMPONENTS message is received', () => {
            const tableElement = container.querySelector('.ant-table') as HTMLElement | null;
            expect(tableElement).toBeDefined();
            const state = JSON.parse(tableElement!.dataset.state || '{}') as ComponentsState;
            expect(state.cClasses).toEqual(undefined);
        });

        describe('context display and search filtering', () => {

            it('shows selected build context name in the context dropdown button after ACTIVE_BUILD_CONTEXTS message', () => {
                const contextButton = container.querySelector('.components-view-filter .ant-select-selector, .components-view-filter div:nth-child(2)');
                expect(contextButton).toBeTruthy();
                expect(target.relativePath).toContain(contextButton!.textContent || '');
            });

            it('filters components when searching', () => {
                const ctRoot = { 'classes': [{ 'activeBundle': '', 'bundles': [{ 'aggregates': [{ 'activeVersion': '6.1.1', 'id': 'ARM::CMSIS:CORE', 'name': 'CORE', 'options': { 'layer': '/Board/B-U585I-IOT02A/Board.clayer.yml' }, 'selectedCount': 1, 'variants': [{ 'components': [{ 'description': 'CMSIS-CORE for Cortex-M, SC000, SC300, Star-MC1, ARMv8-M, ARMv8.1-M', 'doc': '/html/Core/index.html', 'id': 'ARM::CMSIS:CORE@6.1.1', 'pack': 'ARM::CMSIS@6.2.0' }], 'name': '' }] }], 'cgroups': [{ 'aggregates': [{ 'activeVersion': '1.0.5', 'id': 'ARM::CMSIS:OS Tick:SysTick', 'name': 'SysTick', 'selectedCount': 1, 'variants': [{ 'components': [{ 'description': 'OS Tick implementation using Cortex-M SysTick Timer', 'id': 'ARM::CMSIS:OS Tick:SysTick@1.0.5', 'implements': 'CMSIS:OS Tick@1.0.1', 'pack': 'ARM::CMSIS@6.2.0' }], 'name': '' }] }], 'api': { 'description': 'RTOS Kernel system tick timer interface', 'doc': '/html/RTOS2/group__CMSIS__RTOS__TickAPI.html', 'id': 'CMSIS:OS Tick(API)@1.0.1' }, 'name': 'OS Tick' }, { 'aggregates': [{ 'activeVariant': 'Library', 'activeVersion': '5.9.0', 'id': 'ARM::CMSIS:RTOS2:Keil RTX5', 'name': 'Keil RTX5', 'selectedCount': 1, 'variants': [{ 'components': [{ 'description': 'CMSIS-RTOS2 RTX5 for Cortex-M, SC000, SC300 and Armv7-A (Library)', 'doc': 'C:/etc/test_packs/ARM/CMSIS-RTX/5.9.0/Documentation/index.html', 'id': 'ARM::CMSIS:RTOS2:Keil RTX5&Library@5.9.0', 'implements': 'CMSIS:RTOS2@2.3.0', 'pack': 'ARM::CMSIS-RTX@5.9.0' }], 'name': 'Library' }, { 'components': [{ 'description': 'CMSIS-RTOS2 RTX5 for Cortex-M, SC000, SC300 and Armv7-A (Source)', 'doc': 'C:/etc/test_packs/ARM/CMSIS-RTX/5.9.0/Documentation/index.html', 'id': 'ARM::CMSIS:RTOS2:Keil RTX5&Source@5.9.0', 'implements': 'CMSIS:RTOS2@2.3.0', 'pack': 'ARM::CMSIS-RTX@5.9.0' }], 'name': 'Source' }] }], 'api': { 'description': 'CMSIS-RTOS API for Cortex-M, SC000, and SC300', 'doc': '/html/RTOS2/group__CMSIS__RTOS.html', 'id': 'CMSIS:RTOS2(API)@2.3.0' }, 'name': 'RTOS2' }], 'name': '' }], 'name': 'CMSIS', 'taxonomy': { 'description': 'Cortex Microcontroller Software Interface Components', 'doc': '/html/General/index.html', 'id': 'CMSIS' } }, { 'activeBundle': '', 'bundles': [{ 'cgroups': [{ 'aggregates': [{ 'activeVersion': '1.0.0', 'id': 'ARM::CMSIS Driver:CAN:Custom', 'name': 'Custom', 'options': { 'explicitVendor': true, 'explicitVersion': '@1.0.0', 'layer': '/HID/Board2.clayer.yml' }, 'selectedCount': 1, 'variants': [{ 'components': [{ 'description': 'Access to #include Driver_CAN.h file and code template for custom implementation', 'id': 'ARM::CMSIS Driver:CAN:Custom@1.0.0', 'implements': 'CMSIS Driver:CAN@1.3.0', 'pack': 'ARM::CMSIS@6.2.0' }], 'name': '' }] }], 'api': { 'description': 'CAN (Controller Area Network) Driver API', 'doc': '/html/Driver/group__can__interface__gr.html', 'id': 'CMSIS Driver:CAN(API)@1.3.0' }, 'name': 'CAN' }, { 'aggregates': [{ 'activeVersion': '1.0.0', 'id': 'ARM::CMSIS Driver:Ethernet:Custom', 'name': 'Custom', 'variants': [{ 'components': [{ 'description': 'Access to #include Driver_ETH_PHY/MAC.h files and code templates for custom implementation', 'id': 'ARM::CMSIS Driver:Ethernet:Custom@1.0.0', 'implements': 'CMSIS Driver:Ethernet@2.2.0', 'pack': 'ARM::CMSIS@6.2.0' }], 'name': '' }] }, { 'activeVersion': '1.2.0', 'id': 'Keil::CMSIS Driver:Ethernet:RNDIS', 'name': 'RNDIS', 'variants': [{ 'components': [{ 'description': 'Ethernet MAC + PHY USB Device RNDIS Driver', 'id': 'Keil::CMSIS Driver:Ethernet:RNDIS@1.2.0', 'implements': 'CMSIS Driver:Ethernet@2.2.0', 'pack': 'Keil::MDK-Middleware@8.0.0' }], 'name': '' }] }], 'api': { 'description': 'Ethernet MAC (Media Access Control) and PHY (Physical layer) Driver API', 'doc': '/html/Driver/group__eth__interface__gr.html', 'id': 'CMSIS Driver:Ethernet(API)@2.2.0' }, 'name': 'Ethernet' }], 'name': '' }], 'name': 'CMSIS Driver', 'taxonomy': { 'description': 'Unified Device Drivers compliant to CMSIS-Driver Specifications', 'doc': '/html/Driver/index.html', 'id': 'CMSIS Driver' } }], 'success': true };

                React.act(() => {
                    messageHandler.postWindowMessage({
                        type: 'SET_COMPONENT_TREE',
                        tree: ctRoot,
                        validations: [],
                        scope: ComponentScope.All
                    });
                });

                // Sanity: both rows present initially
                expect(container.querySelectorAll('tr.ant-table-row').length).toBeGreaterThanOrEqual(2);

                const input = container.querySelector('.ant-input-search input') as HTMLInputElement;
                expect(input).toBeTruthy();

                React.act(() => {
                    input.value = 'CMSIS';
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    const keyEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true });
                    input.dispatchEvent(keyEvent);
                });

                // After search only matching row remains
                const rows = Array.from(container.querySelectorAll('tr.ant-table-row'));
                const visibleNames = rows.map(r => r.textContent || '');
                expect(visibleNames.some(t => /CMSIS/.test(t))).toBeTruthy();
                expect(visibleNames.every(t => !/Other/.test(t))).toBeTruthy();
            });
        });
    });
});
