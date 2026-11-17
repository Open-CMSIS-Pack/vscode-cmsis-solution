# Device-aware debug adapter UI definitions

Adapter `user-interface` sections support `${{ expression }}` expressions in
`section`, `id`, `description`, `warning`, `condition-message`, and YAML binding
names and values. A `condition` can be a boolean or a complete expression; only
boolean `true` makes the section available. An omitted condition means true.
Expressions use the existing host-side Eta JavaScript expression engine.

## Expression context

`config` contains the complete effective `debugger` subtree for the active target
set. Each evaluation reads the current in-memory model, including unsaved edits
and undo/redo. Registry option defaults, including user overrides, fill missing
values in storage units. Explicit values, including `false`, `0`, empty strings,
and null markers, take precedence. Defaults apply within existing sections and
sequence entries; optional sections and Add candidates are not instantiated.
Evaluation does not write defaults into the solution.

`device` contains the complete device object from the active device's
`GetDeviceInfo` response. Processor, memory, pack, and additional returned
properties remain accessible. Trace metadata is anticipated as:

```typescript
trace?: {
    serialwire?: boolean;
    tracebuffer?: {
        name?: string;
        start?: number;
        size?: number;
    }[];
};
```

When `trace` is absent, its template value defaults to
`{ serialwire: true, tracebuffer: [{}] }`. An existing trace object is authoritative:
absent `serialwire` means false, and absent `tracebuffer` means an empty list.

Both namespaces are read-only views. They and the registry expressions stay in
the extension host; the webview receives presentation snapshots and opaque actions.

## Conditions and implicit expansion

The following subsections belong under a Trace section bound to the `trace`
sequence. Their existing switch bindings and option definitions can be retained.

```yaml
- section: Serial Wire
  condition: '${{ device.trace.serialwire && config.protocol === "swd" }}'
  condition-message: Serial Wire trace requires device support and SWD.
  yml-node:
    name: swo-uart
    select:
      node: mode
      selected: [file, server]
      unselected: off
  usage: available
  select: true
  options: []

- section: 'Trace Buffer${{ device.trace.tracebuffer.name ? " (" + device.trace.tracebuffer.name + ")" : "" }}'
  yml-node:
    name: trace-buffer
    value: '${{ device.trace.tracebuffer.name }}'
    select:
      node: mode
      selected: [file, server]
      unselected: off
  usage: available
  select: true
  options: []
```

`yml-node.value` drives expansion. A scalar produces one section; a sequence
produces one per value; an empty sequence produces no Add choices. A whole
expression retains its result type, while embedded expressions produce text.
Selector values can be strings, finite numbers, booleans, or null.

A complete property-path expression automatically projects through arrays.
For example, `device.trace.tracebuffer.name` produces one selector per buffer,
retaining an unnamed buffer as null. The resulting section's label, optional ID,
binding, and condition use the same originating record. References to
`device.trace.tracebuffer.start` and `.size` therefore stay associated with that
buffer. The complete source array remains available, including `.length` and
indexed access. Nested property projections preserve source order.

Only the binding value multiplies sections; other fields do not create independent
combinations. Without an explicit `id`, a valued binding receives a stable identity
from its marker and scalar value. Existing bindings without `value` retain their
marker-only identity and storage behavior.

Named buffers are stored as `trace-buffer: MTB`; unnamed buffers use
`trace-buffer: null`. Each can be added, edited, switched, and removed independently.
Invalid expressions and conflicting concrete identities or selectors are reported
through host diagnostics, and affected Add choices are suppressed.

When a configured section fails its condition, its YAML is preserved and its
warning uses `condition-message`, or a generic unsupported-configuration message.
It can be edited, disabled, or removed, but cannot be enabled while unsupported.
Projected buffer definitions also retain configured names no longer reported by
the device, displaying them with the same unsupported warning.

## Registry delivery

The runtime registry under `templates/debug` is downloaded and Git-ignored. This
repository provides the evaluator and a tracked example fixture at
`test-data/debug-adapters/declarative.yml`. Publishing the corresponding definitions
in `debug-adapter-registry` and enhancing the RPC producer are separate changes.
