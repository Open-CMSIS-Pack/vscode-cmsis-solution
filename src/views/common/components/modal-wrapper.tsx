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

import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Modal, ConfigProvider, theme } from 'antd';

interface ModalInstance {
    destroy: () => void;
}

export class ModalManager {
    private containerElement: HTMLDivElement | null = null;
    private root: Root | null = null;

    private getContainer(): HTMLDivElement {
        if (!this.containerElement) {
            this.containerElement = document.createElement('div');
            this.containerElement.style.position = 'relative';
            this.containerElement.style.zIndex = '1000';
            document.body.appendChild(this.containerElement);
        }
        return this.containerElement;
    }

    private cleanup() {
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
        if (this.containerElement && this.containerElement.parentNode) {
            this.containerElement.parentNode.removeChild(this.containerElement);
            this.containerElement = null;
        }
    }

    public showModalBox(
        title: string,
        message: string,
        onOk?: () => void,
        onCancel?: () => void
    ): ModalInstance {
        const container = this.getContainer();
        const isDarkTheme = document.body.classList.contains('vscode-dark');

        if (this.root) {
            this.root.unmount();
        }

        this.root = createRoot(container);

        const handleOk = () => {
            if (onOk) {
                onOk();
            }
            this.cleanup();
        };

        const handleCancel = () => {
            if (onCancel) {
                onCancel();
            }
            this.cleanup();
        };

        const ModalComponent = () => (
            <ConfigProvider
                theme={{
                    algorithm: isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
                }}
            >
                <Modal
                    title={title}
                    open={true}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    okText="OK"
                    cancelText="Cancel"
                    centered={true}
                    maskClosable={true}
                    destroyOnClose={true}
                >
                    <div>{message}</div>
                </Modal>
            </ConfigProvider>
        );

        this.root.render(<ModalComponent />);

        return {
            destroy: () => this.cleanup()
        };
    }
}

// Create a singleton instance
const modalManager = new ModalManager();

// Extend the Window interface to include showModalBox
declare global {
    interface Window {
        showModalBox: (
            title: string,
            message: string,
            onOk?: () => void,
            onCancel?: () => void
        ) => ModalInstance;
    }
}

// Attach the function to the global window object (only in browser contexts)
if (typeof window !== 'undefined') {
    window.showModalBox = (title: string, message: string, onOk?: () => void, onCancel?: () => void) => {
        return modalManager.showModalBox(title, message, onOk, onCancel);
    };
}

export type { ModalInstance };
