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

import { PackScopePreset, PackScopePresetMap } from './core-tools/client/packs_pb';
import * as path from 'path';
import * as vscode from 'vscode';
import { CONFIG_USE_WEBSERVICES, OUTPUT_DIRECTORY } from './manifest';
import { SolutionManager } from './solutions/solution-manager';
import { ConfigurationProvider } from './vscode-api/configuration-provider';
import { CTreeItem, ITreeItem } from './generic/tree-item';
import { getCmsisPackRoot } from './utils/path-utils';

export const isUri = (uri: unknown): uri is vscode.Uri => !!uri && (uri as vscode.Uri).path !== undefined && (uri as vscode.Uri).fsPath !== undefined;

export function isWebAddress(str: string): boolean {
    const urlPattern = /^(http:\/\/|https:\/\/|www\.)/;
    return urlPattern.test(str);
}

let configurationProvider: ConfigurationProvider | undefined = undefined;
let solutionManager: SolutionManager | undefined = undefined;

export const initUtils = (configProvider: ConfigurationProvider, solManager?: SolutionManager) => {
    configurationProvider = configProvider;
    solutionManager = solManager;
};

export const isUseWebServices = (): boolean => {
    const en = configurationProvider?.getConfigVariable<boolean>(CONFIG_USE_WEBSERVICES) ?? true;
    return en;
};

export const getOutputDirectory = (): string | undefined => {
    const solutionPath = solutionManager?.getCsolution()?.solutionDir;
    const outputDirectory = configurationProvider?.getConfigVariable<string>(OUTPUT_DIRECTORY) ?? undefined;
    return (outputDirectory && outputDirectory.length > 0 && solutionPath && solutionPath.length > 0)
        ? path.join(solutionPath, outputDirectory)
        : undefined;
};

export const getActiveTargetSetName = () => {
    return solutionManager?.getCsolution()?.getActiveTargetSetName();
};

export function getPackScopePreset(): PackScopePresetMap[keyof PackScopePresetMap] {
    return PackScopePreset.PACK_SCOPE_PRESET_LATEST;
}

export function areMapsEqual<K, V>(map1: Map<K, V>, map2: Map<K, V>): boolean {
    if (map1.size !== map2.size) {
        return false;
    }

    for (const [key, value] of map1) {
        if (!map2.has(key) || map2.get(key) !== value) {
            return false;
        }
    }
    return true;
}

export function buildDocFilePath(docFile?: ITreeItem<CTreeItem>): string | undefined {
    let filePath = docFile?.getValue();
    if (!filePath) {
        return undefined;
    }
    const bURl = isWebAddress(filePath);
    if (!bURl) {
        filePath = docFile?.resolvePath(filePath.replace('${CMSIS_PACK_ROOT}', getCmsisPackRoot()));
    }
    return filePath;
}

export const extendEnvWithCmsisSettings = (environment: NodeJS.ProcessEnv): NodeJS.ProcessEnv => {
    return {
        ...environment,
        CMSIS_PACK_ROOT: getCmsisPackRoot(environment)
    };
};
