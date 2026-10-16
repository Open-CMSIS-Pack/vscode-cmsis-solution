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
V2 is unchanged and does not expose `getToolsEnvironment`.

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
real extension in a multi-root window. It checks configured variables, built-in
tools, nonempty PATH, repeatable output, V2 compatibility, unchanged solution
selection and absence of generated files in both roots. It restores the workspace
setting and disposes the API in `finally`.

Select **API V3 Smoke Tests (Real VS Code)** and press **F5**. The preparation task
builds the extension, compiles the fixture, and creates a workspace with two fresh
empty folders under the ignored `.vscode-test/api-v3-smoke` directory on each run.
No manual workspace setup or path input is needed. Previous run folders are retained
for inspection. The launch uses an isolated user-data directory
and requires the repository's bundled tools and the extension's normal dependencies.
Arm Tools remains responsible for any activation prompts. No installed packs or
loaded solution are required. Activation waiting/failure and loaded-solution YAML
parity are covered by the focused unit tests.

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
