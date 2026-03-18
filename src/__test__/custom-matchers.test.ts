/**
 * Copyright 2024-2026 Arm Limited
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

import dedent from 'dedent';

describe('Test custom matchers', () => {
    describe('yamlEquals', () => {
        it('toEqual passes on exact yaml strings', () => {
            const yaml = `myYaml:
                someContent: Its a string.
            `;
            expect(yaml).toEqual(expect.yamlEquals(yaml));
        });

        it('toEqual passes on equal yaml strings', () => {
            const yaml1 = `myYaml:
                someContent: Its a string.
                someOtherContent: 42
            `;
            const yaml2 = `myYaml:
                someOtherContent: 42
                someContent: Its a string.
            `;
            expect(yaml1).toEqual(expect.yamlEquals(yaml2));
        });

        it('toEqual passes on equal yaml multi-document strings', () => {
            const yaml1 = dedent`
                ---
                myYaml:
                    someContent: Its a string.
                    someOtherContent: 42
                ---
                anotherDocument:
                    content: 123
                `;
            const yaml2 = dedent`
                anotherDocument:
                    content: 123
                ---
                myYaml:
                    someOtherContent: 42
                    someContent: Its a string.
                `;
            expect(yaml1).toEqual(expect.yamlEquals(yaml2));
        });


        it('not.toEqual passes on different yaml strings', () => {
            const yaml1 = `myYaml:
                someContent: Its a string.
            `;
            const yaml2 = `myYaml:
                someContent: Its another string.
            `;
            expect(yaml1).not.toEqual(expect.yamlEquals(yaml2));
        });

        it('toEqual passes on not equal yaml strings', () => {
            const yaml1 = `myYaml:
                someContent: Its a string.
            `;
            const yaml2 = `myYaml:
                someContent: Its another string.
            `;
            expect(yaml1).toEqual(expect.not.yamlEquals(yaml2));
        });

        it('toEqual creates meaningful message on different yaml strings', () => {
            const yaml1 = `myYaml:
                someContent: Its a string.
            `;
            const yaml2 = `myYaml:
                someContent: Its another string.
            `;

            expect(() => expect(yaml1).toEqual(expect.yamlEquals(yaml2)))
                .toThrow(/Expected:[\s\S]*Its another string[\s\S]*Received:[\s\S]*someContent: Its a string/);
        });

        it('toEqual accepts undefined actual value', () => {
            const yaml = `myYaml:
                someContent: Its a string.
            `;
            expect(() => expect(undefined).toEqual(expect.yamlEquals(yaml)))
                .toThrow(/Expected:[\s\S]*Its a string[\s\S]*Received:[\s\S]*undefined/);
        });

    });

    describe('yamlStrictEquals', () => {
        it('toEqual passes on exact yaml strings', () => {
            const yaml = `myYaml:
                someContent: Its a string.
            `;
            expect(yaml).toEqual(expect.yamlStrictEquals(yaml));
        });

        it('toEqual fails on equal yaml but not identical strings', () => {
            const yaml1 = `myYaml:
                someContent: Its a string.
                someOtherContent: 42
            `;
            const yaml2 = `myYaml:
                someOtherContent: 42
                someContent: Its a string.
            `;
            expect(() => expect(yaml1).toEqual(expect.yamlStrictEquals(yaml2)))
                .toThrow();
        });

        it('not.toEqual passes on different yaml strings', () => {
            const yaml1 = `myYaml:
                someContent: Its a string.
            `;
            const yaml2 = `myYaml:
                someContent: Its another string.
            `;
            expect(yaml1).not.toEqual(expect.yamlStrictEquals(yaml2));
        });

        it('toEqual passes on not equal yaml strings', () => {
            const yaml1 = `myYaml:
                someContent: Its a string.
            `;
            const yaml2 = `myYaml:
                someContent: Its another string.
            `;
            expect(yaml1).toEqual(expect.not.yamlStrictEquals(yaml2));
        });

        it('toEqual creates meaningful message on different yaml strings', () => {
            const yaml1 = `myYaml:
                someContent: Its a string.
            `;
            const yaml2 = `myYaml:
                someContent: Its another string.
            `;

            expect(() => expect(yaml1).toEqual(expect.yamlStrictEquals(yaml2)))
                .toThrow(/Expected:[\s\S]*Its another string[\s\S]*Received:[\s\S]*someContent: Its a string/);
        });

        it('toEqual accepts undefined actual value', () => {
            const yaml = `myYaml:
                someContent: Its a string.
            `;
            expect(() => expect(undefined).toEqual(expect.yamlStrictEquals(yaml)))
                .toThrow(/Expected:[\s\S]*Its a string[\s\S]*Received:[\s\S]*undefined/);
        });

    });

    describe('caseInsensitiveEquals', () => {
        it('toEqual passes on exact strings', () => {
            const str = 'myString';
            expect(str).toEqual(expect.lowercaseEquals(str));
        });

        it('toEqual passes on case different strings', () => {
            const str = 'myString';
            expect(str.toUpperCase()).toEqual(expect.lowercaseEquals(str));
        });

        it('toEqual creates meaningful message on different strings', () => {
            const str = 'myString';
            expect(() => expect(str).toEqual(expect.lowercaseEquals('myOtherString')))
                .toThrow(/Expected:[\s\S]*myOtherString[\s\S]*Received:[\s\S]*myString/);
        });

        it('toEqual accepts undefined actual value', () => {
            const str = 'myString';
            expect(() => expect(undefined).toEqual(expect.lowercaseEquals(str)))
                .toThrow(/Expected:[\s\S]*myString[\s\S]*Received:[\s\S]*undefined/);
        });
    });
});
