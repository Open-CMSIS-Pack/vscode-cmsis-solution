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

import { ErrorList } from './error-list';

describe('ErrorList', () => {
    let errorList: ErrorList;

    beforeEach(() => {
        errorList = new ErrorList();
    });

    it('should start with no errors', () => {
        expect(errorList.errors).toEqual([]);
    });

    it('should add an error', () => {
        errorList.addError('Test error');
        expect(errorList.errors).toEqual(['Test error']);
    });

    it('should not add undefined error', () => {
        errorList.addError(undefined);
        expect(errorList.hasErrors()).toBeFalsy();
        expect(errorList.errors).toEqual([]);
    });

    it('should clear errors', () => {
        errorList.addError('Error 1');
        errorList.addError('Error 2');
        expect(errorList.hasErrors()).toBeTruthy();
        errorList.clearErrors();
        expect(errorList.errors).toEqual([]);
        expect(errorList.hasErrors()).toBeFalsy();
    });

    it('should add multiple errors', () => {
        errorList.addError('Error 1');
        errorList.addError('Error 2');
        expect(errorList.errors).toEqual(['Error 1', 'Error 2']);
    });
});
