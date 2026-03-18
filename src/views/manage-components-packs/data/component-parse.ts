/**
 * Copyright 2026 Arm Limited
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

import { INodeComponent } from './component-tools';

const componentIdPattern = /^(?:(?<CVendor>[^:]+)::)?(?<CClass>[^:&]+)(?:&(?<CBundle>[^:]+))?:(?<CGroup>[^:&@]+)(?::(?<CSub>[^:&@]+))?(?:&(?<CVariant>[^:@]+))?(?:@(?<CVersion>(?:>=)?[\dA-Za-z+-.]+))?$/;

/**
 * Parses a component id string into its metadata fields.
 * @param {string} id - The component id string to be parsed.
 * @returns {INodeComponent | undefined} - An object containing the parsed metadata fields or undefined if parsing fails.
 */
export const parseComponentId = (id: string): INodeComponent | undefined => {
    const match = componentIdPattern.exec(id);
    const groups = match?.groups;
    if (groups) {
        const { CVendor, CClass, CBundle, CGroup, CSub, CVariant, CVersion } = groups;
        return {
            vendor: CVendor ?? '',
            class: CClass ?? '',
            bundle: CBundle,
            group: CGroup,
            sub: CSub,
            variant: CVariant,
            version: CVersion,
        };
    }
    return undefined;
};

export const isValidComponentId = (id: string): boolean => {
    return componentIdPattern.test(id);
};

export const buildComponentId = (component: INodeComponent): string => {
    let id = '';
    if (component.vendor) {
        id += `${component.vendor}::`;
    }
    id += component.class;
    if (component.bundle) {
        id += `&${component.bundle}`;
    }
    id += `:${component.group}`;
    if (component.sub) {
        id += `:${component.sub}`;
    }
    if (component.variant) {
        id += `&${component.variant}`;
    }
    if (component.version) {
        id += `@${component.version}`;
    }
    return id;
};
