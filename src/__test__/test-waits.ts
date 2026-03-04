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

import { Event } from 'vscode';


const DEFAULT_TIMEOUT = process.platform === 'win32' ? 20 : 10;
/**
 * Returns a promise that resolves after a timeout. Useful for unit tests.
 * @param timeoutMillis Optional timeout milliseconds
 */
export const waitTimeout = (timeoutMillis = DEFAULT_TIMEOUT): Promise<void> => new Promise(resolve => setTimeout(resolve, timeoutMillis));

/**
 * Returns a promise that resolves when the given event fires.
 * @param event The event to monitor
 * @param predicate Optional predicate to filter matching events
 * @param timeoutMillis Optional timeout milliseconds
 */
export const waitForEvent = <A>(
    event: Event<A>,
    predicate?: (value: A) => boolean,
    timeoutMillis = 50
): Promise<void> => {
    let terminated = false;

    return Promise.race<void>([
        new Promise(resolve => {
            const disposable = event((value: A) => {
                if (!predicate || predicate(value)) {
                    disposable.dispose();
                    terminated = true;
                    resolve();
                }
            });
        }),
        new Promise((_resolve, reject) => {
            setTimeout(() => {
                if (!terminated) {
                    reject(new Error('Timed out waiting for event'));
                }
            }, timeoutMillis);
        })
    ]);
};

export const waitForPromises = () => new Promise(resolve => setTimeout(resolve, 0));
