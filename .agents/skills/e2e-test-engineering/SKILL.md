# E2E Test Engineering

## Purpose

Create E2E tests that exercise valuable user workflows across real system boundaries and provide meaningful evidence that the intended workflow works correctly.

The goal is not merely to make a test pass, but to apply sound E2E test engineering principles when designing and implementing it.

## Entry Point

A **GitHub issue describing the E2E use case and workflow to be tested** is required.

Read the issue before designing or writing the test. If no GitHub issue is provided, ask for it.

## Steps

### 1. Understand the use case

Read the GitHub issue and identify:

* user workflow
* prerequisites — tools, dependencies, or resources that must be available
* preconditions — system state required when the workflow starts
* actions
* expected observable outcome
* relevant system or process boundaries
* known environment or tooling constraints

If essential information is missing or ambiguous, identify it rather than inventing behavior.

Design the test around the user workflow, not around implementation details that are convenient to automate.

### 2. Understand the workflow

Inspect relevant product code, documentation, configuration, and existing tests to determine how the workflow is expected to work.

When suitable tools or MCP capabilities are available, use them to exercise relevant parts of the workflow before automating it.

Identify:

* dependencies between workflow steps
* observable success criteria
* potentially non-deterministic behavior

Do not automate assumptions that have not been established.

### 3. Inspect existing E2E infrastructure

Search the repository for relevant:

* E2E tests
* fixtures
* drivers
* helpers
* mocks
* environment setup

Reuse existing capabilities and follow established repository patterns where appropriate.

Do not create new helpers or abstractions when an existing capability already provides the required behavior.

### 4. Design deterministic test steps

Translate the workflow into meaningful test steps.

For each significant step, determine:

```text
input → action → synchronization → observable result
```

Prefer:

* explicit state over inherited state
* observable conditions over fixed sleeps
* event/state-based synchronization over timing assumptions
* controlled test data over machine-dependent data
* explicit success criteria over indirect signals

If non-determinism cannot be avoided, make its source and boundary clear.

### 5. Implement the test

Implement the workflow using existing test infrastructure and available tools.

Keep assertions focused on observable behavior that demonstrates the workflow is working.

Use meaningful test steps so failures indicate which part of the workflow failed.

Avoid unnecessary coupling to implementation details.

### 6. Do not hide product weaknesses

Do not introduce retries, reloads, delays, state injection, or other workarounds merely to make the test pass.

If unusual setup or synchronization appears necessary, inspect the cause first.

A failing E2E test may expose a product, lifecycle, environment, infrastructure, dependency, or test problem.

Do not mask such behavior in the test.

### 7. Evaluate failures as evidence

If execution results or failure evidence are available, classify the failure as:

* product defect
* test defect
* environment/setup defect
* infrastructure/CI defect
* dependency/tool defect
* non-deterministic behavior

Do not automatically modify the test because it failed.

Ask:

> Is the test wrong, or has the test discovered that the system is wrong?

Clearly distinguish confirmed findings from hypotheses.

### 8. Keep the test diagnosable

Use assertions and test steps that make failures understandable.

When supported by the existing infrastructure, preserve useful diagnostics such as:

* logs or command output
* screenshots or traces
* generated configuration
* relevant environment information

Avoid secrets and unnecessary machine-specific information.

## Boundary

This skill defines **how the E2E test should be engineered**:

* interpret the use case
* structure the workflow
* identify prerequisites and preconditions
* identify system boundaries
* design deterministic test steps
* decide what should be verified
* apply E2E engineering principles
* interpret available failure evidence

Repository helpers, tools, and MCP capabilities provide the concrete mechanisms used to perform operations.

Successful execution of the test is **not required to complete this skill**. Do not modify product behavior or introduce test workarounds solely to obtain a passing test.

The objective is a **well-engineered E2E test**, not a green test at any cost.
