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

import { CTreeItem, ETreeItemKind } from '../../generic/tree-item';
import { CTreeItemWrap } from '../../generic/tree-item-wrapper';
import { matchesContext } from '../../utils/context-utils';
import { getFileNameNoExt } from '../../utils/path-utils';
import { extractPname, stripSuffix } from '../../utils/string-utils';
import { PROJECT_WEST_SUFFIX } from '../constants';

// Allowed load modes for an Image entry
export type LoadImageType = 'image+symbols' | 'symbols' | 'image' | 'none';

export class TypedWrap extends CTreeItemWrap {
    get type(): string { return this.getValue(this.nameKey) ?? ''; }
    override get nameKey(): string {
        return 'type';
    }
    get compiler() { return this.getValue('compiler'); }
    set compiler(compiler: string | undefined) { this.setValue('compiler', compiler); }
}

export class BuildTypeWrap extends TypedWrap {
}

export class ProjectRefWrap extends CTreeItemWrap {
    get project(): string {
        return this.name;
    }

    get projectType(): string | undefined {
        return this.west ? 'West' : undefined;
    }

    override get nameKey(): string {
        return 'project';
    }
    override get name(): string {
        const west = this.west;
        if (west) {
            const projPath = west.getValueAsString('app-path');
            let projId = this.west.getValue('project-id');
            if (!projId) {
                projId = getFileNameNoExt(projPath);
            }
            return projPath + '/' + projId + PROJECT_WEST_SUFFIX;
        }
        return super.name;
    }

    get projectPath(): string {
        if (this.item) {
            return this.item.resolvePath(this.name);
        }
        return '';
    }

    get west(): CTreeItem | undefined {
        return this.item?.getChild('west') as CTreeItem;
    }

    get projectName(): string {
        if (this.item) {
            return getFileNameNoExt(this.name);
        }
        return '';
    }

    set name(name: string | undefined) {
        if (!name) {
            return;
        }
        const west = this.west;
        if (west) {
            west.setValue('project-id', name);
        } else {
            super.name = name;
        }
    }

    get deviceProcessor() {
        return extractPname(this.west?.getValueAsString('device'));
    }
}

export class ImageWrap extends CTreeItemWrap {

    override get nameKey(): string {
        return this.item?.getChild('project-context') ? 'project-context' : 'image';
    }
    /**
     * Load behavior: one of 'image+symbols', 'symbols', 'image', 'none' or undefined.
     */
    get load(): LoadImageType | undefined { return (this.getValue('load') || 'image+symbols') as LoadImageType | undefined; }
    set load(load: LoadImageType | undefined) { this.setValue('load', (load && load !== 'image+symbols') ? load : undefined); }

    get device() {
        const device = this.getValue('device');
        return typeof device === 'string' ? device.replace(/^:/, '') : device;
    }
    set device(device: string | undefined) {
        const normalized = device ? (device.startsWith(':') ? device : `:${device}`) : device;
        this.setValue('device', normalized);
    }

    get type() { return this.getValue('type'); }
    set type(type: string | undefined) { this.setValue('type', type); }

    get image() { return this.getValue('image'); }
    set image(image: string | undefined) { this.setValue('image', image); }

    get projectContext() { return this.getValue('project-context'); }
    set projectContext(context: string | undefined) { this.setValue('project-context', context); }

    get projectName() { return stripSuffix(this.projectContext, '.'); }
}

export class DebuggerWrap extends CTreeItemWrap {

    override get nameKey(): string {
        return 'name';
    }

    get protocol() { return this.getValue('protocol'); }
    set protocol(protocol: string | undefined) { this.setValue('protocol', protocol); }
    get dbgconf() { return this.getValue('dbgconf'); }
    set dbgconf(dbgconf: string | undefined) { this.setValue('dbgconf', dbgconf); }
    get clock() { return this.getValue('clock'); }
    set clock(clock: string | undefined) { this.setValue('clock', clock); }
    get startPname() { return this.getValue('start-pname'); }
    set startPname(pname: string | undefined) { this.setValue('start-pname', pname); }

    get sectionNames(): string[] {
        return this.item?.getChildren()
            .map(child => child.getTag()?.toLocaleLowerCase() || '').filter(Boolean) ?? [];
    }

