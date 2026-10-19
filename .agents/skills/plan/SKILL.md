---
name: plan
description: 'Create implementation plans for proposed repository changes. Use when asked to plan, design, scope, investigate, or outline a proposed change before editing; do not use for reports about current repository state.'
---

# Plan

1. Read and follow the [development principles](../../references/development-principles.md).
2. When planning JSON, YAML, or XML parsing, creation, or updates, consult the [structured-files skill](../structured-files/SKILL.md) to select the appropriate existing API and identify filesystem or format-preservation constraints.
3. Consult the [architecture](../../references/architecture.md), [structure](../../references/structure.md), and [module map](../../references/modules.md) only as needed.
4. Inspect the smallest code surface needed to resolve assumptions.
5. State assumptions and decisions that affect the implementation.
6. Produce ordered implementation and verification steps without changing code.
