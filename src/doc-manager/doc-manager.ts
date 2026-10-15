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

import * as path from 'node:path';
import { constructor } from '@open-cmsis-pack/cmsis-common/constructor';
import { ETextFileResult } from '@open-cmsis-pack/cmsis-common/text-file';
import { ETreeItemKind } from '@open-cmsis-pack/cmsis-common/tree-item';
import { DocsYamlFile } from './docs-yaml-file';

export interface DocManager {
    readonly file: DocsYamlFile;
    initialize(): Promise<ETextFileResult>;
}

class DocManagerImpl implements DocManager {
    public readonly file: DocsYamlFile;

    constructor(docsDirectory: string) {
        this.file = new DocsYamlFile(path.join(docsDirectory, 'docs.yml'));
    }

    async initialize(): Promise<ETextFileResult> {
        this.file.parser?.clearErrors();
        const result = await this.file.load();
        if (this.file.parser?.hasErrors()) {
            this.file.addError(`${this.file.fileName}: Failed to parse:`);
            for (const error of this.file.parser.errors) {
                this.file.addError(error);
            }
            this.file.rootItem = undefined;
            return ETextFileResult.Error;
        }
        if (result !== ETextFileResult.NotExists) {
            return result;
        }
        this.file.ensureTopItem().setKind(ETreeItemKind.Map);
        return this.file.save();
    }
}

export const DocManager = constructor<typeof DocManagerImpl, DocManager>(DocManagerImpl);
