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

import { ITreeItem, CTreeItem } from '../generic/tree-item';

/**
 * Checks if a value matches a pattern, supporting both direct string comparison and regular expressions.
 * @param value   The string to test.
 * @param pattern The string or regex pattern to match against.
 * @returns True if value matches pattern, false otherwise.
 */
export function matchesStringOrRegExp(value?: string, pattern?: string): boolean {
    if (value === pattern) {
        return true;
    }
    return matchPatternAsRegExp(value ?? '', pattern);
}
/**
 * Matches the input against the pattern as a regular expression if pattern starts with '\\'.
 * Returns false if pattern is not a regex or if regex is invalid.
 * @param input   The string to match.
 * @param pattern The pattern, possibly a regex (starting with '\\').
 */
function matchPatternAsRegExp(input: string, pattern?: string): boolean {
    if (pattern?.startsWith('\\')) {
        try {
            const regex = new RegExp(pattern.slice(1));
            return regex.test(input);
        } catch {
            return false;
        }
    }
    return false;
}

export function arrayContainsValue(value?: string, arr?: string[]): boolean {
    if (!arr || !value) {
        return false;
    }
    return arr.some(entry => matchesStringOrRegExp(value, entry));
}

/**
 * Parses a context string of the form [project][.build-type][+target-type] into its components.
 * @param context The context string.
 * @returns [project, buildType, targetType]
 */
export function parseContext(context?: string): [string?, string?, string?] {
    if (!context) {
        return [undefined, undefined, undefined];
    }

    // Regex: ([^.+]+)?(?:\.([^+]+))?(?:\+(.+))?
    const match = context.match(/^(?:([^.+]+))?(?:\.([^+]+))?(?:\+(.+))?$/);

    if (!match) {
        return [context, undefined, undefined];
    }

    // Convert empty string to undefined for wildcard logic
    return [match[1] || undefined, match[2] || undefined, match[3] || undefined];
}

/**
 * Checks if the pattern context matches the actual context, using prefix matching.
 * Each part (project, buildType, targetType) can be a string or regex.
 * The pattern is a prefix: only specified parts must match.
 */
function contextPatternMatches(context: string, pattern?: string): boolean {
    if (!pattern) {
        return true; // matches all
    }
    if (context === pattern) {
        return true;
    }
    if (matchPatternAsRegExp(context, pattern)) {
        return true;
    }
    const [cProj, cBuild, cTarget] = parseContext(context);
    const [pProj, pBuild, pTarget] = parseContext(pattern);
    // Only compare if the pattern part is defined (not undefined)
    if ((pProj && pProj !== cProj) || (pBuild && pBuild !== cBuild) || (pTarget && pTarget !== cTarget)) {
        return false;
    }
    return true;
}

export function matchesContext(item?: ITreeItem<CTreeItem>, context?: string): boolean {
    if (!item) {
        return false;
    }
    if (!context) {
        return true; // means any context
    }
    const forContext = item.getValuesAsArray('for-context');
    if (forContext.length > 0) {
        // At least one for-context pattern must match the context
        return forContext.some(pattern => contextPatternMatches(context, pattern));
    }
    const notForContext = item.getValuesAsArray('not-for-context');
    if (notForContext.length > 0) {
        // If any not-for-context pattern matches, exclude
        return !notForContext.some(pattern => contextPatternMatches(context, pattern));
    }
    return true;
}
