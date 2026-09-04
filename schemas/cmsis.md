# CMSIS workspace settings

The CMSIS Solution extension stores workspace-specific solution state in
`.vscode/cmsis.json`. The file is managed by the extension and can contain
settings for more than one csolution file in the workspace.

The extension is the sole owner and writer of this file and does not watch it
for external changes. Manual edits, source control updates, and changes made by
other tools are unsupported and are not guaranteed to take effect until the VS
Code window is reloaded. Extension features that change these settings update
both the file and the corresponding runtime state directly.

## Format

Selections are stored below `solutionSelections`. Each key is the complete path to a
csolution file relative to `.vscode/cmsis.json`, including the `.csolution.yml`
extension. Forward slashes are used on every platform.

```json
{
  "activeSolution": "../solutions/example.csolution.yml",
  "solutionSelections": {
    "../solutions/example.csolution.yml": {
      "selectedTargetType": "Board",
      "selectedTargetSets": [
        {
          "targetType": {
            "name": "Board",
            "index": 1
          },
          "targetSet": {
            "name": "Release",
            "index": 2
          }
        }
      ]
    }
  }
}
```

`activeSolution` mirrors the extension's active csolution using the same
relative path format as the `solutionSelections` keys. A `null` value means that solution
activation was explicitly disabled. The extension restores this state from VS
Code workspace storage; this property is informational and is not used to
select the active solution.

`selectedTargetType` names the currently selected target type.
`selectedTargetSets` remembers one target-set selection for each target type.
An empty target-set name represents the unnamed default target set.

Each `targetType` and `targetSet` entry stores both forms of identity:

- `name` is the readable and authoritative value while it exists.
- `index` is the zero-based ordinal fallback used when the item was renamed
  outside VS Code. A value of `-1` means no ordinal was available when saved.

On load, the extension resolves a valid name first. If that name no longer
exists, it tries the index. A successful index fallback is treated as a rename:
the current name is selected and `cmsis.json` is updated. If neither value can
be resolved, the extension uses the applicable default selection.

The extension writes the active target type and target set even when they are
defaults. This makes the selected state explicit rather than relying on an
omitted setting.

## Compatibility

The reader accepts the previous `targetSet` representation during migration:

- Solution keys are workspace-relative paths with both `.csolution` and `.yml`
  removed.
- `activeTargetType` contains the selected target-type name.
- A property keyed by target-type name contains the selected target-set index.

For example:

```json
{
  "targetSet": {
    "HelloWorld": {
      "activeTargetType": "FRDM-K32L3A6",
      "FRDM-K32L3A6": 1
    }
  }
}
```

After the selection is saved, it moves to `solutionSelections`, uses
`selectedTargetType` and `selectedTargetSets`, and the solution key is relative
to `cmsis.json` and includes the complete filename. Migrated `targetSet` entries
for that solution are removed.

## Other settings

The optional top-level `force-update-rte` boolean requests an RTE update the
next time the solution is initialized. Other top-level properties are retained
for compatibility with extension settings not owned by target selection.

The machine-readable definition is in [cmsis.schema.json](cmsis.schema.json).
