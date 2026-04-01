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
import { SolutionManager } from '../../solutions/solution-manager';
import { BuildTaskDefinition, createLocalDefinitionFromUriOrSolutionNode, BuildLogLevel } from './build-task-definition';
import * as manifest from '../../manifest';
import { ConfigurationProvider } from '../../vscode-api/configuration-provider';
import { COutlineItem } from '../../views/solution-outline/tree-structure/solution-outline-item';


type UriOrSolutionNode = vscode.Uri | COutlineItem;

export interface BuildTaskDefinitionBuilder {
    createDefinitionFromUriOrSolutionNode(action: 'build' | 'clean' | 'rebuild' | 'setup', uriOrSolutionNode?: UriOrSolutionNode): Promise<BuildTaskDefinition>
}

export class BuildTaskDefinitionBuilderImpl implements BuildTaskDefinitionBuilder {
    public constructor(
        private readonly solutionManager: SolutionManager,
        private readonly configProvider: ConfigurationProvider,
    ) {}

    private getActiveSolutionPath(): string {
        const solutionPath = this.solutionManager.getCsolution()?.solutionPath;

        if (!solutionPath) {
            throw new Error('No active solution set');
        }

        return solutionPath;
    }

    private getBuildLogLevel(): BuildLogLevel {
        const level = this.configProvider.getConfigVariable<BuildLogLevel>(manifest.CONFIG_BUILD_LOG_LEVEL);
        if (typeof level !== 'string') {
            return 'normal';
        }
        return level;
    }

    private isDownloadPacksEnabled(): boolean {
        return this.configProvider.getConfigVariable<boolean>(manifest.CONFIG_DOWNLOAD_MISSING_PACKS) ?? true;
    }

    public async createDefinitionFromUriOrSolutionNode(action: 'build' | 'clean' | 'rebuild' | 'setup', uriOrSolutionNode?: UriOrSolutionNode): Promise<BuildTaskDefinition> {
        const solutionPath = this.getActiveSolutionPath();
        return {
            ...createLocalDefinitionFromUriOrSolutionNode(uriOrSolutionNode, solutionPath),
            clean: action === 'clean',
            rebuild: action === 'rebuild',
            setup: action === 'setup',
            buildLogLevel: this.getBuildLogLevel(),
            downloadPacks: this.isDownloadPacksEnabled(),
            cmakeTarget: action === 'setup' ? 'database' : 'all',
            west: this.solutionManager.getCsolution()?.getCproject()?.projectType === 'West'
        };
    }
}
