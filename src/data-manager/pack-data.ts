/**
 * Copyright 2024-2026 Arm Limited
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

import * as semver from 'semver';

export class PackId {
    public readonly key: string;
    public readonly familyKey: string;

    constructor(
        public readonly vendor: string,
        public readonly name: string,
        public readonly version?: string,
    ) {
        this.key = `${this.vendor.toLowerCase()}::${this.name.toLowerCase()}${this.version ? `@${this.version}` : ''}`;
        this.familyKey = `${this.vendor.toLowerCase()}::${this.name.toLowerCase()}`;
    }

    public compare(other: PackId) : number {
        const vendorDiff = this.vendor.toLowerCase().localeCompare(other.vendor.toLowerCase());
        if (vendorDiff !== 0) {
            return vendorDiff;
        }
        const nameDiff = this.name.toLowerCase().localeCompare(other.name.toLowerCase());
        if (nameDiff !== 0) {
            return nameDiff;
        }
        return semver.compare(this.version ?? '', other.version ?? '');
    }

    public equalByName(other: PackId) : boolean {
        return this.vendor.toLowerCase() === other.vendor.toLowerCase() && this.name.toLowerCase() === other.name.toLowerCase();
    }

}
