/**
 * Copyright (C) 2025-2026 Arm Limited
 */

import { CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Col, Input, List, Row, Spin, Table, TableColumnsType, Tooltip } from 'antd';
import { ExpandableConfig } from 'antd/es/table/interface';
import * as React from 'react';
import { MessageHandler } from '../../../message-handler';
import { ComponentRowDataType } from '../../data/component-tools';
import { IncomingMessage, OutgoingMessage } from '../../messages';
import { rowClassName, validationIssuesTooltip, warningIcon } from '../helpers/components-packs-helpers';
import { ComponentsState } from '../state/reducer';
import { ArmEmpty } from './arm-empty';
import { ComponentPackTargetSelect } from './component-pack-target-select';
import { ComponentPropertiesDialog } from './component-properties';
import { renderDescriptionCell } from './table-renderers/render-description-cell';
import { renderEditField } from './table-renderers/render-edit-field';
import { renderNameCell } from './table-renderers/render-name-cell';
import { rowSelection } from './table-renderers/render-row-selector';
import { renderValidation } from './table-renderers/render-validation-row';
import { renderVariantCell } from './table-renderers/render-variant-cell';
import { hasValidation, renderWarningCell } from './table-renderers/render-warning-cell';
const { Search } = Input;

interface ComponentsViewProps {
    treeNodes: ComponentRowDataType[];
    state: ComponentsState;
    expandedRowKeys: string[];
    setExpandedRowKeys: React.Dispatch<React.SetStateAction<string[]>>;
    dropdownKey: number;
    setDropdownKey: React.Dispatch<React.SetStateAction<number>>;
    componentRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
    messageHandler: MessageHandler<IncomingMessage, OutgoingMessage>;
    validationErrorComponents: string[];
    onChangeComponentValue: (record: ComponentRowDataType) => void;
    onChangeComponentVariant: (record: ComponentRowDataType, variant: string) => void;
    onChangeBundle: (record: ComponentRowDataType, bundle: string) => void;
    openFile: (link: string, external?: boolean) => void;
    openDocFile: (link: string) => void;
    onSearch: (value: string) => void;
}

/**
 * Displays the components table and error messages list.
 * Contains the table configuration, columns, expandable rows, and error message display logic.
 */
