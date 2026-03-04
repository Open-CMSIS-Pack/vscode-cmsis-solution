/**
 * Copyright 2023-2026 Arm Limited
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

import { AssetReference } from '../core-tools/client/packs_pb';

export const PACK_ASSET_HOST = process.env.STUDIO_PACK_ASSET_HOST || 'https://pack-content.cmsis.io';

/**
 * Retrieve assets from the pack asset service url
 * @param assetReference - { reference: }
*/
export const getDocUrlForAssetReference = (assetReference: AssetReference.AsObject | undefined): string => {
    const docReference = assetReference?.packFileReference;
    if (docReference && docReference.packId && docReference.packId.name && docReference.path) {
        return `${PACK_ASSET_HOST}/${docReference.packId?.vendor}/${docReference.packId?.name}/${docReference.packId?.version}/${docReference.path}`;
    }

    const docLinkUrl = assetReference?.url;
    if (docLinkUrl) {
        return docLinkUrl;
    }

    return '';
};

/**
 * Retrieve Data Uri for the web url
 * @param url - string
*/
export const getImageDataUrl = async (url: string, fetchUrl = fetch): Promise<string> => {
    const response: Response = await fetchUrl(url);

    if (!response.ok) {
        console.error(`Failed to fetch image as request did not succeed. Status: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch image. Status: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type');
    const base64 = (Buffer.from(buffer)).toString('base64');

    return `data:${contentType};base64,${base64}`;
};
