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

import * as manifest from '../../manifest';
import { COutlineItem } from './tree-structure/solution-outline-item';
import { MergeNodeResolverImpl } from './merge-node-resolver';

describe('MergeNodeResolverImpl', () => {
    it('returns undefined when tree root is not set', () => {
        const resolver = new MergeNodeResolverImpl();

        expect(resolver.findMergeNodeByLocalPath('C:/workspace/RTX_Config.c')).toBeUndefined();
    });

    it('finds merge-enabled file node by local path', () => {
        const root = new COutlineItem('root');
        const group = root.createChild('group');
        const mergeFile = group.createChild('file');
        mergeFile.addFeature(manifest.MERGE_FILE_CONTEXT);
        mergeFile.setAttribute('local', 'C:/workspace/RTE/CMSIS/RTX_Config.c');

        const resolver = new MergeNodeResolverImpl();
        resolver.setTreeRoot(root);

        const found = resolver.findMergeNodeByLocalPath('C:/workspace/RTE/CMSIS/RTX_Config.c');
        expect(found).toBe(mergeFile);
    });

    it('ignores file node without merge feature even if local path matches', () => {
        const root = new COutlineItem('root');
        const file = root.createChild('file');
        file.setAttribute('local', 'C:/workspace/RTE/CMSIS/RTX_Config.c');

        const resolver = new MergeNodeResolverImpl();
        resolver.setTreeRoot(root);

        expect(resolver.findMergeNodeByLocalPath('C:/workspace/RTE/CMSIS/RTX_Config.c')).toBeUndefined();
    });
});
