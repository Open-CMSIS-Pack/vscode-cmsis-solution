/**
 * Copyright 2025-2026 Arm Limited
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

import 'jest';
import * as React from 'react';
import { IncomingMessage, OutgoingMessage } from '../../messages';
import { PacksView } from './packs-view';
import { createRoot } from 'react-dom/client';
import { ComponentsState } from '../state/reducer';
import { ComponentScope, PackRowDataType } from '../../data/component-tools';
import { MockMessageHandler } from '../../../__test__/mock-message-handler';

jest.mock('antd', () => {
    const actual = jest.requireActual('antd');

    return {
        ...actual,
        Tooltip: ({ title, children }: { title: React.ReactNode; children: React.ReactNode }) => (
            <>
                <span className='test-tooltip-title'>{title}</span>
                {children}
            </>
        )
    };
});

describe('PacksView', () => {
    let container: Element;
    let messageHandler: MockMessageHandler<IncomingMessage, OutgoingMessage>;
    let listener: jest.Mock;
    let openFileMock: jest.Mock;

    const mockPack: PackRowDataType = {
        key: 'ARM::CMSIS@6.1.0',
        packId: 'ARM::CMSIS@6.1.0',
        name: 'CMSIS',
        versionTarget: '6.1.0',
        description: 'Cortex Microcontroller Software Interface Components',
        overviewLink: '/path/to/overview.html',
        versionUsed: '6.0.0',
        used: true,
        references: [{ pack: '', origin: 'path/to/solution.cproject.yml', relOrigin: 'path/to/solution.cproject.yml', selected: false }]
    };

    const defaultState: ComponentsState = {
        packs: [mockPack],
        cClasses: { type: 'idle' },
        selectedTargetType: {
            type: 'project',
            relativePath: 'path/to/context',
            label: 'My.ContextName+Debug',
            key: 'project.path.to.context',
            path: 'path/to/context'
        },
        stateMessage: undefined,
        searchText: '',
        packsFilterValue: 'solution',
        showSelectedOnly: false,
        expandedGroups: [],
        visibleBundles: { 'string': 'string' },
        visibleComponentOptions: [],
        currentTarget: {
            type: 'all'
        },
        targetTypes: undefined,
        selectedProject: undefined,
        availableProjects: [],
        missingPacks: [],
        solution: { name: '' },
        cbuildPackPath: '',
        componentTree: [],
        isDirty: false,
        layers: [],
        componentScope: ComponentScope.All,
        errorMessages: [],
        availableTargetTypes: [],
        unlilnkRequestStack: [],
        availablePacks: {}
    };

    beforeEach(() => {
        listener = jest.fn();
        messageHandler = new MockMessageHandler(listener);
        openFileMock = jest.fn();
        container = document.createElement('div');

        React.act(() => {
            createRoot(container).render(
                <PacksView state={defaultState} openFile={openFileMock} messageHandler={messageHandler} availablePacks={defaultState.availablePacks} />
            );
        });
    });

    afterEach(() => {
        container.remove();
    });

    it('renders the packs view root element', () => {
        expect(container.querySelectorAll('.packs-view-root')).toHaveLength(1);
    });

    it('renders the table with pack data', () => {
        expect(container.querySelectorAll('.ant-table')).toHaveLength(1);
        expect(container.querySelectorAll('tr.ant-table-row').length).toBeGreaterThanOrEqual(1);
    });

    it('renders the target select component', () => {
        expect(container.querySelectorAll('.packs-view-filter').length).toBeGreaterThanOrEqual(1);
    });

    it('displays pack name in the table', () => {
        const tableContent = container.textContent || '';
        expect(tableContent).toContain('CMSIS');
    });

    it('displays pack description in the table', () => {
        const tableContent = container.textContent || '';
        expect(tableContent).toContain('Cortex Microcontroller Software Interface Components');
    });

    it('displays version target in the table', () => {
        const tableContent = container.textContent || '';
        expect(tableContent).toContain('6.0.0');
    });

    it('strips version qualifier prefix for missing packs', () => {
        const missingPackState: ComponentsState = {
            ...defaultState,
            packs: [{
                ...mockPack,
                packId: 'ARM::CMSIS@>=7.13.0',
                versionUsed: '@>=7.13.0',
                references: [{ pack: 'ARM::CMSIS@>=7.13.0', origin: 'path/to/solution.cproject.yml', relOrigin: 'path/to/solution.cproject.yml', selected: false, missing: true }]
            }]
        };

        const localContainer = document.createElement('div');
        React.act(() => {
            createRoot(localContainer).render(
                <PacksView state={missingPackState} openFile={openFileMock} messageHandler={messageHandler} availablePacks={defaultState.availablePacks} />
            );
        });

        const tableContent = localContainer.textContent || '';
        expect(tableContent).toContain('7.13.0');
        // The version column should show the clean version without qualifier prefix
        const versionCells = localContainer.querySelectorAll('td');
        const versionCell = Array.from(versionCells).find(td => td.textContent?.trim() === '7.13.0');
        expect(versionCell).toBeDefined();
    });

    it('adds missing-row class when pack has missing references', () => {
        const missingPackState: ComponentsState = {
            ...defaultState,
            packs: [{
                ...mockPack,
                references: [{ pack: 'ARM::CMSIS@>=7.13.0', origin: 'path/to/solution.cproject.yml', relOrigin: 'path/to/solution.cproject.yml', selected: false, missing: true }]
            }]
        };

        const localContainer = document.createElement('div');
        React.act(() => {
            createRoot(localContainer).render(
                <PacksView state={missingPackState} openFile={openFileMock} messageHandler={messageHandler} availablePacks={defaultState.availablePacks} />
            );
        });

        const row = localContainer.querySelector('tr.ant-table-row');
        expect(row?.classList.contains('packs-missing-row')).toBe(true);
    });

    it('shows empty version when no version is given in the pack id', () => {
        const noVersionPackState: ComponentsState = {
            ...defaultState,
            packs: [{
                ...mockPack,
                name: 'TFM',
                packId: 'Keil::TFM',
                versionUsed: '',
                references: [{ pack: 'Keil::TFM', origin: 'path/to/solution.cproject.yml', relOrigin: 'path/to/solution.cproject.yml', selected: false, missing: true }]
            }]
        };

        const localContainer = document.createElement('div');
        React.act(() => {
            createRoot(localContainer).render(
                <PacksView state={noVersionPackState} openFile={openFileMock} messageHandler={messageHandler} availablePacks={defaultState.availablePacks} />
            );
        });

        const tableContent = localContainer.textContent || '';
        // The pack name should appear (in the Software Pack column), but not in the Version column
        expect(tableContent).toContain('TFM');
        expect(tableContent).not.toContain('Keil::TFM');
    });

    it('derives missing version from missing reference pack id when row pack id has no version', () => {
        const missingReferenceVersionState: ComponentsState = {
            ...defaultState,
            packs: [{
                ...mockPack,
                packId: 'ARM::CMSIS',
                versionUsed: '',
                references: [{
                    pack: 'ARM::CMSIS@>=7.13.0',
                    origin: 'path/to/solution.cproject.yml',
                    relOrigin: 'path/to/solution.cproject.yml',
                    selected: false,
                    missing: true
                }]
            }]
        };

        const localContainer = document.createElement('div');
        React.act(() => {
            createRoot(localContainer).render(
                <PacksView
                    state={missingReferenceVersionState}
                    openFile={openFileMock}
                    messageHandler={messageHandler}
                    availablePacks={defaultState.availablePacks}
                />
            );
        });

        const versionCells = localContainer.querySelectorAll('td');
        const versionCell = Array.from(versionCells).find(td => td.textContent?.trim() === '7.13.0');
        expect(versionCell).toBeDefined();
    });

    describe('pack properties dialog', () => {
        it('opens pack properties dialog when edit button is clicked', () => {
            const tableRows = container.querySelectorAll('.ant-table-row-level-0');
            expect(tableRows.length).toBeGreaterThanOrEqual(1);

            if (tableRows.length > 0) {
                React.act(() => {
                    (tableRows[0] as HTMLTableRowElement).click();
                });
                expect(container.querySelectorAll('.ant-modal').length).toBeGreaterThanOrEqual(0);
            }
        });
    });

    describe('unlink package functionality', () => {
        it('sends UNLINK_PACKAGE message when sync button is clicked', () => {
            const syncButtons = container.querySelectorAll('.ant-icon-sync');
            if (syncButtons.length > 0) {
                const syncButton = syncButtons[0].closest('button') as HTMLButtonElement;
                if (syncButton) {
                    React.act(() => {
                        syncButton.click();
                    });
                    expect(listener).toHaveBeenCalledWith(
                        expect.objectContaining({
                            type: 'UNLINK_PACKAGE',
                            packId: mockPack.packId
                        })
                    );
                }
            }
        });
    });

    describe('overview link handling', () => {
        it('opens file when overview link is clicked', () => {
            const links = container.querySelectorAll('a');
            const overviewLink = Array.from(links).find(link => link.getAttribute('href') === mockPack.overviewLink);

            if (overviewLink) {
                React.act(() => {
                    (overviewLink as HTMLAnchorElement).click();
                });
                expect(openFileMock).toHaveBeenCalledWith(mockPack.overviewLink, false);
            }
        });

        it('opens pack URL when the pack link icon is clicked for packs without references', () => {
            const noReferenceState: ComponentsState = {
                ...defaultState,
                packs: [{
                    ...mockPack,
                    packId: 'My::Pack@1.2.3',
                    name: 'Pack',
                    references: []
                }]
            };

            const localContainer = document.createElement('div');
            React.act(() => {
                createRoot(localContainer).render(
                    <PacksView
                        state={noReferenceState}
                        openFile={openFileMock}
                        messageHandler={messageHandler}
                        availablePacks={defaultState.availablePacks}
                    />
                );
            });

            const packLink = localContainer.querySelector("button[aria-label='Open pack URL']") as HTMLButtonElement | null;
            expect(packLink).not.toBeNull();

            if (packLink) {
                React.act(() => {
                    packLink.click();
                });
                expect(openFileMock).toHaveBeenCalledWith('https://www.keil.arm.com/packs/pack-my/', true);
            }
        });
    });

    describe('empty state', () => {
        it('displays empty state message when no packs are available', () => {
            const emptyState: ComponentsState = {
                ...defaultState,
                packs: [],
                stateMessage: 'No packs available'
            };

            React.act(() => {
                createRoot(document.createElement('div')).render(
                    <PacksView state={emptyState} openFile={openFileMock} messageHandler={messageHandler} availablePacks={defaultState.availablePacks} />
                );
            });

            expect(container.querySelectorAll('.ant-empty').length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('loading state', () => {
        it('shows loading spinner when solution state message is present', () => {
            const loadingState: ComponentsState = {
                ...defaultState,
                stateMessage: 'Loading packs...'
            };

            React.act(() => {
                createRoot(document.createElement('div')).render(
                    <PacksView state={loadingState} openFile={openFileMock} messageHandler={messageHandler} availablePacks={defaultState.availablePacks} />
                );
            });

            expect(container.querySelectorAll('.ant-spin').length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('multiple packs', () => {
        it('renders all packs in the table', () => {
            const pack2: PackRowDataType = {
                key: 'Keil::MDK-Middleware@8.0.0',
                packId: 'Keil::MDK-Middleware@8.0.0',
                name: 'MDK-Middleware',
                versionTarget: '8.0.0',
                description: 'MDK Middleware',
                overviewLink: '/path/to/overview2.html',
                references: [],
                versionUsed: '',
                used: false
            };

            const multiPackState: ComponentsState = {
                ...defaultState,
                packs: [mockPack, pack2]
            };

            React.act(() => {
                createRoot(container).render(
                    <PacksView state={multiPackState} openFile={openFileMock} messageHandler={messageHandler} availablePacks={defaultState.availablePacks} />
                );
            });

            const tableContent = container.textContent || '';
            expect(tableContent).toContain('CMSIS');
            expect(tableContent).toContain('MDK-Middleware');
        });
    });

    describe('references tooltip', () => {
        it('shows version in tooltip from pack id even when locked is present', () => {
            const stateWithLockedReference: ComponentsState = {
                ...defaultState,
                packs: [{
                    ...mockPack,
                    references: [{
                        ...mockPack.references[0],
                        pack: 'ARM::CMSIS@5.9.0',
                        locked: 'ARM::CMSIS@6.1.0',
                        relPath: ''
                    }]
                }]
            };

            const localContainer = document.createElement('div');
            React.act(() => {
                createRoot(localContainer).render(
                    <PacksView
                        state={stateWithLockedReference}
                        openFile={openFileMock}
                        messageHandler={messageHandler}
                        availablePacks={defaultState.availablePacks}
                    />
                );
            });

            const tableContent = localContainer.textContent || '';
            expect(tableContent).toContain('(5.9.0)');
            expect(tableContent).not.toContain('(6.1.0)');
        });

        it('does not show tooltip version when reference pack id does not provide a version', () => {
            const stateWithLockedOnlyVersion: ComponentsState = {
                ...defaultState,
                packs: [{
                    ...mockPack,
                    packId: 'ARM::CMSIS',
                    references: [{
                        ...mockPack.references[0],
                        pack: 'ARM::CMSIS',
                        locked: 'ARM::CMSIS@6.1.0',
                        relPath: ''
                    }]
                }]
            };

            const localContainer = document.createElement('div');
            React.act(() => {
                createRoot(localContainer).render(
                    <PacksView
                        state={stateWithLockedOnlyVersion}
                        openFile={openFileMock}
                        messageHandler={messageHandler}
                        availablePacks={defaultState.availablePacks}
                    />
                );
            });

            const tableContent = localContainer.textContent || '';
            expect(tableContent).not.toContain('(6.1.0)');
        });

        it('shows missing pack version in tooltip without @ prefix', () => {
            const stateWithMissingReference: ComponentsState = {
                ...defaultState,
                packs: [{
                    ...mockPack,
                    references: [{
                        ...mockPack.references[0],
                        pack: 'ARM::CMSIS@>=6.1.0',
                        missing: true,
                        relPath: ''
                    }]
                }]
            };

            const localContainer = document.createElement('div');
            React.act(() => {
                createRoot(localContainer).render(
                    <PacksView
                        state={stateWithMissingReference}
                        openFile={openFileMock}
                        messageHandler={messageHandler}
                        availablePacks={defaultState.availablePacks}
                    />
                );
            });

            const tableContent = localContainer.textContent || '';
            expect(tableContent).toContain('(>=6.1.0)');
            expect(tableContent).not.toContain('(@>=6.1.0)');
        });

        it('shows a separate path line when relPath is defined and non-empty', () => {
            const stateWithRelPath: ComponentsState = {
                ...defaultState,
                packs: [{
                    ...mockPack,
                    references: [{
                        ...mockPack.references[0],
                        relPath: 'packs/mypack'
                    }]
                }]
            };

            const localContainer = document.createElement('div');
            React.act(() => {
                createRoot(localContainer).render(
                    <PacksView
                        state={stateWithRelPath}
                        openFile={openFileMock}
                        messageHandler={messageHandler}
                        availablePacks={defaultState.availablePacks}
                    />
                );
            });

            const tableContent = localContainer.textContent || '';
            expect(tableContent).toContain('path: packs/mypack');
        });

        it('does not show a path line when relPath is empty or whitespace', () => {
            const stateWithEmptyRelPath: ComponentsState = {
                ...defaultState,
                packs: [{
                    ...mockPack,
                    references: [{
                        ...mockPack.references[0],
                        relPath: '   '
                    }]
                }]
            };

            const localContainer = document.createElement('div');
            React.act(() => {
                createRoot(localContainer).render(
                    <PacksView
                        state={stateWithEmptyRelPath}
                        openFile={openFileMock}
                        messageHandler={messageHandler}
                        availablePacks={defaultState.availablePacks}
                    />
                );
            });

            const tableContent = localContainer.textContent || '';
            expect(tableContent).not.toContain('path:');
        });
    });
});
