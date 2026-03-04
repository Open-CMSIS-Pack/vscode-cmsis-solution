#!/usr/bin/env python3
"""
Copyright (C) 2025-2026 Arm Limited

This script updates copyright headers in source files to reflect the current year.
It supports headers in the format:
    Copyright (C) <original year> Arm Limited
    Copyright (C) <original year>-<current year> Arm Limited
If the header does not reflect the current year, it will be updated to <original year>-<current year>.
SPDX-FileCopyrightText headers are also updated similarly.

The script is generated using ChatGPT
"""

import re, sys, pathlib
import datetime

CURRENT_YEAR = datetime.datetime.now().year  # Use system year

COPYRIGHT_PATTERN = re.compile(
    r'(?P<prefix>Copyright(?:\s*\(c\))?[^0-9\n]{0,40})'
    r'(?P<y1>\d{4})'
    r'(?:\s*-\s*(?P<y2>\d{4}))?',
    flags=re.IGNORECASE
)
SPDX_PATTERN = re.compile(
    r'(?P<prefix>SPDX-FileCopyrightText:\s*)'
    r'(?P<y1>\d{4})'
    r'(?:\s*-\s*(?P<y2>\d{4}))?',
    flags=re.IGNORECASE
)

def update_text(t: str):
    changed = False
    def repl(m):
        nonlocal changed
        y1 = int(m.group('y1'))
        y2 = m.group('y2')
        if y2:
            y2 = int(y2)
            if y2 >= CURRENT_YEAR: return m.group(0)
            changed = True
            return f"{m.group('prefix')}{y1}-{CURRENT_YEAR}"
        else:
            if y1 == CURRENT_YEAR: return m.group(0)
            changed = True
            return f"{m.group('prefix')}{y1}-{CURRENT_YEAR}"
    t2 = COPYRIGHT_PATTERN.sub(repl, t)
    t2 = SPDX_PATTERN.sub(repl, t2)
    return t2, changed

def main():
    paths = [p.strip() for p in sys.stdin if p.strip()]
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
if __name__ == "__main__":
    main()
