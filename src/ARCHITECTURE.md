# CMSIS Solution Extension Architecture Documentation

> **Hint:** This documentation uses [Mermaid](https://mermaid.js.org/intro/syntax-reference.html) diagrams. For Visual Studio Code consider installing [Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid).
> Manually crafted diagrams are created with [Draw.io](https://www.drawio.com/). For Visual Studio Code consider installing [Draw.io Integration](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio).

The overall architecture of a Visual Studio Code Extension is given in the following diagram:

![Architecture Overview](ARCHITECTURE.md.d/architecture.png)

A Visual Studio Code extension is split into two main parts: the extension host backend and the Chromium frontend. The extension host backend runs in a separate Node.js process and handles tasks such as file system access, language server communication, and other long-running operations. The Chromium frontend, which is part of the main VS Code window, is responsible for rendering the user interface and handling user interactions. This separation ensures that the UI remains responsive while the backend performs resource-intensive tasks.

Communication between the backend and frontend occurs via a JSON-RPC channel, which allows the frontend to send requests and receive responses. This channel only support structured data but no rich class objects to be transferred.

For testability reasons business logic shall be kept in the backend code as much as possible. Its easier to debug and unit test backend code than involving frontend code.

## Views

The extension contributes a couple of independent views to the Code UI.

### Solution Outline

The Solution Outline docks into the left panel presenting a tree view for the selected solution.

[TO BE DOCUMENTED](views/solution-outline)

### Create Solution

The Create Solution dialog shall present boards, devices, and draft projects to the user. The draft project shall be used to initialize a new solution workspace.

[TO BE DOCUMENTED](views/create-solutions)

### Configure Solution

[TO BE DOCUMENTED](views/manage-layers)

### Context Selection

[TO BE DOCUMENTED](views/manage-solution)

### Manage Components

[TO BE DOCUMENTED](views/manage-components-packs)

### Configuration Wizard

[TO BE DOCUMENTED](views/config-wizard)

## Business Logic

### Data Manager

The Data Manager abstracts access.

[Design Documentation](data-manager/DESIGN.md)

### Document Download

[`DocDownload`](doc-manager/doc-download.ts) constructs absolute destination paths
and downloads common Arm PDF documents for
[`IDocRef`](doc-manager/docs-yaml-file.ts) references. Its default root is
`~/.cmsis/docs`; callers can supply another root, for example a temporary directory.

- Common documents use `<root>/<id>-<version>[.<format>]`, preserving the requested
  version token. For example, `100230/latest` in PDF format uses `100230-latest.pdf`.
- Board and device documents require `isWebDoc()` and an HTTP(S) URL. They use
  `<root>/<Vendor>/<Name>/<FileName.ext>`, excluding hardware revision or processor
  suffixes and URL query parameters and fragments.
- Missing or unsafe path components are rejected rather than rewritten.

For common PDF documents, `downloadDoc(doc)` retrieves metadata from
`https://documentation-service.arm.com/documentation/<id>/<version>` and selects a
PDF resource, preferring a filename matching the document ID. The resolved resource
URL is transient: the reference retains its canonical name and requested version.
Documents without a downloadable PDF are rejected.

Requests follow at most five HTTP(S) redirects and share a two-minute timeout.
Downloads stream to a unique temporary sibling, validate the `%PDF-` header, then
rename to the final destination. Only successful completion sets the reference's
absolute `path` and clears its `error`. Failed downloads reject, set `error`, remove
temporary files, and leave any previous destination and reference path unchanged.

Board and device destination construction is available, but downloading those
files still rejects with a not-implemented error. No UI action or inventory
persistence is connected.

The focused test performs a real network download of `100230/latest` into a real
temporary directory managed by `TestDataHandler`, without mocks. Run it with
`npx jest --runInBand --runTestsByPath src/doc-manager/doc-download.test.ts --collectCoverage=false`.
It requires network access to Arm's documentation service.

### Solar Search Client

[TO BE DOCUMENTED](solar-search)
