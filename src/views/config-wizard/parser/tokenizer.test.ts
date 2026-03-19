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

/*
 * Copyright (C) 2023-2026 Arm Limited
 */

import { Tokenizer, Token } from './tokenizer';

interface result {
    input?: string;
    cmd: Token;
    text: Token;
}

const res: result[] = [
    { input: '// <o0.1..3> Test <1-7:2>',
        cmd:  { text: 'o0.1..3',               items: [ 'o', '0', '.', '1', '..', '3' ] },
        text: { text: 'Test ',                 items: [ 'Test ' ] }, },
    {   cmd:  { text: '1-7:2',                 items: [ '1', '-', '7', ':', '2' ] },
        text: { text: '',                      items: [  ] }, },
    { input: '//   <i> Test description ',
        cmd:  { text: 'i',                     items: [ 'i' ] },
        text: { text: 'Test description ',     items: [ 'Test description ' ] } },
    { input: '//   <1=> Foo ',
        cmd:  { text: '1=',                    items: [ '1', '=' ] },
        text: { text: 'Foo ',                  items: [ 'Foo ' ] } },
    { input: '//   <BAR=> Bar',
        cmd:  { text: 'BAR=',                  items: [ 'BAR', '=' ] },
        text: { text: 'Bar',                   items: [ 'Bar' ] } },
    { input: '//   <LEVEL_3P1=> Level 3P1',
        cmd:  { text: 'LEVEL_3P1=',            items: [ 'LEVEL_3P1', '=' ] },
        text: { text: 'Level 3P1',             items: [ 'Level 3P1' ] } },
    { input: '//   <-7..-4:2>',
        cmd:  { text: '-7..-4:2',              items: [ '-7', '..', '-4', ':', '2' ] },
        text: { text: '',                      items: [  ] } },
    { input: '// <h>Thread Configuration',
        cmd:  { text: 'h',                     items: [ 'h' ] },
        text: { text: 'Thread Configuration',  items: [ 'Thread Configuration' ] } },
    { input: '// </h>',
        cmd:  { text: '/h',                    items: [ '/', 'h' ] },
        text: { text: '',                      items: [  ] } },
    { input: '// <o MODE> Operation Mode',
        cmd:  { text: 'o MODE',                items: [ 'o', ' ', 'MODE' ] },
        text: { text: 'Operation Mode',        items: [ 'Operation Mode' ] } },
    { input: '//     <o.0..15>Language ID <0x0000-0xFCFF>',
        cmd:  { text: 'o.0..15',               items: [ 'o', '.', '0', '..', '15' ] },
        text: { text: 'Language ID ',          items: [ 'Language ID ' ] } },
    {   cmd:  { text: '0x0000-0xFCFF',         items: [ '0x0000', '-', '0xFCFF' ] },
        text: { text: '',                      items: [  ] } },
    { input: '// <i>English (United States) = 0x0409.',
        cmd:  { text: 'i',                     items: [ 'i' ] },
        text: { text: 'English (United States) = 0x0409.', items: [ 'English (United States) = 0x0409.' ] } },
    { input: '//  <a.16 PUBLIC_KEY> Public key for signing <0..255> <f.h>',
        cmd:  { text: 'a.16 PUBLIC_KEY',       items: [ 'a', '.', '16', ' ', 'PUBLIC_KEY' ] },
        text: { text: 'Public key for signing ', items: [ 'Public key for signing ' ] } },
    {   cmd:  { text: '0..255',                items: [ '0', '..', '255' ] },
        text: { text: '',                      items: [  ] } },
    {   cmd:  { text: 'f.h',                   items: [ 'f', '.', 'h' ] },
        text: { text: '',                      items: [  ] } },
    { input: '//  <d> {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00}',
        cmd:  { text: 'd',                     items: [ 'd' ] },
        text: { text: '{0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00}',
            items: [ '{', '0x00', ',', ' 0x00', ',', ' 0x00', ',', ' 0x00', ',', ' 0x00', ',', ' 0x00', ',', ' 0x00', ',', ' 0x00', ',', ' 0x00', ',', ' 0x00', ',', ' 0x00', ',', ' 0x00', ',', ' 0x00', ',', ' 0x00', ',', ' 0x00', ',', ' 0x00', '}' ] } },
    { input: '// <o>Default Thread stack size [bytes] <64-4096:8><#/4>',
        cmd:  { text: 'o',                     items: [ 'o' ] },
        text: { text: 'Default Thread stack size [bytes] ', items: [ 'Default Thread stack size ', '[', 'bytes', ']', ' ' ] } },
    {   cmd:  { text: '64-4096:8',             items: [ '64', '-', '4096', ':', '8' ] },
        text: { text: '',                      items: [  ] } },
    {   cmd:  { text: '#/4',                   items: [ '#', '/', '4' ] },
        text: { text: '',                      items: [  ] } },
];


function prepare(): string[] {
    const lines: string[] = [];
    let lineNo = 0;
    for (const item of res) {
        if (typeof item.input === 'string') {
            lines.push(item.input);
            lineNo++;
        }
        item.cmd.lineNo = lineNo;
        item.text.lineNo = lineNo;
    }
    lines.push(' ');

    return lines;
}

describe('tokenizer', () => {
    const tokenizer = new Tokenizer();

    describe('fetch token block', () => {
        it('fetch and tokenize command and text (description)', () => {
            const lines = prepare();
            let lineNo = 0;
            let testNo = 0;

            for (const line of lines) {
                lineNo++;
                let pos = tokenizer.isAnnotation(line);
                if (lineNo < lines.length) {
                    expect(pos).toBeGreaterThanOrEqual(0);
                } else {
                    expect(pos).toBe(-1);
                    break;
                }

                do {
                    pos = tokenizer.getNextToken(line, pos);
                    expect(pos).toBeGreaterThanOrEqual(0);

                    const cmd = tokenizer.tokenizeCmd(tokenizer.cmd, lineNo);
                    expect(cmd).toEqual(res[testNo].cmd);

                    const text = tokenizer.tokenizeDescr(tokenizer.text, lineNo);
                    expect(text).toEqual(res[testNo].text);

                    testNo++;
                } while (pos < line.length && testNo < res.length);
            }
        });
    });
});
