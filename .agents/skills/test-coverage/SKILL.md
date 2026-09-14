---
name: test-coverage
description: Use when planning, adding, debugging, or reviewing focused unit, webview, or integration test coverage in the CMSIS Solution VS Code extension.
metadata:
  team: CMSIS Solution
  short-description: Plan and implement focused Jest and React coverage for this repository
---

# CMSIS Solution Test Coverage

Use this skill when a user asks for tests, coverage improvements, a test plan,
a failing-test diagnosis, or validation of a change in the CMSIS Solution VS
Code extension.

Keep the work proportional to the request. A narrow regression normally needs
a narrow test. A missing or recreated suite needs representative coverage of
the source file's applicable public behavior, not just one happy path.

## Repository Context

- The extension host is Node.js and TypeScript code under `src/desktop`,
  `src/solutions`, `src/tasks`, `src/vscode-api`, `src/json-rpc`,
  `src/data-manager`, and related backend folders.
- React webviews are under `src/views`. Backend and frontend communicate
  through typed message contracts, `WebviewManager`, and VS Code messenger
  APIs.
- `src/desktop/extension.ts` is the composition root for providers, managers,
  data sources, commands, tasks, watchers, and webview handlers.
- `DataManager` aggregates enabled `SolarDataSource` and
  `CsolutionDataSource` implementations and returns immutable `DataSet` values
  while retaining rejected-source errors.
- `CsolutionService` owns csolution process launch, JSON-RPC transport,
  `pack.idx` and `.Local/local_repository.pidx` watchers, version caching,
  mutex-protected requests, shutdown, and reload coordination.
- Webpack produces one Node extension bundle and five browser webview bundles:
  create solution, manage components, manage solution, configuration wizard,
  and configure solution.
- TypeScript is strict with `noUnusedLocals`, `noUnusedParameters`,
  `noImplicitReturns`, and `isolatedModules`. Use the Node.js, npm, TypeScript,
  and VS Code engine versions declared by the repository.
- Treat current implementation, public types, repository documentation,
  schemas, templates, tests, and configuration as the primary evidence. Check
  RPC types in `src/json-rpc/interface`, public declarations in `api`, schemas
  and templates under `templates` and `test-data`, and settings in
  `src/manifest.ts` when relevant.

## Native Test Style

- Unit tests are colocated with production code and named `*.test.ts`.
- Use Jest with `describe` and `it`. Isolate state with `beforeEach` or
  `afterEach` and restore spies with `jest.restoreAllMocks()` when needed.
- Use `@testing-library/react` and the jsdom environment for React webviews and
  hooks. Reuse the facilities in `jestSetupFile.js`.
- Reuse repository factories from `*.factories.ts`, `makeFactory`, and
  `makeGenerator`. Prefer explicit overrides for behaviorally important
  values.
- Prefer real implementations with realistic fixtures, temporary files,
  in-memory data, and injected providers. Mock external processes, network
  services, platform APIs, nondeterministic boundaries, and unavailable VS
  Code APIs.
- When mocking is necessary, use `__mocks__/vscode.js` and existing provider
  abstractions such as `CommandsProvider`, `ConfigurationProvider`, workspace
  or file-system providers, message providers, and event emitters.
- Prefer constructor injection and factory-created stubs. `StubEvents<T>` and
  `EventEmitter` are the established event-bearing patterns.
- Assert observable behavior: returned values, `DataSet` contents, errors,
  registrations, emitted events, task definitions, webview messages,
  HTML/resource paths, process arguments, and disposal.
- Use `nock` or focused transport mocks for HTTP or GraphQL boundaries. Mock
  `child_process.spawn`, `vscode-jsonrpc/node`, file watchers, timers, and
  environment managers at their external boundary.

## Workflow

1. Identify the requested behavior, source file, owning abstraction, intended
   test file, and cheapest discriminating check.
2. If a public issue is referenced, use it as requirements context and
   reconcile it with current code, public contracts, and repository
   documentation. Report material conflicts instead of assuming one source
   automatically overrides the others.
3. Read the nearest implementation, public types, neighboring tests, direct
   callers, and relevant factories or mocks.
