# ecocute

## Claude Code（クラウド含む）で使えるスキル・プラグイン

このリポジトリを開いた Claude Code セッション（claude.ai/code のクラウド含む）では、以下が自動で有効になる。

### プラグイン（`.claude/settings.json`）
| プラグイン | 出所 | 内容 |
|---|---|---|
| document-skills | `anthropics/skills` | docx / xlsx / pptx / pdf |
| example-skills | `anthropics/skills` | frontend-design, canvas-design, webapp-testing など |
| ui-ux-pro-max | `nextlevelbuilder/ui-ux-pro-max-skill` | UI/UX デザイン |
| superpowers | `claude-plugins-official` | ブレスト / 計画 / TDD / デバッグ |
| context7 | `claude-plugins-official` | ライブラリの最新ドキュメント取得 MCP |
| playwright | `claude-plugins-official` | ブラウザ操作・スクショ MCP |

### スキル（`.claude/skills/`）
- Remotion 公式スキル一式（`/remotion-best-practices`, `/remotion-create`, `/remotion-render` など12個）
  - 出所: [remotion-dev/skills](https://github.com/remotion-dev/skills)
  - 更新: `./scripts/update-remotion-skills.sh`

スキルを追加したいときは `.claude/skills/<名前>/SKILL.md` を置いて push する。

### クラウドでは入れていないもの
- codex / imagegen（Codex CLI のログインが必要）
- comfyui / 21st / Figma などのローカル MCP（ローカルサーバーや API キーが必要）
