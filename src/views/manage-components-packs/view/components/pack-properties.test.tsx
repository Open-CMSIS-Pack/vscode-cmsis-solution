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

import 'jest';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PackPropertiesDialog } from './pack-properties';
import { OriginDataType, PackRowDataType } from '../../data/component-tools';
import { TargetSetData } from '../../components-data';

describe('PackPropertiesDialog', () => {
    const mockOnClose = jest.fn();

    const createMockPack = (overrides?: Partial<PackRowDataType>): PackRowDataType => ({
        packId: 'ARM::CMSIS@6.1.0',
        key: 'ARM::CMSIS@6.1.0',
        overviewLink: 'https://arm.com/cmsis/overview',
        used: true,
        references: [
            { pack: 'ARM::CMSIS@6.1.0', resolvedPack: 'ARM::CMSIS@6.1.0', origin: 'path/to/project1.cproject.yml', relOrigin: 'path/to/project1.cproject.yml', selected: true },
            { pack: 'ARM::CMSIS@6.1.0', resolvedPack: 'ARM::CMSIS@6.1.0', origin: 'path/to/project2.cproject.yml', relOrigin: 'path/to/project2.cproject.yml', selected: true }
        ],
        name: 'CMSIS',
        versionUsed: '6.1.0',
        versionTarget: 'ARM::CMSIS@6.1.0',
        description: 'CMSIS Pack',
        ...overrides,
    });

    const selectedTargetType: TargetSetData = { type: 'project', relativePath: 'path/to/project1.cproject.yml', label: 'Project 1', key: 'project.path.to.project1', path: 'path/to/project1.cproject.yml' };

    const createMockAllOrigins = (): OriginDataType[] => ([
        { type: 'project', label: 'Project 1', path: 'absolute/path/to/origin1', relativePath: 'path/to/origin1', versionOperator: '@', version: '6.1.0', selected: true },
        { type: 'project', label: 'Project 2', path: 'absolute/path/to/origin2', relativePath: 'path/to/origin2', versionOperator: '@', version: '6.1.0', selected: true },
    ]);

    const getUpdatePackCard = () => screen.getByText('Update Pack').closest('.ant-card') as HTMLElement;

    const getUpdatePackButtons = () => Array.from(getUpdatePackCard().querySelectorAll('button'));

    beforeEach(() => {
        mockOnClose.mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders nothing when pack is undefined', () => {
        const { container } = render(
            <PackPropertiesDialog pack={undefined} state={{ unlilnkRequestStack: [], selectedTargetType: selectedTargetType }} allOrigins={undefined} onClose={mockOnClose} />
        );
        expect(container.querySelector('.ant-modal')).toBeDefined();
    });

    it('renders modal with pack title when pack is provided', () => {
        const pack = createMockPack();
        render(<PackPropertiesDialog pack={pack} state={{ unlilnkRequestStack: [], selectedTargetType: selectedTargetType }} allOrigins={createMockAllOrigins()} onClose={mockOnClose} />);

        expect(screen.queryAllByText('CMSIS')).toBeDefined();
    });

    it('displays package information in the first card', () => {
        const pack = createMockPack();
        render(<PackPropertiesDialog pack={pack} state={{ unlilnkRequestStack: [], selectedTargetType: selectedTargetType }} allOrigins={createMockAllOrigins()} onClose={mockOnClose} />);

        expect(screen.queryAllByText('ARM::CMSIS@6.1.0')).toBeDefined();
        expect(screen.queryAllByText('6.1.0')).toBeDefined();
        expect(screen.queryAllByText('CMSIS Pack')).toBeDefined();
    });

    it('calls onClose with true and updated pack when OK button is clicked', async () => {
        const pack = createMockPack();
        render(<PackPropertiesDialog pack={pack} state={{ unlilnkRequestStack: [], selectedTargetType: selectedTargetType }} allOrigins={createMockAllOrigins()} onClose={mockOnClose} />);

        const okButton = screen.getByRole('button', { name: 'OK' });
        fireEvent.click(okButton);

        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalledWith(true, expect.objectContaining({
                packId: 'ARM::CMSIS@6.1.0',
                versionTarget: 'ARM::CMSIS@6.1.0',
            }), undefined);
        });
    });

    it('calls onClose with false when Cancel button is clicked', async () => {
        const pack = createMockPack();
        render(<PackPropertiesDialog pack={pack} state={{ unlilnkRequestStack: [], selectedTargetType: selectedTargetType }} allOrigins={createMockAllOrigins()} onClose={mockOnClose} />);

        const cancelButton = screen.getByRole('button', { name: 'Cancel' });
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalledWith(false, undefined, undefined);
        });
    });

    it('updates local state when pack prop changes', async () => {
        const pack1 = createMockPack({ name: 'Pack1' });
        const { rerender } = render(<PackPropertiesDialog pack={pack1} state={{ unlilnkRequestStack: [], selectedTargetType: selectedTargetType }} allOrigins={createMockAllOrigins()} onClose={mockOnClose} />);

        expect(screen.getAllByText('Manage Pack: Pack1')).toBeDefined();

        const pack2 = createMockPack({ name: 'Pack2' });
        rerender(<PackPropertiesDialog pack={pack2} state={{ unlilnkRequestStack: [], selectedTargetType: selectedTargetType }} allOrigins={createMockAllOrigins()} onClose={mockOnClose} />);

        expect(screen.getAllByText('Manage Pack: Pack2')).toBeDefined();
    });

    it('shows current pack as latest installed and disables update button when no upgrades are available', () => {
        const pack = createMockPack({
            references: [{ pack: 'ARM::CMSIS@6.1.0', resolvedPack: 'ARM::CMSIS@6.1.0', origin: 'path/to/project1.cproject.yml', relOrigin: 'path/to/project1.cproject.yml', selected: true }],
        });

        render(<PackPropertiesDialog pack={pack} state={{ unlilnkRequestStack: [], selectedTargetType: selectedTargetType }} allOrigins={createMockAllOrigins()} onClose={mockOnClose} />);

        expect(screen.getAllByText('ARM::CMSIS@6.1.0')).toBeDefined();

        const [updateButton] = getUpdatePackButtons();
        expect(updateButton).toBeDefined();
    });

    it('shows upgrade pack version and marks unlock request when update is clicked', async () => {
        const pack = createMockPack({
            references: [{ pack: 'ARM::CMSIS@6.1.0', resolvedPack: 'ARM::CMSIS@6.1.0', origin: 'path/to/project1.cproject.yml', relOrigin: 'path/to/project1.cproject.yml', selected: true, upgrade: '6.2.0' }],
        });

        render(<PackPropertiesDialog pack={pack} state={{ unlilnkRequestStack: [], selectedTargetType: selectedTargetType }} allOrigins={createMockAllOrigins()} onClose={mockOnClose} />);

        expect(screen.getByText('CMSIS@6.2.0')).toBeDefined();

        const [updateButton] = getUpdatePackButtons();
        expect(updateButton).toBeDefined();

        fireEvent.click(updateButton);

        await waitFor(() => {
            fireEvent.click(screen.getByRole('button', { name: 'OK' }));
            expect(mockOnClose).toHaveBeenCalledWith(true, expect.anything(), 'CMSIS');
        });
    });

    it('shows first non-empty relPath after description when available', () => {
        const pack = createMockPack({
            references: [
                { pack: 'ARM::CMSIS@6.1.0', resolvedPack: 'ARM::CMSIS@6.1.0', origin: 'path/to/project1.cproject.yml', relOrigin: 'path/to/project1.cproject.yml', relPath: '', selected: true },
                { pack: 'ARM::CMSIS@6.1.0', resolvedPack: 'ARM::CMSIS@6.1.0', origin: 'path/to/project2.cproject.yml', relOrigin: 'path/to/project2.cproject.yml', relPath: 'packs/cmsis', selected: true }
            ]
        });

        render(<PackPropertiesDialog pack={pack} state={{ unlilnkRequestStack: [], selectedTargetType: selectedTargetType }} allOrigins={createMockAllOrigins()} onClose={mockOnClose} />);

        expect(screen.getByText('Path:')).toBeDefined();
        expect(screen.getByText('packs/cmsis')).toBeDefined();
    });

    it('does not show path row when all relPath values are missing or whitespace', () => {
        const pack = createMockPack({
            references: [
                { pack: 'ARM::CMSIS@6.1.0', resolvedPack: 'ARM::CMSIS@6.1.0', origin: 'path/to/project1.cproject.yml', relOrigin: 'path/to/project1.cproject.yml', relPath: '   ', selected: true },
                { pack: 'ARM::CMSIS@6.1.0', resolvedPack: 'ARM::CMSIS@6.1.0', origin: 'path/to/project2.cproject.yml', relOrigin: 'path/to/project2.cproject.yml', selected: true }
            ]
        });

        render(<PackPropertiesDialog pack={pack} state={{ unlilnkRequestStack: [], selectedTargetType: selectedTargetType }} allOrigins={createMockAllOrigins()} onClose={mockOnClose} />);

        expect(screen.queryByText('Path:')).toBeNull();
    });

    it('shows only latest installed version mode in compact dropdown when firstReferencePath exists', () => {
        const pack = createMockPack({
            references: [
                { pack: 'ARM::CMSIS@6.1.0', resolvedPack: 'ARM::CMSIS@6.1.0', origin: 'path/to/project1.cproject.yml', relOrigin: 'path/to/project1.cproject.yml', relPath: 'packs/cmsis', selected: true }
            ]
        });

        render(<PackPropertiesDialog pack={pack} state={{ unlilnkRequestStack: [], selectedTargetType: selectedTargetType }} allOrigins={createMockAllOrigins()} onClose={mockOnClose} />);

        expect(document.querySelectorAll('.compact-dropdown-caret')).toHaveLength(0);
        expect(screen.getAllByText('Unspecified').length).toBeGreaterThan(0);
    });

    it('does not render Update Pack section when firstReferencePath exists', () => {
        const pack = createMockPack({
            references: [
                { pack: 'ARM::CMSIS@6.1.0', resolvedPack: 'ARM::CMSIS@6.1.0', origin: 'path/to/project1.cproject.yml', relOrigin: 'path/to/project1.cproject.yml', relPath: 'packs/cmsis', selected: true }
            ]
        });

        render(<PackPropertiesDialog pack={pack} state={{ unlilnkRequestStack: [], selectedTargetType: selectedTargetType }} allOrigins={createMockAllOrigins()} onClose={mockOnClose} />);

        expect(screen.queryByText('Update Pack')).toBeNull();
    });

    it('keeps full compact dropdown version choices when firstReferencePath is not available', () => {
        const pack = createMockPack({
            references: [
                { pack: 'ARM::CMSIS@6.1.0', resolvedPack: 'ARM::CMSIS@6.1.0', origin: 'path/to/project1.cproject.yml', relOrigin: 'path/to/project1.cproject.yml', relPath: '   ', selected: true }
            ]
        });

        render(<PackPropertiesDialog pack={pack} state={{ unlilnkRequestStack: [], selectedTargetType: selectedTargetType }} allOrigins={createMockAllOrigins()} onClose={mockOnClose} />);

        expect(document.querySelectorAll('.compact-dropdown-caret').length).toBeGreaterThan(0);
    });

    it('renders Update Pack section when firstReferencePath is not available', () => {
        const pack = createMockPack({
            references: [
                { pack: 'ARM::CMSIS@6.1.0', resolvedPack: 'ARM::CMSIS@6.1.0', origin: 'path/to/project1.cproject.yml', relOrigin: 'path/to/project1.cproject.yml', relPath: '   ', selected: true }
            ]
        });

        render(<PackPropertiesDialog pack={pack} state={{ unlilnkRequestStack: [], selectedTargetType: selectedTargetType }} allOrigins={createMockAllOrigins()} onClose={mockOnClose} />);

        expect(screen.getByText('Update Pack')).toBeDefined();
    });

    it('treats firstReferencePath as undefined when relPath is not defined on all references', () => {
        const pack = createMockPack({
            references: [
                { pack: 'ARM::CMSIS@6.1.0', resolvedPack: 'ARM::CMSIS@6.1.0', origin: 'path/to/project1.cproject.yml', relOrigin: 'path/to/project1.cproject.yml', selected: true },
                { pack: 'ARM::CMSIS@6.1.0', resolvedPack: 'ARM::CMSIS@6.1.0', origin: 'path/to/project2.cproject.yml', relOrigin: 'path/to/project2.cproject.yml', selected: true }
            ]
        });

        render(<PackPropertiesDialog pack={pack} state={{ unlilnkRequestStack: [], selectedTargetType: selectedTargetType }} allOrigins={createMockAllOrigins()} onClose={mockOnClose} />);

        expect(screen.queryByText('Path:')).toBeNull();
        expect(screen.getByText('Update Pack')).toBeDefined();
    });

    it('keeps compact dropdown expandable when relPath is not defined on all references', () => {
        const pack = createMockPack({
            references: [
                { pack: 'ARM::CMSIS@6.1.0', resolvedPack: 'ARM::CMSIS@6.1.0', origin: 'path/to/project1.cproject.yml', relOrigin: 'path/to/project1.cproject.yml', selected: true }
            ]
        });

        render(<PackPropertiesDialog pack={pack} state={{ unlilnkRequestStack: [], selectedTargetType: selectedTargetType }} allOrigins={createMockAllOrigins()} onClose={mockOnClose} />);

        expect(document.querySelectorAll('.compact-dropdown-caret').length).toBeGreaterThan(0);
    });

});
