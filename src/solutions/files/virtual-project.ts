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
import { CTreeItem, ITreeItem } from '@open-cmsis-pack/cmsis-common/tree-item';
import { extractPname } from '@open-cmsis-pack/cmsis-common/string-utils';
import { PROJECT_CMAKE_SUFFIX, PROJECT_WEST_SUFFIX } from '../constants';

export interface VirtualProjectDescriptor {
    readonly item: ITreeItem<CTreeItem>;
    readonly type: 'West' | 'CMake';
    readonly source: string;
    readonly projectId: string;
    readonly suffix: string;
    readonly project: string;
    readonly deviceProcessor: string | undefined;
}

export function getVirtualProjectDescriptor(item: ITreeItem<CTreeItem> | undefined, defaultCmakeSource = ''): VirtualProjectDescriptor | undefined {
    const west = item?.getChild('west');
    const cmake = item?.getChild('cmake');
    const virtualItem = west ?? cmake;
    if (!virtualItem) {
        return undefined;
    }

    const type = west ? 'West' : 'CMake';
    const sourceKey = west ? 'app-path' : 'source';
    const source = virtualItem.getValueAsString(sourceKey) || (cmake ? defaultCmakeSource : '');
    const resolvedSource = item?.resolvePath(source) ?? source;
    const projectId = virtualItem.getValueAsString('project-id') || ((source || cmake) ? path.basename(resolvedSource) : '');
    const suffix = west ? PROJECT_WEST_SUFFIX : PROJECT_CMAKE_SUFFIX;
    const project = source ? source + '/' + projectId + suffix : projectId + suffix;

    return {
        item: virtualItem,
        type,
        source,
        projectId,
        suffix,
        project,
        deviceProcessor: extractPname(virtualItem.getValueAsString('device')),
    };
}
