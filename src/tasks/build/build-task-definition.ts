/**
 * Copyright 2025-2026 Arm Limited
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

import * as vscode from 'vscode';
import { PACKAGE_NAME } from '../../manifest';
import { getActiveTargetSetName, isUri } from '../../util';
import { COutlineItem } from '../../views/solution-outline/tree-structure/solution-outline-item';

export type BuildTaskDefinition = {
    readonly type: string;
    solution?: string;
    clean?: boolean;
    buildOutputVerbosity?: BuildOutputVerbosity;
    intermediateDirectory?: string;
    outputDirectory?: string;
    cmakeTarget?: string;
    generator?: string;
    rebuild?: boolean;
    active?: string;
    updateRte?: boolean;
    jobs?: number;
    toolchain?: string;
    downloadPacks?: boolean;
    schemaCheck?: boolean;
    setup?: boolean;
    west?: boolean;
};

export type BuildOutputVerbosity = 'quiet' | 'normal' | 'verbose' | 'debug';

type UriOrSolutionNode = vscode.Uri | COutlineItem;

const LOCAL_BUILD_TASK_TYPE = `${PACKAGE_NAME}.build`;

function createDefinition(solution?: string) {
    return {
        type: LOCAL_BUILD_TASK_TYPE,
        solution,
        schemaCheck: false,
        active: getActiveTargetSetName(),
    };
}

const createDefinitionFromUri = (uri: vscode.Uri): BuildTaskDefinition => {
    const solution = uri.fsPath;

    if (!solution.endsWith('csolution.yml') && !solution.endsWith('csolution.yaml')) {
        throw new Error(`Building ${solution} is not supported`);
    }

    return createDefinition(solution);
};

const createDefaultDefinition = (solutionPath: string): BuildTaskDefinition => {
    return createDefinition(solutionPath);
};

export const createLocalDefinitionFromUriOrSolutionNode = (
    uriOrSolutionNode: UriOrSolutionNode | undefined,
    solutionPath: string
): BuildTaskDefinition => {
    if (isUri(uriOrSolutionNode)) {
        return createDefinitionFromUri(uriOrSolutionNode);
    }
    return createDefaultDefinition(solutionPath);
};
