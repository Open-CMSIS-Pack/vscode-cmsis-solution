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
import { setupPacks } from './setup';
import { loadYamlFixture, runWf001RefAppFVPSolution, CreateSolutionFixture } from './workflows/wf-001-refapp-fvp-solution';

test.describe('Create CMSIS Solution from Reference Application with FVP', () => {
    let fixture: CreateSolutionFixture;

    test.beforeAll(async () => {
        fixture = await loadYamlFixture<CreateSolutionFixture>(
            path.resolve(__dirname, 'fixtures', 'wf-001-refapp-fvp-solution.yml'),
        );
        await setupPacks(fixture.required_packs);
    });

    test.afterEach(async ({ vsCodeDriver }) => {
        await vsCodeDriver.cleanupTestState();
    });

    test('UC-002 WF-001 Create CMSIS Solution from Reference Application with FVP',
        async ({ vsCodeDriver }, testInfo) => {
            log('info', 'Executing Test:', testInfo.title);
            await runWf001RefAppFVPSolution(vsCodeDriver, fixture);
        },
    );
});
