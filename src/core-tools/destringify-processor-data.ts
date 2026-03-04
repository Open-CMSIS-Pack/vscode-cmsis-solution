/**
 * Copyright 2022-2026 Arm Limited
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

import { MveMap, Dsp, DspMap, Fpu, FpuMap, Trustzone, TrustzoneMap, Mve, Endian, EndianMap, BranchProtectionMap, BranchProtection } from './client/solutions_pb';

export const destringifyTrustzone = (trustzone: string): TrustzoneMap[keyof TrustzoneMap] => {
    switch (trustzone) {
        case 'secure':
            return Trustzone.TRUSTZONE_SECURE;
        case 'non-secure':
            return Trustzone.TRUSTZONE_NON_SECURE;
        case 'off':
            return Trustzone.TRUSTZONE_OFF;
        default:
            return Trustzone.TRUSTZONE_UNSPECIFIED;
    }
};

export const destringifyFpu = (fpu: string): FpuMap[keyof FpuMap] => {
    switch (fpu) {
        case 'dp':
            return Fpu.FPU_DP;
        case 'sp':
            return Fpu.FPU_SP;
        case 'off':
            return Fpu.FPU_OFF;
        default:
            return Fpu.FPU_UNSPECIFIED;
    }
};

export const destringifyDsp = (dsp: string): DspMap[keyof DspMap] => {
    switch (dsp) {
        case 'on':
            return Dsp.DSP_ON;
        case 'off':
            return Dsp.DSP_OFF;
        default:
            return Dsp.DSP_UNSPECIFIED;
    }
};

export const destringifyMve = (mve: string): MveMap[keyof MveMap] => {
    switch (mve) {
        case 'fp':
            return Mve.MVE_FP;
        case 'int':
            return Mve.MVE_INT;
        case 'off':
            return Mve.MVE_OFF;
        default:
            return Mve.MVE_UNSPECIFIED;
    }
};

export const destringifyEndian = (endian: string): EndianMap[keyof EndianMap] => {
    switch (endian) {
        case 'little':
            return Endian.ENDIAN_LITTLE;
        case 'big':
            return Endian.ENDIAN_BIG;
        default:
            return Endian.ENDIAN_UNSPECIFIED;
    }
};

export const destringifyBranchProtection = (branchProtection: string): BranchProtectionMap[keyof BranchProtectionMap] => {
    switch (branchProtection) {
        case 'bti':
            return BranchProtection.BRANCH_PROTECTION_BTI;
        case 'bti-signret':
            return BranchProtection.BRANCH_PROTECTION_BTI_SIGNRET;
        case 'off':
            return BranchProtection.BRANCH_PROTECTION_OFF;
        default:
            return BranchProtection.BRANCH_PROTECTION_UNSPECIFIED;
    }
};
