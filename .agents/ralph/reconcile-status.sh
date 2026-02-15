#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONFIG_FILE="$SCRIPT_DIR/config.sh"

DEFAULT_PRD_PATH=".agents/tasks/prd-voiceaitraining.json"
DEFAULT_PROGRESS_PATH=".ralph/progress.md"
DEFAULT_RUNS_DIR=".ralph/runs"
DEFAULT_REPORT_DIR=".ralph"

if [ -f "$CONFIG_FILE" ]; then
  # shellcheck source=/dev/null
  . "$CONFIG_FILE"
fi

PRD_PATH="${PRD_PATH:-$DEFAULT_PRD_PATH}"
PROGRESS_PATH="${PROGRESS_PATH:-$DEFAULT_PROGRESS_PATH}"
RUNS_DIR="${RUNS_DIR:-$DEFAULT_RUNS_DIR}"
REPORT_DIR="${REPORT_DIR:-$DEFAULT_REPORT_DIR}"
APPLY=false

for arg in "$@"; do
  case "$arg" in
    --apply)
      APPLY=true
      ;;
    *)
      echo "Unknown argument: $arg"
      exit 1
      ;;
  esac
done

abs_path() {
  local p="$1"
  if [[ "$p" = /* ]]; then
    echo "$p"
  else
    echo "$ROOT_DIR/$p"
  fi
}

PRD_PATH="$(abs_path "$PRD_PATH")"
PROGRESS_PATH="$(abs_path "$PROGRESS_PATH")"
RUNS_DIR="$(abs_path "$RUNS_DIR")"
REPORT_DIR="$(abs_path "$REPORT_DIR")"

if [ ! -f "$PRD_PATH" ]; then
  echo "PRD not found: $PRD_PATH"
  exit 1
fi

mkdir -p "$REPORT_DIR"
REPORT_PATH="$REPORT_DIR/reconciliation-report-$(date +%Y%m%d-%H%M%S).md"

python3 - "$PRD_PATH" "$PROGRESS_PATH" "$RUNS_DIR" "$REPORT_PATH" "$APPLY" <<'PY'
import json
import os
import re
import shutil
import sys
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path

prd_path = Path(sys.argv[1])
progress_path = Path(sys.argv[2])
runs_dir = Path(sys.argv[3])
report_path = Path(sys.argv[4])
apply_changes = sys.argv[5].strip().lower() == "true"

# Staleness threshold for in_progress stories (hours). Override via RECONCILE_STALE_HOURS.
STALE_HOURS = int(os.environ.get("RECONCILE_STALE_HOURS", "24"))
STALE_THRESHOLD = timedelta(hours=STALE_HOURS)

data = json.loads(prd_path.read_text())
stories = data.get("stories") if isinstance(data, dict) else []
if not isinstance(stories, list):
    raise SystemExit("Invalid PRD stories array")

progress_text = progress_path.read_text() if progress_path.exists() else ""
run_logs = list(runs_dir.glob("*.log")) if runs_dir.exists() else []

# Build index with duplicate ID detection
index = {}
duplicate_ids = []
for s in stories:
    if not isinstance(s, dict):
        continue
    sid = s.get("id")
    if sid in index:
        duplicate_ids.append(sid)
    else:
        index[sid] = s

if duplicate_ids:
    raise SystemExit(
        f"Duplicate story IDs found in PRD: {', '.join(sorted(set(duplicate_ids)))}. "
        "Fix the PRD before running reconciliation."
    )

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def status_of(story):
    return str((story or {}).get("status") or "open").strip().lower()

def has_completion_marker(text: str) -> bool:
    marker = "<promise>COMPLETE</promise>"
    if "OpenAI Codex" in text:
        lines = text.splitlines()
        response_start = None
        for i, line in enumerate(lines):
            if line.strip() == "codex":
                response_start = i
        if response_start is not None:
            return any(marker in line for line in lines[response_start + 1 :])
    return marker in text

def is_done(story_id):
    target = index.get(story_id)
    return isinstance(target, dict) and status_of(target) == "done"

def depends_ready(story):
    deps = story.get("dependsOn") or []
    if not isinstance(deps, list):
        deps = []
    return all(is_done(dep) for dep in deps), deps

status_counts = Counter()
progress_mentions = {}
completion_log_hits = {}
blocked_ready = []
open_with_progress = []
in_progress_stories = []

for story in stories:
    if not isinstance(story, dict):
        continue
    sid = story.get("id", "")
    status = status_of(story)
    status_counts[status] += 1

    if sid:
        progress_mentions[sid] = len(re.findall(re.escape(sid), progress_text))

        complete_hits = 0
        sid_escaped = re.escape(sid)
        completion_pattern = re.compile(
            sid_escaped + r".*?<promise>COMPLETE</promise>", re.DOTALL
        )
        for log in run_logs:
            text = log.read_text(errors="ignore")
            if completion_pattern.search(text):
                complete_hits += 1
        completion_log_hits[sid] = complete_hits

    deps_ok, deps = depends_ready(story)
    if status == "blocked" and deps_ok:
        blocked_ready.append((sid, deps))
    if status == "open" and progress_mentions.get(sid, 0) > 0:
        open_with_progress.append(sid)
    if status == "in_progress":
        in_progress_stories.append(sid)

applied = []
if apply_changes:
    for sid, _ in blocked_ready:
        target = index.get(sid)
        if not isinstance(target, dict):
            continue
        target["status"] = "open"
        target["startedAt"] = None
        target["completedAt"] = None
        target["updatedAt"] = now_iso()
        applied.append(f"{sid}: blocked -> open (dependencies already done)")

    now = datetime.now(timezone.utc)
    for sid in in_progress_stories:
        target = index.get(sid)
        if not isinstance(target, dict):
            continue
        # Check staleness before resetting — only reset stories older than threshold
        ts_raw = target.get("updatedAt") or target.get("startedAt")
        if ts_raw:
            try:
                text = str(ts_raw).strip()
                if text.endswith("Z"):
                    text = text[:-1] + "+00:00"
                ts = datetime.fromisoformat(text)
                if ts.tzinfo is None:
                    ts = ts.replace(tzinfo=timezone.utc)
                if (now - ts) < STALE_THRESHOLD:
                    continue  # Still fresh, skip
            except (ValueError, TypeError):
                pass  # Invalid timestamp — treat as stale
        target["status"] = "open"
        target["startedAt"] = None
        target["completedAt"] = None
        target["updatedAt"] = now_iso()
        applied.append(f"{sid}: in_progress -> open (stale >{STALE_HOURS}h)")

    # Back up existing PRD before writing changes
    backup_path = None
    if prd_path.exists():
        backup_path = prd_path.with_suffix(f".bak-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}")
        shutil.copy2(str(prd_path), str(backup_path))
    try:
        prd_path.write_text(json.dumps(data, indent=2) + "\n")
    except Exception as exc:
        backup_msg = f" Backup at {backup_path}" if backup_path else ""
        print(f"ERROR: Failed to write PRD: {exc}.{backup_msg}", file=sys.stderr)
        raise

lines = []
lines.append("# Ralph Reconciliation Report")
lines.append("")
lines.append(f"- Generated: {datetime.now(timezone.utc).isoformat()}")
lines.append(f"- Apply mode: {'yes' if apply_changes else 'no'}")
lines.append(f"- PRD: {prd_path}")
lines.append(f"- Progress log: {progress_path}")
lines.append(f"- Runs dir: {runs_dir}")
lines.append("")
lines.append("## Status Counts")
for key in sorted(status_counts.keys()):
    lines.append(f"- {key}: {status_counts[key]}")
lines.append("")

lines.append("## Blocked Stories With Dependencies Satisfied")
if blocked_ready:
    for sid, deps in blocked_ready:
        deps_text = ", ".join(deps) if deps else "none"
        lines.append(f"- {sid} (dependsOn: {deps_text})")
else:
    lines.append("- none")
lines.append("")

lines.append("## Open Stories With Prior Progress Entries")
if open_with_progress:
    for sid in sorted(open_with_progress):
        lines.append(f"- {sid} (progress mentions: {progress_mentions.get(sid, 0)})")
else:
    lines.append("- none")
lines.append("")

us015 = index.get("US-015")
if isinstance(us015, dict):
    lines.append("## US-015 Snapshot")
    deps_ok, deps = depends_ready(us015)
    lines.append(f"- status: {status_of(us015)}")
    lines.append(f"- dependencies: {', '.join(deps) if deps else 'none'}")
    lines.append(f"- dependencies_done: {'yes' if deps_ok else 'no'}")
    lines.append("")

lines.append("## Completion Marker Hits (Story Mention + COMPLETE in same log)")
for sid in sorted(completion_log_hits.keys()):
    hits = completion_log_hits[sid]
    if hits > 0:
        lines.append(f"- {sid}: {hits}")
if not any(v > 0 for v in completion_log_hits.values()):
    lines.append("- none")
lines.append("")

lines.append("## Applied Normalizations")
if applied:
    for item in applied:
        lines.append(f"- {item}")
else:
    lines.append("- none")
lines.append("")

report_path.write_text("\n".join(lines).rstrip() + "\n")
print(report_path)
print("|".join(applied))
PY
