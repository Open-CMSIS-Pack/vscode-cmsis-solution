/**
 * Copyright 2024-2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import path from 'path';
import { DebugAdapter, DebugAdaptersYamlFile, loadDebugAdaptersYml, UISection, UISectionChildren } from '../../debug/debug-adapters-yaml-file';
import { ETextFileResult } from '../../generic/text-file';
import { ETreeItemKind } from '../../generic/tree-item';
import { Optional } from '../../generic/type-helper';
import { DebuggerWrap, ImageWrap, ProjectRefWrap, TargetSetWrap, TargetTypeWrap } from '../../solutions/files/csolution-wrap';
import { CSolutionYamlFile } from '../../solutions/files/csolution-yaml-file';
import { SolutionManager } from '../../solutions/solution-manager';
import * as fsUtils from '../../utils/fs-utils';
import { getFileNameNoExt } from '../../utils/path-utils';
import { extractSuffix, stripTwoExtensions } from '../../utils/string-utils';
import { CmsisSettingsJsonFile } from './../../global/cmsis-settings-json-file';
import { GenericPropertyList, getSelectedTargetSet, ImageSelection, ProjectSelection, SolutionData, TargetSet, TargetType } from './view/state/manage-solution-state';
import { CsolutionService } from '../../json-rpc/csolution-rpc-client';

export type CustomDebugAdapterDefaults = { [adapterName: string]: { [propertyName: string]: string | number } };

/**
 * Class to connect Csolution model represented by CsolutionYmlFile with ManageSolutionWebviewMain
 */
export class ManageSolutionController {
    private readonly _csolutionYml = new CSolutionYamlFile();
    private readonly _cmsisJsonFile = new CmsisSettingsJsonFile();
    private debugAdaptersYmlFile?: DebugAdaptersYamlFile = undefined;
    private defaultDebugAdapterName: string = '';
    private debugAdaptersCache: DebugAdapter[] = [];
    private availableCoreNamesCache: string[] = [];
    public customDebugAdapterDefaults: CustomDebugAdapterDefaults = {};
    private _csolutionService?: CsolutionService;

    public get csolutionService(): CsolutionService {
        if (!this._csolutionService) {
            throw new Error('CsolutionService has not been initialized on ManageSolutionController');
        }
        return this._csolutionService;
    }

    public set csolutionService(service: CsolutionService) {
        this._csolutionService = service;
    }
    constructor() {
    }

    public get csolutionYml() {
        return this._csolutionYml;
    }

    public get cmsisJsonFile() {
        return this._cmsisJsonFile;
    }

    public get solutionPath() {
        return this.csolutionYml.fileName;
    }

    public get solutionName() {
        return getFileNameNoExt(this.solutionPath);
    }

    public get solutionDir() {
        return this.csolutionYml.fileDir;
    }

    async loadSolution(csolutionPath?: string, defaultDebugAdapterName?: string) {

        this.defaultDebugAdapterName = defaultDebugAdapterName ?? '';
        if (!this.debugAdaptersYmlFile) {
            this.debugAdaptersYmlFile = await loadDebugAdaptersYml();
        }
        const result = await this.csolutionYml.load(csolutionPath);
        this.cmsisJsonFile.solutionPath = this.solutionPath;
        await this.cmsisJsonFile.load();
        return result;
    }

    /**
     * Saves csolution.yml and cmsis.json files
     * @returns result of saving csolution file
     */
    async saveSolution(solutionManager: SolutionManager) {
        // remove deprecated .cbuild-set.yml file
        const cbuildSetYmlFileName = stripTwoExtensions(this.solutionPath) + '.cbuild-set.yml';
        fsUtils.deleteFileIfExists(cbuildSetYmlFileName);

        const csolution = solutionManager.getCsolution();
        if (!csolution) {
            return;
        }
        // purge images that refer to non-existing projects (i.e. the project was renamed/deleted)
        this.csolutionYml.purgeAllProjectContexts();

        // directly copy content to global files
        const cmsisJsonRes = csolution.cmsisJsonFile.copyFrom(this.cmsisJsonFile);
        if (cmsisJsonRes !== ETextFileResult.Unchanged) {
            await this.cmsisJsonFile.save();
        }
        const solutionRes = csolution.csolutionYml.copyFrom(this.csolutionYml);
        if (solutionRes !== ETextFileResult.Unchanged) {
            await this.csolutionYml.save();
        } else if (cmsisJsonRes !== ETextFileResult.Unchanged) {
            await solutionManager.refresh(); // trigger reload and cbuild-setup run
        }
    }

