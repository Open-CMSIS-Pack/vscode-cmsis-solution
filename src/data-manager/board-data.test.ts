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

import { splitBoardId } from './board-data';

describe('splitBoardId', () => {
    it('splits a valid full board ID', () => {
        const result = splitBoardId('vendor::name:rev1');
        expect(result).toEqual({ vendor: 'vendor', name: 'name', revision: 'rev1' });
    });

    it('splits a valid board ID without revision', () => {
        const result = splitBoardId('vendor::name');
        expect(result).toEqual({ vendor: 'vendor', name: 'name', revision: undefined });
    });

    it('splits a valid board ID without vendor', () => {
        const result = splitBoardId('name:rev1');
        expect(result).toEqual({ vendor: undefined, name: 'name', revision: 'rev1' });
    });

    it('accepts simple name as board id', () => {
        const result = splitBoardId('name');
        expect(result).toEqual({ vendor: undefined, name: 'name', revision: undefined });
    });

    it('returns undefined for an undefined board ID', () => {
        expect(splitBoardId(undefined)).toBeUndefined();
    });

    it('returns undefined for an empty board ID', () => {
        expect(splitBoardId('')).toBeUndefined();
    });
});
