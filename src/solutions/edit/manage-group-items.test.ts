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

import 'jest';
import { FileOrGroup, addItemToExistingGroup, addItemToGroupNode, buildPathFromContentToGroup, constructFileOrGroupNode, deleteItemFromExistingGroup } from './manage-group-items';
import { faker } from '@faker-js/faker';
import { YAMLMap, Document as YamlDocument } from 'yaml';
import { ListItemYamlPathSegment, listItem, mapKey } from './edit-yaml';
import { fileDataFactory } from '../parsing/common-file-parsing.factories';
import * as yaml from 'yaml';
import { expectYamlEqual } from '../common-yaml/test-helpers';

describe('addItemToExistingGroup', () => {
    describe('constructFileNode', () => {
        it('builds a YAML map for a file without context restrictions', () => {
            const fileData: FileOrGroup = { type: 'file', data: fileDataFactory() };
            const result = constructFileOrGroupNode(fileData);

            expect(result.toJSON()).toEqual({
                file: fileData.data.name,
            });
        });

        it('builds a YAML map for a file with context restrictions', () => {

            const fileData  : FileOrGroup = { type: 'file',  data: fileDataFactory({
                forContext: ['.Build', '.Release'],
                notForContext: '+Target',
            }) };

            const result = constructFileOrGroupNode(fileData);

            expect(result.toJSON()).toEqual({
                file: fileData.data.name,
                'for-context': fileData.data.forContext,
                'not-for-context': [fileData.data.notForContext],
            });
        });
    });

    describe('addFileToGroupNode', () => {
        it('adds the file to a group with an existing files list', () => {
            const existingFilePath = faker.system.filePath();
            const group = new YamlDocument({ files: [{ file: existingFilePath }] }).contents;

            const fileData  : FileOrGroup = { type: 'file', data: fileDataFactory() };
            addItemToGroupNode(group!, fileData);

            expect(group!.toJSON()).toEqual({
                files: [
                    { file: existingFilePath },
                    constructFileOrGroupNode(fileData).toJSON(),
                ],
            });
        });

        it('adds the file to a group without an existing files list', () => {
            const group = new YAMLMap();
            const fileData  : FileOrGroup = { type: 'file', data: fileDataFactory() };
            addItemToGroupNode(group, fileData);

            expect(group.toJSON()).toEqual({
                files: [constructFileOrGroupNode(fileData).toJSON()],
            });
        });
    });

    describe('buildPathFromContentToGroup', () => {
        it('returns the yaml path required to go from the content root to a given group', () => {
            const result = buildPathFromContentToGroup(['group1', 'group2'], [mapKey('initialPathKey')]);

            expect(result).toEqual<ReturnType<typeof buildPathFromContentToGroup>>([
                mapKey('initialPathKey'),
                mapKey('groups'),
                listItem(expect.any(Function)),
                mapKey('groups'),
                listItem(expect.any(Function)),
            ]);

            const group1ListItemSegment = result[2] as ListItemYamlPathSegment;

            const group1Map = new YAMLMap();
            group1Map.set('group', 'group1');
            expect(group1ListItemSegment.predicate(group1Map)).toBe(true);

            const group2Map = new YAMLMap();
            group2Map.set('group', 'group2');
            expect(group1ListItemSegment.predicate(group2Map)).toBe(false);
        });
    });

    it('modifies the group node in the given document to add the appropriate file', () => {
        const yamlDocument = yaml.parseDocument(`
project:
  groups:
    - group: Another Group
    - group: Parent
      groups:
        - group: Child
          files:
            - file: aFile.c
`
        );
        const fileData: FileOrGroup = { type: 'file', data: fileDataFactory({ name: 'newFile.c' }) };
        const groupPath = ['Parent', 'Child'];
        addItemToExistingGroup(yamlDocument, 'project', groupPath, fileData);

        const expectedYaml = `
project:
  groups:
    - group: Another Group
    - group: Parent
      groups:
        - group: Child
          files:
            - file: aFile.c
            - file: newFile.c
`;

        expectYamlEqual(yamlDocument, expectedYaml);
    });

    it('should remove nested group with duplicate name without affecting top-level group', () => {
        const yamlDocument = yaml.parseDocument(`
project:
  groups:
    - group: foo
      files:
        - file: top-level-file.c
    - group: bar
      groups:
        - group: foo
          files:
            - file: nested-file.c
      files:
        - file: bar-file.c
`);

        const result = deleteItemFromExistingGroup(yamlDocument, 'project', ['bar'], 'group', 'foo');
        expect(result).toBe(true);

        const expectedYaml = `
project:
  groups:
    - group: foo
      files:
        - file: top-level-file.c
    - group: bar
      files:
        - file: bar-file.c
`;

        expectYamlEqual(yamlDocument, expectedYaml);
    });

    it('should delete group with only files (Case 1)', () => {
        const yamlDocument = yaml.parseDocument(`
project:
  groups:
    - group: g1
      files:
        - file: f1.c
        - file: f2.c
    - group: other
      files:
        - file: other.c
`);

        const result = deleteItemFromExistingGroup(yamlDocument, 'project', [], 'group', 'g1');
        expect(result).toBe(true);

        const expectedYaml = `
project:
  groups:
    - group: other
      files:
        - file: other.c
`;

        expectYamlEqual(yamlDocument, expectedYaml);
    });

    it('should delete group with only subgroups (Case 2)', () => {
        const yamlDocument = yaml.parseDocument(`
project:
  groups:
    - group: g1
      groups:
        - group: sg1
        - group: sg2
          groups:
            - group: sg2sg1
            - group: sg2sg2
    - group: other
      files:
        - file: other.c
`);

        const result = deleteItemFromExistingGroup(yamlDocument, 'project', [], 'group', 'g1');
        expect(result).toBe(true);

        const expectedYaml = `
project:
  groups:
    - group: other
      files:
        - file: other.c
`;

        expectYamlEqual(yamlDocument, expectedYaml);
    });

    it('should delete group with both files and subgroups (Case 3)', () => {
        const yamlDocument = yaml.parseDocument(`
project:
  groups:
    - group: g1
      files:
        - file: f1.c
        - file: f2.c
      groups:
        - group: sg1
          files:
            - file: f1sg1.c
            - file: f2sg1.c
        - group: sg2
          groups:
            - group: sg2sg1
            - group: sg2sg2
              files:
                - file: f1sg2.c
                - file: f2sg2.c
    - group: other
      files:
        - file: other.c
`);

        const result = deleteItemFromExistingGroup(yamlDocument, 'project', [], 'group', 'g1');
        expect(result).toBe(true);

        const expectedYaml = `
project:
  groups:
    - group: other
      files:
        - file: other.c
`;

        expectYamlEqual(yamlDocument, expectedYaml);
    });

    it('should delete nested subgroup without affecting parent structure', () => {
        const yamlDocument = yaml.parseDocument(`
project:
  groups:
    - group: g1
      files:
        - file: f1.c
      groups:
        - group: sg1
          files:
            - file: f1sg1.c
        - group: sg2
          files:
            - file: f1sg2.c
`);

        // Delete sg1 subgroup from within g1
        const result = deleteItemFromExistingGroup(yamlDocument, 'project', ['g1'], 'group', 'sg1');
        expect(result).toBe(true);

        const expectedYaml = `
project:
  groups:
    - group: g1
      files:
        - file: f1.c
      groups:
        - group: sg2
          files:
            - file: f1sg2.c
`;

        expectYamlEqual(yamlDocument, expectedYaml);
    });

});
