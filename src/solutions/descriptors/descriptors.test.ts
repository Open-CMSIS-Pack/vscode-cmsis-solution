/**
 * Copyright 2026 Arm Limited
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
import { contextDescriptorFromString } from './descriptors';

describe('contextDescriptorFromString', () => {
    it.each([
        {
            description: 'canonical context',
            context: 'Project.Debug+Target',
            projectName: 'Project',
            buildType: 'Debug',
            targetType: 'Target',
        },
        {
            description: 'empty context',
            context: '',
            projectName: '',
            buildType: '',
            targetType: '',
        },
        {
            description: 'project name only',
            context: 'Project',
            projectName: 'Project',
            buildType: '',
            targetType: '',
        },
        {
            description: 'project and build type only',
            context: 'Project.Debug',
            projectName: 'Project',
            buildType: 'Debug',
            targetType: '',
        },
        {
            description: 'project and target type only',
            context: 'Project+Target',
            projectName: 'Project',
            buildType: '',
            targetType: 'Target',
        },
        {
            description: 'build and target type only',
            context: '.Debug+Target',
            projectName: '',
            buildType: 'Debug',
            targetType: 'Target',
        },
        {
            description: 'names containing additional delimiters',
            context: 'Project.Name.Debug+Target+Variant',
            projectName: 'Project',
            buildType: 'Name.Debug',
            targetType: 'Target+Variant',
        },
    ])('parses $description using the first delimiter occurrence', ({
        context,
        projectName,
        buildType,
        targetType,
    }) => {
        expect(contextDescriptorFromString(context)).toStrictEqual({
            displayName: context,
            projectName,
            buildType,
            targetType,
        });
    });
});
