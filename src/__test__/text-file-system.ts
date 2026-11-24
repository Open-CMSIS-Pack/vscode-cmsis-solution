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
import { ITextFileSystem } from '@open-cmsis-pack/cmsis-common/text-file-system';

export const textFileSystemFactory = (files = new Map<string, string>()): jest.Mocked<ITextFileSystem> => ({
    exists: jest.fn(name => files.has(name)),
    read: jest.fn(name => files.get(name) ?? ''),
    write: jest.fn((name, text) => { files.set(name, text); }),
    unlink: jest.fn(name => { files.delete(name); }),
    dirname: jest.fn(path.dirname),
    resolve: jest.fn(path.resolve),
});
