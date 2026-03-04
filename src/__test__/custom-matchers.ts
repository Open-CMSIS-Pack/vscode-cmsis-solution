/**
 * Copyright 2024-2026 Arm Limited
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

import yaml from 'yaml';
import { PathLike, realpathSync } from 'node:fs';

function expectEqual<T>(act: T | undefined, exp: T, not?: boolean) {
    try {
        if (not) {
            expect(act).not.toEqual(exp);
        } else {
            expect(act).toEqual(exp);
        }
    } catch (e: unknown) {
        if (e instanceof Error) {
            return { pass: !!not, message: () => e.message };
        } else {
            throw e;
        }
    }
    return { pass: !not, message: () => '' };
}

expect.extend({
    yamlEquals(actual: string | undefined, expected: string) {
        const act = actual ? yaml.parseAllDocuments(actual).map(doc => doc.toJS()) : undefined;
        const exp = yaml.parseAllDocuments(expected).map(doc => doc.toJS());
        return expectEqual(act, expect.arrayContaining(exp), this.isNot);
    },

    yamlStrictEquals(actual: string | undefined, expected: string) {
        const act = actual ? yaml.parseAllDocuments(actual).map(doc => doc.toString()) : undefined;
        const exp = yaml.parseAllDocuments(expected).map(doc => doc.toString());
        return expectEqual(act, exp, this.isNot);
    },

    realpathEquals(actual: PathLike | undefined , expected: string) {
        const act = actual ? realpathSync(actual) : undefined;
        const exp = realpathSync(expected);
        return expectEqual(act, exp, this.isNot);
    },

    lowercaseEquals(actual: string | undefined, expected: string) {
        const act = actual?.toLowerCase();
        const exp = expected.toLowerCase();
        return expectEqual(act, exp, this.isNot);
    }
});

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        interface Expect {
            /**
             * Used when you want to check that two yaml string have the same content regardless of their ordering.
             * @param expected A yaml string to check against.
             */
            yamlEquals(expected: string): string;

            /**
             * Used when you want to check that two yaml string have the same content and ordering but ignoring indention.
             * @param expected A yaml string to check against.
             */
            yamlStrictEquals(expected: string): string;

            /**
             * Used when you want to check to path strings to represent the same file/folder.
             * @param expected A file or folder name to check against
             */
            realpathEquals(expected: string): string;

            /**
             * Used when you want to compare strings case-insensitive
             * @param expected A string converted to lower case to match against
             */
            lowercaseEquals(expected: string): string;
        }

        interface InverseAsymmetricMatchers {
            /**
             * Used when you want to check that two yaml string have the same content regardless of their ordering.
             * @param expected A yaml string to check against.
             */
            yamlEquals(expected: string): string;

            /**
             * Used when you want to check that two yaml string have the same content and ordering but ignoring indention.
             * @param expected A yaml string to check against.
             */
            yamlStrictEquals(expected: string): string;

            /**
             * Used when you want to check to path strings to represent the same file/folder.
             * @param expected A file or folder name to check against
             */
            realpathEquals(expected: string): string;

            /**
             * Used when you want to compare strings case-insensitive
             * @param expected A string converted to lower case to match agaist
             */
            lowercaseEquals(expected: string): string;
        }
    }
}
