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

import { YAMLMap } from 'yaml';
import { Parser, readOptionalMapFromMap, readOptionalStringFromMap } from './yaml-file-parsing';

export type ProcessorData = {
    trustzone: string;
    fpu: string,
    dsp: string,
    mve: string,
    endian: string,
    'branch-protection': string
}

export const emptyProcessorData: ProcessorData = { trustzone: '', fpu: '', dsp: '', mve: '', endian: '', 'branch-protection': '' };

export const parseProcessorData = (parentMap: YAMLMap): ProcessorData => {
    const processorMap = readOptionalMapFromMap('processor')(parentMap);

    return {
        trustzone: readProcessorString('trustzone')(processorMap),
        fpu: readProcessorString('fpu')(processorMap),
        dsp: readProcessorString('dsp')(processorMap),
        mve: readProcessorString('mve')(processorMap),
        endian: readProcessorString('endian')(processorMap),
        'branch-protection': readProcessorString('branch-protection')(processorMap),
    };
};

const readProcessorString = (key: string): Parser<YAMLMap | undefined, string> => processorMap =>
    processorMap && readOptionalStringFromMap(key)(processorMap) || '';
