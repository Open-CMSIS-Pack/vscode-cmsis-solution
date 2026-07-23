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

import { packURL } from '../../../packs/pack-urls';

/**
 * Returns a Markdown tooltip suffix with a link to the pack overview.
 */
export function buildPackOverviewLink(packId?: string): string {
    if (!packId || !packId.trim()) {
        return '';
    }

    return ` [$(link-external)](${packURL(packId)})`;
}
