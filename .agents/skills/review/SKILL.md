---
name: review
description: Review repository changes or pull requests for correctness, leftover code, dependency hygiene, and copyright.
---

# Review

Inspect the diff and the directly affected code or data. Report actionable
findings with file locations and evidence.

- Flag newly unused helpers, exports, branches, factories, configuration, and
  data introduced or left behind by the change.
- When dependencies change, check whether each added dependency is used and
  whether it belongs in `dependencies` or `devDependencies`. Check the
  applicable tracked third-party license manifest under `docs/` or
  `packages/cmsis-common/` for the same dependency change.
- Follow the [copyright instructions](../../instructions/copyright.md) for
  in-scope changed source files.
