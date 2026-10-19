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
import { TerminalOutputFilter } from './terminal-output-filter';

describe('TerminalOutputFilter', () => {
    let filter: TerminalOutputFilter;

    beforeEach(() => {
        filter = new TerminalOutputFilter();
    });

    it('removes CSI sequences', () => {
        expect(filter.write('\x1b[?9001h\x1b[?1004hGenerator output\r\n')).toBe('Generator output\r\n');
    });

    it('removes CSI sequences split across chunks', () => {
        expect(filter.write('\x1b[?90')).toBe('');
        expect(filter.write('01hGenerator output\r\n')).toBe('Generator output\r\n');
    });

    it('removes OSC sequences terminated by BEL or ST', () => {
        expect(filter.write('before\x1b]0;title\x07middle\x1b]8;;https://example.com\x1b\\after')).toBe('beforemiddleafter');
    });

    it('removes control strings split across chunks', () => {
        expect(filter.write('before\x1bPpayload\x1b')).toBe('before');
        expect(filter.write('\\after')).toBe('after');
    });

    it('removes single-character and intermediate escape sequences', () => {
        expect(filter.write('before\x1b7middle\x1b(Bafter')).toBe('beforemiddleafter');
    });

    it('preserves Unicode, tabs, carriage returns, and line feeds', () => {
        expect(filter.write('Grüße\t世界\r\n')).toBe('Grüße\t世界\r\n');
    });

    it('returns empty output for control-only chunks', () => {
        expect(filter.write('\x00\x07\x1b[31m\x7f')).toBe('');
    });
});