    public get activeTargetTypeWrap(): TargetTypeWrap | undefined {
        return this.csolutionYml.getTargetType(this.activeTargetTypeName);
    }

    public set activeTargetTypeName(type: string) {
        this.cmsisJsonFile.activeTargetTypeName = type;
    }

    public get activeTargetTypeName(): string | undefined {
        return this.cmsisJsonFile.activeTargetTypeName ?? this.csolutionYml.getTargetType()?.name;
    }

    public get activeTargetSetName(): string | undefined {
        const targetSetIdx = this.cmsisJsonFile.getSelectedSet(this.activeTargetTypeName ?? '');
        return this.activeTargetTypeWrap?.getTargetSetFromIndex(targetSetIdx)?.name;
    };

    public get activeTargetSetWrap(): TargetSetWrap {
        let ts = this.getSelectedSetWrap(this.activeTargetTypeWrap);

        if (!ts) {
            ts = this.csolutionYml.ensureTargetTypeAndSet(this.activeTargetTypeName ?? '', this.activeTargetSetName);
        }
        return ts;
    }

    public getSelectedSetWrap(tt?: TargetTypeWrap): TargetSetWrap | undefined {
        if (!tt) {
            return undefined;
        }
        const targetSetIdx = this.cmsisJsonFile.getSelectedSet(tt?.name ?? '');
        return tt.getTargetSetFromIndex(targetSetIdx);
    }

    public setActiveTargetSet(targetType: string, targetSet?: string) {
        this.csolutionYml.ensureTargetTypeAndSet(targetType, targetSet);
        const active = this.getActiveTypeAndSetNames();
        if (active.type === targetType && active.set === targetSet) {
            return false;
        }
        this.activeTargetTypeName = targetType;
        const solutionDisplayName = this.cmsisJsonFile.solutionDisplayName;
        if (targetSet) {
            const targetSetIndex = Math.max(0, this.activeTargetTypeWrap?.targetSetNames.indexOf(targetSet) ?? 0);
            this.cmsisJsonFile.set(`targetSet.${solutionDisplayName}.${targetType}`, targetSetIndex);
        } else {
            this.cmsisJsonFile.delete(`targetSet.${solutionDisplayName}.${targetType}`);
        }
        return true;
    }

    public getActiveTypeAndSetNames(): { type: string, set: string } {
        const type = this.activeTargetTypeWrap;
        const set = this.getSelectedSetWrap(type);
        return {
            type: type?.name ?? '',
            set: set?.name ?? ''
        };
    }

    // debugger support
    public get activeDebugger() {
        return this.activeTargetSetWrap.debugger;
    }

    public get activeDebuggerName() {
        return this.resolvedDebuggerName(this.activeTargetSetWrap.debugger?.name);
    }

    /**
     * Returns official debug adapter name if resolved
     * @param name debugger name or alias
     * @returns debug adapter name if found or supplied name
     */
    public resolvedDebuggerName(name?: string) {
        if (!name) {
            return '';
        }
        // name can be an alias: obtain adapter name
        const adapter = this.debugAdaptersYmlFile?.getAdapterByName(name);
        if (adapter && adapter.name !== name) {
            return adapter.name;
        }
        return name;
    }

    /**
     * Replaces stored debugger name alias to the adapter name (if needed)
     * @param debuggerWrap debugger Wrap to process
     * @returns supplied debuggerWrap
     */
    protected adjustDebuggerName(debuggerWrap?: DebuggerWrap) {
        if (debuggerWrap) {
            const adapterName = this.resolvedDebuggerName(debuggerWrap.name);
            if (adapterName && adapterName !== debuggerWrap.name) {
                debuggerWrap.name = adapterName; // replace alias with adapter name
            }
        }
        return debuggerWrap;
    }

    public enableDebugger(enable: boolean, name?: string) {
        if (enable) {
            this.setSelectedDebugger(name ?? this.defaultDebuggerName);
        } else {
            this.activeTargetSetWrap.debugger?.remove();
        }
    }

