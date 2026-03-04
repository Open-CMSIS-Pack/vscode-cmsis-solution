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

const packIdPattern = /^(?:([^:@]+)::)?([^@]+)(?:(@(?:>=|\^|~)?)(\d+\.\d+\.\d+(?:-[a-zA-Z0-9+-.]+)?))?$/;

// TODO: extend the /packs/pack-id.ts with dynamic getters for version and versionOperator
interface PackId {
    vendor?: string;
    packName: string;
    versionOperator?: '@' | '@>=' | '@^' | '@~' | '';
    version?: string;
}

/** examples for tests
ARM::CMSIS@5.9.0 # 'CMSIS' Pack with version 5.5.0
MDK-Middleware@>=7.13.0 # latest version 7.13.0 or higher
MDK-Middleware@^7.13.0 # latest version 7.13.0 or higher, but lower than 8.0.0
Keil::TFM # 'TFM' Pack from vendor Keil, latest installed version
AWS # All Software Packs from vendor 'AWS', latest version
Keil::STM* # Software Packs that start with 'STM' from vendor 'Keil'
MDK-Middleware@>=8.0.0-0 # version 8.0.0 or higher including pre-release versions
 */

/**
 * Parses a pack id string into its metadata fields.
 * @param {string} id - The pack id string to be parsed.
 * @returns {PackId | undefined} - An object containing the parsed metadata fields or undefined if parsing fails.
 */
export const parsePackId = (id: string): PackId | undefined => {
    const match = packIdPattern.exec(id);

    if (!match) {
        return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_0, vendor, packName, versionOperatorMatch, version] = match;
    if (version && !/^\d/.test(version)) {
        return undefined;
    }

    return {
        vendor: vendor || undefined,
        packName: packName,
        versionOperator: (versionOperatorMatch as '@' | '@>=' | '@^' | '@~' | undefined) || (version ? '' : undefined),
        version: version || undefined
    };
};

export const isValidPackId = (id: string): boolean => {
    return packIdPattern.test(id);
};

export const buildPackId = (pack: PackId): string => {
    let id = '';
    if (pack.vendor) {
        id += `${pack.vendor}::`;
    }
    id += pack.packName;
    if (pack.version) {
        id += `${pack.versionOperator || '@'}${pack.version}`;
    }
    return id;
};
