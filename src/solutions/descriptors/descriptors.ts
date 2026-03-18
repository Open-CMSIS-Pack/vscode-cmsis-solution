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

import '../../generic/map';
import { splitInTwo } from '../../utils/string-utils';


/**
 * Descriptor is a base interface to represent display label.
 * Used to represent files in the UI while maintaining reference to their actual location.
 */
export interface DescriptorBase {
    displayName: string;
}


/**
 * File descriptor combines an absolute file path with a user-friendly display label.
 * Used to represent files in the UI while maintaining reference to their actual location.
 */
export interface FileDescriptor extends DescriptorBase{
    absolutePath: string;
}

/**
 * Descriptor for CMSIS layer files that extends FileDescriptor with layer type information.
 * Represents layer files (.clayer.yml or .cgen.yml) with their file path, display label, and type classification.
 */
export interface LayerDescriptor extends FileDescriptor{
    type?: string;
}


/**
 * Descriptor for a CMSIS build context that defines a specific build configuration.
 * Represents a combination of build type, target type, project, and associated layers.
 */
export interface ContextDescriptor extends DescriptorBase{
    buildType: string;
    targetType: string;
    projectName: string;
    projectPath?: string;
    layers?: LayerDescriptor[];
}

/**
 * Creates a ContextDescriptor from a context string
 * @param context context string in format "projectName.buildType+targetType"
 * @returns ContextDescriptor with parsed components and original string as displayName
 */
export function contextDescriptorFromString(context: string): ContextDescriptor {
    const [config, targetType ] = splitInTwo(context, '+');
    const [projectName, buildType] = splitInTwo(config, '.');
    return {
        displayName : context,
        buildType: buildType,
        targetType: targetType,
        projectName:projectName,
    };
}
