#!/usr/bin/env bash

BASE=origin/main
git fetch origin
git diff --name-only "$(git merge-base HEAD $BASE)...HEAD" \
  | ./update_copyright_years.py
