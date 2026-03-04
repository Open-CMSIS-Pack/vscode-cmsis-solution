/**
 * Copyright 2025-2026 Arm Limited
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

import { ArrayElement, Equal, Expect, Nullable, Optional, PartialIfUndefined } from './type-helper';

export let result: boolean;

describe('Optional', () => {

    type InferredType = Optional<string>;
    type ExpectedType = string | undefined;
    type Test = Expect<Equal<InferredType, ExpectedType>>;

    result = true as Test;

});

describe('Nullable', () => {

    type InferredType = Nullable<string>;
    type ExpectedType = string | null;
    type Test = Expect<Equal<InferredType, ExpectedType>>;

    result = true as Test;

});

describe('ArrayElement', () => {

    it('infers number type from array', () => {
        const anArray = [1, 2, 3];

        type InferredType = ArrayElement<typeof anArray>;
        type ExpectedType = number;

        type Test = Expect<Equal<InferredType, ExpectedType>>;

        result = anArray as unknown as Test;
    });

    it('infers object type from array', () => {
        type ObjectType = { a: number, b: string };
        const anArray : Array<ObjectType> = [];

        type InferredType = ArrayElement<typeof anArray>;

        type Test = Expect<Equal<InferredType, ObjectType>>;

        result = anArray as unknown as Test;
    });

    it('infers type from optional array type', () => {
        let anArray : Optional<Array<Optional<number>>>;

        type ArrayType = typeof anArray;
        type InferredType = ArrayElement<ArrayType>;
        type ExpectedType = Optional<number>;

        type Test = Expect<Equal<InferredType, ExpectedType>>;

        result = anArray as unknown as Test;
    });

    it('infers type from nullable array type', () => {
        let anArray : Nullable<Array<Nullable<string>>>;

        type ArrayType = typeof anArray;
        type InferredType = ArrayElement<ArrayType>;
        type ExpectedType = Nullable<string>;

        type Test = Expect<Equal<InferredType, ExpectedType>>;

        anArray = null;
        anArray = null;
        result = anArray as unknown as Test;
    });

});

describe('PartialIfUndefined', () => {

    type ModifiedType = PartialIfUndefined<{
        reqField: string;
        optField: string | undefined;
    }>;
    type ExpectedType = {
        reqField: string;
        optField?: string;
    };
    type Test = Expect<Equal<ModifiedType, ExpectedType>>;

    result = true as Test;

});
