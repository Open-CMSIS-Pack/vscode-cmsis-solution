# E2E Test Framework Documentation

## Overview

This E2E (End-to-End) test framework automates testing of the CMSIS Solution VS Code extension using Playwright.
It validates the complete user workflow from extension installation through project building across multiple
example projects.

### Architecture

The framework follows a **3-layer architecture** for maintainability and reusability:

```txt
src/e2e-tests/
├── infrastructure/   # Core VS Code & Playwright setup
├── drivers/          # UI component interaction wrappers
├── utils/            # Test helpers and utilities
└── build.test.ts     # Main test suite
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
