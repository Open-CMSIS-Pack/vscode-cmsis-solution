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
import * as YAML from 'yaml';
import { reconcileProjectDocument, reconcileSolutionDocument } from './solution-document-reconciler';
import { BranchProtection, Compiler, ComponentData, PackData, TargetTypeData, Trustzone } from '../../core-tools/client/solutions_pb';
import { YAMLMap } from 'yaml';
import { compilerNameToEnum, componentStringToComponentRef } from '../../core-tools/core-tools-data-building';
import { serialiseBoardId, serialiseCompiler, serialiseDevice } from '../solution-serialisers';
import { Dsp, Endian, Fpu, Mve } from '../../core-tools/client/packs_pb';

type TargetTypeFactoryOptions = TargetTypeData.AsObject & {
    define?: string[];
}

type SolutionObjectFactoryOptions = {
    packs?: string[];
    projectRefs?: string[];
    targetTypes?: TargetTypeFactoryOptions[];
    compiler?: string;
}

const solutionObjectFactory = (options?: SolutionObjectFactoryOptions) => ({
    solution: {
        ...(
            options?.compiler ? {
                compiler: options.compiler
            } : {}
        ),
        ...(
            options?.packs ? {
                packs: options.packs.map(pack => ({ pack }))
            } : {}
        ),
        ...(
            options?.projectRefs ? {
                projects: options.projectRefs.map(project => ({ project }))
            } : {}
        ),
        ...(
            options?.targetTypes ? {
                'target-types': options.targetTypes.map(targetType => {
                    const compilerName = targetType.compiler ? compilerNameToEnum.find(c => c.enum === targetType.compiler!.name)!.name : undefined;
                    return {
                        type: targetType.id?.id,
                        ...(targetType.board ? { board: serialiseBoardId(targetType.board) } : {}),
                        ...(targetType.device ? { device: serialiseDevice(targetType.device) } : {}),
                        ...(targetType.compiler && compilerName ? { compiler: serialiseCompiler({ name: compilerName, version: targetType.compiler.version }) } : {}),
                        ...(targetType.processor ? { processor: targetType.processor } : {}),
                        ...(targetType.define ? { define: targetType.define } : {}),
                    };
                })
            } : {}
        )
    },
});

const noPacksSolution = solutionObjectFactory(undefined);
const onePackSolution = solutionObjectFactory({ packs:['ARM::CMSIS'] });
const twoPacksSolution = solutionObjectFactory({ packs: ['ARM::CMSIS', 'Vendor::Pack' ] });

const projectObjectFactory = (components: unknown[] | undefined, packs: unknown[] | undefined, device: string | undefined) => ({
    project: {
        compiler: 'GCC',
        ...(components ? { components } : {}),
        ...(packs ? { packs } : {}),
        device
    },
});

const emptyProject = projectObjectFactory(undefined, [], undefined);

const deviceProject = projectObjectFactory(undefined, [], 'some-vendor::some-device:some-processor');

const oneComponentProject = projectObjectFactory([
    { component: 'ARM::CMSIS:Core' }
], [], undefined);

const oneComponentOnePackOneDeviceProject = projectObjectFactory([
    { component: 'ARM::CMSIS:Core' }
], [
    { pack: 'ARM::CMSIS' }
], 'some-vendor::some-device:some-processor');

const oneComponentForContextProject = projectObjectFactory([
    { component: 'ARM::CMSIS:Core', 'for-context': ['+Target.Build'] },
], [], undefined);

const oneComponentForContextStringProject = projectObjectFactory([
    { component: 'ARM::CMSIS:Core', 'for-context': '+Target.Build' },
], [], undefined);

const oneComponentNotForContextStringProject = projectObjectFactory([
    { component: 'ARM::CMSIS:Core', 'not-for-context': '+Target.Build' },
], [], undefined);

