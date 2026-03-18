#!npx tsx

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

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

type Package = {
    version: string,
    dependencies: { [ name: string ]: string },
};

type PackageJson = {
    name: string,
    version: string,
    license: string,
}

type PackageLockJson = {
    packages: { [ name: string ] : Package },
}

type TpipDependency = {
    name: string,
    version: string,
    spdx: string,
    url: string,
    license: string,
}

const FIXME = '<FIXME>' as const;

function getPackage(name: string, lockJson: PackageLockJson) {
    const node_module = name === '' ? name : `node_modules/${name}`;
    if (node_module in lockJson.packages) {
        return lockJson.packages[node_module];
    }
    console.error(`Package ${name} not found ...`);
    return undefined;
}

function hasFixMe(dependency: TpipDependency) {
    return (dependency.version === FIXME) ||
        (dependency.license === FIXME) ||
        (dependency.spdx === FIXME) ||
        (dependency.url === FIXME);
}

export function getLicense(name: string) {
    const packageJson = `node_modules/${name}/package.json`;
    if (!existsSync(packageJson)) {
        console.warn(`No package.json for ${name} to get license from.`);
        return 'UNKNOWN';
    }
    const json = JSON.parse(readFileSync(packageJson, 'utf-8')) as PackageJson;
    return json.license;
}

function resolveInternal(lockJson: PackageLockJson, name: string = '', results?: { [ name: string ]: string }) {
    if (results === undefined) {
        results = {};
    }
    const nodePackage = getPackage(name, lockJson);
    if (nodePackage === undefined) {
        throw new Error(`Cannot resolve transitive dependencies of ${name}`);
    }
    const dependencies = nodePackage.dependencies ?? {};
    for (const dependency of Object.keys(dependencies)) {
        if (dependency.startsWith('@arm-debug')) {
            resolveInternal(lockJson, dependency, results);
        } else if (!dependency.startsWith('@types')) {
            if (dependency in results) {
                const dependencyPackage = getPackage(dependency, lockJson);
                if (results[dependency] !== dependencyPackage?.version) {
                    console.warn(` Conflicting dependency version ${dependency}: ${results[dependency]} vs ${dependencyPackage?.version}`);
                }
            } else {
                results[dependency] = dependencies[dependency];
            }
        }
    }
    return results;
}

function main(jsonFile: string) {
    let result = 0;

    console.log('Updating TPIP information ...');
    console.log(` in ${jsonFile}`);

    const tpipJson: TpipDependency[] = JSON.parse(readFileSync(jsonFile, 'utf-8'));
    const lockJson: PackageLockJson = JSON.parse(readFileSync('package-lock.json', 'utf-8'));

    for (const dependency of tpipJson) {
        if (hasFixMe(dependency)) {
            console.error(` ${dependency.name} needs to be completed!`);
            result = 1;
        }
    }

    let lockedDepencencies: { [name: string]: string } = {};
    try {
        lockedDepencencies = resolveInternal(lockJson);
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
        }
        console.error(e);
        result = 2;
    }

    const missing = Object.keys(lockedDepencencies)
        .filter(d => !tpipJson.some(t => t.name === d));
    if (missing.length > 0) {
        result = 2;
        console.error(' Missing dependencies:');
        for (const dependency of missing) {
            const locked = getPackage(dependency, lockJson);
            console.error(`  - ${dependency}: ${locked?.version}`);
            tpipJson.push({
                name: dependency,
                version: locked?.version ?? FIXME,
                spdx: getLicense(dependency),
                url: FIXME,
                license: FIXME
            });
        }
    }

    for (const dependency of tpipJson) {
        const locked = getPackage(dependency.name, lockJson);
        if ((locked !== undefined) && (dependency.version !== locked.version)) {
            console.log(` ${dependency.name}: ${dependency.version} -> ${locked.version}`);
            dependency.version = locked.version;
            const actLicense = getLicense(dependency.name);
            if (dependency.spdx !== actLicense) {
                console.warn(' License may have changed!');
                console.warn(`   ${dependency.spdx} -> ${actLicense} `);
                dependency.spdx = actLicense;
                result = 1;
            }
        }
    }

    if (result !== 0) {
        console.error('New or changed dependencies detected, manual input required.');
        console.warn('Use npm run tpip:update locally and add missing license information');
    }

    writeFileSync(`${jsonFile}`, JSON.stringify(tpipJson, undefined, 4));

    return result;
}

const retval = main(process.argv[2]);
process.exit(retval);
