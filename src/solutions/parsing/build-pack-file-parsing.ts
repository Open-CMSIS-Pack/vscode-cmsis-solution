/**
 * Copyright 2024-2026 Arm Limited
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

import { PackFile, ResolvedPack } from './build-pack-file';
import * as YAML from 'yaml';
import { readMapFromMap, readOptionalMapArrayFromMap, readOptionalStringList, readStringFromMap, requireMap } from './yaml-file-parsing';

export const parseResolvedPacks = (resolvedPacksYaml: YAML.YAMLMap<unknown, unknown>[]): ResolvedPack[] => {
    return resolvedPacksYaml.map(packMap => {
        return {
            resolvedPack: readStringFromMap('resolved-pack')(packMap),
            selectedByPack: readOptionalStringList(packMap.get('selected-by-pack') || packMap.get('selected-by'))
        };
    });
};

export const parsePackFile = (yamlDocument: YAML.Document<YAML.Node>): PackFile => {
    const root  = requireMap(yamlDocument.contents);
    const packFileNode = readMapFromMap('cbuild-pack')(root);

    return {
        resolvedPacks: parseResolvedPacks(readOptionalMapArrayFromMap('resolved-packs')(packFileNode))
    };
};
