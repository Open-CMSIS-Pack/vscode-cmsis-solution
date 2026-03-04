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
import * as querystring from 'querystring';
import * as manifest from '../manifest';
import { CmsisToolboxManager } from '../solutions/cmsis-toolbox';
import { OutputChannelProvider } from '../vscode-api/output-channel-provider';

export class ProtocolHandler implements vscode.UriHandler {

    public constructor(
        private readonly cmsisToolboxManager: CmsisToolboxManager,
        private readonly outputChannelProvider: OutputChannelProvider,
    ) {}

    public async activate(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            vscode.window.registerUriHandler(this)
        );
    }

    public async handleUri(uri: vscode.Uri) {
        console.log('ProtocolHandler.handleUri(%s)', uri.toString());

        switch (uri.path) {
            /*
             * Runs cpackget add with given <pack> identifier, e.g.
             *   cpackget add -a <pack>
             *
             * Examples:
             * vscode://arm.cmsis-csolution/installpack?pack=ARM::CMSIS-RTX@1.0.0
             * vscode://arm.cmsis-csolution/installpack?pack=https://www.keil.com/pack/ARM.CMSIS-RTX.5.8.0.pack
             * vscode://arm.cmsis-csolution/installpack?pack=/path/to/ARM.CMSIS-RTX.5.8.0.pack
             * vscode://arm.cmsis-csolution/installpack?pack=/path/to/ARM.CMSIS-RTX.pdsc
             */
            case '/installpack': {
                const pack = this.getPack(uri);
                if (pack) {
                    await this.installpack(pack);
                }
                break;
            }
        }

    }

    protected getPack(uri: vscode.Uri) {
        const data = querystring.parse(uri.query);
        const pack = data.pack;
        if (pack instanceof Array) {
            return pack.at(0);
        }
        return pack;
    }

    protected async installpack(pack: string) {
        const outputChannel = this.outputChannelProvider.getOrCreate(manifest.CMSIS_SOLUTION_OUTPUT_CHANNEL);
        const [result] = await this.cmsisToolboxManager.runCmsisTool(
            'cpackget', ['add', '-a', pack],
            line => outputChannel.appendLine(line.trimEnd())
        );
        return result === 0;
    }

}
