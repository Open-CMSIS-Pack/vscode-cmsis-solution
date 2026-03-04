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

import { LaunchJsonFile } from './launch-json-file';
import * as fsUtils from '../utils/fs-utils';
import path from 'path';
import { TestDataHandler } from '../__test__/test-data';
import { Uri } from 'vscode';
import { ETextFileResult } from '../generic/text-file';

const initialContent =
`{
    // Top comment
    "version": "0.2.0",
    // comment before configurations
    "configurations": [
        {
            // comment to keep in update
            "name": "Launch auto",
            "type": "node",
            "request": "launch",
            "cmsis": {
                "updateConfiguration": "auto"
            }
        },
        {
            // comment before attach user
            "name": "Attach user",
            "type": "node",
            "request": "attach",
            "cmsis": {
                "updateConfiguration": "manual"
            }
        },
        {
            // comment before Launch no cmsis
            "name": "Launch no cmsis",
            "type": "node",
            "request": "launch"
        },
        {
            // comment before unknown
            "test": "Unknown"
        }
    ]
}`;

const updatedContent =
`{
    // Top comment
    "version": "0.2.0",
    // comment before configurations
    "configurations": [
        {
            // comment to keep in update
            "name": "Launch auto",
            "type": "new",
            "request": "launch",
            "cmsis": {
                "updateConfiguration": "auto"
            }
        },
        {
            // comment before attach user
            "name": "Attach user",
            "type": "node",
            "request": "attach",
            "cmsis": {
                "updateConfiguration": "manual"
            }
        },
        {
            // comment before Launch no cmsis
            "name": "Launch no cmsis",
            "type": "node",
            "request": "launch"
        },
        {
            // comment before unknown
            "test": "Unknown"
        },
        {
            "name": "Attach new",
            "type": "new",
            "request": "attach"
        }
    ]
}`;

const remainingContent =
`{
    // Top comment
    "version": "0.2.0",
    // comment before configurations
    "configurations": [
        {
            // comment before attach user
            "name": "Attach user",
            "type": "node",
            "request": "attach",
            "cmsis": {
                "updateConfiguration": "manual"
            }
        },
        {
            // comment before Launch no cmsis
            "name": "Launch no cmsis",
            "type": "node",
            "request": "launch"
        },
        {
            // comment before unknown
            "test": "Unknown"
        }
    ]
}`;


describe('LaunchJsonFile', () => {
    let launchJsonFile: LaunchJsonFile;
    const testDataHandler = new TestDataHandler();
    const tmpDir = testDataHandler.tmpDir;
    const workspaceFolderUri  = Uri.file(tmpDir);
    const workspaceFolder = workspaceFolderUri.fsPath; // platform-specific string path
    const filePath = path.join(workspaceFolder, '.vscode', 'launch.json');

    afterAll(async () => {
        testDataHandler.dispose();
    });

    beforeEach(() => {
        launchJsonFile = new LaunchJsonFile(filePath);
    });

    afterEach(() => {
        testDataHandler.rmFile(filePath);
    });

    it('Returns empty configurations when no configurations are present', async () => {
        const mockContent = JSON.stringify({ version: '0.2.0' }, null, 4);
        fsUtils.writeTextFile(filePath, mockContent);
        await launchJsonFile.load();

        expect(launchJsonFile.configurations).toEqual([]);
    });

    it('Returns empty configurations when file is empty', async () => {
        const mockContent = '';
        fsUtils.writeTextFile(filePath, mockContent);
        await launchJsonFile.load();
        expect(launchJsonFile.configurations).toEqual([]);
    });

    it('Returns known configurations', async () => {
        const configurations = [
            { name: 'Launch Program', type: 'node', request: 'launch' },
            { name: 'Attach to Process', type: 'node', request: 'attach' },
            { test: 'Unknown configuration' },
        ];
        const mockContent = JSON.stringify({ version: '0.2.0', configurations }, null, 4);
        fsUtils.writeTextFile(filePath, mockContent);
        await launchJsonFile.load();
        expect(launchJsonFile.configurations).toEqual(configurations.slice(0, 2));
    });

    it('Keeps initial content', async () => {
        fsUtils.writeTextFile(filePath, initialContent);
        let result = await launchJsonFile.load();
        expect(result).toEqual(ETextFileResult.Success);
        launchJsonFile.text = ''; // to trigger actual save
        result = await launchJsonFile.save();
        expect(result).toEqual(ETextFileResult.Success);
        const savedContent = fsUtils.readTextFile(filePath);
        expect(savedContent).toEqual(initialContent);
    });


    it('Removes configurations', async () => {
        fsUtils.writeTextFile(filePath, initialContent);
        await launchJsonFile.load();
        launchJsonFile.removeUnlistedConfigurations([]); //removes all but unknown and user
        await launchJsonFile.save();
        expect(launchJsonFile.text).toEqual(remainingContent);
    });

    it('Adds and updates configurations', async () => {
        const configurations = [
            { name: 'Launch auto', type: 'new', request: 'launch', cmsis: { updateConfiguration: 'auto' } }, // updated
            { name: 'Attach new', type: 'new', request: 'attach' }, // inserted
            { name: 'Attach user', type: 'new', request: 'attach' }, // ignored
        ];
        fsUtils.writeTextFile(filePath, initialContent);
        await launchJsonFile.load();
        launchJsonFile.configurations = configurations;
        const newItem = launchJsonFile.findConfigItem('name', 'Attach new');
        expect(newItem).toBeDefined();
        expect(newItem?.getValue('name')).toEqual('Attach new');
        expect(newItem?.getValue('type')).toEqual('new');

        const autoItem = launchJsonFile.findConfigItem('name', 'Launch auto');
        expect(autoItem).toBeDefined();
        expect(autoItem?.getValue('type')).toEqual('new');

        const userItem = launchJsonFile.findConfigItem('name', 'Attach user');
        expect(userItem).toBeDefined();
        expect(userItem?.getValue('type')).toEqual('node'); // not changed

        await launchJsonFile.save();
        expect(launchJsonFile.text).toEqual(updatedContent);
    });

});
