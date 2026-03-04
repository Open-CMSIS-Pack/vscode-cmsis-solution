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

import { expect, test } from '@jest/globals';
import { ComponentReference as ProtoComponentReference } from '../../core-tools/client/solutions_pb';
import { deserialiseDeviceReference, deserialisePackReference, deserialiseBoardReference, deserialiseCompiler, deserialiseComponentReference, deserialiseBuildContextID, protoComponentReferencesAreEqual } from './solution-deserialisers';

describe('deserialiseDeviceReference', () => {
    test.each([
        ['some-vendor::some-device:some-processor', {
            vendor: 'some-vendor',
            name: 'some-device',
            processor: 'some-processor'
        }],
        ['some-vendor::some-device', {
            vendor: 'some-vendor',
            name: 'some-device',
        }],
        ['some-device:some-processor', {
            name: 'some-device',
            processor: 'some-processor'
        }],
        ['some-device', {
            name: 'some-device',
        }]
    ])('deserialises %s into device reference', (deviceString, expected) => {
        expect(deserialiseDeviceReference(deviceString)).toMatchObject(expected);
    });
});

describe('deserialisePackReference', () => {
    test.each([
        ['Arm::SomePack@1.2.4', {
            vendor: 'Arm',
            name: 'SomePack',
            version: '1.2.4'
        }],
        ['Arm ::  SomePack@>=1.2.4', {
            vendor: 'Arm',
            name: 'SomePack',
            version: '>=1.2.4'
        }],
        ['Arm ::SomePack@>=1.2.4', {
            vendor: 'Arm',
            name: 'SomePack',
            version: '>=1.2.4'
        }],
        ['Arm :: SomePack @1.2.4', {
            vendor: 'Arm',
            name: 'SomePack',
            version: '1.2.4'
        }],
        ['Arm::SomePack@1.2.4-Beta', {
            vendor: 'Arm',
            name: 'SomePack',
            version: '1.2.4-Beta'
        }],
        ['Arm::  SomePack  @1.2.4-beta', {
            vendor: 'Arm',
            name: 'SomePack',
            version: '1.2.4-beta'
        }],
        ['Arm::SomePack@1.2.4-alpha', {
            vendor: 'Arm',
            name: 'SomePack',
            version: '1.2.4-alpha'
        }],
        ['Arm::SomePack', {
            vendor: 'Arm',
            name: 'SomePack',
            version: undefined
        }],
        ['Arm', {
            vendor: 'Arm',
            name: undefined,
            version: undefined
        }],
        ['ARM :: WAT -!+@ @12', {
            vendor: '',
            name: undefined,
            version: undefined
        }]
    ])('deserialises %s into pack reference', (packString, expected) => {
        expect(deserialisePackReference(packString)).toMatchObject(expected);
    });
});

describe('deserialiseBoardReference', () => {
    test.each([
        ['some-vendor::some-board:some-revision', {
            vendor: 'some-vendor',
            name: 'some-board',
            revision: 'some-revision'
        }],
        ['some-vendor::some-board', {
            vendor: 'some-vendor',
            name: 'some-board',
            revision: undefined
        }],
        ['some-board:some-revision', {
            name: 'some-board',
            revision: 'some-revision'
        }],
        ['some-board', {
            name: 'some-board',
        }],
        ['some-vendor  ::   some-board   :  some-revision', {
            vendor: 'some-vendor',
            name: 'some-board',
            revision: 'some-revision'
        }],
    ])('deserialises %s into board reference', (boardString, expected) => {
        expect(deserialiseBoardReference(boardString)).toMatchObject(expected);
    });
});

describe('deserialiseCompiler', () => {
    test.each([
        ['AC6@1', {
            name: 'AC6',
            version: '1'
        }],
        ['GCC', {
            name: 'GCC',
            version: undefined
        }],
        ['', {
            name: '',
            version: undefined
        }]
    ])('deserialises %s into compiler', (compilerString, expected) => {
        expect(deserialiseCompiler(compilerString)).toMatchObject(expected);
    });
});

