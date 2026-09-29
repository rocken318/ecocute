(function () {
  'use strict';

  var cfg = window.LP_CONFIG || {};
  var variants = window.LP_VARIANTS || {};
  var params = new URLSearchParams(location.search);

  /* ---------- Config反映 ---------- */
  document.querySelectorAll('[data-cfg]').forEach(function (el) {
    var v = cfg[el.getAttribute('data-cfg')];
    if (v) el.textContent = v;
  });
  document.querySelectorAll('[data-cfg-href="tel"]').forEach(function (el) {
    if (cfg.tel) el.setAttribute('href', 'tel:' + cfg.tel);
  });

  /* ---------- 広告別の出し分け ---------- */
  var variantKey = params.get('lp') || 'subsidy';
  var variant = variants[variantKey];
  if (variant) {
    document.querySelectorAll('[data-variant-text]').forEach(function (el) {
      var v = variant[el.getAttribute('data-variant-text')];
      if (v) el.textContent = v;
    });
    document.querySelectorAll('[data-variant-html]').forEach(function (el) {
      var v = variant[el.getAttribute('data-variant-html')];
      if (v) el.innerHTML = v;
    });
    document.body.classList.add('is-' + variantKey);
    if (variant.jump) {
      // 価格系：ファーストビュー直後に価格セクションを移動
      var target = document.getElementById(variant.jump);
      var worries = document.getElementById('worries');
      if (target && worries) worries.parentNode.insertBefore(target, worries);
    }
  }
  var variantField = document.getElementById('lpVariant');
  if (variantField) variantField.value = variantKey;

  var utm = [];
  params.forEach(function (v, k) { if (/^(utm_|gclid|lp)/.test(k)) utm.push(k + '=' + v); });
  var utmField = document.getElementById('utmField');
  if (utmField) utmField.value = utm.join('&');

  /* ---------- 計測（GTM / gtag へ dataLayer 送信） ---------- */
  function track(event, data) {
    var payload = Object.assign({ event: event, lp_variant: variantKey }, data || {});
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }

  document.querySelectorAll('.js-tel').forEach(function (el) {
    el.addEventListener('click', function () { track('tel_click', { position: el.className }); });
  });
  document.querySelectorAll('.js-cta').forEach(function (el) {
    el.addEventListener('click', function () { track('cta_click', { cta: el.getAttribute('data-cta') }); });
  });

  // 商品別の見積もりボタン → フォームに商品名を引き継ぎ
  var productField = document.getElementById('productField');
  document.querySelectorAll('.js-product').forEach(function (el) {
    el.addEventListener('click', function () {
      if (productField) productField.value = el.getAttribute('data-product');
      var est = document.querySelector('input[name="request"][value="見積もり"]');
      if (est) est.checked = true;
    });
  });

  /* ---------- スムーススクロール（固定ヘッダー分をオフセット） ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var header = document.querySelector('.header');
      var y = target.getBoundingClientRect().top + window.pageYOffset - (header ? header.offsetHeight : 0) - 8;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  /* ---------- 固定CTA：ファーストビュー通過後に表示 ---------- */
  var fixed = document.querySelector('.fixed-cta');
  var fv = document.getElementById('fv');
  if (fixed && fv && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      fixed.classList.toggle('is-visible', !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(fv);
  } else if (fixed) {
    fixed.classList.add('is-visible');
  }

  /* ---------- フォーム ---------- */
  var form = document.getElementById('contactForm');
  var errorBox = document.getElementById('formError');
  var thanks = document.getElementById('formThanks');
  var started = false;

  form.addEventListener('input', function () {
    if (!started) { started = true; track('form_start'); }
  });

  function validate() {
    var msgs = [];
    form.querySelectorAll('.is-invalid').forEach(function (el) { el.classList.remove('is-invalid'); });
    [['f-name', 'お名前'], ['f-tel', '電話番号'], ['f-email', 'メールアドレス'], ['f-area', '郵便番号または市区町村']].forEach(function (f) {
      var el = document.getElementById(f[0]);
      if (!el.value.trim()) { msgs.push(f[1] + 'を入力してください'); el.classList.add('is-invalid'); }
      else if (!el.checkValidity()) { msgs.push(f[1] + 'の形式をご確認ください'); el.classList.add('is-invalid'); }
    });
    if (!form.querySelector('input[name="current"]:checked')) msgs.push('現在の給湯器を選択してください');
    if (!form.querySelector('input[name="request"]:checked')) msgs.push('ご希望内容を1つ以上選択してください');
    return msgs;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var msgs = validate();
    if (msgs.length) {
      errorBox.innerHTML = msgs.join('<br>');
      errorBox.hidden = false;
      var first = form.querySelector('.is-invalid');
      if (first) first.focus();
      return;
    }
    errorBox.hidden = true;

    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;

    var done = function () {
      var req = Array.prototype.map.call(form.querySelectorAll('input[name="request"]:checked'), function (el) { return el.value; });
      track('generate_lead', {
        form_type: req.indexOf('補助金対象の確認') > -1 ? 'subsidy_check' : 'estimate',
        product: productField ? productField.value : ''
      });
      form.hidden = true;
      thanks.hidden = false;
      thanks.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    if (!cfg.formEndpoint) { done(); return; } // デモ動作

    fetch(cfg.formEndpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error(res.status);
        done();
      })
      .catch(function () {
        btn.disabled = false;
        errorBox.textContent = '送信に失敗しました。お手数ですが時間をおいて再度お試しいただくか、お電話でお問い合わせください。';
        errorBox.hidden = false;
      });
  });
})();
