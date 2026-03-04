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

import { uniqueFake } from './custom-faker';

describe('Test uniqueFake', () => {

    it('Value from inner function is returned', () => {
        const fakerFn = jest.fn().mockReturnValue(42);
        const value = uniqueFake(fakerFn, 43);

        expect(value).toBe(42);
        expect(fakerFn).toHaveBeenCalledTimes(1);
    });

    it('Inner function is called again if value was not unique', () => {
        const fakerFn = jest.fn().mockReturnValueOnce(43).mockReturnValue(42);
        const value = uniqueFake(fakerFn, 43);

        expect(value).toBe(42);
        expect(fakerFn).toHaveBeenCalledTimes(2);
    });

    it('Exception is thrown if value never gets different', () => {
        const fakerFn = jest.fn().mockReturnValue(43);
        expect(() => uniqueFake(fakerFn, 43, undefined, 5)).toThrow();
        expect(fakerFn).toHaveBeenCalledTimes(5);
    });

});
