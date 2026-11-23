#!/usr/bin/env bash
set -euo pipefail
workspace="$RUNNER_TEMP/raduna-context"
mkdir -p "$workspace" "$RUNNER_TEMP/result"
# Export regular tracked blobs only. No Git metadata, hooks, skills or symlinks.
paths=(docs/rad docs/sdd docs/modelli docs/test)
case "$ROLE" in
  implementatore|revisore) paths+=(src/main);;
  tester) paths+=(pom.xml);;
  *) exit 2;;
esac
git -C snapshot ls-tree -rz HEAD -- "${paths[@]}" > "$RUNNER_TEMP/raduna-blobs"
while IFS= read -r -d '' entry; do
  meta=${entry%%$'\t'*}; file=${entry#*$'\t'}
  [[ "$meta" == '100644 blob '* ]] || continue
  case "/$file/" in */.*/*|*/AGENTS.md/*) continue;; esac
  mkdir -p "$workspace/$(dirname "$file")"
  git -C snapshot cat-file blob "${meta##* }" > "$workspace/$file"
done < "$RUNNER_TEMP/raduna-blobs"
test -s /etc/ssl/certs/ca-certificates.crt
case "$ROLE" in implementatore) credits=200;; tester) credits=150;; revisore) credits=100;; esac
docker run --rm --read-only --user "$(id -u):$(id -g)" --cap-drop ALL \
  --security-opt no-new-privileges --pids-limit 128 --tmpfs /tmp:rw,nosuid,nodev,size=1g \
  --mount 'type=bind,src=/etc/ssl/certs,dst=/etc/ssl/certs,readonly' \
  --mount "type=bind,src=$workspace,dst=/work,readonly" \
  --mount "type=bind,src=$RUNNER_TEMP/role-prompt,dst=/prompt,readonly" \
  --env HOME=/tmp --env SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt \
  --env NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt --env COPILOT_GITHUB_TOKEN \
  --workdir /work node:22-bookworm-slim@sha256:4b150b48b4116e2a22f2c39cc27025fbf4f153e2078fd3b14d159fdb5c7279da \
  sh -ec 'npm install --prefix /tmp/cli @github/copilot@1.0.114 --no-audit --no-fund >&2
    exec /tmp/cli/node_modules/.bin/copilot -p "$(cat /prompt)" -s --model=auto --no-ask-user --no-auto-update \
      --disable-builtin-mcps --disable-mcp-server=computer-use --available-tools=view,grep,glob \
      --deny-tool=write --deny-tool=edit --deny-tool=shell --max-ai-credits="$1"' sh "$credits" \
  > "$RUNNER_TEMP/result/result.json"