    isSectionEnabled(section: string): boolean {
        return !!this.item?.getChild(section);
    }

    toggleSection(section: string, defaults: Record<string, string | Record<string, string>>): void {
        let sectionNode = this.item?.getChild(section);
        if (sectionNode) {
            // remove section if exists
            this.item?.removeChild(sectionNode);
        } else {
            // create one
            sectionNode = this.item?.createChild(section, true);
            sectionNode?.setKind(ETreeItemKind.Map).setText(undefined);
            for (const [key, value] of Object.entries(defaults)) {
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    const entries = Object.entries(value);
                    sectionNode?.setKind(ETreeItemKind.Sequence);
                    const pnameNode = sectionNode?.createChild('-');
                    for (const [k, v] of entries) {
                        pnameNode?.setValue(k, v);
                    }
                } else {
                    sectionNode?.setValue(key, value as string | undefined);
                }
            }
        }
    }

    setParameter(section: string | undefined, param: string, value: string | undefined) {
        const section_node = section ? this.item?.getChild(section) : this.item;
        if (!section_node) {
            return;
        }

        if (section_node.isSequence()) {
            const children = section_node.getChildren().filter(p => p.getChild()?.getTag() === param);
            if (children.length > 0) {
                // For sequence sections, set the parameter on every sequence element.
                for (const child of children) {
                    child.setValue(param, value);
                }
            } else {
                // No entries yet: create the first sequence element and set the parameter on it.
                const entry = section_node.createChild('-');
                entry.setKind(ETreeItemKind.Map).setText(undefined);
                entry.setValue(param, value);
            }
        } else {
            section_node.setValue(param, value);
        }
    }
}

export class TargetSetWrap extends CTreeItemWrap {
    get set(): string { return this.getValue(this.nameKey) ?? ''; }
    override get nameKey(): string { return 'set'; }
    override get name(): string { return super.name; }
    override set name(name: string | undefined) { super.name = name || undefined; }

    get debugger() {
        const debuggerItem = this.item?.getChild('debugger');
        return debuggerItem ? new DebuggerWrap(debuggerItem) : undefined;
    }

    ensureDebugger(name?: string) {
        const dw = new DebuggerWrap(this.ensureItem().createChild('debugger', true));
        if (name && dw.name !== name) {
            dw.name = name;
        }
        return dw;
    }

    private readonly imagesHelpers = this.wrapHelpers(ImageWrap, 'images', 'image');
    get images(): ReadonlyArray<ImageWrap> { return this.imagesHelpers.array(true); }
    get imagesOnly(): ReadonlyArray<ImageWrap> { return this.imagesHelpers.array(); }
    get imageNames() { return this.imagesHelpers.names(); }
    getImage(name?: string) { return this.imagesHelpers.get(name); }
    addImage(name?: string) { return this.imagesHelpers.add(name); }
    ensureImage(name?: string) { return this.imagesHelpers.get(name) ?? this.imagesHelpers.add(name); }
    purgeImages() { this.imagesHelpers.purge(); }

    private readonly projectContextHelpers = this.wrapHelpers(ImageWrap, 'images', 'project-context');
    get projectContexts() { return this.projectContextHelpers.array(); }
    get projectContextNames() { return this.projectContextHelpers.names(); }
    getProjectContext(name?: string) { return this.projectContextHelpers.get(name); }
    addProjectContext(name?: string) { return this.projectContextHelpers.add(name); }
    findProjectContext(projectName: string) {
        for (const pc of this.projectContexts) {
            if (pc.projectName === projectName) {
                return pc;
            }
        }
        return undefined;
    }
    findProjectContextName(projectName: string) {
        return this.findProjectContext(projectName)?.projectContext;
    }

}

export class TargetTypeWrap extends TypedWrap {

    get device(): string | undefined { return this.getValue('device'); }
    get board(): string | undefined { return this.getValue('board'); }

    private readonly targetSetHelpers = this.wrapHelpers(TargetSetWrap, 'target-set', 'set');
    get targetSets(): ReadonlyArray<TargetSetWrap> { return this.targetSetHelpers.array(); };
    get targetSetNames() { return this.targetSetHelpers.names(); }
    addTargetSet(name?: string): TargetSetWrap { return this.targetSetHelpers.add(name || undefined); }

