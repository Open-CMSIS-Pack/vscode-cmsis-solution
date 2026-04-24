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

import { describe, it, expect, beforeEach } from '@jest/globals';
import * as vscode from 'vscode';
import { MANAGE_COMPONENTS_PACKS_COMMAND_ID, MERGE_FILE_COMMAND_ID, RUN_GENERATOR_COMMAND_ID } from '../manifest';
import { ProblemDiagnosticActionResolver, ProblemDiagnosticActionContext } from './problem-diagnostic-action-resolver';

const diagnosticFilePath = '/work/app.csolution.yml';

function makeContext(overrides: Partial<ProblemDiagnosticActionContext> = {}): ProblemDiagnosticActionContext {
    return {
        message: '',
        diagnosticFilePath,
        hasLocation: false,
        ...overrides,
    };
}

function decodeCodeTarget(resolver: ProblemDiagnosticActionResolver, context: ProblemDiagnosticActionContext) {
    const result = resolver.resolve(context);
    const code = result?.code as { value: string; target: vscode.Uri } | undefined;
    const [command, encodedArgs] = code?.target.toString().split('?') ?? [];
    const args = encodedArgs ? JSON.parse(decodeURIComponent(encodedArgs)) : undefined;
    return { result, code, command, args };
}

describe('ProblemDiagnosticActionResolver', () => {
    let resolver: ProblemDiagnosticActionResolver;

    beforeEach(() => {
        resolver = new ProblemDiagnosticActionResolver();
    });

    describe('when no pattern matches', () => {
        it('returns undefined for a message with no recognizable pattern', () => {
            const result = resolver.resolve(makeContext({ message: 'build completed successfully' }));

            expect(result).toBeUndefined();
        });

        it('returns undefined for an empty message', () => {
            const result = resolver.resolve(makeContext({ message: '' }));

            expect(result).toBeUndefined();
        });
    });

    describe('merge action', () => {
        it('is returned even when hasLocation is true', () => {
            const result = resolver.resolve(makeContext({
                message: "update required for file '/packs/Component/config.c'",
                hasLocation: true,
            }));

            expect((result?.code as { value: string } | undefined)?.value).toBe('Open in Merge View');
        });

        it('encodes the absolute local path as the merge command argument', () => {
            const { command, args } = decodeCodeTarget(resolver, makeContext({
                message: "update required for file '/packs/Component/config.c'",
            }));

            expect(command).toBe(`command:${MERGE_FILE_COMMAND_ID}`);
            expect(args).toEqual(['/packs/Component/config.c']);
        });

        it('falls back to the diagnostic file path when the extracted path is relative', () => {
            const { args } = decodeCodeTarget(resolver, makeContext({
                message: "update required for file 'relative-config.c'",
                diagnosticFilePath: '/work/app.csolution.yml',
            }));

            expect(args).toEqual(['/work/app.csolution.yml']);
        });

        it('treats Windows-style C:/ paths as absolute', () => {
            const { args } = decodeCodeTarget(resolver, makeContext({
                message: "update required for file 'C:/CubeMX/RTE/CMSIS/RTX_Config.c' from component 'Arm::Device@2.3.4'",
                diagnosticFilePath,
            }));

            expect(args).toEqual(['C:/CubeMX/RTE/CMSIS/RTX_Config.c']);
        });

        it('ignores trailing content after a semicolon in multiline merge messages', () => {
            const result = resolver.resolve(makeContext({
                message: "update recommended for file 'C:/CubeMX/RTX_Config.c' from component 'CMSIS:RTOS2:Keil RTX5&Source'.\nMerge content from update file, rename update file to base file and remove previous base file",
            }));

            expect(result?.message).toBe("update recommended for config file 'RTX_Config.c' from component 'CMSIS:RTOS2:Keil RTX5&Source'.");
        });

        it('produces a message with component display name when component is present', () => {
            const result = resolver.resolve(makeContext({
                message: "update required for file '/packs/Component/config.c' from component 'Arm::Device@2.3.4'",
            }));

            expect(result?.message).toBe("update required for config file 'config.c' from component 'Device'.");
        });

        it('strips vendor prefix from component name in the message', () => {
            const result = resolver.resolve(makeContext({
                message: "update required for file '/packs/CMSIS/RTX_Config.c' from component 'ARM::CMSIS:RTOS2:Keil RTX5&Source'",
            }));

            expect(result?.message).toMatch(/from component 'CMSIS:RTOS2:Keil RTX5&Source'\./);
        });

        it('uses "has a new version available for merge" message when no component is present', () => {
            const result = resolver.resolve(makeContext({
                message: "update required for file '/packs/Component/config.c'",
                diagnosticFilePath,
            }));

            expect(result?.message).toBe("update required for config file 'config.c' has a new version available for merge.");
        });

        it.each(['required', 'recommended', 'suggested'] as const)(
            'produces a message with update level "%s" when no component is present',
            updateLevel => {
                const result = resolver.resolve(makeContext({
                    message: `update ${updateLevel} for file '/packs/Component/config.c'`,
                }));

                expect(result?.message).toBe(`update ${updateLevel} for config file 'config.c' has a new version available for merge.`);
            }
        );
    });

    describe('run-generator action', () => {

        it('encodes generator and context in the command URI arguments (CubeMX2 example)', () => {
            const { command, args } = decodeCodeTarget(resolver, makeContext({
                message: "run generator 'CubeMX2' for context 'CubeMX2.Debug+STM32C531CBT6'",
            }));

            expect(command).toBe(`command:${RUN_GENERATOR_COMMAND_ID}`);
            expect(args).toEqual([{ generator: 'CubeMX2', context: 'CubeMX2.Debug+STM32C531CBT6' }]);
        });

        it('encodes generator and context in the command URI arguments (legacy CubeMX example)', () => {
            const { command, args } = decodeCodeTarget(resolver, makeContext({
                message: "cgen file was not found, run generator 'CubeMX' for context 'App.Debug+STM32'",
            }));

            expect(command).toBe(`command:${RUN_GENERATOR_COMMAND_ID}`);
            expect(args).toEqual([{ generator: 'CubeMX', context: 'App.Debug+STM32' }]);
        });

        it('returns a formatted message and a code', () => {
            const result = resolver.resolve(makeContext({
                message: "cgen file was not found, run generator 'CubeMX' for context 'App.Debug+STM32'",
            }));

            expect(result?.message).toBe("Run generator 'CubeMX' for 'App.Debug+STM32'");
            expect(result?.code).toBeDefined();
        });

        it('is suppressed when hasLocation is true', () => {
            const result = resolver.resolve(makeContext({
                message: "cgen file was not found, run generator 'CubeMX' for context 'App.Debug+STM32'",
                hasLocation: true,
            }));

            expect(result).toBeUndefined();
        });

        it('matches alternate wording with trailing context description', () => {
            const result = resolver.resolve(makeContext({
                message: "run generator 'CubeMX2' for context 'CubeMX2.Debug+STM32C531CBT6' to generate missing cgen artifacts",
            }));

            expect((result?.code as { value: string } | undefined)?.value).toBe('Run Generator');
        });

        it('matches generator messages with irregular whitespace', () => {
            const { command, args } = decodeCodeTarget(resolver, makeContext({
                message: "cgen file was not found,\n  run generator   'CubeMX'\nfor context   'App.Debug+STM32'",
            }));

            expect(command).toBe(`command:${RUN_GENERATOR_COMMAND_ID}`);
            expect(args).toEqual([{ generator: 'CubeMX', context: 'App.Debug+STM32' }]);
        });
    });

    describe('manage-components action', () => {
        it('is returned for dependency validation context messages', () => {
            const { code } = decodeCodeTarget(resolver, makeContext({
                message: "dependency validation for context 'App.Debug+STM32' failed:",
            }));

            expect(code?.value).toBe('Manage Components');
        });

        it('encodes the context value in the command URI arguments', () => {
            const { command, args } = decodeCodeTarget(resolver, makeContext({
                message: "dependency validation for context 'App.Debug+STM32' failed:",
            }));

            expect(command).toBe(`command:${MANAGE_COMPONENTS_PACKS_COMMAND_ID}`);
            expect(args).toEqual([{ type: 'context', value: 'App.Debug+STM32' }]);
        });

        it('is suppressed when hasLocation is true', () => {
            const result = resolver.resolve(makeContext({
                message: "dependency validation for context 'App.Debug+STM32' failed:",
                hasLocation: true,
            }));

            expect(result).toBeUndefined();
        });
    });

    describe('find-in-files action', () => {
        it('extracts query from a quoted string in the message', () => {
            const { code } = decodeCodeTarget(resolver, makeContext({
                message: "component 'Arm::Device@1.0.0' is missing",
            }));

            expect(code?.value).toBe('Find in Files');
        });

        it('extracts query from a slash-delimited file path in the message', () => {
            const { args } = decodeCodeTarget(resolver, makeContext({
                message: 'file not found: /components/board/startup.c',
            }));

            expect(args.query).toBe('startup.c');
        });

        it('limits search to yml and yaml source files', () => {
            const result = resolver.resolve(makeContext({
                message: "component 'Arm::Device' is missing",
            }));

            const code = result?.code as { target: vscode.Uri } | undefined;
            const raw = code?.target.toString() ?? '';
            const encoded = raw.split('?')[1] ?? '';
            const findArgs = JSON.parse(decodeURIComponent(encoded));

            expect(findArgs.filesToInclude).toBe('*.yml,*.yaml');
        });

        it('excludes generated yml artifacts from the search', () => {
            const result = resolver.resolve(makeContext({
                message: "component 'Arm::Device' is missing",
            }));

            const code = result?.code as { target: vscode.Uri } | undefined;
            const raw = code?.target.toString() ?? '';
            const encoded = raw.split('?')[1] ?? '';
            const findArgs = JSON.parse(decodeURIComponent(encoded));

            expect(findArgs.filesToExclude).toBe('*.cbuild-idx.yml,*.cbuild.yml,*.cbuild-run.yml');
        });

        it('triggers search automatically with focusResults enabled', () => {
            const result = resolver.resolve(makeContext({
                message: "component 'Arm::Device' is missing",
            }));

            const code = result?.code as { target: vscode.Uri } | undefined;
            const raw = code?.target.toString() ?? '';
            const encoded = raw.split('?')[1] ?? '';
            const findArgs = JSON.parse(decodeURIComponent(encoded));

            expect(findArgs.triggerSearch).toBe(true);
            expect(findArgs.focusResults).toBe(true);
        });

        it('is suppressed when hasLocation is true', () => {
            const result = resolver.resolve(makeContext({
                message: "component 'Arm::Device' is missing",
                hasLocation: true,
            }));

            expect(result).toBeUndefined();
        });

        it('returns no message field, only a code', () => {
            const result = resolver.resolve(makeContext({
                message: "component 'Arm::Device' is missing",
            }));

            expect(result?.message).toBeUndefined();
            expect(result?.code).toBeDefined();
        });
    });
});
