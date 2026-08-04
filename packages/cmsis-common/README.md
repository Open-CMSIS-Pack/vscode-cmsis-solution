# CMSIS Common

Shared TypeScript foundations and CMSIS file-model APIs for Open-CMSIS-Pack tools.

## Publish

For publishing, the following steps should be followed:
1. Set version number in `packages/cmsis-common/package.json`
2. Create a matching git tag using `git tag cmsis-common-<version_number>`
3. Push the tag using `git push origin cmsis-common-<version_number>`

That in turn would trigger the workflow titled "CMSIS Common Release" and publish the package. Bare in mind, if the version numbers in `packages/cmsis-common/package.json` and the tag don't match, that would cause a failure in the workflow

## Install

Configure npm to use GitHub Packages for the `@open-cmsis-pack` scope. The token requires the
`read:packages` scope:

```ini
@open-cmsis-pack:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then install the package:

```sh
npm install @open-cmsis-pack/cmsis-common
```

The package requires Node.js 22.22 or later in the Node.js 22 release line and publishes CommonJS
modules with TypeScript declarations.

## Use

The root export provides file models, text parsing, and tree-item APIs without modifying global
prototypes:

```ts
import { CTreeItem, parseYamlToCTreeItem } from '@open-cmsis-pack/cmsis-common';

const root = parseYamlToCTreeItem('solution:\n  name: Example');
const item = new CTreeItem('project');
```

Focused APIs are also available through the documented subpaths in `package.json`:

```ts
import { TextFile } from '@open-cmsis-pack/cmsis-common/text-file';
import { parseYamlToCTreeItem } from '@open-cmsis-pack/cmsis-common/tree-item-yaml-parser';
```

Array and map prototype extensions are opt-in side effects. Import only the extension required by
the application:

```ts
import '@open-cmsis-pack/cmsis-common/array';
import '@open-cmsis-pack/cmsis-common/map';
```

See [third-party-licenses.md](third-party-licenses.md) for runtime dependency notices.
