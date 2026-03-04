/**
 * Copyright (C) 2019-2026 Arm Limited
 */

import * as React from 'react';
import { Fragment, MouseEvent } from 'react';
import { SearchInput } from './search-input';
import './search-list.css';

export interface SearchListProps<A extends string> {
    /**
     * Optional function to convert the values type to text to display. If not
     * given, the value itself is displayed.
     */
    displayText?: (value: A) => string;
    titleText?: (value: A) => string;
    onSelect: (value: A) => void;
    searchPlaceholder?: string;
    /**
     * If false, the search box is not displayed
     */
    searchable?: boolean;
    /**
     * List of values to display, of a type that extends string.
     */
    values: A[];
    /**
     * Optional tooltip to show for the add button.
     */
    addTooltip?: string;
    /**
     * Optional icon for the add button.
     */
    addIcon?: string;
    /**
     * Optional boolean to disable the add button
     */
    addDisabled?: boolean;
    /**
     * Optional tagLabels for display values
     */
    tagLabel?: (value: A) => string;
}

interface State {
    searchText: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const identity = <A extends {}>(input: A): A => input;

/**
 * Component displaying a list with an optional search box.
 */
export class SearchList<A extends string> extends React.Component<SearchListProps<A>, State> {
    public readonly state = {
        searchText: ''
    };

    private readonly handleChange = (searchText: string): void => {
        this.setState({ searchText });
    };

    private readonly handleSelect = (event: MouseEvent<HTMLLIElement>): void => {
        event.stopPropagation();
        const value = event.currentTarget.dataset.value as A;
        this.props.onSelect(value);
    };

    public render(): JSX.Element {
        const { displayText = identity, titleText = () => '', searchable = true, searchPlaceholder = '', values, tagLabel } = this.props;
        const { searchText } = this.state;

        const lowerCaseSearch = searchText.toLowerCase();

        const filteredValues: A[] = values.filter(
            value => value.toLowerCase().includes(lowerCaseSearch)
        );

        return (
            <Fragment>
                {searchable && (
                    <div className="search-list-input">
                        <SearchInput
                            autoFocus
                            placeholder={searchPlaceholder}
                            onChange={e => this.handleChange(e.target.value)}
                            value={searchText}
                        />
                    </div>
                )}
                <ul className="search-list-values">
                    {filteredValues.map((value) => (
                        <li data-value={value} key={value} onClick={this.handleSelect} title={titleText(value)}>{displayText(value)} {tagLabel?.(value) ? <span className="search-list-tag">{tagLabel?.(value)}</span> : undefined} </li>
                    ))}
                </ul>
            </Fragment>
        );
    }
}
