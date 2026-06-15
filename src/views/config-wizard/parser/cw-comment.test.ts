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

import { GuiValue } from '../confwiz-webview-common';
import { CwComment } from './cw-comment';
import { ClearErrors } from './error';
import { Tokenizer } from './tokenizer';

const tokenizer = new Tokenizer();

function createComment(command: string, lineNoEnd: number): CwComment {
    const comment = new CwComment();
    comment.addProperty(
        tokenizer.tokenizeCmd(command, 0),
        tokenizer.tokenizeDescr('Toggle block', 0),
        0
    );
    comment.lineNoEnd = lineNoEnd;

    return comment;
}

function makeGuiValue(value: string): GuiValue {
    return { value, readOnly: false };
}

describe('CwComment', () => {
    beforeEach(() => {
        ClearErrors();
    });

    describe('multi-line comment toggling', () => {
        it('reports an uncommented block as checked and produces edits to comment each line', () => {
            const lines = [
                '// <c> Toggle block',
                'line_a',
                '    line_b',
                '// </c>'
            ];
            const comment = createComment('c', 3);

            const guiValue = comment.getGuiValue(lines);
            const newValue = makeGuiValue('0');

            expect(guiValue.value).toBe('1');
            expect(guiValue.checked).toBe(true);
            expect(comment.setGuiValue(lines, newValue)).toBe(true);
            expect(newValue.multiEdit).toEqual([
                { text: '//', editRect: { line: 1, col: { start: 0, end: 0 } } },
                { text: '//', editRect: { line: 2, col: { start: 4, end: 4 } } }
            ]);
        });

        it('reports a commented block as unchecked and produces edits to uncomment each line', () => {
            const lines = [
                '// <c> Toggle block',
                '//line_a',
                '    //line_b',
                '// </c>'
            ];
            const comment = createComment('c', 3);

            const guiValue = comment.getGuiValue(lines);
            const newValue = makeGuiValue('1');

            expect(guiValue.value).toBe('0');
            expect(guiValue.checked).toBe(false);
            expect(comment.setGuiValue(lines, newValue)).toBe(true);
            expect(newValue.multiEdit).toEqual([
                { text: '', editRect: { line: 1, col: { start: 0, end: 2 } } },
                { text: '', editRect: { line: 2, col: { start: 4, end: 6 } } }
            ]);
        });
    });

    describe('negated multi-line comment toggling', () => {
        it('reports an uncommented block as unchecked and produces edits to comment each line when checked', () => {
            const lines = [
                '// <!c> Toggle block',
                'line_a',
                '    line_b',
                '// </c>'
            ];
            const comment = createComment('!c', 3);

            const guiValue = comment.getGuiValue(lines);
            const newValue = makeGuiValue('1');

            expect(guiValue.value).toBe('0');
            expect(guiValue.checked).toBe(false);
            expect(comment.setGuiValue(lines, newValue)).toBe(true);
            expect(newValue.multiEdit).toEqual([
                { text: '//', editRect: { line: 1, col: { start: 0, end: 0 } } },
                { text: '//', editRect: { line: 2, col: { start: 4, end: 4 } } }
            ]);
        });

        it('reports a commented block as checked and produces edits to uncomment each line when unchecked', () => {
            const lines = [
                '// <!c> Toggle block',
                '//line_a',
                '    //line_b',
                '// </c>'
            ];
            const comment = createComment('!c', 3);

            const guiValue = comment.getGuiValue(lines);
            const newValue = makeGuiValue('0');

            expect(guiValue.value).toBe('1');
            expect(guiValue.checked).toBe(true);
            expect(comment.setGuiValue(lines, newValue)).toBe(true);
            expect(newValue.multiEdit).toEqual([
                { text: '', editRect: { line: 1, col: { start: 0, end: 2 } } },
                { text: '', editRect: { line: 2, col: { start: 4, end: 6 } } }
            ]);
        });
    });
});
