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

import { EtaExt, renderTreeItem } from './eta-ext';
import { CTreeItem } from './tree-item';

describe('EtaExt configured with useWith', () => {

    const eta = new EtaExt({ useWith: true });

    it('should render objects', () => {
        const data = { name: 'John', age: 30, flagged: true, address: '123 Main St', phone: '555-1234', customKey: 'dynamicKey' };
        const template = {
            greeting: 'Hello, <%= name %>!',
            age: 'You are <%= age %> years old.',
            ageval: '<%= age %>',
            agestringval: '"<%= age %>"',
            flag: '<%= flagged %>',
            flagstring: '"<%= flagged %>"',
            details: [
                'Your home address is <%= address %>.',
                'And the telephone number is <%= phone %>.',
            ],
            '<%= customKey %>': 'This is a custom key',
        };

        const result = eta.renderObject(template, data);
        expect(result).toEqual({
            greeting: 'Hello, John!',
            age: 'You are 30 years old.',
            ageval: 30,
            agestringval: '30',
            flag: true,
            flagstring: 'true',
            details: [
                'Your home address is 123 Main St.',
                'And the telephone number is 555-1234.',
            ],
            dynamicKey: 'This is a custom key',
        });
    });

    it('should render loops', () => {
        const data = { fruits: ['apple', 'banana', 'cherry'] };
        const template = {
            fruits: [
                '<% for (const fruit of fruits) { %>',
                'Fruit: <%= fruit %>\n',
                '<% } %>',
            ],
        };
        const result = eta.renderObject(template, data);
        expect(result).toEqual({
            fruits: [
                'Fruit: apple',
                'Fruit: banana',
                'Fruit: cherry',
                '',
            ],
        });
    });

    it('should ignore empty arrays', () => {
        const data = { fruits: ['apple', 'banana', 'cherry'] };
        const template = {
            fruits: [],
        };
        const result = eta.renderObject(template, data);
        expect(result).toEqual({
            fruits: [],
        });
    });

    it('should parse nested JSON arrays', () => {
        const data = { john: { name: 'John', age: 30, address: '123 Main St', phone: '555-1234' } };
        const template = {
            john: '<%= john %>',
        };
        const result = eta.renderObject(template, data);
        expect(result).toEqual({
            john: data.john,
        });

    });

    it('should parse nested JSON objects', () => {
        const data = { fruits: ['apple', 'banana', 'cherry'] };
        const template = {
            fruits: '<%= fruits %>',
        };
        const result = eta.renderObject(template, data);
        expect(result).toEqual({
            fruits: [
                'apple',
                'banana',
                'cherry'
            ],
        });

    });

    it('throws error for missing data', () => {
        const data = { name: 'John' };
        const template = {
            greeting: 'Hello, <%= name %>!',
            age: 'You are <%= age %> years old.',
        };

        expect(() => eta.renderObject(template, data)).toThrow('age is not defined');
    });

    it('throws error for template syntax error', () => {
        const data = { name: 'John' };
        const template = {
            greeting: 'Hello, <%= name %>!',
            age: 'You are <% for x in name %> years old.',
        };

        expect(() => eta.renderObject(template, data)).toThrow('Bad template syntax');
    });

    describe('renderTreeItem', () => {
        it('renders attributes and text in CTreeItem', () => {
            const item = new CTreeItem('root');
            item.setAttribute('greeting', 'Hello, <%= name %>!');
            item.setText('Welcome, <%= name %>!');
            const data = { name: 'Alice' };
            renderTreeItem(item, eta, data);
            expect(item.getAttribute('greeting')).toBe('Hello, Alice!');
            expect(item.getText()).toBe('Welcome, Alice!');
        });

        it('renders recursively for children', () => {
            const item = new CTreeItem('root');
            item.setAttribute('greeting', 'Hi, <%= name %>!');
            item.setText('Root: <%= name %>');
            const child = item.createChild('child');
            child.setAttribute('childAttr', 'Child: <%= name %>');
            child.setText('Child text: <%= name %>');
            const data = { name: 'Bob' };
            renderTreeItem(item, eta, data);
            expect(item.getAttribute('greeting')).toBe('Hi, Bob!');
            expect(item.getText()).toBe('Root: Bob');
            expect(child.getAttribute('childAttr')).toBe('Child: Bob');
            expect(child.getText()).toBe('Child text: Bob');
        });
    });
});
