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

import { createDetailedMergeDiagnosticMessage, createMergeCommandUri, createMergeDiagnosticMessage, MERGE_VIEW_LINK_LABEL, parseMergeMessage } from './merge-message-parser';

describe('merge-message-parser', () => {
    it.each([
        'required',
        'recommended',
        'suggested',
        'mandatory',
    ])('parses merge advisory message for status %s', (status) => {
        const line = `file 'C:/workspace/RTE/CMSIS/RTX_Config.c' update ${status}; merge content from update file, rename update file to base file and remove previous base file`;

        const parsed = parseMergeMessage(line);

        expect(parsed).toEqual(expect.objectContaining({
            localPath: 'C:/workspace/RTE/CMSIS/RTX_Config.c',
            updateLevel: status,
        }));
        expect(parsed?.matchLength).toBeGreaterThan(0);
    });

    it('returns undefined for non-merge message', () => {
        expect(parseMergeMessage('warning: unrelated diagnostic')).toBeUndefined();
    });

    it('creates merge command uri with encoded path argument', () => {
        const uri = createMergeCommandUri('C:/workspace/RTE/CMSIS/RTX_Config.c');

        expect(uri).toContain('command:cmsis-csolution.mergeFileFromPath?');
        expect(decodeURIComponent(uri.split('?')[1])).toBe('["C:/workspace/RTE/CMSIS/RTX_Config.c"]');
    });

    it('creates concise problems-view message', () => {
        const message = createMergeDiagnosticMessage('C:/workspace/RTE/CMSIS/RTX_Config.c');

        expect(message).toBe('RTX_Config.c has a new version available for merge.');
        expect(message).not.toContain(MERGE_VIEW_LINK_LABEL);
    });

    it('creates detailed problems-view message for merge advisory diagnostics', () => {
        const message = createDetailedMergeDiagnosticMessage(
            'C:/workspace/RTE/CMSIS/RTX_Config.c',
            'recommended',
            'ARM::CMSIS:RTOS2:Keil RTX5&Source@5.5.4'
        );

        expect(message).toBe(
            'update recommended for config file \'RTX_Config.c\' from component \'CMSIS:RTOS2:Keil RTX5&Source\'.'
        );
    });
});