describe('deserialiseComponentReference', () => {
    test.each([
        ['SomeClass:SomeGroup', {
            className: 'SomeClass',
            group: 'SomeGroup',
            bundleName: '',
            subgroup: '',
            vendor: '',
            version: '',
            variant: '',
        }],
        ['AVendor::SomeClass&TheBundle:SomeGroup:SomeSub&Variant@1.2.3', {
            bundleName: 'TheBundle',
            className: 'SomeClass',
            group: 'SomeGroup',
            subgroup: 'SomeSub',
            vendor: 'AVendor',
            version: '1.2.3',
            variant: 'Variant',

        }],
        ['AVendor::  SomeClass  &TheBundle  :SomeGroup  :SomeSub  &Variant  @1.2.3', {
            bundleName: 'TheBundle',
            className: 'SomeClass',
            group: 'SomeGroup',
            subgroup: 'SomeSub',
            vendor: 'AVendor',
            version: '1.2.3',
            variant: 'Variant',
        }],
        ['AVendor::  SomeClass  &TheBundle  :SomeGroup  :Some/Sub  &Variant  @1.2.3', {
            bundleName: 'TheBundle',
            className: 'SomeClass',
            group: 'SomeGroup',
            subgroup: 'Some/Sub',
            vendor: 'AVendor',
            version: '1.2.3',
            variant: 'Variant',
        }],
        ['Oryx-Embedded::CycloneTCP&CycloneTCP:Drivers (MAC):i.MX6UL (MAC)', {
            bundleName: 'CycloneTCP',
            className: 'CycloneTCP',
            group: 'Drivers (MAC)',
            subgroup: 'i.MX6UL (MAC)',
            vendor: 'Oryx-Embedded',
            version: '',
            variant: '',
        }],
        ['Quotes:I\'m a fan of quote', {
            bundleName: '',
            className: 'Quotes',
            group: 'I\'m a fan of quote',
            subgroup: '',
            vendor: '',
            version: '',
            variant: '',
        }],
    ])('deserialises %s into component reference', (componentString, expected) => {
        expect(deserialiseComponentReference(componentString)).toMatchObject(expected);
    });
});

describe('deserialiseBuildContext', () => {
    test.each([
        ['Foo', {
            targetType: undefined,
            buildType: undefined

        }],
        ['+Foo', {
            targetType: 'Foo',
            buildType: undefined

        }],
        ['.Foo', {
            targetType: undefined,
            buildType: 'Foo'

        }],
        ['.Foo+Bar', {
            targetType: 'Bar',
            buildType: 'Foo'

        }],
        ['+Bar.Foo', {
            targetType: 'Bar',
            buildType: 'Foo'

        }],
    ])('deserialises %s into build context id', (buildContextString, expected) => {
        expect(deserialiseBuildContextID(buildContextString)).toMatchObject(expected);
    });
});

describe('protoComponentReferencesAreEqual', () => {
    const ref1: ProtoComponentReference.AsObject = {
        bundleName: 'bundle1',
        className: 'class1',
        group: 'group1',
        subgroup: 'subgroup1',
        vendor: 'vendor1',
        version: 'version1',
        variant: 'variant1',
    };

    it('returns true if both component references are undefined', () => {
        expect(protoComponentReferencesAreEqual(undefined, undefined)).toBe(true);
    });

    it('returns false if one reference is undefined', () => {
        expect(protoComponentReferencesAreEqual(ref1, undefined)).toBe(false);
    });

    it('returns true if both refs are equal', () => {
        const ref2: ProtoComponentReference.AsObject = {
            bundleName: 'bundle1',
            className: 'class1',
            group: 'group1',
            subgroup: 'subgroup1',
            vendor: 'vendor1',
            version: 'version1',
            variant: 'variant1',
        };

        expect(protoComponentReferencesAreEqual(ref1, ref2)).toBe(true);
    });

    it('returns false if refs are not equal', () => {
        const ref2: ProtoComponentReference.AsObject = {
            bundleName: 'bundle2',
            className: 'class1',
            group: 'group1',
            subgroup: 'subgroup1',
            vendor: 'vendor1',
            version: 'version1',
            variant: 'variant1',
        };

        expect(protoComponentReferencesAreEqual(ref1, ref2)).toBe(false);
    });
});
