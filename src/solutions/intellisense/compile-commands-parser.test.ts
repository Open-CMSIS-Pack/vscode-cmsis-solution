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

import path from 'path';
import { URI } from 'vscode-uri';
import { workspaceFsProviderFactory } from '../../vscode-api/workspace-fs-provider.factories';
import { CompileCommandsParser } from './compile-commands-parser';

const compileCommands = `[
  {
    "directory": "/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/tmp/hello/FRDM-K32L3A6/Debug",
    "command": "/Users/some-user/Library/Application/compilers.arm.armclang/6.20.0/bin/armclang --target=arm-arm-none-eabi -I/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/RTE/Board_Support/K32L3A60VPJ1A_cm4 -I/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/RTE/CMSIS -I/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/RTE/_Debug_FRDM-K32L3A6 -I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/Core/Include -I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/Driver/Include -I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/RTOS2/Include -I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/RTOS2/RTX/Include -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0 -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/components/lists -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/components/serial_manager -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/components/uart -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/drivers -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/utilities/debug_console -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/utilities/str -mcpu=Cortex-M4 -mfpu=fpv4-sp-d16 -mfloat-abi=hard -mlittle-endian -g -O0   --target=arm-arm-none-eabi -c -std=c99 -isystem /Users/some-user/Library/Application/Code/User/globalStorage/ms-vscode.vscode-embedded-tools/vcpkg/root/downloads/artifacts/153f0846/compilers.arm.armclang/6.20.0/include -DCPU_K32L3A60VPJ1A_cm4 -D_RTE_ -DNXP_BOARD -o CMakeFiles/hello.dir/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/RTE/CMSIS/RTX_Config.o -c /Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/RTE/CMSIS/RTX_Config.c",
    "file": "/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/RTE/CMSIS/RTX_Config.c"
  },
  {
    "directory": "/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/tmp/hello/FRDM-K32L3A6/Debug",
    "command": "/Users/some-user/Library/Application/compilers.arm.armclang/6.20.0/bin/armclang --target=arm-arm-none-eabi -I/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/RTE/Board_Support/K32L3A60VPJ1A_cm4 -I/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/RTE/CMSIS -I/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/RTE/_Debug_FRDM-K32L3A6 -I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/Core/Include -I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/Driver/Include -I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/RTOS2/Include -I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/RTOS2/RTX/Include -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0 -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/components/lists -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/components/serial_manager -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/components/uart -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/drivers -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/utilities/debug_console -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/utilities/str -mcpu=Cortex-M4 -mfpu=fpv4-sp-d16 -mfloat-abi=hard -mlittle-endian -g -O0   --target=arm-arm-none-eabi -c -std=c99 -isystem /Users/some-user/Library/Application/Code/User/globalStorage/ms-vscode.vscode-embedded-tools/vcpkg/root/downloads/artifacts/153f0846/compilers.arm.armclang/6.20.0/include -DCPU_K32L3A60VPJ1A_cm4 -D_RTE_ -DNXP_BOARD -o CMakeFiles/hello.dir/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/main.o -c /Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/main.c",
    "file": "${path.resolve(path.parse(process.cwd()).root, 'Users', 'some-user', 'Projects', 'keil-studio-get-started', 'hello', 'main.c').replace(/\\/g, '\\\\')}"
  },
  {
    "directory": "/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/tmp/hello/FRDM-K32L3A6/Debug",
    "command": "/Users/some-user/Library/Application/compilers.arm.armclang/6.20.0/bin/armclang --target=arm-arm-none-eabi -I/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/RTE/Board_Support/K32L3A60VPJ1A_cm4 -I/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/RTE/CMSIS -I/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/RTE/_Debug_FRDM-K32L3A6 -I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/Core/Include -I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/Driver/Include -I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/RTOS2/Include -I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/RTOS2/RTX/Include -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0 -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/components/lists -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/components/serial_manager -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/components/uart -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/drivers -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/utilities/debug_console -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/utilities/str -mcpu=Cortex-M4 -mfpu=fpv4-sp-d16 -mfloat-abi=hard -mlittle-endian -g -O0   --target=arm-arm-none-eabi -c -std=c99 -isystem /Users/some-user/Library/Application/Code/User/globalStorage/ms-vscode.vscode-embedded-tools/vcpkg/root/downloads/artifacts/153f0846/compilers.arm.armclang/6.20.0/include -DCPU_K32L3A60VPJ1A_cm4 -D_RTE_ -DNXP_BOARD -o CMakeFiles/hello.dir/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/retarget_stdio_nxp.o -c /Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/retarget_stdio_nxp.c",
    "file": "/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/retarget_stdio_nxp.c"
  }
]`;

