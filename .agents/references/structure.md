# Structure

Task-to-location routing for repository navigation.

Use this reference to find the primary implementation surface for a change.
See [modules.md](modules.md) for module ownership and dependencies, and
[architecture.md](architecture.md) for runtime boundaries.

## Runtime And Composition

| Task | Primary location |
| --- | --- |
| Change extension activation, dependency construction, or the exported extension instance | [src/desktop/extension.ts](../../src/desktop/extension.ts) |
| Change extension-wide command IDs, configuration keys, paths, or feature constants | [src/manifest.ts](../../src/manifest.ts), [package.json](../../package.json) |
| Add or change a VS Code API, process, filesystem, workspace, or configuration abstraction | [src/vscode-api](../../src/vscode-api) |
| Change process environment assembly or companion environment integration | [src/desktop/env-manager.ts](../../src/desktop/env-manager.ts), [src/vcpkg](../../src/vcpkg) |

## Solutions And Tools

| Task | Primary location |
| --- | --- |
| Change solution loading, active-solution state, refresh, or lifecycle events | [src/solutions/solution-manager.ts](../../src/solutions/solution-manager.ts), [src/solutions/active-solution-tracker.ts](../../src/solutions/active-solution-tracker.ts), [src/solutions/solution-event-hub.ts](../../src/solutions/solution-event-hub.ts) |
| Change CMSIS solution, project, or build file models and serialization | [src/solutions/files](../../src/solutions/files), [src/solutions/csolution.ts](../../src/solutions/csolution.ts), [packages/cmsis-common/src](../../packages/cmsis-common/src) |
| Change solution creation, workspace initialization, or MDK import | [src/solutions/solution-creator.ts](../../src/solutions/solution-creator.ts), [src/solutions/create-solution-from-data-manager.ts](../../src/solutions/create-solution-from-data-manager.ts), [src/solutions/mdk-conversion](../../src/solutions/mdk-conversion) |
| Change builds, generators, task definitions, or build commands | [src/tasks](../../src/tasks), [src/solutions/cmsis-toolbox.ts](../../src/solutions/cmsis-toolbox.ts) |
| Change debug launch generation or debug-adapter metadata | [src/debug](../../src/debug), [src/eta-ext](../../src/eta-ext), [templates/debug](../../templates/debug) |
| Change clangd, compile commands, compiler defines, or solution language features | [src/solutions/intellisense](../../src/solutions/intellisense), [src/solutions/language-features](../../src/solutions/language-features), [src/solutions/clangd-manager.ts](../../src/solutions/clangd-manager.ts) |

## Contracts And User Interface

| Task | Primary location |
| --- | --- |
| Change the public API consumed by other extensions | [api](../../api), especially [api/csolution.d.ts](../../api/csolution.d.ts) and [api/csolution-api-v2.d.ts](../../api/csolution-api-v2.d.ts) |
| Change adaptation from the public API to internal services | [src/api](../../src/api) |
| Change a browser webview UI, state model, or typed message contract | The matching feature under [src/views](../../src/views): `*-webview-view.ts`, `view/`, and `messages.ts` |
| Change extension-host handling for a webview | The matching `*-webview-main.ts` or custom editor under [src/views](../../src/views) |
| Change shared webview lifecycle, HTML, content security policy, or message transport | [src/views/webview-manager.ts](../../src/views/webview-manager.ts), [src/views/message-handler.ts](../../src/views/message-handler.ts), [src/views/common](../../src/views/common) |
| Change native Solution Outline UI, commands, or decorations | [src/views/solution-outline](../../src/views/solution-outline) |
| Change status bar, task, custom-editor, or other native VS Code UI registration | [src/status-bar.ts](../../src/status-bar.ts), [src/tasks](../../src/tasks), [src/views/manage-solution/manage-solution-custom-editor.ts](../../src/views/manage-solution/manage-solution-custom-editor.ts) |

## Data And External Integrations

| Task | Primary location |
| --- | --- |
| Change board, device, pack, or draft-project aggregation | [src/data-manager](../../src/data-manager) |
| Change remote Solar Search queries, generated operations, or result mapping | [src/solar-search/solar-search-client.ts](../../src/solar-search/solar-search-client.ts), [src/solar-search/graphql](../../src/solar-search/graphql) |
| Change persistent CMSIS Toolbox JSON-RPC behavior | [src/json-rpc/csolution-rpc-client.ts](../../src/json-rpc/csolution-rpc-client.ts); generated contract in [src/json-rpc/interface](../../src/json-rpc/interface) |
| Change CMSIS Toolbox CLI execution, queuing, cancellation, or pack reload coordination | [src/solutions/cmsis-toolbox.ts](../../src/solutions/cmsis-toolbox.ts), [src/vscode-api/runner](../../src/vscode-api/runner) |
| Change downloaded external runtime tools or their versions | [scripts/download-tools.ts](../../scripts/download-tools.ts), `csolution` versions in [package.json](../../package.json), and downloaded [tools](../../tools) |

## Declarative Assets

| Task | Primary location |
| --- | --- |
| Change settings schemas or their documentation | [schemas](../../schemas) |
| Change new-solution, project, Git, C source, or debug seed content | [templates](../../templates) |

## Tests

| Task | Primary location |
| --- | --- |
| Add or update a unit test | Place `*.test.ts` or `*.test.tsx` beside the owning source; shared support belongs in [src/__test__](../../src/__test__) |
| Change Jest-wide VS Code or static-asset mocks and setup | [__mocks__](../../__mocks__), [jestSetupFile.js](../../jestSetupFile.js) |
| Change deterministic unit-test input or expected data | [test-data](../../test-data) |
| Change Playwright workflows, drivers, fixtures, or infrastructure | [src/e2e-tests](../../src/e2e-tests), [playwright.config.ts](../../playwright.config.ts) |

## Repository Tooling And Documentation

| Task | Primary location |
| --- | --- |
| Change build, packaging, downloads, license generation, link checks, or copyright automation | [scripts](../../scripts), [webpack.config.js](../../webpack.config.js), [package.json](../../package.json) |
| Change user or developer documentation and third-party notices | [README.md](../../README.md), [DEVELOPMENT.md](../../DEVELOPMENT.md), [CONTRIBUTING.md](../../CONTRIBUTING.md), [docs](../../docs) |
