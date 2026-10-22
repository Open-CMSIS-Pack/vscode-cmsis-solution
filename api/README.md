# CMSIS Solution Extension API

This API provides other VSCode extensions access to a subset of functionality implemented by the CMSIS Solution
Extension, such as querying available boards, devices, and project drafts, as well as creating new solutions and
triggering build tasks.

Example for getting access to the API v2 from another extension:

```typescript
import type { CsolutionExtension } from '@arm-software/vscode-cmsis-csolution';
const csolutionExtension = vscode.extensions.getExtension<CsolutionExtension>('Arm.cmsis-csolution');
if (csolutionExtension) {
    const api = (await csolutionExtension.activate()).getApi(2);
    // use api calls as described below
}
```

## API version 3 (in development)

V3 is available through `getApi(3)`. It retains `getBoards`, `getDevices`,
`getDraftProjects`, `createNewSolution`, and `build` with their V2 behavior.
V2 is unchanged and does not expose `getToolsEnvironment`, `getPacks` or `installPacks`.

### Install Packs

```typescript
const results = await api.installPacks({
    packs: ['ARM::CMSIS@6.1.0', 'Keil::MDK-Middleware'],
    approved: true,
});
```

Pack IDs use `vendor::name` or `vendor::name@version`; omitting the version
installs the latest available version. This API is non-interactive: the caller
must obtain user approval before passing `approved: true`. The extension does
not show an approval dialog and uses the existing pack-install command for each
approved pack. The `approved` boolean is required by the TypeScript API; at runtime
only the literal value `true` permits installation. False, omitted or invalid
approval values cancel the entire batch without running installation commands.
The returned array follows input order, with one `{ pack, status }` entry per
request. `status` is `installed` (with `path`), `failed` (with `error`), or
`cancelled` when approval is not granted. An empty batch returns an empty array.
Malformed pack arrays reject the call. For approved batches, invalid pack IDs and
installation failures are reported individually; remaining packs are still attempted.

### Pack Catalogs

```typescript
const api = (await csolutionExtension.activate()).getApi(3);
const catalog = await api.getPacks();
const installed = await api.getPacks({ scope: 'installed' });
```

Default/`all` merges the local `.Web/index.pidx` catalog with installed RPC packs by
identifier and version. The index lists only its latest version per pack family,
may be stale, and does not provide descriptions. Installed packs can supply older
versions and descriptions. `installed` queries only RPC. Every scope returns `{ packs }`.
Catalog pack records contain `id`, `version`, and optional `description`,
`installed` and `path`, sorted by ID. Installation status is unknown when RPC
fails, rather than falsely claiming that indexed records are uninstalled.
Successful sources are retained when another source fails, so
catalog results may be incomplete without an explicit indication.
Queries wait for pack initialization without loading or activating a solution.
For solution-free catalog queries, RPC receives `context: ''`.

### Used Packs

```typescript
const result = await api.getPacks({ scope: 'used', context: 'App.Debug+Board' });
```

`used` requires an explicit, exact context in the loaded solution's active target
set. It returns `{ packs }`, retaining only RPC records marked
used, in RPC order without deduplication. Records contain `id`, `version` from
the pack ID and optional `description`. A matching non-missing resolved RPC
reference supplies `installed: true` and its optional `path`. Without that
evidence these fields are absent, not a claim that the pack is uninstalled.

Missing/blank context, an unloaded solution, unknown context, RPC failure,
malformed/unversioned used IDs and detected solution/context changes reject.
A successful query with no used records returns an empty pack array. The query
does not load a solution, change selection, install packs or write files. It uses
the shared RPC session and does not guarantee snapshot isolation during editing
or reloading. V2 is unchanged.

### Missing Packs

```typescript
const result = await api.getPacks({ scope: 'missing', context: 'App.Debug+Board' });
```

`missing` returns `{ packs }` with one record per RPC reference
explicitly marked missing, preserving RPC order and duplicates. Each record has
`pack` (the original requirement), `origin` and optional `resolvedPack` when supplied
by RPC. Requirements can be unversioned or contain version ranges, so these are
not resolved pack identities: no `id`, `version`, installation flag or path is invented.
All scopes use the same result type with optional pack-record fields; check the
requested scope before using a field. Parent pack `used` flags do not filter
missing references.

The query requires an explicit, exact context in the loaded solution's active
target set. Missing/blank context, an unloaded solution, unknown context, RPC
failure and detected solution/context changes reject. Success with no missing
references returns an empty array. It does not load solutions, change selection,
install packs or write files. Shared RPC access does not provide snapshot isolation.
V2 remains unchanged.

### Pack Filtering

All four pack scopes accept an optional `filter: { text?: string }`:

