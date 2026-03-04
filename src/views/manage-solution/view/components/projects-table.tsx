/**
 * Copyright (C) 2024-2026 Arm Limited
 */

import * as React from 'react';
import { DropdownSelect } from '../../../common/components/dropdown-select';
import { ImageSelection, LoadType, ProjectSelection } from '../state/manage-solution-state';
import { SolutionUpdateAction } from '../state/reducer';
import './manage-solution.css';
import { Button, Checkbox } from 'antd';
import { LinkOutlined, PlusSquareOutlined, WarningFilled } from '@ant-design/icons';
import { CompactDropdown } from '../../../common/components/compact-dropdown';

interface BuildTypeDropdownProps {
    projectPath: string;
    buildTypes: string[];
    selectedBuildType: string;
    disabled?: boolean;
    updateSolutionData: (action: SolutionUpdateAction) => void;
}

const buildTypeDisplay = (buildType: string): string => buildType || '';

export const BuildTypeDropdown = (props: BuildTypeDropdownProps) => {
    const handleBuildTypeChange = (buildType: string) => {
        props.updateSolutionData({ type: 'SET_BUILD_TYPE_SELECTION', projectPath: props.projectPath, buildType });
    };

    const disabled = props.disabled || props.buildTypes.length === 0;
    const selected = props.selectedBuildType || props.buildTypes[0];
    const text = buildTypeDisplay(selected);

    return <DropdownSelect
        className={'build-type-dropdown'}
        text={text}
        disabled={disabled}
        dropdownContent={closeDropdown => {
            return (
                <ul>
                    {props.buildTypes.map(buildType =>
                        <li key={buildType} onClick={() => {
                            handleBuildTypeChange(buildType);
                            closeDropdown();
                        }}>
                            {buildTypeDisplay(buildType)}
                        </li>
                    )}
                </ul>
            );
        }}
    />;
};

interface ProjectRowProps {
    project: ProjectSelection;
    projects: ProjectSelection[];
    images: ImageSelection[];
    updateContextSelection: (action: SolutionUpdateAction) => void;
    openFile: (path: string) => void;
}

interface ImageRowProps {
    image: ImageSelection;
    availableCores: string[];
    updateContextSelection: (action: SolutionUpdateAction) => void;
    openFile: (path: string) => void;
    unlinkImage: (name: string) => void;
}

export const ProjectRow = (props: ProjectRowProps) => {
    const handleProjectSelection = () => {
        props.updateContextSelection({ type: 'SET_PROJECT_SELECTION', projectPath: props.project.path, selected: !props.project.selected });
    };

    const handleLoadTypeSelection = (value: string) => {
        props.updateContextSelection({ type: 'SET_LOAD_TYPE_SELECTION', path: props.project.path, loadType: value as LoadType });
    };

    return <tr className="project">
        <td className="select-column">
            <Checkbox checked={props.project.selected} onChange={handleProjectSelection} />
        </td>
        <td className={'name'}>{props.project.device && <span>{props.project.device}: </span>}{props.project.name}{props.project.projectType && <span className='description'> ({props.project.projectType})</span>}</td>
        <td className="build-type">
            <BuildTypeDropdown
                buildTypes={props.project.buildTypes}
                selectedBuildType={props.project.selectedBuildType}
                projectPath={props.project.path}
                updateSolutionData={props.updateContextSelection}
                disabled={!props.project.selected}
            />
        </td>
        <td className="load-column">
            {props.project.selected
                ? <CompactDropdown available={['image+symbols', 'image', 'symbols', 'none']} selected={props.project.load ?? ''} onChange={handleLoadTypeSelection} unselectedLabel='image+symbols' />
                : <CompactDropdown available={['none', 'dummy']} selected={'none'} onChange={() => { }} unselectedLabel='none' disabled={true} />
            }
        </td>
        <td>{props.project.projectType !== 'West' && <a onClick={() => props.openFile(props.project.path)} title={props.project.path}>Edit cproject.yml</a>}</td>
    </tr>;
};

export const ImageRow = (props: ImageRowProps) => {
    const handleLoadTypeSelection = (value: string) => {
        props.updateContextSelection({ type: 'SET_LOAD_TYPE_SELECTION', path: props.image.path, loadType: value as LoadType });
    };

    const handleCoreSelection = (core: string) => {
        props.updateContextSelection({ type: 'SET_CORE_SELECTION', path: props.image.path, core: core });
    };

    return <tr className="image">
        <td className="select-column"><Button icon={<LinkOutlined />} className='add-button unlink-image-button' title='Remove Image File from Target Set' onClick={() => props.unlinkImage(props.image.path)} /></td>
        <td className="name" title={props.image.path}>{props.image.name}</td>
        <td className="build-type">
            {props.availableCores.length > 1 &&
                <CompactDropdown available={['Start Processor', ...props.availableCores]} selected={props.image.device ?? ''} onChange={handleCoreSelection} unselectedLabel='Start Processor' />
            }
        </td>
        <td className="load-column">
            <CompactDropdown available={['image+symbols', 'image', 'symbols', 'none']} selected={props.image.load ?? ''} onChange={handleLoadTypeSelection} unselectedLabel='image+symbols' />
        </td>
        <td>&nbsp;</td>
    </tr>;
};

export interface ProjectsTableProps {
    projects: ProjectSelection[];
    images?: ImageSelection[];
    availableCores: string[];
    updateSolutionData: (action: SolutionUpdateAction) => void;
    openFile: (path: string) => void;
    addProject: () => void;
    addImage: () => void;
    unlinkImage: (name: string) => void;
}

export const ProjectsTable = (props: ProjectsTableProps) => {
    return (<>
        {props.projects.filter(p => p.selected).length + (props.images?.length || 0) === 0 && (
            <span className="no-selection warning">
                <WarningFilled /> At least one project or image should be selected.
            </span>
        )}
        <table className='active-projects-table'>
            <thead>
                <tr>
                    <th className="select-column">
                        {/* <Button icon={<PlusSquareOutlined />}
                            onClick={() => props.addProject()}
                            className='add-button add-project-button' /> */}
                    </th>
                    <th className='column-name'>
                        {props.projects.some(project => project.device) ? 'Processor: Projects' : 'Projects'}
                    </th>
                    <th className="build-type">Build Type</th>
                    <th className="column-load">Load Settings</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {props.projects.map((project, i) => <ProjectRow
                    key={i}
                    project={project}
                    updateContextSelection={props.updateSolutionData}
                    openFile={props.openFile}
                    projects={props.projects}
                    images={props.images || []}
                />)}
            </tbody>
            <thead>
                <tr>
                    <th className="select-column"><Button
                        title="Add Image File to Target Set"
                        icon={<PlusSquareOutlined />}
                        onClick={() => props.addImage()}
                        className='add-button add-img-button'
                    /></th>
                    <th className='column-name'>Images</th>
                    <th className="build-type">
                        {props.availableCores.length > 1 &&
                            'Processor'
                        }
                    </th>
                    <th className="column-load">Load Settings</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {props.images?.map((image, i) => <ImageRow
                    key={i}
                    image={image}
                    availableCores={props.availableCores}
                    updateContextSelection={props.updateSolutionData}
                    openFile={props.openFile}
                    unlinkImage={props.unlinkImage}
                />)}
            </tbody>
        </table>
    </>);
};
