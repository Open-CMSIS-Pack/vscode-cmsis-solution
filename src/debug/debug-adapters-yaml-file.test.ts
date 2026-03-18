/**
 * Copyright 2025-2026 Arm Limited
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

import fs from 'node:fs';

import { DebugAdaptersYamlFile, UISectionChildren } from './debug-adapters-yaml-file';

describe('DebugAdaptersYamlFile', () => {
    const fsMock = {
        existsSync: jest.spyOn(fs, 'existsSync'),
        readFileSync: jest.spyOn(fs, 'readFileSync'),
        writeFileSync: jest.spyOn(fs, 'writeFileSync'),
    };

    const simpleDebugAdaptersYaml = `debug-adapters:
      - name: CMSIS-DAP@pyOCD
        alias-name:
          - CMSIS-DAP
          - DAP-Link
        template: CMSIS-DAP-pyOCD.adapter.json
        gdbserver:
        defaults:
          port: 3333
          protocol: swd
          clock: 10000000
        user-interface:
          - section: Debug Interface
            description: Interface configuration for the debug port
            options:
              - name: Protocol
                description: Protocol configuration
                yml-node: protocol
                type: enum
                values:
                  - name: JTAG
                    value: jtag
                    description: Use JTAG protocol for debugging
                  - name: SWD
                    value: swd
                    description: Use SWD protocol for debugging
                default: swd
      - name: "ST-Link@pyOCD"
        alias-name: [ST-LINK]
        template: STLink-pyOCD.adapter.json
        gdbserver:
        defaults:
          port: 3333
          protocol: swd
          clock: 10000000
        user-interface:
          - section: Debug Interface
            description: Interface configuration for the debug port
            options:
              - name: Protocol
                description: Protocol configuration
                yml-node: protocol
                type: enum
                values: [jtag, swd]
                default: swd
    `;

    beforeEach(() => {
        fsMock.existsSync.mockReturnValue(true);
        fsMock.readFileSync.mockReturnValue('');
        fsMock.writeFileSync.mockImplementation();
    });

    afterEach(() => {
        Object.values(fsMock).forEach(m => m.mockReset());
    });

    afterAll(() => {
        Object.values(fsMock).forEach(m => m.mockRestore());
    });


    it('returns undefined for undefined name', async () => {
        const yamlFile = new DebugAdaptersYamlFile();

        fsMock.readFileSync.mockReturnValue(simpleDebugAdaptersYaml);

        await yamlFile.load('debug-adapters.yml');
        const adapter = yamlFile.getAdapterByName();
        expect(adapter).toBeUndefined();
    });

    it('returns undefined for unknown adapter name', async () => {
        const yamlFile = new DebugAdaptersYamlFile();

        fsMock.readFileSync.mockReturnValue(simpleDebugAdaptersYaml);

        await yamlFile.load('debug-adapters.yml');
        const adapter = yamlFile.getAdapterByName('UnknownAdapter');
        expect(adapter).toBeUndefined();
    });


    it('returns adapter by name', async () => {
        const yamlFile = new DebugAdaptersYamlFile();

        fsMock.readFileSync.mockReturnValue(simpleDebugAdaptersYaml);

        await yamlFile.load('debug-adapters.yml');

        const adapter = yamlFile.getAdapterByName('CMSIS-DAP@pyOCD');

        expect(adapter?.name).toBe('CMSIS-DAP@pyOCD');
        expect(adapter?.template).toBe('CMSIS-DAP-pyOCD.adapter.json');
    });

    it('returns adapter by alias-name', async () => {
        const yamlFile = new DebugAdaptersYamlFile();

        fsMock.readFileSync.mockReturnValue(simpleDebugAdaptersYaml);

        await yamlFile.load('debug-adapters.yml');

        const adapter = yamlFile.getAdapterByName('ST-LINK');

        expect(adapter?.name).toBe('ST-Link@pyOCD');
        expect(adapter?.template).toBe('STLink-pyOCD.adapter.json');
    });

    it('returns all adapter names', async () => {
        const yamlFile = new DebugAdaptersYamlFile();

        fsMock.readFileSync.mockReturnValue(simpleDebugAdaptersYaml);

        await yamlFile.load('debug-adapters.yml');

        const adapters = yamlFile.listAdapterNames();

        expect(adapters).toEqual(['CMSIS-DAP@pyOCD', 'ST-Link@pyOCD']);
    });

    it('creates user-interface enum values', async () => {
        const yamlFile = new DebugAdaptersYamlFile();

        fsMock.readFileSync.mockReturnValue(simpleDebugAdaptersYaml);

        await yamlFile.load('debug-adapters.yml');

        const adapter = yamlFile.getAdapterByName('CMSIS-DAP@pyOCD');

        const expectedProtocolOption: UISectionChildren = {
            name: 'Protocol',
            description: 'Protocol configuration',
            'yml-node': 'protocol',
            type: 'enum',
            values: [
                { name: 'JTAG', value: 'jtag', description: 'Use JTAG protocol for debugging' },
                { name: 'SWD', value: 'swd',  description: 'Use SWD protocol for debugging' }
            ],
            default: 'swd'
        };

        expect(adapter).toBeDefined();
        const ui = adapter?.['user-interface'];
        expect(ui).toBeDefined();
        expect(ui?.length).toBe(1);
        const options = ui?.[0].options;
        expect(options).toBeDefined();
        expect(options?.length).toBe(1);
        const protocolOption = options?.find(opt => opt.name === 'Protocol');
        expect(protocolOption).toBeDefined();
        expect(protocolOption).toEqual(expectedProtocolOption);
    });

    it('creates user-interface normalized enum values from short form', async () => {
        const yamlFile = new DebugAdaptersYamlFile();

        fsMock.readFileSync.mockReturnValue(simpleDebugAdaptersYaml);

        await yamlFile.load('debug-adapters.yml');

        const adapter = yamlFile.getAdapterByName('ST-Link@pyOCD');

        const expectedProtocolOption: UISectionChildren = {
            name: 'Protocol',
            description: 'Protocol configuration',
            'yml-node': 'protocol',
            type: 'enum',
            values: [
                { name: 'jtag', value: 'jtag' },
                { name: 'swd', value: 'swd' }
            ],
            default: 'swd'
        };

        expect(adapter).toBeDefined();
        const ui = adapter?.['user-interface'];
        expect(ui).toBeDefined();
        expect(ui?.length).toBe(1);
        const options = ui?.[0].options;
        expect(options).toBeDefined();
        expect(options?.length).toBe(1);
        const protocolOption = options?.find(opt => opt.name === 'Protocol');
        expect(protocolOption).toBeDefined();
        expect(protocolOption).toEqual(expectedProtocolOption);
    });

});
