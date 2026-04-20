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
import { MANAGE_COMPONENTS_PACKS_COMMAND_ID, MERGE_FILE_COMMAND_ID, RUN_GENERATOR_COMMAND_ID } from '../manifest';
import { stripVendor, stripVersion } from '../utils/string-utils';

export const MERGE_VIEW_LINK_LABEL = 'Open in Merge View';

type MergeUpdateLevel = 'required' | 'recommended' | 'suggested' | 'mandatory';

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

const mergeMessagePatterns = [
    {
        pattern: /update\s+(required|recommended|suggested|mandatory)\s+for\s+file\s+'([^']+)'/i,
        getLocalPath: (match: RegExpExecArray) => match[2],
        getUpdateLevel: (match: RegExpExecArray) => match[1],
    },
] as const;

const mergeComponentRegex = /(?:for|from)\s+component\s+'([^']+)'/i;
const generatorMissingPattern = /cgen file was not found,\s*run generator '([^']+)' for context '([^']+)'/i;

const queryActionPatterns: ReadonlyArray<{ pattern: RegExp; action: 'components-packs' | 'find-in-files' }> = [
    { pattern: /dependency validation for context '([^']+)' failed:/, action: 'components-packs' },
    { pattern: /\/([^/\s']+\.[^/\s']+)/, action: 'find-in-files' },
    { pattern: /'([^']+)'/, action: 'find-in-files' },
    { pattern: /([A-Za-z0-9_.-]+::[A-Za-z0-9_.-]+(@[A-Za-z0-9_.-]+)*)/, action: 'find-in-files' },
    { pattern: /([A-Za-z0-9_.-]+@[A-Za-z0-9_.-]*)/, action: 'find-in-files' },
];

export class ProblemDiagnosticActionResolver {
    public resolve(context: ProblemDiagnosticActionContext): ProblemDiagnosticActionResult | undefined {
        return this.resolveMergeAction(context)
            ?? this.resolveGeneratorMissingAction(context)
            ?? this.resolveManageComponentsAction(context)
            ?? this.resolveGenericSearchAction(context);
    }

    public createMergeDiagnosticAction(message: string, diagnosticFilePath: string): ProblemDiagnosticActionResult | undefined {
        const merge = this.parseMergeMessage(message);
        if (!merge) {
            return undefined;
        }

        const componentId = mergeComponentRegex.exec(message)?.[1];
        const localPath = this.isAbsoluteFilePath(merge.localPath) ? merge.localPath : diagnosticFilePath;

        return {
            message: this.createMergeDiagnosticMessage(localPath, merge.updateLevel, componentId),
            code: {
                value: MERGE_VIEW_LINK_LABEL,
                target: this.createMergeCommandUri(localPath),
            },
        };
    }

    public createMergeCommandUri(localPath: string): vscode.Uri {
        const args = this.encodeCommandArgs([localPath]);
        return vscode.Uri.parse(`command:${MERGE_FILE_COMMAND_ID}?${args}`);
    }

    public isAbsoluteFilePath(filePath: string): boolean {
        return path.isAbsolute(filePath) || path.win32.isAbsolute(filePath);
    }

    private resolveMergeAction(context: ProblemDiagnosticActionContext): ProblemDiagnosticActionResult | undefined {
        return this.createMergeDiagnosticAction(context.message, context.diagnosticFilePath);
    }

    private resolveGeneratorMissingAction(context: ProblemDiagnosticActionContext): ProblemDiagnosticActionResult | undefined {
        if (context.hasLocation) {
            return undefined;
        }

        const match = context.message.match(generatorMissingPattern);
        if (!match) {
            return undefined;
        }

        const [, generator, generatorContext] = match;
        return {
            code: {
                value: 'Run Generator',
                target: this.createRunGeneratorCommandUri(generator, generatorContext),
            },
        };
    }

    private resolveManageComponentsAction(context: ProblemDiagnosticActionContext): ProblemDiagnosticActionResult | undefined {
        if (context.hasLocation) {
            return undefined;
        }

        const queryAction = this.findQueryActionInMessage(context.message, 'components-packs');
        if (!queryAction) {
            return undefined;
        }

        const args = this.encodeCommandArgs([{ type: 'context', value: queryAction.query }]);
        return {
            code: {
                value: 'Manage Components',
                target: vscode.Uri.parse(`command:${MANAGE_COMPONENTS_PACKS_COMMAND_ID}?${args}`),
            },
        };
    }

    private resolveGenericSearchAction(context: ProblemDiagnosticActionContext): ProblemDiagnosticActionResult | undefined {
        if (context.hasLocation) {
            return undefined;
        }

        const queryAction = this.findQueryActionInMessage(context.message, 'find-in-files');
        if (!queryAction) {
            return undefined;
        }

        const args = this.encodeFindInFilesArgs(queryAction.query);
        return {
            code: {
                value: 'Find in Files',
                target: vscode.Uri.parse(`command:workbench.action.findInFiles?${args}`),
            },
        };
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

    private createRunGeneratorCommandUri(generator: string, context: string): vscode.Uri {
        const args = this.encodeCommandArgs([{ generator, context }]);
        return vscode.Uri.parse(`command:${RUN_GENERATOR_COMMAND_ID}?${args}`);
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
