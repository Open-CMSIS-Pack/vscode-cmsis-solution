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

const FVP_ARTIFACT = 'arm:models/arm/avh-fvp';

type VcpkgConfiguration = {
    requires?: Record<string, string>;
};

const getFvpRequirement = (): {
    artifact: string;
    version: string;
} => {
    const configurationPath = path.resolve(
        __dirname,
        '../vcpkg-configuration.json',
    );

    const configuration = JSON.parse(
        fs.readFileSync(configurationPath, 'utf8'),
    ) as VcpkgConfiguration;

    const version = configuration.requires?.[FVP_ARTIFACT];

    if (!version) {
        throw new Error(
            `${FVP_ARTIFACT} is missing from E2E vcpkg-configuration.json`,
        );
    }

    return {
        artifact: FVP_ARTIFACT,
        version,
    };
};

export const getTestEnvironment =
    async (): Promise<Record<string, string>> => {
        const { artifact, version } = getFvpRequirement();
        const fvpPluginsPath = getFvpPluginsPath(artifact, version);

        if (!fvpPluginsPath) {
            throw new Error(
                `Could not resolve plugins for ${artifact}@${version}`,
            );
        }

        return {
            AVH_FVP_PLUGINS: fvpPluginsPath,
        };
    };

const getFvpPluginsPath = (
    artifact: string,
    version: string,
): string | undefined => {

    const artifactsRoot = path.join(
        os.homedir(),
        '.vcpkg',
        'artifacts',
    );

    if (!fs.existsSync(artifactsRoot)) {
        return undefined;
    }

    const artifactName = artifact.split(':')[1];

    if (!artifactName) {
        throw new Error(`Invalid FVP artifact: ${artifact}`);
    }

    const artifactDirectoryName =
        artifactName.replace(/[/-]/g, '.');

    for (const artifactHash of fs.readdirSync(artifactsRoot)) {
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

    return undefined;
};
