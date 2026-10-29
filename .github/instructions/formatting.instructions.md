---
description: 'Apply repository text-file formatting requirements when creating or modifying source, configuration, data, or documentation files.'
applyTo: "**"
---

# File Formatting

For all text and source files, including YAML, JSON, C, C++, header, TypeScript, and JavaScript files:

1. Use LF line endings, except `.bat` files, which use CRLF and are excluded from the formatting script.
2. End every file with one newline.
3. Use the repository `fmtlf` script rather than creating ad hoc newline scripts.
	For changed files, run `npm run fmtlf:fix -- --include=path/to/file.ts,another/file.md`,
	then `npm run fmtlf:check -- --include=path/to/file.ts,another/file.md`.
	The repository-wide read-only command is `npm run fmtlf:check`.
