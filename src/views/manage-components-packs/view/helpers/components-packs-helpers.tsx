/**
 * Copyright (C) 2025-2026 Arm Limited
 */

import React from 'react';
import { componentNiceName, ComponentRowDataType, ComponentScope, OriginDataType, PackRowDataType, parseBuildContextName, ValidationResultCodes } from '../../data/component-tools';
import { TargetSetData } from '../../components-data';
import SimpleList from '../../../common/components/simple-list';
import { Space } from 'antd';
import { flatTree } from '../../data/component-tree';
import { parseComponentId } from '../../data/component-parse';
import { Pack, PackReference } from '../../../../json-rpc/csolution-rpc-client';
import { parsePackId } from '../../data/pack-parse';
import { ComponentsState } from '../state/reducer';
import { SolutionInfo } from '../../messages';

export const getValidationMessage = (record: ComponentRowDataType, state: { componentScope: string }): string => {
    const message = ValidationResultCodes[record.validation?.result as keyof typeof ValidationResultCodes] || 'Unknown validation result';
    return message
        .replaceAll('<id>', componentNiceName(record.data.id))
        .replaceAll('<version>', ` ${record.parsed.version || 'unknown version'}`)
        .replaceAll('<packs>', state?.componentScope === ComponentScope.All ? 'installed packs' : record.data.pack || 'packs included in project')
        .replaceAll('<pack_id>', ` ${record.data.pack || 'unknown version'}`)
        || '';
};

/**
 * Generates the tooltip text for the resolve button.
 * @param validationErrorComponents List of validation error components.
 * @returns JSX for the tooltip.
 */
export const validationIssuesTooltip = (
    validationErrorComponents: string[],
    expandedRowKeys: string[],
    setExpandedRowKeys: React.Dispatch<React.SetStateAction<string[]>>,
    componentTree: ComponentRowDataType[],
    keyContext: string,
    componentRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>
): React.ReactNode => {
    if (!validationErrorComponents.length) {
        return <>No components with validation errors</>;
    }
    const plural = validationErrorComponents.length !== 1 ? 's' : '';
    // Use a map for fast lookup and avoid O(n^2) search
    const validatedComponents = validationErrorComponents.map(c => {
        const id = c;
        const name = c.indexOf('/') > 0 ? c.split('/')[1] : c;
        return { title: componentNiceName(name), id };
    });
    // Build a lookup for quick update
    const validatedMap = new Map(validatedComponents.map(item => [item.id, item]));
    flatTree(componentTree)
        .filter(c => c.validation)
        .forEach((node: ComponentRowDataType) => {
            if ((node.children ?? []).length > 0) return;
            const nodeName = componentNiceName(node.data.id);
            const item = validatedMap.get(node.data.id);
            if (item) {
                item.title = nodeName + ' (' + getValidationMessage(node, { componentScope: '' }) + ')';
            }
        });
    return (
        <Space direction='vertical'>
            <div>{validatedMap.size} Component{plural} with validation issues</div>
            <SimpleList
                items={Array.from(validatedMap.values())}
                keyContext={keyContext}
                handleSelect={(item) => focusComponentInTree(item.id, expandedRowKeys, setExpandedRowKeys, componentRefs)}
            />
        </Space>
    );
};

export const getActiveLayer = (state: { selectedTargetType: TargetSetData | undefined }): string => {
    return state.selectedTargetType?.relativePath || '';
};

/**
 * Checks if a component and all its descendants are in the active layer.
 * @param record The component record
 * @param state The current state
 * @returns True if the component and all its descendants are in the active layer, false otherwise
 */
export const isInActiveLayer = (record: ComponentRowDataType, state: { activeLayer?: string, selectedTargetType: TargetSetData | undefined }): boolean => {
    const rawActiveLayer = getActiveLayer(state);
    const activeLayer = rawActiveLayer ? rawActiveLayer.toLocaleLowerCase().replaceAll('\\', '/') : '';
    const rawRecordLayer = record.aggregate.options?.layer;
    const recordLayer = rawRecordLayer ? rawRecordLayer.toLowerCase().replaceAll('\\', '/') : '';

    if (recordLayer === activeLayer && recordLayer.length > 0 && record.aggregate.selectedCount) {
        return true;
    }

    return (record.children ?? []).some(child => isInActiveLayer(child, state));
};

/**
 * Determines the CSS class name for a table row.
 * @param record The data record for the row.
 * @returns The CSS class name.
 */
export const rowClassName = (record: ComponentRowDataType, state: { activeLayer?: string, selectedTargetType: TargetSetData | undefined }): string => {
    const isLeaf = !(record.children && record.children.length);
    const inActiveLayer = isInActiveLayer(record, state);
    return `${isLeaf ? 'leaf-node ' : ''}${!inActiveLayer ? 'active-layer ' : 'ant-table-row-disabled '}`.trim();
};

export const codiconIcon = (name: string, title?: string, color?: string): React.ReactNode => {
    return (
        <span
            className={`codicon codicon-${name}`}
            title={title}
            style={{
                verticalAlign: 'middle',
                padding: '0px 8px 0px 0px',
                color: color || 'var(--vscode-icon-foreground)'
            }}
        />
    );
};

/**
 * Generates a warning or error icon.
 * @param state The state of the icon ('warning' or 'error')
 * @param title The title of the icon
 * @returns The warning or error icon
 */
export const warningIcon = (state: 'warning' | 'error' | 'info', title?: string, overrideStateColor?: 'warning' | 'error' | 'info'): React.ReactNode => {
    const colorFromState = (state: 'warning' | 'error' | 'info'): string => {
        switch (state) {
            case 'error':
                return 'var(--vscode-editorError-foreground)';
            case 'warning':
                return 'var(--vscode-editorWarning-foreground)';
            case 'info':
                return 'var(--vscode-editorInfo-foreground)';
        }
    };

    return codiconIcon(state, title, overrideStateColor ? colorFromState(overrideStateColor) : colorFromState(state));
};

