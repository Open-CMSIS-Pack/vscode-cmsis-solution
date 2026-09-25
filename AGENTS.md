# Agent Guidance

1. Treat `.agents/` as the canonical source of repository guidance.
2. For every user request, follow the [local overlay instructions](.agents/instructions/local-overlays.md).
3. When the prompt asks for a plan, design, or scope for proposed repository changes without making those changes, follow the [plan skill](.agents/skills/plan/SKILL.md). Do not use the plan skill for questions or reports about the current repository state.
4. For implementation, fixes, refactoring, or validation, follow the [change skill](.agents/skills/change/SKILL.md).
5. For code or pull request reviews, follow the [review skill](.agents/skills/review/SKILL.md).
6. Read and apply [development principles](.agents/instructions/principles.md) only when following the plan or change skill. Do not use them for questions, reports, or other non-planning, non-change requests.
7. Local guidance has precedence over public guidance. If local and public guidance conflict, or local files conflict with each other, ask the user which rule to follow before proceeding.
