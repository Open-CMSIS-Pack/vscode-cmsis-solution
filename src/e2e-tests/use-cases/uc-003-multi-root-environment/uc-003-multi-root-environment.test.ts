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

import * as path from 'node:path';
import { YamlFile } from '@open-cmsis-pack/cmsis-common/yaml-file';
import { ETextFileResult } from '@open-cmsis-pack/cmsis-common/text-file';
import { test, expect } from '../../fixtures';
import { MultiRootFixture, runWf001SwitchSolutions } from './workflows/wf-001-switch-solutions';

test('UC-003 WF-001 Isolate folder environments when switching nested solutions', async ({ vsCodeDriver }) => {
    const fixtureFile = new YamlFile(path.join(__dirname, 'fixtures', 'wf-001-switch-solutions.yml'));
    expect(await fixtureFile.load()).toBe(ETextFileResult.Success);
    await runWf001SwitchSolutions(vsCodeDriver, fixtureFile.content as MultiRootFixture);
});
