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

import { ConfigurationSchema } from './launch-json-file';
import { array, arrayOf, assureProperty, InferType, object, optional, Schema } from '../generic/schema';
import { TaskSchema } from './tasks-json-file';
import { CTreeItemJsonFile } from '../generic/tree-item-file';

export const AdapterJsonSchema = new Schema({
    data: optional(object),
    launch: {
        'singlecore-launch': optional(ConfigurationSchema),
        'singlecore-attach': optional(ConfigurationSchema),
        'multicore-start-launch': optional(ConfigurationSchema),
        'multicore-start-attach': optional(ConfigurationSchema),
        'multicore-other': optional(ConfigurationSchema),
    },
    tasks: arrayOf(TaskSchema),
});

export type AdapterJson = InferType<typeof AdapterJsonSchema>;

export class AdapterJsonFile extends CTreeItemJsonFile {
    constructor(fileName?: string) {
        super(fileName);
        this.readOnly = true;
    }

    protected getContent() : AdapterJson {
        const obj = this.object;
        assureProperty(obj as object, 'launch', object, {});
        assureProperty(obj as object, 'tasks', array, []);
        return AdapterJsonSchema.parse(obj);
    }

    public get data(): object {
        return this.getContent().data ?? {};
    }

    public get launch(): AdapterJson['launch'] {
        return this.getContent().launch;
    }

    public get tasks(): AdapterJson['tasks'] {
        return this.getContent().tasks;
    }
}
