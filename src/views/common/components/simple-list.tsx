import './simple-list.css';
import React from 'react';
import { List } from 'antd';

export type SimpleListItem = {
    title: string;
    id: string;
};

export interface SimpleListProps {
    /**
     * A list of items to display in the list.
     * Each item should be an object with `title` and `id` properties.
     * @example [{ title: 'Item 1', id: '1' }, { title: 'Item 2', id: '2' }]
     * @default []
     */
    items: SimpleListItem[];
    /**
     * Callback when an item is selected.
     * @param item The selected item.
     */
    handleSelect?: (item: SimpleListItem) => void;
    /**
     * The context key appended to each list item.
     */
    keyContext: string;
}

/**
 * A simple list component that displays a list of items.
 * Each item is clickable and triggers the handleSelect callback if provided.
 * @example
 * <SimpleList items={[{ title: 'Item 1', id: '1' }, { title: 'Item 2', id: '2' }]} />
 */
const SimpleList: React.FC<SimpleListProps> = React.memo(({ items, handleSelect, keyContext }) => {
    const onSelect = React.useCallback((item: SimpleListItem) => {
        handleSelect?.(item);
    }, [handleSelect]);

    return (
        <div className="simple-list-namespace">
            <List
                bordered
                dataSource={items}
                renderItem={(item) => (
                    <List.Item
                        onClick={() => onSelect(item)}
                        style={{ cursor: 'pointer' }}
                        tabIndex={0}
                        key={`${item.id}-${item.title}-${keyContext}`}
                        onKeyPress={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                onSelect(item);
                            }
                        }}
                        aria-label={item.title}
                    >
                        {item.title}
                    </List.Item>
                )}
            />
        </div>
    );
});

SimpleList.displayName = 'SimpleList';

export default SimpleList;
