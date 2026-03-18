/**
 * Copyright 2024-2026 Arm Limited
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

import 'jest';
import { MockProcessManager, processManagerFactory } from '../../vscode-api/runner/process-manager.factories';
import { MockWorkspaceFsProvider, workspaceFsProviderFactory } from '../../vscode-api/workspace-fs-provider.factories';
import { ArmclangDefineGetter } from './armclang-define-getter';
import { URI } from 'vscode-uri';

const ARMCLANG_BINARY = `armclang${process.platform === 'win32' ? '.exe' : '' }`;

const DEFAULT_DEFINE_OUTPUT = [
    '#define _ILP32 1',
    '#define _USE_STATIC_INLINE 1',
    '#define __APCS_32__ 1',
    '#define __ARMCC_VERSION 6210000',
    '#define __ARMCOMPILER_VERSION 6210000',
    '#define __ARMEL__ 1',
    '#define __ARM_32BIT_STATE 1',
    '#define __ARM_ACLE 200',
    '#define __ARM_ARCH 4',
    '#define __ARM_ARCH_4T__ 1',
    '#define __ARM_ARCH_ISA_ARM 1',
    '#define __ARM_ARCH_ISA_THUMB 1',
    '#define __ARM_EABI__ 1',
    '#define __ARM_FP16_ARGS 1',
    '#define __ARM_FP16_FORMAT_IEEE 1',
    '#define __ARM_NO_IMAGINARY_TYPE 1',
    '#define __ARM_PCS 1',
    '#define __ARM_PROMISE __builtin_assume',
    '#define __ARM_SIZEOF_MINIMAL_ENUM 4',
    '#define __ARM_SIZEOF_WCHAR_T 4',
    '#define __ARM_TARGET_COPROC 1',
    '#define __ARM_TARGET_COPROC_V4 1',
];

const DEFAULT_COMPILE_COMMANDS_CONTENT = [
    {
        directory: 'fake/dir',
        command: 'armclang --target=arm-arm-none-eabi -I/fake/include/CMSIS -I/fake/include2/ -mcpu=Cortex-M4 -mfpu=fpv4-sp-d16 -mfloat-abi=hard -mlittle-endian -DCPU_K32L3A60VPJ1A_cm4 -D_RTE_ -DSDK_DEBUGCONSOLE=1  -g -O0   --target=arm-arm-none-eabi -c -std=gnu11 -Wno-macro-redefined -Wno-pragma-pack -Wno-parentheses-equality',
        file: '/fake/dir/main.c'
    },
    {
        directory: 'fake/dir',
        command: 'armclang --target=arm-arm-none-eabi -I/fake/include/CMSIS -I/fake/include2/ -mcpu=Cortex-M4 -mfpu=fpv4-sp-d16 -mfloat-abi=hard -mlittle-endian -DCPU_K32L3A60VPJ1A_cm4 -D_RTE_ -DSDK_DEBUGCONSOLE=1  -g -O0   --target=arm-arm-none-eabi -c -std=gnu11 -Wno-macro-redefined -Wno-pragma-pack -Wno-parentheses-equality',
        file: '/fake/dir/blinky.c'
    },
    {
        directory: 'fake/dir',
        command: 'armclang --target=arm-arm-none-eabi -I/fake/include/CMSIS -I/fake/include2/ -mcpu=Cortex-M4 -mfpu=fpv4-sp-d16 -mfloat-abi=hard -mlittle-endian -DCPU_K32L3A60VPJ1A_cm4 -D_RTE_ -DSDK_DEBUGCONSOLE=1  -g -O0   --target=arm-arm-none-eabi -c -std=gnu11 -Wno-macro-redefined -Wno-pragma-pack -Wno-parentheses-equality',
        file: '/fake/dir/board.c'
    }
];

const DEFAULT_COMPILE_COMMANDS_DUPLICATE_FLAGS = [
    {
        directory: 'fake/dir',
        command: 'armclang --target=arm-arm-none-eabi -I/fake/include/CMSIS -I/fake/include2/ -mcpu=Cortex-M4 -mfpu=fpv4-sp-d16 -mfpu=fpv4-sp-d16 -mfloat-abi=hard -mlittle-endian -DCPU_K32L3A60VPJ1A_cm4 -D_RTE_ -DSDK_DEBUGCONSOLE=1  -g -O0   --target=arm-arm-none-eabi -c -std=gnu11 -Wno-macro-redefined -Wno-pragma-pack -Wno-parentheses-equality',
        file: '/fake/dir/main.c'
    },
    {
        directory: 'fake/dir',
        command: 'armclang --target=arm-arm-none-eabi -I/fake/include/CMSIS -I/fake/include2/ -mcpu=Cortex-M0 -mfpu=fpv4-sp-d16 -mfpu=fpv4-sp-d16 -mfloat-abi=soft -mlittle-endian -DCPU_K32L3A60VPJ1A_cm4 -D_RTE_ -DSDK_DEBUGCONSOLE=1  -g -O0   --target=arm-arm-none-eabi -c -std=gnu11 -Wno-macro-redefined -Wno-pragma-pack -Wno-parentheses-equality',
        file: '/fake/dir/blinky.c'
    },
    {
        directory: 'fake/dir',
        command: 'armclang --target=arm-arm-none-eabi -I/fake/include/CMSIS -I/fake/include2/ -mcpu=Cortex-M23 -mfpu=fpv4-sp-d16 -mfpu=fpv4-sp-d16 -mfloat-abi=hard -mlittle-endian -DCPU_K32L3A60VPJ1A_cm4 -D_RTE_ -DSDK_DEBUGCONSOLE=1  -g -O0   --target=arm-arm-none-eabi -c -std=gnu11 -Wno-macro-redefined -Wno-pragma-pack -Wno-parentheses-equality',
        file: '/fake/dir/board.c'
    }
];

describe('ArmclangDefineGetter', () => {
    let processManager: MockProcessManager;
    let workspaceFsProvider: MockWorkspaceFsProvider;
    let armclangDefineGetter: ArmclangDefineGetter;

    beforeEach(async () => {
        workspaceFsProvider = workspaceFsProviderFactory();
        processManager = processManagerFactory();
        armclangDefineGetter = new ArmclangDefineGetter(processManager, workspaceFsProvider);
        processManager.mockOutputLines(DEFAULT_DEFINE_OUTPUT);
        workspaceFsProvider.readUtf8File.mockResolvedValue(JSON.stringify(DEFAULT_COMPILE_COMMANDS_CONTENT));
    });

    it('provides on success an array of -D format definition flags', async () => {
        const result = await armclangDefineGetter.getClangdDefineFlags(URI.file('/fake/path'));
        expect(result).not.toHaveLength(0);
        expect(result.every(r => r.match(/^-D\w+=?.*$/))).toEqual(true);
        expect(processManager.spawn).toHaveBeenCalledTimes(1);
        expect(processManager.spawn).toHaveBeenCalledWith(ARMCLANG_BINARY, expect.arrayContaining(['-dM', '-E', '-']), expect.objectContaining({ stdio: ['ignore'] }), expect.any(Function));
    });

    it('provides on failure an empty array', async () => {
        processManager.mockOutputLinesAndReject(DEFAULT_DEFINE_OUTPUT, 'pretend armclang crashed');
        const result = await armclangDefineGetter.getClangdDefineFlags(URI.file('/fake/path'));
        expect(result).toBeDefined();
        expect(result).toHaveLength(0);
        expect(processManager.spawn).toHaveBeenCalledTimes(1);
        expect(processManager.spawn).toHaveBeenCalledWith(ARMCLANG_BINARY, expect.arrayContaining(['-dM', '-E', '-']),expect.objectContaining({ stdio: ['ignore'] }), expect.any(Function));
    });

    it('provides __ARMCOMPILER_LIBCXX', async () => {
        const result = await armclangDefineGetter.getClangdDefineFlags(URI.file('/fake/path'));
        expect(result).toContain('-D__ARMCOMPILER_LIBCXX=1');
        expect(result).toHaveLength(DEFAULT_DEFINE_OUTPUT.length + 1);
    });

    it('does not provide __ARMCOMPILER_LIBCXX when -nostdlibinc is specified', async () => {
        workspaceFsProvider.readUtf8File.mockResolvedValue(JSON.stringify(DEFAULT_COMPILE_COMMANDS_CONTENT.map(e => Object.assign({}, e, { command: e.command + ' -nostdlibinc' }))));
        const result = await armclangDefineGetter.getClangdDefineFlags(URI.file('/fake/path'));
        expect(result).not.toContain('-D__ARMCOMPILER_LIBCXX=1');
        expect(result).toHaveLength(DEFAULT_DEFINE_OUTPUT.length);
    });

    it('does not provide __ARMCOMPILER_LIBCXX when -nostdinc++ is specified', async () => {
        workspaceFsProvider.readUtf8File.mockResolvedValue(JSON.stringify(DEFAULT_COMPILE_COMMANDS_CONTENT.map(e => Object.assign({}, e, { command: e.command + ' -nostdinc++' }))));
        const result = await armclangDefineGetter.getClangdDefineFlags(URI.file('/fake/path'));
        expect(result).not.toContain('-D__ARMCOMPILER_LIBCXX=1');
        expect(result).toHaveLength(DEFAULT_DEFINE_OUTPUT.length);
    });

    it('deduplicates compiler flags passed to armclang', async () => {
        workspaceFsProvider.readUtf8File.mockResolvedValue(JSON.stringify(DEFAULT_COMPILE_COMMANDS_DUPLICATE_FLAGS));
        await armclangDefineGetter.getClangdDefineFlags(URI.file('/fake/path'));
        expect(processManager.spawn).toHaveBeenCalledTimes(1);
        expect(processManager.spawn).toHaveBeenCalledWith(ARMCLANG_BINARY, expect.arrayContaining(['-dM', '-E', '-']),expect.objectContaining({ stdio: ['ignore'] }), expect.any(Function));
        const armclangFlags = processManager.spawn.mock.calls[0][1] as string[];
        expect(Array.from(new Set(armclangFlags))).toHaveLength(armclangFlags.length);
        expect(armclangFlags.filter(f => f.includes('mcpu'))).toHaveLength(1);
        expect(armclangFlags.filter(f => f.includes('mfloat-abi'))).toHaveLength(1);
    });

});
