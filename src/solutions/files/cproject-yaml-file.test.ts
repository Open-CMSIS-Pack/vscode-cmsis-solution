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

import * as path from 'path';
import { CTreeItem } from '../../generic/tree-item';
import { constructProjectYamlFile, CProjectYamlFile } from './cproject-yaml-file';
import { ProjectRefWrap } from './csolution-wrap';
import { PROJECT_WEST_SUFFIX } from '../constants';



function makeFile(deviceValue?: string): CProjectYamlFile {
    const file = new CProjectYamlFile('dummy-path');
    const topItem = file.ensureTopItem();
    if (deviceValue) {
        topItem.setValue('device', deviceValue);
    }
    return file;
}
describe('CProjectYamlFile', () => {
    describe('CProjectYamlFile deviceProcessor', () => {
        it('returns processor if specified', () => {
            const file = makeFile(':core1');
            expect(file.deviceProcessor).toBe('core1');
        });
        it('extracts processor suffix when device name present', () => {
            const file = makeFile('MyDevice:core1');
            expect(file.deviceProcessor).toBe('core1');
        });

        it('handles deprecated leading vendor prefix (::)', () => {
            const file = makeFile('MyVendor::MyDevice:core1');
            expect(file.deviceProcessor).toBe('core1');
        });

        it('returns undefined when processor suffix absent', () => {
            const file = makeFile('MyDevice');
            expect(file.deviceProcessor).toBeUndefined();
        });

        it('returns undefined when device value is undefined', () => {
            const file = makeFile(undefined);
            expect(file.deviceProcessor).toBeUndefined();
        });
    });

    describe('constructProjectYamlFile', () => {
        it('constructs regular CProjectYamlFile if no reference is specified', () => {
            const file = constructProjectYamlFile();
            expect(file).toBeDefined();
            expect(file).toBeInstanceOf(CProjectYamlFile);
            expect(file.fileName).toBe('');
        });

        it('constructs regular CProjectYamlFile if project reference is specified', () => {
            const item = new CTreeItem('-');
            item.setValue('project', 'path/to/my/project.cproject.yml');
            const ref = new ProjectRefWrap(item);
            const file = constructProjectYamlFile(new ProjectRefWrap(item));
            expect(file).toBeDefined();
            expect(file).toBeInstanceOf(CProjectYamlFile);
            expect(file.fileName).toEqual(ref.projectPath);
        });

        it('constructs virtual CProjectYamlFile for a West reference', () => {
            const item = new CTreeItem('-');
            const west = item.createChild('west');
            const cwd = process.cwd();
            const myPath = path.join(cwd, 'path/to/my');

            west.setValue('device', ':core1');
            west.setValue('project-id', 'appId');
            west.setValue('app-path', myPath);
            item.setValue('project', 'path/to/my/project.cproject.yml');
            const ref = new ProjectRefWrap(item);
            const file = constructProjectYamlFile(new ProjectRefWrap(item));
            expect(file).toBeDefined();
            expect(file).toBeInstanceOf(CProjectYamlFile);
            expect(file.readOnly).toBeTruthy();
            const expected = path.join(myPath, 'appId' + PROJECT_WEST_SUFFIX);
            expect(file.fileName).toBe(expected);
            expect(file.deviceProcessor).toEqual(ref.deviceProcessor);
        });
    });

});
