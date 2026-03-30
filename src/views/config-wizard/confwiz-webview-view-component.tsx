/**
 * Copyright 2023 - 2026 Arm Limited
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

import { Column, ColumnBodyOptions } from 'primereact/column';
import { TreeNode } from 'primereact/treenode';
import { TreeTable } from 'primereact/treetable';
import React from 'react';
import { HOST_EXTENSION } from 'vscode-messenger-common';
import { Messenger } from 'vscode-messenger-webview';
import { ConfWizKeyboardNavigation } from './confwiz-webview-keyboard-navigation';
import {
    ConfigWizardData,
    GuiTypes,
    TreeNodeElement,
    markDocumentDirty,
    readyType,
    saveElement,
    setPanelActiveType,
    setWizardDataType
} from './confwiz-webview-common';
import { Input, Checkbox, ConfigProvider, theme } from 'antd';
import { filterTree } from './../filterTree';
import './confwiz-webview.css';
import { CompactDropdown } from '../common/components/compact-dropdown';

const { Search } = Input;

// Render-only helper flag for dimming
type DTreeNode = TreeNode & { dimmed?: boolean };

const NAVIGATION_KEYS = [
    'ArrowDown',
    'ArrowUp',
    'ArrowLeft',
    'ArrowRight',
    'End',
    'Home',
    'PageDown',
    'PageUp'
];

interface State {
    annotations: TreeNodeElement | undefined;
    documentPath: string | undefined;
    filter: string;
    noAnnotationsFound: boolean;
    // Toggle to trigger re-renders
    forceRender: boolean;
    activeKey?: string;
    lastTouchedKey?: string;
    expandedKeys: Record<string, boolean>;
    panelIsActive: boolean;
    hasUserFocus: boolean;
}

export class ConfWiz extends React.Component<Record<string, unknown>, State> {

    private _messenger: Messenger | undefined;
    private readonly keyboardNav = new ConfWizKeyboardNavigation((key) => this.setActiveKey(key));
    private pendingRefocus = false;
    private pendingRefocusKey?: string;
    private readonly handleWindowBlur = (): void => {
        this.setState(prevState => ({
            hasUserFocus: false,
            lastTouchedKey: prevState.lastTouchedKey ?? prevState.activeKey
        }));
    };
    protected get messenger(): Messenger {
        if (!this._messenger) {
            const vscode = acquireVsCodeApi();
            this._messenger = new Messenger(vscode);
            this._messenger.start();
        }

        return this._messenger;
    }

    // Track which field is currently being edited for dirty indicator and deferred save
    private editedFieldId?: number;

    public constructor(props: Record<string, unknown>) {
        super(props);
        // Initial state - will be immediately overwritten by backend data sent in resolveCustomTextEditor
        // to prevent race condition between component mount and backend response
        this.state = {
            annotations: undefined,
            documentPath: undefined,
            filter: '',
            noAnnotationsFound: false,
            forceRender: false,
            activeKey: undefined,
            lastTouchedKey: undefined,
            expandedKeys: {},
            panelIsActive: true,
            hasUserFocus: false,
        };
    }

    public async componentDidMount(): Promise<void> {
        window.addEventListener('blur', this.handleWindowBlur);
        this.messenger.onNotification<ConfigWizardData>(
            setWizardDataType,
            wizardData => {
                // Clear edited field when new data arrives to prevent race conditions
                this.editedFieldId = undefined;
                const shouldResetExpansion = this.state.documentPath !== wizardData.documentPath;
                const shouldResetActiveKey = this.state.documentPath !== wizardData.documentPath;
                const expandedKeys = shouldResetExpansion ? {} : this.state.expandedKeys;
                const activeKey = shouldResetActiveKey ? undefined : this.state.activeKey;
                const lastTouchedKey = shouldResetActiveKey ? undefined : this.state.lastTouchedKey;
                this.setState({
                    annotations: wizardData.element,
                    documentPath: wizardData.documentPath,
                    noAnnotationsFound: wizardData.noAnnotationsFound,
                    activeKey,
                    lastTouchedKey,
                    expandedKeys,
                });
            }
        );
        this.messenger.onNotification<{ active: boolean }>(
            setPanelActiveType,
            ({ active }) => {
                this.setState(prevState => ({
                    panelIsActive: active,
                    hasUserFocus: active ? prevState.hasUserFocus : false,
                    lastTouchedKey: active ? prevState.lastTouchedKey : (prevState.lastTouchedKey ?? prevState.activeKey)
                }));
            }
        );
        this.messenger.sendNotification(readyType, HOST_EXTENSION, undefined);
    }

    public componentDidUpdate(_prevProps: Record<string, unknown>, prevState: State): void {
        const visibleKeys = this.keyboardNav.getVisibleKeys();
        if (visibleKeys.length === 0) {
            return;
        }

        const activeKey = this.state.activeKey;
        const hasActive = activeKey !== undefined && visibleKeys.includes(activeKey);
        if (this.pendingRefocus) {
            const lastKey = this.pendingRefocusKey ?? activeKey ?? prevState.activeKey;
            const nearestVisible = this.findNearestVisibleKey(lastKey, visibleKeys) ?? visibleKeys[0];
            this.pendingRefocus = false;
            this.pendingRefocusKey = undefined;
            if (activeKey !== nearestVisible) {
                this.setState({ activeKey: nearestVisible });
            }
            this.keyboardNav.focusRowByKey(nearestVisible);
            return;
        }

        if (!hasActive) {
            const lastKey = activeKey ?? prevState.activeKey;
            const nearestVisible = this.findNearestVisibleKey(lastKey, visibleKeys);
            this.setState({ activeKey: nearestVisible ?? visibleKeys[0] });
            return;
        }

        if (prevState.activeKey !== activeKey && activeKey !== undefined) {
            this.keyboardNav.focusRowByKey(activeKey);
        }
    }

    public componentWillUnmount(): void {
        window.removeEventListener('blur', this.handleWindowBlur);
        // Cleanup to prevent memory leaks
        this.editedFieldId = undefined;
        this.keyboardNav.reset();
    }

    private getElementKey(element: TreeNodeElement): string {
        return element.guiId.toString();
    }

    private findNearestVisibleKey(lastKey: string | undefined, visibleKeys: string[]): string | undefined {
        if (!lastKey || this.state.annotations === undefined) {
            return undefined;
        }

        const path = this.findPathToKey(this.state.annotations, lastKey, []);
        if (!path) {
            return undefined;
        }

        for (let index = path.length - 1; index >= 0; index -= 1) {
            const candidate = path[index];
            if (visibleKeys.includes(candidate)) {
                return candidate;
            }
        }

        return undefined;
    }

    private findPathToKey(node: TreeNodeElement, targetKey: string, path: string[]): string[] | undefined {
        const nodeKey = this.getElementKey(node);
        const nextPath = [...path, nodeKey];
        if (nodeKey === targetKey) {
            return nextPath;
        }

        if (node.children) {
            for (const child of node.children) {
                const childPath = this.findPathToKey(child, targetKey, nextPath);
                if (childPath) {
                    return childPath;
                }
            }
        }

        return undefined;
    }

    private getNodeKey(node: DTreeNode): string {
        const key = node.key ?? node.id ?? (node.data as TreeNodeElement | undefined)?.guiId?.toString();
        return key ? key.toString() : '';
    }


    private readonly setActiveKey = (key: string): void => {
        if (this.state.activeKey !== key) {
            this.setState({
                activeKey: key,
                lastTouchedKey: key,
                hasUserFocus: true
            });
        }
    };

    private readonly handleUserFocus = (key: string): void => {
        this.setState({
            activeKey: key,
            lastTouchedKey: key,
            hasUserFocus: true
        });
    };

    private readonly handleRowPointerActivate = (key: string): void => {
        this.handleUserFocus(key);
        this.keyboardNav.focusRowByKey(key);
    };

    private isUncheckedCheckbox(element: TreeNodeElement): boolean {
        return element.type === GuiTypes.check && !element.value.checked;
    }

    // Dim a node if it inherits dim from an ancestor
    // Parent checkboxes themselves are NOT dimmed, only their children
    private buildTreeData(node: DTreeNode, treeElement: TreeNodeElement, inheritedDim = false): void {
        const isUncheckedCheck = this.isUncheckedCheckbox(treeElement);

        // Only inherit dimming from ancestors, don't dim the checkbox itself
        const isDimmed = inheritedDim;

        const currentNode: DTreeNode = {
            children: [],
            data: treeElement,
            leaf: !treeElement.children || treeElement.children.length === 0,
            id: treeElement.guiId.toString(),
            key: treeElement.guiId.toString(),
            dimmed: isDimmed
        };

        node.children?.push(currentNode);

        // Pass dimming to children if this is an unchecked checkbox
        const dimForChildren = isUncheckedCheck || inheritedDim;

        if (treeElement.children) {
            for (const child of treeElement.children) {
                this.buildTreeData(currentNode, child, dimForChildren);
            }
        }
    }

    protected getErrorLines(errors: string[] | undefined) {
        if (errors == undefined || !errors.length) {
            return undefined;
        }
        const errorsLines: React.JSX.Element[] = [];

        for (const val of errors) {
            errorsLines.push(<div>{val}</div>);
        }

        return errorsLines;
    }

    protected getErrorsText(rootNode: TreeNode) {
        let errorsText: React.JSX.Element = <div></div>;
        const rootElement = rootNode.data as TreeNodeElement;
        if (rootElement !== undefined) {
            const errorsLines = this.getErrorLines(rootElement.errors);
            if (errorsLines !== undefined) {
                errorsText = <section><br /><br /><br />
                    <h3>Errors</h3>
                    {errorsLines}
                </section>;
            }
        }

        return errorsText;
    }

    protected getTree() {
        if (this.state.annotations === undefined) {
            return undefined;
        }

        const rootIsUncheckedCheck =
            this.state.annotations.type === GuiTypes.check &&
            !this.state.annotations.value.checked;

        // Root node is never dimmed, even if it's an unchecked checkbox
        const rootNode: DTreeNode = {
            children: [],
            data: this.state.annotations,
            leaf: false,
            id: this.state.annotations.guiId.toString(),
            key: this.state.annotations.guiId.toString(),
            dimmed: false
        };

        const children = this.state.annotations.children;
        if (children !== undefined) {
            for (const child of children) {
                // Pass dimming state to children if root is unchecked checkbox
                this.buildTreeData(rootNode, child, rootIsUncheckedCheck);
            }
        }

        return rootNode;
    }

    protected createGuiElement(treeNodeData: TreeNodeElement, shouldDisable: boolean = false) {
        switch (treeNodeData.type) {
            case GuiTypes.group:
                return this.createGroup(treeNodeData, shouldDisable);
            case GuiTypes.check:
                return this.createCheckbox(treeNodeData, shouldDisable);
            case GuiTypes.dropdown:
                return this.createCombobox(treeNodeData, shouldDisable);
            case GuiTypes.edit:
                return this.createEdit(treeNodeData, shouldDisable);
            default:
                return this.createText(treeNodeData, shouldDisable);
        }
    }

    public render(): React.ReactNode {
        this.keyboardNav.resetVisibleKeys();

        if (this.state.noAnnotationsFound) {
            return <div>
                <h2>{'No '}
                    <a href="https://open-cmsis-pack.github.io/Open-CMSIS-Pack-Spec/main/html/configWizard.html">{'Configuration Wizard Annotations'}</a>
                    {' found.'}</h2>
            </div>;
        }

        if (this.state.annotations === undefined) {
            return <div>loading</div>;
        }

        const rootNode = this.getTree();
        if (rootNode == undefined) {
            return <div>loading</div>;
        }

        const errorsText = this.getErrorsText(rootNode);

        const header = <div className='tree-table-header'>
            <Search
                className='tree-table-filter'
                placeholder='Search annotations'
                allowClear
                onInput={(event): void => {
                    const element = event.target as HTMLInputElement;
                    this.setState({ filter: element.value });
                }}
            />
        </div>;

        const filteredChildren = filterTree(rootNode.children, this.state.filter);
        const isDarkTheme = document.body.classList.contains('vscode-dark');

        return (
            <ConfigProvider
                theme={{
                    algorithm: isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
                }}>
                <div>
                    <TreeTable
                        value={filteredChildren}
                        header={header}
                        tableStyle={{ minWidth: '30rem' }}
                        expandedKeys={this.state.expandedKeys}
                        onToggle={(event: { value: Record<string, boolean> }) => {
                            this.pendingRefocus = true;
                            this.pendingRefocusKey = this.state.activeKey;
                            this.setState({ expandedKeys: event.value });
                        }}
                        // Apply dimming to the row itself; no extra wrappers in cells (keeps expanders aligned)
                        rowClassName={(node: DTreeNode) => {
                            const key = this.getNodeKey(node);
                            const lastTouchedKey = this.state.lastTouchedKey ?? this.state.activeKey;
                            const isLastTouched = key !== '' && key === lastTouchedKey;
                            const isInactive = isLastTouched && (!this.state.panelIsActive || !this.state.hasUserFocus);
                            const isActive = key !== '' && key === this.state.activeKey && this.state.panelIsActive && this.state.hasUserFocus;
                            return {
                                'tree-dimmed': !!node?.dimmed,
                                'cw-row-active': isActive,
                                'cw-row-inactive': isInactive,
                            };
                        }}
                    >
                        <Column
                            header='Option'
                            className='tree-table-column-name'
                            style={{ width: '50%' }}
                            expander
                            body={(data: TreeNode, _options: ColumnBodyOptions) => {
                                return this.createTextName(data.data as TreeNodeElement);
                            }}
                        />
                        <Column
                            header='Value'
                            style={{ width: '50%' }}
                            body={(data: TreeNode, _options: ColumnBodyOptions) => {
                                const treeNodeData = data.data as TreeNodeElement;
                                const isDimmed = (data as DTreeNode).dimmed || false;

                                // Only disable children of unchecked checkboxes, not the unchecked checkbox itself
                                const isUncheckedCheckbox = this.isUncheckedCheckbox(treeNodeData);
                                const shouldDisable = isDimmed && !isUncheckedCheckbox;

                                return this.createGuiElement(treeNodeData, shouldDisable);
                            }}
                        />
                    </TreeTable>
                    {errorsText}
                </div>
            </ConfigProvider>
        );
    }

    protected getInfoItems(element: TreeNodeElement): string {
        if (element.infoItems === undefined) {
            return '';
        }

        const infos = element.infoItems.join('\n');

        return infos;
    }

    protected createCombobox(element: TreeNodeElement, shouldDisable: boolean = false): React.ReactElement {
        // const options = this.getComboDropItems(element);
        const infos = this.getInfoItems(element);
        const key = this.getElementKey(element);

        // Determine whether the currently selected value exists in the available options
        const dropItems = element.dropItems ?? [];
        const selectedValue = element.value?.value ?? '';
        const hasMatch = dropItems.includes(selectedValue);
        const isInvalid = selectedValue !== '' && !hasMatch;
        const hasOverflow = element.value?.overflow === true;
        const overflowValue = element.value?.overflowValue;
        const extractedValue = element.value?.extractedValue;
        const bitWidth = element.value?.bitWidth;

        // If there's no matching option, inject a temporary "missing" option so the selection is visible
        if (isInvalid) {
            // options.unshift(
            //     <VSCodeOption key="__missing__" value={selectedValue} selected>
            //         {`${selectedValue} (not in list)`}
            //     </VSCodeOption>
            // );
        }

        let tooltipMessage = infos;
        if (hasOverflow) {
            const displayValue = overflowValue ?? extractedValue ?? selectedValue;
            tooltipMessage = `Value '${displayValue}' overflows ${bitWidth} bits`;
        } else if (isInvalid) {
            const displayValue = extractedValue !== undefined ? extractedValue : selectedValue;
            tooltipMessage = `Value '${displayValue}' is not in the list`;
        }

        return (
            <div ref={this.keyboardNav.registerValueRef(key)} onFocusCapture={() => this.handleUserFocus(key)}>
                <CompactDropdown
                    disabled={element.value.readOnly || shouldDisable}
                    selected={selectedValue}
                    available={dropItems}
                    style={{ width: '100%' }}
                    onChange={(value) => {
                        // const selectElement = event.target as HTMLSelectElement;
                        // this.inputDropdown(selectElement, element);
                        element.newValue.value = value;
                        // Immediate local update for consistent behavior with checkbox and text field
                        element.value.value = value;
                        this.forceUpdate();
                        // Toggle forceRender to trigger React re-render
                        this.setState(prevState => ({ forceRender: !prevState.forceRender }));
                        this.messenger.sendNotification(saveElement, HOST_EXTENSION, { documentPath: this.state.documentPath, element, noAnnotationsFound: false });
                    }}
                    title={tooltipMessage}
                    warning={isInvalid || hasOverflow ? tooltipMessage : undefined}
                />
            </div>
        );
    }
    protected createGroup(element: TreeNodeElement, _shouldDisable: boolean = false): React.ReactElement {
        const infos = this.getInfoItems(element);
        const option = <label
            title={infos}
        >
            {element.value.value}
        </label>;
        return (
            <div>{option}</div>
        );
    }

    protected createCheckbox(element: TreeNodeElement, shouldDisable: boolean = false): React.ReactElement {
        const checked = element.value.checked ? true : false;
        const infos = this.getInfoItems(element);
        const isInconsistent = element.value.inconsistent === true;
        const key = this.getElementKey(element);

        const tooltipText = isInconsistent
            ? `Inconsistent comment state detected: Some lines in this code block are commented while others are not.\n\nToggling this checkbox will force ALL lines to the same state.\n\n${infos}`
            : infos;

        const option = (
            <Checkbox
                className={isInconsistent ? 'checkbox-inconsistent' : undefined}
                disabled={element.value.readOnly || shouldDisable}
                onClick={(event) => {
                    const inputElement = event.currentTarget as HTMLInputElement;
                    this.toggleChecked(inputElement, element);
                }}
                onKeyDown={(event) => {
                    if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Space') {
                        event.preventDefault();
                        event.stopPropagation();
                        (event.currentTarget as HTMLElement).click();
                        return;
                    }
                    if (this.keyboardNav.onValueKeyDown(event, key)) {
                        return;
                    }
                    this.onKeyDownFilter(event);
                }}
                checked={checked}
                title={tooltipText}
            />
        );
        return (
            <div ref={this.keyboardNav.registerValueRef(key)} onFocusCapture={() => this.handleUserFocus(key)}>{option}</div>
        );
    }

    protected createEdit(element: TreeNodeElement, shouldDisable: boolean = false): React.ReactElement {
        const infos = this.getInfoItems(element);
        const key = this.getElementKey(element);
        const option = <Input
            value={element.value.value}
            disabled={element.value.readOnly || shouldDisable}
            readOnly={element.value.readOnly || shouldDisable}
            title={infos}
            onChange={e => {
                element.value.value = (e.target as HTMLInputElement).value;
                this.forceUpdate();
            }}
            onInput={(event) => {
                const inputElement = event.target as HTMLInputElement;
                // Update local state immediately for UI responsiveness
                element.value.value = inputElement.value;

                // On first keystroke: mark document as dirty (for dirty dot indicator) without saving
                if (this.editedFieldId === undefined) {
                    this.editedFieldId = element.guiId;
                    // Mark document as dirty without saving to disk
                    this.messenger.sendNotification(markDocumentDirty, HOST_EXTENSION, { documentPath: this.state.documentPath });
                }
            }}
            onBlur={(event) => {
                const inputElement = event.target as HTMLInputElement;
                // Only save if field was actually edited
                if (this.editedFieldId === element.guiId) {
                    this.onEditChange(inputElement, element);
                    this.editedFieldId = undefined;
                }
            }}
            onKeyDown={(event) => {
                if (this.keyboardNav.onValueKeyDown(event, key)) {
                    return;
                }
                this.onKeyDownFilter(event);
                const inputElement = event.target as HTMLInputElement;
                const saveClicked = (event.ctrlKey || event.metaKey) && event.key === 's';
                // Save on Enter or Ctrl+S (Windows/Linux) or Cmd+S (macOS)
                if (event.key === 'Enter' || saveClicked) {
                    // Clear edited state and save to backend
                    this.editedFieldId = undefined;
                    this.onEditChange(inputElement, element);
                    if (saveClicked) {
                        // Prevent the browser's default save dialog from appearing when using Ctrl+S/Cmd+S in the textbox
                        event.preventDefault();
                        // Remove focus from the textbox
                        inputElement.blur();
                    }
                }
            }}
        />;
        return (
            <div ref={this.keyboardNav.registerValueRef(key)} onFocusCapture={() => this.handleUserFocus(key)}>{option}</div>
        );
    }

    protected createText(element: TreeNodeElement, _shouldDisable: boolean = false): React.ReactElement {
        const infos = this.getInfoItems(element);
        return (
            <label
                title={infos}
            >
                {element.value.value}</label>
        );
    }

    protected createTextName(element: TreeNodeElement): React.ReactElement {
        const infos = this.getInfoItems(element);
        const key = this.getElementKey(element);
        this.keyboardNav.addVisibleKey(key);
        const isActive = this.keyboardNav.isActiveKey(key, this.state.activeKey);
        return (
            <span
                className='cw-row-focus'
                tabIndex={isActive ? 0 : -1}
                ref={this.keyboardNav.registerRowRef(key)}
                onMouseDown={(event) => {
                    if (event.button !== 0) {
                        return;
                    }
                    this.handleRowPointerActivate(key);
                }}
                onFocus={() => {
                    if (this.pendingRefocus) {
                        return;
                    }
                    this.handleUserFocus(key);
                }}
                onKeyDown={(event) => this.keyboardNav.onRowKeyDown(event, key)}
                title={infos}
            >
                {element.name}
            </span>
        );
    }

    private toggleChecked(checkBox: HTMLInputElement, element: TreeNodeElement) {
        const isChecked = checkBox.checked;
        element.newValue.value = isChecked ? '1' : '0';

        // Immediate UI feedback (no re-fetch): update model and re-render
        element.value.checked = isChecked;
        // Toggle forceRender to trigger React re-render
        this.setState(prevState => ({ forceRender: !prevState.forceRender }));

        this.messenger.sendNotification(saveElement, HOST_EXTENSION, { documentPath: this.state.documentPath, element, noAnnotationsFound: false });
    }

    private onEditChange(edit: HTMLInputElement | HTMLTextAreaElement, element: TreeNodeElement) {
        // - element.newValue.value: used for backend save logic
        element.newValue.value = edit.value;
        // - element.value.value: used for immediate UI update (VSCodeTextField value property)
        element.value.value = edit.value;
        this.messenger.sendNotification(saveElement, HOST_EXTENSION, { documentPath: this.state.documentPath, element, noAnnotationsFound: false });
    }

    /**
     * Filters 'keydown' event for navigation keys and stops event propagation if matches.
     * This keeps TreeTable to avoid using them for navigation through the tree while for
     * example editing in an edit box.
     */
    protected onKeyDownFilter(event: React.KeyboardEvent) {
        if (NAVIGATION_KEYS.includes(event.key)) {
            event.stopPropagation();
        }
    }
}
