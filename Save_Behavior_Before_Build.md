# Save Behavior Before Build

Before building, the extension follows the VS Code setting:

```json
{
  "task.saveBeforeRun": "always"
}
```

## Supported Values

### `always`

Saves dirty file-backed editors before build.

If the **Software Components** view has pending changes, those changes are also saved before build.

```json
{
  "task.saveBeforeRun": "always"
}
```

### `never`

Does not save files before build.

If the **Software Components** view has pending changes, those changes are not saved before build.

```json
{
  "task.saveBeforeRun": "never"
}
```

### `prompt`

Prompts before build.

```json
{
  "task.saveBeforeRun": "prompt"
}
```

Prompt actions:

- `Save`: saves dirty file-backed editors and pending Software Components changes.
- `Don't Save`: continues the build without saving editor files or Software Components changes.
- `Cancel`: cancels the build.

## Save Failure

The build is cancelled if:

- saving editor files fails;
- saving Software Components changes fails;
- the user selects `Cancel` when prompted.
