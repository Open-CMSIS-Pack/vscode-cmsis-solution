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

import { ETextFileResult } from '../generic/text-file';
import * as fsUtils from '../utils/fs-utils';
import { TasksJsonFile, Task } from './tasks-json-file';
import * as path from 'path';

describe('TasksJsonFile', () => {
    const filePath = 'path/to/file.json';
    let tasksJsonFile: TasksJsonFile;

    beforeEach(() => {
        tasksJsonFile = new TasksJsonFile(filePath);
        jest.spyOn(fsUtils, 'fileExists').mockReturnValue(true);
    });

    it('Returns empty tasks when no tasks are present', async () => {
        const mockContent = JSON.stringify({ version: '0.2.0' }, null, 4);
        jest.spyOn(fsUtils, 'readTextFile').mockReturnValue(mockContent);

        await tasksJsonFile.load();

        expect(tasksJsonFile.tasks).toEqual([]);
    });

    it('Returns empty tasks when file is empty', async () => {
        const mockContent = '';
        jest.spyOn(fsUtils, 'readTextFile').mockReturnValue(mockContent);

        await tasksJsonFile.load();

        expect(tasksJsonFile.tasks).toEqual([]);
    });

    it('Returns known tasks', async () => {
        const tasks = [
            { type: 'shell', label: 'Build' },
            { type: 'shell', label: 'Run' },
            { test: 'Unknown configuration' }, // Unknown task
        ];
        const mockContent = JSON.stringify({ version: '0.2.0', tasks }, null, 4);
        jest.spyOn(fsUtils, 'readTextFile').mockReturnValue(mockContent);

        await tasksJsonFile.load();

        expect(tasksJsonFile.tasks).toEqual(tasks.slice(0, 2));
    });

    it('Keeps unknown tasks', async () => {
        const tasks = [
            { type: 'shell', label: 'CMSIS Build' },
            { type: 'shell', label: 'CMSIS Run' },
            { type: 'shell', label: 'Run' },
            { test: 'Unknown configuration' }, // Unknown task
        ];
        const mockContent = JSON.stringify({ version: '0.2.0', tasks }, null, 4);
        jest.spyOn(fsUtils, 'readTextFile').mockReturnValue(mockContent);
        jest.spyOn(fsUtils, 'writeTextFile').mockImplementation(() => { });
        await tasksJsonFile.load();
        tasksJsonFile.tasks = tasks.slice(1, 2) as Task[];

        await tasksJsonFile.save();

        const expectedContent = JSON.stringify({ version: '0.2.0', tasks: tasks.slice(1, 4) }, null, 4);
        expect(tasksJsonFile.text).toEqual(expectedContent);
    });

    it('Loads tasks from test data file', async () => {
        const testDataPath = path.join(__dirname, '../../test-data/files/tasks.json');

        // Use actual file system for this test
        jest.spyOn(fsUtils, 'fileExists').mockReturnValue(true);

        const testTasksJsonFile = new TasksJsonFile(testDataPath);
        const result = await testTasksJsonFile.load();
        expect(result).toEqual(ETextFileResult.Success);

        const str = testTasksJsonFile.stringify();

        expect(str).toEqual(testTasksJsonFile.text);

        // Verify the loaded tasks match expected structure
        expect(Array.isArray(testTasksJsonFile.tasks)).toBe(true);
        // Validate each task has required properties
        testTasksJsonFile.tasks.forEach(task => {
            expect(task).toHaveProperty('type');
            expect(task).toHaveProperty('label');
        });

        // Verify the text property contains valid JSON
        expect(() => JSON.parse(testTasksJsonFile.text)).not.toThrow();

        const parsedContent = JSON.parse(testTasksJsonFile.text);
        expect(parsedContent).toHaveProperty('version');
        expect(parsedContent).toHaveProperty('tasks');
    });
});
