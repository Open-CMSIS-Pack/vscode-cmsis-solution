/**
 * Copyright 2023-2026 Arm Limited
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

import { AsyncStatus, asyncIdle, asyncError, asyncLoaded, asyncLoading, asyncMap, asyncResult, asyncStatusesEqual, switchAsyncStatus } from './async-status';

describe('asyncMap', () => {
    it('return loading type when status type is loading', () => {
        const status: AsyncStatus<string[]> = { type: 'loading' };
        const output = asyncMap(status, (input) => input);
        expect(output.type).toBe(status.type);
    });

    it('return loaded type when status is loaded', () => {
        const status: AsyncStatus<string[]> = { type: 'loaded', result: [] };
        const output = asyncMap(status, (a): string[] => a.map(ele => ele));
        expect(output).toEqual(status);
    });

    it('return error type when status type is error', () => {
        const status: AsyncStatus<string[]> = { type: 'error', message: '' };
        const output = asyncMap(status, (input) => input);
        expect(output).toBe(status);
    });

    it('return idle type when status type is idle', () => {
        const status: AsyncStatus<string[]> = { type: 'idle' };
        const output = asyncMap(status, (input) => input);
        expect(output.type).toBe(status.type);
    });
});

describe('asyncResult', () => {
    it('returns the result when type is loaded', () => {
        const status: AsyncStatus<string[]> = { type: 'loaded', result: ['Result'] };
        const output = asyncResult(status, []);
        expect(output).toEqual(status.result);
    });

    it('returns default when type is not loaded', () => {
        const status: AsyncStatus<string> = { type: 'error', message: '' };
        const output = asyncResult(status, '');
        expect(typeof output).toBe('string');
    });
});

describe('switchAsyncStatus', () => {
    it('return loading AsyncOption return result when type is loading', () => {
        const status: AsyncStatus<string> = { type: 'loading' };
        const output = switchAsyncStatus(status, { loading: () => 'loading', loaded: (input) => input, error: (msg) => msg, idle: () => 'idle' });
        expect(output).toBe('loading');
    });

    it('return loaded AsyncOption return result when type is loaded', () => {
        const status: AsyncStatus<string> = { type: 'loaded', result: 'result' };
        const output = switchAsyncStatus(status, { loading: () => 'loading', loaded: (input) => input, error: (msg) => msg, idle: () => 'idle' });
        expect(output).toBe('result');
    });

    it('return error AsyncOption return result when type is error', () => {
        const status: AsyncStatus<string> = { type: 'error', message: 'message' };
        const output = switchAsyncStatus(status, { loading: () => 'loading', loaded: (input) => input, error: (msg) => msg, idle: () => 'idle' });
        expect(output).toBe('message');
    });

    it('return idle AsyncOption return result when type is idle', () => {
        const status: AsyncStatus<string> = { type: 'idle' };
        const output = switchAsyncStatus(status, { loading: () => 'loading', loaded: (input) => input, error: (msg) => msg, idle: () => 'idle' });
        expect(output).toBe('idle');
    });
});

describe('asyncStatusesEqual', () => {
    const compareResults = (A: string, B: string) => A === B;

    it('returns true when loading statuses are equal', () => {
        const status1: AsyncStatus<string> = asyncLoading();
        const status2: AsyncStatus<string> = asyncLoading();

        const output  = asyncStatusesEqual(() => true)(status1, status2);
        expect(output).toBe(true);
    });

    it('returns true when loaded statuses are equal', () => {
        const status1: AsyncStatus<string> = asyncLoaded('hello');
        const status2: AsyncStatus<string> = asyncLoaded('hello');

        const output  = asyncStatusesEqual(compareResults)(status1, status2);
        expect(output).toBe(true);
    });

    it('returns true when error statuses are equal', () => {
        const status1: AsyncStatus<string> = asyncError('BOOM');
        const status2: AsyncStatus<string> = asyncError('BOOM');

        const output  = asyncStatusesEqual(() => true)(status1, status2);
        expect(output).toBe(true);
    });

    it('returns true when idle statuses are equal', () => {
        const status1: AsyncStatus<string> = asyncIdle();
        const status2: AsyncStatus<string> = asyncIdle();

        const output  = asyncStatusesEqual(() => true)(status1, status2);
        expect(output).toBe(true);
    });

    it('returns false when loading statuses are not equal', () => {
        const status1: AsyncStatus<string> = asyncLoading();
        const status2: AsyncStatus<string> = asyncError('BOOM');

        const output  = asyncStatusesEqual(() => true)(status1, status2);
        expect(output).toBe(false);
    });

    it('returns false when loaded statuses are not equal', () => {
        const status1: AsyncStatus<string> = asyncLoaded('hello');
        const status2: AsyncStatus<string> = asyncLoaded('bonjour');

        const output  = asyncStatusesEqual(compareResults)(status1, status2);
        expect(output).toBe(false);
    });

    it('returns false when error statuses are not equal', () => {
        const status1: AsyncStatus<string> = asyncError('BOOM');
        const status2: AsyncStatus<string> = asyncError('MEOWWW');

        const output  = asyncStatusesEqual(() => true)(status1, status2);
        expect(output).toBe(false);
    });

    it('returns false when idle statuses are not equal', () => {
        const status1: AsyncStatus<string> = asyncIdle();
        const status2: AsyncStatus<string> = asyncError('BOOM');

        const output  = asyncStatusesEqual(() => true)(status1, status2);
        expect(output).toBe(false);
    });
});
