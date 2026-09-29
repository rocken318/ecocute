/**
 * クライアント情報（確定後にここを書き換えるだけでLP全体に反映されます）
 * HTML内の data-cfg="キー" の要素にテキストが、data-cfg-href="tel" のリンクに電話番号が入ります。
 */
window.LP_CONFIG = {
  company: '【会社名】',
  tel: '0000000000',            // 発信用（ハイフンなし）
  telDisplay: 'XXX-XXXX-XXXX',  // 表示用
  hours: 'XX:XX〜XX:XX',
  holiday: '定休日：XX',
  area: '○○県全域・○○市周辺',
  address: '〒XXX-XXXX ○○県○○市○○',
  warranty: '工事保証 XX年',
  license: '第二種電気工事士 / 給水装置工事主任技術者 など',

  // フォーム送信先（空のときはデモ動作：送信せずサンクス表示）
  // 例: 'https://formspree.io/f/xxxxxxx'
  formEndpoint: ''
};

/**
 * Google広告の検索意図別メッセージ（?lp=subsidy | price | urgent）
 * 広告グループごとに最終ページURLへパラメータを付けて出し分けます。
 */
window.LP_VARIANTS = {
  // A. 補助金系（デフォルト）
  subsidy: null,

  // B. 交換・価格系
  price: {
    eyebrow: 'エコキュート交換 工事費込み',
    title: 'コミコミ価格<br><span class="fv__big"><strong>XX</strong><em>万円〜</em></span>',
    lead: '本体・工事・撤去・処分まで全部込み。追加料金の不安なし。',
    sub: '<mark>さらに補助金で最大10万円/台<br class="sp">お得になります。</mark>',
    cta: '工事費込みの交換価格を無料で確認する',
    jump: 'price'   // 価格セクションを強調
  },

  // C. 故障・緊急系
  urgent: {
    eyebrow: 'エコキュート故障・お湯が出ない',
    title: 'まずは<br><span class="fv__big fv__big--text">最短工事日</span>を確認',
    lead: '急な故障・エラーもご相談ください。可能な限り早い日程をご案内します。',
    sub: '<mark>お急ぎの方はお電話が<br class="sp">いちばん早いです。</mark>',
    cta: '最短工事日・交換価格を確認する',
    urgent: true    // 電話CTAを強調
  }
};
