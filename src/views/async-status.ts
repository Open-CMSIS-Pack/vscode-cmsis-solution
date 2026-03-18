/**
 * Copyright 2023-2026 Arm Limited
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

export type AsyncStatus<Type>
    = { type: 'loading' }
    | { type: 'loaded', result: Type }
    | { type: 'error', message: string }
    | { type: 'idle' };

export type AsyncState = 'loading' | 'loaded' | 'error' | 'idle';

type AsyncOptions<A,B> = {
    loading: () => B;
    loaded: (input: A) => B;
    error: (message: string) => B;
    idle: () => B;
}

/**
 * Pass AsyncStatus result through method if loaded
 */
export const asyncMap = <A, B>(async: AsyncStatus<A>, fn: (input: A) => B): AsyncStatus<B> => async.type === 'loaded'
    ? { type: 'loaded', result: fn(async.result) }
    : async;

export const asyncResult = <A>(async: AsyncStatus<A>, defaultValue: A): A => async.type === 'loaded' ? async.result : defaultValue;

/**
 * Return different AsyncOption results depending on the AsyncStatus type
 */
export const switchAsyncStatus = <A , B >(async: AsyncStatus<A> , options: AsyncOptions<A,B>) => {
    switch (async.type) {
        case 'loading': return options.loading();
        case 'loaded': return options.loaded(async.result);
        case 'error': return options.error(async.message);
        case 'idle': return options.idle();
    }
};

export const asyncStatusesEqual = <A>(compareResults: (result1: A, result2: A) => boolean) =>
    (async1: AsyncStatus<A>, async2: AsyncStatus<A>): boolean =>
        switchAsyncStatus(async1, {
            loading: () => async2.type === 'loading',
            loaded: result => async2.type === 'loaded' && compareResults(result, async2.result),
            error: message => async2.type === 'error' && message === async2.message,
            idle: () => async2.type === 'idle',
        });

export const asyncLoading = <A>(): AsyncStatus<A> => ({ type: 'loading' });
export const asyncLoaded = <A>(result: A): AsyncStatus<A> => ({ type: 'loaded', result });
export const asyncError = <A>(message: string): AsyncStatus<A> => ({ type: 'error', message });
export const asyncIdle = <A>(): AsyncStatus<A> => ({ type: 'idle' });
