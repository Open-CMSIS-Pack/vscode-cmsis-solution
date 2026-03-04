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

import { Template } from '../../../../core-tools/client/packs_pb';
import { TreeViewCategory } from '../../../common/components/tree-view';
import { DeviceHardwareOption, NewProject, ProcessorInfo, Trustzone, validTrustZone } from '../../cmsis-solution-types';
import { FieldAndInteraction, hadInteraction } from './field-and-interaction';

export type CSolutionTemplate = {
    name: string;
    description: string;
    origin?: Template.AsObject;
}

export const blankTemplate: CSolutionTemplate = { name: 'Blank solution', description: 'Start from scratch with a main.c and CMSIS device startup' };
export const trustZoneTemplate: CSolutionTemplate = { name: 'TrustZone solution', description: 'Start from scratch with secure/non-secure project' };
const staticTemplates: CSolutionTemplate[] = [
    blankTemplate,
    trustZoneTemplate,
];

function dataManagerHasTemplates(datamanagerApps?: Array<TreeViewCategory<string>>): boolean {
    if (!datamanagerApps) {
        return false;
    }

    if (datamanagerApps.some(item => item.header == 'Templates')) {
        return true;
    }

    if (datamanagerApps.some(item => item.header == 'Local' && item.categories.some(subItem => subItem.header == 'Templates'))) {
        return true;
    }

    return false;
}

export const hardwareTemplateOptions = (deviceSelection?: DeviceHardwareOption, templates?: Template.AsObject[], datamanagerApps?: Array<TreeViewCategory<string>>): CSolutionTemplate[] => {
    if (dataManagerHasTemplates(datamanagerApps)) {
        return [];
    }

    if (templates?.length) {
        return templates.map<CSolutionTemplate>(o => ({
            name: o.name,
            description: o.description,
            origin: o,
        }));
    }
    if (!deviceSelection) { return staticTemplates; }
    const processors = deviceSelection?.processors ?? [];
    const valid = processors.some(processor => validTrustZone(processor));
    return valid ? staticTemplates : [blankTemplate];
};

export const toValidProjectName = (input: string) => input.replace(/ /g, '_').replace(/[^\w-]/g, '');

export const createProjectsForTemplateAndHardware = (
    deviceSelection: DeviceHardwareOption,
    template: CSolutionTemplate,
): FieldAndInteraction<NewProject>[] => {
    // FIXME: copy template from pack if origin is defined
    const createProjectName = (trustzone: Trustzone, processorName: string): string => {
        if (trustzone === 'off') {
            if (processorName) {
                return toValidProjectName(processorName);
            } else {
                return 'Project';
            }
        } else {
            const trustZoneText = trustzone === 'non-secure' ? 'NonSecure' : 'Secure';

            if (processorName) {
                return toValidProjectName(`${processorName}_${trustZoneText}`);
            } else {
                return trustZoneText;
            }
        }
    };

    const newProjectConstructor = (processor: ProcessorInfo, trustzone: Trustzone): FieldAndInteraction<NewProject> => hadInteraction({
        name: createProjectName(trustzone, processor.name),
        processorName: processor.name,
        trustzone,
    });

    const createProjectsForProcessor = (processor: ProcessorInfo, isTrustzoneTemplate: boolean): FieldAndInteraction<NewProject>[] => {
        const processorSupportsTrustzone = validTrustZone(processor);
        const enableTrustzone = isTrustzoneTemplate && processorSupportsTrustzone;
        const trustzoneOptions: Trustzone[] = enableTrustzone ? ['secure', 'non-secure'] : ['off'];
        return trustzoneOptions.map(trustzone => newProjectConstructor(processor, trustzone));
    };

    const projects = deviceSelection.processors.flatMap(
        processor => createProjectsForProcessor(processor, template.name === 'TrustZone solution')
    );

    return projects;
};
