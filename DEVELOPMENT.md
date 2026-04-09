# Developing this extension

Ensure that you've read through the [extensions guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
and follow the best practices for creating your extension.

## Installing the tools

Use vcpkg to install the tools as discussed in the [README](./README.md). The test-workspace
contains a [vcpkg-configuration.json](./test-workspace/vcpkg-configuration.json) file to do this.


## Running the extension in development

1. To download the tools, you must have a `GITHUB_TOKEN` environment variable containing a
   personal access token.

2. In order to install dependencies, Edit your global .npmrc file, and add the
   following to it:

    ```txt
    @open-cmsis-pack:registry=https://npm.pkg.github.com
    //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
    ```

    This assumes a `GITHUB_TOKEN` environment variable is exported in your environment. This needs
    to be a GitHub personal access token with the `read:packages` scope set on it.

3. Install NPM dependencies and build the TypeScript

    ```sh
    npm install
    ```

4. In Visual Studio Code, press the F5 key to run the Desktop Extension run configuration, starting
   the extension in debug mode. A new VS Code window will open with the extension loaded so it can
   be used.

5. Build the extension.

    ```sh
    npm run build
    ```

## Run the tests

### Unit tests

Unit test files are kept inline with the source files, and are named `*.test.ts`. Run with:

```sh
npm test
```

The `vscode` module is mocked in the [mocks folder](./__mocks__/vscode.js) for testing files
that interact with the VS Code extension API.

Do not reset the global mocks or the mock implementations will be deleted.

Use the `vscode-uri` module to access the `URI` class.

Factories for test data that is used in multiple tests are stored in `<name>.factories.ts` files,
where `<name>` is the source file where their return type is defined.

### End-to-end tests

