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

import { Lazy, LazyPromise } from './lazy';

describe('Lazy', () => {

    it('initializer not called without value access',  () => {
        const initializer = jest.fn();
        const lazy = new Lazy(initializer);

        expect(Object.entries(lazy)).toEqual(expect.arrayContaining([['_value', null]]));
        expect(initializer).not.toHaveBeenCalled();
    });

    it('initializer called once after value access',  () => {
        const initializer = jest.fn().mockReturnValue(42);
        const lazy = new Lazy(initializer);

        expect(lazy.value).toBe(42);
        expect(lazy.value).toBe(42);

        expect(Object.entries(lazy)).toEqual(expect.arrayContaining([['_value', 42]]));
        expect(initializer).toHaveBeenCalledTimes(1);
    });

    it('reset discards stored value',  () => {
        const initializer = jest.fn().mockReturnValue(42);
        const lazy = new Lazy(initializer);

        expect(lazy.value).toBe(42);

        lazy.reset();

        expect(Object.entries(lazy)).toEqual(expect.arrayContaining([['_value', null]]));
        expect(initializer).toHaveBeenCalledTimes(1);
    });

    it('initializer called again after reset',  () => {
        const initializer = jest.fn().mockReturnValueOnce(42).mockReturnValue(43);
        const lazy = new Lazy(initializer);

        expect(lazy.value).toBe(42);

        lazy.reset();

        expect(lazy.value).toBe(43);

        expect(Object.entries(lazy)).toEqual(expect.arrayContaining([['_value', 43]]));
        expect(initializer).toHaveBeenCalledTimes(2);
    });

});

describe('LazyPromise', () => {

    describe('reset', () => {

        it('initializer called again after reset',  async () => {
            const initializer = jest.fn().mockResolvedValue(42);
            const lazyPromise = LazyPromise.resolve(initializer);

            await lazyPromise;
            lazyPromise.reset();
            await lazyPromise;

            expect(initializer).toHaveBeenCalledTimes(2);
        });

    });

    describe('resolve', () => {
        it('without parameter resolved to undefined', async () => {
            const lazyPromise = LazyPromise.resolve();
            await expect(lazyPromise).resolves.toBeUndefined();
        });

        it('with parameter resolved to initializer value', async () => {
            const initializer = jest.fn().mockResolvedValue(42);
            const lazyPromise = LazyPromise.resolve(initializer);

            expect(initializer).not.toHaveBeenCalled();

            await expect(lazyPromise).resolves.toBe(42);
            await expect(lazyPromise).resolves.toBe(42);

            expect(initializer).toHaveBeenCalledTimes(1);
        });
    });

    describe('reject', () => {
        it('reason is returned', async () => {
            const reason = 'request got rejected';
            const lazyPromise = LazyPromise.reject(reason);

            await expect(lazyPromise).rejects.toMatch(reason);
        });

        it('reason is passed to catch', async () => {
            const reason = 'request got rejected';
            const lazyPromise = LazyPromise.reject(reason);

            const onrejected = jest.fn();
            await lazyPromise.catch(onrejected);

            expect(onrejected).toHaveBeenCalledWith(reason);
        });

        it('finally is called', async () => {
            const reason = 'request got rejected';
            const lazyPromise = LazyPromise.reject(reason);

            const onfinally = jest.fn();
            await expect(lazyPromise.finally(onfinally)).rejects.toBeDefined();

            expect(onfinally).toHaveBeenCalledTimes(1);
        });
    });

    describe('then', () => {
        it('onfulfilled is called on success', async () => {
            const lazyPromise = LazyPromise.resolve(async () => 42);

            const onfulfilled = jest.fn().mockReturnValue(43);
            const onrejected = jest.fn();

            await expect(lazyPromise.then(onfulfilled, onrejected)).resolves.toBe(43);
            expect(onfulfilled).toHaveBeenCalledWith(42);
            expect(onrejected).not.toHaveBeenCalled();
        });

        it('onrejected is called on failure', async () => {
            const reason = 'request got rejected';
            const lazyPromise = LazyPromise.reject(reason);

            const onfulfilled = jest.fn();
            const onrejected = jest.fn().mockReturnValue(42);

            await expect(lazyPromise.then(onfulfilled, onrejected)).resolves.toBe(42);
            expect(onfulfilled).not.toHaveBeenCalled();
            expect(onrejected).toHaveBeenCalledWith(reason);
        });
    });

    describe('thenOrDefault', () => {
        it('defined default value is returned instead of calling the initializer', async () => {
            const initializer = jest.fn().mockResolvedValue(42);
            const lazyPromise = LazyPromise.resolve(initializer);

            const onfulfilled = jest.fn();
            const onrejected = jest.fn();

            await expect(lazyPromise.thenOrDefault(43, onfulfilled, onrejected)).resolves.toBe(43);

            expect(initializer).not.toHaveBeenCalled();
            expect(onfulfilled).not.toHaveBeenCalled();
            expect(onrejected).not.toHaveBeenCalled();
        });

        it('onfulfilled is called on success', async () => {
            const lazyPromise = LazyPromise.resolve(async () => 42);

            const onfulfilled = jest.fn().mockReturnValue(43);
            const onrejected = jest.fn();

            await expect(lazyPromise.thenOrDefault(undefined, onfulfilled, onrejected)).resolves.toBe(43);
            expect(onfulfilled).toHaveBeenCalledWith(42);
            expect(onrejected).not.toHaveBeenCalled();
        });

        it('onrejected is called on failure', async () => {
            const reason = 'request got rejected';
            const lazyPromise = LazyPromise.reject(reason);

            const onfulfilled = jest.fn();
            const onrejected = jest.fn().mockReturnValue(42);

            await expect(lazyPromise.thenOrDefault(undefined, onfulfilled, onrejected)).resolves.toBe(42);
            expect(onfulfilled).not.toHaveBeenCalled();
            expect(onrejected).toHaveBeenCalledWith(reason);
        });
    });
});
