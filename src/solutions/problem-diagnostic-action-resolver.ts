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

import * as path from 'node:path';
import * as vscode from 'vscode';
import {
    CONFIG_ENVIRONMENT_VARIABLES,
    MANAGE_COMPONENTS_PACKS_COMMAND_ID,
    MERGE_FILE_COMMAND_ID,
    OPEN_ENV_VAR_SETTINGS_COMMAND_ID,
    PACKAGE_NAME,
    RUN_GENERATOR_COMMAND_ID,
} from '../manifest';
import { stripVendor, stripVersion } from '../utils/string-utils';
import { contextDescriptorFromString } from './descriptors/descriptors';


type MergeUpdateLevel =  'recommended' | 'suggested' | 'required';

interface MergeMessageMatch {
    localPath: string;
    updateLevel: MergeUpdateLevel;
}

interface QueryActionMatch {
    query: string;
    action: 'components-packs' | 'find-in-files';
}

export interface ProblemDiagnosticActionContext {
    message: string;
    diagnosticFilePath: string;
    hasLocation: boolean;
}

export interface ProblemDiagnosticActionResult {
    message?: string;
    code?: NonNullable<vscode.Diagnostic['code']>;
}

type ProblemActionDescriptor =
    | { kind: 'merge'; localPath: string; updateLevel: MergeUpdateLevel; componentId?: string }
    | { kind: 'run-generator'; generator: string; activeTarget: string }
    | { kind: 'manage-components'; query: string }
    | { kind: 'manage-pack'; packId: string }
    | { kind: 'open-environment-variables-settings' }
    | { kind: 'find-in-files'; query: string };

const envVarSettingName = `${PACKAGE_NAME}.${CONFIG_ENVIRONMENT_VARIABLES}`;
const envVarActionPatterns: readonly RegExp[] = [
    /^missing [A-Za-z_][A-Za-z0-9_]* environment variable(?:; review "cmsis-csolution\.environmentVariables")?$/,
    /^[A-Za-z_][A-Za-z0-9_]* environment variable specifies non-existent directory: .+(?:; review "cmsis-csolution\.environmentVariables")?$/,
    /^exec: "west": executable file not found in .+(?:; review "cmsis-csolution\.environmentVariables")?$/,
];

const mergeMessagePatterns = [
    {
        pattern: /update\s+(recommended|suggested|required)\s+for\s+file\s+'([^']+)'/i,
        getLocalPath: (match: RegExpExecArray) => match[2],
        getUpdateLevel: (match: RegExpExecArray) => match[1],
    },
] as const;

const mergeComponentRegex = /(?:for|from)\s+component\s+'([^']+)'/i;
const generatorMissingPatterns: readonly RegExp[] = [
    /run\s+generator\s+'([^']+)'\s+for\s+context\s+'([^']+)'/i,
    /cgen file was not found,\s*run generator '([^']+)' for context '([^']+)'/i,
    /(?:cgen\s+file\s+.*\s+)?run generator '([^']+)' for context '([^']+)'/i,
];

const packProblemPatterns: readonly RegExp[] = [
    /downloading pack '([^']+)' failed/i,
    /required pack '([^']+)' not installed/i,
    /selected multiple versions of pack '([^']+)'/i,
];

const queryActionPatterns: ReadonlyArray<{ pattern: RegExp; action: 'components-packs' | 'find-in-files' }> = [
    { pattern: /dependency validation for context '([^']+)' failed:/, action: 'components-packs' },
    { pattern: /\/([^/\s']+\.[^/\s']+)/, action: 'find-in-files' },
    { pattern: /'([^']+)'/, action: 'find-in-files' },
    { pattern: /([A-Za-z0-9_.-]+::[A-Za-z0-9_.-]+(@[A-Za-z0-9_.-]+)*)/, action: 'find-in-files' },
    { pattern: /([A-Za-z0-9_.-]+@[A-Za-z0-9_.-]*)/, action: 'find-in-files' },
];

export class ProblemDiagnosticActionResolver {
    /**
     * Optional provider for the active target set name
     * If not provided, falls back to the target type parsed from the diagnostic message.
     *
     * @param getActiveTargetSetName - Function returning the current active target set name,
     *                                 or undefined if no target set is active. Called lazily
     *                                 only when resolving generator diagnostics.
     */
    constructor(
        private readonly getActiveTargetSetName?: () => string | undefined,
    ) {
    }