export type KeyLabel = {
    key: string;
    label: string;
};

/**
 * Filters the component tree based on a search term.
 * @param nodes The component tree nodes
 * @param term The search term
 * @returns The filtered component tree
 */
export const filterTree = (nodes: ComponentRowDataType[], term: string): ComponentRowDataType[] => {
    if (!term) return nodes;
    const lowerTerm = term.toLowerCase();
    return nodes
        .map(node => {
            const src = `${node.name}${node.parsed.vendor}${node.parsed.version}${node.data.description}`.toLowerCase();
            const children = node.children ? filterTree(node.children, term) : [];
            const match = src.includes(lowerTerm);
            if (match || children.length > 0) {
                return { ...node, children: children.length > 0 ? children : undefined };
            }
            return null;
        })
        // remove undefined entries and cast to specific type
        .filter(Boolean) as ComponentRowDataType[];
};

export const focusComponentInTree = (
    componentId: string,
    expandedRowKeys: string[],
    setExpandedRowKeys: React.Dispatch<React.SetStateAction<string[]>>,
    componentRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>
) => {
    const selectedComp = parseComponentId(componentId);
    if (selectedComp) {
        const newExpandedRowKeys = [
            selectedComp.class,
            `${selectedComp.class}${selectedComp.bundle ? `@${selectedComp.bundle}` : ''}${selectedComp.group ? `:${selectedComp.group}` : ''}`,
            componentId
        ];
        const newKeys = newExpandedRowKeys.filter(key => !expandedRowKeys.includes(key));
        if (newKeys.length > 0) {
            setExpandedRowKeys([...expandedRowKeys, ...newKeys]);
        }

        window.requestAnimationFrame(() => {
            let ref: HTMLInputElement | null | undefined = undefined;
            for (const cref in componentRefs.current) {
                if (componentRefs.current[cref]?.id == componentId) {
                    ref = componentRefs.current[cref];
                }
            }
            ref?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // 300ms is the typical time, the animation of smooth scroll is finished.
            window.setTimeout(() => {
                ref?.focus();
            }, 300);
        });
    }
};

/**
 * Mapper to convert from PacksInfo datatype (service) to PacksRowDataType (view)
 * @param packInfo The PacksInfo object to convert
 * @returns The corresponding PacksRowDataType object
 */
export const packsRowFromInfo = (packInfo: Pack): PackRowDataType => {
    const pack = parsePackId(packInfo.id);
    return {
        key: packInfo.id,
        name: pack ? (pack.vendor ? `${pack.vendor}::${pack.packName}` : pack.packName) : packInfo.id,
        packId: packInfo.id,
        versionUsed: pack?.versionOperator ? pack.versionOperator + pack.version : (pack?.version || ''),
        versionTarget: '',
        description: packInfo.description || '',
        used: packInfo.used || false,
        references: (packInfo.references || []),
        overviewLink: packInfo.doc || ''
    };
};

/**
 * Builds a list of all origins for a selected pack and target type.
 * @param selectedPack The currently selected pack
 * @param selectedTargetType The currently selected target type
 * @returns An array of OriginDataType representing all origins
 */
export const buildAllOrigins = (
    selectedPack: PackRowDataType | undefined,
    solution: SolutionInfo,
    selectedTargetType: ComponentsState['selectedTargetType'],
): OriginDataType[] => {
    const refsByPath = new Map<string, PackReference[]>();
    for (const ref of selectedPack?.references ?? []) {
        const list = refsByPath.get(ref.path ?? '') ?? [];
        list.push(ref);
        refsByPath.set(ref.path ?? '', list);
    }

    const defaultPackParsed = selectedPack ? parsePackId(selectedPack.packId) : undefined;

    const baseOrigin: OriginDataType = {
        type: 'solution',
        label: solution.name || 'Solution',
        path: solution.path || '',
        relativePath: solution.relativePath || '',
        versionOperator: '',
        version: '',
        selected: false,
    };

    const targetOrigin = (() => {
        if (!selectedTargetType?.type || !selectedTargetType.label || !selectedTargetType.relativePath || !selectedTargetType.key) {
            return undefined;
        }
        return {
            type: selectedTargetType.type,
            label: parseBuildContextName(selectedTargetType.label).project,
            path: selectedTargetType.path,
            relativePath: selectedTargetType.relativePath,
            versionOperator: '',
            version: '',
            selected: false,
        } satisfies OriginDataType;
    })();

    const childOrigins: OriginDataType[] = (selectedTargetType?.children ?? [])
        .filter(child => child.type && child.label && child.relativePath && child.key && child.path)
        .map(child => ({
            type: child.type!,
            label: child.label!,
            relativePath: child.relativePath!,
            path: child.path!,
            versionOperator: '',
            version: '',
            selected: false,
        }));

    const origins: OriginDataType[] = [
        baseOrigin,
        ...(targetOrigin ? [targetOrigin] : []),
        ...childOrigins,
    ];

    return origins.map(origin => {
        const refs = refsByPath.get(origin.relativePath ?? '') ?? [];
        if (refs.length > 0) {
            const lastRef = refs[refs.length - 1];
            const parsed = parsePackId(lastRef.pack);
            return {
                ...origin,
                selected: lastRef.selected,
                version: parsed?.version || '',
                versionOperator: parsed?.versionOperator || '',
            };
        }

        return {
            ...origin,
            version: defaultPackParsed?.version || '',
            versionOperator: defaultPackParsed?.versionOperator || '',
        };
    });
};
