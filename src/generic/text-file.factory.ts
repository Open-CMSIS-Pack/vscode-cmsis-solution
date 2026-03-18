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

import { makeFactory } from '../__test__/test-data-factory';
import { IErrorList } from './error-list';
import { errorListFactory } from './error-list.factory';
import { ETextFileResult, ITextFile } from './text-file';

export const textFileFactory = makeFactory<ITextFile, IErrorList>({
    text: () => 'Sample text',
    fileName: () => 'sample.txt',
    fileDir: () => '/path/to/',
    content: () => undefined,
    copyFrom: () => (_src?: ITextFile | undefined) => ETextFileResult.Unchanged,
    object: () => ({}),
    parser: () => undefined,
    renderer: () => undefined,
    readOnly: () => false,
    load: () => jest.fn().mockResolvedValue(ETextFileResult.Success),
    save: () => jest.fn().mockResolvedValue(ETextFileResult.Success),
    parse: () => jest.fn().mockReturnValue(undefined),
    render: (r) => jest.fn().mockReturnValue(r.renderer?.render(r.text ?? '') ?? ''),
    stringify: (r) => jest.fn().mockReturnValue(r.parser?.stringify(r.object ?? {}) ?? ''),
    resolvePath: () => jest.fn().mockReturnValue(''),
    isModified: () => jest.fn().mockReturnValue(false),
    clear: () => jest.fn(),
    exists: () => jest.fn(),
    unlink: () => jest.fn(),
    hasExternalFileChanged: () => jest.fn().mockReturnValue(false),
    refreshExternalFileStamp: () => jest.fn(),
}, errorListFactory);
