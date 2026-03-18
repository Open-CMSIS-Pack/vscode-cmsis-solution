/**
 * Copyright 2023-2026 Arm Limited
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

import { PACK_ASSET_HOST, getDocUrlForAssetReference, getImageDataUrl } from './webview-asset-retrieval';

describe('getDocUrlForAssetReference', () => {
    it('returns an empty string if no docs available', () => {
        const docUrl = getDocUrlForAssetReference({
            packFileReference: { path: '', packId: { version: '', vendor: '', name: '' } },
            url: ''
        });

        expect(docUrl).toBe('');
    });

    it('returns an empty string when given undefined', () => {
        const docUrl = getDocUrlForAssetReference(undefined);
        expect(docUrl).toBe('');
    });

    it('returns the url to the docs for the asset', () => {
        const url = 'some-url';

        const docUrl = getDocUrlForAssetReference({
            packFileReference: { path: '', packId: { version: '', vendor: '', name: '' } },
            url
        });

        expect(docUrl).toBe(url);
    });

    it('returns the pack asset service url to the docs for the asset if doc is a pack asset', () => {
        const packFileReference = { path: 'some/path', packId: { vendor: 'some-vendor', name: 'some-name', version: '1.0.0' } };
        const docUrl = getDocUrlForAssetReference({ url: 'some-url', packFileReference });

        expect(docUrl).toBe(`${PACK_ASSET_HOST}/${packFileReference.packId!.vendor}/${packFileReference.packId!.name}/${packFileReference.packId!.version}/${packFileReference.path}`);
    });
});

describe('getImageDataUrl', () => {
    let mockFetch: jest.Mock;

    beforeEach(() => {
        mockFetch = jest.fn();
    });

    it('return a successful response data uri for the given url', async () => {
        const base64 = btoa('Hello, I am png data honest');
        const myBuffer = Buffer.from(base64, 'base64');

        const mockResponse = { ok: true, status: 200, headers: { get: () => 'png' }, arrayBuffer: async () => myBuffer };
        mockFetch.mockResolvedValueOnce(mockResponse);

        const url = 'https://example.com/data';
        const outcome: string = `data:png;base64,${base64}`;

        const result: typeof outcome = await getImageDataUrl(url, mockFetch);
        expect(result).toBe(outcome);
    });

    it('return a rejected data uri for the given url', async () => {
        const mockResponse = { ok: false, status: 404, statusText: 'I crashed!' };
        mockFetch.mockResolvedValue(mockResponse);

        const url = 'invalid url';
        const outcome: string = `Failed to fetch image. Status: ${mockResponse.status} ${mockResponse.statusText}`;

        await expect(getImageDataUrl(url, mockFetch)).rejects.toThrow(outcome);
    });
});
