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

import 'jest';
import { ProcessManager } from './process-manager';

export type MockProcessManager = {
    spawn: jest.Mock;
    mockOutputLines: (outputLines: string[]) => void;
    mockOutputLinesAndReject: (outputLines: string[], errorMessage: string) => void;
    rejectCode: (code: string) => void;
}

export const processManagerFactory = (): MockProcessManager => {
    const spawn = jest.fn<ReturnType<ProcessManager['spawn']>, Parameters<ProcessManager['spawn']>>(() => Promise.resolve({ code: 0 }));

    return {
        spawn,
        mockOutputLines: (outputLines: string[]) => {
            return spawn.mockImplementation(async (_c, _a, _o, onOutput) => {
                outputLines.forEach(line => onOutput(line));
                return { code: 0 };
            });
        },
        mockOutputLinesAndReject: (outputLines: string[], errorMessage: string) => {
            return spawn.mockImplementation((_c, _a, _o, onOutput) => {
                outputLines.forEach(line => onOutput(line));
                throw { code: -1, error: new Error(errorMessage) };
            });
        },
        rejectCode: (code: string) => {
            return spawn.mockImplementation(async (_c, _a, _o) => {
                const enoent: NodeJS.ErrnoException = new Error(`Error: ${code}`);
                enoent.code = code;
                throw { code: -2, error: enoent };
            });
        },
    };
};
