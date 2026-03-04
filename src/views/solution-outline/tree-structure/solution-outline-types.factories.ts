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

import { faker } from '@faker-js/faker';
import * as path from 'path';
import { COutlineItem } from './solution-outline-item';

export const projectGroupItemDataFactory = (): COutlineItem => {
    const item = new COutlineItem('group');
    item.setAttribute('type', 'group');
    item.setAttribute('label', faker.word.noun());
    item.setAttribute('expandable', '0');
    item.setAttribute('groupPath', faker.helpers.multiple(() => faker.word.noun(), { count: 3 }).join(';'));
    item.setAttribute('projectUri', path.join(faker.system.directoryPath(), faker.system.commonFileName('cproject.yml')));
    return item;
};

export const projectItemDataFactory = (): COutlineItem => {
    const item = new COutlineItem('project');
    item.setAttribute('type', 'projectFile');
    item.setAttribute('resourcePath', faker.word.noun());
    return item;
};

export const layerGroupItemDataFactory = (): COutlineItem => {
    const item = new COutlineItem('group');
    item.setAttribute('type', 'group');
    item.setAttribute('label', faker.word.noun());
    item.setAttribute('expandable', '0');
    item.setAttribute('groupPath', faker.helpers.multiple(() => faker.word.noun(), { count: 3 }).join(';'));
    item.setAttribute('projectUri', path.join(faker.system.directoryPath(), faker.system.commonFileName('cproject.yml')));
    item.setAttribute('layerUri', path.join(faker.system.directoryPath(), faker.system.commonFileName('clayer.yml')));
    return item;
};
