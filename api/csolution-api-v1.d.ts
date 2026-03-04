/**
 * Copyright 2023-2026 Arm Limited
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

import type { Uri } from 'vscode';

export type ManageComponentsContext = {
    /**
     * Absolute path to the csolution file.
     */
    solutionFilePath: string;

    /**
     * Absolute path to the cproject file. Defaults to the first project if not specified.
     */
    projectFilePath?: string;
}

export type SolutionContext = {
    /**
     * Name of the build type (`type` field from the build type)
     */
    buildType?: string;
    /**
     * Name of the target type (`type` field from the target type)
     */
    targetType?: string;
    /**
     * Name of the project to build (project file name without the .cproject.yml extension)
     */
    projectName?: string;
}

export type BuildOptions = {
    /**
     * Absolute path to the csolution file (required).
     */
    solutionPath: string;
    /**
     * Optional context to build.
     */
    context?: SolutionContext;
    /**
     * Should this be a rebuild (clean then build)?
     */
    rebuild?: boolean;
}

/**
 * The selected hardware and toolchain for a specific build type, target type and project combination.
 */
export type HardwareAndToolchainInfo = {
    /**
     * The build type for the context.
     */
    buildType: string;
    /**
     * The target type for the context.
     */
    targetType: string;
    /**
     * The path to the project.
     */
    projectPath: string;
    /**
     * The compiler string, e.g. AC6.
     */
    compiler: string;
    /**
     * Selected device name and vendor.
     */
    device: DeviceId;
    /**
     * Selected processor on the device.
     */
    processorName: string,
    /**
     * Selected board name, vendor and revision.
     */
    board: BoardId | undefined;
    /**
     * Selected device pack name, vendor, version.
     */
    devicePack: PackId;
    /**
     * Selected board pack name, vendor and version.
     */
    boardPack: PackId | undefined;
}

export type BoardId = {
    /**
     * BoardId name
     */
    name: string;
    /**
     * BoardId vendor
     */
    vendor: string;
    /**
     * BoardId revision
     */
    revision: string;
}

export type DeviceId = {
    /**
     * Device name
     */
    name: string;
    /**
     * Device vendor
     */
    vendor: string;
}

export type PackId = {
    /**
     * PackId vendor
     */
    vendor: string;
    /**
     * PackId name
     */
    name: string;
    /**
     * PackId version
     */
    version: string;
}

export type DebugInterface = {
    adapter: string;
    connector: string;
}

export type BoardInfo = {
    id: BoardId;
    // If the board is deprecated or not
    isDeprecated: boolean;
    // Board description
    description: string;
    // Mounted device references
    mountedDevices: DeviceId[];
    // An image for a board. May be an HTTP URL or a file URI.
    image?: Uri;
    // List of debug interfaces
    debugInterfaces: DebugInterface[];
    // The Board Support Pack (BSP) in which the board is defined
    pack: PackId;
    // Documentation links. May be HTTP or file URIs.
    books: Uri[];
}

export type Processor = {
    // Processor name, defines an identifier for the specific processor in a multi-processor device
    name: string;
    // Processor core
    core: string;
    // The number of processing units in a symmetric multi-processor core
    units: number;
    // Specifies the hardware floating point unit
    fpu: 'none' | 'single_precision' | 'double_precision';
    // Specifies the available endian
    endian: 'little' | 'big' | 'configurable';
    // Specifies the memory protection unit
    mpu: boolean;
    // Specifies the processor TrustZone support
    trustZone: boolean;
    // Specifies the processor support for DSP instructions
    dsp: boolean;
    // Specifies the processor Cortex-M vector extensions
    mve: 'none' | 'mve' | 'mve_floating_point';
    // Specifies the maximum core clock frequency
    clock: number;
    // Specifies the revision of the processor
    coreVersion: string;
}

export type DeviceMemory = {
    name: string;
    size: number;
};

