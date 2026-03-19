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
import * as path from 'path';
import { ComponentData, ComponentReference, ProcessorData, ProjectData, ProjectId, SolutionData, Fpu, Trustzone, Endian, Dsp, Mve, BranchProtection } from './client/solutions_pb';
import { emptyProcessorData } from '../solutions/parsing/processor-data-parsing';
import { ProjectReference, Solution } from '../solutions/parsing/solution-file';
import { ParsedProjectFile, SolutionFiles, ParsedLayerFile, ParsedFile } from '../solutions/parsing/file-loader';
import { componentStringToComponentRef, createSolutionData } from './core-tools-data-building';
import { processorDataFactory } from '../solutions/parsing/processor-data-parsing.factories';
import { packFileFactory, parsedLayerFileFactory, parsedProjectFileFactory, parsedSolutionFileFactory, solutionFilesFactory } from '../solutions/parsing/solution-file.factories';
import { packDataFactory } from './core-tools-service.factories';

describe('createSolutionData', () => {
    it('build the solution data from the parsed solution files', () => {
        const processor = processorDataFactory({ trustzone: 'secure' });
        const targetType = {
            type: 'target-type',
            board: 'board-vendor::board:board-revision',
            device: 'device-vendor::device:some-processor',
            compiler: 'AC6',
            processor,
        };
        const buildType = {
            type: 'build-type',
            compiler: 'AC6',
            processor,
        };
        const solutionFiles: SolutionFiles = {
            solution: {
                file: {
                    path: 'some-solution-path',
                    value: {
                        projects: [
                            {
                                reference: 'path',
                                forContext: ['+target-type.build-type'],
                                notForContext: []
                            },
                        ],
                        targetTypes: [targetType],
                        buildTypes: [buildType],
                        packs: [
                            { pack: 'some-pack-vendor::some-pack@2.0.0', forContext: [], notForContext: [] },
                        ],
                        compiler: 'AC6',
                        processor: processorDataFactory({ trustzone: 'non-secure' }),
                        cdefault: true,
                    },
                },
                cloneYamlDocument: expect.any(Function),
            },
            projects: [{
                referencePath: 'path',
                file: {
                    path: 'some-project-path',
                    value: {
                        packs: [
                            { pack: 'some-pack-vendor::some-pack@2.0.0', forContext: ['.Debug+AVH', '.Debug+Something-else'], notForContext: [] },
                            { pack: 'some-pack-vendor2::some-pack2@3.0.0', forContext: '.Release', notForContext: [] },
                        ],
                        layers: [{
                            reference: 'layer-path',
                            forContext: [],
                            notForContext: []
                        }],
                        groups: [],
                        components: []
                    },
                },
                cloneYamlDocument: expect.any(Function),
            }],
            layers: [
                {
                    file: {
                        path: 'some-layer-path',
                        value: {
                            packs: [
                                { pack: 'some-pack-vendor::some-pack@5.0.0', forContext: '.Debug+AVH', notForContext: [] },
                            ],
                            compiler: 'AC6',
                            processor: processorDataFactory({ trustzone: 'non-secure' }),
                            components: [],
                            groups: [],
                        },
                    },
                    referencePath: 'layer-path',
                    cloneYamlDocument: expect.any(Function)
                }
            ],
            defaultConfiguration: { path: 'some-solution-path', defaultConfiguration: {  compiler: 'GCC' } }
        };

        const result = createSolutionData(solutionFiles);

        const expected: SolutionData.AsObject = {
            targetTypesList: [
                {
                    id: {
                        id: 'target-type',
                    },
                    board: {
                        name: 'board',
                        vendor: 'board-vendor',
                        revision: 'board-revision'
                    },
                    device: {
                        name: 'device',
                        vendor: 'device-vendor',
                        processor: 'some-processor'
                    },
                    processor: {
                        fpu: Fpu.FPU_UNSPECIFIED,
                        trustzone: Trustzone.TRUSTZONE_SECURE,
                        endian: Endian.ENDIAN_UNSPECIFIED,
                        dsp: Dsp.DSP_UNSPECIFIED,
                        mve: Mve.MVE_UNSPECIFIED,
                        branchProtection: BranchProtection.BRANCH_PROTECTION_UNSPECIFIED,
                    },
                    compiler: {
                        name: 1,
                        version: ''
                    }
                }
            ],
            buildTypesList: [
                {
                    id: {
                        id: 'build-type'
                    },
                    processor: {
                        fpu: Fpu.FPU_UNSPECIFIED,
                        trustzone: Trustzone.TRUSTZONE_SECURE,
                        endian: Endian.ENDIAN_UNSPECIFIED,
                        dsp: Dsp.DSP_UNSPECIFIED,
                        mve: Mve.MVE_UNSPECIFIED,
                        branchProtection: BranchProtection.BRANCH_PROTECTION_UNSPECIFIED,
                    },
                    compiler: {
                        name: 1,
                        version: ''
                    }
                }
            ],
            layersList: [
                {
                    id: { id: 'some-layer-path' },
                    componentsList: [],
                    processor: {
                        fpu: Fpu.FPU_UNSPECIFIED,
                        trustzone: Trustzone.TRUSTZONE_NON_SECURE,
                        endian: Endian.ENDIAN_UNSPECIFIED,
                        dsp: Dsp.DSP_UNSPECIFIED,
                        mve: Mve.MVE_UNSPECIFIED,
                        branchProtection: BranchProtection.BRANCH_PROTECTION_UNSPECIFIED,
                    },
                    compiler: {
                        name: 1,
                        version: ''
                    },
                    packsList: [
                        {
                            reference: {
                                name: 'some-pack',
                                vendor: 'some-pack-vendor',
                                version: '5.0.0',
                            },
                            forContextsList: [
                                { buildTypeId: { id: 'Debug' }, targetTypeId: { id: 'AVH' } },
                            ],
                            notForContextsList: [],
                        }
                    ],
                }
            ],
            projectsList: [
                {
                    id: { id: 'some-project-path' },
                    board: undefined,
                    compiler: undefined,
                    componentsList: [],
                    device: undefined,
                    forContextsList: [{
                        buildTypeId: { id: 'build-type' },
                        targetTypeId: { id: 'target-type' },
                    }],
                    notForContextsList: [],
                    packsList: [
                        {
                            reference: {
                                name: 'some-pack',
                                vendor: 'some-pack-vendor',
                                version: '2.0.0',
                            },
                            forContextsList: [
                                { buildTypeId: { id: 'Debug' }, targetTypeId: { id: 'AVH' } },
                                { buildTypeId: { id: 'Debug' }, targetTypeId: { id: 'Something-else' } },
                            ],
                            notForContextsList: [],
                        },
                        {
                            reference: {
                                name: 'some-pack2',
                                vendor: 'some-pack-vendor2',
                                version: '3.0.0',
                            },
                            forContextsList: [
                                { buildTypeId: { id: 'Release' }, targetTypeId: { id: '' } },
                            ],
                            notForContextsList: [],
                        },
                    ],
                    processor: {
                        fpu: Fpu.FPU_UNSPECIFIED,
                        trustzone: Trustzone.TRUSTZONE_UNSPECIFIED,
                        endian: Endian.ENDIAN_UNSPECIFIED,
                        dsp: Dsp.DSP_UNSPECIFIED,
                        mve: Mve.MVE_UNSPECIFIED,
                        branchProtection: BranchProtection.BRANCH_PROTECTION_UNSPECIFIED,
                    },
                    layersList: [
                        {
                            id: { id: path.resolve(path.dirname('some-project-path'), 'layer-path') },
                            forContextsList: [],
                            notForContextsList: [],
                        }
                    ],
                }
            ],
            packsList: [{
                reference: {
                    name: 'some-pack',
                    vendor: 'some-pack-vendor',
                    version: '2.0.0',
                },
                forContextsList: [],
                notForContextsList: [],
            }],
            processor: {
                fpu: Fpu.FPU_UNSPECIFIED,
                trustzone: Trustzone.TRUSTZONE_NON_SECURE,
                endian: Endian.ENDIAN_UNSPECIFIED,
                dsp: Dsp.DSP_UNSPECIFIED,
                mve: Mve.MVE_UNSPECIFIED,
                branchProtection: BranchProtection.BRANCH_PROTECTION_UNSPECIFIED,
            },
            compiler: {
                name: 1,
                version: ''
            },
            defaultConfiguration: {
                compiler: {
                    name: 0,
                    version: ''
                }
            }
        };
        expect(result.toObject()).toEqual(expected);
    });

    it('build solution data that contains projects with similar paths', () => {
        const processor = processorDataFactory({ trustzone: 'off' });
        const projectReferences: ProjectReference[] = [{ reference: 'Correct-Path', forContext: [], notForContext: [] }];
        const solution: ParsedFile<Solution> = {
            file: {
                path: '',
                value: { projects: projectReferences, targetTypes: [], packs: [], buildTypes: [], compiler: '', processor },
            },
            cloneYamlDocument: expect.any(Function)
        };

        const projects: ParsedProjectFile[] = [
            {
                referencePath: 'Correct-Path',
                cloneYamlDocument: expect.any(Function),
                file: {
                    path: '',
                    value: {
                        description: '',
                        compiler: '',
                        board: '',
                        device: '',
                        components: [{ reference: 'reference:group', forContext: [], notForContext: [], instances: 3 }],
                        processor,
                        packs: [],
                        groups: [],
                        layers: [],
                    },
                },
            },
            {
                referencePath: 'Invalid-Path',
                cloneYamlDocument: expect.any(Function),
                file: {
                    path: '',
                    value: {
                        description: '',
                        compiler: '',
                        board: '',
                        device: '',
                        components: [],
                        processor: emptyProcessorData,
                        packs: [],
                        groups: [],
                        layers: [],
                    },
                },
            }
        ];

        const layers: ParsedLayerFile[] = [
            {
                referencePath: '',
                cloneYamlDocument: expect.any(Function),
                file: {
                    path: '',
                    value: {
                        description: '',
                        compiler: '',
                        board: '',
                        device: '',
                        components: [],
                        processor: emptyProcessorData,
                        packs: [],
                        groups: [],
                    },
                },
            }
        ];
        const componentDatalist = new ComponentData();
        const componentReference = new ComponentReference();
        componentReference.setClassName('reference');
        componentReference.setGroup('group');
        componentDatalist.setReference(componentReference);
        componentDatalist.setForContextsList([]);
        componentDatalist.setNotForContextsList([]);
        componentDatalist.setInstances(3);

        const processorData = new ProcessorData();
        processorData.setFpu(Fpu.FPU_UNSPECIFIED);
        processorData.setTrustzone(Trustzone.TRUSTZONE_OFF);
        processorData.setEndian(Endian.ENDIAN_UNSPECIFIED);

        const projectData = new ProjectData();
        projectData.setId(new ProjectId());
        projectData.setComponentsList([componentDatalist]);
        projectData.setProcessor(processorData);
        projectData.setForContextsList([]);
        projectData.setNotForContextsList([]);

        const result = createSolutionData({ solution, projects, layers });

        const expected = new SolutionData();
        expected.setTargetTypesList([]);
        expected.setBuildTypesList([]);
        expected.setProjectsList([projectData]);
        expected.setPacksList([]);
        expected.setProcessor(processorData);

        expect(result.toObject()).toEqual(expected.toObject());
    });
});

