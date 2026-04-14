/**
 * Copyright 2026 Arm Limited
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
import { packURL } from './pack-urls';

describe('packURL', () => {
    it('returns a versions URL for a versioned pack ID', () => {
        expect(packURL('My::Pack@1.2.3', 'versions')).toBe('https://www.keil.arm.com/packs/pack-my/versions/');
    });

    it('returns a base URL for a versioned pack ID when suffix is undefined', () => {
        expect(packURL('My::Pack@1.2.3', undefined)).toBe('https://www.keil.arm.com/packs/pack-my/');
    });

    it('returns a versions URL for a versionless pack ID', () => {
        expect(packURL('My::Pack', 'versions')).toBe('https://www.keil.arm.com/packs/pack-my/versions/');
    });

    it('returns a base URL for a versionless pack ID when suffix is undefined', () => {
        expect(packURL('My::Pack', undefined)).toBe('https://www.keil.arm.com/packs/pack-my/');
    });

    it('returns the base packs URL for an empty pack ID when suffix is provided', () => {
        expect(packURL('', 'versions')).toBe('https://www.keil.arm.com/packs');
    });

    it('returns the base packs URL for an empty pack ID when suffix is undefined', () => {
        expect(packURL('', undefined)).toBe('https://www.keil.arm.com/packs');
    });
});