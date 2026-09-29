# ecocute

## Claude Code クラウド環境の共通セットアップ

`scripts/cloud-setup.sh` を claude.ai/code の **環境 → 編集 → セットアップスクリプト** に貼ると、
その環境で開くすべてのセッション（リポジトリ問わず）で以下が使える。

| 種別 | 名前 | 出所 |
|---|---|---|
| プラグイン | document-skills, example-skills | `anthropics/skills` |
| プラグイン | ui-ux-pro-max | `nextlevelbuilder/ui-ux-pro-max-skill` |
| プラグイン | superpowers, context7, playwright | `claude-plugins-official` |
| スキル | Remotion 公式スキル12個（`/remotion-create` など） | `remotion-dev/skills` → `~/.claude/skills` |

追加したいプラグインは、スクリプト内の `enabledPlugins` とインストール対象のリストに書き足す。
