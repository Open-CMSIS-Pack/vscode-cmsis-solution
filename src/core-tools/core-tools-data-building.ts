/**
 * Copyright 2022-2026 Arm Limited
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

import * as SolutionParser from '../solutions/parsing/solution-file';
import * as Project from '../solutions/parsing/project-file';
import * as Common from '../solutions/parsing/common-file-parsing';
import * as Processor from '../solutions/parsing/processor-data-parsing';
import { BuildTypeData, ProcessorData, ProjectData, SolutionData, TargetTypeData, ComponentData, Compiler, BoardReference, Device, ComponentReference, BuildContext, BuildTypeId, TargetTypeId, PackData, ProjectId, LayerData, LayerId, IncludedLayer, DefaultConfigurationData } from './client/solutions_pb';
import { ParsedProjectFile, SolutionFiles, ParsedLayerFile } from '../solutions/parsing/file-loader';
import { deserialiseBoardReference, deserialiseBuildContextID, deserialiseComponentReference, deserialiseDeviceReference, deserialisePackReference } from '../solutions/deserialising/solution-deserialisers';
import { PackReference } from './client/solutions_pb';
import { DefaultConfiguration } from '../solutions/parsing/default-file';
import * as path from 'path';
import { destringifyBranchProtection, destringifyDsp, destringifyEndian, destringifyFpu, destringifyMve, destringifyTrustzone } from './destringify-processor-data';
import { ResolvedPack } from '../solutions/parsing/build-pack-file';
import { changeFileProperty } from '../solutions/parsing/util';

const buildPackList = (packs: Common.PackReference[]): PackData[] =>
    packs.map(pack => {
        const parsedRef = deserialisePackReference(pack.pack);
        const packData = new PackData();
        const packReference = new PackReference();
        packReference.setName(parsedRef?.name || '');
        packReference.setVendor(parsedRef?.vendor || '');
        packReference.setVersion(parsedRef?.version || '');
        packData.setReference(packReference);
        packData.setForContextsList(contextStringOrListToContexts(pack.forContext ?? []));
        packData.setNotForContextsList(contextStringOrListToContexts(pack.notForContext ?? []));
        return packData;
    });

export const compilerNameToEnum = [
    { name: 'GCC', enum: Compiler.Name.GCC },
    { name: 'AC6', enum: Compiler.Name.AC6 },
    { name: 'IAR', enum: Compiler.Name.IAR },
    { name: 'CLANG', enum: Compiler.Name.CLANG },
];

const compilerNameToCompiler = (compilerString?: string): Compiler | undefined => {
    if (!compilerString) {
        return undefined;
    }
    const compiler = new Compiler();
    const compilerEnum = compilerNameToEnum.find(c => c.name === compilerString);
    compiler.setName(compilerEnum?.enum || 0);
    return compiler;
};

const boardStringToBoardRef = (boardString?: string): BoardReference | undefined => {
    if (!boardString) {
        return undefined;
    }
    const parsedBoardRef = deserialiseBoardReference(boardString);
    const boardRef = new BoardReference();
    boardRef.setName(parsedBoardRef.name);
    if (parsedBoardRef.vendor) {
        boardRef.setVendor(parsedBoardRef.vendor || '');
    }
    if (parsedBoardRef.revision) {
        boardRef.setRevision(parsedBoardRef.revision || '');
    }
    return boardRef;
};

const deviceStringToDevice = (deviceString?: string): Device | undefined => {
    if (!deviceString) {
        return undefined;
    }
    const parsedDevice = deserialiseDeviceReference(deviceString);
    const device = new Device();
    device.setName(parsedDevice.name);
    if (parsedDevice.processor) {
        device.setProcessor(parsedDevice.processor || '');
    }
    if (parsedDevice.vendor) {
        device.setVendor(parsedDevice.vendor || '');
    }
    return device;
};

const buildContextFromString = (context: string): BuildContext => {
    const parsedContext = deserialiseBuildContextID(context);
    const buildContext = new BuildContext();
    const buildTypeId = new BuildTypeId();
    buildTypeId.setId(parsedContext.buildType || '');
    buildContext.setBuildTypeId(buildTypeId);
    const targetTypeId = new TargetTypeId();
    targetTypeId.setId(parsedContext.targetType || '');
    buildContext.setTargetTypeId(targetTypeId);

    return buildContext;
};

const contextStringOrListToContexts = (contexts: string[] | string): BuildContext[] => {
    if (typeof contexts === 'string') {
        return [buildContextFromString(contexts)];
    } else {
        const buildContexts: BuildContext[] = [];
        for (const contextString of contexts) {
            buildContexts.push(buildContextFromString(contextString));
        }
        return buildContexts;
    }
};

const buildProcessorData = (processor: Processor.ProcessorData): ProcessorData => {
    const processorData = new ProcessorData();
    processorData.setFpu(destringifyFpu(processor.fpu));
    processorData.setTrustzone(destringifyTrustzone(processor.trustzone));
    processorData.setEndian(destringifyEndian(processor.endian));
    processorData.setDsp(destringifyDsp(processor.dsp));
    processorData.setMve(destringifyMve(processor.mve));
    processorData.setBranchProtection(destringifyBranchProtection(processor['branch-protection']));
    return processorData;
};

const buildTargetTypeData = (targetTypes: SolutionParser.TargetType[]): TargetTypeData[] => {
    return targetTypes.map(tType => {
        const targetTypeData = new TargetTypeData();
        targetTypeData.setId(targetTypeStringToId(tType.type));
        targetTypeData.setBoard(boardStringToBoardRef(tType.board));
        targetTypeData.setDevice(deviceStringToDevice(tType.device));
        targetTypeData.setProcessor(buildProcessorData(tType.processor || Processor.emptyProcessorData));
        targetTypeData.setCompiler(compilerNameToCompiler(tType.compiler));
        return targetTypeData;
    });
};

const buildBuildTypeData = (buildTypes: SolutionParser.BuildType[]): BuildTypeData[] => {
    return buildTypes.map(bType => {
        const buildTypeData = new BuildTypeData();
        buildTypeData.setId(buildTypeStringToId(bType.type));
        buildTypeData.setCompiler(compilerNameToCompiler(bType.compiler));
        buildTypeData.setProcessor(buildProcessorData(bType.processor || Processor.emptyProcessorData));
        return buildTypeData;
    });
};

const buildComponentDataList = (componentList: Common.ComponentData[]): ComponentData[] => {
    return componentList.map(component => {
        const componentData = new ComponentData();
        componentData.setReference(componentStringToComponentRef(component.reference));
        componentData.setForContextsList(contextStringOrListToContexts(component.forContext));
        componentData.setNotForContextsList(contextStringOrListToContexts(component.notForContext));
        componentData.setInstances(component.instances);
        return componentData;
    });
};

const buildDefaultConfiguration = (defaultConfiguration: DefaultConfiguration): DefaultConfigurationData => {
    const defaultConfig = new DefaultConfigurationData();
    defaultConfig.setCompiler(compilerNameToCompiler(defaultConfiguration.defaultConfiguration.compiler));
    return defaultConfig;
};

const buildIncludedLayer = (layerList: Project.LayerReference[], projectPath: string): IncludedLayer[] => {
    return layerList.map(layer => {
        const includedLayer = new IncludedLayer();
        const layerId = new LayerId();
        layerId.setId(path.resolve(path.dirname(projectPath), layer.referencePath ?? layer.reference));
        includedLayer.setId(layerId);
        includedLayer.setForContextsList(contextStringOrListToContexts(layer.forContext));
        includedLayer.setNotForContextsList(contextStringOrListToContexts(layer.notForContext));
        return includedLayer;
    });
};

const buildLayerData = (layers: ParsedLayerFile[], projects: ParsedProjectFile[]): LayerData[] => {
    const buildLayerArray: LayerData[] = [];
    const layerProjectReferences = projects.flatMap(a => a.file.value.layers ?? []);
    if (layers) {
        layers.forEach(layer => {
            const layerReference = layerProjectReferences.find(projectLayer => projectLayer.referencePath === layer.referencePath || projectLayer.reference === layer.referencePath);
            if (layerReference) {
                const layerId = new LayerId();
                layerId.setId(layer.file.path);
                const layerData = new LayerData();
                layerData.setId(layerId);
                layerData.setProcessor(buildProcessorData(layer.file.value.processor || Processor.emptyProcessorData));
                layerData.setComponentsList(buildComponentDataList(layer.file.value.components || []));
                layerData.setBoard(boardStringToBoardRef(layer.file.value.board));
                layerData.setDevice(deviceStringToDevice(layer.file.value.device));
                layerData.setCompiler(compilerNameToCompiler(layer.file.value.compiler));
                layerData.setPacksList(buildPackList(layer.file.value.packs ?? []));
                buildLayerArray.push(layerData);
            }
        });
    }
    return buildLayerArray;
};

const buildProjectData = (solutionProjectReferences: SolutionParser.ProjectReference[], projects: ParsedProjectFile[]): ProjectData[] => {
    const buildProjectArray: ProjectData[] = [];
    projects.forEach(project => {
        const solutionProject = solutionProjectReferences.find(reference => project.referencePath === reference.reference);
        if (solutionProject) {
            const projectId = new ProjectId();
            projectId.setId(project.file.path);
            const projectData = new ProjectData();
            projectData.setId(projectId);
            projectData.setComponentsList(buildComponentDataList(project.file.value.components || []));
            projectData.setBoard(boardStringToBoardRef(project.file.value.board));
            projectData.setDevice(deviceStringToDevice(project.file.value.device));
            projectData.setCompiler(compilerNameToCompiler(project.file.value.compiler));
            projectData.setProcessor(buildProcessorData(project.file.value.processor || Processor.emptyProcessorData));
            projectData.setForContextsList(contextStringOrListToContexts(solutionProject.forContext || []));
            projectData.setNotForContextsList(contextStringOrListToContexts(solutionProject.notForContext || []));
            projectData.setPacksList(buildPackList(project.file.value.packs ?? []));
            projectData.setLayersList(buildIncludedLayer(project.file.value.layers ?? [], project.file.path));
            buildProjectArray.push(projectData);
        }
    });
    return buildProjectArray;
};

export const componentStringToComponentRef = (componentString: string): ComponentReference => {
    const parsedComponent = deserialiseComponentReference(componentString);
    const component = new ComponentReference();
    component.setClassName(parsedComponent.className);
    component.setGroup(parsedComponent.group);
    if (parsedComponent.bundleName) {
        component.setBundleName(parsedComponent.bundleName);
    }
    if (parsedComponent.subgroup) {
        component.setSubgroup(parsedComponent.subgroup);
    }
    if (parsedComponent.variant) {
        component.setVariant(parsedComponent.variant);
    }
    if (parsedComponent.vendor) {
        component.setVendor(parsedComponent.vendor);
    }
    if (parsedComponent.version) {
        component.setVersion(parsedComponent.version);
    }
    return component;
};

const targetTypeStringToId = (targetTypeString: string): TargetTypeId => {
    const id = new TargetTypeId();
    id.setId(targetTypeString);
    return id;
};

const buildTypeStringToId = (buildTypeString: string): BuildTypeId => {
    const id = new BuildTypeId();
    id.setId(buildTypeString);
    return id;
};

/*
 * Accepts Solution files generated from yaml parser and generates gRPC objects
 */
