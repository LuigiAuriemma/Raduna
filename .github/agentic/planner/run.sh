#!/bin/sh
set -eu
mkdir -p /output/home /output/npm
export HOME=/output/home
export npm_config_cache=/output/npm-cache
npm install --global --prefix /output/npm @github/copilot@1.0.114 --no-audit --no-fund >/dev/null
/output/npm/bin/copilot --version >&2
node /work/.github/agentic/planner/prompt.js /output/input.json /output/prompt.txt
cd /work
/output/npm/bin/copilot -p "$(cat /output/prompt.txt)" -s --model=auto --no-ask-user \
  --no-auto-update --disable-builtin-mcps --disable-mcp-server=computer-use \
  --available-tools='view,grep,glob' --deny-tool=write --deny-tool=edit \
  --deny-tool=shell --max-ai-credits=100 --output-format=json > /output/events.jsonl
test -s /output/events.jsonl
node /work/.github/agentic/planner/extract.js /output/events.jsonl /output/raw.md
