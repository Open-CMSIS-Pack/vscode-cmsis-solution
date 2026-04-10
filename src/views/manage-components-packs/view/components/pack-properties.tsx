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

import './components-properties.css';
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Col, Divider, Dropdown, Input, Modal, Row, Space, Tooltip } from 'antd';
import { OriginDataType, PackRowDataType, PackRowReferenceDataType } from '../../data/component-tools';
import DraggableModalWrapper from './draggable-modal-wrapper';
import { CompactDropdown } from '../../../common/components/compact-dropdown';
import { parsePackId } from '../../data/pack-parse';
import { EditFilled, MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { CmsisCodicon } from '../../../common/components/cmsis-codicon';
import { TargetSetData } from '../../components-data';

interface PackPropertiesDialogProperties {
    pack?: PackRowDataType;
    allOrigins?: OriginDataType[];
    state: { unlilnkRequestStack: string[], selectedTargetType?: TargetSetData };
    openFile?: (link: string, external?: boolean, focusOn?: string) => void;
    cbuildPackPath?: string,
    onClose: (confirmed: boolean, updated?: PackRowDataType, unlockOf?: string) => void;
}

export const PackPropertiesDialog: React.FC<PackPropertiesDialogProperties> = ({ pack: packProp, openFile: openFile, state: state, allOrigins: allOriginsProp, onClose, cbuildPackPath: cbuildPackPath }) => {
    const [pack, setPack] = useState<PackRowDataType | undefined>(packProp);
    const [allOrigins, setAllOrigins] = useState<OriginDataType[]>(allOriginsProp ?? []);
    const [unlockOf, setUnlockOf] = useState<string | undefined>(undefined);
    const none = 'Unspecified';

    const latestUpgradable = pack?.references.map(p => p.upgrade).sort().at(0) || '';

    const updateOrigin = useCallback((index: number, updater: (origin: OriginDataType) => OriginDataType) => {
        setAllOrigins(prev => prev.map((origin, i) => (i === index ? updater(origin) : origin)));
    }, []);

    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        setPack(packProp);
        setAllOrigins(allOriginsProp ?? []);
        setUnlockOf(state.unlilnkRequestStack.some(p => p === packProp?.name) ? packProp?.name : undefined);
        // Auto-adds the pack to references when opening the dialog and no references exist.
        if (packProp && allOriginsProp && !allOriginsProp.some(o => o.selected)) {
            const p = allOriginsProp.find(o => o.path === state.selectedTargetType?.path);
            if (p) {
                p.selected = true;
                p.versionOperator = '';
                p.version = '';
            }
        }
    }, [allOriginsProp, packProp, state]);
    /* eslint-enable react-hooks/set-state-in-effect */

    const handleOk = useCallback(() => {
        if (!pack) return;

        const references: PackRowReferenceDataType[] = allOrigins
            .map(o => ({
                origin: o.path,
                pack: `${pack.name}${o.versionOperator}${o.version}`,
                selected: o.selected,
                path: o.path,
                relOrigin: o.relativePath,
                resolvedPack: pack.packId,
            }));

        const updatedPack = { ...pack, references };

        setPack(updatedPack);
        onClose(true, updatedPack, unlockOf);
    }, [onClose, allOrigins, pack, unlockOf]);

    const handleCancel = useCallback(() => {
        onClose(false, undefined, unlockOf);
    }, [onClose, unlockOf]);

    const origins = allOrigins.filter(o => !o.selected).map((origin) => ({
        key: origin.label,
        label: (
            <div onClick={(e) => e.preventDefault()}>
                <span>{origin.label}</span>
            </div>
        ),
        extra: `(./${origin.relativePath})`,
        onClick: () => {
            updateOrigin(allOrigins.indexOf(origin), (o) => ({ ...o, selected: true, version: '', versionOperator: '' }));
        }
    }));

    const requestUnlock = () => {
        setUnlockOf(pack?.name);
    };

    const p = parsePackId(pack?.packId || '');
    const packUri = `https://www.keil.arm.com/packs/${p?.packName}-${p?.vendor}/versions/`.toLowerCase();
    const firstReferenceWithPath = pack?.references.find(reference => Boolean(reference.relPath?.trim()));
    const firstReferencePath = firstReferenceWithPath?.relPath?.trim();
    const versionOperators = firstReferencePath ? [none] : [none, '@', '@>=', '@^', '@~'];
    const versionTagLabels = firstReferencePath
        ? ['Latest installed version']
        : [
            'Latest installed version',
            'Exact version',
            'Equal or higher',
            'Equal or higher with same major version',
            'Equal or higher with same major and minor version'
        ];

    const latestInstalledPack = latestUpgradable ? `${pack?.name}@${latestUpgradable}` : pack?.packId;
    const hasNewerOnlineVersion = !!pack?.latestOnlineVersion && !latestInstalledPack?.endsWith(pack.latestOnlineVersion);
    const onlineTooltip = hasNewerOnlineVersion ? <div>Latest version available online: {pack.latestOnlineVersion}</div> : undefined;

    return (
        <Modal
            title={`Manage Pack: ${pack?.name}`}
            open={!!pack}
            onOk={handleOk}
            onCancel={handleCancel}
            closable={{ 'aria-label': 'Custom Close Button' }}
            keyboard={true}
            transitionName=""
            maskTransitionName=""
            maskClosable={false}
            modalRender={(modal) => <DraggableModalWrapper modal={modal} />}
        >
            {pack && (
                <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                    <Card title="Current References" size="small">
                        <div>
                            <table className='manage-component-properties-table'>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left' }}>CSolution Project File</th>
                                        <th colSpan={2} style={{ textAlign: 'left' }}>Version</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allOrigins.map((origin, index) => origin.selected ? (
                                        <tr key={origin.relativePath}>
                                            <td style={{ textAlign: 'left' }} title={`./${origin.relativePath}`}>
                                                <Button
                                                    icon={<MinusSquareOutlined />}
                                                    type='text'
                                                    title={`Remove reference from file ./${origin.relativePath}`}
                                                    onClick={() => updateOrigin(index, (o) => ({ ...o, selected: false }))}
                                                    style={{ paddingRight: '8px' }}
                                                />
                                                {origin.label}
                                                <div className='faded' style={{ paddingLeft: '31px', margin: '-7px 0' }}>{origin.relativePath}</div>
                                            </td>
                                            <td style={{ textAlign: 'left' }}>
                                                <CompactDropdown
                                                    style={{ minWidth: '50px', marginRight: '8px' }}
                                                    available={versionOperators}
                                                    unselectedLabel={none}
                                                    tagLabels={versionTagLabels}
                                                    selected={firstReferencePath ? none : origin.versionOperator}
                                                    onChange={(value) => {
                                                        updateOrigin(index, (o) => ({
                                                            ...o,
                                                            versionOperator: (value && value !== none)
                                                                ? value
                                                                : '',
                                                            version: value === none
                                                                ? ''
                                                                : (!o.version)
                                                                    ? parsePackId(pack.packId)?.version || '1.0.0'
                                                                    : o.version
                                                        }));
                                                    }}
                                                />
                                            </td>
                                            <td style={{ textAlign: 'left' }}>
                                                <Input
                                                    value={origin.version}
                                                    placeholder={firstReferencePath ? 'local pack' : (origin.versionOperator ? '' : 'see cbuild-pack.yml')}
                                                    disabled={!origin.versionOperator}
                                                    onChange={(e) => {
                                                        updateOrigin(index, (o) => ({ ...o, version: e.target.value ?? '' }));
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ) : null
                                    )}
                                </tbody>
                            </table>
                            <Divider />
                            <Dropdown menu={{ items: origins }} trigger={['click']} disabled={origins.length === 0}>
                                <Space>
                                    <PlusSquareOutlined /> Add Pack to CSolution Project File…
                                </Space>
                            </Dropdown>
                        </div>
                    </Card>
                    <Card size="small">
                        <table className='manage-component-properties-table'>
                            <tbody>
                                <tr><td>Used Pack:</td><td>{pack.packId}</td></tr>
                                <tr><td>Description:</td><td>{pack.description}</td></tr>
                                {firstReferencePath ? <tr><td>Path:</td><td>{firstReferencePath}</td></tr> : null}
                            </tbody>
                        </table>
                    </Card>
                    {!firstReferencePath && (
                        <Card title="Update Pack" size="small">
                            <Row>
                                <Col flex={3}>Latest Installed Pack:</Col>
                                <Col flex={5}>{latestInstalledPack}</Col>
                                <Col flex={1}>
                                    <Tooltip title={<span>Update and remove lock in <a onClick={() => { if (openFile && cbuildPackPath) openFile(cbuildPackPath, false); }}><EditFilled /></a>{cbuildPackPath} {unlockOf && <><br />Pending unlock request will be committed on save</>}</span>}>
                                        <Button
                                            type="text"
                                            disabled={latestInstalledPack === pack.packId || unlockOf === pack.name}
                                            style={{ border: unlockOf ? '1px dashed var(--vscode-foreground)' : 'none' }}
                                            onClick={requestUnlock}
                                            icon={<CmsisCodicon name="update-arrow" />}
                                        />
                                    </Tooltip>
                                </Col>
                                <Col flex={1}>
                                    <Tooltip title={<><div>Show pack history on web portal</div>{onlineTooltip}</>}>
                                        <Button
                                            type="text"
                                            style={{ color: onlineTooltip ? 'var(--vscode-list-warningForeground)' : undefined }}
                                            onClick={() => { if (openFile) openFile(packUri, true); }}
                                            icon={<CmsisCodicon name="version-history" />}
                                        />
                                    </Tooltip>
                                </Col>
                            </Row>
                        </Card>
                    )}
                </Space>
            )
            }
        </Modal >
    );
};
