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

import { getIndentString } from '../../../utils/string-utils';

const HEADER_COMMENT_REFERENCE_COLUMN = 41;

function createHeaderInclude(header: string): string {
    return `#include "${header}"`;
}

function createHeaderComment(componentName: string): string {
    return `// ${componentName}`;
}

export function formatHeaderIncludeForClipboard(header: string, componentName?: string): string {
    const headerInclude = createHeaderInclude(header);
    if (!componentName) {
        return `${headerInclude}\n`;
    }

    const indentation = Math.max(1, HEADER_COMMENT_REFERENCE_COLUMN - headerInclude.length);
    return `${headerInclude}${getIndentString(indentation, 1)}${createHeaderComment(componentName)}\n`;
}

export function formatHeaderQuickPickLabel(header: string, componentName?: string): string {
    const headerInclude = createHeaderInclude(header);
    return componentName
        ? `${headerInclude} ${createHeaderComment(componentName)}`
        : headerInclude;
}
