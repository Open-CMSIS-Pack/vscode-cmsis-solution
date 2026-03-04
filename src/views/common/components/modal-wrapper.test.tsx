/*
 * Copyright (C) 2025-2026 Arm Limited
 */
import { ModalManager } from './modal-wrapper';
import { act } from 'react-dom/test-utils';
import { waitFor } from '@testing-library/react';

describe('ModalManager', () => {
    let modalManager: ModalManager;

    beforeEach(() => {
        modalManager = new ModalManager();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });

    async function openModal(...args: Parameters<ModalManager['showModalBox']>) {
        act(() => { modalManager.showModalBox(...args); });
        await waitFor(() => {
            const el = document.querySelector('.ant-modal');
            if (!el) throw new Error('modal not mounted yet');
        });
    }

    it('creates and displays a modal', async () => {
        const onOkMock = jest.fn();
        const onCancelMock = jest.fn();

        await openModal('Test Title', 'Test Message', onOkMock, onCancelMock);

        const modalElement = document.querySelector('.ant-modal');
        expect(modalElement?.textContent).toContain('Test Title');
        expect(modalElement?.textContent).toContain('Test Message');
    });

    it('calls onOk when OK button is clicked', async () => {
        const onOkMock = jest.fn();
        await openModal('Test Title', 'Test Message', onOkMock);

        const okButton = document.querySelector('.ant-modal .ant-btn-primary') as HTMLButtonElement;
        expect(okButton).toBeTruthy();

        act(() => okButton.click());
        expect(onOkMock).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            expect(document.querySelector('.ant-modal')).toBeNull();
        });
    });

    it('calls onCancel when Cancel button is clicked', async () => {
        const onCancelMock = jest.fn();
        await openModal('Test Title', 'Test Message', undefined, onCancelMock);

        // If both buttons share .ant-btn, pick the non-primary for cancel
        const cancelButton = document.querySelector('.ant-modal .ant-btn:not(.ant-btn-primary)') as HTMLButtonElement;
        expect(cancelButton).toBeTruthy();

        act(() => cancelButton.click());
        expect(onCancelMock).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            expect(document.querySelector('.ant-modal')).toBeNull();
        });
    });

    it('cleans up DOM after destroy', async () => {
        let instance: ReturnType<ModalManager['showModalBox']>;
        act(() => {
            instance = modalManager.showModalBox('Test Title', 'Test Message');
        });
        await waitFor(() => expect(document.querySelector('.ant-modal')).toBeTruthy());

        act(() => instance!.destroy());

        await waitFor(() => {
            expect(document.querySelector('.ant-modal')).toBeNull();
        });
    });
});
