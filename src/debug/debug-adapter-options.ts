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

import type { UISectionChildren } from './debug-adapters-yaml-file';

/** Numeric option metadata used for display values and edits. */
type NumberOption = Extract<UISectionChildren, { type: 'number' }>;

/** Chooses the existing fallback in display units without changing the option definition. */
function numberFallback(option: NumberOption): number {
    return option.default ?? option.range?.[1] ?? 0;
}

/** Reads a stored number in display units, retaining fractional values until they are edited. */
export function readNumberOption(option: NumberOption, raw: string | undefined): number {
    const fallback = numberFallback(option);
    const value = raw === undefined ? fallback : Number(raw) / (option.scale ?? 1);
    return Number.isFinite(value) ? value : fallback;
}

/** Bounds and truncates an edited display value, then scales it into finite storage units. */
export function normalizeNumberOption(option: NumberOption, input: string | number): number | undefined {
    const numeric = typeof input === 'string' ? parseFloat(input) : input;
    const value = Number.isFinite(numeric) ? numeric : numberFallback(option);
    const bounded = Math.min(Math.max(value, option.range?.[0] ?? -Infinity), option.range?.[1] ?? Infinity);
    const stored = Math.trunc(bounded) * (option.scale ?? 1);
    return Number.isFinite(stored) ? stored : undefined;
}

/** Converts a declared default to storage units, leaving unspecified defaults absent. */
export function storedOptionDefault(option: UISectionChildren): string | number | undefined {
    if (option.default === undefined) {
        return undefined;
    }
    return option.type === 'number' ? Number(option.default) * (option.scale ?? 1) : option.default;
}
