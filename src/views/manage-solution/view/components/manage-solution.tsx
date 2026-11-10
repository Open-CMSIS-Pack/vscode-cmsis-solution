/**
 * Copyright 2024-2026 Arm Limited
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

import './manage-solution.css';
import '../../../common/style/antd-overrides.css';
import { LoadingOutlined } from '@ant-design/icons';
import { Button, Checkbox, CheckboxChangeEvent, Col, ConfigProvider, Flex, Input, InputNumber, Row, Space, Spin, Tabs, theme } from 'antd';
import * as React from 'react';
import { UISection, UISectionChildren } from '../../../../debug/debug-adapters-yaml-file';
import { CompactDropdown } from '../../../common/components/compact-dropdown';
import { useVSCodeTheme } from '../../../hooks/use-vscode-theme';
import { MessageHandler } from '../../../message-handler';
import { IncomingMessage, OutgoingMessage } from '../../messages';
import { GenericPropertyList } from '../state/manage-solution-state';
import { SolutionUpdateAction, contextUpdateReducer, editablePropertyKey, initialState, manageSolutionReducer } from '../state/reducer';
import { ProjectsTable } from './projects-table';
import { TargetsTable } from './targets-table';
import { PathType } from '../../types';
import { CmsisCodicon } from '../../../common/components/cmsis-codicon';
import { useDisableContextMenu } from '../../../hooks/use-disable-context-menu';
import { DebugAdapterSectionLabel } from './debug-adapter-subsections';

/** Keeps tab identities stable and safe for the DOM selectors used by Ant Design. */
function sectionTabKey(path: string[]): string {
    return `section-${Array.from(JSON.stringify(path), character => character.codePointAt(0)!.toString(16).padStart(6, '0')).join('')}`;
}

type DebugAdapterTab = NonNullable<React.ComponentProps<typeof Tabs>['items']>[number];

export interface ManageSolutionProps {
    messageHandler: MessageHandler<IncomingMessage, OutgoingMessage>;
}

type PendingFileSelection = {
    service: string | undefined;
    key: string;
    localValueKey: string;
    subsection?: string[];
    pname?: string;
};

type SelectFileContext = {
    service: string | undefined;
    key: string;
    localValueKey: string;
    title?: string;
    defaultUri?: string;
    pathType?: PathType;
    subsection?: string[];
    pname?: string;
};

export const manageSolutionTargetDocsUrl = 'https://mdk-packs.github.io/vscode-cmsis-solution-docs/manage_settings.html';

