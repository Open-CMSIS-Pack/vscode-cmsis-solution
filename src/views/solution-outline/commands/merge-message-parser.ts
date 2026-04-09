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

import path from 'node:path';
import { stripVendor, stripVersion } from '../../../utils/string-utils';
import { MergeCommand } from './merge-command';

export const MERGE_VIEW_LINK_LABEL = 'Open Merge View';

export type MergeUpdateLevel = 'required' | 'recommended' | 'suggested' | 'mandatory';

const mergeMessageRegex = /file\s+'([^']+)'\s+update\s+(required|recommended|suggested|mandatory)/i;

export interface MergeMessageMatch {
    localPath: string;
    updateLevel: MergeUpdateLevel;
    matchStart: number;
    matchLength: number;
}

export function parseMergeMessage(line: string): MergeMessageMatch | undefined {
    const match = mergeMessageRegex.exec(line);
    if (!match || match.index === undefined) {
        return undefined;
    }

    return {
        localPath: match[1],
        updateLevel: match[2].toLowerCase() as MergeUpdateLevel,
        matchStart: match.index,
        matchLength: match[0].length,
    };
}

export function createMergeCommandUri(localPath: string): string {
    const args = encodeURIComponent(JSON.stringify([localPath]));
    return `command:${MergeCommand.mergeFileFromPath}?${args}`;
}

export function createMergeDiagnosticMessage(localPath: string, updateLevel: MergeUpdateLevel, componentId: string | undefined): string {
    const fileName = path.basename(localPath);
    if (componentId === undefined) {
        return `update ${updateLevel} for config file '${fileName}' has a new version available for merge.`;
    }

    const componentIdNoVersion = stripVersion(componentId);
    const componentDisplayName = stripVendor(componentIdNoVersion);
    return `update ${updateLevel} for config file '${fileName}' from component '${componentDisplayName}'.`;
}