export const createSolutionData = (solutionFiles: SolutionFiles): SolutionData => {
    const { solution, projects, layers, defaultConfiguration } = resolvePacks(solutionFiles);

    const solutionData = new SolutionData();
    solutionData.setTargetTypesList(buildTargetTypeData(solution.file.value.targetTypes));
    solutionData.setBuildTypesList(buildBuildTypeData(solution.file.value.buildTypes));
    solutionData.setProjectsList(buildProjectData(solution.file.value.projects, projects));
    solutionData.setPacksList(buildPackList(solution.file.value.packs || []));
    solutionData.setProcessor(buildProcessorData(solution.file.value.processor || Processor.emptyProcessorData));
    solutionData.setCompiler(compilerNameToCompiler(solution.file.value.compiler));
    solutionData.setLayersList(buildLayerData(layers, projects));
    if (defaultConfiguration) {
        solutionData.setDefaultConfiguration(buildDefaultConfiguration(defaultConfiguration));
    }
    return solutionData;
};

const resolvePacks = (solutionFiles: SolutionFiles): SolutionFiles => {
    if (!solutionFiles.packFile) {
        return solutionFiles;
    }
    const cbuildPacks = solutionFiles.packFile.resolvedPacks;

    const solution = changeFileProperty(solutionFiles.solution, 'packs', resolve(solutionFiles.solution.file.value.packs, cbuildPacks));
    const projects = solutionFiles.projects.map(
        (project): ParsedProjectFile => ({
            ...changeFileProperty(project, 'packs', resolve(project.file.value.packs, cbuildPacks)),
            referencePath: project.referencePath,
        }),
    );
    const layers = solutionFiles.layers.map(
        (layer): ParsedLayerFile => ({
            ...changeFileProperty(layer, 'packs', resolve(layer.file.value.packs, cbuildPacks)),
            referencePath: layer.referencePath,
        }),
    );

    return { ...solutionFiles, solution, projects, layers };
};

const resolve = (packsToResolve: Common.PackReference[] | undefined, cbuildPacks: ResolvedPack[]): Common.PackReference[] => {
    if (!packsToResolve) {
        return [];
    }

    const findResolvedPack = (pack: Common.PackReference): Common.PackReference => {
        const resolvedPack = cbuildPacks.find(cbuildPackNode => cbuildPackNode.selectedByPack.find(selectedPack => selectedPack === pack.pack));
        return resolvedPack ? { pack: resolvedPack.resolvedPack, notForContext: pack.notForContext, forContext: [] } : pack;
    };
    return packsToResolve.map(findResolvedPack);
};
