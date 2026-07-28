## Plan: Create Solution MVC Refactor

Refactor Create Solution into a backend `CreateSolutionController`, a framework-neutral frontend `CreateSolutionViewModel`, passive React views, and an authoritative YAML-backed model. Remove every `packs_pb.d.ts` type from `src/views/create-solutions/**` and from the request path into `SolutionCreator`, while retaining generated types inside Core Tools adapters. Replace legacy protobuf reconciliation in blank-solution creation with `CSolutionYamlFile`, `CProjectYamlFile`, typed wrappers, and targeted `CTreeItem` operations.

**Problem analysis**
- `create-solution.tsx` coordinates initialization, existence checks, dependent data requests, validation, readiness, field enablement, submission, and failure recovery. Child TSX files also derive hardware/template/project behavior. These are controller/ViewModel responsibilities rather than rendering concerns.
- `reducer.ts` mixes immutable state updates with domain transitions and template/project generation. Its `REMOVE_PROJECT` path mutates the prior state via `splice`.
- `messages.ts` is not a clean transport boundary: it imports reducer-owned types, exposes protobuf `AsObject` types, and includes `DraftProjectData`, which is a backend object rather than a serializable DTO.
- `CreateSolutionData` combines model access, caching, DTO mapping, presentation, and direct webview messaging. `CreateSolutionWebviewMain` combines routing with orchestration and does not await several forwarded async operations.
- ACK messages have no correlation ID. Concurrent checks of one request type can resolve incorrectly, and stale existence/preview responses can overwrite newer state.
- Creation failure can emit both `REQUEST_FAILED` and `REQUEST_SUCCESSFUL`; some asynchronous data failures bypass the outer error handler.
- Existence checking ignores `solutionName` at the backend path composition and treats errors other than “already exists” as success.
- Senderless `BOARD_EXAMPLE_DATA_LOCAL`, `REF_APP_DATA`, and `TEMPLATE_DATA` branches remain in the reducer/tests even though the current backend does not emit them and `SolutionCreator` rejects the associated modes.
- The live hardware path is already protobuf-free until `CreateSolutionData` reconstructs generated shapes. `Tz` is also unsafe as a truthy numeric enum (`TZ_NO` is nonzero); the view only needs an explicit TrustZone capability.
- `SolutionCreator` depends inward on a webview `NewSolutionMessage` and converts legacy parsed objects into generated protobuf data only to reconcile them back into copied YAML. This loses pack metadata and can silently remove unknown compilers.
- Existing YAML abstractions already cover most required behavior. Missing narrow helpers are target `device`/`board` setters, optionally solution compiler access, and creation-oriented operations for packs/components; generic `CTreeItem` is appropriate where no durable wrapper abstraction exists.

**Steps**

### Phase 1: Characterize behavior and establish owned contracts

1. Add regression tests before structural changes for reducer immutability, stale/concurrent existence responses, error propagation, creation failure producing no success ACK, and all forwarded model calls being awaited. Record current supported creation modes and remove assertions that only preserve senderless protobuf branches. This phase blocks later migration.
2. Define protobuf-free, structured-clone-safe DTOs in a dedicated create-solution contract module: board/device/pack references, hardware list/detail DTOs, processor data with `supportsTrustZone`, debug adapter summaries, draft-project summary/detail, project form data, and creation request payload. Use stable `key`/`id` values for backend lookup and keep mutable YAML/model objects out of the contract.
3. Split the wire contract from the domain command. `messages.ts` must depend only on DTOs and add request IDs to request/result pairs. Define `CreateSolutionRequest` beside `SolutionCreator` for extension-host/domain use, with no webview discriminator and no protobuf or reducer imports. The wire submit message carries a selected draft ID; the controller resolves it to `DraftProjectData` internally.
4. Remove stale legacy modes and contracts: `BOARD_EXAMPLE_DATA_LOCAL`, `REF_APP_DATA`, `TEMPLATE_DATA`, their reducer state/union members, dropdown branches, and tests. Keep the DataManager draft-project route as the sole example/reference/template source. Preserve blank local template creation and DataManager draft creation.

### Phase 2: Separate backend Model, Controller, and host routing

