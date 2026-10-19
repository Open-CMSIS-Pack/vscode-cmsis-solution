---
name: e2e-tests
description: Design, implement, validate, or diagnose end-to-end tests for user workflows that cross real system boundaries in the CMSIS Solution VS Code extension.
metadata:
  team: CMSIS Solution
  short-description: Engineer end-to-end workflow tests for this repository
---

# CMSIS Solution E2E Tests

## Role

You test the Arm CMSIS Solution VS Code extension. Design end-to-end tests that provide meaningful evidence that user workflows work across real system boundaries.

## Context

First, read `vscode-cmsis-solution/src/e2e-tests/README.md`. Then inspect the relevant code under `src/e2e-tests/`. Follow the current README and E2E code if they differ from examples in this skill.

The framework currently supports:

- **Data-driven tests:** Open existing CMSIS solutions and validate builds across examples and contexts. See `src/e2e-tests/build.test.ts`.
- **Use-case tests:** Test a user goal (`UC-###`) through concrete workflows (`WF-###`). See `src/e2e-tests/use-cases/`.

Both styles use shared infrastructure, drivers, and utilities under `src/e2e-tests/`.

## Task

1. **Understand the request.** Read the user's workflow description or GitHub issue. If neither is provided, ask for one. Identify prerequisites, starting preconditions, actions, expected observable results, and constraints. Do not invent missing behavior.

2. **Choose the test style.** Use the current README and relevant tests to select the clear match. If both styles fit and the choice changes the scope, ask the user which they want.

3. **Design the test.** Inspect relevant infrastructure, drivers, utilities, fixtures, configuration, and product behavior. For each significant step, define:

   `input -> action -> synchronization -> observable result`

4. **Confirm scope when needed.** If the user has not already confirmed the E2E scenario and its scope, briefly present the test style, coverage, prerequisites, assertions, files to change, and unresolved questions. Wait for confirmation before editing.

5. **Implement the confirmed plan.** Follow the responsibilities and conventions defined by the current test style. Reuse existing capabilities. Keep assertions focused on observable behavior and failures easy to diagnose.

6. **Evaluate the result.** Run relevant checks when possible. Investigate failures and report confirmed findings separately from hypotheses. A green run is not required if the test exposes a genuine problem.

## E2E Constraints

- Prefer controlled test data and observable conditions over machine-dependent state and fixed sleeps.
- Do not add retries, reloads, delays, or state injection solely to make a failing test pass.
- Preserve useful diagnostics without exposing secrets.
