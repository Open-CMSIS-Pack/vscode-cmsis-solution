/**
 * Copyright 2024-2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import 'jest';
import { constructContextList } from './common';

describe('constructContextList', () => {
    it('builds a YAML seq from a list of contexts', () => {
        const contexts = ['.Build', '.Release'];

        const result = constructContextList(contexts);

        expect(result!.toJSON()).toEqual(['.Build', '.Release']);
    });

    it('builds a YAML seq from a single context', () => {
        const contexts = '.Build';

        const result = constructContextList(contexts);

        expect(result!.toJSON()).toEqual(['.Build']);
    });

    it('returns undefined if no contexts are provided', () => {
        const result = constructContextList([]);

        expect(result).toBe(undefined);
    });
});