5. Refactor `CreateSolutionData` into an injectable model that owns DataManager queries and cache/reset behavior but returns values instead of sending messages. Add methods such as `getTargets`, `getBoardInfo(key)`, `getDeviceInfo(key)`, `getDraftProjects`, `getDraftProjectInfo(id)`, and `getDraftProject(id)`. Map `BoardData`, `DeviceData`, and `DraftProjectData` to owned DTOs here; remove unused `unresolvedDevices`, `getImageUrl`, and `buildMemoryInfo` paths after usage verification.
6. Add `CreateSolutionController`, modeled after the ownership boundary of `ManageSolutionController`. It owns the model, `SolutionCreator`, file-existence policy, workspace/default location, folder picker, settings/platform/connected-device queries, commands/help, authoritative validation, draft-ID resolution, domain request construction, and request/result error policy. Every async operation is awaited and every request emits exactly one correlated result.
7. Reduce `CreateSolutionWebviewMain` to webview lifecycle, message forwarding, disposal/reset, and sending controller events/results. Inject the controller or create it through a testable factory. Update the desktop composition root and factories so controller dependencies are constructed once and test seams remain narrow.
8. Update `v2-api.ts` and any non-webview callers to construct the domain `CreateSolutionRequest` directly. They must no longer import or manufacture a create-solution webview message.

### Phase 3: Introduce the frontend ViewModel and passive React view

9. Add a framework-neutral `CreateSolutionViewModel` that owns ephemeral form/interaction state and subscribes to the message handler. Expose commands for initialization, field updates, board/device selection and preview, draft selection, project updates, existence checks, submission, and close. Expose derived state for validation errors, `canCreate`, visible/enabled fields, template availability, project processor/TrustZone options, hardware summaries, and progress.
10. Move request sequencing and stale-response protection from React effects/actions into the ViewModel. Consolidate initial target/platform/settings/default-location requests, correlate existence and preview requests by request ID plus queried path/key, and discard stale responses. Submission marks fields touched, performs immediate local validation, asks the controller for authoritative validation/creation, and closes only after one success result.
11. Move pure domain transitions out of the reducer/TSX layer: hardware selection consequences, single-device auto-selection, template alignment, project generation, solution-name/target-type normalization, TrustZone compatibility, draft-project application, and compiler/pack/target request mapping. Keep the reducer, if retained, as a small immutable state applicator owned by the ViewModel.
12. Thin `create-solution.tsx` and child components to render ViewModel snapshots and invoke commands. TSX may retain Ant Design setup, labels/tooltips, theme/context-menu hooks, local dropdown-open presentation state, and event-value extraction. Remove validation, tree construction/encoded ID decoding, hardware request effects, processor/TrustZone derivation, and submission orchestration from `*.tsx`.
13. Replace `creationActions` and `messageServiceAwaitResult` with the ViewModel/controller correlated protocol, then delete obsolete helpers and tests after equivalent ViewModel/controller coverage passes.

### Phase 4: Make YAML wrappers the authoritative creation model

14. Extend the YAML model narrowly: add `device` and `board` setters to `TargetTypeWrap`; add a solution-level compiler accessor/helper if it improves encapsulation; add focused `CSolutionYamlFile`/`CProjectYamlFile` creation helpers only where repeated invariants justify them. Use generic `CTreeItem` sequence operations for packs, components, and context restrictions rather than creating broad wrapper hierarchies.
15. Replace `SolutionCreatorImp.createSolutionFromTemplate` legacy parsing/protobuf/reconciliation with direct YAML construction. Build each `CProjectYamlFile` from the appropriate secure/non-secure/off template, set processor, add `ARM::CMSIS:CORE` and `Device:Startup`, preserve template TrustZone behavior, and save all projects before the solution exists. Then build `CSolutionYamlFile` from the solution template, append secure-first project references in stable order, write target types, packs, compiler, and metadata, and save the solution last so file watchers only see a complete solution.
16. Preserve request metadata intentionally during direct mutation: write pack version and `for-context`/`not-for-context` values, omit empty fields, preserve sequence order, and reject/report unsupported compiler values instead of silently dropping them. Preserve template build types, comments, `misc`, and `created-for`; do not synthesize target sets during initial creation.
17. Refactor `CreateSolutionFromDataManager` to consume the domain request and resolved draft object. Reuse `CSolutionYamlFile`, wrappers, and `CTreeItem` for post-copy packs/target mutation, moving durable pack/target helpers into the YAML model where appropriate. Keep uVision conversion and `SolutionInitialiser` behavior unchanged.
18. Remove `createSolutionData`, legacy `newSolution`/`newProject`, generated reconciliation, `yaml.Document`, and `reconcileSolutionFiles` injection from the blank-template creator path after focused output tests pass. Do not remove reconciliation modules or generated Core Tools contracts used elsewhere.

