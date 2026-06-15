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

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CwComment } from './cw-comment';
import { CwHeading } from './cw-heading';
import { CwOption } from './cw-option';
import { ClearErrors, GetErrors } from './error';
import { Parser } from './parser';

describe('Parser', () => {
    let consoleLogSpy: jest.SpiedFunction<typeof console.log>;

    beforeEach(() => {
        ClearErrors();
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
    });

    describe('findAnnotationStart', () => {
        it('finds a semicolon-prefixed configuration section and records its bounds', () => {
            const parser = new Parser();

            const annotationStart = parser.findAnnotationStart([
                'load = 1',
                '  ; <<< use configuration wizard in context menu >>>',
                '; <h> Clock setup',
                '; <<< end of configuration section >>>',
                'ignored = 1'
            ]);

            expect(annotationStart).toEqual({ start: 1, end: 3 });
            expect(parser.lineCommentPrefix).toBe(';');
        });

        it('uses the file end when the end marker is missing', () => {
            const parser = new Parser();

            const annotationStart = parser.findAnnotationStart([
                '// <<< use configuration wizard in context menu >>>',
                '// <h> Clock setup',
                '#define CLOCK_ENABLE 1'
            ]);

            expect(annotationStart).toEqual({ start: 0, end: 3 });
        });

        it('ignores marker text that is not inside a supported line comment', () => {
            const parser = new Parser();

            const annotationStart = parser.findAnnotationStart([
                '<<< use configuration wizard in context menu >>>',
                '// <h> Clock setup',
                '// <<< end of configuration section >>>'
            ]);

            expect(annotationStart).toBeUndefined();
        });
    });

    describe('dispatch routing through parse', () => {
        it('routes headings and sibling controls into the returned tree', () => {
            const parser = new Parser();

            const root = parser.parse([
                '// <<< use configuration wizard in context menu >>>',
                '// <h> Clock setup',
                '//   <o0> Clock source',
                '//     <0=> Internal oscillator',
                '//     <1=> External oscillator',
                '//   <0-3> Valid clock source range',
                '//   <d> Default clock source',
                '//   <i> Select the active source',
                '//   <q1.0> Enable clock output',
                '// </h>',
                '// <<< end of configuration section >>>'
            ]);

            expect(root).toBeDefined();
            expect(root?.lineCommentPrefix).toBe('//');

            const children = root?.getChildren() ?? [];
            expect(children).toHaveLength(1);

            const heading = children[0];
            expect(heading).toBeInstanceOf(CwHeading);
            expect(heading.description.getText()).toBe('Clock setup');
            expect(heading.getChildren()).toHaveLength(2);

            const [sourceOption, enableOption] = heading.getChildren();
            expect(sourceOption).toBeInstanceOf(CwOption);
            expect(sourceOption.description.getText()).toBe('Clock source');
            expect((sourceOption as CwOption).getOptions().map(option => option.description.getText())).toEqual([
                'Internal oscillator',
                'External oscillator'
            ]);
            expect((sourceOption as CwOption).range.range.getText()).toBe('start: 0, end: 3, step: 1');
            expect(sourceOption.getDefaults()).toHaveLength(1);
            expect(sourceOption.getDefaults()[0].getType()).toBe('Default');
            expect(sourceOption.getInfos()).toHaveLength(1);
            expect(sourceOption.getInfos()[0].description.getText()).toBe('Select the active source');

            expect(enableOption).toBeInstanceOf(CwOption);
            expect(enableOption.description.getText()).toBe('Enable clock output');
            expect((enableOption as CwOption).isBool).toBe(true);
            expect(GetErrors()).toEqual([]);
        });

        it('routes comment blocks as heading children and closes them at their end tag', () => {
            const parser = new Parser();

            const root = parser.parse([
                '// <<< use configuration wizard in context menu >>>',
                '// <h> Feature setup',
                '//   <c> Optional block',
                '#define OPTIONAL_FEATURE 1',
                '//   </c>',
                '//   <o0> Next setting',
                '// </h>',
                '// <<< end of configuration section >>>'
            ]);

            const heading = root?.getChildren()[0];
            const [comment, nextSetting] = heading?.getChildren() ?? [];

            expect(comment).toBeInstanceOf(CwComment);
            expect(comment.description.getText()).toBe('Optional block');
            expect(comment.lineNoEnd).toBe(4);
            expect(nextSetting).toBeInstanceOf(CwOption);
            expect(nextSetting.description.getText()).toBe('Next setting');
            expect(GetErrors()).toEqual([]);
        });
    });
});
