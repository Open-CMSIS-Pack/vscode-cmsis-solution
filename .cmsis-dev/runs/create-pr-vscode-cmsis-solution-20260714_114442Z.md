> Model: **cmsis-dev-openai-proxy/gpt-5.5**
> Metrics: 5.7s | 1,003 input tokens | 192 output tokens | 1,195 total tokens

# Document save-before-build behavior

## Fixes
- 332

## Changes
- Added documentation for how `task.saveBeforeRun` controls save behavior before builds.
- Documented behavior for `always`, `never`, and `prompt`.
- Clarified prompt actions and build cancellation conditions when saving fails or is cancelled.

## Screenshots
N/A

## Checklist
- [x] 🤖 This change is covered by unit tests (if applicable). N/A, documentation-only.
- [x] 🤹 Manual testing has been performed (if necessary). N/A, documentation-only.
- [x] 🛡️ Security impacts have been considered (if relevant). N/A, documentation-only.
- [x] 📖 Documentation updates are complete (if required).
- [x] 🧠 Third-party dependencies and TPIP updated (if required). N/A, no dependency changes.