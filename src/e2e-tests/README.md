# E2E Test Framework Documentation

## Overview

This E2E (End-to-End) test framework automates testing of the CMSIS Solution VS Code extension using Playwright.
The framework includes two test styles with different scopes:

- **Data-driven tests** open existing CMSIS solutions and validate the build flow for multiple examples and
  build contexts.
- **Use-case tests** organize tests around a user goal (`UC-###`) and one or more concrete workflows
  (`WF-###`).

### Architecture

Both test styles share the infrastructure, drivers, and utilities that interact with VS Code:

```txt
src/e2e-tests/
├── infrastructure/   # Core VS Code and Playwright setup
├── drivers/          # UI component interaction wrappers
├── utils/            # Shared test helpers and use-case utilities
├── use-cases/        # Use-case-oriented E2E scenarios
└── build.test.ts     # Data-driven build test suite
```

## Use-Case Test Style

New user workflows should follow the use-case structure established by `UC-001` and `UC-002`.
A use case describes a user goal, while a workflow describes one concrete path that achieves that goal.
Use-case and workflow IDs are stable identifiers and must use zero-padded, uppercase names such as
`UC-003` and `WF-001`.

### Directory Layout

```txt
use-cases/
└── uc-<number>-<use-case-name>/
    ├── uc-<number>-<use-case-name>.test.ts
    ├── setup.ts                              # Optional external prerequisites
    ├── fixtures/
    │   └── wf-<number>-<workflow-name>.yml
    └── workflows/
        ├── wf-<number>-<workflow-name>.ts
        └── wf-<number>-<workflow-name>.yml
```

The files have distinct responsibilities:

- `uc-*.test.ts` is the thin Playwright entry point. It loads fixtures, performs suite-level setup,
  registers cleanup hooks, logs the test title, and calls the workflow implementation.
- `workflows/wf-*.yml` is the readable use-case specification. It records the use-case ID, title,
  tracking issue, ordered user steps, validations, coverage, and, where useful, acceptance criteria.
- `workflows/wf-*.ts` implements those steps using drivers and shared helpers. It exports the fixture
  type, re-exports `loadYamlFixture`, and exposes a function named `runWf<number><WorkflowName>`.
- `fixtures/wf-*.yml` contains variable inputs and expected results. Environment-specific values,
  required files, expected diagnostics, commands, and output belong here instead of in the test entry point.
- `setup.ts` is optional and prepares prerequisites shared by the use case, such as Python packages,
  CMSIS packs, or checked-out repositories.

### Workflow Specification

Each workflow specification should be reviewable without reading TypeScript:

```yaml
id: UC-003
title: Example Use Case
issue: https://github.com/Open-CMSIS-Pack/vscode-cmsis-solution/issues/000

workflows:
  - id: WF-001
    title: Complete the Example Workflow
    automation:
      test: src/e2e-tests/use-cases/uc-003-example/uc-003-example.test.ts
      fixture: src/e2e-tests/use-cases/uc-003-example/fixtures/wf-001-example-workflow.yml
    steps:
      - Open the relevant CMSIS view.
      - Perform the fixture-defined actions.
      - Verify the expected result.
    validates:
      - Expected user-visible result
    coverage:
      includes:
        - Example UI workflow
```

### Run a specific use case

   ```bash
    npm run e2e -- src/e2e-tests/use-cases/uc-00X-example/uc-00X-example.test.ts
   ```

---

## Running Tests

### Prerequisites

1. **Build and package the extension** before running tests:

   ```bash
   npm run build
   npm run package
   ```

2. **Example repositories**: Tests automatically clone required repositories on first run

3. **VS Code**: Framework downloads VS Code stable automatically via `@vscode/test-electron`

### Basic Commands

```bash
# Run all E2E tests
npm run e2e

# Run with specific log level
E2E_LOG_LEVEL=debug npm run e2e

# View test report after run
npx playwright show-report --port 9324
```

## Test Configuration

### Test Data Configuration

Tests are configured via `test_data.config.json`:

```json
{
  "examples": [
    {
      "name": "Hello",
      "contexts": [".Debug+AVH", ".Release+AVH"],
      "skipTest": false,
      "selectCompiler": false
    }
  ],
  "repositories": [
    "https://github.com/Test-software/Test-Stream"
  ],
  "cloneDirectory": "data"
}
```

**Configuration Options:**

- `name`: Example project directory name
- `contexts`: Build contexts to test (e.g., `.Debug+AVH`)
- `skipTest`: Skip this example in test runs
- `selectCompiler`: Whether to handle compiler selection dialog
- `repositories`: Git repositories to clone
- `cloneDirectory`: Target directory for cloned examples

### Playwright Configuration

Global test settings in `playwright.config.ts`:

```typescript
{
  timeout: 180000,        // 3 minutes per test
  workers: 1,             // Serial execution (VS Code limitation)
  fullyParallel: false,   // Sequential test execution
  reporter: 'html',       // HTML test report
  webServer: {
    port: 9324            // Report server port
  }
}
```

---

## Logging System

### Log Levels

The framework uses a centralized logging system with 4 levels:

| Level   | Usage | Default Shown |
|---------|-------|---------------|
| `error` | Critical failures | ✅ Yes |
| `warn`  | Warnings and issues | ✅ Yes |
| `info`  | Test progress and milestones | ❌ No |
| `debug` | Detailed execution steps | ❌ No |

### Controlling Log Output

Set the `E2E_LOG_LEVEL` environment variable:

```bash
# Show only errors
E2E_LOG_LEVEL=error npm run e2e

# Show errors and warnings (default)
E2E_LOG_LEVEL=warn npm run e2e

# Show info level (test progress)
E2E_LOG_LEVEL=info npm run e2e

# Show everything (debug mode)
E2E_LOG_LEVEL=debug npm run e2e
```

### Log Format

All logs are prefixed with their level:

```txt
[INFO] 🚀 Starting test setup...
[DEBUG] 🔄 Switching to workspace: C:/path/to/workspace
[ERROR] ❌ Build failed: compilation error
[WARN] ⚠️  Extension not found, retrying...
```