export const ManageSolution = (props: ManageSolutionProps) => {
    const [state, dispatch] = React.useReducer(manageSolutionReducer, initialState);
    const pendingFileSelections = React.useRef<Map<string, PendingFileSelection>>(new Map());

    const adapter = React.useMemo(
        () => state.debugAdapters.find(adapter => adapter.name === state.debugger),
        [state.debugAdapters, state.debugger]
    );

    const keyFor = React.useCallback(
        (section: UISection | undefined, option: UISectionChildren | undefined, subsection?: string[]) =>
            editablePropertyKey(state.solutionData, state.debugger, section, option, subsection),
        [state.solutionData, state.debugger]
    );

    const ulRef = React.useRef<HTMLUListElement>(null);
    React.useEffect(() => {
        const m = new MutationObserver(() => {
            ulRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
        });
        m.observe(document.body, { childList: true, subtree: true });
        return () => m.disconnect();
    }, []);

    const isDarkTheme = useVSCodeTheme();
    useDisableContextMenu();

    React.useEffect(() => {
        props.messageHandler.push({ type: 'GET_CONTEXT_SELECTION_DATA' });
        props.messageHandler.push({ type: 'GET_DEBUG_ADAPTERS' });
        return props.messageHandler.subscribe(message => dispatch({ type: 'INCOMING_MESSAGE', message }));
    }, [props.messageHandler]);

    const openFile = React.useCallback(
        (path: string, external?: boolean) => props.messageHandler.push({ type: 'OPEN_FILE', path, external }),
        [props.messageHandler]
    );

    React.useEffect(() => {
        const handleFileSelected = (message: IncomingMessage) => {
            if (message.type !== 'FILE_SELECTED') {
                return;
            }

            const pendingSelection = pendingFileSelections.current.get(message.requestId);
            if (!pendingSelection) {
                return;
            }
            pendingFileSelections.current.delete(message.requestId);

            if (!message.data || message.data.length === 0) {
                return;
            }

            const selectedPath = message.data[0];
            dispatch({ type: 'EDIT_PROPERTY', key: pendingSelection.localValueKey, value: selectedPath });
            props.messageHandler.push({
                type: 'SET_DEBUG_ADAPTER_PROPERTY',
                service: pendingSelection.service,
                key: pendingSelection.key,
                value: selectedPath,
                ...(pendingSelection.subsection ? { subsection: pendingSelection.subsection } : {}),
                ...(pendingSelection.pname ? { pname: pendingSelection.pname } : {}),
            });
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

    const changeAutoUpdate = React.useCallback((e: CheckboxChangeEvent) => {
        props.messageHandler.push({ type: 'SET_AUTO_UPDATE', value: e.target.checked });
        dispatch({ type: 'INCOMING_MESSAGE', message: { type: 'AUTO_UPDATE', data: e.target.checked } });
    }, [props.messageHandler]);

    const selectedDebugAdapter = React.useMemo(() => (
        state.solutionData.selectedTarget?.targetSets
            ?.find(({ name }) => name === (state.solutionData.selectedTarget?.selectedSet || ''))
            ?.debugger as GenericPropertyList || {}
    ), [state.solutionData.selectedTarget?.targetSets, state.solutionData.selectedTarget?.selectedSet]);

    /** Sends stored-unit field values, shifting decimal exponents to avoid artifacts when scaling by powers of ten. */
    function sendDebugAdapterProperty(service: string | undefined, key: string, value: string | number, scale?: number, pname?: string, subsection?: string[]): void {
        if (typeof value === 'number' && scale) {
            const decimalExponent = Math.log10(scale);
            if (Number.isInteger(decimalExponent) && 10 ** decimalExponent === scale) {
                const [mantissa, exponent = '0'] = value.toString().split('e');
                value = Number(`${mantissa}e${Number(exponent) + decimalExponent}`);
            } else {
                value = value * scale;
            }
        }
        props.messageHandler.push({
            type: 'SET_DEBUG_ADAPTER_PROPERTY', service, key, value, pname,
            ...(subsection ? { subsection } : {}),
        });
    }

    const toggleDebugger = React.useCallback((e: CheckboxChangeEvent) => {
        props.messageHandler.push({ type: 'TOGGLE_DEBUGGER', value: e.target.checked });
    }, [props.messageHandler]);

    const toggleSection = React.useCallback((section: string) => {
        props.messageHandler.push({ type: 'TOGGLE_DEBUG_ADAPTER_SECTION', section });
    }, [props.messageHandler]);

    const hasDebugger = !!state.debugger;
    const configuredStartProcessor = selectedDebugAdapter['start-pname'] as string | undefined;
    const startProcessor = hasDebugger
        ? (configuredStartProcessor && state.solutionData.usedCoreNames.includes(configuredStartProcessor)
            ? configuredStartProcessor
            : state.solutionData.usedCoreNames.at(0))
        : undefined;

    const selectFile = React.useCallback((context: SelectFileContext) => {
        const requestId = `manage-solution-file-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        pendingFileSelections.current.set(requestId, {
            service: context.service,
            key: context.key,
            localValueKey: context.localValueKey,
            subsection: context.subsection,
            pname: context.pname,
        });

        props.messageHandler.push({
            type: 'SELECT_FILE',
            requestId,
            options: {
                canSelectMany: false,
                defaultUri: context.defaultUri,
                openLabel: 'Select File',
                title: context.title || 'Select File',
                filters: { 'All Files': ['*'] },
                pathType: context.pathType ?? 'relative'
            }
        });
    }, [props.messageHandler]);

    const showCoreSelector = state.solutionData.usedCoreNames.length > 1;
    const debugAdapterConfigurationDocsUrl = 'https://mdk-packs.github.io/vscode-cmsis-solution-docs/debug.html#configure-run-and-debug';
    const externalLink = (link: string, aria: string, external?: boolean): React.JSX.Element => {
        return (<Button
            color="default"
            variant="link"
            style={{ padding: '0px 12px' }}
            title={link}
            aria-label={aria}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openFile(link, external);
            }}
        >
            <CmsisCodicon name='link-external' style={{ fontSize: '1em', display: 'inline' }} />
        </Button>);
    };

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
                    <Spin spinning={state.busy} indicator={<LoadingOutlined spin={true} />} size='large'>
                        <section className="manage-solution-section">

                            <section className="targets-section">
                                <div className='manage-solution-header'>
                                    <h3>Manage Solution Target</h3>
                                    {externalLink(manageSolutionTargetDocsUrl, 'Manage Solution Target', true)}
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
                                    {externalLink('https://open-cmsis-pack.github.io/cmsis-toolbox/build-overview/#configure-related-projects', 'Configure Related Projects', true)}
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
                                    {externalLink(debugAdapterConfigurationDocsUrl, 'Debug Adapter Configuration', true)}
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
                                                    available={state.solutionData.usedCoreNames}
                                                    selected={startProcessor ?? ''}
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
                                    className='debug-adapter-settings'
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
                                    items={adapter?.['user-interface']?.flatMap((section) => {
                                        const rootSection = section.id ?? section['yml-node'] ?? section.section.toLocaleLowerCase();
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

                                        /** Renders a field for a static section or a dynamic subsection. */
                                        const getPropertyControl = (o: UISectionChildren, subsection?: string[], disabled = false): React.JSX.Element => {
                                            return (
                                                <div key={`option-${section.section}-${o.name}`} className='section-control' title={o.description || ''}>{(() => {
                                                    const k = keyFor(section, o, subsection);
                                                    const propertyValue = state.editableProperties[k]?.value;
                                                    const focusProperty = () => dispatch({ type: 'FOCUS_PROPERTY', key: k });
                                                    const blurProperty = () => dispatch({ type: 'BLUR_PROPERTY', key: k });
                                                    switch (o.type) {
                                                        case 'number':
                                                            return (
                                                                <InputNumber
                                                                    disabled={disabled}
                                                                    aria-label={o.name}
                                                                    addonBefore={o.name}
                                                                    value={propertyValue as number}
                                                                    onPressEnter={blurOnEnter}
                                                                    onFocus={focusProperty}
                                                                    onChange={(val) => {
                                                                        if (val !== null) dispatch({ type: 'EDIT_PROPERTY', key: k, value: val });
                                                                    }}
                                                                    onBlur={() => {
                                                                        blurProperty();
                                                                        if (!state.editableProperties[k]?.dirty) {
                                                                            return;
                                                                        }

                                                                        const displayVal = propertyValue;
                                                                        const numericDisplay = typeof displayVal === 'string' ? parseFloat(displayVal) : (displayVal as number);
                                                                        const fallback = o.default ?? o.range?.[1] ?? 0;
                                                                        const clamped = Math.min(Math.max(Number.isFinite(numericDisplay) ? numericDisplay : fallback, o.range?.[0] ?? -Infinity), o.range?.[1] ?? Infinity);
                                                                        const committed = Math.trunc(clamped);
                                                                        if (committed !== numericDisplay) {
                                                                            dispatch({ type: 'EDIT_PROPERTY', key: k, value: committed });
                                                                        }
                                                                        sendDebugAdapterProperty(subsection ? rootSection : section['yml-node'], o['yml-node'], committed, o.scale, o.pname, subsection);
                                                                    }}
                                                                    min={o.range?.[0]}
                                                                    max={o.range?.[1]}
                                                                    title={o.description}
                                                                />
                                                            );
                                                        case 'string':
                                                            return (
                                                                <Input
                                                                    disabled={disabled}
                                                                    addonBefore={o.name}
                                                                    value={(propertyValue as string) ?? ''}
                                                                    onPressEnter={blurOnEnter}
                                                                    onFocus={focusProperty}
                                                                    onChange={e => dispatch({ type: 'EDIT_PROPERTY', key: k, value: e.target.value })}
                                                                    onBlur={() => {
                                                                        blurProperty();
                                                                        sendDebugAdapterProperty(subsection ? rootSection : section['yml-node'], o['yml-node'], (propertyValue as string) ?? '', undefined, o.pname, subsection);
                                                                    }}
                                                                    title={o.description}
                                                                />
                                                            );
                                                        case 'file':
                                                            return (
                                                                <Input
                                                                    disabled={disabled}
                                                                    addonBefore={<>{o.name}</>}
                                                                    addonAfter={
                                                                        <Space size={0}>
                                                                            <Button aria-label='Open File' icon={<CmsisCodicon name='go-to-file' title='Go to file' />} disabled={!propertyValue} onClick={() => { openFile(propertyValue as string); }} type='text' className='file-open-icon-button' />
                                                                            <Button
                                                                                type='primary'
                                                                                className='file-button'
                                                                                aria-label='Select File'
                                                                                disabled={disabled}
                                                                                onClick={() => selectFile({
                                                                                    service: subsection ? rootSection : section['yml-node'],
                                                                                    key: o['yml-node'],
                                                                                    localValueKey: k,
                                                                                    title: o.description || 'Select File',
                                                                                    defaultUri: (propertyValue as string) ?? '',
                                                                                    pathType: o['path-type'],
                                                                                    subsection,
                                                                                    pname: o.pname,
                                                                                })}
                                                                            >Browse</Button>
                                                                        </Space>
                                                                    }
                                                                    value={(propertyValue as string) ?? ''}
                                                                    data-yml-node={o['yml-node']}
                                                                    data-option-path-type={o['path-type']}
                                                                    onPressEnter={blurOnEnter}
                                                                    onFocus={focusProperty}
                                                                    onBlur={blurProperty}
                                                                    onChange={(e) => {
                                                                        dispatch({ type: 'EDIT_PROPERTY', key: k, value: e.target.value });
                                                                        // immediate commit for file path edits
                                                                        sendDebugAdapterProperty(subsection ? rootSection : section['yml-node'], o['yml-node'], e.target.value, undefined, o.pname, subsection);
                                                                    }}
                                                                    title={o.description}
                                                                />
                                                            );
                                                        case 'enum': {
                                                            const valueMap = new Map(o.values.map(v => [v.value, v]));
                                                            const stringValue = propertyValue as string;
                                                            return (
                                                                <CompactDropdown
                                                                    disabled={disabled}
                                                                    addonBefore={o.name}
                                                                    available={[...valueMap.keys()]}
                                                                    displayText={(value) => valueMap.get(value)?.name || value}
                                                                    tagLabels={[...valueMap.values()].map(v => v.description ?? '')}
                                                                    selected={stringValue ?? ''}
                                                                    warning={!valueMap.has(stringValue) && `Value '${stringValue}' not in enum options`}
                                                                    onChange={(value) => {
                                                                        dispatch({ type: 'EDIT_PROPERTY', key: k, value });
                                                                        sendDebugAdapterProperty(subsection ? rootSection : section['yml-node'], o['yml-node'], value, undefined, o.pname, subsection);
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

                                        /** Flattens a settings tree into navigation tabs while retaining its path and disabled ancestors. */
                                        const renderSection = (node: UISection, path: string[] = [], parentDisabled = false): DebugAdapterTab[] => {
                                            const disabled = parentDisabled || node.select === false;
                                            const subsection = path.length > 0 ? path : undefined;
                                            const tab: DebugAdapterTab = {
                                                key: sectionTabKey([rootSection, ...path]),
                                                label: <DebugAdapterSectionLabel
                                                    section={node}
                                                    rootSection={rootSection}
                                                    path={path}
                                                    disabled={parentDisabled}
                                                    onToggle={() => toggleSection(rootSection)}
                                                    messageHandler={props.messageHandler}
                                                />,
                                                children: <>
                                                    {node.options.map(option => pnameWrapper(node, option, getPropertyControl(option, subsection, path.length > 0 && disabled)))}
                                                    {node.subsections && <div className='description'>
                                                        {node.subsections.length > 0
                                                            ? 'Select an item to configure its settings.'
                                                            : node.addOptions && 'Use + to add an item.'}
                                                    </div>}
                                                </>,
                                            };
                                            const children = node.subsections?.flatMap(child => renderSection(
                                                child,
                                                [...path, child.id ?? child['yml-node'] ?? child.section],
                                                disabled,
                                            )) ?? [];
                                            return [tab, ...children];
                                        };

                                        return renderSection(section);
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
