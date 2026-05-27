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

import { buildPackOverviewLink } from './pack-tooltip';

describe('pack-tooltip', () => {
    describe('buildPackOverviewLink', () => {
        it('returns empty string when pack id is missing', () => {
            expect(buildPackOverviewLink(undefined)).toBe('');
            expect(buildPackOverviewLink('')).toBe('');
            expect(buildPackOverviewLink('   ')).toBe('');
        });

        it('returns markdown external-link icon with pack overview URL for valid pack id', () => {
            expect(buildPackOverviewLink('ARM::CMSIS@6.1.0')).toBe(' [$(link-external)](https://www.keil.arm.com/packs/cmsis-arm/)');
        });
    });
});
