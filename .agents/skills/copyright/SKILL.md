---
name: copyright
description: 'Apply or review repository copyright notices. Use when adding or modifying covered source files, checking current-year notices, fixing copyright headers, or reviewing changed files for copyright compliance.'
user-invocable: false
---

# Copyright

Treat [`scripts/copyright-manager.ts`](../../../scripts/copyright-manager.ts)
as authoritative for covered files and exclusions. For covered source files
that are added or modified, use the repository's Apache-style Arm copyright
notice. Preserve an existing starting year and update the ending year to the
current year.

Exclude every file under a `test-data` directory from copyright requirements,
checks, and fixes. This includes files selected by an explicit `--include` or
custom `--exclude` argument.

For an in-scope set of changed files, run
`npm run copyright:fix -- --include=path/to/file.ts,another/file.tsx`, then
`npm run copyright:check -- --include=path/to/file.ts,another/file.tsx --current-year`.
The default repository-wide `copyright:check` verifies presence and remains the
CI check. During a read-only code review, inspect in-scope changed files and
report missing or outdated notices without running the fix command.
