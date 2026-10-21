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

import { CsolutionApiV2 } from './csolution-api-v2';

/** API V3 retains the existing V2 operations. */
export interface CsolutionApiV3 extends CsolutionApiV2 {
    dispose(): void;
    /** Return current VS Code window tools-environment YAML, waiting for an in-progress Arm Tools activation. No solution or output file is required. Multi-root workspaces share one environment, not isolated per-folder tools. Arm Tools owns activation and its prompts. */
    getToolsEnvironment(): Promise<string>;
    /** Defaults to all: merge local index packs and installed RPC packs. Used and missing scopes require an explicit context in the loaded solution. Missing records preserve original requirements and origins. Catalog queries reject only when every source fails. */
    getPacks(options?: CsolutionApiV3.PackQuery): Promise<CsolutionApiV3.PackQueryResult>;
}

export namespace CsolutionApiV3 {
    export interface PackFilter {
        /** Case-insensitive literal substring of id or description; missing scope matches the original requirement only. Omitted/empty means no restriction; whitespace is literal. */
        text?: string;
    }

    export interface MissingPackQuery {
        scope: 'missing';
        /** Exact context name in the currently loaded solution's active target set. */
        context: string;
        filter?: PackFilter;
    }

    export type PackQuery = MissingPackQuery | {
        scope?: 'all' | 'installed';
        filter?: PackFilter;
    } | {
        scope: 'used';
        /** Exact context name in the currently loaded solution's active target set. */
        context: string;
        filter?: PackFilter;
    };

    export interface PackData {
        /** Canonical vendor::name@version identifier; absent for missing requirements. */
        id?: string;
        version?: string;
        /** Undefined when installation status is unknown. Used scope sets true only with a matching non-missing resolved RPC reference. */
        installed?: boolean;
        /** Present only when supplied by RPC for this installed pack. */
        path?: string;
        description?: string;
        /** Original requirement and its origin for missing references. */
        pack?: string;
        origin?: string;
        resolvedPack?: string;
    }

    export interface PackQueryResult {
        packs: PackData[];
    }
}