export const ComponentsView: React.FC<ComponentsViewProps> = ({
    treeNodes,
    state,
    expandedRowKeys,
    setExpandedRowKeys,
    dropdownKey,
    setDropdownKey,
    componentRefs,
    messageHandler,
    validationErrorComponents,
    onChangeComponentValue,
    onChangeComponentVariant,
    onChangeBundle,
    openFile,
    openDocFile,
    onSearch
}) => {
    const onExpand = React.useCallback((expanded: boolean, record: ComponentRowDataType) => {
        setExpandedRowKeys(prevKeys => expanded
            ? [...prevKeys, record.key]
            : prevKeys.filter(key => key !== record.key));
    }, [setExpandedRowKeys]);

    const expandable: ExpandableConfig<ComponentRowDataType> = React.useMemo(() => ({
        fixed: 'left',
        expandRowByClick: true,
        indentSize: 16,
        expandIcon: ({ expanded, record }) => (
            record.children && record.children.length > 0 &&
            <span
                title={`${expanded ? 'Collapse' : 'Expand'} ${record.name}`}
                className={`group-toggle is-clickable codicon codicon-${expanded ? 'chevron-down' : 'chevron-right'}`}
                onClick={() => onExpand(!expanded, record)}
            />
        ),
        expandedRowRender: (record: ComponentRowDataType) => (
            record.validation?.result && hasValidation(record)
                ? renderValidation(
                    record,
                    expandedRowKeys,
                    setExpandedRowKeys,
                    state,
                    messageHandler,
                    dropdownKey,
                    setDropdownKey,
                    componentRefs
                )
                : <span className='empty-validation-row'></span>
        ),
        expandedRowKeys: expandedRowKeys,
        onExpand: onExpand
    }), [expandedRowKeys, state, messageHandler, dropdownKey, setDropdownKey, onExpand, setExpandedRowKeys, componentRefs]);

    const onRow = React.useCallback((record: ComponentRowDataType) => ({
        ref: (node: HTMLInputElement | null) => {
            componentRefs.current[record.key.split('@')[0]] = node ? node.querySelector('input[type=checkbox]') as HTMLInputElement : null;
        },
        tabIndex: -1
    }), [componentRefs]);

    const [selectedComponent, setSelectedComponent] = React.useState<ComponentRowDataType | undefined>(undefined);

    const columns: TableColumnsType<ComponentRowDataType> = React.useMemo(() => [
        Table.EXPAND_COLUMN,
        { title: 'Component', dataIndex: 'name', key: 'name', minWidth: 140, render: (value: string, record: ComponentRowDataType) => renderNameCell(value, record, openFile), ellipsis: false },
        { title: '', width: 40, render: (record: ComponentRowDataType) => renderWarningCell(record, state) },
        Table.SELECTION_COLUMN,
        { title: '', width: 40, render: (record: ComponentRowDataType) => renderEditField(record, setSelectedComponent, state) },
        { title: 'Variant', dataIndex: ['parsed', 'variant'], key: 'variant', minWidth: 60, render: (value: string, record: ComponentRowDataType, index: number) => renderVariantCell(value, record, index, onChangeBundle, onChangeComponentVariant), ellipsis: false },
        { title: 'Version', dataIndex: ['parsed', 'version'], key: 'version', minWidth: 60, ellipsis: false },
        { title: 'Vendor', dataIndex: ['parsed', 'vendor'], key: 'vendor', minWidth: 60, ellipsis: false },
        { title: 'Description', dataIndex: ['data', 'description'], key: 'data.description', width: 'calc(fit-content - 50px)', ellipsis: true, render: (value: string, record: ComponentRowDataType) => renderDescriptionCell(value, record, state, openDocFile) },
    ], [openFile, state, onChangeBundle, onChangeComponentVariant, openDocFile]);


    const componentSelected = (confirmed: boolean, updated?: ComponentRowDataType, original?: ComponentRowDataType) => {
        if (confirmed && selectedComponent && updated && original) {
            if (selectedComponent.aggregate.selectedCount !== updated.aggregate?.selectedCount) {
                onChangeComponentValue(updated);
            }
            if (selectedComponent.aggregate.activeVariant !== updated.aggregate?.activeVariant && updated.aggregate?.activeVariant) {
                onChangeComponentVariant(original, updated.aggregate.activeVariant);
            }
        }
        setSelectedComponent(undefined);
    };

    const onClickResolve = (_event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
        messageHandler.push({ type: 'RESOLVE_COMPONENTS' });
    };

    const hasErrors = state.errorMessages.some(m => m.type === 'ERROR');

    return (
        <>
            <Row className='components-view-filter'>
                <Col>
                    <Tooltip title={validationIssuesTooltip(validationErrorComponents, expandedRowKeys, setExpandedRowKeys, state.componentTree, 'resolve-button', componentRefs)}>
                        <Button
                            onClick={onClickResolve}
                            disabled={!validationErrorComponents.length}
                            icon={<CloseCircleOutlined style={{ color: validationErrorComponents.length ? 'var(--vscode-editorError-foreground)' : 'unset' }} />}
                            className='resolve-packs-button'
                        >
                            Resolve
                        </Button>
                    </Tooltip>
                </Col>
                <Col flex={'350px'}>
                    <ComponentPackTargetSelect state={state} messageHandler={messageHandler} />
                </Col>
                <Col flex={'auto'}>
                    <Search
                        placeholder='Search components'
                        allowClear
                        onSearch={onSearch}
                        style={{ width: '100%' }}
                    />
                </Col>
            </Row>
            <div className='components-view-root'>
                {(treeNodes.length > 0 || state.errorMessages.length === 0) && (
                    <Spin spinning={state.stateMessage !== undefined} tip={state.stateMessage} indicator={<LoadingOutlined spin={true} />} size='large'>
                        <Table<ComponentRowDataType>
                            tableLayout='auto'
                            columns={columns}
                            dataSource={treeNodes}
                            onRow={onRow}
                            rowSelection={{ ...rowSelection(treeNodes, onChangeComponentValue, state) }}
                            rowClassName={(record) => rowClassName(record, state)}
                            expandable={{ ...expandable }}
                            scroll={{ y: 'calc(100vh - 180px)' }}
                            pagination={false}
                            bordered={false}
                            size='small'
                            locale={{ emptyText: <ArmEmpty armCodiconIcon='&#xea62;' /> }}
                        />
                    </Spin>
                )}
                {hasErrors && <List style={{ padding: '30px' }}>
                    {(() => {
                        return state.errorMessages
                            .filter(m => hasErrors ? m.type === 'ERROR' : m.type !== 'ERROR') // filter out warning+info if there are errors
                            .slice()
                            .sort((a, b) => {
                                const typeOrder = { ERROR: 0, WARNING: 1, INFO: 2 };
                                const typeDiff = (typeOrder[a.type] ?? 3) - (typeOrder[b.type] ?? 3);
                                if (typeDiff !== 0) return typeDiff;
                                return a.message.localeCompare(b.message);
                            })
                            .map((error, index) => (
                                <List.Item key={index}>
                                    <List.Item.Meta
                                        description={
                                            <span className={`error-message ${error.type.toLowerCase()}`}>
                                                {warningIcon(error.type.toLowerCase() as 'warning' | 'error' | 'info')}
                                                {error.message}
                                            </span>
                                        }
                                    />
                                </List.Item>
                            ));
                    })()}
                </List>
                }

                <ComponentPropertiesDialog component={selectedComponent}
                    onClose={(confirmed, updated, original) => componentSelected(confirmed, updated, original)} />
            </div>
        </>
    );
};