    public resolve(context: ProblemDiagnosticActionContext): ProblemDiagnosticActionResult | undefined {
        const descriptor = this.resolveDescriptor(context);
        if (!descriptor) {
            return undefined;
        }
        return this.toDiagnosticAction(descriptor);
    }

    private resolveDescriptor(context: ProblemDiagnosticActionContext): ProblemActionDescriptor | undefined {
        return this.resolveMergeAction(context)
            ?? this.resolveGeneratorMissingAction(context)
            ?? this.resolveManagePackAction(context)
            ?? this.resolveManageComponentsAction(context)
            ?? this.resolveEnvVarSettingsAction(context)
            ?? this.resolveGenericSearchAction(context);
    }

    private toDiagnosticAction(descriptor: ProblemActionDescriptor): ProblemDiagnosticActionResult {
        if (descriptor.kind === 'merge') {
            return {
                message: this.createMergeDiagnosticMessage(descriptor.localPath, descriptor.updateLevel, descriptor.componentId),
                code: {
                    value: 'Open in Merge View',
                    target: this.createMergeCommandUri(descriptor.localPath),
                },
            };
        }

        if (descriptor.kind === 'run-generator') {
            return {
                message: `Run generator '${descriptor.generator}' for target '${descriptor.activeTarget || '""'}'`,
                code: {
                    value: 'Run Generator',
                    target: this.createRunGeneratorCommandUri(descriptor.generator, descriptor.activeTarget),
                },
            };
        }

        if (descriptor.kind === 'manage-components') {
            const args = this.encodeCommandArgs([{ type: 'context', value: descriptor.query }]);
            return {
                code: {
                    value: 'Manage Components',
                    target: vscode.Uri.parse(`command:${MANAGE_COMPONENTS_PACKS_COMMAND_ID}?${args}`),
                },
            };
        }

        if (descriptor.kind === 'manage-pack') {
            const args = this.encodeCommandArgs([{ type: 'pack', value: descriptor.packId }]);
            return {
                code: {
                    value: 'Open Software Packs',
                    target: vscode.Uri.parse(`command:${MANAGE_COMPONENTS_PACKS_COMMAND_ID}?${args}`),
                },
            };
        }

        if (descriptor.kind === 'open-environment-variables-settings') {
            return {
                code: {
                    value: 'Configure Environment Variables',
                    target: this.createOpenEnvVarSettingsCommandUri(),
                },
            };
        }

        const args = this.encodeFindInFilesArgs(descriptor.query);
        return {
            code: {
                value: 'Find in Files',
                target: vscode.Uri.parse(`command:workbench.action.findInFiles?${args}`),
            },
        };
    }

    private resolveMergeAction(context: ProblemDiagnosticActionContext): ProblemActionDescriptor | undefined {
        const merge = this.parseMergeMessage(context.message);
        if (!merge) {
            return undefined;
        }

        const componentId = mergeComponentRegex.exec(context.message)?.[1];
        const localPath = this.isAbsoluteFilePath(merge.localPath) ? merge.localPath : context.diagnosticFilePath;
        return {
            kind: 'merge',
            localPath,
            updateLevel: merge.updateLevel,
            componentId,
        };
    }

    private resolveGeneratorMissingAction(context: ProblemDiagnosticActionContext): ProblemActionDescriptor | undefined {
        if (context.hasLocation) {
            return undefined;
        }

        const request = this.parseGeneratorRequest(context.message);
        if (!request) {
            return undefined;
        }

        return {
            kind: 'run-generator',
            generator: request.generator,
            activeTarget: request.activeTarget,
        };
    }

    private resolveManageComponentsAction(context: ProblemDiagnosticActionContext): ProblemActionDescriptor | undefined {
        if (context.hasLocation) {
            return undefined;
        }

        const queryAction = this.findQueryActionInMessage(context.message, 'components-packs');
        if (!queryAction) {
            return undefined;
        }

        return {
            kind: 'manage-components',
            query: queryAction.query,
        };
    }

    private resolveManagePackAction(context: ProblemDiagnosticActionContext): ProblemActionDescriptor | undefined {
        if (context.hasLocation) {
            return undefined;
        }

        const packId = this.parsePackIdFromProblem(context.message);
        if (!packId) {
            return undefined;
        }

        return {
            kind: 'manage-pack',
            packId,
        };
    }

