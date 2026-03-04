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

import 'jest';
import { ConfigurationProvider } from './configuration-provider';
export type MockConfigurationProvider = jest.Mocked<ConfigurationProvider> & {
    fireOnChangeConfiguration: (...configSettingNames: string[]) => void;
}

export const configurationProviderFactory = (settings?: { [key: string]: unknown }): MockConfigurationProvider => {
    const _settings = settings;
    type callback = () => void;
    type callbacksBySettingName = Record<string, callback[]>;

    const callbacks: callbacksBySettingName = {};

    const getConfigVariable = jest.fn().mockImplementation((settingName, extension) => {
        if (_settings) {
            const settingString = extension ? `${extension}.${settingName}` : settingName;
            if (typeof _settings[settingString] !== 'undefined') {
                return _settings[settingString];
            }
        }
        return undefined;
    });


    const getConfigVariableOrDefault = jest.fn().mockImplementation((settingName, def, extension) => {
        return getConfigVariable(settingName, extension) ?? def;
    });

    const onChangeConfiguration = jest.fn().mockImplementation((cb: callback, ...configSettingNames: string[]) => {
        for (const settingName of configSettingNames) {
            if (!callbacks[settingName]) {
                callbacks[settingName] = [];
            }
            callbacks[settingName].push(cb);
        }
    });

    const fireOnChangeConfiguration = jest.fn().mockImplementation((...configSettingNames: string[]) => {
        for (const settingName of configSettingNames) {
            for (const cb of callbacks[settingName] || []) {
                cb();
            }
        }
    });

    const setConfigVariable = jest.fn().mockImplementation((settingName, value) => {
        if (_settings) {
            _settings[settingName] = value;
        }
        fireOnChangeConfiguration([settingName]);
    });

    return {
        getConfigVariable,
        getConfigVariableOrDefault,
        onChangeConfiguration,
        fireOnChangeConfiguration,
        setConfigVariable,
        inspectConfigVariable: jest.fn(),
    };
};
