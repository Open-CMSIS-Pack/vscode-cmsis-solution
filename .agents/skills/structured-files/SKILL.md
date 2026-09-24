---
name: structured-files
description: Use when reading, parsing, creating, serializing, or updating JSON, YAML, or XML, including files with comments; choose existing typed file models and cmsis-common parsers or file readers.
---

# Structured Files

1. Find the existing typed owner for the format first. Reuse or extend it when
   appropriate, such as `CmsisSettingsJsonFile`, `CSolutionYamlFile`, or
   `IndexPidxFile`, instead of introducing another parser or file model.
2. For in-memory JSON or YAML values, use `SimpleJsonParser` or
   `SimpleYamlParser` from
   [`cmsis-common/text-parser`](../../../packages/cmsis-common/src/text/text-parser.ts).
   Check parser errors after parsing; JSON accepts comments and trailing commas,
   but stringifying a value does not preserve its source layout or comments.
3. For Node-backed value files without comments to retain, use `JsonFile` or
   `YamlFile` from
   [`cmsis-common/json-file`](../../../packages/cmsis-common/src/files/json-file.ts)
   or [`cmsis-common/yaml-file`](../../../packages/cmsis-common/src/files/yaml-file.ts).
   Their [`TextFile`](../../../packages/cmsis-common/src/files/text-file.ts)
   methods provide loading, saving, parsing, and error reporting. Check
   `ETextFileResult` and errors after file operations.
4. For JSON, YAML, or XML trees, use the matching `parseJsonToCTreeItem` /
   `toJsonString`, `parseYamlToCTreeItem` / `toYamlString`, or
   `parseXmlToCTreeItem` / `toXmlString` from the
   [tree parsers](../../../packages/cmsis-common/src/tree/), or use
   `CTreeItemJsonFile`, `CTreeItemYamlFile`, or `CTreeItemXmlFile` from
   [`cmsis-common/tree-item-file`](../../../packages/cmsis-common/src/files/tree-item-file.ts)
   for file I/O. When reading or writing files with comments, prefer these
   `CTreeItem*File` classes or an existing derived class: their tree parsers
   retain supported comments when serializing. XML has no simple value-file
   counterpart in this package.
5. The `parse*ToCTreeItem` helpers parse supplied text; their optional filename
   supplies metadata, not file I/O. `TextFile` defaults to Node-backed I/O;
   use the owning filesystem adapter for VS Code workspace files. Retain a
   specialized parser or editor when a common model cannot meet requirements
   such as preserving exact layout or offsets, or editing multi-document YAML.
   Verify required round-trip and formatting behavior before writing files.

Use the published [package exports](../../../packages/cmsis-common/package.json)
when importing these APIs. Apply this guidance to the files being changed;
do not rewrite unrelated working integrations.
