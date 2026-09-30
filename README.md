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

## エコキュート交換LP（提案用サンプル）

| パス | 内容 |
|---|---|
| `index.html` | 2案の比較ページ（クライアントに共有する入口） |
| `a-standard/` | A案：王道・成約重視。静的HTML/CSSのみ |
| `b-motion/` | B案：夜→朝へ移り変わる演出、電気代シミュレーター、横スクロール事例（GSAP） |
| `shared/site-config.js` | 社名・エリア・電話番号・補助金額。ここを書き換えると両案に反映 |
| `shared/tracking.js` | dataLayer 計測。問い合わせ＝`generate_lead`（フォーム）と `phone_call_click`（電話）のみ。LINE は `line_click` で別計上 |
| `shared/lead-form.js` | 3ステップ見積もりフォーム（サンプルのため送信はしない） |

ビルド不要。`python3 -m http.server` などで配信すれば確認できる。URL に `?debug` を付けると計測イベントがコンソールに出る。
補助金は給湯省エネ2026事業（2026年9月時点：基本7万円／要件を満たす機種10万円／撤去加算最大4万円）。公開前に予算の状況を再確認すること。
