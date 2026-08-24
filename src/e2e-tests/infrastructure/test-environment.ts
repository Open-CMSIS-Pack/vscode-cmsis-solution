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

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { parse } from 'yaml';

type FvpFixture = {
    arm_tools: {
        artifact: string;
        version: string;
    };
};

export const getTestEnvironment = async (): Promise<Record<string, string>> => {
    const fixture = getFvpFixture();

    const fvpPluginsPath = await getFvpPluginsPath(fixture);

    return {
        AVH_FVP_PLUGINS: fvpPluginsPath,
    };
};

const getFvpFixture = (): FvpFixture => {
    const fixturePath = path.resolve(
        __dirname,
        '../use-cases/uc-002-refapp-fvp-solution/fixtures/wf-001-refapp-fvp-solution.yml',
    );

    return parse(
        fs.readFileSync(fixturePath, 'utf8'),
    ) as FvpFixture;
};

const getFvpPluginsPath = async (
    fixture: FvpFixture,
): Promise<string> => {
    const { artifact, version } = fixture.arm_tools;

    const artifactsRoot = path.join(
        os.homedir(),
        '.vcpkg',
        'artifacts',
    );

    const artifactName = artifact.split(':')[1];

    if (!artifactName) {
        throw new Error(`Invalid FVP artifact name: ${artifact}`);
    }

    const artifactDirectoryName = artifactName.replace(/[/-]/g, '.');

    const artifactDirectories = fs.readdirSync(artifactsRoot);

    for (const artifactHash of artifactDirectories) {
        const pluginsPath = path.join(
            artifactsRoot,
            artifactHash,
            artifactDirectoryName,
            version,
            'plugins',
        );

        if (fs.existsSync(pluginsPath)) {
            return pluginsPath;
        }
    }

    throw new Error(
        `FVP plugins directory not found for ${artifact}@${version}`,
    );
};
