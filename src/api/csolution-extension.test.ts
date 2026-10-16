/**
 * Copyright 2023-2026 Arm Limited
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

import 'jest';
import { Disposable, ExtensionContext } from 'vscode';
import { CsolutionExtensionImpl } from './csolution-extension';
import { BuildTaskProvider } from '../tasks/build/build-task-provider';
import { SolutionCreator } from '../solutions/solution-creator';
import { DataManager } from '../data-manager/data-manager';

describe('CsolutionExtension', () => {
    let extension: CsolutionExtensionImpl;
    let context: { subscriptions: Disposable[] };

    beforeEach(async () => {
        context = { subscriptions: [] };

        extension = new CsolutionExtensionImpl(
            {} as SolutionCreator,
            {} as BuildTaskProvider,
            {} as DataManager,
            { loadState: {} },
            { getToolsEnvironment: jest.fn() },
        );

        await extension.activate(context as unknown as ExtensionContext);
    });

    it('returns the APIv2', () => {
        const api = extension.getApi(2);
        expect(api.getBoards).toBeDefined();
        expect(api).not.toHaveProperty('getToolsEnvironment');
    });

    it('returns independent V3 instances with the established operations', () => {
        const api = extension.getApi(3);
        expect(api).not.toBe(extension.getApi(3));
        expect(api).not.toBe(extension.getApi(2));
        for (const method of ['getBoards', 'getDevices', 'getDraftProjects', 'createNewSolution', 'build', 'getToolsEnvironment']) {
            expect(api).toHaveProperty(method, expect.any(Function));
        }
    });

    it.each([1, 4, 0])('rejects unsupported version %s', version => {
        expect(() => (extension.getApi as (version: number) => unknown)(version))
            .toThrow(`No API version ${version} found`);
    });

    it('disposes', () => {
        const apiV2 = extension.getApi(2);
        const apiV3 = extension.getApi(3);
        const disposeV2 = jest.spyOn(apiV2 as typeof apiV2 & Disposable, 'dispose');
        const disposeV3 = jest.spyOn(apiV3, 'dispose');
        context.subscriptions.forEach(({ dispose }) => dispose());
        expect(disposeV2).toHaveBeenCalledTimes(1);
        expect(disposeV3).toHaveBeenCalledTimes(1);
    });
});