describe('componentStringToComponentRef', () => {
    it('builds a component reference object from a component string', () => {
        const componentString = 'vendor::class&bundle:group:sub&variant@1.0.0';
        const expected: ComponentReference.AsObject = {
            vendor: 'vendor',
            className: 'class',
            bundleName: 'bundle',
            group: 'group',
            subgroup: 'sub',
            variant: 'variant',
            version: '1.0.0',
        };

        const componentRef = componentStringToComponentRef(componentString);

        expect(componentRef.toObject()).toEqual(expected);
    });

    it('builds returns an empty reference if component string invalid', () => {
        const componentString = 'some-invalid-string';
        const expected: ComponentReference.AsObject = {
            vendor: '',
            className: '',
            bundleName: '',
            group: '',
            subgroup: '',
            variant: '',
            version: '',
        };

        const componentRef = componentStringToComponentRef(componentString);

        expect(componentRef.toObject()).toEqual(expected);
    });
});

describe('resolvePacks', () => {
    it('resolves solutions packs to packs defined in the cbuild-pack whilst preserving notForContext', () => {
        const solutionFiles = solutionFilesFactory({
            solution: {
                packs: [
                    { pack: 'dinosaur::raptor', notForContext: '+chicken.dinner', forContext: [] },
                    { pack: 'dinosaur::dodo@1.4.5', forContext: [], notForContext: [] }
                ] }
        });
        const packFile = packFileFactory({
            resolvedPacks: [
                {
                    resolvedPack: 'dinosaur::raptor@1.3.6',
                    selectedByPack: ['dinosaur::raptor', 'dinosaur::trex@1.3.6']
                },
                {
                    resolvedPack: 'dinosaur::dodo@1.4.5',
                    selectedByPack: ['dinosaur::dodo@1.4.5', 'dinosaur::dodo@1.3.6']
                }
            ] }
        );

        const reolvedPacks = createSolutionData({ ...solutionFiles, packFile }).toObject().packsList;
        const expected = [
            packDataFactory({
                reference: { vendor: 'dinosaur', name: 'raptor', version: '1.3.6' },
                notForContextsList: [{ targetType: 'chicken', buildType: 'dinner' }]
            }).toObject(),
            packDataFactory({ reference: { vendor: 'dinosaur', name: 'dodo', version: '1.4.5' } }).toObject()
        ];

        expect(reolvedPacks).toEqual(expected);

    });

    it('resolves projects packs to packs defined in the cbuild-pack file whilst preserving notForContext', () => {
        const solution = parsedSolutionFileFactory({
            projects: [
                { reference: 'raptor', forContext: [], notForContext: [] },
                { reference: 'dodo', forContext: [],  notForContext: [] }
            ]
        });
        const projects = [
            parsedProjectFileFactory({ referencePath: 'raptor', packs: [{ pack: 'dinosaur::raptor', forContext: [], notForContext: [] }] }),
            parsedProjectFileFactory({ referencePath: 'dodo', packs: [{ pack: 'dinosaur::dodo', forContext: [], notForContext: [] }] })
        ];
        const packFile = packFileFactory({
            resolvedPacks: [
                {
                    resolvedPack: 'dinosaur::raptor@1.3.6',
                    selectedByPack: ['dinosaur::raptor', 'dinosaur::trex@1.3.6']
                },
                {
                    resolvedPack: 'dinosaur::dodo@1.4.5',
                    selectedByPack: ['dinosaur::dodo', 'dinosaur::chicken@1.3.6']
                }
            ] }
        );

        const result = createSolutionData({ solution, projects, layers: [parsedLayerFileFactory()], packFile }).toObject();
        const resolvedRaptorPacks = result.projectsList[0].packsList;
        const resolvedDodoPacks = result.projectsList[1].packsList;


        const expectedRaptorPacks = [packDataFactory({ reference: { vendor: 'dinosaur', name: 'raptor', version: '1.3.6' } }).toObject()];
        const expectedDodoPacks = [packDataFactory({ reference: { vendor: 'dinosaur', name: 'dodo', version: '1.4.5' } }).toObject()];

        expect(resolvedRaptorPacks).toEqual(expectedRaptorPacks);
        expect(resolvedDodoPacks).toEqual(expectedDodoPacks);
    });

    it('resolves layers packs to packs defined in the cbuild-pack whilst preserving notForContext', () => {
        const solution = parsedSolutionFileFactory({ projects: [{ reference: 'raptor', forContext: [], notForContext: [] }] });
        const projects = [parsedProjectFileFactory({
            referencePath: 'raptor',
            layers: [
                { reference: 'raptor', forContext: [], notForContext: [] },
                { reference: 'dodo', forContext: [], notForContext: [] }
            ],
        })];
        const layers = [
            parsedLayerFileFactory({ referencePath: 'raptor', packs: [{ pack: 'dinosaur::raptor', forContext: [], notForContext: [] }] }),
            parsedLayerFileFactory({ referencePath: 'dodo', packs: [{ pack: 'dinosaur::dodo', forContext: [], notForContext: [] }] })
        ];
        const packFile = packFileFactory({
            resolvedPacks: [
                {
                    resolvedPack: 'dinosaur::raptor@1.3.6',
                    selectedByPack: ['dinosaur::raptor', 'dinosaur::trex@1.3.6']
                },
                {
                    resolvedPack: 'dinosaur::dodo@1.4.5',
                    selectedByPack: ['dinosaur::dodo', 'dinosaur::chicken@1.3.6']
                }
            ] }
        );

        const result = createSolutionData({ solution, projects, layers, packFile }).toObject();
        const resolvedRaptorPacks = result.layersList[0].packsList;
        const resolvedDodoPacks = result.layersList[1].packsList;


        const expectedRaptorPacks = [packDataFactory({ reference: { vendor: 'dinosaur', name: 'raptor', version: '1.3.6' } }).toObject()];
        const expectedDodoPacks = [packDataFactory({ reference: { vendor: 'dinosaur', name: 'dodo', version: '1.4.5' } }).toObject()];

        expect(resolvedRaptorPacks).toEqual(expectedRaptorPacks);
        expect(resolvedDodoPacks).toEqual(expectedDodoPacks);
    });
});
