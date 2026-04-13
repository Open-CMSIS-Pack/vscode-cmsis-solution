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

import './draggable-modal-wrapper.css';
import React from 'react';

interface DraggableModalWrapperProps {
    modal: React.ReactNode;
}

/**
 * Wraps a modal to make it draggable by its header or title.
 * Ensures modal stays within the viewport and disables text selection while dragging.
 */
const DraggableModalWrapper: React.FC<DraggableModalWrapperProps> = ({ modal }) => {
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const modalElement = e.currentTarget.parentElement;
        if (!modalElement) return;
        modalElement.style.position = 'fixed';
        const targetClasslist = (e.target as HTMLElement).classList;
        if (!['ant-modal-header', 'ant-modal-title'].some(cls => targetClasslist.contains(cls))) return;

        const rect = modalElement.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        const documentRect = { right: (document.childNodes[1] as HTMLElement).clientWidth, bottom: (document.childNodes[1] as HTMLElement).clientHeight - 50 };
        if (!documentRect) return;

        // Disable text selection while dragging
        const prevUserSelect = document.documentElement.style.userSelect;
        document.documentElement.style.userSelect = 'none';

        const handleMouseMove = (moveEvent: MouseEvent) => {
            let top = Math.min(Math.max(0, moveEvent.clientY - offsetY), documentRect.bottom - rect.height);
            let left = Math.min(Math.max(0, moveEvent.clientX - offsetX), documentRect.right - rect.width);
            if (top < 0) top = 0;
            if (left < 0) left = 0;
            modalElement.style.left = `${left}px`;
            modalElement.style.top = `${top}px`;
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            // Restore previous text selection style
            document.documentElement.style.userSelect = prevUserSelect;
            // (modalElement.querySelector('.ant-modal-header') as HTMLElement)!.style.cursor = 'unset';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        // (modalElement.querySelector('.ant-modal-header') as HTMLElement)!.style.cursor = 'move';
    };

    return (
        <div onMouseDown={handleMouseDown} className="draggable-modal-wrapper">
            {modal}
        </div>
    );
};

export default DraggableModalWrapper;
