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

// TODO: find out if this module is required (except the configuring of vcpkg)

import { EnvironmentManagerApiV1, Package as EnvironmentManagerPackage } from '@arm-software/vscode-environment-manager';
import * as semver from 'semver';
import { Uri } from 'vscode';
import { ExtensionApiProvider } from '../vscode-api/extension-api-provider';
import {
    armClangRequirement,
    cmakeRequirement,
    mdkToolboxRequirement,
    ninjaRequirement,
    toolboxRequirement,
} from './default-tools-dependencies';

export type PackageInRegistry = {
    id: string;
    registry: string;
}

export type PackageRequirement = PackageInRegistry & { version: string }

export const requirementForCompiler: { [key in string]?: PackageRequirement } = {
    AC6: armClangRequirement,
};

const findLatestMatchingReleaseVersion = (requirement: PackageRequirement, releases: EnvironmentManagerPackage['releases']): string | undefined => {
    let latestMatchingVersion: string | undefined;

    for (const release of releases) {
        try {
            const majorVersionMatches = semver.major(release.version) === semver.major(requirement.version.replace(/\^/g, ''));
            const isNewer = !latestMatchingVersion || semver.gt(release.version, latestMatchingVersion);

            if (majorVersionMatches && isNewer) {
                latestMatchingVersion = release.version;
            }
        } catch (error) {
            console.warn(
                'An error occurred while reading packages to create vcpkg-configuration.json',
                error
            );
        }
    }

    return latestMatchingVersion;
};

export const resolvePackageRequirement = (
    availablePackages: EnvironmentManagerPackage[],
    requirement: PackageRequirement,
): PackageToInstall => {
    const matchingPackage = availablePackages.find(({ id, registry }) => id === requirement.id && registry === requirement.registry);
    const latestMatchingVersion = matchingPackage && findLatestMatchingReleaseVersion(requirement, matchingPackage.releases);

    if (!latestMatchingVersion) {
        console.warn(
            `While creating vcpkg-configuration.json, could not find a valid version for dependency ${requirement.id} in registry ${requirement.registry}`
        );
    }

    return {
        id: requirement.id,
        registry: requirement.registry,
        version: latestMatchingVersion ?? '*',
    };
};

export type PackageToInstall = PackageInRegistry & { version: string }

export const determinePackagesToInstallForSolution = (
    availablePackages: EnvironmentManagerPackage[],
    compilers: string[],
): PackageToInstall[] => {
    const compilerRequirements = compilers
        .map(compiler => requirementForCompiler[compiler])
        .filter((maybeRequirement): maybeRequirement is PackageRequirement => !!maybeRequirement);

    const packageRequirements = [
        toolboxRequirement,
        cmakeRequirement,
        ninjaRequirement,
        mdkToolboxRequirement,
        ...compilerRequirements,
    ];

    if (!compilerRequirements.length) {
        packageRequirements.push(armClangRequirement);
    }

    return packageRequirements.map(requirement => resolvePackageRequirement(availablePackages, requirement));
};

export type ConfigureVcpkgForSolution = (solutionRootUri: Uri, compilers: string[]) => Promise<void>;

export const getConfigureVcpkgForSolution = (
    environmentManagerApiProvider: ExtensionApiProvider<Pick<EnvironmentManagerApiV1, 'listPackages' | 'installPackage'>>,
): ConfigureVcpkgForSolution => async (solutionRootUri, compilers) => {
    const environmentManagerApi = await environmentManagerApiProvider.activateIfEnabled();
    if (environmentManagerApi) {

        const availablePackages = await environmentManagerApi.listPackages();
        const packagesToInstall = determinePackagesToInstallForSolution(availablePackages, compilers);

        for (const packageToInstall of packagesToInstall) {
            await environmentManagerApi.installPackage(solutionRootUri, packageToInstall.registry, packageToInstall.id, packageToInstall.version);
        }
    }
};
