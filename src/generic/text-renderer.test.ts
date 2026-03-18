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

import { EtaExt } from './eta-ext';
import { TextRenderer, EtaTextRenderer } from './text-renderer';

describe('TextRenderer', () => {
    it('should return text unchanged if no renderData', () => {
        const renderer = new TextRenderer();
        expect(renderer.render('Hello')).toBe('Hello');
    });

    it('should allow setting and getting renderData', () => {
        const renderer = new TextRenderer();
        renderer.renderData = { name: 'John' };
        expect(renderer.renderData).toEqual({ name: 'John' });
    });

    it('should return text unchanged even with renderData', () => {
        const renderer = new TextRenderer({ name: 'John' });
        expect(renderer.render('Hi <%= name %>')).toBe('Hi <%= name %>');
    });
});

describe('EtaTextRenderer', () => {
    const eta = new EtaExt({ useWith: true });

    it('should render text using Eta and renderData', () => {
        const renderer = new EtaTextRenderer({ name: 'John' }, eta);
        expect(renderer.render('Hello, <%= name %>!')).toBe('Hello, John!');
    });

    it('should return text unchanged if renderData is not set', () => {
        const renderer = new EtaTextRenderer(undefined, eta);
        expect(renderer.render('Hello, <%= name %>!')).toBe('Hello, <%= name %>!');
    });

    it('should allow updating renderData', () => {
        const renderer = new EtaTextRenderer({ name: 'Alice' }, eta);
        renderer.renderData = { name: 'Bob' };
        expect(renderer.render('Hi <%= name %>')).toBe('Hi Bob');
    });

    it('should return text unchanged if text is empty', () => {
        const renderer = new EtaTextRenderer({ name: 'John' }, eta);
        expect(renderer.render('')).toBe('');
    });

    it('should not change text if Eta template is invalid', () => {
        const renderer = new EtaTextRenderer({ name: 'John' }, eta);
        expect(renderer.render('Hello, <%= name !')).toBe('Hello, <%= name !');
    });

    it('should render nested properties in renderData', () => {
        const renderer = new EtaTextRenderer({ user: { name: 'John' } }, eta);
        expect(renderer.render('Hello, <%= user.name %>!')).toBe('Hello, John!');
    });

    it('should update renderData with new properties', () => {
        const renderer = new EtaTextRenderer({ name: 'John' }, eta);
        renderer.renderData = { name: 'Doe', age: 30 };
        expect(renderer.render('Name: <%= name %>, Age: <%= age %>')).toBe('Name: Doe, Age: 30');
    });

    it('should not render text if renderData is null', () => {
        const renderer = new EtaTextRenderer(undefined, eta);
        expect(renderer.render('Hello, <%= name %>!')).toBe('Hello, <%= name %>!');
    });

    it('should handle boolean values in renderData', () => {
        const renderer = new EtaTextRenderer({ isActive: true }, eta);
        expect(renderer.render('User active: <%= isActive %>')).toBe('User active: true');
    });

    it('should handle array values in renderData', () => {
        const renderer = new EtaTextRenderer({ roles: ['admin', 'user'] }, eta);
        expect(renderer.render('Roles: <%= roles.join(", ") %>')).toBe('Roles: admin, user');
    });
});
