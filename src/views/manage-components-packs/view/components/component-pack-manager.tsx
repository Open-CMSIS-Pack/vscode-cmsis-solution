/**
 * Copyright 2020-2026 Arm Limited
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

import '../../../common/style/antd-overrides.css';
import './component-pack-manager.css';
import * as React from 'react';
import { initialState, componentsReducer as componentsReducer } from '../state/reducer';
import { ConfigProvider, theme, Row, Col, Button, Segmented } from 'antd';
import { ComponentRowDataType, ComponentScope } from '../../data/component-tools';
import { ComponentProps } from './component-props';
import { filterTree } from '../helpers/components-packs-helpers';
import { flatTree } from '../../data/component-tree';
import { ComponentsView } from './components-view';
import { PacksView } from './packs-view';
import { useVSCodeTheme } from '../../../hooks/use-vscode-theme';

// Import the necessary components and types from Ant Design

/**
 * Main react component for the Manage Software Components webview.
 * Stores main UI state and interfaces to cmsis-rte via the message handler.
 */
export const ComponentPackManager = (props: ComponentProps) => {
    const { messageHandler } = props;

    const [state, dispatch] = React.useReducer(componentsReducer, initialState);

    const [activeView, setActiveView] = React.useState<'components' | 'packs'>('components');
    const [expandedRowKeys, setExpandedRowKeys] = React.useState<string[]>([]);
    const [search, setSearch] = React.useState('');

    const isDarkTheme = useVSCodeTheme();

    // Ref to store component row references (DOM) for setting the focus
    const componentRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

    const treeNodes = React.useMemo(() => {
        if (!search) return state.componentTree;
        return filterTree(state.componentTree, search);
    }, [state.componentTree, search]);

    const validationErrorComponents = React.useMemo(() => {
        return flatTree(state.componentTree)
            .filter((node) => node.validation && node.validation.id !== undefined)
            .map((node) => node.validation!.id);
    }, [state.componentTree]);

    React.useEffect(() => {
        messageHandler.push({ type: 'REQUEST_INITIAL_DATA' });
        return messageHandler.subscribe(message => dispatch({ type: 'INCOMING_MESSAGE', message }));
    }, [messageHandler]);

    const onChangeActiveView = (view: 'components' | 'packs') => {
        setActiveView(view);
    };

    // used as an internal key-state to trigger a re-render of the dropdown when an aggregate is selected
    const [dropdownKey, setDropdownKey] = React.useState(0);

    const onChangeComponentRange = React.useCallback((scope: ComponentScope) => {
        messageHandler.push({
            type: 'CHANGE_COMPONENT_SCOPE',
            scope: scope
        });
    }, [messageHandler]);

    const onChangeComponentValue = React.useCallback((record: ComponentRowDataType) => {
        messageHandler.push({ type: 'CHANGE_COMPONENT_VALUE', componentData: record });
    }, [messageHandler]);

    const onChangeComponentVariant = React.useCallback((record: ComponentRowDataType, variant: string) => {
        messageHandler.push({ type: 'CHANGE_COMPONENT_VARIANT', componentData: record, variant: variant });
    }, [messageHandler]);

    const onChangeBundle = React.useCallback((record: ComponentRowDataType, bundle: string) => {
        messageHandler.push({ type: 'CHANGE_COMPONENT_BUNDLE', componentData: record, bundle: bundle });
    }, [messageHandler]);

    const openDocFile = React.useCallback((link: string) => {
        messageHandler.push({ type: 'OPEN_FILE', uri: link, external: true });
    }, [messageHandler]);

    const openFile = React.useCallback((link: string, external?: boolean, focusOn?: string) => {
        messageHandler.push({ type: 'OPEN_FILE', uri: link, external: external ?? false, focusOn });
    }, [messageHandler]);

    const onSearch = React.useCallback((value: string) => {
        setSearch(value);
    }, []);

    const onApplyComponentSet = () => {
        messageHandler.push({ type: 'APPLY_COMPONENT_SET' });
    };

    return (
        <React.StrictMode>
            <div className='components-packs-view-root'>
                <ConfigProvider
                    theme={{
                        algorithm: [
                            isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm
                        ],
                        components: {
                            Table: { colorBgContainer: 'unset', headerBg: 'unset' },
                            Tooltip: {
                                colorBgSpotlight: isDarkTheme ? '#333' : '#eee',
                                colorTextLightSolid: isDarkTheme ? '#ffffff' : '#000000',
                            }
                        },
                        token: { fontSize: 13, sizeStep: 4, borderRadius: 3 }
                    }}>
                    <Row className='components-view-actions'>
                        <Col>
                            <Button onClick={onApplyComponentSet} disabled={!state.isDirty} style={{ minWidth: '100px' }} type='primary'>Save</Button>
                        </Col>
                        <Col flex={'350px'}>
                            <Segmented
                                options={[{ label: 'Components', value: 'components' }, { label: 'Software packs', value: 'packs' }]}
                                value={activeView}
                                onChange={onChangeActiveView} />
                        </Col>
                        <Col flex={'auto'}>
                            <Segmented
                                options={[{ label: 'Packs in solution', value: ComponentScope.Solution }, { label: 'All installed packs', value: ComponentScope.All }]}
                                value={state.componentScope}
                                onChange={onChangeComponentRange} />
                        </Col>
                    </Row>

                    {activeView === 'components' &&
                        <ComponentsView
                            treeNodes={treeNodes}
                            state={state}
                            expandedRowKeys={expandedRowKeys}
                            setExpandedRowKeys={setExpandedRowKeys}
                            dropdownKey={dropdownKey}
                            setDropdownKey={setDropdownKey}
                            componentRefs={componentRefs}
                            messageHandler={messageHandler}
                            validationErrorComponents={validationErrorComponents}
                            onChangeComponentValue={onChangeComponentValue}
                            onChangeComponentVariant={onChangeComponentVariant}
                            onChangeBundle={onChangeBundle}
                            openFile={openFile}
                            openDocFile={openDocFile}
                            onSearch={onSearch}
                        />
                    }
                    {activeView === 'packs' &&
                        <PacksView
                            state={state}
                            openFile={openFile}
                            messageHandler={messageHandler}
                            availablePacks={state.availablePacks}
                        />
                    }
                </ConfigProvider>
            </div>
        </React.StrictMode>
    );
};
