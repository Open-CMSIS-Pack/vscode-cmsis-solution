# Developing this extension

Ensure that you've read through the [extensions guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
and follow the best practices for creating your extension.

## Installing the tools

Use vcpkg to install the tools as discussed in the [README](./README.md). The test-workspace
contains a [vcpkg-configuration.json](./test-workspace/vcpkg-configuration.json) file to do this.

### Arm Compiler

Arm Compiler is currently not available in vcpkg. Internal Arm users can download Arm Compiler
builds from Warehouse at `smb://neptune.euhpc.arm.com/warehouse/Distributions/FA/ARMCompiler`.

For example:

- _Windows_: `\\neptune.euhpc.arm.com\warehouse\Distributions\FA\ARMCompiler\6.18\123\standalone-win-x86_64-rel`
- _Linux_: `smb://neptune.euhpc.arm.com/warehouse/Distributions/FA/ARMCompiler/6.18/123/standalone-linux-x86_64-rel`

No standalone Mac build is available yet, but it is possible to hack the Mbed Studio build.
Download the Mbed Studio build from e.g. `smb://neptune.euhpc.arm.com/warehouse/Distributions/FA/ARMCompiler/6.18/116/mbed-darwin-x86_64-rel`.

Follow these docs to set up user based licensing:
[User-based licensing for tools and models](https://armh.sharepoint.com/sites/DSGToolsandModels/SitePages/User-based-licensing-for-tools-and-models.aspx).

In short, run this command from the extracted directory on the Arm network:

```sh
./bin/armlm activate --server https://lls.xpe.aws.arm.com --product HWSKT-EAC0
```

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

Notes:

- On Windows, Attack Surface Reduction (ASR) rules can block the use of cmsis.exe. To exclude it
  from the ASR rules, use the following command on PowerShell:

   ```txt
   Add-MpPreference -AttackSurfaceReductionOnlyExclusions "<path to cmsis.exe>"
   ```

### Using Core Tools dev branch as extension's client

1. In the Core Tools repo, go to the `clients/js` directory. Install NPM dependencies, build and
   package the module.

    ```sh
    npm install
    npm run build
    npm pack
    ```

   **NB:** Protobuf compiler installation is required to build. To install `brew install protobuf@version`.

2. Traverse to the `cmsis-cli` directory and build the Go client.

    ```sh
    go build -o cmsis
    ```

3. Move the built Go binary to the `tools/cmsis-core-tools` directory in `vscode-cmsis-csolution`
   and overwrite the existing cmsis binary. Note, if this directory doesn't exist - create it.

4. Install the local core tools client npm package that was created in step 1.

    ```sh
    npm install <path/to/tar.gz>
    ```

5. Build the extension.

    ```sh
    npm run build
    ```

### Other configurations

- `npm run browser` starts a VS Code web development environment similar to Codespaces.
- `npm run serve` starts a file server allowing the extension to be side-loaded into vscode.dev.
   Run the "Developer: Install Web Extension" command in vscode.dev, then enter the URL for the
   running server.

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

## Debugging in KSC

1. Mount the extension development directory into the KSC container by adding this volume to the
  KSC docker-compose override file. `$EXTENSION` is the path to the root of the extension repository.

    ```yaml
    volumes:
    - $EXTENSION:/home/studio/mbs-plugins/vscode-cmsis-csolution:ro
    ```

1. Restart the KSC docker container, e.g. `docker compose restart mbs-ide`.
1. Start the "KSC Plugin Host (Docker)" launch configuration.
1. Load the KSC frontend in a browser.

## Security

Security considerations for OTG's VS Code extensions are tracked in the
[threat model](https://confluence.arm.com/display/IoTWeb/OTG+VS+Code+Extensions+Threat+Model).

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
