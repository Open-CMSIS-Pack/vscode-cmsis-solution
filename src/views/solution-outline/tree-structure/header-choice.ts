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

export type HeaderOrigin = 'api' | 'component';

export interface HeaderCandidate {
    include: string;
    origin: HeaderOrigin;
    resourcePath?: string;
}

export interface HeaderChoice {
    include: string;
    origins: readonly HeaderOrigin[];
    resourcePaths: readonly string[];
}

// Combines candidates in their supplied priority order. Candidates producing
// the same include statement are represented by a single choice.
export function createHeaderChoices(candidates: readonly HeaderCandidate[]): HeaderChoice[] {
    const choicesByInclude = new Map<string, HeaderChoice>();

    for (const candidate of candidates) {
        const existingChoice = choicesByInclude.get(candidate.include);
        if (!existingChoice) {
            choicesByInclude.set(candidate.include, {
                include: candidate.include,
                origins: [candidate.origin],
                resourcePaths: candidate.resourcePath ? [candidate.resourcePath] : [],
            });
            continue;
        }

        const hasOrigin = existingChoice.origins.includes(candidate.origin);
        const hasResourcePath = !candidate.resourcePath || existingChoice.resourcePaths.includes(candidate.resourcePath);
        if (!hasOrigin || !hasResourcePath) {
            choicesByInclude.set(candidate.include, {
                ...existingChoice,
                origins: hasOrigin ? existingChoice.origins : [...existingChoice.origins, candidate.origin],
                resourcePaths: hasResourcePath
                    ? existingChoice.resourcePaths
                    : [...existingChoice.resourcePaths, candidate.resourcePath!],
            });
        }
    }

    return [...choicesByInclude.values()];
}
