/**
 * Copyright 2026 Arm Limited
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

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PackTitleLink } from './pack-title-link';

describe('PackTitleLink', () => {
    const packId = 'Arm::CMSIS@5.9.0';
    const packName = 'Arm::CMSIS';
    const packUrl = 'https://www.keil.arm.com/packs/cmsis-arm/';
    let openFile: jest.Mock;

    beforeEach(() => {
        openFile = jest.fn();
    });

    it('renders the pack name', () => {
        const { getByText } = render(
            <PackTitleLink packId={packId} packName={packName} openFile={openFile} />
        );
        expect(getByText(packName)).toBeInTheDocument();
    });

    it('renders the link with the correct href', () => {
        const { getByRole } = render(
            <PackTitleLink packId={packId} packName={packName} openFile={openFile} />
        );
        expect(getByRole('link', { name: 'Open pack URL' })).toHaveAttribute('href', packUrl);
    });

    it('calls openFile with the pack URL and external=true on click', () => {
        const { getByRole } = render(
            <PackTitleLink packId={packId} packName={packName} openFile={openFile} />
        );
        fireEvent.click(getByRole('link', { name: 'Open pack URL' }));
        expect(openFile).toHaveBeenCalledTimes(1);
        expect(openFile).toHaveBeenCalledWith(packUrl, true);
    });

    it('prevents default navigation on click', () => {
        const { getByRole } = render(
            <PackTitleLink packId={packId} packName={packName} openFile={openFile} />
        );
        const link = getByRole('link', { name: 'Open pack URL' });
        const event = fireEvent.click(link);
        expect(event).toBe(false); // fireEvent.click returns false when preventDefault is called
    });
});
