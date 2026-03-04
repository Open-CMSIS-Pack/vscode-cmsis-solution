/**
 * Copyright 2024-2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import 'jest';
import { it } from '@jest/globals';
import { PackageToInstall, determinePackagesToInstallForSolution, getConfigureVcpkgForSolution, requirementForCompiler, resolvePackageRequirement } from './configure-vcpkg';
import { environmentManagerPackageFactory, packageInRegistryFactory, packageRequirementFactory } from './configure-vcpkg.factories';
import { EnvironmentManagerApiV1, Package as EnvironmentManagerPackage } from '@arm-software/vscode-environment-manager';
import { URI as Uri } from 'vscode-uri';
import { extensionApiProviderFactory } from '../vscode-api/extension-api-provider.factories';
import { toolboxRequirement, cmakeRequirement, ninjaRequirement, mdkToolboxRequirement } from './default-tools-dependencies';

describe('Configure vcpkg utilities', () => {
    describe('resolvePackageRequirement', () => {
        it('returns a version of "*" when no available packages match the required registry and id', () => {
            const packageInRegistry = packageInRegistryFactory();
            const packageRequirement = packageRequirementFactory({ ...packageInRegistry, version: '3.0.0' });

            const packageNotMatching = environmentManagerPackageFactory();
            const matchingReleases = [{ version: '3.0.0' }];
            const packageMatchingIdAndVersionNotRegistry = environmentManagerPackageFactory({ id: packageRequirement.id, releases: matchingReleases });
            const packageMatchingRegistryAndVersionNotId = environmentManagerPackageFactory({ registry: packageRequirement.registry, releases: matchingReleases });

            const result = resolvePackageRequirement([
                packageNotMatching,
                packageMatchingIdAndVersionNotRegistry,
                packageMatchingRegistryAndVersionNotId,
            ], packageRequirement);

            const expected: PackageToInstall = { ...packageInRegistry, version: '*' };
            expect(result).toEqual(expected);
        });

        it('returns a version of "*" if no releases have a matching major version', () => {
            const packageInRegistry = packageInRegistryFactory();
            const packageRequirement = packageRequirementFactory({ ...packageInRegistry, version: '3.0.0' });

            const result = resolvePackageRequirement([
                environmentManagerPackageFactory({ ...packageRequirement, releases: [{ version: '2.1.0' }, { version: '4.3.0' }] }),
            ], packageRequirement);

            const expected: PackageToInstall = { ...packageInRegistry, version: '*' };
            expect(result).toEqual(expected);
        });

        it('returns the version for the release with the latest matching major version', () => {
            const packageInRegistry = packageInRegistryFactory();
            const packageRequirement = packageRequirementFactory({ ...packageInRegistry, version: '3.0.0' });

            const result = resolvePackageRequirement([
                environmentManagerPackageFactory({ ...packageRequirement, releases: [
                    { version: '2.1.0' },
                    { version: '3.5.3' },
                    { version: '3.15.0' },
                    { version: '3.0.2' },
                    { version: '4.3.0' },
                ] }),
            ], packageRequirement);

            const expected: PackageToInstall = { ...packageInRegistry, version: '3.15.0' };
            expect(result).toEqual(expected);
        });

        it('does not fail when a release has a non-semver version', () => {
            const packageInRegistry = packageInRegistryFactory();
            const packageRequirement = packageRequirementFactory({ ...packageInRegistry, version: '3.0.0' });

            const result = resolvePackageRequirement([
                environmentManagerPackageFactory({ ...packageRequirement, releases: [
                    { version: '3.5.3' },
                    { version: 'not-semver' },
                ] }),
            ], packageRequirement);

            const expected: PackageToInstall = { ...packageInRegistry, version: '3.5.3' };
            expect(result).toEqual(expected);
        });
    });

    describe('determinePackagesToInstallForNewSolution', () => {
        it.each(
            [{ compiler: 'AC6' }]
        )('determines packages for a $compiler solution', ({ compiler }) => {
            const availablePackages: EnvironmentManagerPackage[] = [
                { ...toolboxRequirement, releases: [{ version: '2.1.0' }] },
                { ...cmakeRequirement, releases: [{ version: '3.1.1' }] },
                { ...ninjaRequirement, releases: [{ version: '1.0.0' }] },
                { ...requirementForCompiler[compiler]!, releases: [{ version: '17.2.0' }] },
            ];
            const output = determinePackagesToInstallForSolution(availablePackages, [compiler]);

            const expected: PackageToInstall[] = [
                resolvePackageRequirement(availablePackages, toolboxRequirement),
                resolvePackageRequirement(availablePackages, cmakeRequirement),
                resolvePackageRequirement(availablePackages, ninjaRequirement),
                resolvePackageRequirement(availablePackages, mdkToolboxRequirement),
                resolvePackageRequirement(availablePackages, requirementForCompiler[compiler]!),
            ];

            expect(output).toEqual(expected);
        });
    });

    describe('getConfigureVcpkgForNewSolution', () => {
        it('does nothing if no environment manager API is provided', async () => {
            const solutionRootUri = Uri.file(__dirname);
            await expect(getConfigureVcpkgForSolution(extensionApiProviderFactory())(solutionRootUri, ['AC6'])).resolves.toBeUndefined();
        });

        it('configures packages for an Arm Compiler solution', async () => {
            const environmentManagerApi: jest.Mocked<Pick<EnvironmentManagerApiV1, 'installPackage' | 'listPackages'>> = {
                listPackages: jest.fn(async () => [
                    { ...toolboxRequirement, releases: [{ version: '2.1.0' }] },
                    { ...cmakeRequirement, releases: [{ version: '3.1.1' }] },
                    { ...ninjaRequirement, releases: [{ version: '1.0.0' }] },
                    { ...requirementForCompiler.AC6!, releases: [{ version: '7.2.0' }] },
                ]),
                installPackage: jest.fn(),
            };

            const solutionRootUri = Uri.file(__dirname);
            await getConfigureVcpkgForSolution(extensionApiProviderFactory(environmentManagerApi))(solutionRootUri, ['AC6']);

            expect(environmentManagerApi.installPackage).toHaveBeenCalledWith(
                solutionRootUri, toolboxRequirement.registry, toolboxRequirement.id, '2.1.0'
            );
            expect(environmentManagerApi.installPackage).toHaveBeenCalledWith(
                solutionRootUri, cmakeRequirement.registry, cmakeRequirement.id, '3.1.1'
            );
            expect(environmentManagerApi.installPackage).toHaveBeenCalledWith(
                solutionRootUri, ninjaRequirement.registry, ninjaRequirement.id, '1.0.0'
            );
            expect(environmentManagerApi.installPackage).toHaveBeenCalledWith(
                solutionRootUri, requirementForCompiler.AC6!.registry, requirementForCompiler.AC6!.id, '*'
            );
        });
    });
});
