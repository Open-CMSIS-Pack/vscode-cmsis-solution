/**
 * Copyright 2023-2026 Arm Limited
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

import { Compiler } from './deserialising/solution-data';
import {
    serialiseBoardId,
    serialiseCompiler,
    serialiseComponentReference,
    serialiseDevice,
    serialiseDeviceReference,
    serialisePackReference,
} from './solution-serialisers';

describe('serialiseDeviceId', () => {
    it('joins vendor an name with ::', () => {
        const output = serialiseDeviceReference({
            name: 'DEVICE_NAME',
            vendor: 'DEVICE_VENDOR',
        });

        expect(output).toBe('DEVICE_VENDOR::DEVICE_NAME');
    });
});

describe('serialiseBoardId', () => {
    it('serializes a board id with vendor, name, and revision', () => {
        const boardId = {
            vendor: 'some-vendor',
            name: 'some-board',
            revision: 'some-revision',
        };

        const serialisedBoardId = serialiseBoardId(boardId);

        expect(serialisedBoardId).toEqual('some-vendor::some-board:some-revision');
    });

    it('serializes a board id with vendor and name', () => {
        const boardId = {
            vendor: 'some-vendor',
            name: 'some-board',
            revision: '',
        };

        const serialisedBoardId = serialiseBoardId(boardId);

        expect(serialisedBoardId).toEqual('some-vendor::some-board');
    });

    it('serializes a board id with name and revision', () => {
        const boardId = {
            vendor: '',
            name: 'some-board',
            revision: 'some-revision',
        };

        const serialisedBoardId = serialiseBoardId(boardId);

        expect(serialisedBoardId).toEqual('some-board:some-revision');
    });

    it('serializes a board id with name', () => {
        const boardId = {
            vendor: '',
            name: 'some-board',
            revision: '',
        };

        const serialisedBoardId = serialiseBoardId(boardId);

        expect(serialisedBoardId).toEqual('some-board');
    });
});

describe('serialiseDevice', () => {
    it('serializes a device with vendor, name, and processor', () => {
        const device = {
            vendor: 'some-vendor',
            name: 'some-device',
            processor: 'some-processor',
        };

        const serialisedBoardId = serialiseDevice(device);

        expect(serialisedBoardId).toEqual('some-vendor::some-device:some-processor');
    });

    it('serializes a device with vendor and name', () => {
        const device = {
            vendor: 'some-vendor',
            name: 'some-device',
            processor: '',
        };

        const serialisedBoardId = serialiseDevice(device);

        expect(serialisedBoardId).toEqual('some-vendor::some-device');
    });

    it('serializes a device with name and revision', () => {
        const device = {
            vendor: '',
            name: 'some-device',
            processor: 'some-processor',
        };

        const serialisedBoardId = serialiseDevice(device);

        expect(serialisedBoardId).toEqual('some-device:some-processor');
    });

    it('serializes a device with name', () => {
        const device = {
            vendor: '',
            name: 'some-device',
            processor: '',
        };

        const serialisedBoardId = serialiseDevice(device);

        expect(serialisedBoardId).toEqual('some-device');
    });

    it('serialises a device with just a processor', () => {
        const device = {
            vendor: '',
            name: '',
            processor: 'some-processor',
        };

        const serialisedDevice = serialiseDevice(device);

        expect(serialisedDevice).toEqual(':some-processor');
    });
});

describe('serialisePackReference', () => {
    it('serialises a reference without a version', () => {
        const output = serialisePackReference({
            vendor: 'PACK_VENDOR',
            name: 'PACK_NAME',
            version: '',
        });

        expect(output).toBe('PACK_VENDOR::PACK_NAME');
    });

    it('serialises a reference with a version', () => {
        const output = serialisePackReference({
            vendor: 'PACK_VENDOR',
            name: 'PACK_NAME',
            version: 'PACK_VERSION',
        });

        expect(output).toBe('PACK_VENDOR::PACK_NAME');
    });
});

describe('serialiseComponentReference', () => {
    it('serialises a minimal reference', () => {
        const output = serialiseComponentReference({
            className: 'CCLASS',
            bundleName: '',
            group: 'GROUP',
            subgroup: '',
            vendor: '',
            variant: '',
            version: '',
        });

        expect(output).toBe('CCLASS:GROUP');
    });

    it('serialises a reference with a subgroup', () => {
        const output = serialiseComponentReference({
            className: 'CCLASS',
            bundleName: '',
            group: 'GROUP',
            subgroup: 'SUB',
            vendor: '',
            variant: '',
            version: '',
        });

        expect(output).toBe('CCLASS:GROUP:SUB');
    });

    it('serialises a complete reference without a variant or bundle', () => {
        const output = serialiseComponentReference({
            className: 'CCLASS',
            bundleName: '',
            group: 'GROUP',
            subgroup: 'SUB',
            vendor: 'VENDOR',
            variant: '',
            version: 'VERSION',
        });

        expect(output).toBe('VENDOR::CCLASS:GROUP:SUB@VERSION');
    });

    it('serialises a complete reference with a variant and bundle', () => {
        const output = serialiseComponentReference({
            className: 'CCLASS',
            bundleName: 'BUNDLE',
            group: 'GROUP',
            subgroup: 'SUB',
            vendor: 'VENDOR',
            variant: 'VARIANT',
            version: 'VERSION',
        });

        expect(output).toBe('VENDOR::CCLASS&BUNDLE:GROUP:SUB&VARIANT@VERSION');
    });
});

describe('serialiseCompiler', () => {
    it('serialises a compiler with no version', () => {
        const input: Compiler = { name: 'GCC', version: '' };
        expect(serialiseCompiler(input)).toBe('GCC');
    });

    it('serialises a compiler with a version', () => {
        const input: Compiler = { name: 'GCC', version: '1.2.3' };
        expect(serialiseCompiler(input)).toBe('GCC@1.2.3');
    });
});
