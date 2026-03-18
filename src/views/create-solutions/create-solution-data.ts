/**
 * Copyright 2020-2026 Arm Limited
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

import { BoardId as CtBoardId, BoardImage, DeviceMemory, DeviceReference, Tz } from '../../core-tools/client/packs_pb';
import * as vscode from 'vscode';
import { BoardData, BoardId } from '../../data-manager/board-data';
import { DataManager } from '../../data-manager/data-manager';
import { DataSet } from '../../data-manager/dataset';
import { DeviceData, DeviceId } from '../../data-manager/device-data';
import { DraftProjectData, DraftProjectFormat, DraftProjectSource, DraftProjectType } from '../../data-manager/draft-project-data';
import { LazyPromise } from '../../generic/lazy';
import { TreeViewCategory, TreeViewItem } from '../common/components/tree-view';
import { buildTreeViewCategories } from '../common/components/tree-view-builder';
import { getDocUrlForAssetReference, getImageDataUrl } from '../webview-asset-retrieval';
import { WebviewManager } from '../webview-manager';
import { BoardHardwareOption, DeviceHardwareOption, HardwareInfo, MemoryInfo } from './cmsis-solution-types';
import * as Messages from './messages';
import { HardwareLists } from './messages';
import { DataManagerExample } from './view/state/reducer';
import { SemVer } from 'semver';
import { Optional } from '../../generic/type-helper';


export class CreateSolutionData {
    private readonly targetTreeCache;
    private readonly deviceMap;
    private readonly boardMap;
    private draftProjects: DataSet<DraftProjectData> | undefined = undefined;
    private draftProjectsQueried: [Optional<BoardId>, Optional<DeviceId>] = [undefined, undefined];

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly webviewManager: WebviewManager<Messages.IncomingMessage, Messages.OutgoingMessage>,
        private readonly dataManager: DataManager,
    ) {
        this.targetTreeCache = new LazyPromise(() => this.generateTargetTree());
        this.deviceMap = new LazyPromise(() => this.dataManager.getAllDevices());
        this.boardMap = new LazyPromise(() => this.dataManager.getAllBoards());
    }

    public reset() {
        this.draftProjects = undefined;
        this.targetTreeCache.reset();
        this.deviceMap.reset();
        this.boardMap.reset();
    }

    public async sendTargetData(): Promise<void> {
        this.webviewManager.sendMessage({ type: 'TARGET_DATA', data: await this.targetTreeCache, errors: this.dataManager.errors });
    }

    private async generateTargetTree(): Promise<HardwareLists> {
        const createDeviceItem = (device: DeviceData) : DeviceHardwareOption => {
            return {
                id: { name: device.name, vendor: device.vendor },
                key: device.id.key,
                pack: undefined,
                processors: [],
            };
        };

        const boardLabel = (board: BoardData) => {
            let label = board.name;
            if ((board.revision?.length ?? 0) > 0) {
                label = label.concat(` (${board.revision})`);
            }
            return label;
        };

        const createBoardItem = (board: BoardData) : BoardHardwareOption => {
            return {
                id: { name: board.name, vendor: board.vendor, revision: board.revision ?? '' },
                key: board.id.key,
                pack: undefined,
                mountedDevices: [],
                unresolvedDevices: []
            };
        };

        const [deviceMap, boardMap] = await Promise.all([this.deviceMap, this.boardMap]);
        const devices = buildTreeViewCategories(deviceMap, d => ({ label: d.name, value: createDeviceItem(d) }), d => d.vendor, d => d.family);
        const boards = buildTreeViewCategories(boardMap, b => ({ label: boardLabel(b), value: createBoardItem(b) }), b => b.vendor);

        return { devices, boards };
    }

    public async sendBoardInfo(boardId: CtBoardId.AsObject & { key: string }): Promise<void> {
        const convertTz = (tz?: boolean) => {
            switch (tz) {
                case undefined: return Tz.TZ_UNSPECIFIED;
                case false: return Tz.TZ_NO;
                case true: return Tz.TZ;
            }
        };

        const createDeviceInfo = async (device: DeviceData) : Promise<DeviceHardwareOption> => {
            const pack = await device.pack;
            const processors = await device.processors;
            return {
                id: { name: device.name, vendor: device.vendor },
                key: device.id.key,
                pack: { name: pack?.name ?? '', vendor: pack?.vendor ?? '', version: pack?.version ?? '' },
                processors: processors.map(p => ({ name: p.name, core: p.core, tz: convertTz(p.trustzone) })),
            };
        };

        const createBoardInfo = async (board: BoardData, mountedDevices: DeviceHardwareOption[], unresolvedDevices: DeviceReference.AsObject[]) : Promise<BoardHardwareOption> => {
            const pack = await board.pack;
            return {
                id: { vendor: board.vendor, name: board.name, revision: board.revision ?? '' },
                key: board.id.key,
                pack: { name: pack?.name ?? '', vendor: pack?.vendor ?? '', version: pack?.version ?? '' },
                mountedDevices,
                unresolvedDevices,
            };
        };

        const boardData = (await this.boardMap).get(boardId.key);
        if (boardData) {
            const deviceMap = await this.deviceMap;
            const devices = await boardData.devices;
            const mountedDevices = devices.map(d => deviceMap.get(d))
                .filter((d): d is DeviceData => !!d);
            const memories = await mountedDevices.at(0)?.memories || [];
            const resolvedDevices = await Promise.all(mountedDevices.map(d => createDeviceInfo(d)));
            const unresolvedDevices = devices.filter(d => !deviceMap.has(d));

            const data: HardwareInfo = {
                image: await this.getImage(await boardData?.image),
                memoryInfo: Object.fromEntries(memories.map(m => [ m.name, { size: m.size, count: 1 } ])),
                debugInterfacesList: await boardData.debugInterfaces,
                boardInfo: await createBoardInfo(boardData, resolvedDevices, unresolvedDevices),
            };
            this.webviewManager.sendMessage({ type: 'HARDWARE_INFO', data });
        }
    }

    public async sendDeviceInfo(deviceReference: DeviceReference.AsObject & { key: string }): Promise<void> {
        const createDeviceInfo = async (device: DeviceData) : Promise<DeviceHardwareOption> => {
            const pack = await device.pack;
            const processors = await device.processors;
            return {
                id: { name: device.name, vendor: device.vendor },
                key: device.id.key,
                pack: { name: pack?.name ?? '', vendor: pack?.vendor ?? '', version: pack?.version ?? '' },
                processors: processors.map(p => ({ name: p.name, core: p.core, tz: p.trustzone ? Tz.TZ : Tz.TZ_NO })),
            };
        };

        const device = (await this.deviceMap).get(deviceReference.key);
        if (device) {
            const data: HardwareInfo = {
                image: this.getImagePlaceholderPath(),
                debugInterfacesList: [],
                memoryInfo: Object.fromEntries((await device.memories).map(m => [ m.name, { size: m.size, count: 1 } ])),
                deviceInfo: await createDeviceInfo(device),
            };

            this.webviewManager.sendMessage({ type: 'HARDWARE_INFO', data });
        }
    }

    protected listedDraftProjects(draftProjects: DataSet<DraftProjectData>, fromAllPackVersions: boolean) : DraftProjectData[] {
        if (fromAllPackVersions) {
            return draftProjects.toArray();
        }
        const listedDrafts = [...draftProjects
            .toArray()
            .groupedBy(draft => draft.pack?.familyKey ?? '')
            .mapValues((drafts, key) => {
                if (key === '') {
                    return drafts;
                }
                const latestVersion = drafts
                    .map(d => d.pack?.version)
                    .filter(v => v !== undefined)
                    .sort((a, b) => {
                        const verA = new SemVer(a);
                        const verB = new SemVer(b);
                        return verB.compare(verA);
                    })
                    .at(0);
                return drafts.filter(draft => draft.pack?.version === latestVersion);
            })].flatMap(([, drafts]) => drafts);
        return listedDrafts;
    }

    public async sendDatamanagerAppsData(deviceId?: string, boardId?: string, fromAllPackVersions?: boolean): Promise<void> {
        const board = (await this.boardMap).id(boardId);
        const device = (await this.deviceMap).id(deviceId);

        if (this.draftProjects === undefined || this.draftProjectsQueried[0]?.key !== board?.key || this.draftProjectsQueried[1]?.key !== device?.key) {
            this.draftProjectsQueried = [board, device];
            this.draftProjects = await this.dataManager.getDraftProjects(board, device);
        }

        const listedDrafts = this.listedDraftProjects(this.draftProjects, fromAllPackVersions ?? false);

        const appsTree: Array<TreeViewCategory<string>> = this.generateDraftTree(new DataSet(listedDrafts));
        if (appsTree) {
            this.webviewManager.sendMessage({ type: 'DATAMANAGER_APPS_DATA', data: appsTree });
        }
    }

    private generateDraftTree(drafts: DataSet<DraftProjectData>) {
        const categoryMain = (draft: DraftProjectData): [string, number] => {
            switch (draft.draftSource) {
                case DraftProjectSource.Local:
                    return ['Local', 0];
                case DraftProjectSource.Web:
                    return ['Web', 1];
                default:
                    return ['Other', 100];
            }
        };

        const categorySub = (draft: DraftProjectData): [string, number] => {
            switch (draft.draftType) {
                case DraftProjectType.Example:
                    switch (draft.format) {
                        case DraftProjectFormat.Csolution:
                            return ['Csolution Examples', 2];
                        case DraftProjectFormat.uVision:
                            return ['uVision Examples', 3];
                    }
                    return ['Other Examples', 100];
                case DraftProjectType.RefApp:
                    return ['Reference Applications', 1];
                case DraftProjectType.Template:
                    return ['Templates', 0];
            }
        };

        const itemBuilder = (d: DraftProjectData): TreeViewItem<string> => {
            const packId = d.pack?.key;
            return {
                label: d.name,
                value: d.id.key,
                tooltip: d.description + (packId ? `\n(Pack: ${packId})` : ''),
            };
        };

        return buildTreeViewCategories(drafts, itemBuilder, categoryMain, categorySub);
    }

    public async getDraftProjectById(id: string) {
        if (this.draftProjects) {
            return this.draftProjects.get(id);
        }
        return undefined;
    }

    public async getDraftProjectInfo(id: string) {
        const draftProject = await this.getDraftProjectById(id);
        if (draftProject) {
            const data: DataManagerExample = { type: 'dataManagerApp', value: {
                name: draftProject.name,
                description: draftProject.description,
                objectId: id,
                draftType: draftProject.draftType,
            } };
            this.webviewManager.sendMessage({ type: 'DRAFTPROJECT_INFO', data });
        }
    }

    public async getImage(imagePath?: string) {
        if (imagePath) {
            let imageUri = vscode.Uri.file(imagePath);
            try {
                if (imagePath.match(/^[^/]+:\/\//)) {
                    imageUri = vscode.Uri.parse(imagePath, true);
                }
            } catch {
                // Ignore errors
            }
            if (imageUri.scheme === 'file') {
                const imageData : Uint8Array = await vscode.workspace.fs.readFile(imageUri);
                const base64 = Buffer.from(imageData).toString('base64');
                const ext = imageUri.path.split('.').pop() || 'png'; // Default to png if no extension
                return `data:image/${ext};base64,${base64}`;
            }
            return imageUri.toString();
        }
        return this.getImagePlaceholderPath();
    }

    public getImagePlaceholderPath(): string {
        // Get the local file path of the image
        const isDarkTheme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
        const svgPath = isDarkTheme ? 'hardware-placeholder-dark.svg' : 'hardware-placeholder-light.svg';

        const imageUri = vscode.Uri.joinPath(this.context.extensionUri, 'media', svgPath);
        return this.webviewManager.asWebviewUri(imageUri);
    }

    public async getImageUrl(boardImage: BoardImage.AsObject | undefined): Promise<string> {
        const imageReference = boardImage?.large ?? boardImage?.small;
        if (imageReference) {
            if (!imageReference.url) {
                return getDocUrlForAssetReference(imageReference);
            }
            try {
                return await getImageDataUrl(imageReference.url);
            } catch {
                // fall through
            }
        }
        return this.getImagePlaceholderPath();
    }

    public buildMemoryInfo(memoryList: DeviceMemory.AsObject[]): MemoryInfo {
        const memoryInfo: MemoryInfo = {};
        memoryList.forEach(memory => {
            memoryInfo[memory.name] = ({ size: memory.size , count: ((memoryInfo[memory.name])?.count || 0) + 1 });
        });
        return memoryInfo;
    }
}