    public isDebuggerSectionEnabled(section: string): boolean {
        return this.activeTargetSetWrap.ensureDebugger().isSectionEnabled(section);
    }

    public async toggleDebugAdapterSection(section: string) {
        const adapter = this.debugAdaptersYmlFile?.getAdapterByName(this.activeDebuggerName);
        this.customizeDebugAdapterDefaults(adapter);
        const availableCores = await this.getAvailableCoreNames();
        const uiSection = adapter?.['user-interface']?.find(sec => sec['yml-node'] === section);
        const defaults = uiSection ? this.buildSectionDefaults(uiSection, availableCores) : {};
        this.activeTargetSetWrap.ensureDebugger().toggleSection(section, defaults);
    }

    public get defaultDebuggerName() {
        return this.defaultDebugAdapterName ||
            this.debugAdaptersYmlFile?.debugAdapters[0]?.name || '';
    }

    public async getAvailableCoreNames(): Promise<string[]> {
        const availableCores = this.activeTargetTypeWrap?.device
            ? (await this.csolutionService.getDeviceInfo({ id: this.activeTargetTypeWrap?.device || '' })).device?.processors?.map((p: { name?: string; core: string }) => p.name || '') || []
            : [];
        this.availableCoreNamesCache = availableCores;
        return availableCores;
    }

    public get availableCoreNames(): string[] {
        return this.availableCoreNamesCache;
    }

    public get debugAdapters(): Promise<DebugAdapter[]> {
        if (this.debugAdaptersCache.length === 0) {
            return this.refreshDebugAdapters();
        }
        return Promise.resolve(this.debugAdaptersCache);
    }

    public async refreshDebugAdapters(): Promise<DebugAdapter[]> {
        const adapters = this.debugAdaptersYmlFile?.debugAdapters ?? [];
        const availableCores = await this.getAvailableCoreNames();
        adapters.forEach(da => this.customizeDebugAdapterDefaults(da));
        adapters.forEach(da => {
            da['user-interface']?.forEach(section => {
                if (section['pname-options'] !== undefined) {
                    section.options = this.expandPnameOptions(section, availableCores);
                }
            });
        });
        this.debugAdaptersCache = adapters;
        return adapters;
    }

    public setDebuggerParameter(section: string | undefined, param: string, value: string | number) {
        this.activeTargetSetWrap.ensureDebugger().setParameter(section, param, value.toString());
    }

    private expandPnameOptions(section: UISection, availableCores: string[]): UISectionChildren[] {
        if (section['pname-options'] === undefined) {
            return section.options;
        }
        if (availableCores.length === 0) {
            return section.options.map(option => ({ ...option, pname: '' }));
        }
        return availableCores.flatMap(core => section.options.map(option => ({ ...option, pname: core })));
    }

    private buildSectionDefaults(section: UISection, availableCores: string[]): Record<string, string | Record<string, string>> {
        const defaults: Record<string, string | Record<string, string>> = {};
        const options = this.expandPnameOptions(section, availableCores);

        if (section['pname-options'] !== undefined) {
            if (availableCores.length > 1) {
                options.forEach(option => {
                    if (option.default !== undefined) {
                        const core = option.pname ?? '';
                        if (!defaults[core]) {
                            defaults[core] = { pname: core };
                        }
                        (defaults[core] as Record<string, string>)[option['yml-node'] as string] = option.default.toString();
                    }
                });
            } else {
                options.forEach(option => {
                    if (option.default !== undefined) {
                        if (!defaults['']) {
                            defaults[''] = {};
                        }
                        (defaults[''] as Record<string, string>)[option['yml-node'] as string] = option.default.toString();
                    }
                });
            }
            return defaults;
        }

        options.forEach(option => {
            if (option.default !== undefined) {
                defaults[option['yml-node'] as string] = option.default.toString();
            }
        });
        return defaults;
    }

