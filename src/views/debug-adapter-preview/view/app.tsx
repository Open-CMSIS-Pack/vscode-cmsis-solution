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

import '../../manage-solution/view/components/manage-solution.css';
import '../../common/style/antd-overrides.css';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Button, ConfigProvider, Input, Select, theme } from 'antd';
import type { MessageHandler } from '../../message-handler';
import type { IncomingMessage, OutgoingMessage, PreviewState } from '../messages';
import { useVSCodeTheme } from '../../hooks/use-vscode-theme';
import { SettingsTree } from '../../manage-solution/view/components/settings-tree';
import { initialSettingsState, settingsReducer } from '../../manage-solution/view/state/settings-reducer';
import './preview.css';

/** Renders a document-bound sandbox with a simple searchable csolution device dropdown. */
export function Preview({ handler }: { handler: MessageHandler<IncomingMessage, OutgoingMessage> }): React.ReactElement {
    const [state, setState] = React.useState<PreviewState>();
    const [deviceContext, setDeviceContext] = React.useState('');
    const [settings, dispatch] = React.useReducer(settingsReducer, initialSettingsState);
    const sequence = React.useRef(0);
    const dark = useVSCodeTheme();
    const context = settings.contextId ? settings.contexts[settings.contextId] : undefined;

    React.useEffect(() => {
        let previousState: PreviewState | undefined;
        const unsubscribe = handler.subscribe(message => {
            if (message.type === 'STATE') {
                setState(message.state);
                if (previousState?.device !== message.state.device || previousState?.deviceContext !== message.state.deviceContext) {
                    setDeviceContext(message.state.deviceContext);
                }
                previousState = message.state;

                if (message.state.snapshot) {
                    dispatch({ type: 'snapshot', snapshot: message.state.snapshot });
                }
            } else {
                dispatch({ type: 'result', result: message.result });
            }
        });
        handler.push({ type: 'READY' });
        return unsubscribe;
    }, [handler]);

    /** Sends opaque production actions while retaining draft acknowledgement tracking. */
    function act(actionId: string, value?: string | number | boolean, fieldId?: string): void {
        if (!context || state?.error || state?.loading) {
            return;
        }
        const requestId = `preview-${++sequence.current}`;
        if (fieldId) {
            dispatch({ type: 'sent', requestId, fieldId });
        }
        handler.push({ type: 'ACTION', request: {
            contextId: context.snapshot.contextId,
            revision: context.snapshot.revision,
            actionId, requestId, value,
        } });
    }

    return (
        <ConfigProvider theme={{
            algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
            token: { fontSize: 13, sizeStep: 4, borderRadius: 3 },
        }}>
            <main className='manage-solution-frame debug-adapter-preview'>
                <h3>Debug Adapter UI Preview</h3>
                <p>Changes to controls affect temporary preview values. Edit the YAML to change the UI definition.</p>
                {!state && <p role='status'>Loading preview…</p>}
                {state && <>
                    <div className='preview-toolbar'>
                        <label>Adapter
                            <Select aria-label='Adapter' value={state.adapter || undefined} disabled={!!state.error}
                                options={state.adapters.map(name => ({ value: name, label: name }))}
                                onChange={name => handler.push({ type: 'ADAPTER', name })} />
                        </label>
                        <label>Device
                            <Select aria-label='Device' showSearch allowClear loading={state.loading} disabled={state.loading}
                                placeholder='Search device ID or name' value={state.device || undefined}
                                options={state.devices.map(device => ({ value: device.id, label: device.name === device.id ? device.id : `${device.id} (${device.name})` }))}
                                filterOption={(input, option) => String(option?.label ?? '').toLocaleLowerCase().includes(input.toLocaleLowerCase())}
                                onChange={id => handler.push({ type: 'DEVICE', id: id ?? '' })} />
                        </label>
                        <Button disabled={!!state.error || state.loading} onClick={() => handler.push({ type: 'RESET' })}>Reset preview</Button>
                        <Button onClick={() => handler.push({ type: 'REVEAL' })}>Show YAML source</Button>
                    </div>
                    {state.processors.length > 1 && <label className='preview-processors'>Used processors
                        <Select aria-label='Used processors' mode='multiple' value={state.usedProcessors} disabled={!!state.error || state.loading}
                            options={state.processors.map(name => ({ value: name, label: name }))}
                            onChange={names => handler.push({ type: 'PROCESSORS', names })} />
                    </label>}
                    {state.deviceError && <p role='alert'>{state.deviceError}</p>}
                    {state.error && <p role='alert'>{state.error}{context && ' Showing the last valid preview.'}</p>}
                    <fieldset className='debug-adapter preview-controls' aria-label='Settings' disabled={!!state.error || state.loading}>
                        {context && <SettingsTree sections={context.snapshot.sections} activeId={context.activeId}
                            expanded={context.expanded} drafts={context.drafts}
                            onSelect={sectionId => dispatch({ type: 'navigate', sectionId })}
                            onExpand={sectionId => dispatch({ type: 'expand', sectionId })}
                            onEdit={(fieldId, value) => dispatch({ type: 'edit', fieldId, value })}
                            onFocus={(fieldId, focused) => dispatch({ type: 'focus', fieldId, focused })}
                            onAction={act} />}
                        {!context?.snapshot.sections.length && <p>No UI sections to display.</p>}
                    </fieldset>
                    <details><summary>Generated debugger YAML</summary><pre>{state.yaml}</pre></details>
                    <details>
                        <summary>Device context</summary>
                        <p>Device edits are temporary and never saved. Selecting a device discards these edits.</p>
                        <Input.TextArea aria-label='Device context' className='preview-context-editor' rows={16}
                            value={deviceContext} disabled={!!state.error || state.loading}
                            onChange={event => setDeviceContext(event.target.value)} />
                        {state.contextError && <p role='alert'>{state.contextError} The last valid device context is still in use.</p>}
                        <Button disabled={!!state.error || state.loading || (deviceContext === state.deviceContext && !state.contextError)}
                            onClick={() => handler.push({ type: 'DEVICE_CONTEXT', text: deviceContext })}>Apply device context</Button>
                    </details>
                    <details><summary>Preview context</summary><pre>{state.context}</pre></details>
                </>}
            </main>
        </ConfigProvider>
    );
}

/** Mounts the dedicated preview application after its assets load. */
export function start(handler: MessageHandler<IncomingMessage, OutgoingMessage>): void {
    const container = document.createElement('div');
    document.body.appendChild(container);
    createRoot(container).render(<Preview handler={handler} />);
}
