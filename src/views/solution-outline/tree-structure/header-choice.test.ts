// Copyright 2026 Arm Limited
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { createHeaderChoices, HeaderCandidate } from './header-choice';

describe('createHeaderChoices', () => {
    it('preserves candidate priority and declaration order', () => {
        const candidates: HeaderCandidate[] = [
            { include: 'api_second.h', origin: 'api' },
            { include: 'api_first_alphabetically.h', origin: 'api' },
            { include: 'component.h', origin: 'component' },
        ];

        expect(createHeaderChoices(candidates).map(choice => choice.include)).toEqual([
            'api_second.h',
            'api_first_alphabetically.h',
            'component.h',
        ]);
    });

    it('groups candidates with the same complete include expression', () => {
        const choices = createHeaderChoices([
            { include: 'include/common.h', origin: 'api', resourcePath: '/api/common.h' },
            { include: 'include/common.h', origin: 'component', resourcePath: '/component/common.h' },
        ]);

        expect(choices).toEqual([{
            include: 'include/common.h',
            origins: ['api', 'component'],
            resourcePath: '/api/common.h',
        }]);
    });

    it('keeps equal basenames with different include expressions separate', () => {
        const choices = createHeaderChoices([
            { include: 'api/common.h', origin: 'api' },
            { include: 'component/common.h', origin: 'component' },
        ]);

        expect(choices).toHaveLength(2);
    });
});
