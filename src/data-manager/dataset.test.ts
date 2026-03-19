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

import { DataSet } from './dataset';

describe('DataSet', () => {

    it('Retrieve data by data, id, id object, and key', () => {
        type Id = { key: string, value: number };
        type data = { id: Id, value: number };

        const id = { key: 'id', value: 42 };
        const idObj = { ...id };

        const dataSet = new DataSet<data>();

        const dataOne = { id, value: 1 };

        dataSet.add(dataOne);

        expect(dataSet.get(dataOne)).toEqual(dataOne);
        expect(dataSet.get(dataOne.id)).toEqual(dataOne);
        expect(dataSet.get(idObj)).toEqual(dataOne);
        expect(dataSet.get(dataOne.id.key)).toEqual(dataOne);
    });

    it('Retrieve id by data, id, id object, and key', () => {
        type Id = { key: string, value: number };
        type data = { id: Id, value: number };

        const id = { key: 'id', value: 42 };
        const idObj = { ...id };

        const dataSet = new DataSet<data>();

        const dataOne = { id, value: 1 };

        dataSet.add(dataOne);

        expect(dataSet.id(undefined)).toEqual(undefined);
        expect(dataSet.id(dataOne)).toEqual(dataOne.id);
        expect(dataSet.id(dataOne.id)).toEqual(dataOne.id);
        expect(dataSet.id(idObj)).toEqual(dataOne.id);
        expect(dataSet.id(dataOne.id.key)).toEqual(dataOne.id);
    });

    it('Test interface methods', () => {

        type data = { id: string, value: number };

        const dataSet = new DataSet<data>();

        expect(dataSet.size).toBe(0);

        const dataOne = { id: 'one', value: 1 };
        const dataTwo = { id: 'two', value: 2 };

        dataSet.add(dataOne);

        expect(dataSet.size).toBe(1);

        expect(dataSet.has(dataOne)).toBeTruthy();
        expect(dataSet.has(dataTwo)).toBeFalsy();

        expect(dataSet.get(dataOne)).toBe(dataOne);
        expect(dataSet.get(dataTwo)).toBeUndefined();

        dataSet.add(dataTwo);

        expect(dataSet.size).toBe(2);
        expect(dataSet.has(dataOne)).toBeTruthy();
        expect(dataSet.has(dataTwo)).toBeTruthy();

        expect([...dataSet]).toEqual(expect.arrayContaining([dataOne, dataTwo]));

        const callback = jest.fn();
        dataSet.forEach(callback);

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenCalledWith(dataOne, dataOne.id, dataSet);
        expect(callback).toHaveBeenCalledWith(dataTwo, dataTwo.id, dataSet);

        callback.mockReset();
        dataSet.map(callback);

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenCalledWith(dataOne, dataOne.id, dataSet);
        expect(callback).toHaveBeenCalledWith(dataTwo, dataTwo.id, dataSet);

        dataSet.add({ ...dataOne, value: 11 });

        expect(dataSet.get(dataOne)).not.toBe(dataOne);
        expect(dataSet.get(dataOne)?.value).toBe(11);

        expect(dataSet.delete(dataOne)).toBeTruthy();
        expect(dataSet.size).toBe(1);
        expect(dataSet.has(dataOne)).toBeFalsy();
        expect(dataSet.has(dataTwo)).toBeTruthy();
        expect(dataSet.delete(dataOne)).toBeFalsy();

        dataSet.clear();

        expect(dataSet.size).toBe(0);

    });

});
