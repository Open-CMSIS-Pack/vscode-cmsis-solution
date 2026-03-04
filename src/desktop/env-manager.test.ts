/**
 * Copyright 2025-2026 Arm Limited
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

import * as vscode from 'vscode';
import { Environment, EnvironmentManager } from './env-manager';
import { configurationProviderFactory, MockConfigurationProvider } from '../vscode-api/configuration-provider.factories';
import path from 'path';
import { CMSIS_TOOLBOX_FOLDER, CONFIG_ENVIRONMENT_VARIABLES } from '../manifest';

const DEFAULT_PATH_VAR = (process.platform === 'win32') ? 'Path' : 'PATH';

describe('Environment', () => {
    describe('constructor', () => {
        it('creates an environment with default process.env', () => {
            const env = new Environment();

            expect(env.vars).toBeDefined();
            expect(typeof env.vars).toBe('object');
        });

        it('creates an environment with provided variables', () => {
            const customVars = {
                MY_VAR: 'my_value',
                ANOTHER_VAR: 'another_value',
            };

            const env = new Environment(customVars);

            expect(env.vars.MY_VAR).toBe('my_value');
            expect(env.vars.ANOTHER_VAR).toBe('another_value');
        });
    });

    describe('vars getter', () => {
        it('returns expanded variables', () => {
            const env = new Environment({
                BASE_PATH: '/usr/local',
                FULL_PATH: '$BASE_PATH/bin',
            });

            expect(env.vars.FULL_PATH).toBe('/usr/local/bin');
        });

        it('expands variables with ${} syntax', () => {
            const env = new Environment({
                HOME: '/home/user',
                CONFIG_DIR: '${HOME}/.config',
            });

            expect(env.vars.CONFIG_DIR).toBe('/home/user/.config');
        });

        it('expands variables with %% syntax (Windows style)', () => {
            const env = new Environment({
                USERPROFILE: 'C:\\Users\\TestUser',
                APPDATA: '%USERPROFILE%\\AppData',
            });

            expect(env.vars.APPDATA).toBe('C:\\Users\\TestUser\\AppData');
        });

        it('expands multiple variable references', () => {
            const env = new Environment({
                PREFIX: '/opt',
                BIN: 'bin',
                FULL_PATH: '$PREFIX/$BIN',
            });

            expect(env.vars.FULL_PATH).toBe('/opt/bin');
        });

        it('handles undefined variable references', () => {
            const env = new Environment({
                PATH_WITH_MISSING: '$MISSING_VAR/bin',
            });

            // Should leave undefined variables as-is
            expect(env.vars.PATH_WITH_MISSING).toBe('$MISSING_VAR/bin');
        });

        it('applies OS-specific patches on Windows', () => {
            const originalPlatform = process.platform;
            Object.defineProperty(process, 'platform', { value: 'win32' });

            const env = new Environment({
                VIRTUAL_ENV: '$HOME/.venv',
            }, {
                USERPROFILE: 'C:\\Users\\TestUser',
            });

            expect(env.vars.VIRTUAL_ENV).toBe('C:\\Users\\TestUser/.venv');

            Object.defineProperty(process, 'platform', { value: originalPlatform });
        });

        it('applies OS-specific patches on Unix', () => {
            const originalPlatform = process.platform;
            Object.defineProperty(process, 'platform', { value: 'linux' });

            const env = new Environment({
                VIRTUAL_ENV: '%USERPROFILE%/.venv',
            }, {
                HOME: '/home/testuser',
            });

            expect(env.vars.VIRTUAL_ENV).toBe('/home/testuser/.venv');

            Object.defineProperty(process, 'platform', { value: originalPlatform });
        });

        it('does not override existing HOME on Windows', () => {
            const originalPlatform = process.platform;
            Object.defineProperty(process, 'platform', { value: 'win32' });

            const env = new Environment({
                HOME: '/custom/home',
                USERPROFILE: 'C:\\Users\\TestUser',
            });

            expect(env.vars.HOME).toBe('/custom/home');

            Object.defineProperty(process, 'platform', { value: originalPlatform });
        });
    });

    describe('applyMutator', () => {
        it('appends to a variable', () => {
            const env = new Environment({
                PATH: '/usr/bin',
            });

            env.applyMutator(DEFAULT_PATH_VAR, {
                type: vscode.EnvironmentVariableMutatorType.Append,
                value: ':/usr/local/bin',
                options: {},
            });

            expect(env.vars.PATH).toBe('/usr/bin:/usr/local/bin');
        });

        it('prepends to a variable', () => {
            const env = new Environment({
                PATH: '/usr/bin',
            });

            env.applyMutator(DEFAULT_PATH_VAR, {
                type: vscode.EnvironmentVariableMutatorType.Prepend,
                value: '/usr/local/bin:',
                options: {},
            });

            expect(env.vars.PATH).toBe('/usr/local/bin:/usr/bin');
        });

        it('replaces a variable', () => {
            const env = new Environment({
                MY_VAR: 'old_value',
            });

            env.applyMutator('MY_VAR', {
                type: vscode.EnvironmentVariableMutatorType.Replace,
                value: 'new_value',
                options: {},
            });

            expect(env.vars.MY_VAR).toBe('new_value');
        });

        it('handles case-insensitive variable names', () => {
            const env = new Environment({
                Path: 'C:\\Windows',
            });

            env.applyMutator(DEFAULT_PATH_VAR, {
                type: vscode.EnvironmentVariableMutatorType.Append,
                value: ';C:\\Program Files',
                options: {},
            });

            expect(env.vars.Path).toBe('C:\\Windows;C:\\Program Files');
            expect(env.vars.PATH).toBeUndefined();
        });

        it('creates new variable if it does not exist', () => {
            const env = new Environment({});

            env.applyMutator('NEW_VAR', {
                type: vscode.EnvironmentVariableMutatorType.Replace,
                value: 'new_value',
                options: {},
            });

            expect(env.vars.NEW_VAR).toBe('new_value');
        });

        it('handles append to non-existent variable', () => {
            const env = new Environment({});

            env.applyMutator('NEW_PATH', {
                type: vscode.EnvironmentVariableMutatorType.Append,
                value: '/new/path',
                options: {},
            });

            expect(env.vars.NEW_PATH).toBe('/new/path');
        });

        it('handles prepend to non-existent variable', () => {
            const env = new Environment({});

            env.applyMutator('NEW_PATH', {
                type: vscode.EnvironmentVariableMutatorType.Prepend,
                value: '/new/path',
                options: {},
            });

            expect(env.vars.NEW_PATH).toBe('/new/path');
        });

        it('returns the environment instance for chaining', () => {
            const env = new Environment({
                VAR1: 'value1',
            });

            const result = env
                .applyMutator('VAR2', {
                    type: vscode.EnvironmentVariableMutatorType.Replace,
                    value: 'value2',
                    options: {},
                })
                .applyMutator('VAR3', {
                    type: vscode.EnvironmentVariableMutatorType.Replace,
                    value: 'value3',
                    options: {},
                });

            expect(result).toBe(env);
            expect(env.vars.VAR2).toBe('value2');
            expect(env.vars.VAR3).toBe('value3');
        });
    });

    describe('variable expansion edge cases', () => {
        it('handles empty variable values', () => {
            const env = new Environment({
                EMPTY_VAR: '',
                ANOTHER_VAR: 'value',
            });

            expect(env.vars.EMPTY_VAR).toBe('');
            expect(env.vars.ANOTHER_VAR).toBe('value');
        });

        it('handles variables with special characters', () => {
            const env = new Environment({
                PATH: '/usr/bin:/usr/local/bin',
                URL: 'https://example.com',
            });

            expect(env.vars.PATH).toBe('/usr/bin:/usr/local/bin');
            expect(env.vars.URL).toBe('https://example.com');
        });

        it('handles circular references without infinite loop', () => {
            const env = new Environment({
                VAR1: '$VAR2',
                VAR2: '$VAR1',
            });

            // Should not cause infinite loop, expansion happens once per variable
            expect(env.vars.VAR1).toBeDefined();
            expect(env.vars.VAR2).toBeDefined();
        });

        it('handles mixed variable reference styles', () => {
            const env = new Environment({
                BASE: '/base',
                PATH1: '$BASE/path1',
                PATH2: '${BASE}/path2',
                PATH3: '%BASE%/path3',
            });

            expect(env.vars.PATH1).toBe('/base/path1');
            expect(env.vars.PATH2).toBe('/base/path2');
            expect(env.vars.PATH3).toBe('/base/path3');
        });
    });
});

describe('EnvironmentManager', () => {
    let configurationProviderMock: MockConfigurationProvider;
    let environmentManager: EnvironmentManager;
    let mockContext: vscode.ExtensionContext;
    let mockEnvironmentVariableCollection: {
        prepend: jest.Mock;
        replace: jest.Mock;
        append: jest.Mock;
        get: jest.Mock;
        forEach: jest.Mock;
        delete: jest.Mock;
        clear: jest.Mock;
        [Symbol.iterator]: jest.Mock;
    };

    const defaultPath = path.join(CMSIS_TOOLBOX_FOLDER, 'bin');


    beforeEach(() => {
        mockEnvironmentVariableCollection = {
            prepend: jest.fn(),
            replace: jest.fn(),
            append: jest.fn(),
            get: jest.fn(),
            forEach: jest.fn(),
            delete: jest.fn(),
            clear: jest.fn(),
            [Symbol.iterator]: jest.fn(),
        };

        mockContext = {
            subscriptions: [],
            environmentVariableCollection: mockEnvironmentVariableCollection as unknown as vscode.GlobalEnvironmentVariableCollection,
        } as unknown as vscode.ExtensionContext;

        configurationProviderMock = configurationProviderFactory({
            [CONFIG_ENVIRONMENT_VARIABLES]: {},
        });

        environmentManager = new EnvironmentManager(configurationProviderMock);
    });

    describe('activate', () => {
        it('registers a configuration change listener for env settings', async () => {
            await environmentManager.activate(mockContext);

            expect(configurationProviderMock.onChangeConfiguration).toHaveBeenCalledWith(
                expect.any(Function),
                CONFIG_ENVIRONMENT_VARIABLES
            );
        });

        it('updates environment with initial configuration', async () => {
            configurationProviderMock = configurationProviderFactory({
                [CONFIG_ENVIRONMENT_VARIABLES]: { 'MY_VAR': 'my_value' },
            });
            environmentManager = new EnvironmentManager(configurationProviderMock);

            await environmentManager.activate(mockContext);

            expect(mockEnvironmentVariableCollection.replace).toHaveBeenCalledWith('MY_VAR', 'my_value');
        });
    });

    describe('updateEnvironment - PATH handling', () => {
        it('prepends PATH values with delimiter', async () => {
            const newPath = '/new/path';
            configurationProviderMock = configurationProviderFactory({
                [CONFIG_ENVIRONMENT_VARIABLES]: { [DEFAULT_PATH_VAR]: newPath },
            });
            environmentManager = new EnvironmentManager(configurationProviderMock);

            await environmentManager.activate(mockContext);

            expect(mockEnvironmentVariableCollection.prepend).toHaveBeenCalledWith(
                DEFAULT_PATH_VAR,
                `${newPath}${path.delimiter}${defaultPath}${path.delimiter}`
            );
        });

        it('uses correct path delimiter for the platform', async () => {
            const newPath = '/custom/bin';
            configurationProviderMock = configurationProviderFactory({
                [CONFIG_ENVIRONMENT_VARIABLES]: { [DEFAULT_PATH_VAR]: newPath },
            });
            environmentManager = new EnvironmentManager(configurationProviderMock);

            await environmentManager.activate(mockContext);

            expect(mockEnvironmentVariableCollection.prepend).toHaveBeenCalledWith(
                DEFAULT_PATH_VAR,
                `${newPath}${path.delimiter}${defaultPath}${path.delimiter}`
            );
        });

        it('handles multiple delimiters in PATH value', async () => {
            const newPath = `/path1${path.delimiter}/path2${path.delimiter}/path3`;
            configurationProviderMock = configurationProviderFactory({
                [CONFIG_ENVIRONMENT_VARIABLES]: { [DEFAULT_PATH_VAR]: newPath },
            });
            environmentManager = new EnvironmentManager(configurationProviderMock);

            await environmentManager.activate(mockContext);

            expect(mockEnvironmentVariableCollection.prepend).toHaveBeenCalledWith(
                DEFAULT_PATH_VAR,
                `${newPath}${path.delimiter}${defaultPath}${path.delimiter}`
            );
        });
    });

    describe('updateEnvironment - non-PATH variables', () => {
        it('replaces non-PATH environment variables', async () => {
            configurationProviderMock = configurationProviderFactory({
                [CONFIG_ENVIRONMENT_VARIABLES]: {
                    'MY_CUSTOM_VAR': 'custom_value',
                    'ANOTHER_VAR': 'another_value',
                },
            });
            environmentManager = new EnvironmentManager(configurationProviderMock);

            await environmentManager.activate(mockContext);

            expect(mockEnvironmentVariableCollection.replace).toHaveBeenCalledWith('MY_CUSTOM_VAR', 'custom_value');
            expect(mockEnvironmentVariableCollection.replace).toHaveBeenCalledWith('ANOTHER_VAR', 'another_value');
        });

        it('replaces environment variables', async () => {
            configurationProviderMock = configurationProviderFactory({
                [CONFIG_ENVIRONMENT_VARIABLES]: { 'EXISTING_VAR': 'new_value' },
            });
            environmentManager = new EnvironmentManager(configurationProviderMock);

            await environmentManager.activate(mockContext);

            expect(mockEnvironmentVariableCollection.replace).toHaveBeenCalledWith('EXISTING_VAR', 'new_value');
        });
    });

    describe('updateEnvironment - mixed variables', () => {
        it('handles both PATH and non-PATH variables together', async () => {
            configurationProviderMock = configurationProviderFactory({
                [CONFIG_ENVIRONMENT_VARIABLES]: {
                    [DEFAULT_PATH_VAR]: '/tools/bin',
                    'TOOL_HOME': '/tools',
                    'DEBUG_MODE': 'true',
                },
            });
            environmentManager = new EnvironmentManager(configurationProviderMock);

            await environmentManager.activate(mockContext);

            expect(mockEnvironmentVariableCollection.prepend).toHaveBeenCalledWith(
                DEFAULT_PATH_VAR,
                `/tools/bin${path.delimiter}${defaultPath}${path.delimiter}`
            );
            expect(mockEnvironmentVariableCollection.replace).toHaveBeenCalledWith('TOOL_HOME', '/tools');
            expect(mockEnvironmentVariableCollection.replace).toHaveBeenCalledWith('DEBUG_MODE', 'true');
        });
    });

    describe('configuration change handling', () => {
        it('updates environment when configuration changes', async () => {
            await environmentManager.activate(mockContext);

            // Simulate configuration change
            configurationProviderMock.getConfigVariableOrDefault.mockReturnValue({
                'NEW_VAR': 'new_value',
                [DEFAULT_PATH_VAR]: '/updated/path',
            });

            // Trigger the configuration change callback
            configurationProviderMock.fireOnChangeConfiguration(CONFIG_ENVIRONMENT_VARIABLES);

            expect(mockEnvironmentVariableCollection.replace).toHaveBeenCalledWith('NEW_VAR', 'new_value');
            expect(mockEnvironmentVariableCollection.prepend).toHaveBeenCalledWith(DEFAULT_PATH_VAR, `/updated/path${path.delimiter}${defaultPath}${path.delimiter}`);
        });

        it('handles empty env configuration', async () => {
            configurationProviderMock = configurationProviderFactory({
                [CONFIG_ENVIRONMENT_VARIABLES]: {},
            });
            environmentManager = new EnvironmentManager(configurationProviderMock);

            await environmentManager.activate(mockContext);

            expect(mockEnvironmentVariableCollection.prepend).toHaveBeenCalledWith(DEFAULT_PATH_VAR, `${path.delimiter}${defaultPath}${path.delimiter}`);
            expect(mockEnvironmentVariableCollection.replace).not.toHaveBeenCalled();
        });

        it('handles undefined env configuration', async () => {
            configurationProviderMock.getConfigVariableOrDefault.mockReturnValue({});

            await environmentManager.activate(mockContext);

            expect(mockEnvironmentVariableCollection.prepend).toHaveBeenCalledWith(DEFAULT_PATH_VAR, `${path.delimiter}${defaultPath}${path.delimiter}`);
            expect(mockEnvironmentVariableCollection.replace).not.toHaveBeenCalled();
        });
    });

    describe('edge cases', () => {
        it('handles numeric environment variable values', async () => {
            configurationProviderMock = configurationProviderFactory({
                [CONFIG_ENVIRONMENT_VARIABLES]: { 'PORT': '8080' },
            });
            environmentManager = new EnvironmentManager(configurationProviderMock);

            await environmentManager.activate(mockContext);

            expect(mockEnvironmentVariableCollection.replace).toHaveBeenCalledWith('PORT', '8080');
        });

        it('handles empty string environment variable values', async () => {
            configurationProviderMock = configurationProviderFactory({
                [CONFIG_ENVIRONMENT_VARIABLES]: { 'EMPTY_VAR': '' },
            });
            environmentManager = new EnvironmentManager(configurationProviderMock);

            await environmentManager.activate(mockContext);

            expect(mockEnvironmentVariableCollection.replace).toHaveBeenCalledWith('EMPTY_VAR', '');
        });

        it('handles rapid configuration changes', async () => {
            configurationProviderMock = configurationProviderFactory({
                [CONFIG_ENVIRONMENT_VARIABLES]: { 'VAR': 'value1' },
            });
            environmentManager = new EnvironmentManager(configurationProviderMock);

            await environmentManager.activate(mockContext);

            // Clear mocks
            mockEnvironmentVariableCollection.replace.mockClear();

            // Multiple rapid changes
            configurationProviderMock.getConfigVariableOrDefault.mockReturnValue({ 'VAR': 'value2' });
            configurationProviderMock.fireOnChangeConfiguration(CONFIG_ENVIRONMENT_VARIABLES);

            configurationProviderMock.getConfigVariableOrDefault.mockReturnValue({ 'VAR': 'value3' });
            configurationProviderMock.fireOnChangeConfiguration(CONFIG_ENVIRONMENT_VARIABLES);

            configurationProviderMock.getConfigVariableOrDefault.mockReturnValue({ 'VAR': 'value4' });
            configurationProviderMock.fireOnChangeConfiguration(CONFIG_ENVIRONMENT_VARIABLES);

            // Should have the latest value in collection
            expect(mockEnvironmentVariableCollection.replace).toHaveBeenLastCalledWith('VAR', 'value4');
        });

        it('handles PATH with trailing delimiter', async () => {
            const newPath = `/custom/path${path.delimiter}`;
            configurationProviderMock = configurationProviderFactory({
                [CONFIG_ENVIRONMENT_VARIABLES]: { [DEFAULT_PATH_VAR]: newPath },
            });
            environmentManager = new EnvironmentManager(configurationProviderMock);

            await environmentManager.activate(mockContext);

            // Should prepend the path as-is with additional delimiter
            expect(mockEnvironmentVariableCollection.prepend).toHaveBeenCalledWith(DEFAULT_PATH_VAR, `${newPath}${path.delimiter}${defaultPath}${path.delimiter}`);
        });

        it('handles complex PATH update and revert cycle', async () => {
            // First update
            configurationProviderMock = configurationProviderFactory({
                [CONFIG_ENVIRONMENT_VARIABLES]: { [DEFAULT_PATH_VAR]: `/first${path.delimiter}/second` },
            });
            environmentManager = new EnvironmentManager(configurationProviderMock);
            await environmentManager.activate(mockContext);

            expect(mockEnvironmentVariableCollection.prepend).toHaveBeenCalledWith(DEFAULT_PATH_VAR, `/first${path.delimiter}/second${path.delimiter}${defaultPath}${path.delimiter}`);

            // Clear mocks
            mockEnvironmentVariableCollection.clear.mockClear();
            mockEnvironmentVariableCollection.prepend.mockClear();

            // Second update with different paths
            configurationProviderMock.getConfigVariableOrDefault.mockReturnValue({
                [DEFAULT_PATH_VAR]: `/third${path.delimiter}/fourth`,
            });
            configurationProviderMock.fireOnChangeConfiguration(CONFIG_ENVIRONMENT_VARIABLES);

            // Old PATH should be deleted, new one prepended
            expect(mockEnvironmentVariableCollection.clear).toHaveBeenCalledWith();
            expect(mockEnvironmentVariableCollection.prepend).toHaveBeenCalledWith(DEFAULT_PATH_VAR, `/third${path.delimiter}/fourth${path.delimiter}${defaultPath}${path.delimiter}`);

            // Clear mocks
            mockEnvironmentVariableCollection.clear.mockClear();
            mockEnvironmentVariableCollection.prepend.mockClear();

            // Revert to empty
            configurationProviderMock.getConfigVariableOrDefault.mockReturnValue({});
            configurationProviderMock.fireOnChangeConfiguration(CONFIG_ENVIRONMENT_VARIABLES);

            // Should delete PATH and not add it back
            expect(mockEnvironmentVariableCollection.clear).toHaveBeenCalledWith();
            expect(mockEnvironmentVariableCollection.prepend).toHaveBeenCalledWith(DEFAULT_PATH_VAR, `${path.delimiter}${defaultPath}${path.delimiter}`);
        });
    });

    describe('augmentEnv', () => {
        it('applies prepend mutations from environmentVariableCollection', async () => {
            await environmentManager.activate(mockContext);

            const mutations = new Map<string, { type: vscode.EnvironmentVariableMutatorType; value: string }>();
            mutations.set(DEFAULT_PATH_VAR, { type: vscode.EnvironmentVariableMutatorType.Prepend, value: '/prepended/path:' });

            mockEnvironmentVariableCollection.forEach.mockImplementation((callback) => {
                mutations.forEach((mutator, variable) => callback(variable, mutator));
            });

            const env = environmentManager.augmentEnv(new Environment({ PATH: '/original/path' }));

            expect(env.vars.PATH).toBe('/prepended/path:/original/path');
        });

        it('applies append mutations from environmentVariableCollection', async () => {
            await environmentManager.activate(mockContext);

            const mutations = new Map<string, { type: vscode.EnvironmentVariableMutatorType; value: string }>();
            mutations.set(DEFAULT_PATH_VAR, { type: vscode.EnvironmentVariableMutatorType.Append, value: ':/appended/path' });

            mockEnvironmentVariableCollection.forEach.mockImplementation((callback) => {
                mutations.forEach((mutator, variable) => callback(variable, mutator));
            });

            const env = environmentManager.augmentEnv(new Environment({ PATH: '/original/path' }));

            expect(env.vars.PATH).toBe('/original/path:/appended/path');
        });

        it('applies replace mutations from environmentVariableCollection', async () => {
            await environmentManager.activate(mockContext);

            const mutations = new Map<string, { type: vscode.EnvironmentVariableMutatorType; value: string }>();
            mutations.set('MY_VAR', { type: vscode.EnvironmentVariableMutatorType.Replace, value: 'replaced_value' });

            mockEnvironmentVariableCollection.forEach.mockImplementation((callback) => {
                mutations.forEach((mutator, variable) => callback(variable, mutator));
            });

            const env = environmentManager.augmentEnv(new Environment({ MY_VAR: 'original_value' }));

            expect(env.vars.MY_VAR).toBe('replaced_value');
        });

        it('handles undefined env parameter', async () => {
            await environmentManager.activate(mockContext);

            mockEnvironmentVariableCollection.forEach.mockImplementation(() => {});

            const env = environmentManager.augmentEnv(undefined);

            expect(env).toBeDefined();
            expect(typeof env).toBe('object');
        });

        it('handles multiple mutations', async () => {
            await environmentManager.activate(mockContext);

            const mutations = new Map<string, { type: vscode.EnvironmentVariableMutatorType; value: string }>();
            mutations.set(DEFAULT_PATH_VAR, { type: vscode.EnvironmentVariableMutatorType.Prepend, value: '/new:' });
            mutations.set('VAR1', { type: vscode.EnvironmentVariableMutatorType.Replace, value: 'value1' });
            mutations.set('VAR2', { type: vscode.EnvironmentVariableMutatorType.Append, value: '_suffix' });

            mockEnvironmentVariableCollection.forEach.mockImplementation((callback) => {
                mutations.forEach((mutator, variable) => callback(variable, mutator));
            });

            const env = environmentManager.augmentEnv(new Environment({ PATH: '/old', VAR2: 'prefix' }));

            expect(env.vars.PATH).toBe('/new:/old');
            expect(env.vars.VAR1).toBe('value1');
            expect(env.vars.VAR2).toBe('prefix_suffix');
        });

        it('handles case-insensitive Windows Path variable', async () => {
            await environmentManager.activate(mockContext);

            const mutations = new Map<string, { type: vscode.EnvironmentVariableMutatorType; value: string }>();
            mutations.set(DEFAULT_PATH_VAR, { type: vscode.EnvironmentVariableMutatorType.Prepend, value: 'c:/new/path;' });

            mockEnvironmentVariableCollection.forEach.mockImplementation((callback) => {
                mutations.forEach((mutator, variable) => callback(variable, mutator));
            });

            const env = environmentManager.augmentEnv(new Environment({ Path: 'c:/windows' }));

            expect(env.vars.Path).toBe('c:/new/path;c:/windows');
            expect(env.vars.PATH).toBeUndefined();
        });
    });
});

