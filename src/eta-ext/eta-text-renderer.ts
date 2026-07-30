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

import { Eta } from 'eta';
import { TextRenderer } from '../generic/text-renderer';
import { EtaExt } from './eta-ext';

export class EtaTextRenderer extends TextRenderer {
    private readonly eta: Eta;

    constructor(renderData?: object, eta?: Eta) {
        super(renderData);
        this.eta = eta ? eta : new EtaExt({ useWith: true });
    }

    public override render(text: string): string {
        if (!text || !this.renderData) {
            return text;
        }
        try {
            return this.eta.renderString(text, this.renderData);
        } catch {
            // If renderData is invalid or rendering fails, return original text
            return text;
        }
    }
}