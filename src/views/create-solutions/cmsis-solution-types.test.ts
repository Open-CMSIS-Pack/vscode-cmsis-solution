/**
 * Copyright 2023-2026 Arm Limited
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

import { DeviceReference, Tz } from '../../core-tools/client/packs_pb';
import { compareBoardId, compareDeviceId, validTrustZone } from './cmsis-solution-types';
import { boardIdFactory } from '../../core-tools/core-tools-service.factories';
import { faker } from '@faker-js/faker';
import { uniqueFake } from '../../__test__/custom-faker';

describe('compareDeviceId', () => {
    it('return true when reference id are identical', () => {
        const device1: DeviceReference.AsObject = { name: 'device1', vendor: 'some-vendor' };
        const device2: DeviceReference.AsObject = { name: 'device1', vendor: 'some-vendor' };

        const result = compareDeviceId(device1)(device2);
        expect(result).toBeTruthy();
    });

    it('return false when reference id are NOT identical', () => {
        const device1: DeviceReference.AsObject = { name: 'device1', vendor: 'some-vendor' };
        const device2: DeviceReference.AsObject = { name: 'device1', vendor: 'some-other-vendor' };

        const result = compareDeviceId(device1)(device2);
        expect(result).toBeFalsy();
    });

    it('return false when reference id are undefined', () => {
        const device1 = undefined;
        const device2: DeviceReference.AsObject = { name: 'device1', vendor: 'some-other-vendor' };

        const result = compareDeviceId(device1)(device2);
        expect(result).toBeFalsy();
    });
});

describe('compareBoardId', () => {
    it('return true when the ids are identical', () => {
        const id1 = boardIdFactory().toObject();
        const id2 = { ...id1 };

        const result = compareBoardId(id1)(id2);
        expect(result).toBe(true);
    });

    it('return false when the ids differ by one field', () => {
        const id = boardIdFactory().toObject();
        const idDifferentByVendor = { ...id, vendor: uniqueFake(faker.word.noun, id.vendor) };
        const idDifferentByName = { ...id, name: uniqueFake(faker.word.noun, id.name) };
        const idDifferentByRevision = { ...id, revision: uniqueFake(faker.word.noun, id.revision) };

        const compare = compareBoardId(id);
        expect(compare(idDifferentByVendor)).toBe(false);
        expect(compare(idDifferentByName)).toBe(false);
        expect(compare(idDifferentByRevision)).toBe(false);
    });
});

describe('validTrustZone', () => {
    it('processor with TZ returns true', () => {
        expect(validTrustZone({ name: '', core: '', tz: Tz.TZ })).toBeTruthy();
    });

    it('processor with unspecified trustzone', () => {
        expect(validTrustZone({ name: '', core: '', tz: Tz.TZ_UNSPECIFIED })).toBeFalsy();
    });

    it('processor with NO_TZ returns false', () => {
        expect(validTrustZone({ name: '', core: '', tz: Tz.TZ_NO })).toBeFalsy();
    });
});
