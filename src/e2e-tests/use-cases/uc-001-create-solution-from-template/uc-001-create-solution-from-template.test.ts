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

import * as path from 'path';
import { test } from '../../fixtures';
import { log } from '../../utils/logger';
import { loadYamlFixture, runWf001DeviceBlankSolution, CreateSolutionFixture } from './workflows/wf-001-device-blank-solution';

test.describe('UC-001 Create Solution From Template', () => {
    test.afterEach(async ({ vsCodeDriver }) => {
        await vsCodeDriver.cleanupTestState();
    });

    test('UC-001 WF-001 Create a solution from the Blank Solution template by selecting a device',
        async ({ vsCodeDriver }, testInfo) => {
            log('info', 'Executing Test:', testInfo.title);
            const fixture = await loadYamlFixture<CreateSolutionFixture>(
                path.resolve(__dirname, 'fixtures', 'wf-001-device-blank-solution.yml'),
            );
            await runWf001DeviceBlankSolution(vsCodeDriver, fixture);
        },
    );
});
