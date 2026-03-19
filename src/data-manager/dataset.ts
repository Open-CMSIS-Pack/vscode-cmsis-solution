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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface HasId<T extends HasKey | string = any> {
    readonly id: WithoutId<T>;
}

interface HasKey {
    readonly key: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ThisArg = any;

type WithoutId<T> = T extends HasId ? never : T;
type IdTypeOf<T extends HasId> = T extends HasId<infer K extends HasKey> ? WithoutId<K> : string;
type Spread<T extends HasKey> = { [K in keyof T]: T[K] } & HasKey;
type IdFor<T extends HasId> = T | IdTypeOf<T> | (IdTypeOf<T> extends string ? string : (Spread<IdTypeOf<T>> | string));
type ForEachCallbackFn<T extends HasId> = (value: T, id: IdTypeOf<T>, set: DataSet<T>) => void;
type MapCallbackFn<T extends HasId, U> = (value: T, id: IdTypeOf<T>, set: DataSet<T>) => U;

function hasId<T extends HasId>(obj: IdFor<T>) : obj is T {
    return typeof obj === 'object' && 'id' in obj;
}

function idOf<T extends HasId>(obj: IdFor<T>) : string {
    if (typeof obj == 'string') {
        return obj;
    } else if (hasId(obj)) {
        return idOf(obj.id);
    }
    return obj.key;
}

/**
 * Set-like container holding identifiable data of generic type T.
 * The type T must provide an id property providing a unique identifier used as the key.
 */
export interface DataSet<T extends HasId> {
    /**
     * @param value The value to add
     * Appends a new element with a specified value to the end of the Set.
     */
    add(value: T): this;

    /**
     * Removes all items from the Set
     */
    clear(): void;

    /**
     * Removes a specified value from the Set.
     * @param id The id to lookup
     * @returns Returns true if an element in the Set existed and has been removed, or false if the element does not exist.
     */
    delete(id: IdFor<T>): boolean;

    /**
     * Executes a provided function once per each value in the Set object, in insertion order.
     */
    forEach(callbackfn: ForEachCallbackFn<T>, thisArg?: ThisArg) : void;

    /**
     * @param id The id to lookup
     * @returns the element with the specified id if exists.
     */
    get(id: IdFor<T>): T | undefined;

    /**
     * @param id The id to lookup
     * @returns a boolean indicating whether an element with the specified value exists in the Set or not.
     */
    has(id: IdFor<T>): boolean;

    /**
     * @param id The id to lookup
     * @returns the id instance if exists or undefined.
     */
    id(id: IdFor<T> | undefined): IdTypeOf<T> | undefined;

    /**
     * Calls a defined callback function on each element of an array, and returns an array that contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    map<U>(callbackfn: MapCallbackFn<T, U>, thisArg?: ThisArg): U[];

    /**
     * Convert the set into an array.
     */
    toArray(): T[];

    /**
     * @returns the number of (unique) elements in Set.
     */
    readonly size: number;

    /**
     * Iterates over the values
     */
    [Symbol.iterator]() : IterableIterator<T>;
}

class DataSetImpl<T extends HasId> implements DataSet<T> {

    public [Symbol.toStringTag] = 'DataSet<T>';

    private readonly data: Map<string, T>;

    constructor(values?: T[]) {
        this.data = new Map(values?.map(v => [idOf(v), v]));
    }

    public add(item: T) {
        this.data.set(idOf(item), item);
        return this;
    }

    public clear() {
        this.data.clear();
    }

    public delete(value: IdFor<T>) {
        return this.data.delete(idOf(value));
    }

    public forEach(callbackfn: ForEachCallbackFn<T>, thisArg?: ThisArg) {
        for (const item of this.data.values()) {
            callbackfn.call(thisArg, item, item.id, this);
        }
    }

    public get(value: IdFor<T>) {
        return this.data.get(idOf(value));
    }

    public has(value: IdFor<T>) {
        return this.data.has(idOf(value));
    }

    public id(id: IdFor<T>) {
        if (id !== undefined) {
            return this.get(id)?.id;
        }
        return undefined;
    }

    public map<U>(callbackfn: MapCallbackFn<T, U>, thisArg?: ThisArg) {
        const result: U[] = [];
        this.data.forEach(item => result.push(callbackfn.call(thisArg, item, item.id, this)));
        return result;
    }

    public toArray() {
        return [...this.data.values()];
    }

    public get size() {
        return this.data.size;
    }

    public [Symbol.iterator]() {
        return this.data.values();
    }
}

interface DataSetConstructor {
    new<T extends HasId> (): DataSet<T>;
    new<T extends HasId> (values: T[]): DataSet<T>;
}

export const DataSet: DataSetConstructor = DataSetImpl;
