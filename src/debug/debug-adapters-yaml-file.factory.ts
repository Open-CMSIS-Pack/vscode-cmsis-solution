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

import { UISection } from './debug-adapters-yaml-file';

/**
 * Search the user-interface declaration for an option with the given yaml node name.
 * @param ui The user-interface declaration from the debug-adapters-yaml-file.
 * @param yamlNode The yaml node name to search for (e.g., "section.option").
 * @returns The found option, or undefined if not found.
 */
export function findUIOptionByYmlNode(ui: UISection[], yamlNode: string) {
    const nodes = yamlNode.split('.');
    const optionNode = nodes.pop();
    const sectionNode = nodes.pop();

    const uiSection = ui.find(section => section['yml-node'] === sectionNode);
    const uiOption = uiSection?.options?.find(option => option['yml-node'] === optionNode);

    return uiOption;
}
