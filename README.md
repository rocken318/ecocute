# ecocute

## C案：エコキュート集客LP（`c-existing/`）

`ecocute_lp_plan.md`（制作案）をもとにした、Google検索広告向けのランディングページ。静的HTMLのみでビルド不要。以下のパスはすべて `c-existing/` からの相対パス。

```
index.html        LP本体（制作案 3〜15 のセクション構成）
css/style.css     スタイル（スマホファースト）
js/config.js      クライアント情報・広告別メッセージ ← 確定情報はここを書き換える
js/main.js        出し分け・計測・フォーム処理
img/              画像（hero はAI生成のイメージ写真）
```

### クライアント情報の差し替え

- 会社名・電話番号・営業時間・対応エリア・保証などは `js/config.js` の `LP_CONFIG` を書き換えるとLP全体に反映される（SEO用に `index.html` 内の初期値も合わせて書き換えるのがおすすめ）
- 商品・価格（`#price`）、対応メーカー（`#makers`）、施工事例（`#cases`）は `index.html` 内の `XXX` / `○○` を実データに差し替える
- 補助金の金額・条件は公開前に必ず最新の公式情報を確認する

### 広告グループ別の出し分け（制作案 16）

最終ページURLにパラメータを付けると、ファーストビューのコピーとCTAが切り替わる。

| URL | 用途 | 変化 |
|---|---|---|
| `/` または `?lp=subsidy` | A. 補助金系 | 「対象機種なら最大10万円/台」 |
| `?lp=price` | B. 交換・価格系 | 「コミコミ価格 XX万円〜」＋価格セクションを直後に移動 |
| `?lp=urgent` | C. 故障・緊急系 | 「まずは最短工事日を確認」＋電話番号を上部に大きく表示 |

文言は `js/config.js` の `LP_VARIANTS` で編集できる。

### フォーム送信先

`js/config.js` の `formEndpoint` に Formspree などのエンドポイントURLを設定する。空のままだと送信せずサンクス表示だけ出すデモ動作になる。送信データには `lp_variant`（出し分け種別）、`product`（商品別ボタンから来た場合の商品名）、`utm`（utm_* / gclid）が hidden で付く。

### コンバージョン計測（制作案 17）

`<head>` に GTM（または gtag）を設置すると、以下のイベントが `dataLayer` に送られる。GTM側でトリガーに設定する。

| event | タイミング |
|---|---|
| `generate_lead` | フォーム送信完了（`form_type`: `subsidy_check` / `estimate`） |
| `tel_click` | 電話リンクのタップ |
| `cta_click` | 各CTAボタンのクリック（`cta` に位置） |
| `form_start` | フォームへの入力開始 |

すべてのイベントに `lp_variant` が付くので、広告グループ別のCVRを比較できる。

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

## エコキュート交換LP　A案・B案（提案用サンプル）

| パス | 内容 |
|---|---|
| `index.html` | A・B・C 3案の比較ページ（クライアントに共有する入口） |
| `a-standard/` | A案：王道・成約重視。静的HTML/CSSのみ |
| `b-motion/` | B案：夜→朝へ移り変わる演出、電気代シミュレーター、横スクロール事例（GSAP） |
| `shared/site-config.js` | 社名・エリア・電話番号・補助金額。ここを書き換えると両案に反映 |
| `shared/tracking.js` | dataLayer 計測。問い合わせ＝`generate_lead`（フォーム）と `phone_call_click`（電話）のみ。LINE は `line_click` で別計上 |
| `shared/lead-form.js` | 3ステップ見積もりフォーム（サンプルのため送信はしない） |

ビルド不要。`python3 -m http.server` などで配信すれば確認できる。URL に `?debug` を付けると計測イベントがコンソールに出る。
補助金は給湯省エネ2026事業（2026年9月時点：基本7万円／要件を満たす機種10万円／撤去加算最大4万円）。公開前に予算の状況を再確認すること。
