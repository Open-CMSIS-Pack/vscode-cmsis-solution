/**
 * Copyright 2023-2026 Arm Limited
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

import parser from 'yargs-parser';
import { WorkspaceFsProvider } from '../../vscode-api/workspace-fs-provider';
import path from 'path';
import { pathsEqual } from '../../utils/path-utils';

export type CompileCommand = {
    directory: string;
    command: string;
    file: string;
}

export type CompileCommands = CompileCommand[]

export type ParsedCompileCommand = {
    compilerPath: string;
    compilerArgs: string[];
}

export class CompileCommandsParser {
    private readonly cliArgsParserConfig: Partial<parser.Configuration> = {
        'short-option-groups': false,
        'camel-case-expansion': false,
        'unknown-options-as-args': true,
    };

    constructor(private readonly fsProvider: WorkspaceFsProvider) { }

    public async getCommandForFile(compileCommandsFilePath: string, filePath: string): Promise<ParsedCompileCommand> {
        const parsedCompileCommands = await this.unmarshallCompileCommands(compileCommandsFilePath);
        for (const command of parsedCompileCommands) {
            if (pathsEqual(command.file, filePath) || isCompatibleWithHeader(command.file, filePath)) {
                return this.argParser(command.command);
            }
        }
        throw new Error(`No command found for file "${filePath}" in "${compileCommandsFilePath}"`);
    }

    public async getAllIncludeCommands(compileCommandsFilePath: string) {
        return (await this.getAllUniqueCommands(compileCommandsFilePath)).filter(c => c.startsWith('-I'));
    }

    private async getAllUniqueCommands(compileCommandsFilePath: string) {
        const compileCommands = await this.unmarshallCompileCommands(compileCommandsFilePath);
        const allCommands = compileCommands.map(c => c.command).map(c => c.split(/\s+/));
        return (Array.from(new Set(allCommands.flat())));
    }

    private async unmarshallCompileCommands(compileCommandsFilePath: string): Promise<CompileCommands> {
        const compileCommandsJsonString = await this.fsProvider.readUtf8File(compileCommandsFilePath);
        const parsedCompileCommands: CompileCommands = JSON.parse(compileCommandsJsonString);
        return parsedCompileCommands;
    }

    private argParser(command: string): ParsedCompileCommand {
        const args = parser(command, { configuration: this.cliArgsParserConfig });
        return {
            compilerPath: args['_'][0]?.toString() || '',
            compilerArgs: args['_'].slice(1).map(item => item.toString())
        };
    }
}
// Currently do not have any compile commands for header files, so using the compile command for a .c file in order to get intellisense working
const isCompatibleWithHeader = (command: string, filePath: string) => path.extname(filePath) === '.h' && path.extname(command) === '.c';
