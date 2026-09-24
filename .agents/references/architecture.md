# Architecture

Repository architecture boundaries and dependency direction.

This is a concise map for deciding which side of a boundary owns a change. See
[modules.md](modules.md) for detailed ownership and direct dependencies, and
[structure.md](structure.md) for task-to-location routing.

## Runtime Boundaries

### Extension Host

[src/desktop/extension.ts](../../src/desktop/extension.ts) is the composition
root for the Node.js extension host. It constructs long-lived services,
connects events, registers commands and providers, and coordinates activation
and disposal. Core solution, task, debug, data, and integration services run in
this boundary and may use Node.js and VS Code APIs.

### Browser Webviews

The webview entries in [webpack.config.js](../../webpack.config.js) run in
isolated browser contexts. Each feature under [src/views](../../src/views)
separates browser UI from extension-host control through typed `messages.ts`
contracts. Only serializable data crosses the webview message boundary.

### VS Code Native UI

Tree views, commands, tasks, status bars, custom editors, and decorations run in
the extension host but are owned by their feature adapters. They translate VS
Code events and UI actions into calls on core services rather than owning
solution state themselves.

### Public API Consumers

The declarations in [api](../../api) are the compatibility boundary for other
extensions. Implementations in [src/api](../../src/api) adapt that public
contract to internal services. Internal types and lifecycle details should not
leak into the declared API unless they are intentionally made stable.

### Companion Extensions

Environment Manager, Python Environments, Serial Monitor, and clangd are
optional extension-to-extension integrations. Access them through explicit
adapters and capability checks so the core remains usable when a companion is
missing or changes availability.

### CMSIS Toolbox RPC And CLI

[src/json-rpc](../../src/json-rpc) owns the persistent `csolution rpc` process
and generated RPC contract. [src/solutions/cmsis-toolbox.ts](../../src/solutions/cmsis-toolbox.ts)
owns queued command-line execution for `csolution`, `cbuild`, and `cpackget`.
Treat RPC state and one-shot CLI execution as separate integration paths even
when they target the same downloaded toolbox.

### Solar Search

[src/solar-search](../../src/solar-search) is the remote GraphQL boundary.
Generated operations and transport details stay there; data-source adapters
map remote results into the domain-facing data contracts.

### Filesystem And Configuration

Workspace files and VS Code configuration are external state. Access is
normally mediated by [src/vscode-api](../../src/vscode-api) abstractions and
solution file models so behavior can be tested without a live VS Code host.

### Shared CMSIS Common Package

[packages/cmsis-common](../../packages/cmsis-common) contains generic tree and
file models, parsers, serializers, renderers, schemas, and utilities. It is a
shared library, not an extension-host feature, and must remain independent of
the extension implementation and VS Code APIs.

### Build-Time And Generated Assets

[scripts](../../scripts), [schemas](../../schemas), [templates](../../templates),
and downloaded [tools](../../tools) support builds or seed runtime data. Files
identified as generated or downloaded should be changed at their source and
regenerated or redownloaded, rather than edited as authoritative source.

## Dependency Direction

1. The composition root depends on feature subsystems. Feature subsystems must
   not import the composition root or recover dependencies from it.
2. Browser webviews depend on browser-safe components and serializable message
   contracts. They must not import Node.js, VS Code, or extension-host-only code.
3. Native UI and public API adapters may call core services. Core solution and
   data services should not depend on a particular UI or public API adapter.
4. `DataManager` depends on data-source contracts. Solar Search, CMSIS Toolbox,
   and other concrete sources implement those contracts as external adapters.
5. Extension code may depend on `packages/cmsis-common`; the shared package must
   not depend on extension code.
6. External processes, services, extensions, filesystems, and configuration are
   reached through explicit clients, providers, or adapters where practical.
7. Generated and downloaded artifacts depend on their generators and version
   declarations; source code must not treat manual artifact edits as durable.

## Current Exceptions

These are existing coupling points, not patterns to extend without deliberate
review:

- Some webview message contracts expose generated RPC types directly, coupling
  browser contracts to the external service schema.
- Manage Solution and debug types have bidirectional dependencies in parts of
  their feature implementation.
- Some browser bundles import pure helpers located outside `src/views`; those
  helpers must remain browser-safe.
- Some modules access Node.js or VS Code directly instead of an injected
  adapter, which limits isolated testing.
- Global `TextFile` injection hooks provide test substitution outside normal
  constructor injection.
- The JSON-RPC adapter re-exports and augments generated interface types,
  coupling adapter and generated-contract evolution.