4. Choose scope deliberately:
   - For an incremental request, cover the requested behavior and directly
     relevant regression, error, or boundary path.
   - For a missing or recreated suite, inspect the source's public behavior and
     direct collaborators. Cover every applicable behavior class: principal
     success flows, errors or invalid inputs, boundaries, mutation or state
     transitions, caching or lifecycle behavior, and supported format or
     configuration variants.
   - Do not stop after one happy path, but do not expand a narrow request into
     an exhaustive subsystem rewrite.
5. Classify the boundary as a pure unit, backend integration seam,
   React/webview, VS Code adapter, filesystem operation, or process/RPC
   interaction.
6. Reuse existing factories, fixtures, provider stubs, and mocks. Add a helper
   only when established seams cannot express the behavior clearly.
7. Implement the smallest test change that proves the selected behavior. Keep
   tests deterministic and independent of real network access, wall-clock
   sleeps, real external binaries, and shared global state.
8. Do not change production code merely to make a test convenient. If a test
   exposes a product defect or missing test seam, explain it and keep any
   production change minimal and within the user's approved scope.
9. Run the narrowest relevant Jest command immediately after the first edit.
   Repair and rerun that slice before widening validation.
10. Run TypeScript compilation and linting. Run the full Jest suite or
    production build when the change's scope or repository conventions require
    them.
11. Review the final diff for weak assertions, unused imports, stale mocks,
    dead helpers, missing cleanup, unrelated edits, and accidental production
    changes.

## Behavior Guidance

- Prefer public APIs and injected interfaces. Assert external effects rather
  than private implementation details.
- Prefer exact object or array equality, typed discriminants, error text or
  codes, call arguments, event payloads, and message shapes over weak
  truthiness assertions.
- For `DataManager`, consider fulfilled and rejected `Promise.allSettled`
  results, disabled sources, duplicate or priority aggregation, and error
  recording when those behaviors are in scope.
- For RPC tests, consider process launch failure and success, request rejection
  mapping, mutex release, cached versions, watcher suspension and resumption,
  pending reload, child exit or disconnect, and disposal when applicable.
- For webview tests, consider panel creation or reveal, HTML/resource URI
  construction, CSP/resource roots, message routing, visibility, disposal,
  typed messages, and user-visible React behavior when applicable.
- For commands, tasks, tree providers, and custom editors, consider
  registration, definitions, hierarchy, refresh events, file-open policy, and
  failure reporting when applicable.
- For asynchronous behavior, avoid real sleeps. Use resolved promises,
  explicit event completion, focused flush helpers, or fake timers only when
  timing itself is the contract.
- Restore spies and mocks, dispose listeners and resources, and keep tests
  independent of execution order.
- Avoid broad snapshots when direct assertions communicate the contract more
  precisely. Do not add skipped tests to hide missing prerequisites.

These lists guide investigation; they do not require every category in every
test change.

## Portability

- Use Node.js `path`, `url`, `os`, and filesystem APIs or injected platform
  abstractions for path and filesystem behavior.
- Keep fixtures independent of the host operating system. Model explicit
  Windows and POSIX cases when the implementation supports both.
- Assert process executables and argument arrays separately rather than
  relying on shell-specific command strings.
- Follow the repository's formatter and line-ending conventions.
- Report only operating systems that were actually tested. Leave remaining
  platforms to the repository's CI matrix.

## Commands

Start with the focused test and widen as justified:

```bash
npx jest --runInBand path/to/file.test.ts -t "case name"
npm run compile
npm run lint
npm test
npm run build
```

Use a test-name filter when useful. If lint fails, correct failures caused by
the changed files and rerun lint. Do not apply a repository-wide automatic
lint rewrite unless the user explicitly approves that broader change.

## Planning And Reporting

For a narrow request, give a short plan or proceed directly when implementation
was requested. For a substantial or cross-boundary change, describe:

1. target behavior, files, public contracts, and boundary;
2. applicable success, error, boundary, state, and lifecycle cases;
3. fixtures, mocks, and observable assertions;
4. focused and wider validation commands; and
5. intentionally uncovered behavior and why it remains outside scope.

End implementation work with a concise test-coverage summary containing:

- production and test files covered;
- behaviors added or changed;
- commands actually run and their outcomes;
- coverage measurements only when they were collected; and
- remaining gaps or CI-dependent platforms.

Never invent coverage values or claim validation that did not run. When
coverage is available, report before and after statements, branches,
functions, and lines for each relevant production file and calculate the
increase in percentage points.