    private resolveEnvVarSettingsAction(context: ProblemDiagnosticActionContext): ProblemActionDescriptor | undefined {
        const normalizedMessage = this.normalizeMessageForPatternMatching(context.message);
        const hasEnvironmentMessage = envVarActionPatterns.some(pattern => pattern.test(normalizedMessage));
        if (!hasEnvironmentMessage) {
            return undefined;
        }

        return {
            kind: 'open-environment-variables-settings',
        };
    }

    private resolveGenericSearchAction(context: ProblemDiagnosticActionContext): ProblemActionDescriptor | undefined {
        if (context.hasLocation) {
            return undefined;
        }

        const queryAction = this.findQueryActionInMessage(context.message, 'find-in-files');
        if (!queryAction) {
            return undefined;
        }

        return {
            kind: 'find-in-files',
            query: queryAction.query,
        };
    }

    private parseGeneratorRequest(message: string): { generator: string; activeTarget: string } | undefined {
        const normalizedMessage = this.normalizeMessageForPatternMatching(message);

        for (const pattern of generatorMissingPatterns) {
            const match = normalizedMessage.match(pattern);
            if (!match) {
                continue;
            }

            const [, generator, context] = match;
            const targetType = contextDescriptorFromString(context).targetType;
            const activeTarget = this.getActiveTargetSetName?.() ?? targetType;
            return { generator, activeTarget };
        }

        return undefined;
    }

    private normalizeMessageForPatternMatching(message: string): string {
        return message.replace(/\s+/g, ' ').trim();
    }

    private parseMergeMessage(message: string): MergeMessageMatch | undefined {
        for (const item of mergeMessagePatterns) {
            const match = item.pattern.exec(message);
            if (!match) {
                continue;
            }

            return {
                localPath: item.getLocalPath(match),
                updateLevel: item.getUpdateLevel(match).toLowerCase() as MergeUpdateLevel,
            };
        }

        return undefined;
    }

    private parsePackIdFromProblem(message: string): string | undefined {
        for (const pattern of packProblemPatterns) {
            const match = message.match(pattern);
            if (match?.[1]) {
                return match[1];
            }
        }

        return undefined;
    }

    private findQueryActionInMessage(message: string, action: QueryActionMatch['action']): QueryActionMatch | undefined {
        for (const item of queryActionPatterns) {
            if (item.action !== action) {
                continue;
            }

            const match = message.match(item.pattern);
            if (match?.[1]) {
                return { query: match[1], action: item.action };
            }
        }

        return undefined;
    }

    private createMergeDiagnosticMessage(localPath: string, updateLevel: MergeUpdateLevel, componentId: string | undefined): string {
        const fileName = path.basename(localPath);
        if (componentId === undefined) {
            return `update ${updateLevel} for config file '${fileName}' has a new version available for merge.`;
        }

        const componentIdNoVersion = stripVersion(componentId);
        const componentDisplayName = stripVendor(componentIdNoVersion);
        return `update ${updateLevel} for config file '${fileName}' from component '${componentDisplayName}'.`;
    }

    private createMergeCommandUri(localPath: string): vscode.Uri {
        const args = this.encodeCommandArgs([localPath]);
        return vscode.Uri.parse(`command:${MERGE_FILE_COMMAND_ID}?${args}`);
    }

    private createRunGeneratorCommandUri(generator: string, activeTarget: string): vscode.Uri {
        const args = this.encodeCommandArgs([{ generator, activeTarget }]);
        return vscode.Uri.parse(`command:${RUN_GENERATOR_COMMAND_ID}?${args}`);
    }

    private createOpenEnvVarSettingsCommandUri(): vscode.Uri {
        const args = this.encodeCommandArgs([envVarSettingName]);
        return vscode.Uri.parse(`command:${OPEN_ENV_VAR_SETTINGS_COMMAND_ID}?${args}`);
    }

    private isAbsoluteFilePath(filePath: string): boolean {
        return path.isAbsolute(filePath) || path.win32.isAbsolute(filePath);
    }

    private encodeFindInFilesArgs(query: string): string {
        const args = {
            query: query,
            filesToInclude: '*.yml,*.yaml',
            filesToExclude: '*.cbuild-idx.yml,*.cbuild.yml,*.cbuild-run.yml',
            isRegex: false,
            isCaseSensitive: false,
            matchWholeWord: false,
            triggerSearch: true,
            focusResults: true,
        };
        return encodeURIComponent(JSON.stringify(args));
    }

    private encodeCommandArgs(args: unknown[]): string {
        return encodeURIComponent(JSON.stringify(args));
    }
}
