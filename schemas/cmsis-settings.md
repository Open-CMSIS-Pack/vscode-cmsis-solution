# CMSIS workspace settings

The CMSIS Solution extension stores workspace-specific solution state in
`.vscode/cmsis.json`. The file is managed by the extension and can contain
settings for more than one csolution file in the workspace.

The extension creates or updates this file whenever it successfully loads or
saves a solution. Manual edits may be overwritten.

## Format

Paths use forward slashes on every platform.

```json
{
  "activeSolution": "../solutions/MySolution.csolution.yml",
  "activeTarget": "MyBoard@debug",
  "targetSet": {
    "solutions/MySolution": {
      "activeTargetType": "MyBoard",
      "MyBoard": 0
    }
  }
}
```

### Active Selection

- `activeSolution` is the path to the active `*.csolution.yml` file, including
  its extension, relative to the directory containing `cmsis.json`.
- `activeTarget` is the effective active target in `target-type` or
  `target-type@target-set` form. The target-set suffix is omitted when no named
  target set is active.

The extension reads `activeSolution` as the default solution when a workspace
has no valid persisted selection. A persisted user selection or explicit
deactivation in VS Code workspace storage takes precedence. In a multi-root
workspace, the extension reads `.vscode/cmsis.json` from the first workspace
folder. `activeTarget` mirrors the current state for people and external tools;
target selection is restored from `targetSet`.

### Persisted Target Selection

`targetSet` contains one property per solution. Each property name is the
solution path relative to the workspace folder, with forward slashes and
without the `.csolution.yml` extension.

Each solution entry contains:

- `activeTargetType`: the active target-type name.
- An optional property named after a target type whose integer value is the
  zero-based index of its selected named target set. It is omitted when that
  target type has no named target set.

Target-type property names follow the csolution schema's target-type naming
rules and cannot contain dots.

Solution paths containing dots cannot be persisted in `targetSet` because the
extension's settings API interprets dots as nested-property separators.

Persisted target-set indexes are not normalized when named target sets are
removed or reordered. An obsolete index can remain in `targetSet` and may
select a different target set if the target-set list later changes.

Selections for other solutions are retained when the active solution changes.

## Compatibility

Consumers may set `activeSolution` to provide the default solution and should
treat `activeTarget` as informational. Use `targetSet` when the extension's
persisted target selection format is required. All properties are optional so
the schema accepts settings written by older extension versions. Unknown
top-level properties are allowed for compatibility.

## Other settings

The optional top-level `force-update-rte` boolean requests an RTE update the
next time the solution is initialized. It is a one-shot request and is removed
after the extension reads it.

The machine-readable definition is in [cmsis-settings.schema.json](cmsis-settings.schema.json).
