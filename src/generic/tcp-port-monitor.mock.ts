/**
 * Copyright 2025-2026 Arm Limited
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

import { waitUntilUsed, waitUntilFree } from 'tcp-port-used';
import { waitForPromises } from '../__test__/test-waits';

jest.mock('tcp-port-used');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class PromiseMock<T extends (...args: any[]) => Promise<void>> {
    public resolve: () => Promise<unknown> = () => waitForPromises();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public reject: (reason?: any) => Promise<unknown> = () => waitForPromises();

    public readonly mock: jest.MockedFunction<T>;

    constructor(
        mock: T,
    ) {
        this.mock = mock as jest.MockedFunction<T>;
        this.mock.mockImplementation((): ReturnType<T> => this.promise as ReturnType<T>);
    }

    private get promise() {
        return new Promise<void>((resolve, reject) => {
            this.resolve = () => { resolve(); return waitForPromises(); };
            this.reject = (reason) => { reject(reason); return waitForPromises(); };
        });
    }

}

export const mockWaitUntilUsed = new PromiseMock(waitUntilUsed);
export const mockWaitUntilFree = new PromiseMock(waitUntilFree);
