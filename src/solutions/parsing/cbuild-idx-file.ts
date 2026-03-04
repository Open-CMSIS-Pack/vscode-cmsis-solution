/**
 * Copyright 2024-2026 Arm Limited
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

/**
 *  Types representing nodes in cbuld-idx file
 */


export type CbuildIdx = {
  cbuildRefs  : CbuildIdxReference[];
  configurations: CBuildIdxConfigurations[];
};

export type CbuildIdxReference = {
  path: string;
  // projectName: string;
  // configuration: string;
  // layers: Layer[]
};

export type CBuildIdxConfigurations = {
  targetType: string;
  targetConfigurations: CBuildIdxTargetConfigurations[];
};

export type CBuildIdxTargetConfigurations = {
  configuration: string;
  variables: CBuildIdxVariables[];
};

export type CBuildIdxVariables = {
  variableName: string;
  variableValue: string;
  description: string;
  path: string;
  file: string;
  copyTo: string;
  settings: CBuildIdxSettings[];
};

export type CBuildIdxSettings = {
  set: string;
}
