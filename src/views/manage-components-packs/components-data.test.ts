/**
 * Copyright 2022-2026 Arm Limited
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
import { ComponentRowId } from './data/component-row-id';
import {
    updateComponentInCClasses,
    ComponentReference,
    CClass,
    ComponentOptionId,
    Component,
    componentOptionIdsEqual,
    componentReferencesAreEqual,
    ModifyOrCreateInputs,
    modifyOrCreate, buildContextsEqual,
    componentOptionInContextsAreEqual,
    SelectedComponentOption,
    BuildContext,
    componentReferenceToRowId,
    componentReferenceToOptionId,
    ComponentOptionInContext,
    selectedComponentOptionsAreEqual,
    targetMatches,
    findComponentClass,
    findComponentBundle,
    findComponentGroup,
    pickAllTargetTypes,
    filterAvailableOptionsForTarget,
    CurrentTarget,
    ComponentOption,
    filterSelectedOptionsForTarget,
    filterSelectedOptionAvailableForAllTargets,
    buildOptionId,
    filterAvailableOptionsForPacks,
} from './components-data';
import { buildContextFactory, bundleFactory, cclassFactory, componentFactory, componentOptionFactory, componentOptionIdFactory, groupFactory, selectedComponentOptionFactory } from './components-data.factories';
import { componentRowIdFactory } from './data/component-row-id.factories';

const emptyDocs = { description: '', documentationUrl: '' };
const optionId: ComponentOptionId = { variant: '', vendor: '', version: '1.0.0' };
const optionId2: ComponentOptionId = { variant: '', vendor: '', version: '2.0.0' };
const buildContext: BuildContext = { targetType: 'Test Target', buildType: 'Test Build' };
const TEST_ROW_ID: ComponentRowId = {
    cClass: 'Test CClass',
    bundleName: 'Test bundle',
    group: 'Test Group',
    subGroup: ''
};

describe('Component data functions', () => {
    describe('buildContextsEqual', () => {
        it('returns true if the build contexts are the same', () => {
            expect(buildContextsEqual({ buildType: 'BT', targetType: 'TT' })({ buildType: 'BT', targetType: 'TT' })).toBe(true);
        });

        it('returns false otherwise', () => {
            expect(buildContextsEqual({ buildType: 'BT1', targetType: 'TT1' })({ buildType: 'BT1', targetType: 'TT2' })).toBe(false);
            expect(buildContextsEqual({ buildType: 'BT1', targetType: 'TT1' })({ buildType: 'BT2', targetType: 'TT1' })).toBe(false);
            expect(buildContextsEqual({ buildType: 'BT1', targetType: 'TT1' })({ buildType: 'BT2', targetType: 'TT2' })).toBe(false);
        });
    });

    describe('componentOptionInContextsAreEqual', () => {
        const optionId = { variant: 'Variant', version: 'Version', vendor: 'Vendor', };

        it('returns true if the build contexts and id are equal', () => {
            const optionInContext1: ComponentOptionInContext = {
                id: { ...optionId, ...TEST_ROW_ID },
                buildContext: { buildType: 'Build', targetType: 'Target' },
                origin: { projectId: 'project id', type: 'project' }
            };
            const optionInContext2: ComponentOptionInContext = {
                id: { ...optionId, ...TEST_ROW_ID },
                buildContext: { buildType: 'Build', targetType: 'Target' },
                origin: { projectId: 'project id', type: 'project' }
            };

            const output = componentOptionInContextsAreEqual(optionInContext1)(optionInContext2);
            expect(output).toBe(true);
        });

        it('returns false if the build contexts are not equal', () => {
            const optionInContext1: ComponentOptionInContext = {
                id: { ...optionId, ...TEST_ROW_ID },
                buildContext: { buildType: 'Build 1', targetType: 'Target 1' },
                origin: { projectId: 'project id', type: 'project' }
            };
            const optionInContext2: ComponentOptionInContext = {
                id: { ...optionId, ...TEST_ROW_ID },
                buildContext: { buildType: 'Build 2', targetType: 'Target 2' },
                origin: { projectId: 'project id', type: 'project' }
            };

            const output = componentOptionInContextsAreEqual(optionInContext1)(optionInContext2);
            expect(output).toBe(false);
        });

        it('returns false if the ids are not equal', () => {
            const optionInContext1: ComponentOptionInContext = {
                id: { ...optionId, ...TEST_ROW_ID },
                buildContext: { buildType: 'Build', targetType: 'Target' },
                origin: { projectId: 'project id', type: 'project' }
            };
            const optionInContext2: ComponentOptionInContext = {
                id: { ...optionId2, ...TEST_ROW_ID },
                buildContext: { buildType: 'Build', targetType: 'Target' },
                origin: { projectId: 'project id', type: 'project' }
            };

            const output = componentOptionInContextsAreEqual(optionInContext1)(optionInContext2);
            expect(output).toBe(false);
        });

        it('returns false if the ids have different CClasses', () => {
            const optionInContext1: ComponentOptionInContext = {
                id: { ...optionId, ...TEST_ROW_ID },
                buildContext: { buildType: 'Build', targetType: 'Target' },
                origin: { projectId: 'project id', type: 'project' }
            };

            const optionInContext2: ComponentOptionInContext = {
                id: { ...optionId, ...TEST_ROW_ID, cClass: 'Not the same CClass' },
                buildContext: { buildType: 'Build', targetType: 'Target' },
                origin: { projectId: 'project id', type: 'project' }
            };

            const output = componentOptionInContextsAreEqual(optionInContext1)(optionInContext2);
            expect(output).toBe(false);
        });
    });

    describe('selectedComponentOptionsAreEqual', () => {
        it('returns true if all fields are equal', () => {
            const output = selectedComponentOptionsAreEqual(
                { resolvedOption: optionId, buildContext, reference: { ...TEST_ROW_ID, ...optionId }, origin: { projectId: 'project id', type: 'project' } }
            )({ resolvedOption: optionId, buildContext, reference: { ...TEST_ROW_ID, ...optionId }, origin: { projectId: 'project id', type: 'project' } });

            expect(output).toBe(true);
        });

        it('returns false if one option is resolved but the other is not', () => {
            const output = selectedComponentOptionsAreEqual(
                { resolvedOption: optionId, buildContext, reference: { ...TEST_ROW_ID, ...optionId }, origin: { projectId: 'project id', type: 'project' } }
            )({ resolvedOption: undefined, buildContext, reference: { ...TEST_ROW_ID, ...optionId }, origin: { projectId: 'project id', type: 'project' } });

            expect(output).toBe(false);
        });

        it('returns false if the resolved options are not equal', () => {
            const output = selectedComponentOptionsAreEqual(
                { resolvedOption: { vendor: 'Not me', variant: '', version: '' }, buildContext, reference: { ...TEST_ROW_ID, ...optionId }, origin: { projectId: 'project id', type: 'project' } }
            )({ resolvedOption: optionId, buildContext, reference: { ...TEST_ROW_ID, ...optionId }, origin: { projectId: 'project id', type: 'project' } });

            expect(output).toBe(false);
        });

        it('returns false if the build contexts are not equal', () => {
            const output = selectedComponentOptionsAreEqual(
                { resolvedOption: optionId, buildContext, reference: { ...TEST_ROW_ID, ...optionId }, origin: { projectId: 'project id', type: 'project' } }
            )({ resolvedOption: optionId, buildContext: { targetType: 'Another one', buildType: 'Not me' }, reference: { ...TEST_ROW_ID, ...optionId }, origin: { projectId: 'project id', type: 'project' } });

            expect(output).toBe(false);
        });

        it('returns false if the reference options are different', () => {
            const output = selectedComponentOptionsAreEqual(
                { resolvedOption: optionId, buildContext, reference: { ...TEST_ROW_ID, vendor: 'Not me', variant: '', version: '' }, origin: { projectId: 'project id', type: 'project' } }
            )({ resolvedOption: optionId, buildContext, reference: { ...TEST_ROW_ID, ...optionId }, origin: { projectId: 'project id', type: 'project' } });

            expect(output).toBe(false);
        });

        it('returns false if the origins are different', () => {
            const output = selectedComponentOptionsAreEqual(
                { resolvedOption: optionId, buildContext, reference: { ...TEST_ROW_ID, ...optionId }, origin: { projectId: 'project id 1', type: 'project' } }
            )({ resolvedOption: optionId, buildContext, reference: { ...TEST_ROW_ID, ...optionId }, origin: { projectId: 'project id 2', type: 'project' } });

            expect(output).toBe(false);
        });
    });

    describe('targetMatches', () => {
        const targetType = 'Filter Target';

        it('returns true for contexts matching the given target', () => {
            const matching: SelectedComponentOption = { resolvedOption: optionId, buildContext: { targetType, buildType: 'B type' }, reference: { ...TEST_ROW_ID, ...optionId }, origin: { projectId: 'project id', type: 'project' } };
            expect(targetMatches(targetType)(matching)).toBe(true);
        });

        it('returns false for contexts that do not match the given target', () => {
            const notMatching: SelectedComponentOption = { resolvedOption: optionId, buildContext: { targetType: 'Not me', buildType: 'B type' }, reference: { ...TEST_ROW_ID, ...optionId }, origin: { projectId: 'project id', type: 'project' } };
            expect(targetMatches(targetType)(notMatching)).toBe(false);
        });
    });

    describe('filterSelectedOptionsForTarget', () => {
        const targetType = 'Target target type';
        const otherTargetType = 'Other target type';
        const buildType1 = 'Build Type 1';
        const buildType2 = 'Build Type 2';
        const availableBuildContexts: BuildContext[] = [
            { targetType, buildType: buildType1 },
            { targetType, buildType: buildType2 },
            { targetType: otherTargetType, buildType: buildType1 },
            { targetType: otherTargetType, buildType: buildType2 },
        ];
        const optionId1 = { variant: 'Another Variant', vendor: 'Vendor', version: '1.0.1' };
        const optionId2 = { variant: 'Another Variant', vendor: 'Another Vendor', version: '' };
        const availableOptions: ComponentOption[] = [
            componentOptionFactory({ id: optionId1, ...emptyDocs, buildContext: availableBuildContexts[0] }),
            componentOptionFactory({ id: optionId2, ...emptyDocs, buildContext: availableBuildContexts[3] }),
            componentOptionFactory({ id: optionId1, ...emptyDocs, buildContext: availableBuildContexts[3] }),
        ];

        describe('when one target is shown', () => {
            const currentTarget: CurrentTarget = { type: 'one', target: targetType };
            const targetSpecificAvailableOptions = filterAvailableOptionsForTarget(availableOptions, currentTarget, availableBuildContexts);

            it('returns the selected component in the given build context', () => {
                const selectedOptions: SelectedComponentOption[] = [
                    {
                        resolvedOption: optionId1,
                        buildContext: availableBuildContexts[2],
                        reference: { ...TEST_ROW_ID, variant: 'Another Variant', vendor: '', version: '1.0.1' },
                        origin: { projectId: 'project', type: 'project' }
                    },
                    {
                        resolvedOption: optionId1,
                        buildContext: availableBuildContexts[3],
                        reference: { ...TEST_ROW_ID, variant: 'Another Variant', vendor: '', version: '1.0.1' },
                        origin: { projectId: 'project', type: 'project' }
                    },
                    {
                        resolvedOption: { variant: 'Library', vendor: 'Vendor', version: '1.0.1' },
                        buildContext: availableBuildContexts[0],
                        reference: { ...TEST_ROW_ID, variant: '', vendor: '', version: '1.0.1' },
                        origin: { projectId: 'project', type: 'project' }
                    },
                    {
                        resolvedOption: { variant: 'Library', vendor: 'Vendor', version: '1.0.1' },
                        buildContext: availableBuildContexts[1],
                        reference: { ...TEST_ROW_ID, variant: '', vendor: '', version: '1.0.1' },
                        origin: { projectId: 'project', type: 'project' }
                    }
                ];

                const output = filterSelectedOptionsForTarget(selectedOptions, currentTarget, targetSpecificAvailableOptions, availableBuildContexts);

                const expected: typeof output = [
                    {
                        resolvedOption: { variant: 'Library', vendor: 'Vendor', version: '1.0.1' },
                        buildContext: availableBuildContexts[0],
                        reference: { ...TEST_ROW_ID, variant: '', vendor: '', version: '1.0.1' },
                        origin: { projectId: 'project', type: 'project' }
                    },
                    {
                        resolvedOption: { variant: 'Library', vendor: 'Vendor', version: '1.0.1' },
                        buildContext: availableBuildContexts[1],
                        reference: { ...TEST_ROW_ID, variant: '', vendor: '', version: '1.0.1' },
                        origin: { projectId: 'project', type: 'project' }
                    }
                ];
                expect(output).toEqual(expected);
            });

            it('returns an empty array if there is no selection: their is no component in selected options with the target type', () => {
                const selectedOptions: SelectedComponentOption[] = [
                    {
                        resolvedOption: optionId1,
                        buildContext: availableBuildContexts[2],
                        reference: { ...TEST_ROW_ID, variant: 'Another Variant', vendor: '', version: '1.0.1' },
                        origin: { projectId: 'project', type: 'project' }
                    },
                    {
                        resolvedOption: optionId1,
                        buildContext: availableBuildContexts[3],
                        reference: { ...TEST_ROW_ID, variant: 'Another Variant', vendor: '', version: '1.0.1' },
                        origin: { projectId: 'project', type: 'project' }
                    },
                    {
                        resolvedOption: { variant: 'Library', vendor: 'Vendor', version: '1.0.1' },
                        buildContext: availableBuildContexts[2],
                        reference: { ...TEST_ROW_ID, variant: 'Another Variant', vendor: '', version: '1.0.1' },
                        origin: { projectId: 'project', type: 'project' }
                    }
                ];

                const output = filterSelectedOptionsForTarget(selectedOptions, currentTarget, targetSpecificAvailableOptions, availableBuildContexts);

                expect(output).toEqual([]);
            });
        });

        describe('when all targets are shown', () => {
            const currentTarget: CurrentTarget = { type: 'all' };
            const targetSpecificAvailableOptions = filterAvailableOptionsForTarget(availableOptions, currentTarget, availableBuildContexts);

            it('return an empty array when a selected option does not match all targets || selected option not available for all targets', () => {
                const limitedOptions: ComponentOption[] = [
                    componentOptionFactory({ id: optionId1, buildContext: { targetType, buildType: buildType1 } }),
                    componentOptionFactory({ id: optionId1, buildContext: { targetType, buildType: buildType2 } }),
                    componentOptionFactory({ id: optionId2, buildContext: { targetType: otherTargetType, buildType: buildType1 } }),
                ];
                const targetSpecificComponentOption = filterAvailableOptionsForTarget(limitedOptions, currentTarget, availableBuildContexts);
                const selectedOptions: SelectedComponentOption[] = [
                    {
                        resolvedOption: optionId1,
                        buildContext: availableBuildContexts[2],
                        reference: { ...TEST_ROW_ID, ...optionId1 },
                        origin: { projectId: 'project', type: 'project' }
                    },
                ];

                const output = filterSelectedOptionsForTarget(selectedOptions, currentTarget, targetSpecificComponentOption, availableBuildContexts);

                expect(output).toEqual([]);
            });

            it('return a selected option that resolved to an available option that has at least one build context that matches all target types.', () => {
                const selectedOptions: SelectedComponentOption[] = [
                    {
                        resolvedOption: optionId1,
                        buildContext: availableBuildContexts[0],
                        reference: { ...TEST_ROW_ID, ...optionId1 },
                        origin: { projectId: 'project', type: 'project' }
                    },
                    {
                        resolvedOption: optionId2,
                        buildContext: availableBuildContexts[3],
                        reference: { ...TEST_ROW_ID, ...optionId2 },
                        origin: { projectId: 'project', type: 'project' }
                    },
                ];

                const output = filterSelectedOptionsForTarget(selectedOptions, currentTarget, targetSpecificAvailableOptions, availableBuildContexts);

                const expected: typeof output = [{
                    resolvedOption: optionId1,
                    buildContext: availableBuildContexts[0],
                    reference: { ...TEST_ROW_ID, ...optionId1 },
                    origin: { projectId: 'project', type: 'project' }
                }];

                expect(output).toEqual(expected);
            });

            it('return a selected option that matches each target type, regardless of whether it resolved or not', () => {
                const selectedOptions: SelectedComponentOption[] = [
                    {
                        resolvedOption: undefined,
                        buildContext: availableBuildContexts[0],
                        reference: { ...TEST_ROW_ID, ...optionId1 },
                        origin: { projectId: 'project', type: 'project' }
                    },
                    {
                        resolvedOption: undefined,
                        buildContext: availableBuildContexts[3],
                        reference: { ...TEST_ROW_ID, ...optionId2 },
                        origin: { projectId: 'project', type: 'project' }
                    },
                    {
                        resolvedOption: undefined,
                        buildContext: availableBuildContexts[2],
                        reference: { ...TEST_ROW_ID, ...optionId1 },
                        origin: { projectId: 'project', type: 'project' }
                    },
                ];

                const output = filterSelectedOptionsForTarget(selectedOptions, currentTarget, [], availableBuildContexts);

                const expected: typeof output = [
                    {
                        resolvedOption: undefined,
                        buildContext: availableBuildContexts[0],
                        reference: { ...TEST_ROW_ID, ...optionId1 },
                        origin: { projectId: 'project', type: 'project' }
                    },
                    {
                        resolvedOption: undefined,
                        buildContext: availableBuildContexts[2],
                        reference: { ...TEST_ROW_ID, ...optionId1 },
                        origin: { projectId: 'project', type: 'project' }
                    },
                ];

                expect(output).toEqual(expected);
            });
        });

        it('returns the one selected option when there are no available options and there is only one build context', () => {
            const selectedOption = selectedComponentOptionFactory();
            const output = filterSelectedOptionsForTarget([selectedOption], { type: 'all' }, [], [selectedOption.buildContext]);
            expect(output).toEqual([selectedOption]);
        });
    });

    describe('filterAvailableOptionsForTarget', () => {
        const options = [
            componentOptionFactory({ id: optionId, ...emptyDocs, buildContext: { targetType: 'target1', buildType: 'build1' } }),
            componentOptionFactory({ id: optionId2, ...emptyDocs, buildContext: { targetType: 'target2', buildType: 'build2' } }),
            componentOptionFactory({ id: optionId2, ...emptyDocs, buildContext: { targetType: 'target1', buildType: 'build2' } }),
            componentOptionFactory({ id: optionId, ...emptyDocs, buildContext: { targetType: 'target1', buildType: 'build1' } })
        ];
        const availableBuildContexts = [buildContextFactory({ buildType: 'build1', targetType: 'target1' }), buildContextFactory({ buildType: 'build2', targetType: 'target2' })];

        it('returns a list of options of currentTarget', () => {
            const currentTarget: CurrentTarget = { type: 'one', target: 'target1' };

            const result = filterAvailableOptionsForTarget(options, currentTarget, availableBuildContexts);

            const expected = [
                options[0],
                options[2],
                options[3],
            ];
            expect(result).toEqual(expected);
        });

        it('returns a list of options of all Targets available', () => {
            const currentTarget: CurrentTarget = { type: 'all' };

            const result = filterAvailableOptionsForTarget(options, currentTarget, availableBuildContexts);

            const expected = [
                options[1],
                options[2],
            ];
            expect(result).toEqual(expected);
        });
    });

    describe('filterAvailableOptionsForPacks', () => {
        it('returns options in any pack if pack filter accepts "all"', () => {
            const inPackFromSolution = componentOptionFactory({
                packMetadata: { selectedInSolution: true },
            });
            const outsidePackFromSolution = componentOptionFactory({
                packMetadata: { selectedInSolution: false },
            });
            const filter = 'all';

            const result = filterAvailableOptionsForPacks(
                [inPackFromSolution, outsidePackFromSolution],
                filter,
            );

            const expected = [inPackFromSolution, outsidePackFromSolution];
            expect(result).toEqual(expected);
        });

        it('only returns options in solution\'s packs if pack filter requests "solution"', () => {
            const inPackFromSolution = componentOptionFactory({
                packMetadata: { selectedInSolution: true },
            });
            const outsidePackFromSolution = componentOptionFactory({
                packMetadata: { selectedInSolution: false },
            });
            const filter = 'solution';

            const result = filterAvailableOptionsForPacks(
                [inPackFromSolution, outsidePackFromSolution],
                filter,
            );

            const expected = [inPackFromSolution];
            expect(result).toEqual(expected);
        });
    });

    describe('modifyOrCreate', () => {
        interface TestObject {
            name: string;
        }

        const inputs: ModifyOrCreateInputs<TestObject, TestObject> = {
            newItem: { name: 'Fred' },
            predicate: (item: TestObject): item is TestObject => item.name === 'Fred',
            modify: (item: TestObject) => ({ name: `${item.name}++` })
        };

        it('creates a new object when passed an empty array, passing it through the modify function', () => {
            const output = modifyOrCreate(inputs, []);
            expect(output).toEqual([{ name: 'Fred++' }]);
        });

        it('creates a new object when no existing item passes the predicate, passing it through the modify function', () => {
            const output = modifyOrCreate(inputs, [{ name: 'Bob' }]);
            expect(output).toEqual([{ name: 'Bob' }, { name: 'Fred++' }]);
        });

        it('modifies a matching item in the middle of the array', () => {
            const output = modifyOrCreate(inputs, [
                { name: 'Bob' }, { name: 'Fred' }, { name: 'Poppy' }
            ]);

            expect(output).toEqual([{ name: 'Bob' }, { name: 'Fred++' }, { name: 'Poppy' }]);
        });

        it('modifies a matching item at the end of the array', () => {
            const output = modifyOrCreate(inputs, [
                { name: 'Bob' }, { name: 'Poppy' }, { name: 'Fred' }
            ]);

            expect(output).toEqual([{ name: 'Bob' }, { name: 'Poppy' }, { name: 'Fred++' }]);
        });

        it('returns the input unmodified if newItem is not specified and there are no matches', () => {
            const output = modifyOrCreate({ modify: inputs.modify, predicate: inputs.predicate }, [
                { name: 'Bob' }, { name: 'Poppy' }
            ]);

            expect(output).toEqual([{ name: 'Bob' }, { name: 'Poppy' }]);
        });
    });

    describe('findComponentClass', () => {
        it('returns a matching cclass', () => {
            const targetCClass = cclassFactory();
            const input = [cclassFactory(), targetCClass];
            const output = findComponentClass(input, { cClass: targetCClass.name, bundleName: '', group: '', subGroup: '' });
            expect(output).toEqual(targetCClass);
        });

        it('returns undefined if there are no matching cclasses', () => {
            const input = [cclassFactory(), cclassFactory()];
            const output = findComponentClass(input, { cClass: 'Not gonna find me!', bundleName: '', group: '', subGroup: '' });
            expect(output).toBeUndefined();
        });
    });

    describe('findComponentBundle', () => {
        it('returns a matching bundle', () => {
            const targetBundle = bundleFactory();
            const targetCClass = cclassFactory({ availableBundles: [bundleFactory(), targetBundle] });
            const input = [cclassFactory(), targetCClass];
            const output = findComponentBundle(input, { cClass: targetCClass.name, bundleName: targetBundle.name, group: '', subGroup: '' });
            expect(output).toEqual(targetBundle);
        });

        it('returns undefined if there are no matching cclasses', () => {
            const targetBundle = bundleFactory();
            const input = [cclassFactory(), cclassFactory({ availableBundles: [targetBundle] })];
            const output = findComponentBundle(input, { cClass: 'Not gonna find this one!', bundleName: targetBundle.name, group: '', subGroup: '' });
            expect(output).toBeUndefined();
        });

        it('returns undefined if there are no matching bundles', () => {
            const targetCClass = cclassFactory({ availableBundles: [bundleFactory(), bundleFactory()] });
            const input = [cclassFactory(), targetCClass];
            const output = findComponentBundle(input, { cClass: targetCClass.name, bundleName: 'Not likely to find this one', group: '', subGroup: '' });
            expect(output).toBeUndefined();
        });
    });

    describe('findComponentGroup', () => {
        it('finds a matching group', () => {
            const targetGroup = groupFactory();
            const targetBundle = bundleFactory({ components: [componentFactory(), componentFactory({ name: targetGroup.name }), targetGroup] });
            const targetCClass = cclassFactory({ availableBundles: [bundleFactory(), targetBundle] });
            const input = [cclassFactory(), targetCClass];
            const output = findComponentGroup(input, { cClass: targetCClass.name, bundleName: targetBundle.name, group: targetGroup.name, subGroup: '' });
            expect(output).toEqual(targetGroup);
        });

        it('returns undefined if there are no matching bundles', () => {
            const targetGroup = groupFactory();
            const targetBundle = bundleFactory({ components: [componentFactory(), targetGroup] });
            const targetCClass = cclassFactory({ availableBundles: [bundleFactory(), targetBundle] });
            const input = [cclassFactory(), targetCClass];
            const output = findComponentGroup(input, { cClass: targetCClass.name, bundleName: 'Not gonna find this', group: targetGroup.name, subGroup: '' });
            expect(output).toBeUndefined();
        });

        it('returns undefined if there are no matching groups', () => {
            const targetBundle = bundleFactory({ components: [componentFactory(), groupFactory()] });
            const targetCClass = cclassFactory({ availableBundles: [bundleFactory(), targetBundle] });
            const input = [cclassFactory(), targetCClass];
            const output = findComponentGroup(input, { cClass: targetCClass.name, bundleName: targetBundle.name, group: 'It will not work', subGroup: '' });
            expect(output).toBeUndefined();
        });
    });

    describe('updateComponent', () => {
        it('runs the update function on a matching group level component', () => {
            const rowId: ComponentRowId = { cClass: 'TEST_CLASS', bundleName: 'TEST_BUNDLE', group: 'TEST_GROUP', subGroup: '' };

            const baseComponent: Component = {
                type: 'component',
                name: rowId.group,
                availableOptions: [componentOptionFactory({ id: optionId, buildContext })],
                selectedOptions: []
            };

            const input: CClass[] = [{
                name: rowId.cClass,
                availableBundles: [{
                    name: rowId.bundleName,
                    doc: undefined,
                    components: [{ ...baseComponent, selectedOptions: [{ resolvedOption: undefined, buildContext, reference: { ...TEST_ROW_ID, ...optionId }, origin: { projectId: 'project', type: 'project' } }] }]
                }]
            }];

            const output = updateComponentInCClasses(input, rowId, () => ({ selectedOptions: [] }));

            const expected: CClass[] = [{
                name: rowId.cClass,
                availableBundles: [{
                    name: rowId.bundleName,
                    doc: undefined,
                    components: [{ ...baseComponent, selectedOptions: [] }]
                }]
            }];

            expect(output).toEqual(expected);
        });

        it('runs the update function on a matching sub group level component', () => {
            const rowId: ComponentRowId = { cClass: 'TEST_CLASS', bundleName: 'TEST_BUNDLE', group: 'TEST_GROUP', subGroup: 'TEST_SUB' };

            const baseComponent: Component = {
                type: 'component',
                name: rowId.subGroup,
                availableOptions: [componentOptionFactory({ id: optionId, buildContext })],
                selectedOptions: []
            };

            const input: CClass[] = [{
                name: rowId.cClass,
                availableBundles: [{
                    name: rowId.bundleName,
                    doc: undefined,
                    components: [{
                        type: 'group',
                        docs: [],
                        name: rowId.group,
                        components: [{ ...baseComponent, selectedOptions: [{ resolvedOption: undefined, buildContext, reference: { ...TEST_ROW_ID, ...optionId }, origin: { projectId: 'project', type: 'project' } }] }]
                    }]
                }]
            }];

            const output = updateComponentInCClasses(input, rowId, () => ({ selectedOptions: [] }));

            const expected: CClass[] = [{
                name: rowId.cClass,
                availableBundles: [{
                    name: rowId.bundleName,
                    doc: undefined,
                    components: [{
                        type: 'group',
                        docs: [],
                        name: rowId.group,
                        components: [{ ...baseComponent, selectedOptions: [] }]
                    }]
                }]
            }];

            expect(output).toEqual(expected);
        });

        it('returns the tree unmodified if no classes match', () => {
            const rowId: ComponentRowId = { cClass: 'TEST_CLASS', bundleName: 'TEST_BUNDLE', group: 'TEST_GROUP', subGroup: 'TEST_SUB' };

            const input: CClass[] = [{
                name: 'NON-MATCHING',
                availableBundles: [{
                    name: rowId.bundleName,
                    doc: undefined,
                    components: [{
                        type: 'group',
                        docs: [],
                        name: rowId.group,
                        components: [{
                            type: 'component',
                            name: rowId.subGroup,
                            availableOptions: [componentOptionFactory({ id: optionId, buildContext })],
                            selectedOptions: []
                        }]
                    }]
                }]
            }];

            const output = updateComponentInCClasses(input, rowId, () => ({ selectedOptions: [{ referenceOption: optionId, resolvedOption: undefined, buildContext, reference: { ...TEST_ROW_ID, ...optionId }, origin: { projectId: 'project id', type: 'project' } }] }));
            expect(output).toEqual(input);
        });
    });

    describe('componentOptionIdsEqual', () => {
        const baseId: ComponentOptionId = { variant: 'test-variant', vendor: 'test-vendor', version: 'test-version' };

        it('returns true when vendor, variant and versions are equal', () => {
            const result = componentOptionIdsEqual(baseId)(baseId);
            expect(result).toBe(true);
        });

        it('returns false otherwise', () => {
            expect(componentOptionIdsEqual(baseId)({ ...baseId, vendor: 'another-vendor' })).toBe(false);
            expect(componentOptionIdsEqual(baseId)({ ...baseId, variant: 'another-variant' })).toBe(false);
            expect(componentOptionIdsEqual({ ...baseId, version: 'another-version' })(baseId)).toBe(false);
        });
    });

    describe('componentReferencesAreEqual', () => {
        it('returns true if both references are equal', () => {
            const ref1: ComponentReference = {
                bundleName: 'some bundle',
                cClass: 'some class',
                group: 'some group',
                subGroup: 'some subgroup',
                variant: 'some variant',
                vendor: 'some vendor',
                version: 'some version',
            };
            const ref2: ComponentReference = {
                bundleName: 'some bundle',
                cClass: 'some class',
                group: 'some group',
                subGroup: 'some subgroup',
                variant: 'some variant',
                vendor: 'some vendor',
                version: 'some version',
            };

            const got = componentReferencesAreEqual(ref1)(ref2);

            expect(got).toBe(true);
        });

        it('returns false if references are not equal', () => {
            const ref1: ComponentReference = {
                bundleName: 'some bundle',
                cClass: 'some class',
                group: 'some group',
                subGroup: 'some subgroup',
                variant: 'some variant',
                vendor: 'some vendor',
                version: 'some version',
            };
            const ref2: ComponentReference = {
                bundleName: 'some bundle',
                cClass: 'some other class',
                group: 'some group',
                subGroup: 'some subgroup',
                variant: 'some variant',
                vendor: 'some vendor',
                version: 'some version',
            };

            const got = componentReferencesAreEqual(ref1)(ref2);

            expect(got).toBe(false);
        });
    });

    describe('componentReferenceToRowId', () => {
        it('picks the row id properties from the reference', () => {
            const reference: ComponentReference = {
                bundleName: 'some bundle',
                cClass: 'some class',
                group: 'some group',
                subGroup: 'some subgroup',
                variant: 'some variant',
                vendor: 'some vendor',
                version: 'some version',
            };

            expect(componentReferenceToRowId(reference)).toEqual({
                bundleName: reference.bundleName,
                cClass: reference.cClass,
                group: reference.group,
                subGroup: reference.subGroup,
            });
        });
    });

    describe('componentReferenceToOptionId', () => {
        it('picks the option id properties from the reference', () => {
            const reference: ComponentReference = {
                bundleName: 'some bundle',
                cClass: 'some class',
                group: 'some group',
                subGroup: 'some subgroup',
                variant: 'some variant',
                vendor: 'some vendor',
                version: 'some version',
            };

            expect(componentReferenceToOptionId(reference)).toEqual({
                version: reference.version,
                variant: reference.variant,
                vendor: reference.vendor,
            });
        });
    });

    describe('pickAllTargetTypes', () => {
        const BuildContexts: BuildContext[] = [{ buildType: 'Build1', targetType: 'Target1' }, { buildType: 'Build2', targetType: 'Target2' }, { buildType: 'Build1', targetType: 'Target2' }];

        it('returns a new list of unique targetTypes', () => {
            const result = pickAllTargetTypes(BuildContexts);
            const expected = ['Target1', 'Target2'];
            expect(result).toEqual(expected);
        });
    });

    describe('filterSelectedOptionAvailableForAllTargets', () => {
        const selectedOption: SelectedComponentOption[] = [{
            resolvedOption: { variant: '', version: '', vendor: 'v1' },
            buildContext: { targetType: 'target1', buildType: '' },
            reference: { ...TEST_ROW_ID, variant: '', version: '', vendor: 'v1' },
            origin: { projectId: 'project id', type: 'project' }
        }, {
            resolvedOption: { variant: '', version: '', vendor: 'v2' },
            buildContext: { targetType: 'target2', buildType: '' },
            reference: { ...TEST_ROW_ID, variant: '', version: '', vendor: 'v2' },
            origin: { projectId: 'project id', type: 'project' }
        }];

        const availableOptions = [componentOptionFactory({
            id: { variant: '', version: '', vendor: 'v1' },
            buildContext: { targetType: 'target1', buildType: '' }
        })];

        it('return a valid selected option from Available options', () => {
            const expected: SelectedComponentOption = {
                resolvedOption: { variant: '', version: '', vendor: 'v1' },
                buildContext: { targetType: 'target1', buildType: '' },
                reference: { ...TEST_ROW_ID, variant: '', version: '', vendor: 'v1' },
                origin: { projectId: 'project id', type: 'project' }
            };
            const result = filterSelectedOptionAvailableForAllTargets(selectedOption, availableOptions);

            expect(result[0]).toEqual(expected);
        });

        it('returns a selected option whose resolvedOption matches an available', () => {
            const resolvedOption = componentOptionIdFactory();
            const reference = { ...componentRowIdFactory(), variant: resolvedOption.variant, vendor: '', version: '' };
            const expected = selectedComponentOptionFactory({ resolvedOption, reference });

            const result = filterSelectedOptionAvailableForAllTargets([expected], [
                componentOptionFactory({ buildContext: expected.buildContext }),
                componentOptionFactory({ buildContext: expected.buildContext, id: resolvedOption }),
            ]);

            expect(result).toEqual([expected]);
        });

        it('returns undefined if can find selected option from Available options', () => {
            const undefinedOption: SelectedComponentOption[] = [];
            const result = filterSelectedOptionAvailableForAllTargets(undefinedOption, availableOptions);

            expect(result[0]).toBeUndefined();
        });
    });

    describe('buildOptionId', () => {
        const reference: ComponentReference = { ...TEST_ROW_ID, ...optionId };
        it('returns the component options from the reference', () => {
            const result = buildOptionId(reference);
            expect(result).toEqual(optionId);
        });
    });
});
