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
import { Condition } from '../../../../../json-rpc/csolution-rpc-client';

describe('renderValidation', () => {
    const makeDependencyNode = (
        id = 'Vendor::Class:Group',
        description = 'Dependency description'
    ): ComponentRowDataType => ({
        key: id,
        name: 'Dependency',
        data: {
            id: `${id}@1.0.0`,
            description,
            pack: 'Vendor::Pack@1.0.0'
        } as any,
        aggregate: {
            id,
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

    const renderConditions = (conditions: Condition[], dependencies: ComponentRowDataType[]) => {
        const record: ComponentRowDataType = {
            ...makeDependencyNode(),
            key: 'ValidationRoot',
            name: 'ValidationRoot',
            validation: {
                id: 'ValidationRoot/V001',
                result: 'ERROR',
                conditions
            }
        };

        const rendered = renderValidation(
            record,
            [],
            jest.fn(),
            {
                componentTree: dependencies,
                componentScope: 'solution',
                selectedTargetType: undefined
            },
            new MockMessageHandler(jest.fn()),
            1,
            jest.fn(),
            { current: {} }
        );

        render(<>{rendered}</>);
    };

    it('renders warning-only conditions', () => {
        const warning = makeDependencyNode('Vendor::Class:Warning', 'Warning dependency');

        renderConditions([{
            result: 'SELECTABLE',
            expression: 'requires Vendor::Class:Warning',
            aggregates: [warning.aggregate.id]
        }], [warning]);

        expect(screen.getByText('Warning dependency')).toBeTruthy();
    });

    it('renders error-only conditions', () => {
        const error = makeDependencyNode('Vendor::Class:Error', 'Error dependency');

        renderConditions([{
            result: 'MISSING',
            expression: 'requires Vendor::Class:Error',
            aggregates: [error.aggregate.id]
        }], [error]);

        expect(screen.getByText('Error dependency')).toBeTruthy();
    });

    it('suppresses warning conditions when an error condition is present', () => {
        const warning = makeDependencyNode('Vendor::Class:Warning', 'Warning dependency');
        const error = makeDependencyNode('Vendor::Class:Error', 'Error dependency');

        renderConditions([
            {
                result: 'SELECTABLE',
                expression: 'requires Vendor::Class:Warning',
                aggregates: [warning.aggregate.id]
            },
            {
                result: 'MISSING',
                expression: 'requires Vendor::Class:Error',
                aggregates: [error.aggregate.id]
            }
        ], [warning, error]);

        expect(screen.queryByText('Warning dependency')).toBeNull();
        expect(screen.getByText('Error dependency')).toBeTruthy();
    });

    it('preserves neutral conditions when warning conditions are suppressed', () => {
        const warning = makeDependencyNode('Vendor::Class:Warning', 'Warning dependency');
        const error = makeDependencyNode('Vendor::Class:Error', 'Error dependency');
        const neutral = makeDependencyNode('Vendor::Class:Neutral', 'Neutral dependency');

        renderConditions([
            {
                result: 'SELECTABLE',
                expression: 'requires Vendor::Class:Warning',
                aggregates: [warning.aggregate.id]
            },
            {
                result: 'MISSING',
                expression: 'requires Vendor::Class:Error',
                aggregates: [error.aggregate.id]
            },
            {
                expression: 'requires Vendor::Class:Neutral',
                aggregates: [neutral.aggregate.id]
            }
        ], [warning, error, neutral]);

        expect(screen.queryByText('Warning dependency')).toBeNull();
        expect(screen.getByText('Error dependency')).toBeTruthy();
        expect(screen.getByText('Neutral dependency')).toBeTruthy();
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
