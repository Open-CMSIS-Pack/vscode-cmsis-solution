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

import path from 'node:path';
import { CAttributedItem } from './attributed-item';

describe('CAttributedItem', () => {
    it('test CAttributedItem generic methods to manipulate  items', () => {
        const root = new CAttributedItem('root');
        expect(root.getKeyValue()).toEqual(['root', '']);
        root.setAttribute('foo', 'bar');
        expect(root.getAttribute('foo')).toEqual('bar');
        expect(root.getAttribute()).toEqual('bar');
        expect(root.getValue('foo')).toEqual('bar');
        expect(root.getValueAsString('foo')).toEqual('bar');
        expect(root.getValue()).toEqual('bar');
        expect(root.getAttribute('undefined')).toBeUndefined();
        expect(root.getValue('undefined')).toBeUndefined();
        expect(root.getValueAsString('undefined')).toEqual('');
        expect(root.getValueAsString('undefined', 'default')).toEqual('default');
        root.setValue('key', 'val');
        expect(root.getKeyValue()).toEqual(['foo', 'bar']); // still the first one
        expect(root.getValue('key')).toEqual('val');
        root.setValue('key', 'val1');
        expect(root.getValue('key')).toEqual('val1');
        const attrs = root.getAttributes();
        expect(attrs).not.toBeUndefined();
        expect(attrs!.get('key')).toEqual('val1');
        root.setValue('key');
        expect(root.getValueAsString('key')).toEqual('');
        root.clear();
        expect(root.getAttributes()).toBeUndefined();
        root.setText('text');
        expect(root.getValue()).toEqual('text');
        expect(root.getText()).toEqual('text');
        expect(root.getKeyValue()).toEqual(['root', 'text']);
        root.setProperty('str', '//some string');
        root.setProperty('strArray', ['one', 'two']);
        root.setProperty('arr', [1, 2, 3]);
        root.setProperty('obj', { foo: 'a', bar: 42 });
        expect(root.getProperty('str')).toEqual('//some string');
        expect(root.getProperty('strArray')).toEqual(['one', 'two']);
        expect(root.getProperty('arr')).toEqual([1, 2, 3]);
        expect(root.getProperty('obj')).toEqual({ foo: 'a', bar: 42 });
        expect(root.getProperty('undefined')).toBeUndefined();
        root.setProperty('str', 'another string');
        expect(root.getProperty('str')).toEqual('another string');
        root.setProperty('str', undefined);
        expect(root.getProperty('str')).toBeUndefined();

    });
    it('should copy tag, attributes, text, and properties to another item', () => {
        const source = new CAttributedItem('sourceTag');
        source.setAttribute('a', '1');
        source.setAttribute('b', '2');
        source.setText('hello');
        source.setProperty('str', '//some string');
        source.setProperty('strArray', ['one', 'two']);
        source.setProperty('arr', [1, 2, 3]);
        source.setProperty('obj', { foo: 'a', bar: 42 });

        const target = new CAttributedItem();
        source.copyTo(target);

        expect(target.getTag()).toBe('sourceTag');
        expect(target.getAttribute('a')).toBe('1');
        expect(target.getAttribute('b')).toBe('2');
        expect(target.getText()).toBe('hello');
        expect(target.getProperty('str')).toEqual('//some string');
        expect(target.getProperty('strArray')).toEqual(['one', 'two']);
        expect(target.getProperty('arr')).toEqual([1, 2, 3]);
        expect(target.getProperty('obj')).toEqual({ foo: 'a', bar: 42 });
    });
    it('resolves path', () => {
        const item = new CAttributedItem('sourceTag');

        expect(item.rootFileName).toBeUndefined();
        expect(item.rootFileDir).toEqual('');

        // Get current working directory
        const cwd = process.cwd();

        // Set root file name
        item.rootFileName = path.join(cwd, 'foo.txt');

        // Test path resolution
        expect(item.rootFileName).toBe(path.join(cwd, 'foo.txt'));
        expect(item.rootFileDir).toBe(cwd);

        // Test resolving undefined paths
        const resolvedUndefined = item.resolvePath(undefined);
        expect(resolvedUndefined).toBe('');

        // Test resolving relative paths
        const resolved = item.resolvePath('bar/baz.txt');
        expect(resolved).toBe(path.join(cwd, 'bar', 'baz.txt'));

        // Test resolving absolute paths (should pass through)
        const absolutePath = path.join(cwd, 'absolute', 'file.txt');
        const resolvedAbsolute = item.resolvePath(absolutePath);
        expect(resolvedAbsolute).toBe(absolutePath);
    });
});
