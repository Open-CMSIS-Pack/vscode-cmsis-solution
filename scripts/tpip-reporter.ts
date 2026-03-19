#!npx tsx

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

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import fs from "fs";

async function main() {

    const argv = yargs(hideBin(process.argv))
        .usage('Usage: $0 <json> <report> [--header <header>]')
        .options('header', {
            describe: 'Header to add to the report',
            type: 'string'
        })
        .command('$0 <json> <report>', '', y => {
            y.positional('json', {
                describe: 'JSON file to parse',
                type: 'string',
                demandOption: true
            });
            y.positional('report', {
                describe: 'Report file to generate',
                type: 'string',
                demandOption: true
            });
        })
        .help('h')
        .version(false)
        .strict()
        .parseSync();

    const json = argv.json as string;
    const report = argv.report as string;
    const header = argv.header;

    const tpipJson = JSON.parse(fs.readFileSync(json, "utf8"));

    // Sort packages alphabetically by name for better readability
    tpipJson.sort((a: any, b: any) => a.name.localeCompare(b.name));

    let data: string = '';
    if (header && fs.existsSync(header)) {
        data += fs.readFileSync(header, "utf8");
    } else {
        data += "# TPIP Report\n\n";
    }

    data += '\n';
    data += `Report prepared at: ${new Date().toLocaleString('en-GB')}\n\n`;
    data += '| *Package* | *Version* | *Repository* | *License* |\n';
    data += '|---|---|---|---|\n';

    for(const value of tpipJson) {
        data += `|${value.name}|${value.version}|${value.url}|${value.license}|\n`;
    }

    fs.writeFileSync(report, data);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
