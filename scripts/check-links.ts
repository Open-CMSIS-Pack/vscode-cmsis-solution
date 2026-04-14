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

/*
 *Usage:
 * check-links.ts [options]

 * Options:
 *     --version        Show version number                             [boolean]
 * -c, --config         Path to markdown-link-check config file         [string]  [default: ".github/markdown-link-check.jsonc"]
 * -i, --ignore         Directories to ignore                           [array]   [default: ["node_modules/**"]]
 * -m, --checkMarkdown  Validate links in markdown files                [boolean] [default: true]
 * -u, --checkHttp      Scan changed files for insecure http URLs       [boolean] [default: true]
 * -h, --help           Show help                                       [boolean]
 *
 * Example usage:
 *   npm run check:links
 *   npm run check:links -- -i "./dist/**" -i "./coverage/**"
 *   npm run check:links -- -c "./.github/markdown-link-check.jsonc"
 *   npm run check:links -- -m false -i "./dist/**" -c "./.github/markdown-link-check.jsonc"
 */

import { execFile as execFileCallback } from "child_process";
import { readFile as readFileCallback } from "fs";
import { glob } from "glob";
import { resolve } from "path";
import { promisify } from "util";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const execFile = promisify(execFileCallback);
const readFile = promisify(readFileCallback);


async function getChangedFiles(): Promise<string[]> {
    const changedFiles = new Set<string>();

    const unstaged = await execFile("git", [
        "diff",
        "--name-only",
        "--diff-filter=ACMR"
    ]);
    unstaged.stdout
        .split(/\r?\n/)
        .map((f) => f.trim())
        .filter(Boolean)
        .forEach((f) => changedFiles.add(f));

    const staged = await execFile("git", [
        "diff",
        "--name-only",
        "--diff-filter=ACMR",
        "--cached"
    ]);
    staged.stdout
        .split(/\r?\n/)
        .map((f) => f.trim())
        .filter(Boolean)
        .forEach((f) => changedFiles.add(f));

    // Explicitly include newly added files from the index.
    const stagedAdded = await execFile("git", [
        "diff",
        "--name-only",
        "--diff-filter=A",
        "--cached"
    ]);
    stagedAdded.stdout
        .split(/\r?\n/)
        .map((f) => f.trim())
        .filter(Boolean)
        .forEach((f) => changedFiles.add(f));

    return Array.from(changedFiles);
}

async function checkForInsecureUrls(files: string[]): Promise<void> {
    const insecurePattern = /http:\/\//;

    for (const file of files) {
        try {
            const content = await readFile(file, "utf8");

            // Skip likely binary files.
            if (content.includes("\0")) {
                continue;
            }

            const lines = content.split(/\r?\n/);
            for (let i = 0; i < lines.length; i++) {
                if (!insecurePattern.test(lines[i])) {
                    continue;
                }

                console.error(`Insecure URL found in ${file}:${i + 1}`);
                console.error(`  ${lines[i].trim()}`);
                process.exitCode = 1;
            }
        } catch {
            // Ignore unreadable/non-text files.
        }
    }
}

async function main() {
    const argv = yargs(hideBin(process.argv))
        .option("config", {
            alias: "c",
            type: "string",
            description: "Path to markdown-link-check config file",
            default: ".github/markdown-link-check.jsonc",
        })
        .option("ignore", {
            alias: "i",
            type: "array",
            description: "Directories to ignore",
            default: ["node_modules/**"],
        })
        .option("checkMarkdown", {
            alias: "m",
            type: "boolean",
            description: "Validate links in markdown files",
            default: true,
        })
        .option("checkHttp", {
            alias: "u",
            type: "boolean",
            description: "Scan changed files for insecure http URLs",
            default: true,
        })
        .help()
        .alias("help", "h")
        .parseSync();

    if (argv.checkMarkdown) {
        const configPath = resolve(argv.config);
        const mdFiles = await glob("**/*.md", {
            ignore: argv.ignore as string[],
        });

        if (mdFiles.length === 0) {
            console.log("No markdown files found.");
        } else {
            console.log(`Checking ${mdFiles.length} markdown file(s)...`);
            for (const file of mdFiles) {
                try {
                    const { stdout } = await execFile(
                        "npx", ["markdown-link-check", "-v", "-c", configPath, file], { shell: true }
                    );
                    console.log(stdout);
                } catch (err: any) {
                    console.error(`Error in file: ${file}`);
                    console.error(err.stdout || err.message);
                    process.exitCode = 1;
                }
            }
        }
    } else {
        console.log("Skipping markdown link validation.");
    }

    if (argv.checkHttp) {
        const changedFiles = await getChangedFiles();

        if (changedFiles.length === 0) {
            console.log("No changed files found for insecure URL check.");
            return;
        }

        console.log(`Checking ${changedFiles.length} changed file(s) for insecure URLs...`);
        await checkForInsecureUrls(changedFiles);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
