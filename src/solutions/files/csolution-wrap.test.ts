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

import { TargetTypeWrap, TargetSetWrap, TypedWrap, ProjectRefWrap, ImageWrap, LoadImageType, DebuggerWrap } from './csolution-wrap';
import { CTreeItem, ETreeItemKind } from '../../generic/tree-item';
import path from 'path';
import { PROJECT_WEST_SUFFIX } from '../constants';

describe('CSolutionWrap', () => {
    describe('TargetTypeWrap', () => {
        it('should get device, board, targetSetItemArray, and targetSetNames', () => {
            const parent = new CTreeItem('target-type');
            parent.setValue('type', 'debug');
            parent.setValue('device', 'dev1');
            parent.setValue('board', 'board1');
            const targetSet = parent.createChild('target-set').createChild('-');
            targetSet.setValue('set', 'set1');
            const wrap = new TargetTypeWrap(parent);

            expect(wrap.device).toBe('dev1');
            expect(wrap.board).toBe('board1');
            const targetSets = wrap.targetSets;
            expect(targetSets.length).toBe(1);

            expect(targetSets[0]).toBeInstanceOf(TargetSetWrap);
            expect(targetSets[0].name).toEqual('set1');
            expect(wrap.targetSetNames).toContain('set1');
        });

        it('should getTargetSetWrap and addTargetSet', () => {
            const parent = new CTreeItem('target-type');
            const wrap = new TargetTypeWrap(parent);

            // add default ts
            let added = wrap.addTargetSet();
            expect(added).toBeInstanceOf(TargetSetWrap);
            expect(added.name).toEqual('');

            let found = wrap.getTargetSet();
            expect(found).toBeInstanceOf(TargetSetWrap);
            expect(found?.name).toEqual('');
            expect(found?.item?.getChild()?.getTag()).toEqual('set');

            // Add a named target set
            added = wrap.addTargetSet('foo');
            expect(added).toBeInstanceOf(TargetSetWrap);
            expect(added.name).toBe('foo');
            expect(wrap.targetSets.length).toBe(2);

            added = wrap.addTargetSet('');
            expect(added).toBeInstanceOf(TargetSetWrap);
            expect(added.name).toBe('');
            expect(wrap.targetSets.length).toBe(2);

            // Retrieve named set
            found = wrap.getTargetSet('foo');
            expect(found).toBeInstanceOf(TargetSetWrap);
            expect(found?.name).toBe('foo');

            // retrieve default
            found = wrap.getTargetSet();
            expect(found).toBeInstanceOf(TargetSetWrap);
            expect(found?.name).toEqual('');
            expect(found?.item?.getChild()?.getTag()).toEqual('set');

            found = wrap.getTargetSet('');
            expect(found).toBeInstanceOf(TargetSetWrap);
            expect(found?.name).toEqual('');
            expect(found?.item?.getChild()?.getTag()).toEqual('set');
            expect(found?.item?.getValue('set')).toBeUndefined();

            found?.remove();
            expect(wrap.targetSets.length).toBe(1);

            found = wrap.getTargetSet('');
            expect(found).toBeInstanceOf(TargetSetWrap);
            expect(found?.name).toEqual('foo');

            found = wrap.getTargetSet();
            expect(found).toBeInstanceOf(TargetSetWrap);
            expect(found?.name).toEqual('foo');
        });
    });

    describe('TypedWrap', () => {
        it('should get type from value', () => {
            const item = new CTreeItem('target-type');
            item.setValue('type', 'special');
            const wrap = new TypedWrap(item);
            expect(wrap.type).toBe('special');
            expect(wrap.nameKey).toBe('type');
        });
    });

    describe('TargetSetWrap', () => {
        it('should get set from value', () => {
            const item = new CTreeItem('-');
            item.setValue('set', 'myset');
            const wrap = new TargetSetWrap(item);
            expect(wrap.set).toBe('myset');
            expect(wrap.name).toBe('myset');
            expect(wrap.nameKey).toBe('set');
            expect(wrap.debugger).toBeUndefined();
            expect(wrap.images.length).toBe(0);
            wrap.name = '';
            expect(wrap.set).toBe('');
            expect(wrap.name).toBe('');
            expect(wrap.getValue('set')).toBeUndefined();
        });

        it('should add and get images and project contexts', () => {
            const item = new CTreeItem('-');
            item.setValue('set', 'myset');
            const wrap = new TargetSetWrap(item);
            // add debugger
            const dbg = wrap.ensureDebugger('MyDebugger');
            dbg.protocol = 'swd';
            dbg.clock = '1000';

            expect(wrap.debugger?.item).toEqual(dbg.item);
            expect(wrap.debugger?.clock).toEqual('1000');
            expect(wrap.debugger?.protocol).toEqual('swd');
            expect(wrap.debugger?.name).toEqual('MyDebugger');

            // Add image entries
            const image1 = wrap.addImage('/path/to/image1.axf');
            image1.type = 'axf';
            image1.load = 'image+symbols';

            const image2 = wrap.addImage('/path/to/image2.elf');
            image2.type = 'elf';
            image2.load = 'symbols';

            // Add project-context entries
            wrap.addProjectContext('proj1.debug');
            wrap.addProjectContext('proj2');

            // Validate image names
            expect(wrap.imageNames).toEqual(expect.arrayContaining([
                '/path/to/image1.axf',
                '/path/to/image2.elf'
            ]));

            // Validate project context names
            expect(wrap.projectContextNames).toEqual(expect.arrayContaining([
                'proj1.debug',
                'proj2'
            ]));

            expect(wrap.images.length).toEqual(4);
            expect(wrap.imagesOnly.length).toEqual(2);

            // Retrieval checks
            const foundImg = wrap.getImage('/path/to/image2.elf');
            expect(foundImg?.load).toBe('symbols');

            const foundCtx = wrap.getProjectContext('proj1.debug');
            expect(foundCtx?.projectContext).toBe('proj1.debug');

            // ReadonlyArray compile-time check
            // @ts-expect-error push not allowed on ReadonlyArray<Image>
            wrap.images.push(image1);

            expect(wrap.set).toBe('myset');
            expect(wrap.nameKey).toBe('set');
        });
    });

    // New tests for Image load/type behavior
    describe('Image', () => {
        it('should set and get allowed load kinds', () => {
            const item = new CTreeItem('image');
            const img = new ImageWrap(item);

            const loadTypes: LoadImageType[] = ['image+symbols', 'symbols', 'image', 'none'];
            for (const lt of loadTypes) {
                img.load = lt;
                expect(img.load).toBe(lt);
            }
        });

        it('should set and get image type', () => {
            const item = new CTreeItem('image');
            const img = new ImageWrap(item);

            img.type = 'axf';
            expect(img.type).toBe('axf');

            img.type = undefined;
            expect(img.type).toBeUndefined();
        });

        // @ts-expect-error invalid load kind should be a compile-time error
        // eslint-disable-next-line
        const _invalidLoad: LoadImageType = 'invalid-value';
    });

    describe('ProjectRefWrap', () => {
        it('should expose project and derived names', () => {
            const item = new CTreeItem('-');
            item.rootFileName = 'foo/foo.yml';
            item.setValue('project', 'path/to/MyProject');
            const projectPath = path.resolve('foo', 'path/to/MyProject');
            const wrap = new ProjectRefWrap(item);
            expect(wrap.project).toBe('path/to/MyProject');
            expect(wrap.name).toBe('path/to/MyProject');
            expect(wrap.projectName).toBe('MyProject');
            expect(wrap.projectPath).toEqual(projectPath);
            expect(wrap.deviceProcessor).toBeUndefined();
            // rename
            wrap.name = 'path/to/MyProject1';
            expect(wrap.project).toBe('path/to/MyProject1');
            expect(wrap.name).toBe('path/to/MyProject1');
            expect(wrap.projectName).toBe('MyProject1');
            expect(wrap.projectPath).toEqual(projectPath + '1');
            expect(wrap.deviceProcessor).toBeUndefined();

        });

        it('should override name with west app-path and derive projectName/deviceProcessor', () => {
            const item = new CTreeItem('-');
            item.rootFileName = 'foo/foo.yml';
            const west = item.createChild('west', true);
            west.setValue('app-path', 'apps/appA');
            west.setValue('device', ':core1');
            const wrap = new ProjectRefWrap(item);
            expect(wrap.project).toEqual('apps/appA/appA' + PROJECT_WEST_SUFFIX);
            expect(wrap.name).toBe('apps/appA/appA' + PROJECT_WEST_SUFFIX);
            expect(wrap.projectName).toBe('appA');
            expect(wrap.deviceProcessor).toBe('core1');

            wrap.name = 'appFoo';
            expect(wrap.project).toEqual('apps/appA/appFoo' + PROJECT_WEST_SUFFIX);
            expect(wrap.projectName).toBe('appFoo');
        });
        it('should override name with west app-path, get projectName from id', () => {
            const item = new CTreeItem('-');
            const west = item.createChild('west', true);
            west.setValue('app-path', 'apps/appA');
            west.setValue('project-id', 'appID');
            const wrap = new ProjectRefWrap(item);
            expect(wrap.project).toEqual('apps/appA/appID' + PROJECT_WEST_SUFFIX);
            expect(wrap.name).toBe('apps/appA/appID' + PROJECT_WEST_SUFFIX);
            expect(wrap.projectName).toBe('appID');
            expect(wrap.deviceProcessor).toBeUndefined();
        });
    });

    describe('DebuggerWrap', () => {
        describe('setParameter', () => {
            it('should set parameter on debugger item when section is undefined', () => {
                const item = new CTreeItem('debugger');
                item.setValue('name', 'TestDebugger');
                const wrap = new DebuggerWrap(item);

                wrap.setParameter(undefined, 'protocol', 'swd');

                expect(wrap.protocol).toBe('swd');
                expect(item.getValue('protocol')).toBe('swd');
            });

            it('should set parameter on map section', () => {
                const item = new CTreeItem('debugger');
                const section = item.createChild('connections', true);
                section.setKind(ETreeItemKind.Map);
                const wrap = new DebuggerWrap(item);

                wrap.setParameter('connections', 'url', 'tcp://localhost:1234');

                expect(section.getValue('url')).toBe('tcp://localhost:1234');
            });

            it('should set parameter on sequence section - updating existing entries', () => {
                const item = new CTreeItem('debugger');
                const section = item.createChild('processors', true);
                section.setKind(ETreeItemKind.Sequence);
                const entry1 = section.createChild('-');
                entry1.setValue('name', 'core0');
                const entry2 = section.createChild('-');
                entry2.setValue('name', 'core1');
                const wrap = new DebuggerWrap(item);

                wrap.setParameter('processors', 'name', 'updated');

                expect(entry1.getValue('name')).toBe('updated');
                expect(entry2.getValue('name')).toBe('updated');
            });

            it('should create sequence entry if none exists and set parameter', () => {
                const item = new CTreeItem('debugger');
                const section = item.createChild('memory', true);
                section.setKind(ETreeItemKind.Sequence);
                const wrap = new DebuggerWrap(item);

                expect(section.getChildren().length).toBe(0);
                wrap.setParameter('memory', 'address', '0x00000000');

                const children = section.getChildren();
                expect(children.length).toBe(1);
                expect(children[0].getValue('address')).toBe('0x00000000');
            });

            it('should not set parameter if section does not exist', () => {
                const item = new CTreeItem('debugger');
                const wrap = new DebuggerWrap(item);

                wrap.setParameter('nonexistent', 'param', 'value');

                expect(item.getChild('nonexistent')).toBeUndefined();
            });

            it('should set parameter to undefined to remove it', () => {
                const item = new CTreeItem('debugger');
                item.setValue('name', 'TestDebugger');
                item.setValue('protocol', 'swd');
                const wrap = new DebuggerWrap(item);

                expect(wrap.protocol).toBe('swd');
                wrap.setParameter(undefined, 'protocol', undefined);

                expect(item.getValue('protocol')).toBeUndefined();
            });

            it('should update multiple parameters in sequence entries independently', () => {
                const item = new CTreeItem('debugger');
                const section = item.createChild('cores', true);
                section.setKind(ETreeItemKind.Sequence);
                const entry1 = section.createChild('-');
                entry1.setValue('mode', 'true');
                entry1.setValue('id', 'core0');
                const wrap = new DebuggerWrap(item);

                wrap.setParameter('cores', 'mode', 'false');

                expect(entry1.getValue('id')).toBe('core0');
                expect(entry1.getValue('mode')).toBe('false');
            });
        });
    });
});
