import 'jest';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PackPropertiesDialog } from './pack-properties';
import { OriginDataType, PackRowDataType } from '../../data/component-tools';
import { TargetSetData } from '../../components-data';

/**
 * Copyright (C) 2025-2026 Arm Limited
 */


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

});
