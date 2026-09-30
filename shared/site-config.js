/*
 * サンプル用の会社情報。ここを書き換えれば A案・B案の両方に反映される。
 * HTML 側は data-site="キー" の要素にテキストを、data-site-tel の <a> に電話リンクを差し込む。
 */
window.SITE = {
  companyName: 'サンプル電設',
  area: '〇〇市・近隣エリア',
  phone: '0120-000-000',
  hours: '8:00〜20:00（土日祝も受付）',
  lineUrl: '#line',
  // 補助金（給湯省エネ2026事業）。制度・予算の状況は公開前に必ず公式サイトで再確認する。
  subsidyMax: '14',
  subsidyBase: '7',
  subsidyUpper: '10',
  subsidyRemoval: '4',
  asOf: '2026年9月時点'
};

(function () {
  function apply() {
    var site = window.SITE;
    document.querySelectorAll('[data-site]').forEach(function (el) {
      var key = el.getAttribute('data-site');
      if (site[key] != null) el.textContent = site[key];
    });
    document.querySelectorAll('[data-site-tel]').forEach(function (el) {
      el.setAttribute('href', 'tel:' + site.phone.replace(/[^0-9+]/g, ''));
    });
    document.querySelectorAll('[data-site-line]').forEach(function (el) {
      el.setAttribute('href', site.lineUrl);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();
