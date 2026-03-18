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

import { CSolution } from './csolution';
import path from 'path';
import { faker } from '@faker-js/faker';

export type CSolutionMock = jest.MockedObject<CSolution>;

export function csolutionFactory(options: Partial<CSolutionMock> = {}): CSolutionMock {
    const csolutionMock = jest.mocked(new CSolution(), { shallow: true });

    Object.assign(csolutionMock, options);

    csolutionMock.solutionDir ||= path.dirname(csolutionMock.solutionPath) || path.join(faker.system.directoryPath());
    csolutionMock.solutionPath ||= path.join(csolutionMock.solutionDir, `${faker.word.noun()}.csolution.yml`);

    return csolutionMock;
}
