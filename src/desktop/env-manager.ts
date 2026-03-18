/**
 * Copyright 2025-2026 Arm Limited
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

import * as vscode from 'vscode';
import { constructor } from '../generic/constructor';
import { ConfigurationProvider } from '../vscode-api/configuration-provider';
import path from 'path';
import { Optional } from '../generic/type-helper';
import { CONFIG_ENVIRONMENT_VARIABLES } from '../manifest';
import process from 'process';
import { PythonEnvironment, PythonEnvironmentApi } from '../vscode-api/ms-python.vscode-python-envs.api';
import { extendEnvWithCmsisSettings } from '../util';
import { getCmsisToolboxRoot } from '../utils/path-utils';

const DEFAULT_PATH_VAR = (process.platform === 'win32') ? 'Path' : 'PATH';

export interface EnvironmentManager {
    activate(context: vscode.ExtensionContext): Promise<void>;
    augmentEnv(env: Environment | undefined): Environment;
}

export interface Environment {
    readonly vars: NodeJS.ProcessEnv;
    applyMutator(variable: string, mutator: vscode.EnvironmentVariableMutator): Environment;
}

class EnvironmentImpl implements Environment {
    private readonly env: NodeJS.ProcessEnv;

    constructor(
        env: NodeJS.ProcessEnv = extendEnvWithCmsisSettings(process.env),
        private readonly additionalEnv: NodeJS.ProcessEnv = {},
    ) {
        this.env = { ...env };
    }

    public get vars(): NodeJS.ProcessEnv {
        return EnvironmentImpl.expand({ ...this.env }, this.additionalEnv);
    }

    public applyMutator(variable: string, mutator: vscode.EnvironmentVariableMutator): Environment {
        const key = this.findVariableKey(variable) ?? variable;
        switch (mutator.type) {
            case vscode.EnvironmentVariableMutatorType.Append:
                this.env[key] = (this.env[key] ?? '') + mutator.value;
                break;
            case vscode.EnvironmentVariableMutatorType.Prepend:
                this.env[key] = mutator.value + (this.env[key] ?? '');
                break;
            case vscode.EnvironmentVariableMutatorType.Replace:
                this.env[key] = mutator.value;
                break;
        }
        return this;
    }

    protected findVariableKey(variable: string): string | undefined {
        const lowerVariable = variable.toLocaleLowerCase();
        for (const key of Object.keys(this.env)) {
            if (key.toLocaleLowerCase() === lowerVariable) {
                return key;
            }
        }
        return undefined;
    }

    protected static applyOSpatch(vars: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
        if ((process.platform === 'win32') && !('HOME' in vars)) {
            vars['HOME'] = vars['USERPROFILE'];
        } else if (!('USERPROFILE' in vars)) {
            vars['USERPROFILE'] = vars['HOME'];
        }
        return vars;
    }

    protected static expand(vars: NodeJS.ProcessEnv, additionalEnv: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
        const processEnv = EnvironmentImpl.applyOSpatch({ ...additionalEnv, ...vars });
        for (const [key, value] of Object.entries(vars)) {
            if (value) {
                const expandables = [...value.matchAll(/\$(\w+)|\${(\w+)}|%(\w+)%/g)];
                for (const element of expandables) {
                    const varName = element[1] ?? element[2] ?? element[3];
                    if (varName in processEnv) {
                        vars[key] = vars[key]?.replaceAll(element[0], processEnv[varName] ?? '');
                    }
                }
            }
        }
        return vars;
    }
}

class PythonEnvironmentExtensionWrapper {
    private pyenvApi: Optional<PythonEnvironmentApi> = undefined;
    private pyenv: Optional<PythonEnvironment> = undefined;
    private pyenvVars: Optional<NodeJS.ProcessEnv> = undefined;
    private readonly disposables: vscode.Disposable[] = [];

    async activate(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            vscode.extensions.onDidChange(() => this.activatePythonEnvApi()),
            { dispose: () => this.dispose() },
        );
        await this.activatePythonEnvApi();
    }

    private dispose(): void {
        this.pyenvApi = undefined;
        this.pyenv = undefined;
        this.pyenvVars = undefined;
        this.disposables.forEach(d => d.dispose());
        this.disposables.length = 0;
    }

    public augmentEnv(env: Environment): Environment {
        if (this.pyenv) {
            env.applyMutator(DEFAULT_PATH_VAR, {
                type: vscode.EnvironmentVariableMutatorType.Prepend,
                value: path.dirname(this.pyenv.environmentPath.fsPath) + path.delimiter,
                options: { applyAtProcessCreation: true },
            });
            env.applyMutator('VIRTUAL_ENV', {
                type: vscode.EnvironmentVariableMutatorType.Replace,
                value: this.pyenv.sysPrefix,
                options: { applyAtProcessCreation: true },
            });
        }
        if (this.pyenvVars) {
            for (const [key, value] of Object.entries(this.pyenvVars)) {
                if (value !== undefined) {
                    env.applyMutator(key, {
                        type: vscode.EnvironmentVariableMutatorType.Replace,
                        value: value,
                        options: { applyAtProcessCreation: true },
                    });
                }
            }
        }
        return env;
    }

    private async activatePythonEnvApi() {
        const pythonEnvsExtension = vscode.extensions.getExtension('ms-python.vscode-python-envs');
        if (pythonEnvsExtension?.isActive) {
            if (!this.pyenvApi) {
                this.pyenvApi = pythonEnvsExtension.exports as PythonEnvironmentApi;
                this.disposables.push(
                    this.pyenvApi.onDidChangeEnvironment(() => this.activatePythonEnv()),
                    this.pyenvApi.onDidChangeEnvironmentVariables(() => this.activatePythonEnv()),
                );
                await this.activatePythonEnv();
            }
        } else {
            this.dispose();
        }
    }

    private async activatePythonEnv() {
        this.pyenv = await this.pyenvApi?.getEnvironment(vscode.workspace.workspaceFolders?.[0]?.uri);
        this.pyenvVars = await this.pyenvApi?.getEnvironmentVariables(vscode.workspace.workspaceFolders?.[0]?.uri);
    }
}

class EnvironmentManagerImpl implements EnvironmentManager {

    private pyEnvWrapper: Optional<PythonEnvironmentExtensionWrapper> = undefined;
    private context: vscode.ExtensionContext | undefined = undefined;

    constructor(
        private readonly configurationProvider: ConfigurationProvider,
    ) {
    }

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        this.context = context;

        this.pyEnvWrapper = new PythonEnvironmentExtensionWrapper();
        await this.pyEnvWrapper.activate(context);

        context.subscriptions.push(
            vscode.extensions.onDidChange(() => this.updateEnvironment(context)),
        );

        this.configurationProvider.onChangeConfiguration(
            () => this.updateEnvironment(context),
            CONFIG_ENVIRONMENT_VARIABLES,
        );
        this.updateEnvironment(context);
    }

    public augmentEnv(env: Environment | undefined): Environment {
        env = env ?? new EnvironmentImpl();

        this.pyEnvWrapper?.augmentEnv(env);
        this.context?.environmentVariableCollection.forEach((variable, mutator) => {
            env = env!.applyMutator(variable, mutator);
        });

        return env;
    }

    private updateEnvironment(context: vscode.ExtensionContext) {
        const envSettings = new Environment(this.configurationProvider.getConfigVariableOrDefault<NodeJS.ProcessEnv>(CONFIG_ENVIRONMENT_VARIABLES, {}), process.env);

        // append embedded CMSIS Toolbox to PATH
        const cmsisToolboxBin = path.join(getCmsisToolboxRoot(envSettings.vars), 'bin');
        envSettings.applyMutator(DEFAULT_PATH_VAR, {
            type: vscode.EnvironmentVariableMutatorType.Append,
            value: `${path.delimiter}${cmsisToolboxBin}`,
            options: { applyAtProcessCreation: true },
        });

        // prepend embedded pyOCD for CMSIS Debugger Extension to PATH
        const debuggerExtension = vscode.extensions.getExtension<void>('arm.vscode-cmsis-debugger');
        if (debuggerExtension?.extensionPath) {
            const pyocdPath = path.join(debuggerExtension.extensionPath, 'tools', 'pyocd');
            envSettings.applyMutator(DEFAULT_PATH_VAR, {
                type: vscode.EnvironmentVariableMutatorType.Prepend,
                value: `${pyocdPath}${path.delimiter}`,
                options: { applyAtProcessCreation: true },
            });
        }

        context.environmentVariableCollection.clear();
        for (const [key, value] of Object.entries(envSettings.vars)) {
            if (value !== undefined) {
                if (key.toLocaleLowerCase() === 'path') {
                    context.environmentVariableCollection.prepend(DEFAULT_PATH_VAR, `${value}${path.delimiter}`);
                } else {
                    context.environmentVariableCollection.replace(key, value);
                }
            }

        }
    }
}

export const EnvironmentManager = constructor<typeof EnvironmentManagerImpl, EnvironmentManager>(EnvironmentManagerImpl);
export const Environment = constructor<typeof EnvironmentImpl, Environment>(EnvironmentImpl);