```typescript
const result = await api.getPacks({
    scope: 'used',
    context: 'App.Debug+Board',
    filter: { text: 'cmsis' },
});
```

Text is a case-insensitive literal substring, not a regex. All/installed/used
match `id` or `description`; missing matches only the original `pack` requirement,
not `origin` or `resolvedPack`. Omitted/empty text means no restriction; whitespace
is literal. Filtering preserves order and duplicates, and captures
text before awaiting sources. It runs after existing validation and mapping:
even a filter that matches nothing does not bypass prerequisites, malformed used
IDs or source errors. No extra queries are made, and source selection is unchanged.

### Tools Environment

```typescript
const api = (await csolutionExtension.activate()).getApi(3);
const yaml = await api.getToolsEnvironment();
```

Returns fresh YAML in the [tools-environment format](../schemas/tools-environment.md)
without requiring a loaded solution or reading/writing the generated workspace
file. The getter and conversion writer share the same environment owner and
serializer. A loaded solution supplies optional relative `solution` metadata.

This is the current **VS Code window environment**, including configured variables,
built-in tools and currently available Arm Tools contributions. Multi-root windows
share that environment: selecting an Explorer folder does not select an isolated
tool environment. The getter waits for an in-progress Arm Tools activation through
the existing provider, but does not guarantee that every workspace root has been
activated. Missing or disabled Arm Tools leaves the available built-in/configured
environment; activation failure follows the existing writer's available-state behavior.

Arm Tools owns activation, download permissions and prompts. The getter may activate
the enabled extension, but does not invoke vcpkg, acquire tools independently, or
accept folder/download-consent options.

### API V3 Smoke Tests

[The extension-host fixture](../src/api/extension-host-v3-smoke.ts) runs against the
real extension. Its tools-environment mode uses a multi-root window to check
configured variables, built-in tools, nonempty PATH, repeatable output, V2
compatibility, unchanged solution selection and absence of generated files in
both roots. It restores the workspace setting and disposes the API in `finally`.

Build the extension with `npm run build` after a clean checkout or changes to
extension sources. The launch preparation task compiles the fixture before
each run. Select
**API V3 Smoke Tests**, press **F5**, and choose **Tools Environment** from the picker.
The preparation task also creates a workspace with two fresh empty
folders under the ignored `.vscode-test/api-v3-smoke` directory on each run.
No manual workspace setup or path input is needed. Previous run folders are retained
for inspection. The launcher uses `--extensionTestsPath` to invoke the fixture's
exported `run()` function directly. Launch **API V3 Smoke Tests** again to rerun
a scenario. Each launch uses an isolated user-data directory
and requires the repository's bundled tools and the extension's normal dependencies.
Arm Tools remains responsible for any activation prompts. No installed packs or
loaded solution are required. Activation waiting/failure and loaded-solution YAML
parity are covered by the focused unit tests.

#### Pack Smoke Modes

Choose a scenario from the **API V3 Smoke Tests** picker when launching with **F5**.
The preparation task creates the appropriate disposable workspaces, and the selection runs a scenario in the
shared [extension-host fixture](../src/api/extension-host-v3-smoke.ts):

- **Install Packs (Real Installation)**: runs in an empty window with no installed-pack
    prerequisite. Checks V3 exposure, V2 isolation, an empty batch, invalid
    input, cancellation with `approved: false` and unchanged solution selection,
    then requests `ARM::CMSIS@6.0.0` and `ARM::Cortex_DFP@1.2.0` with `approved: true`.
    Selecting this mode authorizes these real installations; there is no approval
    dialog. Checks ordered successful results, version paths and installed PDSC
    files. Requires network access for packs not already cached. Packs remain in
    the configured pack cache; existing installations are accepted. Rerunning the
    scenario also supplies approval automatically.
- **Installed Packs**: queries only `scope: 'installed'` via RPC in an empty window.
    Requires installed packs and a backend that accepts `GetPacksInfo` with an
    empty context without a loaded solution. It does not query the index-backed catalog.
- **All Packs (Index)**: checks installed packs and the combined default catalog in
    an empty window. Requires `.Web/index.pidx` and at least one indexed pack not
    installed locally, in addition to the RPC prerequisites above.
- **Used Packs (Loaded Solution)** and **Missing Packs (Loaded Solution)**: each opens a fresh disposable copy of
    [the pack fixture](../test-data/api-v3-packs/Components.csolution.yml), containing
    only its respective solution file, the shared project and the
    [.vscode settings](../test-data/api-v3-packs/.vscode/settings.json), which disable
    pack downloads, web services and automatic conversion. Requires already
    installed `ARM::CMSIS` and `ARM::CMSIS_DFP`. These modes activate the normal or
    deliberately missing-pack solution and check used/missing records, literal
    filters, serialization, repeatability, invalid contexts and unchanged inputs
    and selection. No component-discovery API is required.