    getTargetSet(name?: string): TargetSetWrap | undefined {
        // either with given name or the first one if name is undefined
        return !name ? this.targetSetHelpers.get() : this.targetSetHelpers.get(name);
    }

    ensureTargetSet(targetSetName?: string): TargetSetWrap {
        let ts = this.getTargetSet(targetSetName); // get set or default (no name or first one)
        if (!ts) {
            ts = this.addTargetSet(targetSetName || undefined); // add set or default
        }
        return ts;
    }

    getTargetSetFromIndex(targetSetIndex: number): TargetSetWrap | undefined {
        let idx = targetSetIndex;
        if (targetSetIndex < 0 || targetSetIndex >= this.targetSetNames.length) {
            idx = this.targetSetNames.indexOf('') >= 0 ? this.targetSetNames.indexOf('') : -1;
            if (idx < 0) {
                idx = 0;
            }
        }
        return this.getTargetSet(this.targetSetNames.at(idx));
    }
}

/**
 * Represents a wrapper interface for managing solution-level entities such as target types,
 * build types, project references, and target sets within a CMSIS-based solution.
 *
 * Provides methods to retrieve, add, and enumerate target types, build types, and project references,
 * as well as to access and ensure the existence of target sets.
 */
export interface ICSolutionWrap {
    // Target types
    readonly targetTypes: ReadonlyArray<TargetTypeWrap>;
    readonly targetTypeNames: string[];
    getTargetType(name?: string): TargetTypeWrap | undefined;
    addTargetType(name?: string): TargetTypeWrap;

    // Build types
    readonly buildTypes: ReadonlyArray<BuildTypeWrap>;
    readonly buildTypeNames: string[];
    getBuildType(name?: string): BuildTypeWrap | undefined;
    addBuildType(name?: string): BuildTypeWrap;

    // Project refs
    readonly projectRefs: ReadonlyArray<ProjectRefWrap>;
    readonly projectNames: string[];
    getProjectRef(name?: string): ProjectRefWrap | undefined;
    addProjectRef(name?: string): ProjectRefWrap;

    /**
     * Retrieves a {@link TargetSetWrap} by its name and optional target type.
     *
     * @param targetType - (Optional) name of parent TargetType  to filter by.
     * @param name - (Optional) The name of the target set to retrieve. If omitted, returns the default or first available target set.
     * @returns The matching {@link TargetSetWrap}, or `undefined` if not found.
     */
    getTargetSet(targetType?: string, name?: string,): TargetSetWrap | undefined;

    /**
     * Ensure a target type and target set exists and minimally initialized.
     * @param targetTypeName optional TargetType name to create set
     * @param targetSetName optional TargetSet name to create set
     *
     * Process:
     * 1. Create a target type if none exist yet.
     * 2. Ensure that all target types has a default target set (empty set name or first existing).
     * 3. If the target set currently has no images, attempt to auto-populate a project-context:
     *    - Compose a context key: "<firstBuildTypeName>+<targetTypeName>" (build type part may be empty).
     *    - Iterate projectRefs, selecting the first whose raw YAML item matches that context via matchesContext().
     *    - Derive a project-context token: "<projectFileBase>[.<buildTypeName>]" and add it to the target set.
     *
     * Rationale:
     * This gives users an immediately usable target set tied to an existing project reference without
     * creating image entries prematurely. It keeps the structure lightweight while enabling later refinement.
     *
     * Returns the ensured default TargetSet instance.
   */
    ensureTargetTypeAndSet(targetTypeName: string, targetSetName?: string): TargetSetWrap;

    /**
     * Ensure a target set exists and for all target types.
     *
     * Process:
     * 1. Create a target type if none exist yet.
     * 2. Ensure that all target types has a default target set (empty set name or first existing).
     * 3. If the target set currently has no images, attempt to auto-populate a project-context:
     *    - Compose a context key: "<firstBuildTypeName>+<targetTypeName>" (build type part may be empty).
     *    - Iterate projectRefs, selecting the first whose raw YAML item matches that context via matchesContext().
     *    - Derive a project-context token: "<projectFileBase>[.<buildTypeName>]" and add it to the target set.
     *
     * Rationale:
     * This gives users an immediately usable target set tied to an existing project reference without
     * creating image entries prematurely. It keeps the structure lightweight while enabling later refinement.
     *
     * Returns the ensured default TargetSet instance.
   */
    ensureTargetSets(): void;
}

