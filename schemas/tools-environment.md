# CMSIS tools environment

The CMSIS Solution extension generates `.cmsis/tools-environment.yml` next to
each converted csolution file. It provides a versioned, normalized description
of the environment and external tools available to build tools and AI agents.

The extension is the sole owner and writer of this file. It captures the
resolved environment when conversion is requested and rewrites the file only
when its generated content changes. Manual edits and changes made by other
tools are unsupported and may be overwritten.

Configured environment variable values are written to this workspace file as
plain text. Credentials and other secrets should not be exposed through
`cmsis-csolution.environmentVariables` or vcpkg environment variables because
they can leak through `.cmsis/tools-environment.yml`.

## Format

The document has one `cmsis-tools-environment` root node. Paths use forward
slashes on every platform.

```yaml
cmsis-tools-environment:
  version: 1.0.0
  generated-by: arm.cmsis-csolution version 1.70.1
  solution: ../example.csolution.yml
  environment:
    path:
      - C:/Users/example/.vscode/extensions/arm.cmsis-csolution-1.70.1/tools/cmsis-toolbox/bin
      - C:/Users/example/.vcpkg/artifacts/registry/compilers.arm.arm.none.eabi.gcc/14.3.1/bin
    variables:
      CMSIS_PACK_ROOT: C:/Users/example/.cache/arm/packs
      GCC_TOOLCHAIN_14_3_1: C:/Users/example/.vcpkg/artifacts/registry/compilers.arm.arm.none.eabi.gcc/14.3.1/bin
  tools:
    - name: CMSIS-Toolbox
      version: 2.14.1
      origin: built-in
      provider:
        type: vscode-extension
        id: arm.cmsis-csolution
      directory: C:/Users/example/.vscode/extensions/arm.cmsis-csolution-1.70.1/tools/cmsis-toolbox/bin
      manual: https://open-cmsis-pack.github.io/cmsis-toolbox/
    - name: compilers.arm.arm.none.eabi.gcc
      version: 14.3.1
      origin: installed
      provider:
        type: vcpkg
        id: arm.environment-manager
      directory: C:/Users/example/.vcpkg/artifacts/registry/compilers.arm.arm.none.eabi.gcc/14.3.1
```

The `environment` node contains the resolved subset of `PATH` and variables
contributed or used by Arm extensions and vcpkg. It intentionally omits
unrelated host process entries.

The `tools` array provides discovery metadata in one consistent shape. Its
`origin` field distinguishes tools shipped by extensions from tools installed
by vcpkg through Arm Environment Manager. When built-in and installed entries
provide the same command, only the entry whose directory occurs first in
`PATH` is exported. A normalized array is simpler to iterate and extend than
separate `built-in` and `installed-tools` structures with different layouts.

Installed package entries use separate canonical package `name` and resolved
`version` fields encoded in the Environment Manager artifact path. Entries
outside a recognized artifact use the configured tool name and the directory
containing its executable. Environment variables, including `CMSIS_PACK_ROOT`,
`CMSIS_COMPILER_ROOT`, and compiler-specific variables, remain in the
`environment.variables` node because the API does not reliably attribute each
resolved variable to an individual tool.

The semantic `version` field allows the document to evolve without requiring consumers to infer its shape.

## Listed Information

### Document Metadata

- `version` is the semantic version of this document format. It is defined by the CMSIS Solution extension and validated by the extension-owned JSON schema.
- `generated-by` identifies the CMSIS Solution extension and its installed manifest version. This preserves build-specific versions from packaged releases, such as `arm.cmsis-csolution version 1.70.1-41-20260902` for a nightly VSIX.
- `solution` is the forward-slash path to the converted `*.csolution.yml` file, relative to `.cmsis/tools-environment.yml`.

### Resolved Environment

- `environment.path` contains only directories contributed by built-in Arm tools, `cmsis-csolution.environmentVariables`, or `VcpkgResults.paths.PATH`. Their order follows the resolved process `PATH`; contributed entries missing from that path are appended as a fallback. When multiple CMSIS-Toolbox directories remain, only the first one is exported.
- `environment.variables` contains `CMSIS_PACK_ROOT`, `CMSIS_COMPILER_ROOT`, variables configured through `cmsis-csolution.environmentVariables`, and variables explicitly contributed by `VcpkgResults.variables`, such as `AC6_TOOLCHAIN_6_24_0`. Unrelated host process variables are omitted.

### Built-in Tools

Built-in tool metadata is derived by the tools-environment exporter. The CMSIS Solution extension declares its bundled CMSIS-Toolbox, while the CMSIS Debugger extension location supplies pyOCD and Arm GNU GDB. Each entry contains:

- `name`: the human-readable tool or tool-suite name declared by the providing extension.
- `version`: the bundled tool version read from its manifest or version file.
- `origin`: `built-in`.
- `provider`: the ID of the VS Code extension that ships the tool.
- `directory`: the directory contributed to `PATH` by that extension.
- `manual`: the extension-maintained documentation URL.

### Installed Tools

Installed tool metadata comes from `EnvironmentManagerApiV1.getActiveTools()`, the latest `VcpkgResults` activation result, and the standard Environment Manager artifact path layout. Each entry contains:

- `name`: for recognized artifacts, the canonical vcpkg package name, for example `compilers.arm.arm.none.eabi.gcc`. Activation aliases such as `GCC_TOOLCHAIN_14_3_1` are not used as tool names.
- `version`: for recognized artifacts, the resolved package version, for example `14.3.1`.
- `origin`: `installed`.
- `provider`: Arm Environment Manager using its `vcpkg` provider.
- `directory`: the package version root derived from `.vcpkg/artifacts/<hash>/<package>/<version>` for recognized artifacts, or the executable's containing directory for fallback entries.

An installed package remains in `tools` when it also contributes environment variables. For example, a compiler is listed under its canonical package name and resolved version while its contributed toolchain variable is independently listed under `environment.variables`.

### Tool Selection

Built-in and installed candidates are grouped by command identity. Known CMSIS-Toolbox package names are grouped as one suite even when Environment Manager reports a suite command other than `csolution`. For each group, the candidate whose directory occurs first in the resolved `environment.path` wins; only that candidate is listed. Package discovery also preserves its first PATH occurrence. The resulting list is ordered by `environment.path` precedence, mirroring command lookup by the exported environment and preventing bundled and vcpkg-installed copies of the same tool from both appearing.

## Schema

The machine-readable definition is in
[tools-environment.schema.json](tools-environment.schema.json). Consumers should
use the schema and the document `version` when validating the YAML structure;
they should not infer the format from a particular generated example.

The schema uses JSON Schema Draft 7.
