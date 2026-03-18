/**
 * Copyright 2021-2026 Arm Limited
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

// Set globals used by webpack in the bundle. This must be a separate module imported at the top of the entry
// module rather than inline in the entry module. This must be set before importing other modules, and imports are
// hoisted above other code.

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */

declare var __webpack_public_path__: string;
declare var __webpack_nonce__: string;

const anyWindow = window as any;

if (anyWindow.cmsisPublicPath) {
    __webpack_public_path__ = anyWindow.cmsisPublicPath;
}

if (anyWindow.cmsisNonce) {
    __webpack_nonce__ = anyWindow.cmsisNonce;
}

// Initialize modal service for all webviews
import('./common/components/init-modal');
