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

/**
 * Represents a lazy initialized value of type T
 *
 * The value is initialized or constructed on first use.
 */
export interface Lazy<T extends NonNullable<unknown>> {
    /**
     * Access payload value.
     * The value is initialized or constructed on first access.
     */
    get value(): T;

    /**
     * Reset payload value.
     * The value is reinitialized/reconstructed on next access.
     */
    reset() : void;
}

class LazyImpl<T extends NonNullable<unknown>> implements Lazy<T> {
    private _value : T | null = null;

    constructor(
        private readonly initializer: () => T,
    ) { }

    public get value(): T {
        if (this._value === null) {
            this._value = this.initializer();
        }
        return this._value;
    }

    public reset() {
        this._value = null;
    }
}

interface LazyConstructor {
    new <T extends NonNullable<unknown>> (initializer: () => T) : Lazy<T>;
}

export const Lazy: LazyConstructor = LazyImpl;


/**
 * Represents a lazy initialized Promise of type T
 *
 * The Promise is created on first access using a stored initializer function.
 */
export interface LazyPromise<T> extends Promise<T>, Lazy<Promise<T>> {
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     *
     * @param defaultValue Return this default value if not undefined
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    thenOrDefault<TResult1 = T, TResult2 = never>(
        defaultValue: TResult1 | undefined,
        onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null | undefined,
    ): Promise<TResult1 | TResult2>;
}

class LazyPromiseImpl<T> extends LazyImpl<Promise<T>> implements LazyPromise<T> {
    [Symbol.toStringTag]: string = 'LazyPromise';

    constructor(
        initializer: () => Promise<T>,
    ) {
        super(initializer);
    }

    static resolve<T>(initializer?: () => Promise<T>) : LazyPromise<T | undefined> {
        if (initializer !== undefined) {
            return new LazyPromiseImpl(initializer);
        }
        return new LazyPromiseImpl(() => Promise.resolve(undefined));
    }

    static reject<T = never>(reason?: unknown): LazyPromise<T> {
        return new LazyPromiseImpl(() => Promise.reject(reason));
    }

    public catch<TResult = never>(
        onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null | undefined
    ): Promise<T | TResult> {
        return this.value.catch(onrejected);
    }

    public finally(
        onfinally?: (() => void) | null | undefined
    ): Promise<T> {
        return this.value.finally(onfinally);
    }

    public then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): Promise<TResult1 | TResult2> {
        return this.value.then(onfulfilled, onrejected);
    }

    public thenOrDefault<TResult1 = T, TResult2 = never>(
        defaultValue: TResult1 | undefined,
        onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null | undefined,
    ): Promise<TResult1 | TResult2> {
        if (defaultValue !== undefined) {
            return Promise.resolve(defaultValue);
        }
        return this.value.then(onfulfilled, onrejected);
    }
}

interface LazyPromiseConstructor {
    new <T> (initializer: () => Promise<T>) : LazyPromise<T>;

    /**
     * Creates a new promise that resolves to undefined.
     */
    resolve() : LazyPromise<undefined>;

    /**
     * Creates a new promise that is initialized with the given initializer.
     * @param initializer Initializer function returning the actual Promise
     */
    resolve<T>(initializer: () => Promise<T>) : LazyPromise<T>;

    /**
     * Creates a new rejected promise for the provided reason.
     * @param reason The reason the promise was rejected.
     * @returns A new rejected Promise.
     */
    reject<T = never>(reason?: unknown): LazyPromise<T>;
}

export const LazyPromise: LazyPromiseConstructor = LazyPromiseImpl;
