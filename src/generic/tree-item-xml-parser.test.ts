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

import { CTreeItemXmlParser, parseXmlToCTreeItem, toXmlString } from './tree-item-xml-parser';
import { CTreeItem } from './tree-item';
import dedent from 'dedent';
import { CTreeItemBuilder } from './tree-item-builder';

describe('parseXmlToCTreeItem', () => {
    it('test parseXmlToCTreeItem parsing empty input', async () => {

        const root = parseXmlToCTreeItem('');
        expect(root).toBeInstanceOf(CTreeItem);
        expect(root!.rootFileName).toEqual('');
        expect(root!.getTag()).toEqual(undefined);
    });

    it('test parseXmlToCTreeItem parsing non-existing file', async () => {
        const root = parseXmlToCTreeItem('', 'dummyFile.xml');
        expect(root).toBeInstanceOf(CTreeItem);
        expect(root!.rootFileName).toEqual('dummyFile.xml');
        expect(root!.getTag()).toEqual(undefined);
    });

    it('test parseXmlToCTreeItem parsing invalid XML and report errors', async () => {
        const theXmlString = dedent`
          <?xml version="1.0" encoding="UTF-8" standalone="no"?>
          <!DOCTYPE xml>
          < illegal <xml >
           `;

        const xmlParser = new CTreeItemXmlParser(new CTreeItemBuilder('dummyFile.xml'));
        const root = xmlParser.parse(theXmlString);
        expect(root).toBeInstanceOf(CTreeItem);
        expect(xmlParser.errors.length).toBeGreaterThan(0);
        expect(xmlParser.errors[0]).toEqual('dummyFile.xml: Invalid attribute name Line: 2 Column: 11 Char: <');

    });

    it('test parseXmlToCTreeItem parsing XML', async () => {
        const theXmlString = dedent`
          <?xml version="1.0" encoding="UTF-8" standalone="no"?>
          <!DOCTYPE xml>
          <cprj schemaVersion="0.0.9" xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="CPRJ.xsd">
            <!-- first comment -->
            <!-- second comment -->
            <info>information</info>
            <child number="1">
              <!-- third comment -->
              <subchild subnumber="11">text11</subchild>
              <subchild subnumber="12">text12</subchild>
              <subtext>subtext1</subtext>
            <!-- close comment 1 -->
            <!-- close comment 2 -->
            </child>
            <child number="2">
              <subchild subnumber="21">text21</subchild>
              <subchild subnumber="22">text22</subchild>
              <subtext>subtext2</subtext>
            </child>
            <special_chars amp="&amp;" apos="&apos;" gt="&gt;" lt="&lt;" quot="&quot;"/>
            <special_chars_in_text>amp=&amp; apos=&apos; gt=&gt; lt=&lt; quot=&quot;</special_chars_in_text>
          </cprj>\n`;
        const root = parseXmlToCTreeItem(theXmlString, 'dummyFile.xml');

        expect(root).toBeInstanceOf(CTreeItem);
        expect(root!.rootFileName).toEqual('dummyFile.xml');
        expect(root!.getTag()).toEqual('cprj');
        expect(root!.getValue('info')).toEqual('information');

        const xmlString = toXmlString(root as CTreeItem);
        expect(xmlString).toEqual(theXmlString);
    });
});