Normal extension activation can generate workspace artifacts in the disposable
loaded-pack folders. Verify the scenario's explicit success message in the Debug
Console and check for test errors; the VS Code launcher can return zero even when
the extension-host test fails. Failures propagate to the extension test runner.
All modes dispose the API. The launch configuration sets `CMSIS_V3_SMOKE_MODE` internally to select
the shared fixture's scenario; it does not configure the extension or public API.

## API version 2

The API version 2 provides a more streamlined and efficient way to interact with the CMSIS components, making it easier
to integrate and utilize these features in other extensions.

### Query available boards

This function allows you to query the available boards based on optional filter arguments. It returns a list of boards
that match the specified criteria, providing detailed information about each board, including its vendor, name,
revision, and associated packs.

Example:

```typescript
    const filter: BoardFilter = { /* optional filter arguments */};
    const boards = await api.getBoards(filter); // BoardData[]
    console.log(`Available boards (${boards.length}):`);
    for (board of boards) {
        const pack = await board.pack;
        let packId = ''
        if (pack) {
            let packVersion = ''
            if (pack.version) {
                packVersion = `@${pack.version}`
            }
            packId = ` (${pack.vendor}::${pack.name}${packVersion})`
        }
        console.log(` - ${board.vendor}::${board.name}:${board.rev ?? ''}${packId}`)
    }
```

### Query available devices

Similar to querying boards, this function allows you to query the available devices based on optional filter arguments.
It returns a list of devices that match the specified criteria, providing detailed information about each device,
including its vendor, name, and associated packs.

Example:

```typescript
    const filter: DeviceFilter = { /* optional filter arguments */};
    const devices = await api.getDevices(filter); // DeviceData[]
    console.log(`Available devices (${devices.length}):`);
    for (device of devices) {
        const pack = await device.pack;
        let packId = ''
        if (pack) {
            let packVersion = ''
            if (pack.version) {
                packVersion = `@${pack.version}`
            }
            packId = ` (${device.pack.vendor}::${device.pack.name}${packVersion})`
        }
        console.log(` - ${device.vendor}::${device.name}${packId}`)
    }
```

### Query available project drafts

Retrieve a list of available project drafts for a selected board and/or device. This function helps you identify and
select project drafts that are compatible with the specified hardware, providing a convenient way to kickstart new
projects.

Example:

```typescript
    const boardId = boardData.id;   // retrieved by api.getBoards()
    const deviceId = deviceData.id; // retrieved by api.getDevices()
    const drafts = await api.getDraftProjects(boardId, deviceId); // DraftProjectData[]
    console.log(`Available project drafts (${drafts.length}):`);
    for (draft of drafts) {
        const pack = draft.pack;
        let packId = ''
        if (pack) {
            let packVersion = ''
            if (pack.version) {
                packVersion = `@${pack.version}`
            }
            packId = ` (${pack.vendor}::${pack.name}${packVersion})`
        }
        console.log(` - ${draft.name}${packId}`)
    }
```

### Create a new solution from a project draft

This function allows you to create a new solution from a selected project draft. It copies the project draft into the
specified folder, adapts it for the given board and device, and opens it in a new instance of the code editor. This
streamlines the process of setting up new projects, ensuring that all necessary configurations are in place.

Example:

```typescript
    const board = boardData;         // retrieved by api.getBoards()
    const device = deviceData;       // retrieved by api.getDevices()
    const draft = draftProjectData;  // retrieved by api.getDraftProjects()
    const projectOptions : CreateNewSolutionOptions = {
        draft, board, device,
        folder: '/path/for/new/solution',
    };
    await api.createNewSolution(projectOptions);
```

### Trigger build tasks

Build, rebuild, or clean tasks can be triggered via the API. This function allows you to specify options such as
`--updateRte` and `--packs` command line flags to cbuild, providing flexibility in how build tasks are executed. This
is useful for automating the build process and ensuring that all necessary dependencies and configurations are up to
date.

Example:

```typescript
    const buildOptions: CsolutionApiV2.BuildOptions = {
        clean: false,       // --clean
        rebuild: false,     // --rebuild
        updateRte: false,   // --update-rte
        packs: false        // --packs
    };
    await api.build(buildOptions);
```

## API version 1 (broken, deprecated)

The API version 1 is broken and not accessible from v1.50.0 onwards.

### Broken API calls

The following calls changed their behavior.

#### getBoards

The `APIv1::getBoards()` call now returns only boards found in locally installed packs instead of all indexed packs.
Consider using `APIv2::getBoards()` instead.

#### getDevices

The `APIv1::getDevices()` call now returns only devices found in locally installed packs instead of all indexed packs.
Consider using `APIv2::getDevices()` instead.