    public async setDebuggerParameterWithPname(section: string | undefined, pname: string, param: string, value: string | number) {
        if ((await this.getAvailableCoreNames()).length === 0) {
            const sequence = this.activeTargetSetWrap.ensureDebugger().item
                ?.createChild(section, true)
                ?.setKind(ETreeItemKind.Sequence);
            let child = sequence?.getChildren(true)?.at(0);
            if (!child) {
                child = sequence?.createChild('', true);
            }
            child?.setValue(param, value as string);
        } else {
            this.activeTargetSetWrap.ensureDebugger().item
                ?.createChild(section, true)
                ?.setKind(ETreeItemKind.Sequence)
                ?.getChildByValue('pname', pname)
                ?.setValue(param, value as string);
        }

    }

    /**
     * Build a SolutionData object from a CSolutionYmlFile
     */
    public get solutionData(): SolutionData {
        const { targets, selectedTarget } = this.collectTargets();
        const projects = this.collectProjects();
        const selectedTargetSet = getSelectedTargetSet(selectedTarget);
        return {
            solutionName: this.solutionName,
            solutionPath: this.solutionPath,
            targets: targets,
            selectedTarget: selectedTarget,
            projects: projects,
            images: selectedTargetSet?.images,
            availableCoreNames: this.availableCoreNames,
        };
    }

    private collectTargets() {
        const targets: TargetType[] = [];
        let selectedTarget: TargetType | undefined = undefined;
        const selectedTargetName = this.activeTargetTypeName;
        for (const tt of this.csolutionYml.targetTypes) {
            const ttm = this.targetTypeWrapToModel(tt);
            targets.push(ttm);
            if (tt.name === selectedTargetName) {
                selectedTarget = ttm;
            }
        }
        return { targets, selectedTarget };
    }

    private targetTypeWrapToModel(tt: TargetTypeWrap): TargetType {
        return {
            name: tt.name,
            board: tt.board,
            device: tt.device,
            compiler: tt.getValue('compiler'),
            targetSets: this.collectTargetSets(tt),
            selectedSet: this.getSelectedSetWrap(tt)?.name,
        };
    }

    private collectProjects() {
        const projects: ProjectSelection[] = [];
        for (const pr of this.csolutionYml.projectRefs) {
            const projectContext = this.activeTargetSetWrap?.findProjectContext(pr.projectName);
            const prj = this.projectRefWrapToProjectSelection(pr, projectContext);
            projects.push(prj);
        }
        return projects;
    }

    private projectRefWrapToProjectSelection(pr: ProjectRefWrap, projectContext?: ImageWrap): ProjectSelection {
        const buildTypes = this.csolutionYml.buildTypeNames;
        let buildType = extractSuffix(projectContext?.projectContext, '.');
        if (!buildType && buildTypes.length > 0) {
            buildType = buildTypes[0];
        }
        const projectName = pr.projectName;
        const cproject = this.csolutionYml.getProject(projectName);
        return {
            name: pr.projectName,
            path: pr.projectPath,
            selected: !!projectContext,
            load: projectContext?.load,
            selectedBuildType: buildType,
            buildTypes: buildTypes,
            device: cproject?.deviceProcessor || pr.deviceProcessor,
            projectType: cproject?.projectType || pr.projectType,
        };
    }


    private collectTargetSets(tt: TargetTypeWrap): TargetSet[] {
        const targetSets: TargetSet[] = [];
        for (const ts of tt.targetSets) {
            targetSets.push(this.targetSetWrapToModel(ts));
        }
        return targetSets;
    }

    private targetSetWrapToModel(ts: TargetSetWrap): TargetSet {
        const debuggerWrap = this.adjustDebuggerName(ts.debugger); // alias to name;
        return {
            name: ts.name,
            images: this.imagesFromTargetSetWrap(ts),
            debugger: debuggerWrap?.object as GenericPropertyList,
        };
    }
    private imagesFromTargetSetWrap(ts?: TargetSetWrap): ImageSelection[] {
        const images: ImageSelection[] = [];
        if (ts) {
            for (const image of ts.imagesOnly) {
                images.push(this.imageWrapToImageSelection(image));
            }
        }
        return images;
    }

    private imageWrapToImageSelection(image: ImageWrap): ImageSelection {
        return {
            name: path.basename(image.name),
            path: image.name,
            selected: true,
            loadOffset: image.getValue('loadOffset'),
            load: image.load,
            device: image.device,
        };
    }