### Phase 5: Cleanup and integration validation

19. Replace protobuf-based create-solution factories with plain DTO factories. Update Controller, model, ViewModel, reducer, component, SolutionCreator, DataManager-creation, and API tests to use the new contracts. Ensure all touched copyright ranges end in 2026 and new files use the repository’s full 2026 Apache header.
20. Run scoped searches to prove the boundary: `src/views/create-solutions/**` must have no `core-tools/client/packs_pb`, `.AsObject`, generated `Tz`, `DraftProjectData` wire payload, or legacy message variants. Search domain creator/API files to ensure they no longer import `messages.ts`.
21. Run focused tests after each phase, then compile, lint, production-build, copyright-check, full unit tests, and the existing blank-solution Playwright workflow. Manually inspect generated YAML ordering/metadata and exercise rapid destination changes to verify stale responses cannot change current state.

**Relevant files**
- `d:/ed/GitHub/vscode-cmsis-solution/src/views/create-solutions/create-solution-dto.ts` — new plain webview DTOs and transport-safe IDs.
- `d:/ed/GitHub/vscode-cmsis-solution/src/views/create-solutions/messages.ts` — protobuf-free correlated wire protocol.
- `d:/ed/GitHub/vscode-cmsis-solution/src/views/create-solutions/create-solution-data.ts` — refactor into a return-value model and DTO mapper.
- `d:/ed/GitHub/vscode-cmsis-solution/src/views/create-solutions/create-solution-controller.ts` — new backend controller and authoritative orchestration.
- `d:/ed/GitHub/vscode-cmsis-solution/src/views/create-solutions/create-solution-webview-main.ts` — thin host adapter.
- `d:/ed/GitHub/vscode-cmsis-solution/src/views/create-solutions/cmsis-solution-types.ts` — retain only owned shared/domain-neutral types or fold them into clearer DTO/ViewModel modules.
- `d:/ed/GitHub/vscode-cmsis-solution/src/views/create-solutions/view/create-solution-view-model.ts` — new frontend state, commands, selectors, and async correlation.
- `d:/ed/GitHub/vscode-cmsis-solution/src/views/create-solutions/view/state/reducer.ts` — reduce to immutable updates and remove generated/legacy unions.
- `d:/ed/GitHub/vscode-cmsis-solution/src/views/create-solutions/view/state/validation.ts` — pure immediate UX validation consumed by the ViewModel.
- `d:/ed/GitHub/vscode-cmsis-solution/src/views/create-solutions/view/state/templates.ts` — move non-view template/project rules into the ViewModel/domain helpers or remove obsolete legacy logic.
- `d:/ed/GitHub/vscode-cmsis-solution/src/views/create-solutions/view/actions.ts` — replace with ViewModel commands, then delete.
- `d:/ed/GitHub/vscode-cmsis-solution/src/views/create-solutions/view/components/create-solution.tsx` — passive top-level view.
- `d:/ed/GitHub/vscode-cmsis-solution/src/views/create-solutions/view/components/hardware-row.tsx` — render supplied options/errors and emit selections only.
- `d:/ed/GitHub/vscode-cmsis-solution/src/views/create-solutions/view/components/hardware-panel.tsx` — render supplied hardware details and commands only.
- `d:/ed/GitHub/vscode-cmsis-solution/src/views/create-solutions/view/components/example-dropdown-tree.tsx` — render prebuilt DTO tree; remove protobuf decoding/classification.
- `d:/ed/GitHub/vscode-cmsis-solution/src/views/create-solutions/view/components/project-configuration.tsx` — render ViewModel-provided processor/TrustZone options.
- `d:/ed/GitHub/vscode-cmsis-solution/src/views/create-solutions/view/components/message-service.ts` — remove after correlated ViewModel protocol lands.
- `d:/ed/GitHub/vscode-cmsis-solution/src/solutions/solution-creator.ts` — own `CreateSolutionRequest` and mutate YAML model directly.
- `d:/ed/GitHub/vscode-cmsis-solution/src/solutions/create-solution-from-data-manager.ts` — consume domain request/resolved draft and reuse YAML model helpers.
- `d:/ed/GitHub/vscode-cmsis-solution/src/solutions/files/csolution-wrap.ts` — target device/board setters and narrow creation helpers.
- `d:/ed/GitHub/vscode-cmsis-solution/src/solutions/files/csolution-yaml-file.ts` — authoritative solution YAML creation/mutation operations.
- `d:/ed/GitHub/vscode-cmsis-solution/src/solutions/files/cproject-yaml-file.ts` — project processor and focused project creation mutation.
- `d:/ed/GitHub/vscode-cmsis-solution/src/api/v2-api.ts` — call the domain creator contract directly.
- `d:/ed/GitHub/vscode-cmsis-solution/src/desktop/extension.ts` — compose model, controller, host, and creator dependencies.
- `d:/ed/GitHub/vscode-cmsis-solution/src/views/create-solutions/**/*.test.ts*`, `src/solutions/files/*.test.ts`, `src/solutions/solution-creator.test.ts`, and `src/api/v2-api.test.ts` — characterization and migrated coverage.

