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

import { CsolutionApiV2 } from './csolution-api-v2';

/** API V3 retains the existing V2 operations. */
export interface CsolutionApiV3 extends CsolutionApiV2 {
    dispose(): void;
    /** Return current VS Code window tools-environment YAML, waiting for an in-progress Arm Tools activation. No solution or output file is required. Multi-root workspaces share one environment, not isolated per-folder tools. Arm Tools owns activation and its prompts. */
    getToolsEnvironment(): Promise<string>;
}
