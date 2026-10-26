/**
 * Copyright 2026 Arm Limited
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

import * as os from 'node:os';
import * as path from 'node:path';
import { URL } from 'node:url';
import { splitBoardId } from '../data-manager/board-data';
import { splitDeviceId } from '../data-manager/device-data';
import { IDocRef } from './docs-yaml-file';

export class DocDownload {
    private readonly destinationRoot: string;

    constructor(destinationRoot = path.join(os.homedir(), '.cmsis', 'docs')) {
        this.destinationRoot = path.resolve(destinationRoot);
    }

    getDestinationPath(doc: IDocRef): string {
        if (doc.parentTag === 'common') {
            return this.getCommonDestinationPath(doc);
        }
        if ((doc.parentTag === 'device' || doc.parentTag === 'board') && doc.isWebDoc()) {
            return this.getHardwareDestinationPath(doc);
        }
        throw new Error('Only common documents and board or device web documents are supported.');
    }

    async downloadDoc(doc: IDocRef): Promise<void> {
        const destination = this.getDestinationPath(doc);
        throw new Error(`Document download is not implemented: ${destination}`);
    }

    private getCommonDestinationPath(doc: IDocRef): string {
        const id = this.pathComponent(doc.id, 'id');
        const version = this.pathComponent(doc.version, 'version');
        const extension = doc.format === undefined ? '' : `.${this.pathComponent(doc.format, 'format')}`;
        return path.join(this.destinationRoot, `${id}-${version}${extension}`);
    }

    private getHardwareDestinationPath(doc: IDocRef): string {
        const hardware = doc.parentTag === 'device' ? splitDeviceId(doc.parentId) : splitBoardId(doc.parentId);
        const vendor = this.pathComponent(hardware?.vendor, 'vendor');
        const name = this.pathComponent(hardware?.name, 'hardware name');
        const url = new URL(doc.name.startsWith('www.') ? `https://${doc.name}` : doc.name);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            throw new Error('Document downloads require an HTTP or HTTPS URL.');
        }
        const fileName = this.pathComponent(
            url.pathname.endsWith('/') ? undefined : decodeURIComponent(path.posix.basename(url.pathname)), 'filename',
        );
        return path.join(this.destinationRoot, vendor, name, fileName);
    }

    private pathComponent(value: string | undefined, label: string): string {
        if (!value || /[<>:"/\\|?*]/.test(value) || /[. ]$/.test(value)
            || /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(value)
            || Array.from(value).some(character => character.charCodeAt(0) < 32)) {
            throw new Error(`Invalid document ${label}: ${value ?? '(missing)'}`);
        }
        return value;
    }
}