**Verification**
1. Controller/model boundary: `npx jest --runInBand --runTestsByPath src/views/create-solutions/create-solution-controller.test.ts src/views/create-solutions/create-solution-data.test.ts src/views/create-solutions/create-solution-webview-main.test.ts`.
2. Frontend boundary: run the Create Solution ViewModel, reducer, validation, templates, hardware, dropdown, project configuration, and top-level component test files with `npx jest --runInBand --runTestsByPath`.
3. YAML model and creator: run `src/solutions/files/csolution-wrap.test.ts`, `src/solutions/files/csolution-yaml-file.test.ts`, `src/solutions/files/cproject-yaml-file.test.ts`, new `src/solutions/solution-creator.test.ts`, DataManager creation tests, and `src/api/v2-api.test.ts`.
4. Static boundary checks: search `src/views/create-solutions` for `core-tools/client/packs_pb|\.AsObject|\bTz\b|DraftProjectData|BOARD_EXAMPLE_DATA_LOCAL|REF_APP_DATA|TEMPLATE_DATA`; expect no matches. Search creator/API files for imports from `views/create-solutions/messages`; expect no matches.
5. Generated-file assertions: parse created `.csolution.yml`/`.cproject.yml` and verify project/target/pack/component ordering, metadata preservation, compiler validation, TrustZone behavior, comments/build types, no initial target sets, and project-before-solution save ordering.
6. Repository checks: `npm run compile`, `npm run lint`, `npm run build`, `npm run copyright:check`, then `npm test`.
7. Workflow checks: run the blank-device solution Playwright workflow in `src/e2e-tests/use-cases/uc-001-create-solution-from-template`, then manually test rapid folder/name changes, board/device previews, DataManager drafts, creation failure, and successful close.

**Decisions**
- Scope is Create Solution and its domain request path, not repository-wide generated Core Tools replacement.
- Core Tools adapters may continue using `packs_pb`; no generated type may cross into `src/views/create-solutions/**`.
- Architecture is backend Controller plus frontend ViewModel. The backend owns authoritative domain work; the ViewModel owns ephemeral interaction state without round-tripping every keystroke.
- Senderless legacy example/ref-app/template branches are removed; DataManager drafts are the supported nonblank route.
- The view uses owned object DTOs only. YAML wrappers and `CTreeItem` stay in the extension backend and never cross webview messages.
- Direct YAML mutation preserves pack versions/context metadata and reports unsupported compilers instead of reproducing current silent data loss.
- The initial refactor does not redesign unrelated Manage Solution code, remove protobuf globally, remove reconciliation used elsewhere, or alter uVision conversion/SolutionInitialiser workflows.
