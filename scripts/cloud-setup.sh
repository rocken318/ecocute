#!/usr/bin/env bash
# Claude Code クラウド環境用セットアップスクリプト。
# claude.ai/code の「環境 → 編集 → セットアップスクリプト」に貼ると、
# その環境で開くすべてのセッション（リポジトリ問わず）でプラグインとスキルが使える。
set -uo pipefail

CLAUDE_DIR="$HOME/.claude"
mkdir -p "$CLAUDE_DIR/skills"

# 1. ユーザー設定にマーケットプレイスと有効プラグインを宣言（既存設定とマージ）
python3 - "$CLAUDE_DIR/settings.json" <<'PY'
import json, os, sys
path = sys.argv[1]
s = json.load(open(path)) if os.path.exists(path) else {}
s.setdefault("extraKnownMarketplaces", {}).update({
    "anthropic-agent-skills": {"source": {"source": "github", "repo": "anthropics/skills"}},
    "ui-ux-pro-max-skill": {"source": {"source": "github", "repo": "nextlevelbuilder/ui-ux-pro-max-skill"}},
})
s.setdefault("enabledPlugins", {}).update({
    "document-skills@anthropic-agent-skills": True,
    "example-skills@anthropic-agent-skills": True,
    "ui-ux-pro-max@ui-ux-pro-max-skill": True,
    "superpowers@claude-plugins-official": True,
    "context7@claude-plugins-official": True,
    "playwright@claude-plugins-official": True,
})
json.dump(s, open(path, "w"), indent=2)
PY

# 2. プラグインを事前に取得（失敗しても起動時に settings.json から再取得される）
for m in anthropics/skills nextlevelbuilder/ui-ux-pro-max-skill anthropics/claude-plugins-official; do
  claude plugin marketplace add "$m" || echo "WARN: marketplace $m"
done
for p in document-skills@anthropic-agent-skills example-skills@anthropic-agent-skills \
         ui-ux-pro-max@ui-ux-pro-max-skill superpowers@claude-plugins-official \
         context7@claude-plugins-official playwright@claude-plugins-official; do
  claude plugin install "$p" || echo "WARN: plugin $p"
done

# 3. Remotion 公式スキルを ~/.claude/skills に配置
tmp="$(mktemp -d)"
if git clone -q --depth 1 https://github.com/remotion-dev/skills "$tmp/remotion"; then
  for dir in "$tmp"/remotion/skills/*/; do
    name="$(basename "$dir")"
    rm -rf "$CLAUDE_DIR/skills/$name"
    cp -r "$dir" "$CLAUDE_DIR/skills/$name"
  done
else
  echo "WARN: remotion skills clone failed"
fi
rm -rf "$tmp"

exit 0
