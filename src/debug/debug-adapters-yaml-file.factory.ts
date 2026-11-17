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

import { UISection, UISectionChildren } from './debug-adapters-yaml-file';

/**
 * Search the user-interface declaration for an option with the given yaml node name.
 * @param ui The user-interface declaration from the debug-adapters-yaml-file.
 * @param yamlNode The yaml node name to search for (e.g., "section.option").
 * @returns The found option, or undefined if not found.
 */
export function findUIOptionByYmlNode(ui: UISection[], yamlNode: string): UISectionChildren | undefined {
    /** Searches each descendant using the same YAML path rules as the section bindings. */
    const findOption = (sections: UISection[], path: string[] = [], depth = 0): UISectionChildren | undefined => {
        for (const section of sections) {
            const key = section['yml-node'] ?? (depth > 0 ? section.id : undefined);
            const sectionPath = key ? [...path, key] : path;
            const option = section.options.find(candidate => [...sectionPath, candidate['yml-node']].join('.') === yamlNode);
            const match = option ?? findOption(section.subsections ?? [], sectionPath, depth + 1);
            if (match) {
                return match;
            }
        }
        return undefined;
    };

    return findOption(ui);
}
