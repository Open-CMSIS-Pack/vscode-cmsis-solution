# E2E Test Engineering

## Purpose

Design, implement, validate, and diagnose end-to-end tests that exercise
valuable user workflows across real system boundaries.

The goal is not merely to make an automated test pass. The goal is to
provide evidence that an important user workflow works correctly in a
representative environment.

## Principles

### 1. Start from valuable use cases

Before implementing automation, identify the user workflows that provide
the most value or protect the highest-risk functionality.

Prefer tests covering complete workflows such as:

    environment/target discovery
        → project or solution creation
        → build
        → load/run/debug
        → inspect
        → verify

Avoid starting from implementation details simply because they are easy
to automate.

### 2. Exercise the workflow before automating it

Perform the intended workflow manually before implementing the E2E test.

Determine:

- What does the user actually do?
- What prerequisites are required?
- What environment state is expected?
- What observable result demonstrates success?
- Which steps cross component or process boundaries?
- Which steps are potentially non-deterministic?

The automated test should reproduce the intended user workflow rather
than an assumed implementation workflow.

### 3. Do not hide product weaknesses in the test

Do not add test-specific workarounds merely to make an E2E test pass.

When automation requires unusual setup, retries, reloads, delays, state
injection, or other workarounds, determine why they are necessary.

A failing E2E test may reveal a real product defect or architectural
weakness.

The test should expose such behavior rather than silently compensate for it.

### 4. Prefer deterministic behavior

Inputs, actions, synchronization points, and expected outputs should be
deterministic whenever possible.

Prefer:

- explicit state over inherited state
- observable conditions over fixed sleeps
- known test data over machine-dependent data
- controlled environment setup over assumptions about the host
- explicit success criteria over indirect signals

When non-determinism cannot be removed, document its source and boundary.

### 5. Treat failures as engineering evidence

When an E2E test fails, first classify the failure.

Possible categories include:

- product defect
- test implementation defect
- environment/setup defect
- infrastructure or CI defect
- dependency/tool defect
- non-deterministic behavior

Do not automatically modify the test because it failed.

Ask:

> Is the test wrong, or has the test discovered that the system is wrong?

Preserve enough evidence to answer that question.

### 6. Investigate local/CI differences systematically

If a failure occurs locally but cannot be reproduced in CI, or occurs in
CI but cannot be reproduced locally, compare the environments before
changing the test.

Inspect relevant differences such as:

- operating system
- environment variables
- installed tools and versions
- extensions
- configuration
- process lifecycle
- workspace state
- caches
- inherited environment
- timing and startup order

When necessary, reproduce the workflow on a clean machine or clean
environment.

A clean environment is a diagnostic tool for identifying hidden
dependencies and leaked state.

### 7. Preserve diagnostic artifacts

An E2E test should provide enough information to understand a failure
without immediately rerunning it interactively.

Where appropriate, retain:

- logs
- command output
- relevant environment information
- screenshots
- traces
- generated configuration
- build/debug output
- test-step information

Diagnostics should be useful while avoiding unnecessary secrets or
machine-specific noise.

## Workflow

When asked to create or investigate an E2E test, follow these phases.

### Phase 1 — Define

Identify:

1. User use case
2. User value
3. Preconditions
4. Actions
5. Expected observable outcome
6. System boundaries crossed

Do not start implementation until the expected outcome is clear.

### Phase 2 — Exercise

Run or reason through the workflow as a user would perform it.

Record required state, dependencies, environment changes, and observable
outputs.

Identify assumptions that could make the workflow machine-dependent.

### Phase 3 — Design

Break the workflow into reusable engineering capabilities.

For example:

    discover environment
        → prepare target
        → build
        → start execution/debugging
        → inspect state
        → verify result

Define deterministic inputs and verification points for each step.

### Phase 4 — Implement

Use existing Developer Assistant tools, MCP servers, and smaller skills
where they already provide the required capability.

Keep orchestration in the E2E skill.

Do not reimplement low-level capabilities that belong in tools or MCP
servers.

### Phase 5 — Validate

Run the test:

1. in the development environment
2. repeatedly to detect instability
3. in CI
4. in a clean environment when environment-specific behavior is suspected

Verify that failures produce useful diagnostics.

### Phase 6 — Diagnose

When the test fails, classify the failure before changing implementation.

Determine whether the evidence indicates:

    E2E test defect
    product defect
    environment defect
    infrastructure defect
    dependency/tool defect
    non-determinism

Then act on the identified cause.

## Skill vs Tool/MCP Boundary

The E2E skill owns engineering reasoning and orchestration:

- selecting and structuring the use case
- sequencing capabilities
- deciding what should be verified
- identifying deterministic boundaries
- interpreting failures
- deciding what diagnostic information is required

Tools and MCP servers own concrete operations, for example:

- discovering installed targets or tools
- executing commands
- building projects
- starting a debugger
- querying debugger state
- interacting with VS Code
- reading logs or files
- collecting execution artifacts

A useful rule is:

> The skill decides what engineering workflow should happen and why.
> Tools/MCP implementations provide the mechanisms for performing the steps.

## Expected Output

For a new E2E scenario, produce:

- use-case description
- user value
- preconditions
- workflow steps
- expected observable outcome
- deterministic inputs and outputs
- required skills/tools/MCP capabilities
- skill/tool boundary
- failure classification strategy
- diagnostic artifacts
- local and CI validation strategy