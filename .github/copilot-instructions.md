# CMSIS Solution Extension Development Guide

## Architecture Overview

This VS Code extension for ARM CMSIS Solution follows a **backend-frontend separation** pattern with TypeScript. The backend handles file system access, JSON-RPC communication with csolution tools, and business logic, while the frontend manages webview UI components.

### Core Architecture Principles

- **Multi-layered data access**: Uses DataManager pattern aggregating multiple DataSources (SolarDataSource, CoreToolsDataSource, CsolutionDataSource)
- **JSON-RPC communication**: External `csolution` binary communicates via JSON-RPC for solution management
- **Dependency injection**: Heavy use of factory pattern and constructor injection for testability
- **Event-driven updates**: Extensive use of VS Code EventEmitters for state synchronization

## Key Structural Patterns

### Extension Activation Pattern

All major components follow this activation pattern in `src/desktop/extension.ts`:

```typescript
const activations = [
    solutionManager.activate(context),
    buildTaskProvider.activate(context),
    // ... other components
];
await Promise.all(activations);
```

### WebView Communication

Webviews use typed message passing between main thread and webview:

- `src/views/*/messages.ts` - Define IncomingMessage/OutgoingMessage types
- `WebviewManager<In, Out>` - Handles lifecycle and message routing
- `*-webview-main.ts` - Backend message handlers
- `*-webview-view.ts` - Frontend React components

### Data Management Architecture

- `DataManager` interface aggregates multiple data sources
- `DataSource` implementations: CsolutionDataSource (JSON-RPC), SolarDataSource (GraphQL), CoreToolsDataSource (gRPC)
- `DataSet<T>` - Immutable collections for UI data

### JSON-RPC Service Pattern

External tool integration via `src/json-rpc/csolution-rpc-client.ts`:

- Spawns `csolution` binary as child process
- Uses `vscode-jsonrpc` for communication
- Auto-reconnection and error handling
- Debounced pack loading on file changes

## Testing Conventions

### Factory Pattern for Test Data

Extensive use of `makeFactory<T>()` for test object creation in `*.factories.ts` files:

```typescript
export const deviceDataFactory = makeFactory<DeviceData>({
    name: () => faker.word.noun(),
    id: r => new DeviceId(r.vendor!, r.name!),
    // ...
});
```

### Mocking Patterns

- Mock VS Code APIs via `__mocks__/vscode.js`
- Factory functions for all major interfaces (e.g., `solutionManagerFactory()`)
- Use `StubEvents<T>` type for mocking EventEmitter patterns

## Build System

### Webpack Configuration

- **Extension bundle**: Node.js target for main extension code
- **Webview bundles**: Web target for React components
- Source maps enabled for debugging
- FontAwesome and VS Code webview toolkit bundled

### Development Workflows

- `npm run watch` - Development build with watch mode
- `npm run build` - Production build
- `npm run e2e` - Playwright end-to-end tests
- Tasks configured in `.vscode/tasks.json` for VS Code integration

## Project-Specific Conventions

### File Organization

- `src/views/*/` - Webview components (React + TypeScript)
- `src/solutions/` - Core solution management logic
- `src/data-manager/` - Data access abstraction layer
- `src/json-rpc/` - External tool communication
- `src/vscode-api/` - VS Code API abstractions for testability

### Error Handling

- `GrpcServiceError` for external service failures
- `HandleBuildEnoent` pattern for missing tool detection
- Extensive use of debouncing for file system watchers (typically 500-1000ms)

### Configuration Management

- All settings prefixed with `cmsis-csolution.*`
- `src/manifest.ts` centralizes configuration keys
- `ConfigurationProvider` abstraction for testable configuration access

## Copyright Requirements

When performing code reviews, check all touched files for up-to-date copyright headers:

- Single year: `/* Copyright (C) 2026 Arm Limited */`
- Year range: `/* Copyright (C) 2023-2026 Arm Limited */`
- Update to current year (2026) if file modified

## Critical Integration Points

### External Tool Dependencies

- **CMSIS Toolbox**: Downloaded via `scripts/download-tools.ts`, communicates via JSON-RPC
- **Environment Manager**: Optional integration for tool management via extension API
- **clangd**: IntelliSense integration with compile_commands.json generation
- **vcpkg**: Package management integration for toolchains

### VS Code Extension APIs

- Custom tree view providers in `src/views/solution-outline/`
- Task providers for build/debug operations
- File system watchers with glob patterns
- WebView panels with React frontends

## Pull Request Review Expectations

- During PR reviews, proactively scan the diff and surrounding files for leftover or newly unused code (or data) introduced by the change.
- When unused helpers, exports, or dead branches are detected, call them out explicitly in the review and recommend removing or refactoring them before merge.
- Treat “unused code” broadly: unreachable utilities, obsolete factories, dead exports, or stale config entries left behind by recent edits should all be flagged.
- Check package.json for unused dependencies suggest removing them. Suggest removal from third-party-licenses.json as well.
- Check package.json for dependencies that can be moved to devDependencies or vice versa and suggest according changes.
