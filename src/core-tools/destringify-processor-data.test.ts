/**
 * Copyright 2022-2026 Arm Limited
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

import { BranchProtection, Dsp, Endian, Fpu, Mve, Trustzone } from './client/solutions_pb';
import { destringifyBranchProtection, destringifyDsp, destringifyEndian, destringifyFpu, destringifyMve, destringifyTrustzone } from './destringify-processor-data';
import { expect, test } from '@jest/globals';

describe('destringifyTrustzone', () => {
    test.each([
        ['secure', Trustzone.TRUSTZONE_SECURE],
        ['non-secure', Trustzone.TRUSTZONE_NON_SECURE],
        ['off', Trustzone.TRUSTZONE_OFF],
        ['', Trustzone.TRUSTZONE_UNSPECIFIED]
    ])('converts %s trustzone setting into enum equivalent', (a, expected) => {
        expect(destringifyTrustzone(a)).toBe(expected);
    });
});

describe('destringifyDsp', () => {
    test.each([
        ['on', Dsp.DSP_ON ],
        ['off', Dsp.DSP_OFF ],
        ['', Dsp.DSP_UNSPECIFIED]
    ])('converts %s dsp setting into enum equivalent', (a, expected) => {
        expect(destringifyDsp(a)).toBe(expected);
    });
});

describe('destringifyFpu', () => {
    test.each([
        ['dp', Fpu.FPU_DP],
        ['sp', Fpu.FPU_SP ],
        ['off', Fpu.FPU_OFF],
        ['', Fpu.FPU_UNSPECIFIED]
    ])('converts %s fpu setting into enum equivalent', (a, expected) => {
        expect(destringifyFpu(a)).toBe(expected);
    });
});

describe('destringifyMve', () => {
    test.each([
        ['fp', Mve.MVE_FP],
        ['int', Mve.MVE_INT],
        ['off', Mve.MVE_OFF],
        ['', Mve.MVE_UNSPECIFIED]
    ])('converts %s mve seting into enum equivalent', (a, expected) => {
        expect(destringifyMve(a)).toBe(expected);
    });
});

describe('destringifyEndian', () => {
    test.each([
        ['little', Endian.ENDIAN_LITTLE],
        ['big', Endian.ENDIAN_BIG],
        ['', Endian.ENDIAN_UNSPECIFIED]
    ])('converts %s endian setting into enum equivalent', (a, expected) => {
        expect(destringifyEndian(a)).toBe(expected);
    });
});

describe('destringifyBranchProtection', () => {
    test.each([
        ['bti', BranchProtection.BRANCH_PROTECTION_BTI],
        ['bti-signret', BranchProtection.BRANCH_PROTECTION_BTI_SIGNRET],
        ['off', BranchProtection.BRANCH_PROTECTION_OFF],
        ['', BranchProtection.BRANCH_PROTECTION_UNSPECIFIED]
    ])('converts %s branch-protection setting into enum equivalent', (a, expected) => {
        expect(destringifyBranchProtection(a)).toBe(expected);
    });
});