/**
 * Class to wrap csolution's top item
 */
export class CSolutionWrap extends CTreeItemWrap implements ICSolutionWrap {
    // --- TargetTypeWrap methods ---
    private readonly targetTypeHelpers = this.wrapHelpers(TargetTypeWrap, 'target-types', 'type');
    get targetTypes(): ReadonlyArray<TargetTypeWrap> { return this.targetTypeHelpers.array(); }
    get targetTypeNames() { return this.targetTypeHelpers.names(); }
    getTargetType(name?: string) { return this.targetTypeHelpers.get(name); }
    addTargetType(name?: string) { return this.targetTypeHelpers.add(name); }

    // --- BuildType methods ---
    private readonly buildTypeHelpers = this.wrapHelpers(BuildTypeWrap, 'build-types', 'type');
    get buildTypes(): ReadonlyArray<BuildTypeWrap> { return this.buildTypeHelpers.array(); }
    get buildTypeNames() { return this.buildTypeHelpers.names(); }
    getBuildType(name?: string) { return this.buildTypeHelpers.get(name); }
    addBuildType(name?: string) { return this.buildTypeHelpers.add(name); }

    // --- ProjectRef methods ---
    private readonly projectRefHelpers = this.wrapHelpers(ProjectRefWrap, 'projects', 'project');
    get projectRefs(): ReadonlyArray<ProjectRefWrap> { return this.projectRefHelpers.array(true); }
    get projectNames() { return this.projectRefs.map(pr => pr.name); }
    getProjectRef(name?: string) {
        for (const pr of this.projectRefs) {
            if (pr.name === name || pr.projectName === name) {
                return pr;
            }
        };
        return undefined;
    }
    addProjectRef(name?: string) { return this.projectRefHelpers.add(name); }

    getTargetSet(targetTypeName: string, targetSetName?: string) {
        const tt = this.getTargetType(targetTypeName);
        return tt?.getTargetSet(targetSetName);
    }


    ensureTargetSets() {
        if (this.targetTypes.length === 0) {
            this.addTargetType('default');
        }
        for (const tt of this.targetTypes) {
            const targetSetNames = tt.targetSetNames;
            if (targetSetNames.length === 0) {
                this.ensureTargetSet(tt);
            } else {
                for (const tsName of tt.targetSetNames) {
                    // ensures images
                    this.ensureTargetSet(tt, tsName);
                }
            }
        }
    }


    private ensureTargetSet(tt: TargetTypeWrap, targetSetName?: string): TargetSetWrap {
        let ts = tt.getTargetSet(targetSetName);
        if (!ts) {
            ts = tt.ensureTargetSet(targetSetName);
            // add project context if no image is specified
            if (ts.images.length === 0) {
                const projectContext = this.constructFirstMatchingProjectContext(tt.name);
                if (projectContext) {
                    ts.addProjectContext(projectContext);
                }
            }
        }
        return ts;
    }

    ensureTargetTypeAndSet(targetTypeName: string, targetSetName?: string): TargetSetWrap {
        let tt = this.getTargetType(targetTypeName);
        if (!tt) {
            tt = this.addTargetType(targetTypeName || 'default');
        }
        return this.ensureTargetSet(tt, targetSetName);
    };


    private constructFirstMatchingProjectContext(targetTypeName: string): string | undefined {
        const buildTypes = this.buildTypeNames;
        if (buildTypes.length === 0) {
            buildTypes.push('');
        }
        for (const pr of this.projectRefs) {
            for (const buildTypeName of buildTypes) {
                const context = buildTypeName ? (buildTypeName + '+' + targetTypeName) : targetTypeName;
                if (matchesContext(pr.item, context)) {
                    return pr.projectName + (buildTypeName ? ('.' + buildTypeName) : '');
                }
            }
        };
        return undefined;
    }
}
