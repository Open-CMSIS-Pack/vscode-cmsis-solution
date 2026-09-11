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

import { LazyPromise } from '@open-cmsis-pack/cmsis-common/lazy';
import type { Device as SolarDevice } from '../solar-search/solar-search-client';
import type { Device as CsolutionDevice } from '../json-rpc/csolution-rpc-client';
import { CsolutionDeviceData, DeviceId, SolarDeviceData } from './device-data';
import { PackId } from './pack-data';

function solarDevice(overrides: Partial<SolarDevice> = {}): SolarDevice {
    return {
        vendorName: 'SolarVendor',
        familyName: 'SolarFamily',
        deviceId: 'solar-device-id',
        deviceName: 'SolarDevice',
        ...overrides,
    };
}

function csolutionDevice(overrides: Partial<CsolutionDevice> = {}): CsolutionDevice {
    return {
        id: 'CsolutionVendor::CsolutionDevice:cm33',
        pack: 'PackVendor::PackName@1.2.3',
        family: 'CsolutionFamily',
        subFamily: 'CsolutionSubFamily',
        description: 'Csolution description',
        ...overrides,
    };
}

describe('DeviceId', () => {

    it('uses vendor and name as the stable key', () => {
        expect(new DeviceId('Vendor', 'Device')).toEqual({
            vendor: 'Vendor',
            name: 'Device',
            key: 'Vendor::Device',
        });
    });

});

describe('SolarDeviceData', () => {

    it('uses summary data without loading details when optional values are already present', async () => {
        const summary = solarDevice({
            vendorName: 'SummaryVendor',
            deviceName: 'SummaryDevice',
            familyName: 'SummaryFamily',
            subfamilyName: 'SummarySubFamily',
            packVendor: 'SummaryPackVendor',
            packName: 'SummaryPackName',
            packVersion: '9.8.7',
            memories: [{ name: 'SRAM', size: 65536 }],
            processors: [{ name: 'CPU0', core: 'Cortex-M55', trustzone: true }],
            description: 'Summary description',
        });
        const loadDetails = jest.fn(() => Promise.resolve(solarDevice({
            packVendor: 'DetailPackVendor',
            packName: 'DetailPackName',
        })));

        const data = new SolarDeviceData(summary, LazyPromise.resolve(loadDetails));

        expect(data.vendor).toBe('SummaryVendor');
        expect(data.name).toBe('SummaryDevice');
        expect(data.family).toBe('SummaryFamily');
        expect(data.subfamily).toBe('SummarySubFamily');
        expect(data.id).toEqual(new DeviceId('SummaryVendor', 'SummaryDevice'));
        await expect(data.pack).resolves.toEqual(new PackId('SummaryPackVendor', 'SummaryPackName', '9.8.7'));
        await expect(data.memories).resolves.toEqual([{ name: 'SRAM', size: 65536 }]);
        await expect(data.processors).resolves.toEqual([{ name: 'CPU0', core: 'Cortex-M55', trustzone: true }]);
        await expect(data.description).resolves.toBe('Summary description');
        expect(loadDetails).not.toHaveBeenCalled();
    });

    it('loads details for optional values missing from summary data', async () => {
        const summary = solarDevice({
            packVendor: undefined,
            packName: undefined,
            packVersion: undefined,
            memories: undefined,
            processors: undefined,
            description: undefined,
        });
        const details = solarDevice({
            packVendor: 'DetailPackVendor',
            packName: 'DetailPackName',
            packVersion: '1.2.3',
            memories: [{ name: 'FLASH', size: 262144 }],
            processors: [{ name: 'CPU1', core: 'Cortex-M33', trustzone: false }],
            description: 'Detail description',
        });
        const loadDetails = jest.fn(() => Promise.resolve(details));

        const data = new SolarDeviceData(summary, LazyPromise.resolve(loadDetails));

        await expect(data.pack).resolves.toEqual(new PackId('DetailPackVendor', 'DetailPackName', '1.2.3'));
        await expect(data.memories).resolves.toEqual([{ name: 'FLASH', size: 262144 }]);
        await expect(data.processors).resolves.toEqual([{ name: 'CPU1', core: 'Cortex-M33', trustzone: false }]);
        await expect(data.description).resolves.toBe('Detail description');
        expect(loadDetails).toHaveBeenCalledTimes(1);
    });

    it('returns empty optional values when neither summary nor details provide them', async () => {
        const summary = solarDevice({
            packVendor: undefined,
            packName: undefined,
            memories: undefined,
            processors: undefined,
            description: undefined,
        });

        const data = new SolarDeviceData(summary, LazyPromise.resolve(() => Promise.resolve(undefined)));

        await expect(data.pack).resolves.toBeUndefined();
        await expect(data.memories).resolves.toEqual([]);
        await expect(data.processors).resolves.toEqual([]);
        await expect(data.description).resolves.toBe('');
    });

    it('uses an empty default details provider when none is supplied', async () => {
        const data = new SolarDeviceData(solarDevice({
            packVendor: undefined,
            packName: undefined,
            memories: undefined,
            processors: undefined,
            description: undefined,
        }));

        await expect(data.pack).resolves.toBeUndefined();
        await expect(data.memories).resolves.toEqual([]);
        await expect(data.processors).resolves.toEqual([]);
        await expect(data.description).resolves.toBe('');
    });

});

