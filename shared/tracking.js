/*
 * 計測用イベント。GTM / GA4 の dataLayer に送る。
 * 「問い合わせ」として数えるのは generate_lead（フォーム送信）と phone_call_click（電話タップ）だけ。
 * LINE は line_click として別に記録し、問い合わせ数には含めない。
 */
window.dataLayer = window.dataLayer || [];

window.track = function (event, params) {
  var payload = Object.assign({ event: event, lp_variant: document.documentElement.dataset.variant || '' }, params || {});
  window.dataLayer.push(payload);
  if (location.hostname === 'localhost' || location.search.indexOf('debug') !== -1) {
    console.info('[track]', payload);
  }
};

document.addEventListener('click', function (e) {
  var link = e.target.closest('a');
  if (!link) return;
  if (link.hasAttribute('data-site-tel')) {
    window.track('phone_call_click', { cta_position: link.dataset.pos || '' });
  } else if (link.hasAttribute('data-site-line')) {
    window.track('line_click', { cta_position: link.dataset.pos || '' });
  }
});
