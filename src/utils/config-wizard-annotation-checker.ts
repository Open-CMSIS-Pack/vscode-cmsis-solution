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

import { readTextFile } from './fs-utils';

export interface ConfigWizardAnnotationChecker {
    hasAnnotations(filePath: string): Promise<boolean>;
}

class ConfigWizardAnnotationCheckerImpl implements ConfigWizardAnnotationChecker {
    private static readonly MAX_LINES_TO_SCAN = 100;
    private static readonly wizardStartMarkerRegex = /^\s*\/\/.*<<<\s*use configuration wizard in context menu\s*>>>.*$/i;

    public async hasAnnotations(filePath: string): Promise<boolean> {
        const fileContent = readTextFile(filePath);
        const lines = fileContent.split(/\r?\n/);

        const maxLines = Math.min(ConfigWizardAnnotationCheckerImpl.MAX_LINES_TO_SCAN, lines.length);
        for (let i = 0; i < maxLines; i++) {
            if (ConfigWizardAnnotationCheckerImpl.wizardStartMarkerRegex.test(lines[i])) {
                return true;
            }
        }

        return false;
    }
}

export const configWizardAnnotationChecker: ConfigWizardAnnotationChecker =
    new ConfigWizardAnnotationCheckerImpl();
