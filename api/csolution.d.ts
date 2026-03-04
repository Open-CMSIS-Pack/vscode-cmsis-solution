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

import { CsolutionApiV2 } from './csolution-api-v2';

export * from './csolution-api-v1';
export * from './csolution-api-v2';

export interface CsolutionExtension {
    /**
     * Get given API version. Throws if the installed extension doesn't support the requested version.
     */
    getApi(version: 2): CsolutionApiV2;
}
