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

import * as vscode from 'vscode';
import { ProgressLocation } from 'vscode';
import type { Progress, CancellationToken } from 'vscode';

export type { CancellationToken };

export type WithProgressOptions = { title: string; }
export type WithProgressReporter = Progress<{ message?: string; increment?: number }>;

export type WithProgressProvider = {
    /**
     * Show progress for the given task as a notification. The task receives an optional cancellation token if the user can cancel it.
     */
    withNotificationProgress<R>(options: WithProgressOptions & { cancellable?: false }, task: (reporter: WithProgressReporter) => Thenable<R>): Thenable<R>;
    withNotificationProgress<R>(
        options: WithProgressOptions & { cancellable: true },
        task: (reporter: WithProgressReporter, cancellationToken: CancellationToken) => Thenable<R>
    ): Thenable<R>;
}

export const withProgressProvider: Readonly<WithProgressProvider> = {
    withNotificationProgress: <R>(
        options: WithProgressOptions & { cancellable?: boolean},
        task: (reporter: WithProgressReporter, cancellationToken: CancellationToken) => Thenable<R>
    ): Thenable<R> => vscode.window.withProgress({ ...options, location: ProgressLocation.Notification }, task)
};
