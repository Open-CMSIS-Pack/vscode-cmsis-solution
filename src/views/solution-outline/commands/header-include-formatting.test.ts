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
import { formatHeaderIncludeForClipboard } from './header-include-formatting';

describe('header include formatting', () => {
    it('aligns a component comment at the reference column', () => {
        const result = formatHeaderIncludeForClipboard('tz_context.h', 'ARM::CMSIS:CORE');

        expect(result).toBe(`${'#include "tz_context.h"'.padEnd(41)}// ARM::CMSIS:CORE\n`);
        expect(result.indexOf('//')).toBe(41);
    });

    it('uses one space before the comment when the include reaches the reference column', () => {
        const header = 'a'.repeat(30);
        const headerInclude = `#include "${header}"`;

        expect(headerInclude).toHaveLength(41);
        expect(formatHeaderIncludeForClipboard(header, 'Vendor::Class:Group'))
            .toBe(`${headerInclude} // Vendor::Class:Group\n`);
    });

    it('uses one space before the comment for a long include', () => {
        const header = `${'a'.repeat(50)}.h`;
        const headerInclude = `#include "${header}"`;

        expect(formatHeaderIncludeForClipboard(header, 'Vendor::Class:Group'))
            .toBe(`${headerInclude} // Vendor::Class:Group\n`);
    });

    it('preserves the plain include for a standalone header', () => {
        expect(formatHeaderIncludeForClipboard('project_config.h'))
            .toBe('#include "project_config.h"\n');
    });
});
