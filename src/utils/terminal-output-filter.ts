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

enum FilterState {
    Text,
    Escape,
    EscapeIntermediate,
    Csi,
    Osc,
    ControlString,
    OscEscape,
    ControlStringEscape,
}

const ESC = 0x1B;
const DELETE = 0x7F;
const CSI = 0x9B;
const ST = 0x9C;
const OSC = 0x9D;

export class TerminalOutputFilter {
    private state = FilterState.Text;

    public write(data: string): string {
        let output = '';

        for (const character of data) {
            const codePoint = character.codePointAt(0)!;

            switch (this.state) {
                case FilterState.Text:
                    output += this.filterTextCharacter(character, codePoint);
                    break;
                case FilterState.Escape:
                    this.handleEscape(codePoint);
                    break;
                case FilterState.EscapeIntermediate:
                    if (codePoint >= 0x30 && codePoint <= 0x7E) {
                        this.state = FilterState.Text;
                    } else if (codePoint === ESC) {
                        this.state = FilterState.Escape;
                    }
                    break;
                case FilterState.Csi:
                    if (codePoint >= 0x40 && codePoint <= 0x7E) {
                        this.state = FilterState.Text;
                    } else if (codePoint === ESC) {
                        this.state = FilterState.Escape;
                    }
                    break;
                case FilterState.Osc:
                    if (codePoint === 0x07 || codePoint === ST) {
                        this.state = FilterState.Text;
                    } else if (codePoint === ESC) {
                        this.state = FilterState.OscEscape;
                    }
                    break;
                case FilterState.ControlString:
                    if (codePoint === ST) {
                        this.state = FilterState.Text;
                    } else if (codePoint === ESC) {
                        this.state = FilterState.ControlStringEscape;
                    }
                    break;
                case FilterState.OscEscape:
                    this.state = codePoint === 0x5C ? FilterState.Text : FilterState.Osc;
                    break;
                case FilterState.ControlStringEscape:
                    this.state = codePoint === 0x5C ? FilterState.Text : FilterState.ControlString;
                    break;
            }
        }

        return output;
    }

    private filterTextCharacter(character: string, codePoint: number): string {
        if (codePoint === ESC) {
            this.state = FilterState.Escape;
            return '';
        }
        if (codePoint === CSI) {
            this.state = FilterState.Csi;
            return '';
        }
        if (codePoint === OSC) {
            this.state = FilterState.Osc;
            return '';
        }
        if ([0x90, 0x98, 0x9E, 0x9F].includes(codePoint)) {
            this.state = FilterState.ControlString;
            return '';
        }
        if (codePoint === 0x09 || codePoint === 0x0A || codePoint === 0x0D) {
            return character;
        }
        if (codePoint < 0x20 || (codePoint >= DELETE && codePoint <= 0x9F)) {
            return '';
        }
        return character;
    }

    private handleEscape(codePoint: number): void {
        if (codePoint === 0x5B) {
            this.state = FilterState.Csi;
        } else if (codePoint === 0x5D) {
            this.state = FilterState.Osc;
        } else if ([0x50, 0x58, 0x5E, 0x5F].includes(codePoint)) {
            this.state = FilterState.ControlString;
        } else if (codePoint >= 0x20 && codePoint <= 0x2F) {
            this.state = FilterState.EscapeIntermediate;
        } else if (codePoint !== ESC) {
            this.state = FilterState.Text;
        }
    }
}
