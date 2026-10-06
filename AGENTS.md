# Agent Guidance

1. Treat `.agents/` as the canonical source of repository guidance.
2. At the start of every user request, search `.agents-local/skills/*.skill.md` and `.agents-local/instructions/*.instructions.md`. Read and apply every matching file; if none exist, continue without local guidance.
3. Give local skills and instructions precedence over public guidance. If local guidance conflicts with public guidance or other local guidance, ask the user which rule to follow before proceeding.
4. When the prompt asks for a plan, design, or scope for proposed repository changes without making those changes, follow the [plan skill](.agents/skills/plan/SKILL.md). Do not use the plan skill for questions or reports about the current repository state.
5. For implementation, fixes, refactoring, or validation, follow the [change skill](.agents/skills/change/SKILL.md).
6. For code or pull request reviews, follow the [review skill](.agents/skills/review/SKILL.md).
7. Read and apply [development principles](.agents/references/development-principles.md) only when following the plan or change skill. Do not use them for questions, reports, or other non-planning, non-change requests.