    /**
     * Set data from SolutionData object to CSolutionYmlFile
     */
    public set solutionData(selectedContextState: SolutionData) {

        this.setActiveTargetSet(selectedContextState.selectedTarget?.name ?? '', selectedContextState.selectedTarget?.selectedSet);
        const activeTargetSetWrap = this.activeTargetSetWrap;
        this.updateSelectedProjects(activeTargetSetWrap, selectedContextState.projects);
        this.updateSelectedImages(activeTargetSetWrap, selectedContextState.images ?? []);
        this.updateDebuggerFromSnapshot(selectedContextState);
        this.activeTargetSetWrap.purgeImages();
    }

    private updateDebuggerFromSnapshot(selectedContextState: SolutionData): void {
        const targetName = selectedContextState.selectedTarget?.name;
        const targetModel = selectedContextState.targets.find(t => t.name === targetName);
        const selectedSetName = targetModel?.selectedSet ?? selectedContextState.selectedTarget?.selectedSet;
        const targetSetModel = targetModel?.targetSets?.find(ts => ts.name === selectedSetName);
        const debuggerData = targetSetModel?.debugger;

        const targetSetWrap = this.activeTargetSetWrap;
        const existingDebugger = targetSetWrap.debugger;

        if (debuggerData) {
            const dbgWrap = targetSetWrap.ensureDebugger();
            dbgWrap.object = debuggerData;
        } else if (existingDebugger?.item && targetSetWrap.item) {
            targetSetWrap.item.removeChild(existingDebugger.item);
        }
    }

    private updateSelectedProjects(targetSetWrap: TargetSetWrap, projects: ProjectSelection[]) {
        for (const project of projects) {
            let projectContextWrap = targetSetWrap.findProjectContext(project.name);
            if (!project.selected) {
                projectContextWrap?.remove();
            } else {
                const contextName = project.name + (project.selectedBuildType ? ('.' + project.selectedBuildType) : '');
                if (!projectContextWrap) {
                    projectContextWrap = targetSetWrap.addProjectContext(contextName);
                }
                projectContextWrap.name = contextName; // updates context name, e.g. MyProject.Debug -> MyProject.Release
                projectContextWrap.load = project.load;
            }
        }
    }

    private updateSelectedImages(targetSetWrap: TargetSetWrap, images: ImageSelection[]) {
        const paths = images.map(img => img.path);
        // remove unselected images
        for (const imageWrap of targetSetWrap.imagesOnly) {
            if (!paths.includes(imageWrap.name)) {
                imageWrap.remove();
            }
        }
        // add new ones
        for (const image of images) {
            const imageWrap = targetSetWrap.ensureImage(image.path);
            imageWrap.load = image.load;
            imageWrap.device =
                (image.device && this.availableCoreNamesCache.includes(image.device))
                    ? image.device
                    : undefined;
        }
    }

    private customizeDebugAdapterDefaults(da: Optional<DebugAdapter>) {
        if (da && da.name in this.customDebugAdapterDefaults && da['user-interface']) {
            const customConfig = this.customDebugAdapterDefaults[da.name];
            for (const section of da['user-interface']) {
                for (const option of section.options) {
                    const yamlKey = [section['yml-node'], option['yml-node']].filter(s => s).join('.');
                    if (yamlKey in customConfig) {
                        option.default = customConfig[yamlKey];
                    }
                }
            }
        }
        return da;
    }

    public setSelectedDebugger(name: string) {
        const adapter = this.debugAdaptersYmlFile?.getAdapterByName(name);
        this.customizeDebugAdapterDefaults(adapter);

        // ultimately convert alias to real name
        const adapterName = adapter?.name ?? name;

        const selectedDebugger: Record<string, string | number> = { name: adapterName };

        const uiSection = adapter?.['user-interface']?.find(sec => sec['yml-node'] === undefined);
        uiSection?.options?.forEach(option => {
            if (option.default !== undefined) {
                switch (option.type) {
                    case 'number':
                        selectedDebugger[option['yml-node']] = option.default * (option.scale ?? 1);
                        break;
                    default:
                        selectedDebugger[option['yml-node']] = option.default;
                        break;
                }
            }
        });

        this.activeTargetSetWrap.ensureDebugger(adapterName).object = selectedDebugger;
    }
};
