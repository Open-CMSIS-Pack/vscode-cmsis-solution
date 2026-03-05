/**
 * Copyright (C) 2024-2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { LoadingOutlined } from '@ant-design/icons';
import { Button, Checkbox, CheckboxChangeEvent, Col, ConfigProvider, Flex, Input, InputNumber, Row, Spin, Tabs, theme } from 'antd';
import { debounce } from 'lodash';
import * as React from 'react';
import { UISection, UISectionChildren } from '../../../../debug/debug-adapters-yaml-file';
import { CompactDropdown } from '../../../common/components/compact-dropdown';
import '../../../common/style/antd-overrides.css';
import { useVSCodeTheme } from '../../../hooks/use-vscode-theme';
import { MessageHandler } from '../../../message-handler';
import { IncomingMessage, OutgoingMessage } from '../../messages';
import { GenericPropertyList } from '../state/manage-solution-state';
import { SolutionUpdateAction, contextUpdateReducer, initialState, manageSolutionReducer } from '../state/reducer';
import './manage-solution.css';
import { ProjectsTable } from './projects-table';
import { TargetsTable } from './targets-table';
import { PathType } from '../../types';

export interface ManageSolutionProps {
    messageHandler: MessageHandler<IncomingMessage, OutgoingMessage>;
}

export const ManageSolution = (props: ManageSolutionProps) => {
    const [state, dispatch] = React.useReducer(manageSolutionReducer, initialState);
    // Eager local editable values snapshot (display-layer values). Numbers are stored scaled for user editing.
    const [localValues, setLocalValues] = React.useState<Record<string, string | number>>({});

    const adapter = React.useMemo(
        () => state.debugAdapters.find(adapter => adapter.name === state.debugger),
        [state.debugAdapters, state.debugger]
    );

    // returns section::[pname:]option
    const keyFor = React.useCallback((section: UISection | undefined, option: UISectionChildren | undefined) => {
        return `${section?.['yml-node'] || ''}::${option?.pname ? `${option.pname}:` : ''}${option?.['yml-node'] || ''}`;
    }, []);

    const ulRef = React.useRef<HTMLUListElement>(null);
    React.useEffect(() => {
        const m = new MutationObserver(() => {
            ulRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
        });
        m.observe(document.body, { childList: true, subtree: true });
        return () => m.disconnect();
    }, []);

    const isDarkTheme = useVSCodeTheme();

    React.useEffect(() => {
        props.messageHandler.push({ type: 'GET_CONTEXT_SELECTION_DATA' });
        props.messageHandler.push({ type: 'GET_DEBUG_ADAPTERS' });
        return props.messageHandler.subscribe(message => dispatch({ type: 'INCOMING_MESSAGE', message }));
    }, [props.messageHandler]);

    const openFile = React.useCallback(
        (path: string) => props.messageHandler.push({ type: 'OPEN_FILE', path }),
        [props.messageHandler]
    );

    React.useEffect(() => {
        const handleFileSelected = (message: IncomingMessage) => {
            if (message.type === 'FILE_SELECTED' && message.data && message.data.length > 0) {
                const element = document.getElementById(message.for || '');
                if (element) {
                    const ymlNode = element.getAttribute('data-yml-node') || 'config';
                    props.messageHandler.push({ type: 'SET_DEBUG_ADAPTER_PROPERTY', service: undefined, key: ymlNode, value: message.data[0] });
                    (element as HTMLInputElement).value = message.data[0];
                }
            }
        };

        const unsubscribe = props.messageHandler.subscribe(handleFileSelected);
        return unsubscribe;
    }, [props.messageHandler]);

    const updateSelectedTarget = React.useCallback((action: SolutionUpdateAction) => {
        if (action.type === 'SET_SELECTED_TARGET') {
            const normalizedSet = action.set === '<default>' ? undefined : action.set;
            props.messageHandler.push({ type: 'SET_SELECTED_TARGET', target: action.target, set: normalizedSet });
            // Optimistically update the webview state
            dispatch({ ...action, set: normalizedSet });
        }
    }, [props.messageHandler]);

    const updateSolutionData = React.useCallback((action: SolutionUpdateAction) => {
        const updatedSolutionData = contextUpdateReducer(state.solutionData, action);
        props.messageHandler.push({ type: 'SET_SELECTED_CONTEXTS', data: updatedSolutionData });
        // Optimistically update the webview state
        dispatch(action);
    }, [props.messageHandler, state.solutionData]);

    const addContext = React.useCallback(() => {
        props.messageHandler.push({ type: 'ADD_NEW_CONTEXT' });
    }, [props.messageHandler]);

    const addProject = React.useCallback(() => {
        props.messageHandler.push({ type: 'ADD_NEW_PROJECT' });
    }, [props.messageHandler]);

    const addImage = React.useCallback(() => {
        props.messageHandler.push({ type: 'ADD_NEW_IMAGE' });
    }, [props.messageHandler]);

    const unlinkImage = React.useCallback((image: string) => {
        props.messageHandler.push({ type: 'UNLINK_IMAGE', image });
    }, [props.messageHandler]);

    const selectDebugger = React.useCallback((name: string) => {
        props.messageHandler.push({ type: 'SET_DEBUGGER', name });
    }, [props.messageHandler]);

    const clickSave = React.useCallback(() => {
        props.messageHandler.push({ type: 'SAVE_CONTEXT_SELECTION' });
    }, [props.messageHandler]);

    const changeAutoUpdate = React.useCallback((e: CheckboxChangeEvent) => {
        props.messageHandler.push({ type: 'SET_AUTO_UPDATE', value: e.target.checked });
        dispatch({ type: 'INCOMING_MESSAGE', message: { type: 'AUTO_UPDATE', data: e.target.checked } });
    }, [props.messageHandler]);

    const selectedDebugAdapter = React.useMemo(() => (
        state.solutionData.selectedTarget?.targetSets
            ?.find(({ name }) => name === (state.solutionData.selectedTarget?.selectedSet || ''))
            ?.debugger as GenericPropertyList || {}
    ), [state.solutionData.selectedTarget?.targetSets, state.solutionData.selectedTarget?.selectedSet]);

    const openHelp = React.useCallback(
        () => props.messageHandler.push({ type: 'OPEN_HELP' }),
        [props.messageHandler]
    );

    // Generic getter (stable, no deps needed as it does not capture changing values directly)
    const getProperty = React.useCallback(function getProperty<T>(defaultValue: T | undefined, obj: Record<string, unknown>, ...keys: (string | unknown)[]): T | undefined {
        let result = obj;
        let i = 0;
        while (i < keys.length) {
            const key = keys[i];
            if (typeof key === 'string') {
                if (!result) break;

                if (Array.isArray(result)) {
                    // Special handling for patterns like: 'pname', <coreName>, <value>
                    if (key === 'pname' && typeof keys[i + 1] === 'string' && typeof keys[i + 2] === 'string') {
                        const [coreName, value] = keys.slice(i + 1, i + 3) as [string, string];
                        result = (result as Array<Record<string, unknown>>)
                            .find(p => p.pname === coreName)?.[value] as Record<string, unknown>;
                        i += 3;
                        continue;
                    }
                    // Special handling for single item arrays where key list doesn't contain a pname.
                    result = result[0][keys[i] as string] as Record<string, unknown>;
                    break;
                } else {
                    result = (result as Record<string, unknown>)[key] as Record<string, unknown>;
                }
            }
            i++;
        }
        return result as T ?? defaultValue;
    }, []);

    const getScaledProperty = React.useCallback(function getScaledProperty(defaultValue: number | undefined, scale: number | undefined, obj: Record<string, unknown>, ...keys: (string | unknown)[]): number | undefined {
        const scaled = (v: number | undefined) => (v !== undefined && scale !== undefined ? v / scale : v);
        const unscaled = (v: number) => (scale !== undefined ? v * scale : v);
        if (defaultValue === undefined) {
            return scaled(getProperty<number>(undefined, obj, ...keys));
        }
        return scaled(getProperty<number>(unscaled(defaultValue), obj, ...keys));
    }, [getProperty]);

    function sendDebugAdapterProperty(service: string | undefined, key: string, value: string): void;
    function sendDebugAdapterProperty(service: string | undefined, key: string, value: number, scale?: number): void;
    function sendDebugAdapterProperty(service: string | undefined, key: string, value: string, scale: undefined, pname?: string): void;
    function sendDebugAdapterProperty(service: string | undefined, key: string, value: string | number, scale?: number, pname?: string): void {
        if (typeof value === 'number' && scale) {
            value = value * scale;
        }
        props.messageHandler.push({ type: 'SET_DEBUG_ADAPTER_PROPERTY', service, key, value, pname });
    }

    const toggleDebugger = React.useCallback((e: CheckboxChangeEvent) => {
        props.messageHandler.push({ type: 'TOGGLE_DEBUGGER', value: e.target.checked });
    }, [props.messageHandler]);

    const toggleSection = React.useCallback((section: string) => {
        props.messageHandler.push({ type: 'TOGGLE_DEBUG_ADAPTER_SECTION', section });
    }, [props.messageHandler]);

    const hasDebugger = !!state.debugger;

    const selectFile = React.useMemo(() => {
        const handleSelectFile = (e: React.MouseEvent<HTMLElement>) => {
            const input = (e.target as HTMLElement)?.parentElement?.parentNode?.parentNode?.querySelector('input');
            let id = input?.getAttribute('id');
            if (id === null || id === undefined) {
                // eslint-disable-next-line react-hooks/purity
                id = Math.random().toString(36).substring(2, 15);
                input?.setAttribute('id', id);
            }
            const title = input?.getAttribute('title') || 'Select File';
            const dataOptionPathType = input?.getAttribute('data-option-path-type');
            const optionPathType: PathType = dataOptionPathType === 'absolute' ? 'absolute' : 'relative';
            const currentValue = input?.value || '';
            props.messageHandler.push({
                type: 'SELECT_FILE',
                targetElementId: id,
                options: {
                    canSelectMany: false,
                    defaultUri: currentValue,
                    openLabel: 'Select File', // title of the dialog button to choose the file
                    title: title, // dialog title
                    filters: { 'All Files': ['*'] },
                    pathType: optionPathType
                }
            });
        };

        return debounce(handleSelectFile, 300);
    }, [props.messageHandler]);

    // Eager initialization/reset of localValues whenever adapter context changes.
    React.useEffect(() => {
        const next: Record<string, string | number> = {};
        adapter?.['user-interface']?.forEach(section => {
            section.options?.forEach(o => {
                const k = keyFor(section, o);
                const sectionNode = section['yml-node'];
                const optionNode = o['yml-node'];
                if (o.type === 'number') {
                    // Store scaled value for editing convenience (always number)
                    next[k] = getScaledProperty(o.default ?? o.range?.[1] ?? 0, o.scale, selectedDebugAdapter, sectionNode, o.pname, optionNode) ?? (o.default ?? o.range?.[1] ?? 0);
                } else {
                    // All non-number types treated as strings; ensure fallback to ''
                    const raw = o.pname
                        ? getProperty<string>(o.default ?? '', selectedDebugAdapter, sectionNode, 'pname', o.pname, optionNode)
                        : getProperty<string>(o.default ?? '', selectedDebugAdapter, sectionNode, optionNode);
                    next[k] = raw ?? '';
                }
            });
        });
        setLocalValues(next);
    }, [adapter, selectedDebugAdapter, getProperty, getScaledProperty, keyFor]);

    const showCoreSelector = state.solutionData.availableCoreNames !== undefined && state.solutionData.availableCoreNames.length > 1;

    return (
        <React.StrictMode>
            <div className="manage-solution-frame">
                <ConfigProvider theme={{
                    algorithm: [
                        isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm
                    ],
                    components: {
                        Table: { colorBgContainer: 'unset', headerBg: 'unset' }
                    },
                    token: { fontSize: 13, sizeStep: 4, borderRadius: 3 }
                }}>
                    <section className='stickyHeader'>
                        <Button disabled={!state.isDirty} style={{ minWidth: '100px' }} type='primary' onClick={clickSave} className='save-button'>Save</Button>
                    </section>

                    <Spin spinning={state.busy} indicator={<LoadingOutlined spin={true} />} size='large'>
                        <section className="manage-solution-section">

                            <section className="targets-section">
                                <div className='manage-solution-header'>
                                    <h3>Active Target</h3>
                                    <a onClick={() => openHelp()} title="Active Target" className="codicon codicon-link-external codicon-fix-size-sub"></a>
                                </div>
                                <div>
                                    Select target for build, load, and debug. The Target
                                    Set stores selected projects, images, and debug adapter. <a className="open-csolution-yml" onClick={() => openFile(state.solutionData.solutionPath)} title={state.solutionData.solutionPath}>Edit csolution.yml</a>
                                </div>
                                <TargetsTable
                                    options={state.solutionData.targets}
                                    selectedTarget={state.solutionData.selectedTarget}
                                    updateSelectedTarget={updateSelectedTarget}
                                    addContext={addContext}
                                />
                            </section>

                            <section className="projects-section">
                                <div className='manage-solution-header'>
                                    <h3>Projects and Images for Target {state.solutionData.selectedTarget?.name}{state.solutionData.selectedTarget?.selectedSet && `@${state.solutionData.selectedTarget?.selectedSet}`}</h3>
                                    <a title="Configure Related Projects" href="https://open-cmsis-pack.github.io/cmsis-toolbox/build-overview/#configure-related-projects" className="codicon codicon-link-external codicon-fix-size-sub"></a>
                                </div>
                                <ProjectsTable
                                    projects={state.solutionData.projects}
                                    images={state.solutionData.images}
                                    availableCores={state.solutionData.availableCoreNames}
                                    updateSolutionData={updateSolutionData}
                                    openFile={openFile}
                                    addProject={addProject}
                                    addImage={addImage}
                                    unlinkImage={unlinkImage}
                                />
                            </section>

                            <section className="debug-adapter">
                                <div className='manage-solution-header'>
                                    <h3>Debug Adapter for Target {state.solutionData.selectedTarget?.name}{state.solutionData.selectedTarget?.selectedSet && `@${state.solutionData.selectedTarget?.selectedSet}`}</h3>
                                    <a title="Debugger Configuration" href="https://open-cmsis-pack.github.io/cmsis-toolbox/YML-Input-Format/#debugger-configuration" className="codicon codicon-link-external codicon-fix-size-sub"></a>
                                </div>

                                <table>
                                    <tbody>
                                        <tr>
                                            <td>
                                                {showCoreSelector && <h4>Debug Adapter</h4>}
                                                <Flex vertical={false} gap={8}>
                                                    <Checkbox checked={hasDebugger} className='hasDebugAdapter' onChange={toggleDebugger}></Checkbox>
                                                    <Flex vertical={true}>
                                                        <CompactDropdown
                                                            available={state.debugAdapters.map(adapter => adapter.name)}
                                                            selected={state.debugger || 'None'}
                                                            onChange={selectDebugger}
                                                            className="debug-adapter-dropdown"
                                                            style={{ minWidth: '250px' }}
                                                            warning={hasDebugger && state.debugAdapters.every(da => da.name !== state.debugger) && 'Select a registered debug adapter from drop down'}
                                                        />
                                                    </Flex>
                                                </Flex>
                                            </td>
                                            {showCoreSelector && <td>
                                                <h4>Start Processor</h4>
                                                <CompactDropdown
                                                    disabled={!hasDebugger}
                                                    available={state.solutionData.availableCoreNames}
                                                    selected={selectedDebugAdapter['start-pname'] as string || state.solutionData.availableCoreNames.at(0) || ''}
                                                    className="start-processor-dropdown"
                                                    style={{ minWidth: '130px' }}
                                                    onChange={value => {
                                                        props.messageHandler.push({ type: 'SET_START_PROCESSOR', value });
                                                    }}
                                                />
                                            </td>
                                            }
                                            <td>
                                                {showCoreSelector && <h4>&nbsp;</h4>}
                                                <span title='Automatically update launch.json and task.json when saving the configuration'>
                                                    <Checkbox checked={state.autoUpdate} className='autoUpdate' onChange={changeAutoUpdate}>Update launch.json and tasks.json</Checkbox>
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <Tabs
                                    tabPosition='left'
                                    style={{ width: '100%' }}
                                    renderTabBar={(props, DefaultTabBar) => (
                                        <DefaultTabBar {...props} style={{ fontWeight: 'normal' }}>
                                            {(node) => React.cloneElement(node, {
                                                style: {
                                                    ...node.props.style,
                                                    minWidth: '10rem',
                                                    fontWeight: props.activeKey === node.key ? 'bold' : 'normal'
                                                },
                                            })}
                                        </DefaultTabBar>
                                    )}
                                    items={adapter?.['user-interface']?.map((section) => {
                                        const blurOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => (e.target as HTMLInputElement).blur();

                                        const pnameWrapper = (section: UISection, option: UISectionChildren, element: React.JSX.Element): React.JSX.Element => {
                                            if (section['pname-options'] !== undefined && showCoreSelector) {
                                                return (
                                                    <Row key={`pname-${section.section}-${element.key}-${option.pname}`}>
                                                        <Col span={4} style={{ paddingLeft: '8px', alignContent: 'center' }}>
                                                            {option.pname || ''}:
                                                        </Col>
                                                        <Col span={20}>
                                                            {element}
                                                        </Col>
                                                    </Row>
                                                );
                                            }
                                            return element;
                                        };

                                        const getPropertyControl = (o: UISectionChildren): React.JSX.Element => {
                                            return (
                                                <div key={`option-${section.section}-${o.name}`} className='section-control' title={o.description || ''}>{(() => {
                                                    const k = keyFor(section, o);
                                                    switch (o.type) {
                                                        case 'number':
                                                            return (
                                                                <InputNumber
                                                                    addonBefore={o.name}
                                                                    value={localValues[k] as number}
                                                                    onPressEnter={blurOnEnter}
                                                                    onChange={(val) => {
                                                                        if (val !== null) setLocalValues(prev => ({ ...prev, [k]: val }));
                                                                    }}
                                                                    onBlur={() => {
                                                                        const displayVal = localValues[k];
                                                                        const numericDisplay = typeof displayVal === 'string' ? parseFloat(displayVal) : (displayVal as number);
                                                                        const fallback = o.default ?? o.range?.[1] ?? 0;
                                                                        const clamped = Math.min(Math.max(Number.isFinite(numericDisplay) ? numericDisplay : fallback, o.range?.[0] ?? -Infinity), o.range?.[1] ?? Infinity);
                                                                        sendDebugAdapterProperty(section['yml-node'], o['yml-node'], clamped, o.scale); // commit (unscaled inside helper)
                                                                    }}
                                                                    min={o.range?.[0]}
                                                                    max={o.range?.[1]}
                                                                    title={o.description}
                                                                />
                                                            );
                                                        case 'string':
                                                            return (
                                                                <Input
                                                                    addonBefore={o.name}
                                                                    value={(localValues[k] as string) ?? ''}
                                                                    onPressEnter={blurOnEnter}
                                                                    onChange={e => setLocalValues(prev => ({ ...prev, [k]: e.target.value }))}
                                                                    onBlur={() => { sendDebugAdapterProperty(section['yml-node'], o['yml-node'], (localValues[k] as string) ?? ''); }}
                                                                    title={o.description}
                                                                />
                                                            );
                                                        case 'file':
                                                            return (
                                                                <Input
                                                                    addonBefore={o.name}
                                                                    addonAfter={<Button type="primary" className='file-button' onClick={selectFile}> Browse</Button>}
                                                                    value={(localValues[k] as string) ?? ''}
                                                                    data-yml-node={o['yml-node']}
                                                                    data-option-path-type={o['path-type']}
                                                                    onPressEnter={blurOnEnter}
                                                                    onChange={(e) => {
                                                                        setLocalValues(prev => ({ ...prev, [k]: e.target.value }));
                                                                        // immediate commit for file path edits
                                                                        sendDebugAdapterProperty(section['yml-node'], o['yml-node'], e.target.value);
                                                                    }}
                                                                    title={o.description}
                                                                />
                                                            );
                                                        case 'enum': {
                                                            const valueMap = new Map(o.values.map(v => [v.value, v]));
                                                            const stringValue = (localValues[k] as string);
                                                            return (
                                                                <CompactDropdown
                                                                    addonBefore={o.name}
                                                                    available={[...valueMap.keys()]}
                                                                    displayText={(value) => valueMap.get(value)?.name || value}
                                                                    tagLabels={[...valueMap.values()].map(v => v.description ?? '')}
                                                                    selected={stringValue ?? ''}
                                                                    warning={!valueMap.has(stringValue) && `Value '${stringValue}' not in enum options`}
                                                                    onChange={(value) => {
                                                                        setLocalValues(prev => ({ ...prev, [k]: value }));
                                                                        sendDebugAdapterProperty(section['yml-node'], o['yml-node'], value, undefined, o.pname);
                                                                    }}
                                                                    title={o.description}
                                                                />
                                                            );
                                                        }
                                                        default:
                                                            return <span>Unsupported property type</span>;
                                                    }
                                                })()}
                                                </div>
                                            );
                                        };

                                        const getSectionLabel = (): React.JSX.Element => {
                                            return <>
                                                <span className='section-checkbox'>
                                                    {section.select !== undefined && (
                                                        <Checkbox checked={section.select} onClick={() => toggleSection(section['yml-node'] || section.section.toLocaleLowerCase())} />
                                                    )}
                                                </span>
                                                <span className='section-label' title={section.description || ''}>
                                                    {section.section}
                                                </span>
                                            </>;
                                        };
                                        return {
                                            label: getSectionLabel(),
                                            key: section.section,
                                            disabled: false,
                                            children: section?.options?.map(option => pnameWrapper(section, option, getPropertyControl(option)))
                                        };
                                    })}
                                />
                            </section>
                        </section>

                    </Spin>
                </ConfigProvider>
            </div>
        </React.StrictMode >
    );
};
