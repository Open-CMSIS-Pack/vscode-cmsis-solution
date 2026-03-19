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

import * as vscode from 'vscode';
import { CONFIG_ROOT, PACKAGE_NAME } from '../manifest';

export interface ConfigurationProvider {
    getConfigVariable<T>(name: string, extension?: string): T | undefined;
    getConfigVariableOrDefault<T>(name: string, def: T, extension?: string): T;
    setConfigVariable<T>(name: string, value: T, extension?: string, workspace?: boolean): Promise<void>;
    inspectConfigVariable<T>(name: string, extension?: string): {
        key: string;
        defaultValue?: T;
        globalValue?: T;
        workspaceValue?: T;
        workspaceFolderValue?: T;
        defaultLanguageValue?: T;
        globalLanguageValue?: T;
        workspaceLanguageValue?: T;
        workspaceFolderLanguageValue?: T;
        languageIds?: string[];

    } | undefined;
    onChangeConfiguration(callback: () => void, ...configSettingNames: string[]): void,
}

export class ConfigurationProviderImpl implements ConfigurationProvider {
    constructor(private readonly extensionContext: Pick<vscode.ExtensionContext, 'subscriptions'>) { }

    public getConfigVariable<T>(name: string, extension?: string): T | undefined {
        extension = extension ? extension : CONFIG_ROOT;
        return vscode.workspace.getConfiguration(extension).get<T>(name);
    }

    public getConfigVariableOrDefault<T>(name: string, def: T, extension?: string): T {
        extension = extension ? extension : CONFIG_ROOT;
        return vscode.workspace.getConfiguration(extension).get<T>(name, def);
    }

    public async setConfigVariable<T>(name: string, value: T, extension?: string, workspace = false): Promise<void> {
        extension = extension ? extension : PACKAGE_NAME;
        return vscode.workspace.getConfiguration(extension).update(name, value, workspace ? undefined : vscode.ConfigurationTarget.Global);
    }

    public inspectConfigVariable<T>(name: string, extension?: string) {
        extension = extension ? extension : PACKAGE_NAME;
        return vscode.workspace.getConfiguration(extension).inspect<T>(name);
    }

    public onChangeConfiguration(callback: () => void, ...configSettingNames: string[]): void {
        this.extensionContext.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration(async e => {
                for (const settingName of configSettingNames) {
                    if (e.affectsConfiguration(`${PACKAGE_NAME}.${settingName}`)) {
                        callback();
                        return;
                    }
                }
            })
        );
    }
}
