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

/**
 * The ID for a row representing a single component in the table.
 * Used to request updates to component selection state on user interaction.
 */
export interface ComponentRowId {
    /**
     * Bundle name. Empty if not part of a bundle.
     */
    bundleName: string;
    cClass: string;
    group: string;
    subGroup: string;
}

export const componentRowIdsEqual = (rowId1: ComponentRowId) => (rowId2: ComponentRowId) =>
    rowId1.subGroup === rowId2.subGroup &&
    rowId1.group === rowId2.group &&
    rowId1.cClass === rowId2.cClass &&
    rowId1.bundleName === rowId2.bundleName;

export const componentRowIdToElementId = (rowId: ComponentRowId): string =>
    `${rowId.cClass}-${rowId.bundleName}-${rowId.group}${rowId.subGroup ? `-${rowId.subGroup}` : ''}`;

export const componentRowIdToDisplayString = (rowId: ComponentRowId): string => {
    const bundleString = rowId.bundleName ? `&${rowId.bundleName}` : '';
    const subGroupString = rowId.subGroup ? `:${rowId.subGroup}` : '';
    return `${rowId.cClass}${bundleString}${rowId.group}${subGroupString}`;
};
