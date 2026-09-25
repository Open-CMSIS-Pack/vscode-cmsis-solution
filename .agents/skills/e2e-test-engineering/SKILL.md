# E2E Test Engineering

## Purpose

Create meaningful E2E tests using Arm CMSIS Solution’s existing Playwright, VS Code harness, and driver infrastructure.

## Entry Point

The user provides a workflow description or a GitHub issue. If neither is available, ask for one.

## Steps

### 1. Understand the request

Identify the user goal, prerequisites, starting preconditions, actions, observable results, and constraints. Do not invent missing behavior.

### 2. Choose the test style

Read `vscode-cmsis-solution/src/e2e-tests/README.md` and inspect relevant existing tests:

- **Data-driven:** Open existing CMSIS solutions and validate builds across examples and contexts. See `src/e2e-tests/build.test.ts`.
- **Use-case:** Test a user goal (`UC-###`) through concrete workflows (`WF-###`). See `src/e2e-tests/use-cases/`.

If the user has not specified a style, select the clear match. If both fit and the choice changes the test’s scope, ask which style they want.

### 3. Inspect the infrastructure and design the test

Inspect only the relevant files under `src/e2e-tests/infrastructure/`, `drivers/`, `utils/`, and the selected test style. Check `playwright.config.ts` where needed. Reuse existing setup, drivers, fixtures, and helpers.

For each significant step, define:

`input → action → synchronization → observable result`

Prefer controlled data and observable conditions over fixed sleeps.

### 4. Present a plan

Before editing code, give the user a concise plan covering the test style, workflow or build matrix, prerequisites, assertions, files to change, and unresolved questions. **Wait for explicit confirmation or correction before implementing.**

### 5. Implement the confirmed plan

Follow the selected repository pattern. For use-case tests, keep the Playwright entry point thin, document the workflow in YAML, put variable inputs and expected results in a fixture, and use drivers for UI interactions. Keep assertions focused on observable behavior.

### 6. Evaluate the result

Run relevant checks when possible. Investigate failures before changing the test; do not add retries, reloads, delays, or state injection solely to make it pass. Report confirmed findings separately from hypotheses and retain useful diagnostics without secrets.

## Completion

Report what changed, what was run, and any unresolved findings. A green run is not required if the test exposes a genuine problem.

## Token discipline

Read the README once, then inspect only files relevant to the chosen style and workflow. Reuse findings instead of repeatedly searching or restating them. Keep the plan and final report brief; include details only when they affect an engineering decision.