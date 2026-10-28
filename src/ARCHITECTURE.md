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

[`DocManager`](doc-manager/doc-manager.ts) orchestrates downloads for common Arm
PDFs and board/device web files from [`IDocRef`](doc-manager/docs-yaml-file.ts)
references. Each reference calculates its `downloadUrl` and destination through
`getDestinationPath(destinationRoot)` without I/O or inventory mutation. The
manager supplies the absolute destination root, defaulting to `~/.cmsis/docs`;
callers can supply another root, for example a temporary directory.

- Common documents use `<root>/<id>-<version>[.<format>]`, preserving the requested
  version token. For example, `100230/latest` in PDF format uses `100230-latest.pdf`.
- Board and device documents require `isWebDoc()` and an HTTP(S) URL. They use
  `<root>/<Vendor>/<Name>/<FileName.ext>`, excluding hardware revision or processor
  suffixes and URL query parameters and fragments.
- Missing or unsafe path components are rejected rather than rewritten.

For common PDF documents, the reference's `downloadUrl` constructs a metadata URL
under `https://documentation-service.arm.com/documentation/<id>/<version>`.
The manager calls [`DocDownload.downloadDoc`](doc-manager/doc-download.ts) with
`(doc.downloadUrl, destination, requirePdf, armDocId)`. The downloader resolves the metadata to
a PDF resource, preferring a filename matching the document ID. The resolved
resource URL is transient: the reference retains its canonical name and requested
version. Documents without a downloadable PDF are rejected.

The downloader owns a single two-minute timeout shared by metadata lookup and
file transfer. Requests follow at most five HTTP(S) redirects.
Downloads stream to a unique temporary sibling, reject empty responses, validate
the `%PDF-` header for common Arm PDFs, then rename to the final destination.
The downloader never receives or mutates a document reference. Successful
completion lets the manager set the reference's absolute `path` and clear its
`error`. The manager catches preparation and transfer errors, clears `path`, and
sets `error`. Failed transfers remove temporary files without deleting a previous
destination file.

Board and device web documents download directly from their HTTP(S) URLs, without
Arm metadata lookup or PDF-only restrictions. URLs are used without host-specific
rewriting, and the reference retains its original URL and title. Callers must supply
a direct file URL rather than a hosting service's HTML viewer URL. Local files and
HTML-only references are not supported.

The outline's Download Document command delegates to `DocManager.downloadDocument`,
which serializes the operation with other inventory updates, saves both successful
and failed download state, and notifies the outline after a successful save.
Before assigning state, it looks up the document again by its original name and
parent identity so a replaced inventory record receives the result. Success and
failure converge on one lookup, state assignment, and save. Removed
documents are not recreated; transfers return `false` when the record is gone.
Download failures are reported through the manager's error reporter and return
`false` rather than rejecting; inventory load or save failures return `false`.
Set Local Path updates matching references and clears their errors only when the
selected destination exists. Open Documentation checks the current inventory and
opens `path` only when the destination exists, otherwise falling back to `name`.
Web documents, including downloaded Markdown files, use this open command.

Manager tests cover request preparation, persisted success and failure state, and
records replaced or removed during a transfer. The downloader tests include an
offline invalid-URL regression, a mocked-fetch check of the shared timeout, and
real network downloads of `100230/latest` and the repository's GitHub `README.md`.
The live downloads use real temporary directories managed by `TestDataHandler`,
without mocks. File assertions use only filesystem
metadata to verify regular files larger than 100 bytes, without reading contents
or listing directories. Run them with
`npx jest --runInBand --runTestsByPath src/doc-manager/doc-download.test.ts --collectCoverage=false`.
They require network access to Arm's documentation service and GitHub's raw content
host.

### Solar Search Client

[TO BE DOCUMENTED](solar-search)
