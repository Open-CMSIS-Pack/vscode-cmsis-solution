/**
 * Copyright 2024-2026 Arm Limited
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

import _ from 'lodash';
import * as path from 'path';
import * as vscode from 'vscode';
import { RelativePattern, Uri } from 'vscode';
import { DraftProjectType } from '../data-manager/draft-project-data';
import { ETreeItemKind } from '../generic/tree-item';
import { ETextFileResult } from '../generic/text-file';
import { NewSolutionMessage } from '../views/create-solutions/messages';
import { WorkspaceFsProvider } from '../vscode-api/workspace-fs-provider';
import { MdkToCsolutionConverter } from './mdk-conversion/convert-mdk-command';
import { uvmpwExtension, uvprojxExtension } from './mdk-conversion/mdk-projects';
import { CreatedSolution } from './solution-creator';
import { DEFAULT_VCPKG_FILENAME } from '../vcpkg/vcpkg-manager';
import { CSolutionYamlFile } from './files/csolution-yaml-file';

export type CreateSolutionFromDataManager = (
    solutionDirUri: Uri,
    message: NewSolutionMessage,
) => Promise<CreatedSolution>;

export const getCreateSolutionFromDataManager = (
    workspaceFsProvider: WorkspaceFsProvider,
    mdkToCsolutionConverter: MdkToCsolutionConverter,
    findFiles: typeof vscode.workspace.findFiles,
): CreateSolutionFromDataManager => async (solutionDirUri, message) => {
    const draftProjectObject = message.dataManagerObject;
    if (!draftProjectObject) {
        throw ('DraftProject Object undefined!');
    }

    await workspaceFsProvider.createDirectory(solutionDirUri.fsPath);
    await draftProjectObject?.copyTo(solutionDirUri.fsPath);

    const cSolutionFile = await findCsolutionFile(findFiles, solutionDirUri);
    const uVisionFile = await findUvisionProjectFile(findFiles, solutionDirUri);

    let createdSolution: CreatedSolution | undefined = undefined;
    if (cSolutionFile) {
        const vcpkgConfigured = await workspaceFsProvider.exists(path.join(solutionDirUri.fsPath, DEFAULT_VCPKG_FILENAME));
        createdSolution = { conversionStatus: 'none', vcpkgConfigured, solutionFile: cSolutionFile, solutionDir: solutionDirUri, forceRteUpdate: true };
    } else if (uVisionFile) {
        createdSolution = await convertUvisionProjectFile(uVisionFile, solutionDirUri, mdkToCsolutionConverter, workspaceFsProvider);
    } else {
        throw new Error(`Could not find the uvprojx, uvmpw or csolution files to create a new solution in ${solutionDirUri.fsPath}`);
    }

    if (cSolutionFile) {
        switch (draftProjectObject.draftType) {
            case DraftProjectType.Example:
                break;
            case DraftProjectType.RefApp:
            case DraftProjectType.Template:
                await addAdditionalInfoToSolutionFile(createdSolution, message);
                break;
            default:
                break;
        }
    }

    return createdSolution;
};

function addPacksToYamlTree(ymlFile: CSolutionYamlFile, message: NewSolutionMessage) {
    if (!message.packs.length) {
        return;
    }

    const topItem = ymlFile.topItem;
    if (!topItem) {
        return;
    }

    // TODO: Move into CSolutionYamlFile
    const packsItem = topItem.createChild('packs', true).setKind(ETreeItemKind.Sequence);
    for (const pack of message.packs) {
        const existingPack = packsItem.getChildren().find(p => p.getValue('pack') === pack.pack);
        if (!existingPack) {
            packsItem.createChild('-').setValue('pack', pack.pack);
        }
    }
}

function addTargetTypesToYamlTree(ymlFile: CSolutionYamlFile, message: NewSolutionMessage) {
    if (!message.targetTypes.length) {
        return;
    }

    for (const tt of ymlFile.targetTypes) {
        const hasPlaceholder = tt.name.match(/\${Name}/g);
        const hasNoTarget = !tt.device && !tt.board;
        if (hasPlaceholder || hasNoTarget) {
            tt.remove();
        }
    }

    const newTargetType = message.targetTypes[0];   // Only one target type is supported for now
    ymlFile.ensureTargetTypeAndSet(newTargetType.type);

    const targetType = ymlFile.getTargetType(newTargetType.type);
    targetType?.setValue('device', newTargetType.device);
    targetType?.setValue('board', newTargetType.board);
}


async function addAdditionalInfoToSolutionFile(createdSolution: CreatedSolution, message: NewSolutionMessage) {
    const solutionFile = createdSolution.solutionFile?.fsPath;
    if (!solutionFile?.length) {
        return;
    }

    const ymlFile = new CSolutionYamlFile(solutionFile);
    const loadResult = await ymlFile.load();
    if (loadResult !== ETextFileResult.Success) {
        return;
    }

    addPacksToYamlTree(ymlFile, message);
    addTargetTypesToYamlTree(ymlFile, message);

    await ymlFile.save();
}

const convertUvisionProjectFile = async (
    µVisionFile: Uri,
    solutionDir: Uri,
    mdkToCsolutionConverter: MdkToCsolutionConverter,
    workspaceFsProvider: WorkspaceFsProvider,
): Promise<CreatedSolution> => {
    const result = await mdkToCsolutionConverter.convert(µVisionFile);
    if (result.solutionFile) {
        await ensureVcpkgIsInSolutionRoot(workspaceFsProvider, solutionDir, result.solutionFile);
    }
    // Ensure we open the correct root directory by returning the solution directory here
    return { ...result, solutionDir };
};

// Some example projects have the uvprojx path deeply nested in the example folder. Move the generated vcpkg-configuration to the example root.
const ensureVcpkgIsInSolutionRoot = async (workspaceFsProvider: WorkspaceFsProvider, directoryUri: Uri, solutionUri: Uri): Promise<void> => {
    const sourcePath = path.join(solutionUri.fsPath, '../', DEFAULT_VCPKG_FILENAME);
    const destinationPath = path.join(directoryUri.fsPath, DEFAULT_VCPKG_FILENAME);
    if (sourcePath !== destinationPath) {
        try {
            await workspaceFsProvider.rename(sourcePath, destinationPath, false);
        } catch (error) {
            console.error('Failed to move vcpkg-configuration.json file', error);
        }
    }
};

/**
 * Find the µVision project file in the given directory. Assumes there is only one.
 */
const findUvisionProjectFile = async (findFiles: typeof vscode.workspace.findFiles, directoryUri: Uri): Promise<Uri | undefined> => {
    // uvmpw projects can contain uvprojx files, so we need to search for them first
    const uvmpwFile = await findOneFileWithExtension(findFiles, directoryUri, uvmpwExtension);
    if (uvmpwFile) {
        return uvmpwFile;
    }
    const uvprojxFile = await findOneFileWithExtension(findFiles, directoryUri, uvprojxExtension);
    if (uvprojxFile) {
        return uvprojxFile;
    }
    return undefined;
};

/**
 * Finds the csolution project file in the given directory. Assumes there is only one.
 */
const findCsolutionFile = async (findFiles: typeof vscode.workspace.findFiles, directoryUri: Uri): Promise<Uri | undefined> =>
    await findOneFileWithExtension(findFiles, directoryUri, 'csolution.{yaml,yml}');

const findOneFileWithExtension = async (
    findFiles: typeof vscode.workspace.findFiles,
    directoryUri: Uri,
    extension: string,
): Promise<Uri | undefined> => {
    const found = await findFiles(new RelativePattern(directoryUri, `**/*.${extension}`), null, 1);
    return _.head(found);
};
