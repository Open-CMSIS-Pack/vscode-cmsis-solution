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

/**
 * This function waits for specified condition to be satisfied within the specified timeout.
 * It errors appropriately if condition is invalid or timeout is exceeded.
 * @param condition is the condition that is being waited for
 * @param failureMessage is the informative message that is outputted when condition isn't satisified
 * @param timeout is the time limit, in milliseconds, to wait for the condition to be satisfied
 */
export const waitForCondition = (condition: () => Promise<boolean>, failureMessage: string | (() => string), timeout: number): Promise<void> => {
    let timedOut = false;

    const tryCondition = async () => {
        let result = false;

        while (!result && !timedOut) {
            try {
                result = await condition();
                await new Promise(resolve => setTimeout(resolve, 5));
            } catch (error) {
                throw new Error(`Error evaluating condition: ${error}`);
            }
        }
    };

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    return Promise.race([
        // If timeout is reached before we get true from the condition, throw.
        new Promise<void>((_resolve, reject) => {
            timeoutId = setTimeout(() => {
                timedOut = true;
                const message: string = typeof failureMessage === 'function' ? failureMessage() : failureMessage;
                const errorMessage = `Timed out waiting for ${message}`;
                console.error(errorMessage);
                reject(new Error(errorMessage));
            }, timeout);
        }),
        // Repeatedly try condition. If true, return. If false, wait and try again.
        new Promise<void>((resolve, reject) => {
            tryCondition().then(resolve, reject);
        })
    ]).finally(() => {
        if (timeoutId)  {
            clearTimeout(timeoutId);
        }
    });
};
