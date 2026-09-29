#!/usr/bin/env bash
# Remotion 公式スキル (remotion-dev/skills) を .claude/skills/ に取り込み直す
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
git clone -q --depth 1 https://github.com/remotion-dev/skills "$tmp/skills"
for dir in "$tmp"/skills/skills/*/; do
  name="$(basename "$dir")"
  rm -rf "$root/.claude/skills/$name"
  cp -r "$dir" "$root/.claude/skills/$name"
  echo "updated: $name"
done
