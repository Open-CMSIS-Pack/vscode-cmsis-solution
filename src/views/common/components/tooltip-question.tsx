/*
 * Copyright (c) 2024-2026 Arm Limited
 */

import React from 'react';
import './tooltip-question.css';

type TooltipQuestionProps = {
    title: string;
}

export const TooltipQuestion = (props: TooltipQuestionProps) => {
    return (
        <span title={props.title} className="tooltip codicon codicon-question"></span>
    );
};
