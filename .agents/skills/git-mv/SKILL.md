---
name: git-mv
description: Move or rename files and directories already tracked by Git while retaining Git rename metadata.
metadata:
  team: CMSIS Solution
  short-description: Move tracked repository files with git mv
---

# Git Moves

Apply this skill when moving or renaming an existing Git-tracked file or
directory.

1. Verify that the source is tracked before moving it.
2. Use `git mv` for the move or rename. Do not replace it with a copy/delete
   sequence, a patch move, or a filesystem move.
3. Check that the destination is the intended path before running the command.
4. Afterward, inspect `git status --short` and `git diff --cached --summary`
   to confirm that Git recorded the rename.
5. `git mv` stages the rename. Do not stage unrelated changes; report the
   staged state to the user.

If the source is untracked, this skill does not apply because Git has no file
history to retain.
