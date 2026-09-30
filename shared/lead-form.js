/*
 * 3ステップの見積もりフォーム。
 * マークアップ: form[data-lead-form] > fieldset[data-step] … / [data-next] [data-back] / [data-progress] / [data-done]
 * サンプルなので送信はせず、完了表示と計測イベントだけ行う。
 */
(function () {
  function init(form) {
    var steps = Array.prototype.slice.call(form.querySelectorAll('[data-step]'));
    var progress = form.querySelector('[data-progress]');
    var done = form.parentElement.querySelector('[data-done]');
    var current = 0;
    var started = false;

    function show(index) {
      current = index;
      steps.forEach(function (step, i) {
        step.hidden = i !== index;
      });
      if (progress) {
        progress.style.setProperty('--step', index + 1);
        progress.setAttribute('aria-valuenow', index + 1);
        var label = progress.querySelector('[data-progress-label]');
        if (label) label.textContent = (index + 1) + ' / ' + steps.length;
      }
    }

    function validate(step) {
      var fields = step.querySelectorAll('input, select, textarea');
      for (var i = 0; i < fields.length; i++) {
        if (!fields[i].checkValidity()) {
          fields[i].reportValidity();
          return false;
        }
      }
      return true;
    }

    form.addEventListener('change', function () {
      if (!started) {
        started = true;
        window.track && window.track('form_start');
      }
    });

    // 選択肢を選んだら自動で次のステップへ進める（最終ステップ以外）
    form.addEventListener('change', function (e) {
      var step = e.target.closest('[data-step]');
      if (e.target.type === 'radio' && step && step.hasAttribute('data-auto-next') && current < steps.length - 1) {
        setTimeout(function () { show(current + 1); focusStep(); }, 220);
      }
    });

    function focusStep() {
      var first = steps[current].querySelector('legend, input');
      if (first) {
        first.setAttribute('tabindex', '-1');
        first.focus({ preventScroll: true });
      }
    }

    form.addEventListener('click', function (e) {
      if (e.target.closest('[data-next]')) {
        e.preventDefault();
        if (validate(steps[current])) { show(current + 1); focusStep(); }
      } else if (e.target.closest('[data-back]')) {
        e.preventDefault();
        show(current - 1);
        focusStep();
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(steps[current])) return;
      var data = new FormData(form);
      window.track && window.track('generate_lead', {
        current_heater: data.get('current_heater') || '',
        timing: data.get('timing') || ''
      });
      form.hidden = true;
      if (done) {
        done.hidden = false;
        done.setAttribute('tabindex', '-1');
        done.focus();
      }
    });

    show(0);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-lead-form]').forEach(init);
  });
})();
