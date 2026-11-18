# Debug Adapter UI Preview

Open `debug-adapters.yml` and run **CMSIS: Preview Debug Adapter UI**, or use
the preview button in the editor title. The preview opens beside the source
and follows unsaved changes. Each source document has its own preview session.

Select an adapter and search the **Device** dropdown by device ID or name.
The list and selected device details come from the csolution service. A solution
and connected hardware are unnecessary. Device availability follows the service's
pack catalog; the preview does not install packs.

For multicore devices, **Used processors** selects the effective processor subset.
The full device remains available as `device`, while `processors` contains the
selected records. At least one named processor must remain selected. Clearing
the device uses the production model's default context, including its fallback
trace capabilities.

The controls use the same settings model, presenter, and renderer as Manage
Solution. Edits, section switches, and add/remove actions update temporary debugger
configuration. **Generated debugger YAML** shows stored values; **Preview context**
shows the effective expression inputs and any production normalization defaults.
File path values can be edited. **Select File** and **Open File** use the production
visibility rules so their layout can be previewed; clicking them does not select
or open files. **Open File** appears only when the file path is nonempty.

Temporary configurations are separate for each adapter, device, and processor
subset. **Reset preview** restores defaults for the current combination. Valid
source edits preserve temporary values. Closing the preview discards its session.
No preview operation writes the registry, solution, launch configuration, or tasks.

The registry's `template` property may be omitted while authoring its UI. Other
declarations follow the normal registry format. YAML and binding errors appear in
the preview, retaining the last successful rendering with controls disabled until
the source is valid again. Expression expansion uses the unchanged production
evaluator; errors it logs are available in the **Extension Host** output channel.

UI expressions execute JavaScript through the production evaluator. The preview
evaluates declarations only in a trusted workspace and refreshes when trust is
granted.
