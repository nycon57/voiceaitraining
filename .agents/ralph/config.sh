# Ralph config for VoiceAI Training
: "${PRD_PATH:=.agents/tasks/prd-voiceaitraining.json}"
# Re-open blocked stories automatically when dependencies are now done.
: "${AUTO_UNBLOCK_BLOCKED:=true}"
: "${AGENT_CMD:=codex exec --yolo --skip-git-repo-check -}"
# Fail stalled agent calls instead of hanging the loop forever (0 disables timeout).
: "${AGENT_TIMEOUT_SECONDS:=900}"
