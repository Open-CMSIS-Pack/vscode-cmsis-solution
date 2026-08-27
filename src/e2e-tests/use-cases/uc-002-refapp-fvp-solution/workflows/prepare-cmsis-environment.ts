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

import { TerminalDriver } from '../../../drivers/Terminal-driver';
import { VsCodeDriver } from '../../../infrastructure/vscode-driver';
import * as fs from 'fs-extra';
import * as path from 'path';
import type {
    CreateSolutionFixture,
    RequiredPack,
} from './wf-001-refapp-fvp-solution';

const E2E_DATA_DIRECTORY = path.resolve(__dirname, '..', '..', 'data');
const PACK_INDEX_URL = 'https://www.keil.com/pack/index.pidx';

export const prepareCmsisEnvironment = async (
    vsCodeDriver: VsCodeDriver,
    fixture: CreateSolutionFixture,
): Promise<void> => {
    const terminalDriver = new TerminalDriver(vsCodeDriver);

    // Install require Python packages
    if (fixture.required_python_packages.length > 0) {
        await terminalDriver.runCommand(
            `python -m pip install ${fixture.required_python_packages.join(' ')}`,
        );
    }

    await preparePackRoot(terminalDriver);

    // Install required packs
    for (const pack of fixture.required_packs) {
        const source = await resolvePackSource(
            terminalDriver,
            pack,
        );

        await installPack(
            terminalDriver,
            pack,
            source,
        );
    }
    await vsCodeDriver.page
        .getCommands()
        .runCommandFromPalette('View: Kill All Terminals');
};

const preparePackRoot = async (
    terminalDriver: TerminalDriver,
): Promise<void> => {
    const listResult = await terminalDriver.runCommand(
        'cpackget list --quiet',
        {
            allowFailure: true,
        },
    );

    if (listResult.exitCode !== 0) {
        await terminalDriver.runCommand(
            `cpackget init ${PACK_INDEX_URL}`,
        );
    }

    await terminalDriver.runCommand(
        'cpackget update-index',
    );
};

const installPack = async (
    terminalDriver: TerminalDriver,
    pack: RequiredPack,
    source: string,
): Promise<void> => {
    const agreeLicense = pack.agree_embedded_license
        ? ' --agree-embedded-license'
        : '';

    await terminalDriver.runCommand(
        `cpackget add "${source}"${agreeLicense}`,
    );
};

const resolvePackSource = async (
    terminalDriver: TerminalDriver,
    pack: RequiredPack,
): Promise<string> => {
    if (!pack.repository) {
        return pack.source;
    }

    const checkoutDirectory = path.join(
        E2E_DATA_DIRECTORY,
        pack.repository.directory,
    );

    const packSource = path.join(
        checkoutDirectory,
        pack.source,
    );

    if (!await fs.pathExists(packSource)) {
        if (await fs.pathExists(checkoutDirectory)) {
            throw new Error(
                `Repository checkout exists but pack source was not found: ${packSource}`,
            );
        }

        await fs.ensureDir(E2E_DATA_DIRECTORY);

        await terminalDriver.runCommand(
            `git clone --depth 1 "${pack.repository.url}" "${checkoutDirectory}"`,
        );
    }

    return packSource;
};
