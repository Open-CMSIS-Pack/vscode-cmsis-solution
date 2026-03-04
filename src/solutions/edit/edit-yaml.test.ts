/**
 * Copyright 2024-2026 Arm Limited
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

import 'jest';
import { YAMLMap, YAMLSeq, Node as YamlNode } from 'yaml';
import * as yaml from 'yaml';
import { followListItemPathSegment, followMapKeyPathSegment, getYamlNodeAtPath, listItem, mapKey, modifyYamlNodeAtPath } from './edit-yaml';

describe('YAML file editing', () => {
    describe('followMapKeyPathSegment', () => {
        it('returns undefined if the node is not a map', () => {
            const result = followMapKeyPathSegment(new YAMLSeq(), mapKey('testKey'));
            expect(result).toBeUndefined();
        });

        it('returns undefined if the value at the key is undefined', () => {
            const map = new YAMLMap();
            map.set('anotherKey', 'someValue');
            const result = followMapKeyPathSegment(map, mapKey('testKey'));
            expect(result).toBeUndefined();
        });

        it('returns the value at the key if it is a yaml node', () => {
            const testValue = new YAMLMap();
            const map = new YAMLMap();
            map.set('testKey', testValue);
            const result = followMapKeyPathSegment(map, mapKey('testKey'));
            expect(result).toBe(testValue);
        });
    });

    describe('followListItemPathSegment', () => {
        it('returns undefined if the node is not a sequence', () => {
            const result = followListItemPathSegment(new YAMLMap(), listItem(() => true));
            expect(result).toBeUndefined();
        });

        it('returns undefined if the predicate matches no items', () => {
            const sequence = new YAMLSeq();
            sequence.add(new YAMLMap());
            const result = followListItemPathSegment(sequence, listItem(() => false));
            expect(result).toBeUndefined();
        });

        it('returns the value that matched the predicate', () => {
            const testValue = new YAMLMap();
            testValue.set('testKey', 'someValue');
            const sequence = new YAMLSeq();
            sequence.add(new YAMLMap());
            sequence.add(testValue);
            const predicate = (node: YamlNode): boolean => yaml.isMap(node) && node.get('testKey') === 'someValue';
            const result = followListItemPathSegment(sequence, listItem(predicate));
            expect(result).toBe(testValue);
        });
    });

    describe('getYamlNodeAtPath', () => {
        it('returns the root node if the path is empty', () => {
            const rootNode = new YAMLMap();
            const result = getYamlNodeAtPath(rootNode, []);
            expect(result).toBe(rootNode);
        });

        it('returns undefined if the path does not match a YAML entry', () => {
            const result = getYamlNodeAtPath(new YAMLMap(), [mapKey('notExistingKey')]);
            expect(result).toBeUndefined();
        });

        it('returns the YAML node at the end of the path', () => {
            const expectedNode = new YAMLMap();
            expectedNode.set('isTarget', true);

            const sequence = new YAMLSeq();
            sequence.add(new YAMLMap());
            sequence.add(expectedNode);

            const rootNode = new YAMLMap();
            rootNode.set('parent', sequence);

            const predicate = (node: YamlNode): boolean => yaml.isMap(node) && !!node.get('isTarget');
            const result = getYamlNodeAtPath(rootNode, [mapKey('parent'), listItem(predicate)]);
            expect(result).toBe(expectedNode);
        });
    });

    describe('modifyYamlNodeAtPath', () => {
        it('runs the modify function on the node at the end of the path', () => {
            const targetNode = new YAMLMap();
            targetNode.set('fieldToModify', 'initialValue');

            const rootNode = new YAMLMap();
            rootNode.set('target', targetNode);

            const modifyFunction = (node: YamlNode) => yaml.isMap(node) && node.set('fieldToModify', 'newValue');
            modifyYamlNodeAtPath(rootNode, [mapKey('target')], modifyFunction);

            expect(targetNode.get('fieldToModify')).toBe('newValue');
        });
    });
});
