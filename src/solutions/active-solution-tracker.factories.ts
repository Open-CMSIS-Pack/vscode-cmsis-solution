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

import { ActiveSolutionTracker } from './active-solution-tracker';
import { makeFactory, StubEvents } from '../__test__/test-data-factory';
import * as vscode from 'vscode';

type VSCodeEventEmitterCtor = new <T>() => vscode.EventEmitter<T>;

const getEventEmitterCtor = (): VSCodeEventEmitterCtor | undefined => {
    const ctor = (vscode as unknown as { EventEmitter?: VSCodeEventEmitterCtor }).EventEmitter;
    return typeof ctor === 'function' ? ctor : undefined;
};

const createMockEventEmitter = <T>() => {
    type Listener = (value: T) => unknown;
    const listeners = new Set<Listener>();

    return {
        event: (listener: Listener, thisArg?: unknown, disposables?: vscode.Disposable[]) => {
            const bound = thisArg ? listener.bind(thisArg) : listener;
            listeners.add(bound);
            const disposable = { dispose: () => listeners.delete(bound) };
            if (disposables) {
                disposables.push(disposable);
            }
            return disposable;
        },
        fire: (value: T) => {
            listeners.forEach(listener => listener(value));
        },
        dispose: () => listeners.clear(),
    } as unknown as vscode.EventEmitter<T>;
};

const createEventEmitter = <T>() => {
    const ctor = getEventEmitterCtor();
    if (ctor) {
        return new ctor<T>();
    }
    return createMockEventEmitter<T>();
};

export type MockActiveSolutionTracker = jest.Mocked<StubEvents<ActiveSolutionTracker>> & {
    mockFireActiveSolutionFilesChanged: () => void;
};

export const activeSolutionTrackerFactory = makeFactory<MockActiveSolutionTracker>({
    onDidChangeSolutionsEmitter: () => createEventEmitter<void>(),
    onDidChangeSolutions: (r) => jest.fn(r.onDidChangeSolutionsEmitter!.event),
    onDidChangeActiveSolutionEmitter: () => createEventEmitter<void>(),
    onDidChangeActiveSolution: (r) => jest.fn(r.onDidChangeActiveSolutionEmitter!.event),
    onActiveSolutionFilesChangedEmitter: () => createEventEmitter<void>(),
    onActiveSolutionFilesChanged: (r) => jest.fn(r.onActiveSolutionFilesChangedEmitter!.event),
    activeSolution: () => '',
    solutions: () => [],
    activate: () => jest.fn(),
    getSolutionDetails: () => jest.fn(),
    triggerReload: (r) => jest.fn(() => r.onActiveSolutionFilesChangedEmitter?.fire()),
    suspendWatch: () => false,
    mockFireActiveSolutionFilesChanged: (r) => () => r.onActiveSolutionFilesChangedEmitter?.fire(),
});
