/**
 * Copyright (C) 2022-2026 Arm Limited
 */

import * as React from 'react';
import { VariableSizeList as List } from 'react-window';
import './tree-view.css';

/**
 * The distance (in pixels) between levels of the tree.
 */
const OFFSET_MODIFIER = 20;
const OFFSET_ITEM_CORRECTION = 5;
const DEFAULT_ITEM_HEIGHT = 20;
const DEFAULT_TREE_HEIGHT = 270;

export interface TreeViewProps<T = string> {
    topLevelCategories: Array<TreeViewCategory<T>>;
    onSelect?: (item: { label: string, value: T }) => void;
    itemSize?: number;
    height?: number;
    noEntriesMessage?: React.ReactNode;
}

export interface TreeViewCategory<T = string> {
    header: string;
    sortkey?: number;
    categories: Array<TreeViewCategory<T>>;
    items: Array<TreeViewItem<T>>;
}

export interface TreeViewItem<T = string> {
    label: string;
    value: T,
    tooltip?: string;
    className?: string;
}

type ListNode<T = string> = {
    type: 'item',
    text: string,
    depth: number,
    value: T,
    tooltip?: string,
    className?: string,
} | {
    type: 'category',
    text: string,
    depth: number,
    length: number
    tooltip?: string,
    className?: string,
};

const flatten = <T = string>(cats: Array<TreeViewCategory<T>>, depth = 0): Array<ListNode<T>> => {
    let result: Array<ListNode<T>> = [];
    for (const c of cats) {
        const sub = flatten(c.categories, depth + 1);
        const len = sub.filter(e => e.type === 'item').length + c.items.length;
        if (c.items.length !== 0 || c.categories.length !== 0) {
            result.push({ type: 'category', text: `${c.header} (${len})`, depth: depth, length: len });
        }
        result = result.concat(sub);
        for (const item of c.items) {
            result.push({ type: 'item', text: item.label, depth: depth, value: item.value, tooltip: item.tooltip, className: item.className });
        }
    }
    return result;
};

/**
 * React component used to display a given set of category/item data within an interactable tree view.
 * Generic types provide support for differentiating between the displayed 'label' and the data returned.
 */
export const TreeView = <T = string>(props: TreeViewProps<T>) => {
    const itemSize = props.itemSize || DEFAULT_ITEM_HEIGHT;
    const data = flatten<T>(props.topLevelCategories);
    const listRef = React.useRef<List>(null);

    React.useEffect(() => {
        listRef.current?.resetAfterIndex(0);
    }, [props.topLevelCategories]);

    const getTreeItemHeight = (index: number): number => {
        const item = data[index];
        const descrHeight = item.tooltip?.length ? itemSize * .8 : 0;
        return itemSize + descrHeight;
    };

    const TreeItem = ({ index, data, style }: { index: number, data: Array<ListNode<T>>, style: React.CSSProperties }) => {
        const item = data[index];
        const offset = (item.depth * OFFSET_MODIFIER) + ((item.type === 'item') ? OFFSET_MODIFIER : 0);
        const onClickFunc = (item.type === 'item') && props.onSelect ? () => { if (props.onSelect) { props.onSelect({ label: item.text, value: item.value }); } } : undefined;
        const descrHeight = item.tooltip?.length ? itemSize * .8 : 0;

        const guides = [];
        if (item.type === 'item') {
            const guideStyle = { left: `${offset}px`, height: `${itemSize + descrHeight}px` };
            guides.push(<div key='0-guide' className={'components-tree-view-guide'} style={guideStyle}></div>);
        }
        for (let i = 1; i <= item.depth; i++) {
            const guideStyle = { left: `${i * OFFSET_MODIFIER}px`, height: `${itemSize + descrHeight}px` };
            guides.push(<div key={`${i}-guide`} className={'components-tree-view-guide'} style={guideStyle}></div>);
        }

        const elementTotalOffset = offset + OFFSET_MODIFIER - OFFSET_ITEM_CORRECTION + 5;
        const classNames = [`components-tree-view-${item.type}`];
        if (item.className) classNames.push(item.className);
        return (
            <div key={index} style={{ ...style, height: `${getTreeItemHeight(index)}px` }}>
                {...guides}
                <div key={index}
                    style={{
                        left: `${offset}px`,
                        marginLeft: `${OFFSET_MODIFIER - OFFSET_ITEM_CORRECTION}px`,
                        width: `calc(100% - ${elementTotalOffset}px)`
                    }}
                    onClick={onClickFunc}
                    className={classNames.join(' ')}
                    title={item.tooltip}
                >
                    {`${item.text}`}
                    {item.tooltip?.length && <div className='components-tree-view-descr'>{item.tooltip}</div>}
                </div>
            </div>
        );
    };

    return (
        <div className="components-tree-view">
            { !data.length && <div>
                {props.noEntriesMessage ?? 'No entries found'}
            </div>
            }

            { !!data.length && <List
                ref={listRef}
                height={props.height ?? DEFAULT_TREE_HEIGHT}
                width="100%"
                itemSize={getTreeItemHeight}
                itemCount={data.length}
                itemData={data}>
                {TreeItem}
            </List>
            }</div>
    );
};
