/**
 * Copyright 2025-2026 Arm Limited
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

import * as fsUtils from '../utils/fs-utils';
import { AdapterJsonFile } from './adapter-json-file';

describe('AdapterJsonFile', () => {
    const filePath = 'path/to/file.json';
    let adapterJsonFile: AdapterJsonFile;

    beforeEach(() => {
        adapterJsonFile = new AdapterJsonFile(filePath);
        jest.spyOn(fsUtils, 'fileExists').mockReturnValue(true);
    });

    it('Returns empty configurations when file is empty', async () => {
        const mockContent = '';
        jest.spyOn(fsUtils, 'readTextFile').mockReturnValue(mockContent);

        await adapterJsonFile.load();

        expect(adapterJsonFile.launch).toEqual({});
        expect(adapterJsonFile.tasks).toEqual([]);
    });

    it('Returns launch configurations', async () => {
        const mockContent = {
            'launch': {
                'singlecore': {
                    'name': '%debugger-name',
                    'type': 'gdbtarget',
                    'request': 'launch',
                    'cwd': '${workspaceFolder}',
                    'program': '%symbol-file-list',
                    'gdb': 'arm-none-eabi-gdb',
                    'preLaunchTask': 'CMSIS Program',
                    'initCommands': ['tbreak main'],
                    'target': {
                        'server': 'pyocd',
                        'port': '%gdbserver-port'
                    },
                    'cmsis': {
                        'cbuildRunFile': '%{cmsis-csolution.getCbuildRunFile}',
                        'target-type': '%target-type',
                        'updateConfiguration': 'auto'
                    }
                },
                'multicore-start': {
                    'name': '%gdbserver-pname %debugger-name',
                    'type': 'gdbtarget',
                    'request': 'launch',
                    'cwd': '${workspaceFolder}',
                    'program': '%symbol-file-list',
                    'gdb': 'arm-none-eabi-gdb',
                    'preLaunchTask': 'CMSIS Load',
                    'initCommands': ['tbreak main'],
                    'target': {
                        'server': 'pyocd',
                        'port': '%gdbserver-port'
                    },
                    'cmsis': {
                        'cbuildRunFile': '%{cmsis-csolution.getCbuildRunFile}',
                        'pname': '%gdbserver-pname',
                        'target-type': '%target-type',
                        'updateConfiguration': 'auto'
                    }
                },
                'multicore-other': {
                    'name': '%gdbserver-pname %debugger-name',
                    'type': 'gdbtarget',
                    'request': 'attach',
                    'cwd': '${workspaceFolder}',
                    'program': '%symbol-file-list',
                    'gdb': 'arm-none-eabi-gdb',
                    'initCommands': [],
                    'target': {
                        'server': 'pyocd',
                        'port': '%gdbserver-port'
                    },
                    'cmsis': {
                        'pname': '%gdbserver-pname',
                        'target-type': '%target-type',
                        'updateConfiguration': 'auto'
                    }
                }
            },
        };


        jest.spyOn(fsUtils, 'readTextFile').mockReturnValue(JSON.stringify(mockContent, null, 4));
        jest.spyOn(fsUtils, 'writeTextFile').mockImplementation(() => {});

        await adapterJsonFile.load();
        const input = adapterJsonFile.text;
        adapterJsonFile.save();
        const output = adapterJsonFile.text;
        expect(output).toEqual(input);
        expect(adapterJsonFile.launch).toEqual(mockContent.launch);
    });

    it('Returns task configurations', async () => {
        const mockContent = {
            tasks: [
                {
                    'label': 'CMSIS Load+Run',
                    'type': 'shell',
                    'command': [
                        'pyocd load --no-reset --cbuild-run ${command:cmsis-csolution.getCbuildRunFile}',
                        'pyocd gdbserver --reset-run --cbuild-run ${command:cmsis-csolution.getCbuildRunFile}',
                    ],
                    'problemMatcher': [],
                },
                {
                    'label': 'CMSIS Run',
                    'type': 'shell',
                    'command': [
                        'pyocd gdbserver --reset-run --cbuild-run ${command:cmsis-csolution.getCbuildRunFile}',
                    ],
                    'problemMatcher': [],
                },
                {
                    'label': 'CMSIS Load',
                    'type': 'shell',
                    'command': [
                        'pyocd load --cbuild-run ${command:cmsis-csolution.getCbuildRunFile}',
                    ],
                    'problemMatcher': [],
                },
                {
                    'label': 'CMSIS Erase',
                    'type': 'shell',
                    'command': [
                        'pyocd erase --chip --cbuild-run ${command:cmsis-csolution.getCbuildRunFile}',
                    ],
                    'problemMatcher': [],
                }
            ],
        };

        jest.spyOn(fsUtils, 'readTextFile').mockReturnValue(JSON.stringify(mockContent));

        await adapterJsonFile.load();

        expect(adapterJsonFile.tasks).toEqual(mockContent.tasks);
    });

});
