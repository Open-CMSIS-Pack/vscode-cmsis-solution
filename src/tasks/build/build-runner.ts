/**
 * Copyright 2024-2026 Arm Limited
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

import { CmsisToolboxManager } from '../../solutions/cmsis-toolbox';
import { getOutputDirectory } from '../../util';
import { CancellationToken, Runner } from '../../vscode-api/runner/runner';
import { BuildTaskDefinition, BuildOutputVerbosity } from './build-task-definition';
import type { TerminalDimensions } from 'vscode';

export const cbuildArgsFromTaskDefinition = (definition: BuildTaskDefinition): string[] => {
    const executionArgs: string[] = [];

    if (definition.setup) {
        executionArgs.push('setup');
    }

    if (definition.solution) {
        executionArgs.push(definition.solution);
    }

    if (definition.clean) {
        executionArgs.push('--clean');
    }

    const buildOutputFlag = VERBOSITY_TO_FLAG[definition.buildOutputVerbosity ?? 'normal'];
    if (buildOutputFlag) {
        executionArgs.push(buildOutputFlag);
    }

    if (definition.generator) {
        executionArgs.push('--generator', definition.generator);
    }

    if (definition.intermediateDirectory) {
        executionArgs.push('--intdir', definition.intermediateDirectory);
    }

    if (definition.outputDirectory) {
        executionArgs.push('--outdir', definition.outputDirectory);
    }

    if (definition.cmakeTarget) {
        executionArgs.push('--target', definition.cmakeTarget);
    }

    if (definition.rebuild) {
        executionArgs.push('--rebuild');
    }

    if (!definition.clean) {
        executionArgs.push('--active', definition.active ?? '');
    }

    if (definition.updateRte) {
        executionArgs.push('--update-rte');
    }

    if (definition.schemaCheck !== false) {
        executionArgs.push('--schema');
    }

    if (definition.toolchain) {
        executionArgs.push('--toolchain', definition.toolchain);
    }

    if (definition.downloadPacks) {
        executionArgs.push('--packs');
    }

    if (typeof definition.jobs === 'number') {
        executionArgs.push('--jobs', definition.jobs.toString());
    }

    const outDir = getOutputDirectory();
    if (outDir) {
        executionArgs.push('--output', outDir);
    }

    if (!definition.rebuild && !definition.clean) {
        executionArgs.push('--skip-convert');
    }

    return executionArgs;
};

const VERBOSITY_TO_FLAG: Record<BuildOutputVerbosity, string | undefined> = {
    normal: undefined,
    quiet: '--quiet',
    verbose: '--verbose',
    debug: '--debug',
};

export class BuildRunner implements Runner {
    public constructor(
        private readonly cmsisToolboxManager: CmsisToolboxManager,
    ) {}

    public async run(definition: BuildTaskDefinition, onOutput: (line: string) => void, cancellationToken: CancellationToken,
        dimensions?: TerminalDimensions): Promise<void> {
        const args = cbuildArgsFromTaskDefinition(definition);
        await this.cmsisToolboxManager.runCmsisTool('cbuild', args, onOutput, cancellationToken, dimensions, true, false);
    }
}
