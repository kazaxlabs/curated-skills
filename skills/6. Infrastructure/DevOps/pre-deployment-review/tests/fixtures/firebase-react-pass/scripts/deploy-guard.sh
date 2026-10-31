#!/usr/bin/env bash
set -euo pipefail
[ -z "$(git status --porcelain)" ] || { echo "Refusing: dirty tree"; exit 1; }
