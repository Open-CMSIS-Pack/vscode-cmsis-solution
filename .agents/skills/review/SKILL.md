---
name: review
description: 'Review repository changes, diffs, or pull requests. Use for code review, PR review, regression analysis, dependency hygiene, leftover code, and copyright findings.'
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
- Follow the [copyright skill](../copyright/SKILL.md) for
  in-scope changed source files.
