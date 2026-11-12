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
import * as React from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Spin, theme } from 'antd';
import type { MessageHandler } from '../../../message-handler';
import type { IncomingMessage, OutgoingMessage } from '../../messages';
import { useManageSolution } from '../state/use-manage-solution';
import { ProjectsTable } from './projects-table';
import { TargetsTable } from './targets-table';
import { CmsisCodicon } from '../../../common/components/cmsis-codicon';
import { AdapterHeader } from './adapter-header';
import { SettingsTree } from './settings-tree';

export interface ManageSolutionProps { messageHandler: MessageHandler<IncomingMessage, OutgoingMessage> }
export const manageSolutionTargetDocsUrl = 'https://mdk-packs.github.io/vscode-cmsis-solution-docs/manage_settings.html';

export const ManageSolution = ({ messageHandler }: ManageSolutionProps) => {
    const { state, settings, isDarkTheme, updateSelectedTarget, updateSolutionData, openFile,
        addContext, addProject, addImage, unlinkImage, settingsCallbacks } = useManageSolution(messageHandler);
    const debugAdapterConfigurationDocsUrl = 'https://mdk-packs.github.io/vscode-cmsis-solution-docs/debug.html#configure-run-and-debug';
    const externalLink = (link: string, aria: string, external?: boolean) => <Button
        color='default' variant='link' style={{ padding: '0px 12px' }} title={link} aria-label={aria}
        onClick={event => { event.stopPropagation(); openFile(link, external); }}>
        <CmsisCodicon name='link-external' style={{ fontSize: '1em', display: 'inline' }} />
    </Button>;

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

                                {settings.context && <>
                                    <AdapterHeader header={settings.context.snapshot.header} onAction={settings.act} />
                                    <SettingsTree sections={settings.context.snapshot.sections} activeId={settings.context.activeId}
                                        expanded={settings.context.expanded} drafts={settings.context.drafts} {...settingsCallbacks}
                                        onSelect={sectionId => settings.dispatch({ type: 'navigate', sectionId })}
                                        onExpand={sectionId => settings.dispatch({ type: 'expand', sectionId })} />
                                </>}
                            </section>
                        </section>

                    </Spin>
                </ConfigProvider>
            </div>
        </React.StrictMode >
    );
};
