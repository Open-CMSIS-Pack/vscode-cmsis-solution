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

import { ComponentScope } from '../../data/component-tools';
import { BuildContext } from '../../components-data';
import { buildContextFactory } from '../../components-data.factories';
import { ComponentsState } from './reducer';

export type ManageComponentsStateFactoryOptions = Partial<ComponentsState> & {
    /**
     * Used to populate available and active build contexts and current target is these are not
     * otherwise set in the options.
     */
    defaultBuildContext?: BuildContext;
}

export const manageComponentsStateFactory = (options?: ManageComponentsStateFactoryOptions): ComponentsState => {
    const { currentTarget, defaultBuildContext, ...otherOptions } = options ?? {};
    const buildContext: BuildContext = defaultBuildContext ?? buildContextFactory();

    return {
        currentTarget: currentTarget ?? { type: 'one', target: buildContext.targetType },
        cClasses: { type: 'loading' },
        expandedGroups: [],
        showSelectedOnly: false,
        searchText: '',
        packsFilterValue: 'all',
        visibleBundles: {},
        visibleComponentOptions: [],
        selectedProject: undefined,
        availableProjects: [],
        targetTypes: [],
        missingPacks: [],
        solution: { name: '' },
        componentTree: [],
        cbuildPackPath: otherOptions.cbuildPackPath ?? '',
        isDirty: false,
        layers: otherOptions.layers ?? [],
        componentScope: otherOptions.componentScope ?? ComponentScope.Solution,
        stateMessage: otherOptions.stateMessage ?? 'loading',
        errorMessages: otherOptions.errorMessages ?? [],
        availableTargetTypes: otherOptions.availableTargetTypes ?? [],
        selectedTargetType: otherOptions.selectedTargetType ?? otherOptions.availableTargetTypes?.[0] ?? undefined,
        unlilnkRequestStack: otherOptions.unlilnkRequestStack ?? [],
        availablePacks: otherOptions.availablePacks ?? {},
        ...otherOptions,
    };
};
