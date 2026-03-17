#!/usr/bin/env python3
"""
Copyright 2025-2026 Arm Limited

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

generated with AI
"""

import re, sys, pathlib
import datetime

CURRENT_YEAR = datetime.datetime.now().year  # Use system year

COPYRIGHT_PATTERN = re.compile(
    r'\bCopyright(?:[ \t]*\(c\))?[ \t]*'
    r'(?P<y1>\d{4})'
    r'(?:[ \t]*-[ \t]*(?P<y2>\d{4}))?'
    r'(?:[ \t]+Arm[ \t]+Limited\b)*',
    flags=re.IGNORECASE
)

def update_text(t: str):
    changed = False

    def canonical_copyright(y1: int, y2: int | None) -> str:
        if y2 is None:
            return f"Copyright {y1} Arm Limited"
        return f"Copyright {y1}-{y2} Arm Limited"

    def repl(m):
        nonlocal changed
        y1 = int(m.group('y1'))
        y2 = m.group('y2')
        if y2:
            y2 = int(y2)
            target_y2 = y2 if y2 >= CURRENT_YEAR else CURRENT_YEAR
            new_text = canonical_copyright(y1, target_y2)
        else:
            new_text = (
                canonical_copyright(y1, None)
                if y1 == CURRENT_YEAR
                else canonical_copyright(y1, CURRENT_YEAR)
            )

        if new_text == m.group(0):
            return m.group(0)

        changed = True
        return new_text

    t2 = COPYRIGHT_PATTERN.sub(repl, t)
    return t2, changed


def collect_paths() -> list[str]:
    # Prefer explicit CLI paths; otherwise read piped stdin.
    if len(sys.argv) > 1:
        return [p.strip() for p in sys.argv[1:] if p.strip()]
    if not sys.stdin.isatty():
        return [p.strip() for p in sys.stdin if p.strip()]
    return []

def main():
    paths = collect_paths()
    if not paths:
        print(
            "Usage: python update_copyright_years.py <file1> <file2> ...\n"
            "   or: <command that outputs file paths> | python update_copyright_years.py"
        )
        return 2

    updated = 0
    for p in paths:
        fp = pathlib.Path(p)
        if not fp.exists() or fp.is_dir():
            continue
        try:
            with fp.open("r", encoding="utf-8", errors="ignore", newline="") as f:
                s = f.read()
        except Exception:
            continue

        s2, changed = update_text(s)
        if changed:
            with fp.open("w", encoding="utf-8", newline="") as f:
                f.write(s2)
            print(f"[OK ] {p}")
            updated += 1
    print(f"Updated {updated} files to year {CURRENT_YEAR}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
