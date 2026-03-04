/**
 * Copyright 2023-2026 Arm Limited
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

import { YAMLMap } from 'yaml';
import { readOptionalStringOrStringList } from './yaml-file-parsing';

export type ContextRestriction = {
    forContext: string[] | string;
    notForContext: string[] | string;
}

export const parseContextRestriction = (map: YAMLMap): ContextRestriction => ({
    forContext: readOptionalStringOrStringList(map.get('for-context')),
    notForContext: readOptionalStringOrStringList(map.get('not-for-context')),
});
