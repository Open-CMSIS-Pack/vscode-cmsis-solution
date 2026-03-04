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

import 'jest';
import { FileChangeHandlers, FileWatcherProvider } from './file-watcher-provider';

export type MockFileWatcherProvider = {
    [key in keyof FileWatcherProvider]: jest.Mock;
} & {
    mockFireEvent: (glob: string, fsPath: string, eventType: 'change' | 'create' | 'delete') => void;
}

export const fileWatcherProviderFactory = (): MockFileWatcherProvider => {
    const watchFiles = jest.fn();
    watchFiles.mockReturnValue({ dispose: jest.fn() });

    return {
        watchFiles,
        mockFireEvent: (glob, fsPath, eventType) => {
            const watcherCalls = watchFiles.mock.calls.filter(([watchedGlob]) => watchedGlob === glob);

            watcherCalls.forEach(call => {
                const handlers = call[1] as FileChangeHandlers;
                const thisValue = call[2];
                const methodName = eventType === 'change' ? 'onChange' : eventType === 'create' ? 'onCreate' : 'onDelete';
                handlers[methodName]?.call(thisValue, fsPath);
            });

            if (watcherCalls.length === 0) {
                throw new Error(`No watchFiles call for glob ${glob} found`);
            }
        },
    };
};
