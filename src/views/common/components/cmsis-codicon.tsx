/*
 * Copyright (C) 2026 Arm Limited
 */

import React from 'react';

const CMSIS_CODICON_CODEPOINTS = {
    build: 0xEA60,
    components: 0xEA61,
    cmsis: 0xEA62,
    'component-class': 0xEA63,
    files: 0xEA64,
    layer: 0xEA65,
    layers: 0xEA66,
    'software-component': 0xEA67,
    'cmsis-text': 0xEA68,
    'run-generator-cog': 0xEA69,
    api: 0xEA6A,
    'info-circle': 0xEA6B,
    'info-full-circle': 0xEA6C,
    'update-arrow': 0xEA6D,
    'version-history': 0xEA6E,
} as const;

export type CmsisCodiconName = keyof typeof CMSIS_CODICON_CODEPOINTS;

type Props = {
    name: CmsisCodiconName;
    title?: string;
    className?: string;
    style?: React.CSSProperties;
    fontFamily?: string; // default is your custom webview font
};

export const CmsisCodicon: React.FC<Props> = ({
    name,
    title,
    className,
    style,
    fontFamily = 'cmsis-codicon',
}) => {
    const codepoint = CMSIS_CODICON_CODEPOINTS[name];
    return (
        <span
            title={title}
            className={className}
            style={{ fontFamily, display: 'inline-block', lineHeight: 1, ...style }}
        >
            {String.fromCodePoint(codepoint)}
        </span>
    );
};
