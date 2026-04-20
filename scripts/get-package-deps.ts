#!npx tsx

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

// generated with AI

/*
 * Script to extract version info from manifest_*.yml files in ./tools/cmsis-toolbox
 * and print a dependency graph in the format used in the GitHub Actions summary.
 * Usage: npx tsx scripts/get-package-deps.ts <nightlyVersion>
 */
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOOLBOX_DIR = path.join(__dirname, '../tools/cmsis-toolbox');
const UV2CSOLUTION_DIR = path.join(__dirname, '../tools/uv2csolution');
const PACKAGE_JSON_PATH = path.join(__dirname, '../package.json');
const MANIFEST_PATTERN = /^manifest_.*\.yml$/;

// Children of cmsis-toolbox (in display order)
const TOOLBOX_CHILDREN = [
  'cbridge',
  'cbuild',
  'cbuild2cmake',
  'cbuildgen',
  'cpackget',
  'csolution',
  'packchk',
  'svdconv',
  'vidx2pidx',
];

function findManifestFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    console.error(`Toolbox directory not found: ${dir}`);
    process.exit(1);
  }

  try {
    return fs.readdirSync(dir)
      .filter(f => MANIFEST_PATTERN.test(f))
      .map(f => path.join(dir, f));
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to read toolbox directory "${dir}": ${message}`);
    process.exit(1);
  }
}

function parseManifest(file: string): Record<string, string> {
  const doc = yaml.parse(fs.readFileSync(file, 'utf8')) as any;
  const versions: Record<string, string> = {};
  // Top-level cmsis-toolbox version
  if (doc?.version) {
    versions['cmsis-toolbox'] = doc.version;
  }
  // binaries is a map: { cbridge: { version: '...' }, cbuild: { version: '...' }, ... }
  if (doc?.binaries && typeof doc.binaries === 'object') {
    for (const [name, info] of Object.entries(doc.binaries as Record<string, any>)) {
      if (info?.version) {
        versions[name] = info.version;
      }
    }
  }
  return versions;
}

function getUv2csolutionVersion(): string | undefined {
  // Try version.txt in the uv2csolution folder first
  const versionFile = path.join(UV2CSOLUTION_DIR, 'version.txt');
  if (fs.existsSync(versionFile)) {
    const v = fs.readFileSync(versionFile, 'utf8').trim();
    if (v) return v;
  }
  // Fall back to package.json csolution.uv2csolutionVersion
  if (fs.existsSync(PACKAGE_JSON_PATH)) {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
    const v = pkg?.csolution?.uv2csolutionVersion;
    if (v) return String(v);
  }
  return undefined;
}

function mergeVersions(manifests: Record<string, string>[]): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const m of manifests) {
    for (const [k, v] of Object.entries(m)) {
      merged[k] = v;
    }
  }
  return merged;
}

function printDependencyGraph(versions: Record<string, string>, uv2csolutionVersion: string | undefined, nightlyVersion: string) {
  console.log('```text');
  console.log(`vscode-cmsis-solution ${nightlyVersion}`);

  console.log(`  ├── cmsis-toolbox v${versions['cmsis-toolbox'] ?? 'unknown'}`);
  for (let i = 0; i < TOOLBOX_CHILDREN.length; ++i) {
    const tool = TOOLBOX_CHILDREN[i];
    const ver = versions[tool] ?? 'unknown';
    const isLast = i === TOOLBOX_CHILDREN.length - 1;
    const prefix = isLast ? '  │   └──' : '  │   ├──';
    console.log(`${prefix} ${tool} v${ver}`);
  }
  console.log(`  └── uv2csolution v${uv2csolutionVersion ?? 'unknown'}`);
  console.log('```');
}

function main() {
  const nightlyVersion = process.argv[2] || process.env.NIGHTLY_VERSION || 'unknown';
  const manifestFiles = findManifestFiles(TOOLBOX_DIR);
  if (manifestFiles.length === 0) {
    console.error('No manifest_*.yml files found in', TOOLBOX_DIR);
    process.exit(1);
  }
  const manifests = manifestFiles.map(parseManifest);
  const versions = mergeVersions(manifests);
  const uv2csolutionVersion = getUv2csolutionVersion();
  printDependencyGraph(versions, uv2csolutionVersion, nightlyVersion);
}

main();