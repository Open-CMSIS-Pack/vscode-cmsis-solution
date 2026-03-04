/**
 * Copyright (C) 2019-2026 Arm Limited
 */

import './search-input.css';

import * as React from 'react';

type HTMLInputProps = React.InputHTMLAttributes<HTMLInputElement>

export type SearchInputProps = Omit<HTMLInputProps, 'type'>

export const SearchInput = (props: SearchInputProps) => {
    return (
        <div className="search-input-wrapper">
            <input type="text" {...props} />
        </div>
    );
};
