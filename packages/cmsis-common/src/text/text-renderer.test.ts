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

import { TextRenderer } from './text-renderer';

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