const compileCommand = `[
  {
    "directory": "/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/tmp/hello/FRDM-K32L3A6/Debug",
    "command": "/Users/some-user/Library/Application/compilers.arm.armclang/6.20.0/bin/armclang --target=arm-arm-none-eabi -I/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/RTE/Board_Support/K32L3A60VPJ1A_cm4 -I/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/RTE/CMSIS -I/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/RTE/_Debug_FRDM-K32L3A6 -I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/Core/Include -I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/Driver/Include -I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/RTOS2/Include -I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/RTOS2/RTX/Include -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0 -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/components/lists -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/components/serial_manager -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/components/uart -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/drivers -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/utilities/debug_console -I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/utilities/str -mcpu=Cortex-M4 -mfpu=fpv4-sp-d16 -mfloat-abi=hard -mlittle-endian -g -O0   --target=arm-arm-none-eabi -c -std=c99 -isystem /Users/some-user/Library/Application/Code/User/globalStorage/ms-vscode.vscode-embedded-tools/vcpkg/root/downloads/artifacts/153f0846/compilers.arm.armclang/6.20.0/include -DCPU_K32L3A60VPJ1A_cm4 -D_RTE_ -DNXP_BOARD -o CMakeFiles/hello.dir/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/main.o -c /Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/main.c",
    "file": "${path.resolve(path.parse(process.cwd()).root, 'Users', 'some-user', 'Projects', 'keil-studio-get-started', 'hello', 'main.c').replace(/\\/g, '\\\\')}"
  }
]`;

const compileCommandsEmptyCommand = `[
    {
        "directory": "",
        "command": "",
        "file": "/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/main.c"
    }
]`;

