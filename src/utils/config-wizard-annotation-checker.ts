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

import * as fs from 'node:fs';
import * as readline from 'node:readline';

export interface ConfigWizardAnnotationChecker {
    hasAnnotations(filePath: string): Promise<boolean>;
}

class ConfigWizardAnnotationCheckerImpl implements ConfigWizardAnnotationChecker {
    private static readonly MAX_LINES_TO_SCAN = 100;
    private static readonly wizardStartMarkerRegex = /^\s*\/\/.*<<<\s*use configuration wizard in context menu\s*>>>.*$/i;

    public async hasAnnotations(filePath: string): Promise<boolean> {
        if (!fs.existsSync(filePath)) {
            return false;
        }

        const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
        const lineReader = readline.createInterface({
            input: stream,
            crlfDelay: Infinity,
        });

        let lineCount = 0;

        try {
            for await (const line of lineReader) {
                if (ConfigWizardAnnotationCheckerImpl.wizardStartMarkerRegex.test(line)) {
                    return true;
                }

                lineCount += 1;
                if (lineCount >= ConfigWizardAnnotationCheckerImpl.MAX_LINES_TO_SCAN) {
                    return false;
                }
            }

            return false;
        } finally {
            lineReader.close();
            stream.destroy();
        }
    }
}

export const configWizardAnnotationChecker: ConfigWizardAnnotationChecker =
    new ConfigWizardAnnotationCheckerImpl();
