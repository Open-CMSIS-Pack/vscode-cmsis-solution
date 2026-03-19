/**
 * Copyright 2024-2026 Arm Limited
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

import { CSolutionWrap, TargetTypeWrap, BuildTypeWrap } from './csolution-wrap';
import { CSolutionYamlFile } from './csolution-yaml-file';
import { CTreeItem } from '../../generic/tree-item';
import { extractVersion, stripVersion } from '../../utils/string-utils';
import { MIN_TOOLBOX_VERSION } from '../../manifest';


describe('CSolutionYamlFile', () => {
    it('should create a CSolutionWrap with a top item', () => {
        const file = new CSolutionYamlFile();
        const wrap = file.solutionWrap;
        expect(wrap).toBeInstanceOf(CSolutionWrap);
        expect(wrap.item?.getTag()).toBe('solution');
        const top = file.topItem;
        const targetTypes = top?.getChild('target-types');
        expect(targetTypes).toBeInstanceOf(CTreeItem);
    });

    it('should ensure required toolbox version', () => {
        const file = new CSolutionYamlFile();
        // no created for default
        file.ensureCreatedForRequiredToolboxVersion();
        let createdFor = file.topItem?.getValue('created-for');
        expect(stripVersion(createdFor)).toEqual('CMSIS-Toolbox');
        expect(extractVersion(createdFor)).toEqual(MIN_TOOLBOX_VERSION);

        file.topItem?.setValue('created-for', 'CMSIS-Toolbox@2.0.0'); //smaller
        file.ensureCreatedForRequiredToolboxVersion();
        createdFor = file.topItem?.getValue('created-for');
        expect(stripVersion(createdFor)).toEqual('CMSIS-Toolbox');
        expect(extractVersion(createdFor)).toEqual(MIN_TOOLBOX_VERSION);

        file.topItem?.setValue('created-for', 'CMSIS-Toolbox@2.42.42'); //greater
        file.ensureCreatedForRequiredToolboxVersion();
        createdFor = file.topItem?.getValue('created-for');
        expect(createdFor).toEqual('CMSIS-Toolbox@2.42.42');
    });

    it('should get targetTypeWrapArray and targetTypeNames', () => {
        const file = new CSolutionYamlFile();
        const wrap = file.solutionWrap;
        // Add a target-type child
        const targetTypes = wrap.item?.getChild('target-types');
        const type1 = targetTypes?.createChild('target-type');
        type1?.setValue('type', 'debug');
        const type2 = targetTypes?.createChild('target-type');
        type2?.setValue('type', 'release');

        const arr = file.targetTypes;
        expect(arr.length).toBe(2);
        expect(arr[0]).toBeInstanceOf(TargetTypeWrap);
        expect(wrap.targetTypeNames).toContain('debug');
        expect(wrap.targetTypeNames).toContain('release');
    });

    it('should getTargetTypeWrap by name', () => {
        const file = new CSolutionYamlFile();
        const targetTypes = file.solutionWrap.item?.getChild('target-types');
        const type1 = targetTypes?.createChild('target-type');
        type1?.setValue('type', 'foo');
        const found = file.getTargetType('foo');
        expect(found).toBeInstanceOf(TargetTypeWrap);
        expect(found?.name).toBe('foo');
    });

    // --- BuildTypeWrap tests ---
    it('should get/add buildTypes ', () => {
        const file = new CSolutionYamlFile();
        // Add a build-type child
        let arr = file.buildTypes;
        expect(arr.length).toBe(0);
        expect(file.getBuildType()).toBeUndefined();

        const debugType = file.addBuildType('debug');
        expect(debugType).toBeInstanceOf(BuildTypeWrap);
        arr = file.buildTypes;
        expect(arr.length).toBe(1);
        expect(file.getBuildType('debug')).toEqual(debugType);
        expect(file.getBuildType()).toEqual(debugType);
        expect(file.getBuildType('release')).toBeUndefined();

        file.addBuildType('release');
        arr = file.buildTypes;
        expect(arr.length).toBe(2);
        const names = file.buildTypeNames;
        expect(names).toContain('debug');
        expect(names).toContain('release');
    });

});

describe('CSolutionYamlFile.ensureTargetSets', () => {

    it('creates a default target type and target set when none exist', () => {
        const file = new CSolutionYamlFile('test.csolution.yml');

        // precondition
        expect(file.getTargetType('')).toBeUndefined();

        file.ensureTargetSets();
        const tt = file.getTargetType();
        const ts = file.getTargetSet(tt?.name);
        expect(tt).toBeDefined();
        expect(tt?.name).toBe('default'); // default (empty) target-set name
        expect(ts?.set).toBe(''); // default (empty) target-set name
        const ts1 = tt?.getTargetSet();
        expect(ts1?.item).toBe(ts?.item);
    });

    it('returns first existing target set if no default is  present', () => {
        const file = new CSolutionYamlFile('test.csolution.yml');

        const ts = file.ensureTargetTypeAndSet('MyType');
        expect(ts).toBeDefined();
        expect(ts?.name).toEqual('');
        // update name
        ts.name = 'default';
        // check if the next call to ensureTargetSets returns the existing one
        file.ensureTargetSets();
        const ts1 = file.getTargetSet();
        expect(ts1).toBeDefined();
        expect(ts1?.name).toBe('default');
        expect(ts1?.item).toEqual(ts.item);
        ts1!.name = '';
        const ts2 = file.getTargetSet();
        expect(ts2).toBeDefined();
        expect(ts2?.name).toEqual('');
        expect(ts2?.item).toEqual(ts.item);
        expect(ts2?.getValue('set')).toBeUndefined();
        expect(ts2?.item?.getChild('set')).toBeDefined();
    });


    it('reuses existing default target set if already present', () => {
        const file = new CSolutionYamlFile('test.csolution.yml');

        const defTs = file.ensureTargetTypeAndSet('MyType'); // create default explicitly
        const myTs = file.ensureTargetTypeAndSet('MyType', 'MySet');

        const ts = file.ensureTargetTypeAndSet('MyType');

        expect(ts).toBeDefined();
        expect(ts.name).toEqual('');
        expect(ts.item).toBe(defTs.item);
        expect(ts.item).not.toBe(myTs.item);
    });

    it('adds first project matching context to the target set', () => {
        const file = new CSolutionYamlFile('test.csolution.yml');
        file.addTargetType('MyType');
        file.addBuildType('Release');
        file.addBuildType('Debug');

        const prjFor = file.addProjectRef('/path/to/MyProjectFor.cproject.yml');
        prjFor.item?.setValue('for-context', 'Debug+MyType');
        const prjNot = file.addProjectRef('/path/to/MyProjectNot.cproject.yml');
        prjNot.item?.setValue('not-for-context', '\\..*MyType');

        const ts = file.ensureTargetTypeAndSet('MyType');

        expect(ts).toBeDefined();
        expect(ts.name).toEqual('');
        expect(ts.item).toBeDefined();
        expect(ts.item?.getChild('set')).toBeDefined();
        expect(ts.images.length).toBe(1);
        const image = ts.images[0];
        expect(image.projectName).toEqual('MyProjectFor');
        expect(image.projectContext).toEqual('MyProjectFor.Debug');
    });

    it('does not add project context if target set exists though no images', () => {
        const file = new CSolutionYamlFile('test.csolution.yml');
        file.ensureTargetTypeAndSet('MyType', 'MySet'); // prior to projects
        file.addBuildType('Debug');
        file.addProjectRef('/path/to/MyProjectFor.cproject.yml');

        const ts = file.ensureTargetTypeAndSet('MyType');
        expect(ts).toBeDefined();
        expect(ts.name).toEqual('MySet');
        expect(ts.item).toBeDefined();
        expect(ts.item?.getChild('set')).toBeDefined();
        expect(ts.images.length).toBe(0);
    });

    it('purges project contexts', () => {
        const file = new CSolutionYamlFile('test.csolution.yml');
        const prj1 = file.addProjectRef('/path/to/MyProject1.cproject.yml');
        const prj2 = file.addProjectRef('/path/to/MyProject2.cproject.yml');

        for (let i = 0; i < 2; i++) {
            const tt = file.addTargetType(`Type${i}`);
            for (let j = 0; j < 2; j++) {
                const ts = tt.addTargetSet(`Ts${i}${j}`);
                ts.addProjectContext(prj1.projectName);
                ts.addProjectContext(prj2.projectName);
            }
        }

        // Helper method to verify image count across all target sets
        const verifyImageCounts = (expectedCount: number) => {
            for (const tt of file.targetTypes) {
                for (const ts of tt.targetSets) {
                    if (ts.images.length !== expectedCount) {
                        return false;
                    }
                    if (ts.item?.getChild('images') && expectedCount === 0) {
                        return false;
                    }
                }
            }
            return true;
        };

        expect(verifyImageCounts(2)).toBeTruthy();
        // move prj1
        prj1.name = '/path/toOther/MyProject1.cproject.yml';
        file.purgeAllProjectContexts();
        // should have no effect
        expect(verifyImageCounts(2)).toBeTruthy();

        prj1.name = '/path/toOther/MyProjectOther.cproject.yml';
        file.purgeAllProjectContexts();
        expect(verifyImageCounts(1)).toBeTruthy();

        prj2.remove();
        file.purgeAllProjectContexts();
        expect(verifyImageCounts(0)).toBeTruthy();
    });
});

describe('CSolutionYamlFile.getTargetSet', () => {

    it('returns undefined when no target-type or target-set exists', () => {
        const file = new CSolutionYamlFile('test.csolution.yml');
        expect(file.getTargetSet()).toBeUndefined();
        expect(file.getTargetSet('nonexistent')).toBeUndefined();
    });

    it('returns the (only) target-set when name omitted', () => {
        const file = new CSolutionYamlFile('test.csolution.yml');
        const tt = file.addTargetType('MyType');
        const ts = tt.addTargetSet('SetA');
        const found = file.getTargetSet();
        expect(found?.item).toBe(ts.item);
        expect(found?.name).toBe('SetA');
    });

    it('returns target-set by explicit name', () => {
        const file = new CSolutionYamlFile('test.csolution.yml');
        const tt = file.addTargetType('MyType');
        const tsA = tt.addTargetSet('SetA');
        const tsB = tt.addTargetSet('SetB');
        expect(file.getTargetSet('MyType', 'SetB')?.item).toBe(tsB.item);
        expect(file.getTargetSet('MyType', 'SetA')?.item).toBe(tsA.item);
    });

    it('returns undefined for non-existent target-set name', () => {
        const file = new CSolutionYamlFile('test.csolution.yml');
        const tt = file.addTargetType('MyType');
        tt.addTargetSet('Existing');
        expect(file.getTargetSet('MyType', 'Missing')).toBeUndefined();
    });

    it('prefers default unnamed target-set when present and name omitted', () => {
        const file = new CSolutionYamlFile('test.csolution.yml');
        const tt = file.addTargetType('MyType');
        const defaultTs = tt.addTargetSet(''); // unnamed (default)
        tt.addTargetSet('Other');
        const found = file.getTargetSet();
        expect(found?.item).toBe(defaultTs.item);
        expect(found?.name).toBe('');

        const found1 = file.getTargetSet('');
        expect(found1?.item).toBe(defaultTs.item);
    });

});

