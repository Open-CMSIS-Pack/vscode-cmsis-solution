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
import { Button, Space } from 'antd';
import { CmsisCodicon } from '../../../common/components/cmsis-codicon';
import { packURL } from '../../../../packs/pack-urls';

interface PackTitleLinkProps {
    packId?: string;
    packName?: string;
    openFile: (link: string, external?: boolean) => void;
}

export const PackTitleLink: React.FC<PackTitleLinkProps> = ({
    packId,
    packName,
    openFile,
}) => {
    const packUrl = packURL(packId);
    return (
        <>
            {packName ?? ''}
            <Space align='baseline' style={{ marginLeft: '8px' }}>
                <Button
                    type="text"
                    style={{ padding: '0px 12px' }}
                    title={packUrl}
                    aria-label='Open pack URL'
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openFile(packUrl, true);
                    }}
                >
                    <CmsisCodicon name='link-external' style={{ fontSize: '1em', display: 'inline' }} />
                </Button>
            </Space>
        </>
    );
};
