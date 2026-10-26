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
    /** Activate a solution file or directory in the current workspace using the existing command. */
    activateSolution(solutionPath: string): Promise<void>;
    /** Clear the active solution using the existing command. */
    deactivateSolution(): Promise<void>;
    /** Selected solution's absolute file path, or undefined if none is selected. */
    getSolutionFile(): Promise<string | undefined>;
    /** Available targets in the loaded solution, in declaration order, using <target-type>[@<target-set>]. Returns an empty array when no solution is loaded. */
    getTargets(): Promise<string[]>;
    /** Loaded solution's active target in the format <target-type>[@<target-set>], or an empty string. */
    getActiveTarget(): Promise<string>;
    /** Select an existing, case-sensitive active target in the format <target-type>[@<target-set>]. A bare target type selects its existing unnamed set. Persists selection and requests a refresh. Rejects invalid names, missing solutions and save/refresh failures. Does not wait for conversion to complete. */
    setActiveTarget(activeTarget: string): Promise<void>;
    /** Loaded solution's device name, or an empty string when unavailable. */
    getDeviceName(): Promise<string>;
    /** Loaded solution's board name, or an empty string when unavailable. */
    getBoardName(): Promise<string>;
    /** Loaded solution's device family pack ID, or an empty string when unavailable. */
    getDfpName(): Promise<string>;
    /** Loaded solution's board support pack ID, or an empty string when unavailable. */
    getBspName(): Promise<string>;
    /** Device family pack path with CMSIS_PACK_ROOT expanded, or '<not found>' when unavailable. */
    getDfpPath(): Promise<string>;
    /** Board support pack path with CMSIS_PACK_ROOT expanded, or '<not found>' when unavailable. */
    getBspPath(): Promise<string>;
    /** Current CMSIS pack root path; does not require a solution. */
    getPackRootPath(): Promise<string>;
    /** Loaded solution's cbuild-run file path, or an empty string when unavailable. Does not generate the file. */
    getCbuildRunFile(): Promise<string>;
    /** Return current VS Code window tools-environment YAML, waiting for an in-progress Arm Tools activation. No solution or output file is required. Multi-root workspaces share one environment, not isolated per-folder tools. Arm Tools owns activation and its prompts. */
    getToolsEnvironment(): Promise<string>;
    /** Exact debugger adapter names from debug-adapters.yml, in declaration order, excluding aliases. No solution required. Rejects if the catalog cannot be loaded. */
    getDebuggers(): Promise<string[]>;
    /** Registered toolchains in the resolved window environment, waiting for Arm Tools activation. No solution required; returns [] when none are registered. */
    getToolchains(): Promise<CsolutionApiV3.Toolchain[]>;
    /** Defaults to all: merge local index packs and installed RPC packs. Used and missing scopes require an explicit context in the loaded solution. Missing records preserve original requirements and origins. Catalog queries reject only when every source fails. */
    getPacks(options?: CsolutionApiV3.PackQuery): Promise<CsolutionApiV3.PackQueryResult>;
    /** Discover compatible layer configurations for the loaded solution's active target set. Preserves RPC DiscoverLayers variable fields and ordering. Requires a loaded solution, not successful conversion. Never converts the solution. */
    getLayers(): Promise<CsolutionApiV3.LayerConfiguration[]>;
    /** Install without prompting. The caller must obtain user approval and pass approved: true; otherwise all results are cancelled. Returns one result per requested pack, in input order. */
    installPacks(options: { packs: string[]; approved: boolean }): Promise<CsolutionApiV3.PackInstallResult[]>;
}

export namespace CsolutionApiV3 {
    export interface Toolchain {
        /** Compiler name from the registration variable. */
        name: string;
        /** Semantic version from the registration variable. */
        version: string;
        /** Registered path, without path separator normalization or existence checks. */
        path: string;
        /** Exact environment variable name, such as AC6_TOOLCHAIN_6_24_0. */
        registrationVariable: string;
    }

    export interface LayerVariable {
        name: string;
        clayer: string;
        description?: string;
        settings?: { set: string }[];
        path?: string;
        file?: string;
        'copy-to'?: string;
    }

    export interface LayerConfiguration {
        variables: LayerVariable[];
    }

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

    export type PackInstallResult = {
        pack: string;
        status: 'installed' | 'failed' | 'cancelled';
        path?: string;
        error?: string;
    };
}