export type DeviceInfo = {
    id: DeviceId;
    deviceFamily: DeviceId;
    packId: PackId;
    description: string;
    processors: Processor[];
    memory: DeviceMemory[];
}

export type ExampleEnvironment = {
    /**
     * Example environment toolchain, e.g. 'uv', 'iar', 'cmsis'
     */
    toolchain: string;
    /**
     * Path to the project file, relative to the root of the containing pack.
     */
    projectFile: string;
    /**
     * Path to the project folder, relative to the root of the containing pack.
     */
    folder: string;
}

export interface Example {
    name: string;
    description: string;
    version: string;
    categories: string[];
    keywords: string[];
    environments: ExampleEnvironment[];
    pack: PackId;
}

export type SecurityState = 'off' | 'non-secure' | 'secure';

export type NewProject = {
    name: string;
    processorName: string;
    trustzone: SecurityState;
}

export type NewTargetType = {
    type: string;
    device: DeviceId;
    board?: BoardId;
}

export type NewSolution = {
    // Solution file name without the extension.
    solutionName: string;
    // File URI to the directory where the csolution.yml file will be created.
    solutionDirectory: Uri;
    // List of projects to create.
    projects: NewProject[];
    // List of target types to create.
    targetTypes: NewTargetType[];
    // A compiler supported by CMSIS Toolbox, e.g., AC6.
    compiler: string;
    // packs to be included in the solution
    packs: PackId[];
}

export type CreateNewSolutionOptions = {
    // Create a vcpkg-configuration.json for the new solution. Default true.
    createVcpkgConfiguration: boolean;
    // Initialise a repository in the solution directory. Default true.
    initialiseGitRepository: boolean;
    // Prompt the user to open the solution directory in VS Code. Default true.
    promptToOpen: boolean;
    // Create default launch.json and task.json files. Default true.
    createDebugConfiguration: boolean;
}

export interface CsolutionApiV1 {

   /**
   * List all published CMSIS boards.
   */
    getBoards(): Promise<BoardInfo[]>;

    /**
     * List all published CMSIS devices.
     */
    getDevices(): Promise<DeviceInfo[]>;

    /**
     * Open the Software Components webview in the context of the given csolution and cproject.
     * @returns Promise that resolves when the webview is opened, or rejects if the project could not be found
     */
    manageComponents(context: ManageComponentsContext): Promise<void>;

    /**
     * Convert the given μVision project to Csolution.
     */
    convertΜVisionProjectToCsolution(uVisionProjectUri: Uri): Promise<void>;

    /**
     * Creates a new Csolution with git initialised and vcpkg configured in the location provided.
     * The URI must be an HTTPS URL to a zip archive, containing a csolution or µVision project.
     * Shows a modal offering to open the created solution.
     */
    createSolutionFromUri(sourceUri: Uri, dirLocation: Uri): Promise<void>;

    /**
     * Create a new blank solution for given board/device and options.
     */
    createNewSolution(newSolution: NewSolution, options?: Partial<CreateNewSolutionOptions>): Promise<void>;

    /**
     * Build a csolution, sending output to a terminal.
     * @param buildOptions Absolute path to the csolution (required), and optional context to build
     * @returns Promise that resolves if the build succeeds, or rejects if it fails or the build tools cannot be found
     */
    build(buildOptions: BuildOptions): Promise<void>;

    /**
     * Clean a csolution
     * @param buildOptions Absolute path to the csolution (required), and optional context to build
     * @returns Promise that resolves if the clean succeeds, or rejects if it fails or the build tools cannot be found
     */
    clean(buildOptions: Omit<BuildOptions, 'rebuild'>): Promise<void>;

    /**
     * Get the hardware and toolchain for all build contexts in the given solution.
     * If no solutionFilePath is provided, the active solution will be used.
     */
    getHardwareAndToolchainInfo(solutionFilePath?: string): Promise<HardwareAndToolchainInfo[]>;

    /**
     * Get the examples for the given board.
     */
    getExamplesForBoard(board: BoardId): Promise<Example[]>;

}
