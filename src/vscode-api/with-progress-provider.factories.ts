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

import { EventEmitter } from 'vscode';
import { CancellationToken, WithProgressProvider, WithProgressReporter } from './with-progress-provider';

export type CancellationTokenSource = {
    token: CancellationToken;
    cancel: () => void;
}

export const cancellationTokenFactory = (): CancellationTokenSource => {
    const cancelEmitter = new EventEmitter<void>();

    const token: CancellationToken = {
        isCancellationRequested: false,
        onCancellationRequested: cancelEmitter.event,
    };

    return {
        token,
        cancel: () => {
            token.isCancellationRequested = true;
            cancelEmitter.fire();
        },
    };
};

export type MockWithProgressProvider = {
    [key in keyof WithProgressProvider]: jest.Mock;
}

export const withProgressProviderFactory = (): MockWithProgressProvider => ({
    withNotificationProgress: jest.fn(
        async <R>(
            _options: unknown,
            task: (reporter: WithProgressReporter, cancellationToken: CancellationToken) => Thenable<R>
        ): Promise<R> => task({ report: jest.fn() }, cancellationTokenFactory().token)
    )
});