describe('CsolutionDeviceData', () => {

    it('parses identifiers and maps details from csolution device info', async () => {
        const summary = csolutionDevice({
            id: 'DeviceVendor::DeviceName:secure',
            pack: 'PackVendor::PackName@4.5.6',
            family: 'DeviceFamily',
            subFamily: 'DeviceSubFamily',
        });
        const details = csolutionDevice({
            description: 'Detailed device description',
            memories: [
                { name: 'IRAM', size: '1024' },
                {},
            ],
            processors: [
                { name: 'MainCore', core: 'Cortex-M33', attributes: { Dtz: 'TZ' } },
                { core: 'CompanionCore', attributes: { Dtz: 'NO_TZ' } },
                { name: 'LegacyCore', core: 'Cortex-M4' },
            ],
        });

        const data = new CsolutionDeviceData(summary, LazyPromise.resolve(() => Promise.resolve(details)));

        expect(data.vendor).toBe('DeviceVendor');
        expect(data.name).toBe('DeviceName');
        expect(data.family).toBe('DeviceFamily');
        expect(data.subfamily).toBe('DeviceSubFamily');
        expect(data.id).toEqual(new DeviceId('DeviceVendor', 'DeviceName'));
        await expect(data.pack).resolves.toEqual(new PackId('PackVendor', 'PackName', '4.5.6'));
        await expect(data.memories).resolves.toEqual([
            { name: 'IRAM', size: 1024 },
            { name: '', size: 0 },
        ]);
        await expect(data.processors).resolves.toEqual([
            { name: 'MainCore', core: 'Cortex-M33', trustzone: true },
            { name: '', core: 'CompanionCore', trustzone: false },
            { name: 'LegacyCore', core: 'Cortex-M4', trustzone: undefined },
        ]);
        await expect(data.description).resolves.toBe('Detailed device description');
    });

    it('uses the pack vendor when a csolution device id omits its vendor', async () => {
        const data = new CsolutionDeviceData(
            csolutionDevice({
                id: 'DeviceName:core0',
                pack: 'FallbackVendor::PackName',
                family: undefined,
                subFamily: undefined,
            }),
            LazyPromise.resolve(() => Promise.resolve(csolutionDevice({
                memories: undefined,
                processors: undefined,
                description: undefined,
            }))),
        );

        expect(data.vendor).toBe('FallbackVendor');
        expect(data.name).toBe('DeviceName');
        expect(data.family).toBe('');
        expect(data.subfamily).toBeUndefined();
        expect(data.id).toEqual(new DeviceId('FallbackVendor', 'DeviceName'));
        await expect(data.pack).resolves.toEqual(new PackId('FallbackVendor', 'PackName'));
        await expect(data.memories).resolves.toEqual([]);
        await expect(data.processors).resolves.toEqual([]);
        await expect(data.description).resolves.toBe('');
    });

    it('marks a csolution device without device or pack vendor as invalid', async () => {
        const data = new CsolutionDeviceData(
            csolutionDevice({
                id: 'DeviceName',
                pack: undefined,
            }),
            LazyPromise.resolve(() => Promise.resolve(csolutionDevice())),
        );

        expect(data.vendor).toBe('<invalid-vendor>');
        expect(data.id).toEqual(new DeviceId('<invalid-vendor>', 'DeviceName'));
        await expect(data.pack).resolves.toBeUndefined();
    });

});
