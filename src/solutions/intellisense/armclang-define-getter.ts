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

import { ProcessManager } from '../../vscode-api/runner/process-manager';
import { WorkspaceFsProvider } from '../../vscode-api/workspace-fs-provider';
import { URI } from 'vscode-uri';

type CompileCommands = Array<{
    directory: string,
    command: string,
    file: string
}>;

export class ArmclangDefineGetter {

    constructor(
        private readonly processManager: ProcessManager,
        private readonly workspaceFsProvider: WorkspaceFsProvider
    ) {}

    /**
     * Takes a compile commands file and generates a set of unique flags to feed to
     * armclang's preprocessor in order to get a list of appropriate macro defines.
     * If the function fails (e.g. armclang isn't available) we simply return nothing.
     *
     * @param compileCommandsPath An absolute path to a compile_commands.json file.
     * @returns An array of define flags for a clangd config file.
     */
    public async getClangdDefineFlags(compileCommandsPath: URI) {

        const content = (await this.workspaceFsProvider.readUtf8File(compileCommandsPath.fsPath)).toString();
        let json: CompileCommands;
        try {
            json = JSON.parse(content) as CompileCommands;
        } catch (err) {
            console.log(`Failed to read the compile_commands.json file at ${compileCommandsPath.fsPath}. IntelliSense for AC6 projects will be degraded.`);
            console.log(err);
            return [];
        }

        const allFlags = json.map(c => c.command).map(c => c.split(/\s+/));
        const mergedFlags = (Array.from(new Set(allFlags.flat())));
        const relevantFlags = mergedFlags.filter(f => this.isRelevantFlag(f));
        const uniqueFlags = this.getUniqueFlags(relevantFlags);

        // Invoke armclang's preprocessor via the following flags to get the list of defines.
        // We need to use stdio 'ignore' to prevent it waiting for file input.
        uniqueFlags.push('-dM', '-E', '-');
        const defines: string[] = [];
        try {
            await this.processManager.spawn(`armclang${process.platform === 'win32' ? '.exe' : '' }`, uniqueFlags, { stdio: ['ignore'] }, define => {
                defines.push(define);
            });
        } catch (err) {
            console.log('Failed to call armclang\'s preprocessor for macro defines. Is it on the PATH? Intellisense for AC6 projects will be degraded.');
            console.log(err);
            return [];
        }

        const clangdFlags = defines.filter(f => f.startsWith('#define')).map(f => f.replace('#define ', '-D').replace(' ', '='));

        // __ARMCOMPILER_LIBCXX doesn't seem to appear in preprocessor invocations, probably because it's passed explicitly to cc1 (rather than being defined by the clang driver).
        if (!uniqueFlags.includes('-nostdlibinc') && !uniqueFlags.includes('-nostdinc++')) {
            clangdFlags.push('-D__ARMCOMPILER_LIBCXX=1');
        }

        return clangdFlags;
    }

    /**
     * Takes an array of compiler flags and attempts to de-duplicate them.
     *
     * @param flags A string array of compiler flags (and their values, if appropriate)
     * @returns An array of deduplicated compiler flags
     */
    private getUniqueFlags(flags: string[]): string[] {
        const uniqueFlags = flags.filter((f, fidx) => {
            const valueFlagMatch = f.match(/-([-\w]+)=([-\w]+)/);
            if (valueFlagMatch) { // Value specifying commands might appear multiple times with different values
                return flags.findIndex(o => {
                    if (o.startsWith(`-${valueFlagMatch[1]}`)) {
                        return true;
                    }
                    return false;
                }) === fidx;
            } else {              // Won't catch g{N}/O{N} but it's not a likely case.
                return flags.findIndex(o => {
                    if (f === o) {
                        return true;
                    }
                    return false;
                }) === fidx;
            }
        });
        return uniqueFlags;
    }

    /**
     * Examines whether a given compiler flag is safe and useful
     * (i.e. it has the potential to change the defined macros) to feed to clangd.
     *
     * @param flag A full compiler flag.
     * @returns true if it is likely to affect clang defines, else false.
     */
    private isRelevantFlag(flag: string): boolean {
        if (flag.startsWith('--target')) {  // arch target, will probably always be (arm-)arm-none-eabi for us
            return true;
        }
        if (flag.startsWith('-m')) {        // machine dependent options, e.g. mcpu, march, mabi
            return true;
        }
        if (flag.startsWith('-f')) {        // machine independent options controlling conventions and features, e.g. fno-builtin, fpic, fshort-wchar
            return true;
        }
        if (flag.startsWith('-g')) {        // Debug options, e.g. g, gdwarf
            return true;
        }
        if (flag.startsWith('-O')) {        // optimization level, e.g. 00, 03, 0z
            return true;
        }
        if (flag === '-nostdinc++') {
            return true;
        }
        if (flag === '-nostdlibinc') {
            return true;
        }
        return false;
    }
}
