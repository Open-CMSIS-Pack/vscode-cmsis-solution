# Agent Guidance

1. Treat `.agents/` as the canonical source of repository guidance.
2. At the start of each conversation, discover guidance under `.agents/` and, if present, `.agents-local/`. Track the guidance files read during that conversation. Read each applicable file once, the first time it becomes relevant, using its current contents at that time. Then reuse those loaded contents for later prompts without reopening the file. Discovery does not preserve the contents of unread files. Changes to guidance files already read take effect only when the user asks to refresh them. If a skill exists at the same relative path in both directories, use the local skill in place of the public skill.
3. Apply relevant local skills that have no public counterpart as additional guidance. If this added guidance conflicts with public guidance or other local guidance, ask the user which rule to follow before proceeding.
4. When the prompt asks for a plan, design, or scope for proposed repository changes without making those changes, follow the [plan skill](.agents/skills/plan/SKILL.md). Do not use the plan skill for questions or reports about the current repository state.
5. For implementation, fixes, refactoring, or validation, follow the [change skill](.agents/skills/change/SKILL.md).
6. For code or pull request reviews, follow the [review skill](.agents/skills/review/SKILL.md).
7. Read and apply [development principles](.agents/references/development-principles.md) only when following the plan or change skill. Do not use them for questions, reports, or other non-planning, non-change requests.
