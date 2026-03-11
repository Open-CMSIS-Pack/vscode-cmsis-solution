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

import { arrayOf, object, Schema, unionOf, string, InferType, optional, assureProperty, array } from '../generic/schema';
import { CTreeItem } from '../generic/tree-item';
import { CTreeItemJsonFile } from '../generic/tree-item-file';

export const InputSchema = new Schema({
    id: string,
    type: string,
    description: optional(string),
});

export const TaskSchema = new Schema({
    label: string,
    type: optional(string),
});

export const TasksJsonSchema = new Schema({
    version: string,
    inputs: optional(arrayOf(unionOf(InputSchema, object))),
    tasks: arrayOf(unionOf(TaskSchema, object)),
});

export type Input = InferType<typeof InputSchema>;
export type Task = InferType<typeof TaskSchema>;
export type TasksJson = InferType<typeof TasksJsonSchema>;

export class TasksJsonFile extends CTreeItemJsonFile {

    protected getContent(): TasksJson {
        const obj = this.object;
        assureProperty(obj, 'version', string, '2.0.0');
        assureProperty(obj, 'tasks', array, []);
        return TasksJsonSchema.parse(obj);
    }

    public get inputs(): Input[] {
        const content = this.getContent();
        return content.inputs?.filter(i => InputSchema.validate(i)) ?? [];
    }

    public get tasks(): Task[] {
        const content = this.getContent();
        return content.tasks.filter(t => TaskSchema.validate(t));
    }

    public set tasks(tasks: Task[]) {
        const labelsToKeep = tasks.map(t => t.label);
        this.removeUnlistedTasks(labelsToKeep);
        for (const t of tasks) {
            this.addTask(t);
        }
    }

    public override ensureRootItem(): CTreeItem {
        const root = super.ensureRootItem();
        // also ensure version property
        if (!root.getChild('version')) {
            root.createChild('version').setText('2.0.0');
        }
        return root;
    }

    /**
     * Creates 'tasks' element if not exists
     * @returns 'tasks' as CTreeItem
     */
    protected ensureTasks() {
        return this.ensureRootItem().createChild('tasks', true);
    }

    public getTaskItem(label?: string) {
        const tasks = this.rootItem?.getChild('tasks');
        return tasks?.getChildByValue('label', label ?? '');
    }

    public addTask(newTask: Task) {
        const existingTask = this.getTaskItem(newTask.label);
        if (existingTask) {
            return existingTask.fromObject(newTask);
        }
        return this.ensureTasks().createChild('-').fromObject(newTask);
    }

    public getInputItem(id: string) {
        const inputs = this.rootItem?.getChild('inputs');
        return inputs?.getChildByValue('id', id);
    }

    public addInput(newInput: Input) {
        const existingInput = this.getInputItem(newInput.id);
        if (existingInput) {
            return existingInput.fromObject(newInput);
        }
        return this.ensureRootItem().createChild('inputs', true, 1).createChild('-').fromObject(newInput);
    }


    /**
     * Removes tasks listed in the provided array.
     * Keeps unknown tasks
     * @param labelsToKeep Array of tasks labels
     */
    public removeUnlistedTasks(labelsToKeep: string[]) {
        const tasksItem = this.rootItem?.getChild('tasks');
        if (!tasksItem) {
            return;
        }
        for (const child of tasksItem.getChildren().slice()) {
            const label = child.getValue('label');
            if (!label || !label.startsWith('CMSIS') || labelsToKeep.includes(label)) {
                continue;
            }
            tasksItem.removeChild(child);
        }
    }
}
