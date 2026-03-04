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

import { waitUntilUsed, waitUntilFree } from 'tcp-port-used';
import { constructor } from './constructor';

export interface TCPPortMonitor {
    readonly port: number;
    dispose(): Promise<void>;
}

class TCPPortMonitorImpl implements TCPPortMonitor {
    private state: { dispose(): void } | undefined = undefined;
    private active: boolean = true;
    private awaiter: Promise<void> | undefined = undefined;

    constructor(
        public readonly port: number,
        private readonly onAvailable: () => { dispose(): void },
        private readonly retryTimeMs: number = 500,
    ) {
        this.waitUntilUsed();
    }

    public dispose() {
        this.active = false;
        this.state?.dispose();
        this.state = undefined;
        return this.awaiter ?? Promise.resolve();
    }

    private async waitUntilUsed() {
        if (!this.active) { return; }
        this.awaiter = waitUntilUsed(this.port, this.retryTimeMs, this.retryTimeMs)
            .then(this.available.bind(this))
            .catch(this.waitUntilUsed.bind(this));
    }

    private async waitUntilFree() {
        if (!this.active) { return; }
        this.awaiter = waitUntilFree(this.port, this.retryTimeMs, this.retryTimeMs)
            .then(this.unavailable.bind(this))
            .catch(this.waitUntilFree.bind(this));
    }

    private available() {
        if (this.active) {
            this.state ??= this.onAvailable();
            this.waitUntilFree();
        }
    }

    private unavailable() {
        if (this.active) {
            this.state?.dispose();
            this.state = undefined;
            this.waitUntilUsed();
        }
    }
}

export const TCPPortMonitor = constructor<typeof TCPPortMonitorImpl, TCPPortMonitor>(TCPPortMonitorImpl);
