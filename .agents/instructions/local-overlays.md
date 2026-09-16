# Local Skill Overlays

1. Search `.agents-local/skills/*.skill.md`.
2. Search `.agents-local/instructions/*.instructions.md`.
3. If no matching files exist, continue without local guidance.
4. Read and apply every matching file before planning or changing code.
5. Give local skills and instructions precedence over public guidance.
6. If local guidance conflicts with public guidance or other local guidance, ask the user which rule to follow before proceeding.
