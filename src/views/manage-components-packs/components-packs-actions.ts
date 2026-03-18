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

import path, { dirname } from 'path';
import { CsolutionService, CtAggregate, CtRoot, PackReference } from '../../json-rpc/csolution-rpc-client';
import { backToForwardSlashes } from '../../utils/path-utils';
import { MessageProvider } from '../../vscode-api/message-provider';
import { ComponentRowDataType } from './data/component-tools';
import { componentTreeWalker } from './data/component-tree-walker';
import { parsePackId } from './data/pack-parse';
import { Project } from './components-data';

export const normalizeForCompare = (value: string): string => {
    return backToForwardSlashes(value.toLowerCase());
};

export type CurrentProject = { solutionPath: string, project: Project } | undefined;

/**
 * A collection of methods used to update the UI from the webview manager.
 *
 * The ManageComponentsActions class is responsible for managing the actions related to software components in a project.
 * It provides methods to apply a set of components, change component values, variants, and bundles.
 * It also offloads the communication with the webview manager and the cSolution service.
 */
export class ComponentsPacksActions {
    private csolutionService?: CsolutionService;
    private messageProvider?: MessageProvider;
    private currentProject: CurrentProject;

    /**
     * Sets the cSolution service to communicate with the cSolution RPC server.
     * @param csolutionService The cSolution service to communicate with the cSolution RPC server.
     * @returns void
     */
    setCsolutionService(csolutionService: CsolutionService) {
        this.csolutionService = csolutionService;
    }

    /**
     * Sets the message provider to communicate with the message API.
     * @param messageProvider The message provider to communicate with the message API.
     * @returns void
     */
    setMessageProvider(messageProvider: MessageProvider) {
        this.messageProvider = messageProvider;
    }

    setCurrentProject(currentProject: CurrentProject) {
        this.currentProject = currentProject;
    }

    private async getUsedPacks(activeContext: string) {
        const usedItems = await this.csolutionService?.getUsedItems({ context: activeContext });
        return usedItems?.packs ?? [];
    }

    private async applyPackSelection(
        activeContext: string,
        pack: PackReference,
        next: { selected: boolean; origin?: string; packId?: string },
    ) {
        pack.selected = next.selected;
        if (next.origin !== undefined) {
            pack.origin = next.origin;
        }
        if (next.packId !== undefined) {
            pack.pack = next.packId;
        }
        await this.csolutionService?.selectPack({ context: activeContext, pack });
    }

    async unselectPackage(activeContext: string, target: string, packId: string) {
        const normalizedTarget = normalizeForCompare(target);
        const packs = await this.getUsedPacks(activeContext);

        const packsToUnselect = packs.filter(p =>
            (p.resolvedPack === packId || p.pack === packId)
            && normalizeForCompare(p.origin) === normalizedTarget
        );

        for (const pack of packsToUnselect) {
            await this.applyPackSelection(activeContext, pack, { selected: false });
        }
    }

    async selectPackage(activeContext: string, target: string, packId: string) {
        const usedPacks = await this.getUsedPacks(activeContext);
        const lpack = parsePackId(packId);
        const normalizedTarget = normalizeForCompare(target);
        const matchingVendorAndName = usedPacks.filter(p => {
            const lp = parsePackId(p.pack || '');
            return lp?.packName === lpack?.packName
                && lp?.vendor === lpack?.vendor;
        });
        let pack = matchingVendorAndName.find(p => normalizeForCompare(p.origin) === normalizedTarget)
            ?? matchingVendorAndName.at(0);

        if (!pack) { // not found in used packs, create a new entry
            const packs = await this.csolutionService?.getPacksInfo({ context: activeContext, all: true });
            const newPack = packs?.packs.find(p => p.id.startsWith(packId));

            pack = {
                pack: packId,
                resolvedPack: newPack?.id || packId,
                origin: normalizeForCompare(target),
                selected: true,
            };
        }
        if (pack) {
            if (pack.pack !== packId) {
                await this.unselectPackage(activeContext, target, pack.pack || '');
            }

            await this.applyPackSelection(
                activeContext,
                pack,
                { selected: true, origin: target, packId }
            );
        }
    }

    /**
     * Changes the value of a component in the component tree.
     * It updates the selected count of the component and sends a message to the webview manager.
     * It also communicates with the cSolution service to select the component.
     * @param activeContext The active context of the project.
     * @param componentTree The component tree to change the value in.
     * @param componentData The component data to change the value of.
     * @returns void
     * @throws Will throw an error if the cSolution service is not set.
     */
    public async changeComponentValue(
        activeContext: string,
        componentTree: CtRoot,
        componentData: ComponentRowDataType
    ): Promise<void> {
        if (!this.csolutionService) {
            throw new Error('CSolutionService is not set');
        }

        componentTreeWalker(componentTree, async (node, type) => {
            const lnode = (node as CtAggregate);
            if (type === 'aggregate' && componentData.aggregate?.id === lnode.id) {
                const options = (componentData.aggregate.options);
                try {
                    const ret = await this.csolutionService!.selectComponent({
                        context: activeContext,
                        id: componentData.aggregate.id,
                        count: componentData.aggregate.selectedCount ?? 0,
                        options: options || {},
                    });
                    if (!ret) {
                        await this.handleRpcLogMessages();
                    }
                } catch (err) {
                    const error = err as Error;
                    await this.messageProvider?.showErrorMessage(error.message);
                    console.error('Error selecting component:', error);
                    await this.handleRpcLogMessages();
                }

                lnode.selectedCount = componentData.aggregate?.selectedCount;
                lnode.options = options;
            }
        });
    }