A limited number of end-to-end (E2E) tests are maintained for key extension features, using the
[Playwright](https://playwright.dev/) framework. E2E test files are stored under [src/e2e-tests](./src/e2e-tests/).

Running from the terminal:

```sh
npm run build
npm run e2e
```

E2E tests can be debugged in VS Code using the **Debug Playwright E2E Tests** and
**Debug Playwright E2E Tests (Current File)** launch configurations.

After the tests complete, Playwright will generate reports in two formats:

- **HTML**
- **JUnit XML**

Both formats can be found under the `e2e-reports/` directory at the project root. For example:

```txt
📦e2e-report
 ┣ 📜index.html
 ┗ 📜results.xml
```

## Development Guidelines

### Logging

Log messages useful for end users should be exposed through an output channel. Log messages only
useful for extension developers can be logged with console.log, and appear in the debug console
when running in development mode.

## Making a release

### Checklist

Before running a release, check the following:

1. Tools and schemas integrated into the extension packages according to `package.json`
   - schema version referenced in `csolution` section

     `"schemaVersion": "<version>"`

     `<version>` must match a [project manager schemas tag](https://github.com/Open-CMSIS-Pack/devtools/releases)

2. User guide is up-to-date at [MDK-Packs/vscode-cmsis-solution-docs@main](https://github.com/MDK-Packs/vscode-cmsis-solution-docs/tree/main/site).

3. Update and review [CHANGELOG.md](CHANGELOG.md)

   Add all changes relevant for the upcoming release into the `[Unreleased]` section. This section
   is automatically replaced by the release version during the release workflow.

4. [Release Assessment](https://armh.sharepoint.com/sites/pwa/PJ1000480/SitePages/Assessments.aspx) for `CMSIS Solution Extension` is approved.

## Release versioning

This repository follows the VS Code Marketplace pre-release recommendation:

- **Odd** minor versions (`x.1.z`, `x.3.z`, ...) are pre-releases.
- **Even** minor versions (`x.0.z`, `x.2.z`, ...) are full releases.

To enforce this consistently, both packaging and publishing use `scripts/package.ts`, which:

- checks the current `package.json` version minor value.
- automatically adds `--pre-release` to `vsce package` for odd minor versions.

Use the following commands:

```sh
> npm run package [--target <target>]
```

### Release Workflow

1. Ensure the version in `package.json` is up to date.
2. Update the `CHANGELOG` with the latest changes.
3. Open a pull request with these updates and merge it into `main`.
4. Create a new release at: https://github.com/Open-CMSIS-Pack/vscode-cmsis-solution/releases
   - This will trigger the `CI.yml` workflow.
   - Once the workflow completes successfully, the release artifacts will be generated automatically.

## JSON-RPC Protocol (`csolution`)

The extension communicates with the `csolution` binary using [JSON-RPC 2.0](https://www.jsonrpc.org/specification). The protocol is defined in the [csolution-rpc](https://github.com/Open-CMSIS-Pack/csolution-rpc) repository.

The generated TypeScript client interface (`src/json-rpc/interface/rpc-interface.ts`) and API version file (`src/json-rpc/interface/version.txt`) are fetched/generated by the tooling during setup (for example via `npm install` / the `download:rpc-interface` workflow) and are not committed to this repository. Do not edit those generated files manually.

### Modifying the protocol

When a new RPC method or data type is needed:

1. **Update the OpenAPI schema** in the [csolution-rpc](https://github.com/Open-CMSIS-Pack/csolution-rpc) repository (`api/csolution-openapi.yml`). Use the [Swagger Editor](https://editor-next.swagger.io/?url=https://raw.githubusercontent.com/Open-CMSIS-Pack/csolution-rpc/refs/heads/main/api/csolution-openapi.yml) to verify the schema. Follow the [naming and schema conventions](https://github.com/Open-CMSIS-Pack/csolution-rpc/blob/main/api/README.md) defined in that repository.

2. **Regenerate the interfaces** using [json-rpc-codegen](https://github.com/Open-CMSIS-Pack/csolution-rpc/blob/main/codegen/README.md):

   ```sh
   node dist/cli.js --client rpc-interface.ts --server RpcInterface.h <schema>
   ```

   This produces two generated files:
   - `rpc-interface.ts` — TypeScript client interface (consumed by this extension)
   - `RpcInterface.h` — C++ server header (consumed by `csolution`)

3. **Implement the server side** in [`ProjMgrRpcServer.cpp`](https://github.com/Open-CMSIS-Pack/devtools/blob/main/tools/projmgr/src/ProjMgrRpcServer.cpp) in the `devtools` repository.

4. **Implement the client side** in this extension:
   - Copy the regenerated `rpc-interface.ts` into [src/json-rpc/interface/](src/json-rpc/interface/) and update [version.txt](src/json-rpc/interface/version.txt) to the new API version.
   - Expose the new method via `CsolutionService` in [src/json-rpc/csolution-rpc-client.ts](src/json-rpc/csolution-rpc-client.ts).
   - Use the method from the relevant data source or manager in [src/data-manager/](src/data-manager/).

### Debugging JSON-RPC communication

All outgoing JSON-RPC requests are printed via `console.log` in the `transceive()` function in [src/json-rpc/csolution-rpc-client.ts](src/json-rpc/csolution-rpc-client.ts). They appear in the **Debug Console** when running the extension with F5.

For more verbose output from the `csolution` process, set the `CSOLUTION_ARGS` environment variable to a comma-separated list of arguments before launching the extension:

```sh
export CSOLUTION_ARGS="--debug,-v"
```

With these flags, `csolution` produces detailed diagnostic output and writes a `csolution-rpc-log.txt` file in the target workspace folder, logging all JSON-RPC requests and responses exchanged during the session.

To test a specific RPC method manually, launch the `csolution` binary in RPC mode and send JSON-RPC requests over stdin:

```sh
csolution rpc
```

Example request:

```json
{"jsonrpc":"2.0","id":1,"method":"loadPacks","params":{}}
```

### Debugging csolution server code

To debug the `csolution` server (C++ code) running on the backend:

1. **Check out and build `devtools` with debug symbols:**

   ```sh
   git clone https://github.com/Open-CMSIS-Pack/devtools.git
   cd devtools
   cmake --preset default
   cmake --build --preset default --config RelWithDebugInfo
   ```

   The debug executable will be in the build output directory.

2. **Make the debug executable available to the extension:**

   Either copy the debug `csolution` executable to the `cmsis-toolbox/bin` directory:

   ```sh
   cp <devtools-build>/csolution <cmsis-toolbox/bin>/csolution
   ```

   Or create a symbolic link:

   ```sh
   ln -s <devtools-build>/csolution <cmsis-toolbox/bin>/csolution
   ```

   Alternatively, set the `CMSIS_SOLUTION_TOOLBOX` environment variable to point to a directory containing the toolbox structure (with `bin` and `etc` subdirectories):

   ```sh
   export CMSIS_SOLUTION_TOOLBOX=<toolbox-root>
   ```

   The debug `csolution` executable must be located at `<toolbox-root>/bin/csolution`.

3. **Launch the extension in debug mode:**

   Press F5 in VS Code to start the extension with its debugger attached.

4. **Load a csolution project** in the extension to trigger `csolution` startup.

5. **Attach the native debugger** (Visual Studio Debugger or gdb/lldb) to the running `csolution` process by PID. The process will be active while the extension is communicating with it.

## Security
For security considerations see [SECURITY.md](./SECURITY.md)

## Test or develop in Dev Containers

The `.devcontainer` folder provides a set of pre-configured environments that can be used for testing and development.
Find more details about the [Visual Studio Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers).

One can reopen the current workspace in a container by hitting the Remote Windows button `><` in the lower left

![Remote Button](https://code.visualstudio.com/assets/docs/devcontainers/containers/remote-dev-status-bar.png)

### Prerequisites

In order to use Dev Containers one needs to have Docker running. Easiest way to get Docker is installing [Docker Desktop](https://www.docker.com/products/docker-desktop/). For commercial use one needs to
[request a subscription](https://arm.service-now.com/it?id=sc_cat_item&sys_id=404439201bd53c1079b6a976b04bcb60&table=pc_software_cat_item).

### Update containers

For each container there is a subfolder in `.devcontainers` which at least contains two files:

- `devcontainer.json` - Code meta data about the container
- `Dockerfile` - Recipe to create the Docker image

To create another container just duplicate an existing folder with a new name.

The `devcontainer.json` file basically does two things:

- List environment variables dynamically set in a container. E.g., it forwards
  the local `GITHUB_TOKEN` variable into the container environment.
- Specify Code customizations such as preferences to be set and extensions to
  be installed by default.

The `Dockerfile` specifies the recipe on how to create the Linux image, including:

- Linux distribution to use (via `FROM` instruction)
- System packages to be installed (e.g., `apt-get install`)
- Additional tweaks, e.g.,
  - Setting default shell to `zsh`
  - Install Oh-My-Zsh and Powerlevel10k theme
  - Install Node Version Manager (nvm) and Node.JS
  - Install and initialize vcpkg
