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

import * as path from 'path';
import * as fs from 'fs';

export const getTestEnvironment = async (): Promise<Record<string, string>> => {
    const fvpPluginsPath = await getFvpPluginsPath();

    return {
        AVH_FVP_PLUGINS: fvpPluginsPath,
    };
};

const getFvpPluginsPath = async (): Promise<string> => {
    // Resolve installed AVH FVP artifact here

    const pluginsPath = 'test';

    const gdbServerPath = path.join(pluginsPath, 'GDBServer.dll');

    if (!fs.existsSync(gdbServerPath)) {
        throw new Error(
            `GDBServer plugin not found: ${gdbServerPath}`,
        );
    }

    return pluginsPath;
};