const twoComponentTwoNotForContextProject = projectObjectFactory([
    { component: 'ARM::CMSIS:Core', 'not-for-context': ['+Target1', '+Target2'] },
    { component: 'Another:Component' },
], [], undefined);

const twoComponentOneNotForContextProject = projectObjectFactory([
    { component: 'ARM::CMSIS:Core', 'not-for-context': ['+Target2'] },
    { component: 'Another:Component' },
], [], undefined);

const oneComponentWithContextStrings = projectObjectFactory([
    { component: 'ARM::CMSIS:Core', 'for-context': '+Target.Build', 'not-for-context': '+Target2' },
], [], undefined);

const oneComponentTwoInstances = projectObjectFactory([
    { component: 'ARM::CMSIS:Core', instances: 2 },
], [], undefined);

describe('Document reconcilers', () => {
    describe('reconcileSolutionDocument', () => {
        it('correctly reconciles after a pack was added when there were no packs before', () => {
            const parsedDocument = new YAML.Document(noPacksSolution);
            const packsList: PackData.AsObject[]  = [
                { reference: { vendor: 'ARM', name: 'CMSIS', version: '5.9.0' }, notForContextsList: [], forContextsList: [] },
            ];
            const updated = reconcileSolutionDocument(parsedDocument, { solution: { packsList, targetTypesList: [], buildTypesList: [], projectsList: [], layersList: [] }, projectRefs: [] });
            expect(updated).toBe(true);
            const newYaml = parsedDocument.toJS();
            expect(newYaml).toEqual(onePackSolution);
        });

        it('correctly reconciles after a pack was added when there were packs before', () => {
            const parsedDocument = new YAML.Document(onePackSolution);
            const packsList: PackData.AsObject[]  = [
                { reference: { vendor: 'ARM', name: 'CMSIS', version: '5.9.0' }, notForContextsList: [], forContextsList: [] },
                { reference: { vendor: 'Vendor', name: 'Pack', version: '' }, notForContextsList: [], forContextsList: [] },
            ];
            const updated = reconcileSolutionDocument(parsedDocument, { solution: { packsList, targetTypesList: [], buildTypesList: [], projectsList: [], layersList: [] }, projectRefs: [] });
            expect(updated).toBe(true);
            const newYaml = parsedDocument.toJS();
            expect(newYaml).toEqual(twoPacksSolution);
        });

        it('correctly reconciles after a pack was removed', () => {
            const parsedDocument = new YAML.Document(twoPacksSolution);
            const packsList: PackData.AsObject[]  = [
                { reference: { vendor: 'ARM', name: 'CMSIS', version: '5.9.0' }, notForContextsList: [], forContextsList: [] },
            ];
            const updated = reconcileSolutionDocument(parsedDocument, { solution: { packsList, targetTypesList: [], buildTypesList: [], projectsList: [], layersList: [] }, projectRefs: [] });
            expect(updated).toBe(true);
            const newYaml = parsedDocument.toJS();
            expect(newYaml).toEqual(onePackSolution);
        });

        it('correctly reconciles after the last pack was removed', () => {
            const parsedDocument = new YAML.Document(onePackSolution);
            const packsList: PackData.AsObject[]  = [];
            const updated = reconcileSolutionDocument(parsedDocument, { solution: { packsList, targetTypesList: [], buildTypesList: [], projectsList: [], layersList: [] }, projectRefs: [] });
            expect(updated).toBe(true);
            const newYaml = parsedDocument.toJS();
            expect(newYaml).toEqual(noPacksSolution);
        });

        it('correctly reconciles when the pack list is the same as the document', () => {
            const parsedDocument = new YAML.Document(onePackSolution);
            const packsList: PackData.AsObject[]  = [
                { reference: { vendor: 'ARM', name: 'CMSIS', version: '5.9.0' }, notForContextsList: [], forContextsList: [] },
            ];
            const updated = reconcileSolutionDocument(parsedDocument, { solution: { packsList, targetTypesList: [], buildTypesList: [], projectsList: [], layersList: [] }, projectRefs: [] });
            expect(updated).toBe(false);
            const newYaml = parsedDocument.toJS();
            expect(newYaml).toEqual(onePackSolution);
        });

        it ('correctly reconciles when a project is added', () => {
            const parsedDocument = new YAML.Document(solutionObjectFactory(undefined));
            const projectRef = './some-ref.cproject.yml';

            const updated = reconcileSolutionDocument(parsedDocument, { solution: { packsList: [], targetTypesList: [], buildTypesList: [], projectsList: [], layersList: [] }, projectRefs: [ { reference: projectRef, forContext: [], notForContext: [] } ] });

            expect(updated).toBe(true);
            expect(parsedDocument.toJS()).toEqual(solutionObjectFactory({ projectRefs: [ projectRef ] }));
        });

        it ('correctly reconciles when a project is removed', () => {
            const projectRef = './some-ref.cproject.yml';
            const parsedDocument = new YAML.Document(solutionObjectFactory({ projectRefs: [ projectRef ] }));

            const updated = reconcileSolutionDocument(parsedDocument, { solution: { packsList: [], targetTypesList: [], buildTypesList: [], projectsList: [], layersList: [] }, projectRefs: [] });

            expect(updated).toBe(true);
            expect(parsedDocument.toJS()).toEqual(solutionObjectFactory({ projectRefs: [] }));
        });

        it ('does not update if there were no changes to projects', () => {
            const projectRef = './some-ref.cproject.yml';
            const parsedDocument = new YAML.Document(solutionObjectFactory({ projectRefs: [ projectRef ] }));

            const updated = reconcileSolutionDocument(parsedDocument, { solution: { packsList: [], targetTypesList: [], buildTypesList: [], projectsList: [], layersList: [] }, projectRefs: [ { reference: projectRef, forContext: [], notForContext: [] } ] });

            expect(updated).toBe(false);
            expect(parsedDocument.toJS()).toEqual(solutionObjectFactory({ projectRefs: [ projectRef ] }));
        });

        it ('correctly reconciles a partial device definition', () => {
            const targetType: TargetTypeData.AsObject = {
                id: { id: 'some target' },
                device: { name: 'some device', vendor: '', processor: '' },
            };
            const parsedDocument = new YAML.Document(solutionObjectFactory(undefined));

            const updated = reconcileSolutionDocument(parsedDocument, { solution: { packsList: [], targetTypesList: [ targetType ], buildTypesList: [], projectsList: [], layersList: [] }, projectRefs: [] });

            expect(updated).toBe(true);
            expect(parsedDocument.toJS().solution['target-types'][0].device).toEqual('some device');
        });

        it ('correctly reconciles when a target type is added', () => {
            const targetType: TargetTypeData.AsObject = {
                id: { id: 'some target' },
                board: { name: 'some board', vendor: 'some vendor', revision: '0.0.1' },
                device: { name: 'some device', vendor: 'some dvendor', processor: 'some processor' },
            };
            const parsedDocument = new YAML.Document(solutionObjectFactory(undefined));

            const updated = reconcileSolutionDocument(parsedDocument, { solution: { packsList: [], targetTypesList: [ targetType ], buildTypesList: [], projectsList: [], layersList: [] }, projectRefs: [] });

            expect(updated).toBe(true);
            expect(parsedDocument.toJS()).toEqual(solutionObjectFactory({ targetTypes: [ targetType ] }));
        });

        it ('correctly reconciles when a target type is removed', () => {
            const targetType: TargetTypeData.AsObject = {
                id: { id: 'some target' },
                compiler: { name: Compiler.Name.AC6, version: '1.0.0' },
                board: { name: 'some board', vendor: 'some vendor', revision: '0.0.1' },
                device: { name: 'some device', vendor: 'some dvendor', processor: 'some processor' },
                processor: {
                    trustzone: Trustzone.TRUSTZONE_SECURE,
                    fpu: Fpu.FPU_SP,
                    endian: Endian.ENDIAN_BIG,
                    dsp: Dsp.DSP_UNSPECIFIED,
                    mve: Mve.MVE_UNSPECIFIED,
                    branchProtection: BranchProtection.BRANCH_PROTECTION_UNSPECIFIED,
                },
            };
            const parsedDocument = new YAML.Document(solutionObjectFactory({ targetTypes: [ targetType ] }));

            const updated = reconcileSolutionDocument(parsedDocument, { solution: { packsList: [], targetTypesList: [], buildTypesList: [], projectsList: [], layersList: [] }, projectRefs: [] });

            expect(updated).toBe(true);
            expect(parsedDocument.toJS()).toEqual(solutionObjectFactory(undefined));
        });

        it ('correctly reconciles when there were no changes to target types', () => {
            const targetType: TargetTypeData.AsObject = {
                id: { id: 'some target' },
                board: { name: 'some board', vendor: 'some vendor', revision: '0.0.1' },
                device: { name: 'some device', vendor: 'some dvendor', processor: 'some processor' },
            };
            const parsedDocument = new YAML.Document(solutionObjectFactory({ targetTypes: [ targetType ] }));

            const updated = reconcileSolutionDocument(parsedDocument, { solution: { packsList: [], targetTypesList: [ targetType ], buildTypesList: [], projectsList: [], layersList: [] }, projectRefs: [] });

            expect(updated).toBe(false);
            expect(parsedDocument.toJS()).toEqual(solutionObjectFactory({ targetTypes: [ targetType ] }));
        });

        it ('correctly reconciles when CLANG compiler is added', () => {
            const compiler: Compiler.AsObject = { name: Compiler.Name.CLANG, version: '' };
            const parsedDocument = new YAML.Document(solutionObjectFactory(undefined));

            const updated = reconcileSolutionDocument(parsedDocument, { solution: { compiler, packsList: [], targetTypesList: [], buildTypesList: [], projectsList: [], layersList: [] }, projectRefs: [] });

            expect(updated).toBe(true);
            expect(parsedDocument.toJS()).toEqual(solutionObjectFactory({ compiler: 'CLANG' }));
        });

        it ('correctly reconciles GCC compiler is added', () => {
            const compiler: Compiler.AsObject = { name: Compiler.Name.GCC, version: '' };
            const parsedDocument = new YAML.Document(solutionObjectFactory(undefined));

            const updated = reconcileSolutionDocument(parsedDocument, { solution: { compiler, packsList: [], targetTypesList: [], buildTypesList: [], projectsList: [], layersList: [] }, projectRefs: [] });

            expect(updated).toBe(true);
            expect(parsedDocument.toJS()).toEqual(solutionObjectFactory({ compiler: 'GCC' }));
        });

        it ('correctly reconciles when a compiler is added', () => {
            const compiler: Compiler.AsObject = { name: Compiler.Name.AC6, version: '' };
            const parsedDocument = new YAML.Document(solutionObjectFactory(undefined));

            const updated = reconcileSolutionDocument(parsedDocument, { solution: { compiler, packsList: [], targetTypesList: [], buildTypesList: [], projectsList: [], layersList: [] }, projectRefs: [] });

            expect(updated).toBe(true);
            expect(parsedDocument.toJS()).toEqual(solutionObjectFactory({ compiler: 'AC6' }));
        });

        it ('correctly reconciles when a compiler is removed', () => {
            const parsedDocument = new YAML.Document(solutionObjectFactory({ compiler: 'AC6' }));

            const updated = reconcileSolutionDocument(parsedDocument, { solution: { packsList: [], targetTypesList: [], buildTypesList: [], projectsList: [], layersList: [] }, projectRefs: [] });

            expect(updated).toBe(true);
            expect(parsedDocument.toJS()).toEqual(solutionObjectFactory(undefined));
        });

        it('correctly reconciles when there was no change to compiler', () => {
            const compiler: Compiler.AsObject = { name: Compiler.Name.AC6, version: '' };
            const parsedDocument = new YAML.Document(solutionObjectFactory({ compiler: 'AC6' }));

            const updated = reconcileSolutionDocument(parsedDocument, { solution: { compiler, packsList: [], targetTypesList: [], buildTypesList: [], projectsList: [], layersList: [] }, projectRefs: [] });

            expect(updated).toBe(false);
            expect(parsedDocument.toJS()).toEqual(solutionObjectFactory({ compiler: 'AC6' }));
        });

        it('preserves compiler version', () => {
            const compiler: Compiler.AsObject = { name: Compiler.Name.GCC, version: '' };
            const parsedDocument = new YAML.Document(solutionObjectFactory({ compiler: 'GCC@1.2.3' }));

            const updated = reconcileSolutionDocument(parsedDocument, { solution: { compiler, packsList: [], targetTypesList: [], buildTypesList: [], projectsList: [], layersList: [] }, projectRefs: [] });

            expect(updated).toBe(false);
            expect(parsedDocument.toJS()).toEqual(solutionObjectFactory({ compiler: 'GCC@1.2.3' }));
        });

        it('preserves defines in target types', () => {
            const parsedDocument = new YAML.Document(solutionObjectFactory({
                targetTypes: [
                    { id: { id: 'Type 1' }, device: { vendor: 'Vending', name: 'DeviceName', processor: '' }, define: ['A_DEFINE'] },
                ],
            }));

            const updated = reconcileSolutionDocument(parsedDocument, {
                solution: {
                    layersList: [],
                    packsList: [],
                    buildTypesList: [],
                    projectsList: [],
                    targetTypesList: [
                        { id: { id: 'Type 1' }, device: { vendor: 'Vending', name: 'DeviceName', processor: '' } },
                        { id: { id: 'Type 2' }, device: { vendor: 'Vending', name: 'AnotherOne', processor: ':CM4' } },
                    ]
                },
                projectRefs: [],
            });

            expect(updated).toBe(true);

            expect(parsedDocument.toJS()).toEqual(solutionObjectFactory({
                targetTypes: [
                    { id: { id: 'Type 1' }, device: { vendor: 'Vending', name: 'DeviceName', processor: '' }, define: ['A_DEFINE'] },
                    { id: { id: 'Type 2' }, device: { vendor: 'Vending', name: 'AnotherOne', processor: ':CM4' } },
                ],
            }));
        });
    });

    describe('reconcileProjectDocument', () => {
        it('correctly reconciles when the first component is added', () => {
            const parsedDocument = new YAML.Document(emptyProject);

            const componentsList: ComponentData.AsObject[] = [
                { reference: componentStringToComponentRef('ARM::CMSIS:Core').toObject(), forContextsList: [], notForContextsList: [], instances: 1 },
            ];

            const updated = reconcileProjectDocument(parsedDocument, { componentsList, packsList: [] });
            expect(updated).toBe(true);
            const newYaml = parsedDocument.toJS();
            expect(newYaml).toEqual(oneComponentProject);
        });

        it('correctly reconciles when the last component is removed', () => {
            const parsedDocument = new YAML.Document(oneComponentProject);
            const componentsList: ComponentData.AsObject[] = [];
            const updated = reconcileProjectDocument(parsedDocument, { componentsList, packsList: [] });
            expect(updated).toBe(true);
            const newYaml = parsedDocument.toJS();
            expect(newYaml).toEqual(emptyProject);
        });

        it('correctly reconciles after a for-context is added to a component', () => {
            const parsedDocument = new YAML.Document(oneComponentProject);
            const componentsList: ComponentData.AsObject[] = [
                {
                    reference: componentStringToComponentRef('ARM::CMSIS:Core').toObject(),
                    forContextsList: [{
                        targetTypeId: { id: 'Target' },
                        buildTypeId: { id: 'Build' },
                    }],
                    notForContextsList: [],
                    instances: 1,
                },
            ];

            const updated = reconcileProjectDocument(parsedDocument, { componentsList, packsList: [] });

            const newYaml = parsedDocument.toJS();
            expect(updated).toBe(true);
            expect(newYaml).toEqual(oneComponentForContextProject);
        });

        it('correctly reconciles after a single for-context is added to a component', () => {
            const parsedDocument = new YAML.Document(oneComponentProject);
            const componentsList: ComponentData.AsObject[] = [
                {
                    reference: componentStringToComponentRef('ARM::CMSIS:Core').toObject(),
                    forContextsList: [{
                        targetTypeId: { id: 'Target' },
                    }],
                    notForContextsList: [],
                    instances: 1,
                },
            ];

            const updated = reconcileProjectDocument(parsedDocument, { componentsList, packsList: [] });

            const newYaml = parsedDocument.toJS();
            const expectedYaml = projectObjectFactory([
                { component: 'ARM::CMSIS:Core', 'for-context': ['+Target'] },
            ], [], undefined);
            expect(updated).toBe(true);
            expect(newYaml).toEqual(expectedYaml);
        });

        it('correctly reconciles after a for-context is added to a component with existing for-context string', () => {
            const parsedDocument = new YAML.Document(oneComponentForContextStringProject);

            const componentsList: ComponentData.AsObject[] = [
                {
                    reference: componentStringToComponentRef('ARM::CMSIS:Core').toObject(),
                    forContextsList: [
                        {
                            targetTypeId: { id: 'Target' },
                            buildTypeId: { id: 'Build' },
                        },
                        {
                            targetTypeId: { id: 'Target2' },
                            buildTypeId: { id: 'Build2' },
                        },
                    ],
                    notForContextsList: [],
                    instances: 1,
                },
            ];

            const updated = reconcileProjectDocument(parsedDocument, { componentsList, packsList: [] });
            expect(updated).toBe(true);
            const newYaml = parsedDocument.toJS();
            expect(newYaml).toEqual(projectObjectFactory([
                { component: 'ARM::CMSIS:Core', 'for-context': ['+Target.Build', '+Target2.Build2'] },
            ], [], undefined));
        });

        it('correctly retains context strings', () => {
            const parsedDocument = new YAML.Document(oneComponentWithContextStrings);

            const componentsList: ComponentData.AsObject[] = [
                {
                    reference: componentStringToComponentRef('ARM::CMSIS:Core').toObject(),
                    forContextsList: [{
                        targetTypeId: { id: 'Target' },
                        buildTypeId: { id: 'Build' },
                    }],
                    notForContextsList: [{
                        targetTypeId: { id: 'Target2' },
                    }],
                    instances: 1,
                },
            ];

            const updated = reconcileProjectDocument(parsedDocument, { componentsList, packsList: [] });
            expect(updated).toBe(false);
            const newYaml = parsedDocument.toJS();
            expect(newYaml).toEqual(oneComponentWithContextStrings);
        });

        it('does not set build or target type if id is not defined', () => {
            const parsedDocument = new YAML.Document(oneComponentProject);

            const componentsList: ComponentData.AsObject[] = [
                {
                    reference: componentStringToComponentRef('ARM::CMSIS:Core').toObject(),
                    forContextsList: [
                        { targetTypeId: { id: 'TestTarget' }, buildTypeId: { id: '' } },
                        { targetTypeId: { id: '' }, buildTypeId: { id: 'TestBuild' } },
                    ],
                    notForContextsList: [],
                    instances: 1,
                },
            ];

            const updated = reconcileProjectDocument(parsedDocument, { componentsList, packsList: [] });
            expect(updated).toBe(true);
            const newYaml = parsedDocument.toJS();
            expect(newYaml).toEqual(projectObjectFactory([
                { component: 'ARM::CMSIS:Core', 'for-context': ['+TestTarget', '.TestBuild'] },
            ], [], undefined));
        });

        it('correctly reconciles after a for-context is removed from a component', () => {
            const parsedDocument = new YAML.Document(oneComponentForContextProject);

            const componentsList: ComponentData.AsObject[] = [
                { reference: componentStringToComponentRef('ARM::CMSIS:Core').toObject(), forContextsList: [], notForContextsList: [], instances: 1 },
            ];

            const updated = reconcileProjectDocument(parsedDocument, { componentsList, packsList: [] });
            expect(updated).toBe(true);
            const newYaml = parsedDocument.toJS();
            expect(newYaml).toEqual(oneComponentProject);
        });

        it('correctly reconciles after a for-context string is removed from a component', () => {
            const parsedDocument = new YAML.Document(oneComponentForContextStringProject);

            const componentsList: ComponentData.AsObject[] = [
                { reference: componentStringToComponentRef('ARM::CMSIS:Core').toObject(), forContextsList: [], notForContextsList: [], instances: 1 },
            ];

            const updated = reconcileProjectDocument(parsedDocument, { componentsList, packsList: [] });
            expect(updated).toBe(true);
            const newYaml = parsedDocument.toJS();
            expect(newYaml).toEqual(oneComponentProject);
        });

        it('correctly reconciles after a not-for-context string is removed from a component', () => {
            const parsedDocument = new YAML.Document(oneComponentNotForContextStringProject);

            const componentsList: ComponentData.AsObject[] = [
                { reference: componentStringToComponentRef('ARM::CMSIS:Core').toObject(), forContextsList: [], notForContextsList: [], instances: 1 },
            ];

            const updated = reconcileProjectDocument(parsedDocument, { componentsList, packsList: [] });
            expect(updated).toBe(true);
            const newYaml = parsedDocument.toJS();
            expect(newYaml).toEqual(oneComponentProject);
        });

        it('correctly reconciles after a not-for-context is removed from a component', () => {
            const parsedDocument = new YAML.Document(twoComponentTwoNotForContextProject);
            const componentsList: ComponentData.AsObject[] = [
                { reference: componentStringToComponentRef('ARM::CMSIS:Core').toObject(), forContextsList: [], notForContextsList: [{ targetTypeId: { id: 'Target2' } }], instances: 1 },
                { reference: componentStringToComponentRef('Another:Component').toObject(), forContextsList: [], notForContextsList: [], instances: 1 },
            ];

            const updated = reconcileProjectDocument(parsedDocument, { componentsList, packsList: [] });
            expect(updated).toBe(true);
            const newYaml = parsedDocument.toJS();
            expect(newYaml).toEqual(twoComponentOneNotForContextProject);
        });

        it('correctly reconciles after instances is added to a component', () => {
            const parsedDocument = new YAML.Document(oneComponentProject);

            const componentsList: ComponentData.AsObject[] = [
                {
                    reference: componentStringToComponentRef('ARM::CMSIS:Core').toObject(),
                    forContextsList: [],
                    notForContextsList: [],
                    instances: 2,
                },
            ];

            const updated = reconcileProjectDocument(parsedDocument, { componentsList, packsList: [] });
            expect(updated).toBe(true);
            const newYaml = parsedDocument.toJS();
            expect(newYaml).toEqual(oneComponentTwoInstances);
        });

        it('correctly retains component instances', () => {
            const parsedDocument = new YAML.Document(oneComponentTwoInstances);

            const componentsList: ComponentData.AsObject[] = [
                {
                    reference: componentStringToComponentRef('ARM::CMSIS:Core').toObject(),
                    forContextsList: [],
                    notForContextsList: [],
                    instances: 2,
                },
            ];

            const updated = reconcileProjectDocument(parsedDocument, { componentsList, packsList: [] });
            expect(updated).toBe(false);
            const newYaml = parsedDocument.toJS();
            expect(newYaml).toEqual(oneComponentTwoInstances);
        });

        it('correctly retains component instances if undefined in yaml and setting to 1', () => {
            const parsedDocument = new YAML.Document(oneComponentProject);

            const componentsList: ComponentData.AsObject[] = [
                {
                    reference: componentStringToComponentRef('ARM::CMSIS:Core').toObject(),
                    forContextsList: [],
                    notForContextsList: [],
                    instances: 1,
                },
            ];

            const updated = reconcileProjectDocument(parsedDocument, { componentsList, packsList: [] });
            expect(updated).toBe(false);
            const newYaml = parsedDocument.toJS();
            expect(newYaml).toEqual(oneComponentProject);
        });

        it('forces block mapping when the project is updated', () => {
            const parsedDocument = new YAML.Document(emptyProject);
            (parsedDocument.get('project') as YAMLMap).flow = true;

            reconcileProjectDocument(parsedDocument, {
                componentsList: [{ reference: componentStringToComponentRef('ARM::CMSIS:Core').toObject(), forContextsList: [], notForContextsList: [], instances: 1 }],
                packsList: [],
            });

            expect((parsedDocument.get('project') as YAMLMap).flow).toBe(false);
        });

        it('does not modify the mapping style when the project is not updated', () => {
            const parsedDocument = new YAML.Document(oneComponentProject);
            (parsedDocument.get('project') as YAMLMap).flow = true;

            reconcileProjectDocument(parsedDocument, {
                componentsList: [{ reference: componentStringToComponentRef('ARM::CMSIS:Core').toObject(), forContextsList: [], notForContextsList: [], instances: 1 }],
                packsList: [],
            });

            expect((parsedDocument.get('project') as YAMLMap).flow).toBe(true);
        });

        it('correctly reconciles when a pack, component and device are added', () => {
            const parsedDocument = new YAML.Document(emptyProject);

            const componentsList: ComponentData.AsObject[] = [
                { reference: componentStringToComponentRef('ARM::CMSIS:Core').toObject(), forContextsList: [], notForContextsList: [], instances: 1 },
            ];

            const packsList: PackData.AsObject[] = [
                { reference: { vendor: 'ARM', name: 'CMSIS', version: '5.9.0' }, forContextsList: [], notForContextsList: [] },
            ];

            const updated = reconcileProjectDocument(parsedDocument, { componentsList, packsList, device: { name: 'some-device', vendor: 'some-vendor', processor: 'some-processor' } });
            expect(updated).toBe(true);
            const newYaml = parsedDocument.toJS();
            expect(newYaml).toEqual(oneComponentOnePackOneDeviceProject);
        });

        it('correctly reconciles when a device is added', () => {
            const parsedDocument = new YAML.Document(emptyProject);

            const updated = reconcileProjectDocument(parsedDocument, { componentsList: [], packsList: [], device: { name: 'some-device', vendor: 'some-vendor', processor: 'some-processor' } });
            expect(updated).toBe(true);
            const newYaml = parsedDocument.toJS();
            expect(newYaml).toEqual(deviceProject);
        });

        it ('correctly reconciles when a device is removed', () => {
            const parsedDocument = new YAML.Document(deviceProject);

            const updated = reconcileProjectDocument(parsedDocument, { componentsList: [], packsList: [] });

            expect(updated).toBe(true);
            expect(parsedDocument.toJS()).toEqual(emptyProject);
        });

        it('correctly reconciles when there was no change to device', () => {
            const parsedDocument = new YAML.Document(deviceProject);

            const updated = reconcileProjectDocument(parsedDocument, { componentsList: [], packsList: [], device: { name: 'some-device', vendor: 'some-vendor', processor: 'some-processor' } });

            expect(updated).toBe(false);
            expect(parsedDocument.toJS()).toEqual(deviceProject);
        });

    });
});
