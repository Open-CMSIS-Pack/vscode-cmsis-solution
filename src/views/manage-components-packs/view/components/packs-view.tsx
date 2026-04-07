/**
 * Copyright (C) 2025-2026 Arm Limited
 */

import React from 'react';
import './packs-view.css';
import { CloseCircleOutlined, EditFilled, LoadingOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Col, Row, Spin, Table, TableColumnsType, Tooltip, Input, Checkbox } from 'antd';
import { PackRowDataType } from '../../data/component-tools';
import { ArmEmpty } from './arm-empty';
import { ComponentsState } from '../state/reducer';
import { parsePackId } from '../../data/pack-parse';
import { MessageHandler } from '../../../message-handler';
import { IncomingMessage, OutgoingMessage } from '../../messages';
import { PackPropertiesDialog } from './pack-properties';
import { ComponentPackTargetSelect } from './component-pack-target-select';
import { buildAllOrigins } from '../helpers/components-packs-helpers';

const { Search } = Input;

interface PacksProps {
    state: ComponentsState;
    openFile: (link: string, external?: boolean, focusOn?: string) => void;
    messageHandler: MessageHandler<IncomingMessage, OutgoingMessage>;
    availablePacks: Record<string, string>;
}

export const PacksView: React.FC<PacksProps> = ({ state, openFile, messageHandler, availablePacks }) => {
    const [selectedPack, setSelectedPack] = React.useState<PackRowDataType | undefined>(undefined);
    const [searchText, setSearchText] = React.useState<string>('');

    const selectPack = React.useCallback((record: PackRowDataType | undefined) => {
        if (!record) {
            setSelectedPack(undefined);
            return;
        }

        const recordPack = parsePackId(record.key);
        let latestOnlineVersion: string | undefined;

        for (const packId of Object.keys(availablePacks ?? {})) {
            const pack = parsePackId(packId);
            if (pack?.vendor === recordPack?.vendor && pack?.packName === recordPack?.packName) {
                latestOnlineVersion = pack?.version;
                break;
            }
        }

        setSelectedPack({
            ...record,
            latestOnlineVersion,
        });
    }, [availablePacks]);

    const columns: TableColumnsType<PackRowDataType> = React.useMemo(() => {
        const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            e.stopPropagation();
            openFile(e.currentTarget.getAttribute('href') || '', false);
        };

        const renderPackColumn = (_value: string, record: PackRowDataType) => {
            const pack = parsePackId(record.packId);

            const referencedFrom = [
                <div key='pack-name'>{record.name}</div>,
                ...(record.references?.map((ref, index) => {
                    const p = parsePackId(ref.pack);
                    return (<div key={index}>in: <a title={'Edit File'} onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (ref.origin) {
                            openFile(ref.origin, false, `- pack: ${ref.pack}`);
                        }
                        return false;
                    }}><EditFilled /></a> ./{ref.relOrigin} <span className='faded'>({p?.versionOperator}{p?.version ?? pack?.version})</span></div>);
                })) ?? []
            ];

            return (
                <div className='pack-name-cell'>
                    <span>
                        {record.references && record.references.length > 0 ? (
                            <Tooltip title={referencedFrom} placement='bottomLeft'>
                                <span>{record.name}</span>
                            </Tooltip>
                        ) : (
                            <Tooltip title={record.name}>{record.name}</Tooltip>
                        )}
                    </span>
                </div>
            );
        };

        const renderEditColumn = (record: PackRowDataType) => {
            const indeterminate = record.references.length > 0;
            return (
                <div className='packs-edit-cell' onClick={() => selectPack(record)}>
                    <Checkbox
                        className='packs-select-checkbox'
                        indeterminate={indeterminate}
                        tabIndex={-1}
                        aria-readonly='true'
                    />
                    <Button
                        variant='text'
                        icon={<SettingOutlined />}
                        color='primary'
                        onClick={() => selectPack(record)}
                    />
                </div>
            );
        };

        const renderDescriptionCell = (value: string, record: PackRowDataType) => {
            return record.overviewLink ?
                <>
                    <span className="codicon codicon-book packs-description-cell"></span>
                    &nbsp;
                    <a onClick={handleClick} href={record.overviewLink} title={`Open Overview for ${record.name}`}>{value}</a>
                </>
                : <span>{value}</span>;
        };

        const renderVersionTarget = (_value: string, record: PackRowDataType) => {
            const version = record.versionUsed.replaceAll('@', '');
            return (
                <span>
                    {version}
                </span>
            );
        };

        return [
            { title: 'Software Pack', dataIndex: 'name', key: 'name', width: 240, ellipsis: true, render: renderPackColumn },
            { title: 'Select', render: (record: PackRowDataType) => renderEditColumn(record), width: 64 },
            { title: 'Version', dataIndex: 'versionTarget', key: 'versionTarget', minWidth: 120, ellipsis: false, render: renderVersionTarget },
            { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true, render: renderDescriptionCell },
        ];
    }, [openFile, selectPack]);


    // pack properties dialog was closed
    const packSelected = (confirmed: boolean, updated?: PackRowDataType, unlockOf?: string) => {
        if (confirmed) {
            if (selectedPack && updated) {
                updated.references.forEach(ref => {
                    if (ref.selected) {
                        messageHandler.push({ type: 'SELECT_PACKAGE', target: ref.path || '', packId: ref.pack });
                    } else {
                        messageHandler.push({ type: 'UNSELECT_PACKAGE', target: ref.path || '', packId: ref.pack });
                    }
                });
            }
            if (unlockOf) {
                messageHandler.push({ type: 'UNLINK_PACKAGE', packName: unlockOf });
            }
        }
        selectPack(undefined);
    };

    const referenceFromContext = (relativePath: string, pack: PackRowDataType): PackRowDataType['references'] => {
        return pack.references.filter(ref => ref.relOrigin.endsWith(relativePath));
    };

    const allOrigins = React.useMemo(
        () => {
            const currentProjectTargetType = state.availableTargetTypes.find(t => t.path == state.selectedProject?.projectId);
            if (!currentProjectTargetType) {
                return [];
            }
            return buildAllOrigins(selectedPack, state.solution, currentProjectTargetType);
        },
        [state.availableTargetTypes, state.solution, state.selectedProject?.projectId, selectedPack],
    );

    const onSearch = (value: string) => {
        setSearchText(value);
    };

    const filteredPacks = React.useMemo(() => {
        const packs = state.packs ?? [];
        const query = searchText.trim().toLowerCase();
        if (!query) {
            return packs;
        }

        return packs.filter(pack => {
            const haystack = [
                pack.name,
                pack.packId,
                pack.description,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(query);
        });
    }, [state.packs, searchText]);

    const rowClassName = (record: PackRowDataType): string => {
        const relativePath = state.selectedTargetType?.relativePath || '';
        const selectedInCurrentTarget = referenceFromContext(relativePath, record).length > 0;

        return !selectedInCurrentTarget ? '' : 'ant-table-row-disabled';
    };

    return (
        <>
            <Row className='packs-view-filter'>
                <Col>
                    <Button
                        disabled={true}
                        className='resolve-packs-button'
                        icon={<CloseCircleOutlined />}
                    >
                        Resolve
                    </Button>
                </Col>
                <Col flex={'350px'}>
                    <ComponentPackTargetSelect state={state} messageHandler={messageHandler} />
                </Col>
                <Col flex={'auto'}>
                    <Search
                        placeholder='Search packs'
                        allowClear
                        onSearch={onSearch}
                        onChange={(e) => {
                            // Keep the filter in sync when using allowClear.
                            if (e.target.value === '') {
                                setSearchText('');
                            }
                        }}
                        className='search-packs-input'
                    />
                </Col>
            </Row >
            <div className='packs-view-root'>
                <Spin spinning={state.stateMessage !== undefined} tip={state.stateMessage} indicator={<LoadingOutlined spin={true} />} size='large'>
                    <Table<PackRowDataType>
                        tableLayout='auto'
                        dataSource={filteredPacks}
                        columns={columns}
                        scroll={{ y: 'calc(100vh - 180px)' }}
                        rowClassName={(record) => rowClassName(record)}
                        pagination={false}
                        bordered={false}
                        // onRow={(record) => {
                        //     return {
                        //         onClick: () => { setSelectedPack(record); }
                        //     };
                        // }}
                        size='small'
                        locale={{ emptyText: <ArmEmpty armCodiconIcon='&#xea62;' /> }}
                    />
                </Spin>
            </div>
            <PackPropertiesDialog
                pack={selectedPack}
                allOrigins={allOrigins}
                openFile={openFile}
                state={{ unlilnkRequestStack: state.unlilnkRequestStack, selectedTargetType: state.selectedTargetType }}
                cbuildPackPath={state.cbuildPackPath}
                onClose={(confirmed, updated, unlockOf) => packSelected(confirmed, updated, unlockOf)}
            />
        </>
    );
};
