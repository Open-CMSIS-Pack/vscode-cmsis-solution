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

import { solutionManagerFactory } from '../../solutions/solution-manager.factories';
import { BuildTaskDefinitionBuilderImpl } from './build-task-definition-builder';
import * as manifest from '../../manifest';
import { configurationProviderFactory } from '../../vscode-api/configuration-provider.factories';

describe('BuildTaskDefinitionBuilderImpl', () => {
    describe('createDefinitionFromUriOrSolutionNode', () => {
        it('builds a build definition', async () => {
            const solutionManager = solutionManagerFactory();
            const configProvider = configurationProviderFactory();
            const buildTaskDefinitionBuilder = new BuildTaskDefinitionBuilderImpl(
                solutionManager,
                configProvider,
            );

            const taskDefinition = await buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode('build');

            expect(taskDefinition).toEqual({
                type: 'cmsis-csolution.build',
                solution: solutionManager.getCsolution()?.solutionPath,
                schemaCheck: false,
                setup: false,
                clean: false,
                rebuild: false,
                buildLogLevel: 'normal',
                downloadPacks: true,
                active: undefined,
                cmakeTarget: 'all',
                west: false,
            });
        });

        it('builds a build definition if offline mode is configured', async () => {
            const solutionManager = solutionManagerFactory();
            const configProvider = configurationProviderFactory();
            configProvider.getConfigVariable.mockReturnValue(false);
            const buildTaskDefinitionBuilder = new BuildTaskDefinitionBuilderImpl(
                solutionManager,
                configProvider,
            );

            const taskDefinition = await buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode('build');

            expect(configProvider.getConfigVariable).toHaveBeenCalledWith(manifest.CONFIG_DOWNLOAD_MISSING_PACKS);
            expect(taskDefinition).toEqual({
                type: 'cmsis-csolution.build',
                solution: solutionManager.getCsolution()?.solutionPath,
                schemaCheck: false,
                setup: false,
                clean: false,
                rebuild: false,
                buildLogLevel: false,
                downloadPacks: false,
                active: undefined,
                cmakeTarget: 'all',
                west: false,
            });
        });


        it('adds the rebuild: true if action argument is "rebuild"', async () => {
            const solutionManager = solutionManagerFactory();
            const configProvider = configurationProviderFactory();
            const buildTaskDefinitionBuilder = new BuildTaskDefinitionBuilderImpl(
                solutionManager,
                configProvider,
            );

            const taskDefinition = await buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode('rebuild');

            expect(taskDefinition).toEqual({
                type: 'cmsis-csolution.build',
                solution: solutionManager.getCsolution()?.solutionPath,
                schemaCheck: false,
                setup: false,
                clean: false,
                rebuild: true,
                buildLogLevel: 'normal',
                downloadPacks: true,
                active: undefined,
                cmakeTarget: 'all',
                west: false,
            });
        });

        it('adds the clean: true if action argument is "clean"', async () => {
            const solutionManager = solutionManagerFactory();
            const configProvider = configurationProviderFactory();
            const buildTaskDefinitionBuilder = new BuildTaskDefinitionBuilderImpl(
                solutionManager,
                configProvider,
            );

            const taskDefinition = await buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode('clean');

            expect(taskDefinition).toEqual({
                type: 'cmsis-csolution.build',
                solution: solutionManager.getCsolution()?.solutionPath,
                schemaCheck: false,
                setup: false,
                clean: true,
                rebuild: false,
                buildLogLevel: 'normal',
                downloadPacks: true,
                active: undefined,
                cmakeTarget: 'all',
                west: false,
            });
        });

        it('setup: call the cbuild setup command', async () => {
            const solutionManager = solutionManagerFactory();
            const configProvider = configurationProviderFactory();
            const buildTaskDefinitionBuilder = new BuildTaskDefinitionBuilderImpl(
                solutionManager,
                configProvider,
            );

            const taskDefinition = await buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode('setup');

            expect(taskDefinition).toEqual({
                type: 'cmsis-csolution.build',
                solution: solutionManager.getCsolution()?.solutionPath,
                schemaCheck: false,
                setup: true,
                clean: false,
                rebuild: false,
                buildLogLevel: 'normal',
                downloadPacks: true,
                active: undefined,
                cmakeTarget: 'database',
                west: false,
            });
        });

        it('throws an error if there is no active solution', () => {
            const solutionManager = solutionManagerFactory();
            solutionManager.getCsolution.mockReturnValue(undefined);
            const configProvider = configurationProviderFactory();
            const buildTaskDefinitionBuilder = new BuildTaskDefinitionBuilderImpl(
                solutionManager,
                configProvider,
            );

            const createDefinition = async () => await buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode('build');

            expect(createDefinition).rejects.toThrow('No active solution set');
        });

        it('reads buildLogLevel from configuration if non-default value is set', async () => {
            const solutionManager = solutionManagerFactory();
            const configProvider = configurationProviderFactory();
            configProvider.getConfigVariable.mockImplementation((name: string) => {
                return (name === manifest.CONFIG_BUILD_LOG_LEVEL) ? 'verbose' : undefined;
            });
            const buildTaskDefinitionBuilder = new BuildTaskDefinitionBuilderImpl(
                solutionManager,
                configProvider,
            );

            const taskDefinition = await buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode('build');

            expect(taskDefinition.buildLogLevel).toBe('verbose');   
        });
    });
});
