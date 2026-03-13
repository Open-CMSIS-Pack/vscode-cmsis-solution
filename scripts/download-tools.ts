#!npx tsx

/**
 * Copyright 2022-2026 Arm Limited
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

import { ArchiveFileAsset, Downloadable, Downloader, GitHubReleaseAsset, GitHubRepoAsset, GitHubWorkflowAsset, WebFileAsset  } from '@open-cmsis-pack/vsce-helper';
import { PackageJson } from 'type-fest';
import * as semver from 'semver';
import { execSync } from 'child_process';

const ghToken = process.env.GITHUB_TOKEN;

type CsolutionPackageJson = PackageJson & {
    csolution?: {
        uv2csolutionVersion?: string;
        toolboxVersion?: string;
        rpcVersion?: string;
    };
};

const uv2csolution : Downloadable = new Downloadable(
    'uv2csolution Converter', 'uv2csolution',
    async (target) => {
        const packageJson = await downloader.getPackageJson<CsolutionPackageJson>();
        const requiredVersion = packageJson?.csolution?.uv2csolutionVersion;
        if (requiredVersion === undefined) {
            console.error('Missing uv2csolutionVersion dependency in package.json');
            return undefined;
        }

        const { os, arch, archiveSuffix } = {
            'win32-x64': { os: 'windows', arch: 'amd64', archiveSuffix: 'zip' },
            'win32-arm64': { os: 'windows', arch: 'arm64', archiveSuffix: 'zip' },
            'linux-x64': { os: 'linux', arch: 'amd64', archiveSuffix: 'tar.gz' },
            'linux-arm64': { os: 'linux', arch: 'arm64', archiveSuffix: 'tar.gz'  },
            'darwin-x64': { os: 'darwin', arch: 'amd64', archiveSuffix: 'tar.gz'  },
            'darwin-arm64': { os: 'darwin', arch: 'arm64', archiveSuffix: 'tar.gz'  },
        }[target];

        const downloadFileName = `uv2csolution_${requiredVersion}_${os}_${arch}.${archiveSuffix}`;
        const downloadOrigin = 'https://artifacts.keil.arm.com';
        const downloadUrl = new URL(`${downloadOrigin}/uv2csolution/${requiredVersion}/${downloadFileName}`);
        const dlAsset = new WebFileAsset(downloadUrl, downloadFileName, requiredVersion);
        const asset = new ArchiveFileAsset(dlAsset, 1);

        return asset;
    },
);

const debugAdapterRegistry = new Downloadable(
    'Debug Adapter Registry', ['..', 'templates', 'debug'],
    async () => {
        return new GitHubRepoAsset('Open-CMSIS-Pack', 'debug-adapter-registry', { ref: 'heads/main', path: [ 'templates', 'registry/debug-adapters.yml' ], token: ghToken });
    },
);

const toolbox : Downloadable = new Downloadable(
    'CMSIS-Toolbox', 'cmsis-toolbox',
    async (target) => {
        const { os_arch, archiveSuffix } = {
            'win32-x64': { os_arch: 'windows-amd64', archiveSuffix: 'zip' },
            'win32-arm64': { os_arch: 'windows-arm64', archiveSuffix: 'zip' },
            'linux-x64': { os_arch: 'linux-amd64', archiveSuffix: 'tar.gz' },
            'linux-arm64': { os_arch: 'linux-arm64', archiveSuffix: 'tar.gz' },
            'darwin-x64': { os_arch: 'darwin-amd64', archiveSuffix: 'tar.gz' },
            'darwin-arm64': { os_arch: 'darwin-arm64', archiveSuffix: 'tar.gz' },
        }[target];

        const json = await downloader.getPackageJson<CsolutionPackageJson>();
        const version = json?.csolution?.toolboxVersion;
        if (version === undefined) {
            console.error('Missing toolboxVersion dependency in package.json');
            return undefined;
        } else if (version === 'nightly') {
            return new GitHubWorkflowAsset('Open-CMSIS-Pack', 'cmsis-toolbox', 'nightly.yml', `cmsis-toolbox-${os_arch}`, { token: ghToken });
        } else {
            const downloadFileName = `cmsis-toolbox-${os_arch}.${archiveSuffix}`;
            const downloadOrigin = 'https://artifacts.keil.arm.com';
            const downloadUrl = new URL(`${downloadOrigin}/cmsis-toolbox/${version}/${downloadFileName}`);
            const dlAsset = new WebFileAsset(downloadUrl, downloadFileName, version);
            const asset = new ArchiveFileAsset(dlAsset, 1);
            return asset;
        }
    },
);

const rpcInterface: Downloadable = new Downloadable(
    'CSolution JsonRPC Interface', [ '..', 'src', 'json-rpc', 'interface' ],
    async (target) => {
        const archiveSuffix = {
            'win32-x64': 'zip',
            'win32-arm64': 'zip',
            'linux-x64': 'tar.gz',
            'linux-arm64': 'tar.gz',
            'darwin-x64': 'tar.gz',
            'darwin-arm64': 'tar.gz',
        }[target];

        const json = await downloader.getPackageJson<CsolutionPackageJson>();
        const version = json?.csolution?.rpcVersion;
        if (version === undefined) {
            console.error('Missing rpcVersion dependency in package.json');
            return undefined;
        }
        const dlAsset = new GitHubReleaseAsset('Open-CMSIS-Pack', 'csolution-rpc', version, `csolution-rpc.${archiveSuffix}`, { token: ghToken });
        const asset = new ArchiveFileAsset(dlAsset);
        return asset;
    },
);

const nodePty: Downloadable = new Downloadable(
    '@lydell/node-pty', [ 'node-pty' ],
    async (target) => {
        const { os_arch, archiveSuffix } = {
            'win32-x64': { os_arch: 'win32-x64', archiveSuffix: 'tgz' },
            'win32-arm64': { os_arch: 'win32-arm64', archiveSuffix: 'tgz' },
            'linux-x64': { os_arch: 'linux-x64', archiveSuffix: 'tgz' },
            'linux-arm64': { os_arch: 'linux-arm64', archiveSuffix: 'tgz' },
            'darwin-x64': { os_arch: 'darwin-x64', archiveSuffix: 'tgz' },
            'darwin-arm64': { os_arch: 'darwin-arm64', archiveSuffix: 'tgz' },
        }[target];

        const json = await downloader.getPackageJson<CsolutionPackageJson>();
        const version = semver.minVersion(json?.dependencies?.['@lydell/node-pty'] || '')?.version;
        const downloadFileName = `node-pty-${os_arch}-${version}.${archiveSuffix}`;
        const downloadOrigin = execSync('npm config get registry', { encoding: 'utf-8' }).trim();
        const downloadUrl = new URL(`${downloadOrigin}/@lydell/node-pty-${os_arch}/-/${downloadFileName}`);
        const dlAsset = new WebFileAsset(downloadUrl, downloadFileName, version);
        const asset = new ArchiveFileAsset(dlAsset, 1);
        return asset;
    },
);

const downloader = new Downloader({
    'uv2csolution': uv2csolution,
    'debug-adapters': debugAdapterRegistry,
    'toolbox': toolbox,
    'rpc-interface': rpcInterface,
    'node-pty': nodePty,
});

downloader
    .withCacheDir(await downloader.defaultCacheDir())
    .run();
