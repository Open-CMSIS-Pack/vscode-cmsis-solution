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

import { Disposable } from 'vscode';
import { ExtensionApiProvider } from './extension-api-provider';

export type MockExtensionApiProvider<A> = jest.Mocked<ExtensionApiProvider<A>>;

export const extensionApiProviderFactory = <A>(api?: A): MockExtensionApiProvider<A> => {
    const onActivate: jest.MockedFunction<ExtensionApiProvider<A>['onActivate']> = jest.fn(callback => {
        if (api) {
            callback(api);
        }
        return Disposable.from({ dispose: jest.fn() });
    });

    const activateIfEnabled: jest.MockedFunction<ExtensionApiProvider<A>['activateIfEnabled']> = jest.fn(
        async () => api,
    );

    return { onActivate, activateIfEnabled };
};
