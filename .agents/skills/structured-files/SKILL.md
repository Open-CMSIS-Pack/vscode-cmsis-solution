---
name: structured-files
description: Read, create, or update JSON, YAML, or XML through the repository's TextFile-based value or tree file models.
---

# Structured Files

1. Find the existing typed file owner first. Reuse or extend it when its
   responsibility matches, such as `CmsisSettingsJsonFile`, `CSolutionYamlFile`,
   or `IndexPidxFile`.
2. Choose the representation required by the work:
   - To read JSON or YAML into plain objects, or write plain-object files when
     comments need not be preserved, use
     [`JsonFile`](../../../packages/cmsis-common/src/files/json-file.ts) or
     [`YamlFile`](../../../packages/cmsis-common/src/files/yaml-file.ts).
     Both extend [`TextFile`](../../../packages/cmsis-common/src/files/text-file.ts)
     and provide configurable file I/O and error reporting.
   - When reading into a [`CTreeItem`](../../../packages/cmsis-common/src/tree/tree-item.ts)
     tree, adding or removing items, retaining supported comments or unknown
     nodes, or applying format-independent structural operations, use
     `CTreeItemJsonFile`, `CTreeItemYamlFile`, or `CTreeItemXmlFile` from
     [`cmsis-common/tree-item-file`](../../../packages/cmsis-common/src/files/tree-item-file.ts).
     The tree IR is abstract across formats; keeping unknown nodes supports
     backward and forward compatibility. `CTreeItemYamlFile` also provides the
     repository's tree-file YAML formatting.
3. Do not bypass the chosen file model with direct JSON, YAML, or XML library
   calls or standalone serialization functions, including for generated
   content. Build or update the file model and use its methods for input and
   output.
4. Check `ETextFileResult` and reported errors after loading or saving. Verify
   required formatting, comments, and round-trip behavior before writing files.
5. Always use `TextFile`'s `load` and `save` for structured-file I/O in both
   application code and tests. Configure its filesystem through
   [`ITextFileSystem`](../../../packages/cmsis-common/src/files/text-file-system.ts)
   and `TextFile.setFileSystem` instead of bypassing the file model with a
   separate I/O path. In tests, install the test filesystem and reset it after
   the test. If a required backend cannot use the current interface, extend
   the framework rather than bypassing it.

Use the published [package exports](../../../packages/cmsis-common/package.json)
when importing these APIs. Apply this guidance to files in scope; do not
rewrite unrelated working integrations.
