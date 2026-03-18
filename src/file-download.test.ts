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

import nock from 'nock';
import * as fs from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { downloadFile } from './file-download';
import { faker } from '@faker-js/faker';

describe('downloadFile', () => {
    const tmpDirectory = tmpdir();

    it('downloads the specified file to the given location', async () => {
        const fileName = faker.system.fileName();
        const downloadLocation = join(tmpDirectory, fileName);
        const fileContents = 'some lovely text';
        nock('https://some-cool-url.arm.com')
            .get(`/${fileName}`)
            .reply(200, fileContents);

        await downloadFile(`https://some-cool-url.arm.com/${fileName}`, downloadLocation);

        const data = fs.readFileSync(downloadLocation, 'utf8');
        expect(data).toBe(fileContents);
    });

    it('follows redirects to the file to download', async () => {
        const fileName = faker.system.fileName();
        const downloadLocation = join(tmpDirectory, fileName);
        const fileContents = 'some lovely text';
        nock('https://some-cool-url.arm.com')
            .get(`/${fileName}`)
            .reply(301, undefined, { location: `https://the-new-location.arm.com/${fileName}` });
        nock('https://the-new-location.arm.com')
            .get(`/${fileName}`)
            .reply(200, fileContents);

        await downloadFile(`https://some-cool-url.arm.com/${fileName}`, downloadLocation);

        const data = fs.readFileSync(downloadLocation, 'utf8');
        expect(data).toBe(fileContents);
    });

    it('rejects with an error if the request fails', async () => {
        nock('https://some-cool-url.arm.com')
            .get('/some-thing')
            .reply(404);

        const downloadPromise = downloadFile('https://some-cool-url.arm.com/some-thing', 'some-directory');

        await expect(downloadPromise).rejects.toThrow('Status Code: 404');
    });
});
