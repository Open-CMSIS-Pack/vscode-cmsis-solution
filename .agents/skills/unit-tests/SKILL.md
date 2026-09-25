---
name: unit-tests
description: Use when planning, adding, debugging, or reviewing focused unit or component tests in the CMSIS Solution VS Code extension.
metadata:
  team: CMSIS Solution
  short-description: Plan and implement focused Jest and React unit tests for this repository
---

# CMSIS Solution Unit Tests

## Prerequisites

- For unit-test work, follow the
  [unit-test instructions](../../instructions/unit-tests.md).
- Use the [architecture](../../references/architecture.md),
  [structure](../../references/structure.md), and
  [module map](../../references/modules.md) only as needed to identify the
  owning boundary.

## Repository Test Support

- Root tests use Jest with jsdom and the shared setup in
  [`jestSetupFile.js`](../../../jestSetupFile.js).
- React webviews and hooks use `@testing-library/react`.
- Reuse nearby `*.factories.ts`, `makeFactory`, and `makeGenerator` facilities,
  with explicit overrides for behaviorally important values.
- When a test needs a temporary directory, use `TestDataHandler` from
  [`src/__test__/test-data.ts`](../../../src/__test__/test-data.ts). Use
  `tmpDir` for an empty directory, `copyTestDataToTmp(...)` for a mutable copy
  of prepared fixtures, and `dispose()` from `afterAll` for cleanup.
- Available boundary support includes [`__mocks__/vscode.js`](../../../__mocks__/vscode.js),
  injected providers, `StubEvents<T>`, `EventEmitter`, `nock`, and focused
  process or transport mocks. Use only the support required by the selected
  boundary.

## Focused Workflow

1. Identify the observable changed behavior and inspect the owning code,
   nearest tests, public contract, and direct collaborators.
2. Classify the smallest relevant boundary: pure unit, React/webview component,
   VS Code adapter, filesystem, or process/RPC.
3. Select the requested behavior and the smallest directly relevant success,
   failure, boundary, state, or lifecycle cases.
4. Reuse nearby fixtures, factories, providers, and mocks before adding test
   infrastructure. If a test exposes a product defect or missing seam, report
   it rather than changing production code merely for test convenience.
5. Assert observable results such as values, errors, registrations, events,
   messages, process arguments, file output, or disposal. Prefer exact
   assertions over truthiness or broad snapshots.
6. Keep tests independent of real network access, external binaries,
   wall-clock sleeps, shared global state, execution order, and host-specific
   paths. Restore mocks and dispose resources.
7. Run the narrowest relevant Jest slice after the first test edit, then review
   assertions, cleanup, stale mocks, and dead helpers before widening checks.

## Validation And Reporting

- Focused root test:
  `npx jest --runInBand path/to/file.test.ts -t "case name"`.
- Type validation: `npm run compile`; its prerequisite builds the shared
  `cmsis-common` package.
- Full root validation: `npm test`; its prerequisite builds and tests
  `cmsis-common`, then root Jest runs with coverage.
- Production bundle: `npm run build`, only when bundling is relevant.
- Root Jest excludes `packages/cmsis-common`; use that workspace's test command
  for package tests.

Report only commands actually run and their outcomes. Never invent coverage
values. When coverage measurement is requested and collected, report before
and after statements, branches, functions, and lines for each relevant file,
including percentage-point changes.
