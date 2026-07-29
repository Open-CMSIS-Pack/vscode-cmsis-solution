/**
 * Copyright 2026 Arm Limited
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

import React from 'react';

interface AnnotationIssuesProps {
    issues: readonly string[];
    isVisible: boolean;
    onToggle: () => void;
}

const ISSUES_PANEL_ID = 'configuration-wizard-annotation-issues';

export function AnnotationIssues({ issues, isVisible, onToggle }: AnnotationIssuesProps): React.JSX.Element | null {
    if (!issues.length) {
        return null;
    }

    const issueLabel = issues.length === 1 ? 'annotation issue' : 'annotation issues';

    return <>
        <button
            type='button'
            className='annotation-issues-toggle'
            aria-controls={ISSUES_PANEL_ID}
            aria-expanded={isVisible}
            onClick={onToggle}
        >
            <span aria-hidden='true'>⚠</span>
            <span>{issues.length} {issueLabel}</span>
            <span aria-hidden='true'>·</span>
            <span>{isVisible ? 'Hide' : 'Show'}</span>
        </button>
        {isVisible &&
            <section
                id={ISSUES_PANEL_ID}
                className='annotation-issues-panel'
                aria-label='Annotation issues'
            >
                <h3>Issues</h3>
                <div className='annotation-issues-list'>
                    {issues.map((issue, index) => <div key={`${index}-${issue}`}>{issue}</div>)}
                </div>
            </section>
        }
    </>;
}
