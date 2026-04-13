/* eslint-disable @typescript-eslint/no-explicit-any */
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

import 'jest';
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MockMessageHandler } from '../../../../__test__/mock-message-handler';
import { ComponentRowDataType } from '../../../data/component-tools';
import { IncomingMessage, OutgoingMessage } from '../../../messages';
import { renderValidation } from './render-validation-row';
import { MessageHandler } from '../../../../message-handler';

describe('renderValidation', () => {
    const makeDependencyNode = (): ComponentRowDataType => ({
        key: 'Vendor::Class:Group',
        name: 'Dependency',
        data: {
            id: 'Vendor::Class:Group@1.0.0',
            description: 'Dependency description',
            pack: 'Vendor::Pack@1.0.0'
        } as any,
        aggregate: {
            id: 'Vendor::Class:Group',
            selectedCount: 0,
            activeVariant: undefined,
            options: {}
        } as any,
        parsed: {
            vendor: 'Vendor',
            class: 'Class',
            group: 'Group',
            version: '1.0.0'
        },
        variants: ['Default']
    });

    it('applies selected aggregate with clayer path and emits CHANGE_COMPONENT_VALUE', () => {
        const listener = jest.fn();
        const messageHandler: MessageHandler<IncomingMessage, OutgoingMessage> = new MockMessageHandler(listener);
        const dependencyNode = makeDependencyNode();

        const record: ComponentRowDataType = {
            ...makeDependencyNode(),
            key: 'ValidationRoot',
            name: 'ValidationRoot',
            validation: {
                id: 'ValidationRoot/V001',
                result: 'ERROR',
                conditions: [{
                    expression: 'requires Vendor::Class:Group',
                    aggregates: ['Vendor::Class:Group']
                }]
            } as any
        };

        const setExpandedRowKeys = jest.fn();
        const setDropdownKey = jest.fn();
        const componentRefs = { current: {} as Record<string, HTMLInputElement | null> };

        const rendered = renderValidation(
            record,
            [],
            setExpandedRowKeys,
            {
                componentTree: [dependencyNode],
                componentScope: 'solution',
                selectedTargetType: {
                    type: 'layer',
                    key: 'layer-key',
                    label: 'Layer',
                    path: 'configs/board.clayer.yml',
                    relativePath: 'configs/board.clayer.yml'
                }
            },
            messageHandler,
            1,
            setDropdownKey,
            componentRefs,
        );

        render(<>{rendered}</>);
        fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

        expect(dependencyNode.aggregate.selectedCount).toBe(1);
        expect(dependencyNode.aggregate.activeVariant).toBe('Default');
        expect(dependencyNode.aggregate.options?.layer).toBe('configs/board.clayer.yml');
        expect(listener).toHaveBeenCalledWith({ type: 'CHANGE_COMPONENT_VALUE', componentData: dependencyNode });
    });
});