describe('CompileCommandsParser', () => {
    describe('getCommandForFile', () => {
        it('returns the parsed compile commands for the given source file, using the given compile_commands path', async () => {
            const fsProvider = workspaceFsProviderFactory();
            fsProvider.readUtf8File.mockResolvedValue(compileCommands);
            const compileCommandsParser = new CompileCommandsParser(fsProvider);
            const compileCommandsPath = 'some/path/to/compile_commands.json';
            const sourceFilePath = URI.parse(path.join(path.parse(process.cwd()).root, 'Users', 'some-user', 'Projects', 'keil-studio-get-started', 'hello', 'main.c')).fsPath;

            const parsedCompileCommands = await compileCommandsParser.getCommandForFile(compileCommandsPath, sourceFilePath);

            const expected = {
                compilerArgs: [
                    '--target=arm-arm-none-eabi',
                    '-I/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/RTE/Board_Support/K32L3A60VPJ1A_cm4',
                    '-I/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/RTE/CMSIS',
                    '-I/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/RTE/_Debug_FRDM-K32L3A6',
                    '-I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/Core/Include',
                    '-I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/Driver/Include',
                    '-I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/RTOS2/Include',
                    '-I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/RTOS2/RTX/Include',
                    '-I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0',
                    '-I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/components/lists',
                    '-I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/components/serial_manager',
                    '-I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/components/uart',
                    '-I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/drivers',
                    '-I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/utilities/debug_console',
                    '-I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/utilities/str',
                    '-mcpu=Cortex-M4',
                    '-mfpu=fpv4-sp-d16',
                    '-mfloat-abi=hard',
                    '-mlittle-endian',
                    '-g',
                    '-O0',
                    '--target=arm-arm-none-eabi',
                    '-c',
                    '-std=c99',
                    '-isystem',
                    '/Users/some-user/Library/Application/Code/User/globalStorage/ms-vscode.vscode-embedded-tools/vcpkg/root/downloads/artifacts/153f0846/compilers.arm.armclang/6.20.0/include',
                    '-DCPU_K32L3A60VPJ1A_cm4',
                    '-D_RTE_',
                    '-DNXP_BOARD',
                    '-o',
                    'CMakeFiles/hello.dir/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/main.o',
                    '-c',
                    '/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/main.c',
                ],
                compilerPath: '/Users/some-user/Library/Application/compilers.arm.armclang/6.20.0/bin/armclang',
            };
            expect(fsProvider.readUtf8File).toHaveBeenCalledWith(compileCommandsPath);
            expect(parsedCompileCommands).toEqual(expected);
        });

        it('returns .c file parsed compile commands header source files', async () => {
            const fsProvider = workspaceFsProviderFactory();
            fsProvider.readUtf8File.mockResolvedValue(compileCommand);
            const compileCommandsParser = new CompileCommandsParser(fsProvider);
            const compileCommandsPath = 'some/path/to/compile_commands.json';
            const sourceFilePath = URI.parse(path.join(path.parse(process.cwd()).root, 'Users', 'some-user', 'Projects', 'keil-studio-get-started', 'hello', 'main.h')).fsPath;

            const parsedCompileCommands = await compileCommandsParser.getCommandForFile(compileCommandsPath, sourceFilePath);

            const expected = {
                compilerArgs: [
                    '--target=arm-arm-none-eabi',
                    '-I/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/RTE/Board_Support/K32L3A60VPJ1A_cm4',
                    '-I/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/RTE/CMSIS',
                    '-I/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/RTE/_Debug_FRDM-K32L3A6',
                    '-I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/Core/Include',
                    '-I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/Driver/Include',
                    '-I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/RTOS2/Include',
                    '-I/Users/some-user/.cache/arm/packs/ARM/CMSIS/5.9.0/CMSIS/RTOS2/RTX/Include',
                    '-I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0',
                    '-I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/components/lists',
                    '-I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/components/serial_manager',
                    '-I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/components/uart',
                    '-I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/drivers',
                    '-I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/utilities/debug_console',
                    '-I/Users/some-user/.cache/arm/packs/NXP/K32L3A60_DFP/16.0.0/utilities/str',
                    '-mcpu=Cortex-M4',
                    '-mfpu=fpv4-sp-d16',
                    '-mfloat-abi=hard',
                    '-mlittle-endian',
                    '-g',
                    '-O0',
                    '--target=arm-arm-none-eabi',
                    '-c',
                    '-std=c99',
                    '-isystem',
                    '/Users/some-user/Library/Application/Code/User/globalStorage/ms-vscode.vscode-embedded-tools/vcpkg/root/downloads/artifacts/153f0846/compilers.arm.armclang/6.20.0/include',
                    '-DCPU_K32L3A60VPJ1A_cm4',
                    '-D_RTE_',
                    '-DNXP_BOARD',
                    '-o',
                    'CMakeFiles/hello.dir/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/main.o',
                    '-c',
                    '/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/main.c',
                ],
                compilerPath: '/Users/some-user/Library/Application/compilers.arm.armclang/6.20.0/bin/armclang',
            };
            expect(fsProvider.readUtf8File).toHaveBeenCalledWith(compileCommandsPath);
            expect(parsedCompileCommands).toEqual(expected);
        });

        it('returns empty parsed commands when command is an empty string', async () => {
            const fsProvider = workspaceFsProviderFactory();
            fsProvider.readUtf8File.mockResolvedValue(compileCommandsEmptyCommand);
            const compileCommandsParser = new CompileCommandsParser(fsProvider);
            const compileCommandsPath = 'some/path/to/compile_commands.json';
            const sourceFilePath = '/Users/some-user/Projects/vscode-cmsis-csolution/test-workspace/keil-studio-get-started/hello/main.c';

            const parsedCompileCommands = await compileCommandsParser.getCommandForFile(compileCommandsPath, sourceFilePath);

            const expected = {
                compilerArgs: [],
                compilerPath: '',
            };
            expect(parsedCompileCommands).toEqual(expected);
        });

        it('throws and error when the given file cannot be found in the compile_commands.json', async () => {
            const fsProvider = workspaceFsProviderFactory();
            fsProvider.readUtf8File.mockResolvedValue(compileCommands);
            const compileCommandsParser = new CompileCommandsParser(fsProvider);
            const compileCommandsPath = 'some/path/to/compile_commands.json';
            const sourceFilePath = 'some/non-existent/file.c';

            const expectedErrorMessage = `No command found for file "${sourceFilePath}" in "${compileCommandsPath}"`;
            await expect(compileCommandsParser.getCommandForFile(compileCommandsPath, sourceFilePath)).rejects.toThrow(expectedErrorMessage);
        });
    });

    describe('getAllIncludeCommands', () => {
        it('returns only includes', async () => {
            const fsProvider = workspaceFsProviderFactory();
            fsProvider.readUtf8File.mockResolvedValue(compileCommands);
            const compileCommandsParser = new CompileCommandsParser(fsProvider);
            const compileCommandsPath = 'some/path/to/compile_commands.json';

            const includeFlags = await compileCommandsParser.getAllIncludeCommands(compileCommandsPath);

            expect(includeFlags.every(i => i.startsWith('-I'))).toBe(true);     // only includes
            expect(includeFlags).toEqual(Array.from(new Set(includeFlags)));    // no duplicates
        });
    });
});
