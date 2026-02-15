#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_PATH="${ACTIVITY_LOG_PATH:-$ROOT_DIR/.ralph/activity.log}"
MESSAGE="${*:-}"

if [ -z "$MESSAGE" ]; then
  exit 0
fi

mkdir -p "$(dirname "$LOG_PATH")"
timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
printf '[%s] %s\n' "$timestamp" "$MESSAGE" >> "$LOG_PATH"