    /**
     * Changes the variant of a component in the component tree.
     * It updates the active variant of the component and sends a message to the webview manager.
     * It also communicates with the cSolution service to select the variant.
     * @param activeContext The active context of the project.
     * @param componentTree The component tree to change the variant in.
     * @param componentData The component data to change the variant of.
     * @param selectedVariant The new variant to set for the component.
     * @returns void
     * @throws Will throw an error if the cSolution service is not set.
     */
    public async changeComponentVariant(
        activeContext: string,
        componentData: ComponentRowDataType,
        selectedVariant: string
    ): Promise<void> {
        if (!this.csolutionService) {
            throw new Error('CSolutionService is not set');
        }

        if (selectedVariant === componentData.aggregate.activeVariant) {
            return; // No change needed if the variant is already selected
        }

        try {
            const ret = await this.csolutionService.selectVariant({
                context: activeContext,
                id: componentData.aggregate.id,
                variant: selectedVariant
            });
            if (!ret) {
                await this.handleRpcLogMessages();
            }
        } catch (err) {
            const error = err as Error;
            await this.messageProvider?.showErrorMessage(error.message);
            console.error('Error selecting variant:', error);
            await this.handleRpcLogMessages();
        }
    }

    /**
     * Changes the bundle of a component in the component tree.
     * It updates the active variant of the component and sends a message to the webview manager.
     * It also communicates with the cSolution service to select the bundle.
     * @param activeContext The active context of the project.
     * @param componentTree The component tree to change the bundle in.
     * @param componentData The component data to change the bundle of.
     * @param bundle The new bundle to set for the component.
     * @returns void
     * @throws Will throw an error if the cSolution service is not set.
     */
    public async changeBundle(
        activeContext: string,
        componentData: ComponentRowDataType,
        bundle: string,
    ): Promise<boolean> {
        if (!this.csolutionService) {
            throw new Error('CSolutionService is not set');
        }

        if (bundle === componentData.parsed.variant) {
            return true; // No change needed if the bundle is already selected
        }

        try {
            const success = await this.csolutionService.selectBundle({
                context: activeContext,
                cclass: componentData.parsed.class,
                bundle: bundle
            });
            if (!success) {
                await this.handleRpcLogMessages();
            }
            return success.success;
        } catch (err) {
            const error = err as Error;
            await this.messageProvider?.showErrorMessage(error.message);
            console.error('Error selecting bundle:', error);
            await this.handleRpcLogMessages();
            return false;
        }
    }

    /**
     * Handles log messages from the cSolution service.
     * It retrieves the log messages and shows them as warnings or errors using the message provider.
     * @returns void
     */
    private async handleRpcLogMessages() {
        if (this.messageProvider && this.csolutionService) {
            const messages = await this.csolutionService.getLogMessages();
            setTimeout(() => {
                messages?.warnings?.forEach(async warning => await this.messageProvider!.showWarningMessage(warning));
                messages?.errors?.forEach(async error => await this.messageProvider!.showErrorMessage(error));
            }, 1000);
        }
    }

    /**
    * Layer paths in the UI are required to be relative to the solution. This method converts absolute paths to relative ones.
    * @param componentTree The component tree to normalize.
    * @returns The component tree with normalized layer paths.
s    */
    public mapComponentsFromService(componentTree: CtRoot): CtRoot {
        const basePath = dirname(this.currentProject?.solutionPath ?? '');

        const processLayerPaths = (aggregates: CtAggregate[] | undefined) => {
            aggregates
                ?.forEach(aggregate => {
                    if (!aggregate.options) {
                        aggregate.options = {};
                    }
                    if (aggregate.options.layer) {
                        aggregate.options.layer = backToForwardSlashes(path.relative(basePath, aggregate.options.layer || ''));
                    } else {
                        aggregate.options.layer = backToForwardSlashes(path.relative(basePath, this.currentProject?.project.projectId || ''));
                    }
                });
        };

        componentTree.classes.forEach(cclass => {
            cclass.bundles?.forEach(bundle => {
                bundle.cgroups?.forEach(group => {
                    processLayerPaths(group.aggregates);
                    group.cgroups?.forEach(subgroup => {
                        processLayerPaths(subgroup.aggregates);
                    });
                });
                processLayerPaths(bundle.aggregates);
            });
        });
        return componentTree;
    }

}
