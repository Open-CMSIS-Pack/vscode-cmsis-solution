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

import path from 'path';
import { TestDataHandler } from '../__test__/test-data';
import { writeTextFile } from './fs-utils';
import { configWizardAnnotationChecker } from './config-wizard-annotation-checker';

describe('configWizardAnnotationChecker', () => {
    const testDataHandler = new TestDataHandler();
    let testFolder: string;

    beforeEach(() => {
        testFolder = testDataHandler.tmpDir;
    });

    afterEach(() => {
        testDataHandler.rmTmpDir();
    });

    afterAll(() => {
        testDataHandler.dispose();
    });

    it('returns true when start marker is within first 100 lines', async () => {
        const filePath = path.join(testFolder, 'within-100.h');
        const lines = Array.from({ length: 99 }, () => 'int x = 0;');
        lines.push('// <<< Use Configuration Wizard in Context Menu >>>');
        writeTextFile(filePath, lines.join('\n'));

        await expect(configWizardAnnotationChecker.hasAnnotations(filePath)).resolves.toBe(true);
    });

    it('returns false when start marker appears after first 100 lines', async () => {
        const filePath = path.join(testFolder, 'after-100.h');
        const lines = Array.from({ length: 100 }, () => 'int y = 1;');
        lines.push('// <<< Use Configuration Wizard in Context Menu >>>');
        writeTextFile(filePath, lines.join('\n'));

        await expect(configWizardAnnotationChecker.hasAnnotations(filePath)).resolves.toBe(false);
    });

    it('returns true when start marker is within first 100 lines and end marker is after 100 lines', async () => {
        const filePath = path.join(testFolder, 'end-after-100.h');
        const lines = Array.from({ length: 39 }, () => 'int cfg = 3;');
        lines.push('// <<< Use Configuration Wizard in Context Menu >>>');
        lines.push(...Array.from({ length: 90 }, () => 'int body = 4;'));
        lines.push('// <<< end of configuration section >>>');
        writeTextFile(filePath, lines.join('\n'));

        await expect(configWizardAnnotationChecker.hasAnnotations(filePath)).resolves.toBe(true);
    });

    it('returns false when only end marker is present', async () => {
        const filePath = path.join(testFolder, 'end-only.h');
        writeTextFile(filePath, '// <<< end of configuration section >>>\nint z = 2;\n');

        await expect(configWizardAnnotationChecker.hasAnnotations(filePath)).resolves.toBe(false);
    });

    it('returns true for decorated marker lines used in template headers', async () => {
        const filePath = path.join(testFolder, 'decorated-marker.h');
        const lines = [
            '/* header */',
            '//-------- <<< Use Configuration Wizard in Context Menu >>> --------------------',
            'int cfg = 0;'
        ];
        writeTextFile(filePath, lines.join('\n'));

        await expect(configWizardAnnotationChecker.hasAnnotations(filePath)).resolves.toBe(true);
    });
});
