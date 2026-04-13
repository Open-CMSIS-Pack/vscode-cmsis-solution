/**
 * Copyright 2024-2026 Arm Limited
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

import path from 'node:path';

/**
 * Name of the package.json manifest, also used to namespace commands.
 */
export const PACKAGE_NAME = 'cmsis-csolution';

export const CONFIG_ROOT = PACKAGE_NAME;
export const CONFIG_CLANGD_GENERATE_SETUP = 'generateClangSetup';
export const CONFIG_EXPERIMENTAL_FEATURES = 'experimentalFeatures';
export const CONFIG_USE_WEBSERVICES = 'useWebServices';
export const CONFIG_ENVIRONMENT_VARIABLES = 'environmentVariables';
export const CONFIG_AUTO_CONFIGURE_TELNET_PORT_MONITOR = 'autoConfigureTelnetPortMonitor';
export const DEFAULT_SOLUTION_GLOB = '**/*.csolution.{yaml,yml}';
export const DEFAULT_OFFER_MICRO_VISION_CONVERSION = true;
export const CONFIG_EXCLUDE = 'exclude';
export const PROJECT_CONTEXT = 'projectFile:';
export const COMPONENT_CONTEXT = 'component:';
export const LAYER_CONTEXT = 'layerFile:';
export const DOC_CONTEXT = 'docFile:';
export const HEADER_CONTEXT = 'headerFile:';
export const LINKER_CONTEXT = 'linkerMapFile:';
export const MERGE_FILE_CONTEXT = 'mergeFile:';
export const PRJ_CONF_CONTEXT = 'prjConfFile:';
export const UV2CSOLUTION_PATH_ENV_VAR = 'UV2CSOLUTION_PATH';
export const CONFIG_DOWNLOAD_MISSING_PACKS = 'downloadPacks';
export const OUTPUT_DIRECTORY = 'outputDirectory';
export const CONFIG_AUTO_DEBUG_LAUNCH = 'autoDebugLaunch';
export const CONFIG_BUILD_OUTPUT_VERBOSITY = 'buildOutputVerbosity';
export const MANAGE_COMPONENTS_PACKS_COMMAND_ID = `${PACKAGE_NAME}.manageComponentsPacks`;

export const MIN_TOOLBOX_VERSION = '2.12.0';

// Clangd settings
export const CONFIG_CLANGD_EXTNAME = 'clangd';
export const CONFIG_CLANGD_ARGUMENTS = 'arguments';

// Output channel name
export const CMSIS_SOLUTION_OUTPUT_CHANNEL = 'CMSIS Solution';

export const TEMPLATES_FOLDER = path.join(__dirname, '..', 'templates');
export const DEBUG_TEMPLATES_FOLDER = path.join(TEMPLATES_FOLDER, 'debug');
export const UV2CSOLUTION_FOLDER = path.join(__dirname, '..', 'tools', 'uv2csolution');
export const DEBUG_ADAPTERS_YAML_FILE_PATH = path.resolve(DEBUG_TEMPLATES_FOLDER, 'debug-adapters.yml');
export const CMSIS_TOOLBOX_FOLDER = path.join(__dirname, '..', 'tools', 'cmsis-toolbox');

export const README_FILE_PATH = path.join(__dirname, '..', 'README.md');
