/**
 * Copyright 2024-2026 Arm Limited
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

export const SOLUTION_SUFFIX = '.csolution.yml';
export const PROJECT_SUFFIX = '.cproject.yml';
export const CBUILD_SUFFIX = '.cbuild.yml';
export const FILE_TAGS = ['file','script','regions'];
export const PROJECT_WEST_SUFFIX = '.cproject-west.yml';

export const BUILD_TYPES = [
    'cmsis-csolution.build',
    'remote-build.build',
];

export const RUN_TYPES = [
    'arm-debugger.flash',
    'virtual-hardware.run',
    'embedded-debug.flash',
    'embedded-debug.daplink-flash',
];

export const DEBUG_TYPES = [
    'arm-debugger',
    'embedded-debug',
];

/**
 * Severity levels for solution operations
 */
export type Severity = 'abort' | 'error' | 'warning' | 'info' | 'success';
