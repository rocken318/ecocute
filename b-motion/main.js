/*
 * B案の動き。
 * - ファーストビュー：空気の熱の粒が立ちのぼるキャンバス＋見出しの登場
 * - 深夜パート：スクロールに合わせて時計が 23:00 → 7:00 に進み、タンクが満ちる（ピン留め）
 * - 補助金の数字のカウントアップ
 * - 電気代シミュレーター
 * - 施工事例の横スクロール（PC）
 * GSAP が読み込めない・「視差効果を減らす」設定の場合は、静的なまま全部読めるようにしておく。
 */
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var motion = hasGsap && !reduceMotion;

  if (motion) {
    document.documentElement.classList.add('js-motion');
    gsap.registerPlugin(ScrollTrigger);
  }

  initHeader();
  initSimulator();
  initHeroCanvas();

  if (motion) {
    initHeroIntro();
    initNightStory();
    initCountUp();
    initCases();
  }

  /* ---------- ヘッダー：夜は透明、スクロールで背景を付け、朝のパートで明るく ---------- */
  function initHeader() {
    var header = document.querySelector('.site-header');
    var dayStart = document.querySelector('.reasons');
    function update() {
      var y = window.scrollY;
      header.classList.toggle('is-solid', y > 40);
      header.classList.toggle('is-day', dayStart && dayStart.getBoundingClientRect().top < 60);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------- ファーストビューの粒子 ---------- */
  function initHeroCanvas() {
    var canvas = document.querySelector('.hero-canvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w, h, particles = [], running = true, rafId;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(90, (w * h) / 12000));
      particles = [];
      for (var i = 0; i < count; i++) particles.push(spawn(true));
    }

    function spawn(anywhere) {
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + 10,
        r: 0.6 + Math.random() * 2.2,
        speed: 0.15 + Math.random() * 0.5,
        drift: Math.random() * Math.PI * 2,
        heat: Math.random()
      };
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        // 下ほど暖色、上に行くほど淡く
        var t = 1 - p.y / h;
        var alpha = Math.max(0, 0.9 - t * 0.9) * (0.35 + p.heat * 0.65);
        var g = Math.round(138 + t * 90);
        var b = Math.round(61 + t * 120);
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,' + g + ',' + b + ',' + alpha.toFixed(3) + ')';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function step() {
      if (!running) return;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.y -= p.speed;
        p.drift += 0.01;
        p.x += Math.sin(p.drift) * 0.25;
        if (p.y < -10) particles[i] = spawn(false);
      }
      draw();
      rafId = requestAnimationFrame(step);
    }

    resize();
    window.addEventListener('resize', resize);

    if (reduceMotion) {
      draw();
      return;
    }

    // 画面外にあるときは止める
    new IntersectionObserver(function (entries) {
      running = entries[0].isIntersecting;
      cancelAnimationFrame(rafId);
      if (running) step();
    }).observe(canvas);
  }

  /* ---------- 見出しの登場（ページ読み込み時の1回だけ） ---------- */
  function initHeroIntro() {
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero-title .line > span', { yPercent: 110, duration: 1.1, stagger: 0.14 })
      .from('.hero-area', { opacity: 0, duration: 0.8 }, 0.1)
      .from(['.hero-lead', '.hero-subsidy', '.hero-cta'], { opacity: 0, y: 16, duration: 0.8, stagger: 0.1 }, 0.6)
      .from('.scroll-hint', { opacity: 0, duration: 0.8 }, 1.2);
  }

  /* ---------- 深夜パート：23:00 → 7:00 ---------- */
  function initNightStory() {
    var section = document.querySelector('.night-story');
    var clock = section.querySelector('.clock-time');
    var percent = section.querySelector('.tank-percent');
    var water = section.querySelector('.tank-water');
    var steps = section.querySelectorAll('.story-steps li');
    var startMin = 23 * 60;
    var totalMin = 8 * 60;

    gsap.set(water, { scaleY: 0.08 });
    clock.textContent = '23:00';
    percent.textContent = '8';
    steps.forEach(function (li, i) { li.classList.toggle('is-active', i === 0); });

    ScrollTrigger.create({
      trigger: section,
      pin: '.story-pin',
      start: 'top top',
      end: '+=180%',
      scrub: 0.6,
      onUpdate: function (self) {
        var p = self.progress;
        var minutes = Math.round((startMin + totalMin * p) / 10) * 10 % (24 * 60);
        clock.textContent = Math.floor(minutes / 60) + ':' + String(minutes % 60).padStart(2, '0');
        var level = 0.08 + 0.92 * p;
        gsap.set(water, { scaleY: level });
        percent.textContent = Math.round(level * 100);
        var active = p < 0.34 ? 0 : p < 0.72 ? 1 : 2;
        steps.forEach(function (li, i) { li.classList.toggle('is-active', i === active); });
      }
    });
  }

  /* ---------- 補助金の数字 ---------- */
  function initCountUp() {
    document.querySelectorAll('[data-count-to]').forEach(function (el) {
      var target = Number(el.getAttribute('data-count-to'));
      var obj = { v: 0 };
      el.textContent = '0';
      gsap.to(obj, {
        v: target,
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        onUpdate: function () { el.textContent = Math.round(obj.v); }
      });
    });
  }

  /* ---------- 施工事例：PC は縦スクロールで横に流す ---------- */
  function initCases() {
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', function () {
      var track = document.querySelector('.cases-track');
      var distance = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      gsap.to(track, {
        x: function () { return -distance(); },
        ease: 'none',
        scrollTrigger: {
          trigger: '.cases',
          pin: true,
          start: 'top top',
          end: function () { return '+=' + distance(); },
          scrub: 0.8,
          invalidateOnRefresh: true
        }
      });
    });
  }

  /* ---------- 電気代シミュレーター ---------- */
  function initSimulator() {
    // 年間の削減額（円）のサンプル値。[今の給湯器][家族の人数]
    var SAVINGS = {
      electric: { 2: 40000, 4: 62000, 6: 85000 },
      gas: { 2: 30000, 4: 50000, 6: 70000 },
      oil: { 2: 25000, 4: 42000, 6: 60000 }
    };
    // 削減後の電気代が、今の光熱費の何割になるか（バーの長さ）
    var RATIO = { electric: 0.3, gas: 0.42, oil: 0.48 };

    var form = document.querySelector('.sim-form');
    if (!form) return;
    var yearlyEl = document.querySelector('[data-sim="yearly"]');
    var tenEl = document.querySelector('[data-sim="ten"]');
    var afterBar = document.querySelector('.sim-bar.after');
    var shown = Number(yearlyEl.textContent.replace(/,/g, ''));
    var fmt = new Intl.NumberFormat('ja-JP');

    function update() {
      var heater = form.elements.sim_heater.value;
      var family = form.elements.sim_family.value;
      var yearly = SAVINGS[heater][family];
      afterBar.style.setProperty('--ratio', RATIO[heater]);
      tenEl.textContent = fmt.format(yearly * 10);

      if (!motion) {
        yearlyEl.textContent = fmt.format(yearly);
        shown = yearly;
        return;
      }
      var obj = { v: shown };
      gsap.to(obj, {
        v: yearly,
        duration: 0.7,
        ease: 'power2.out',
        onUpdate: function () { yearlyEl.textContent = fmt.format(Math.round(obj.v / 100) * 100); },
        onComplete: function () { yearlyEl.textContent = fmt.format(yearly); }
      });
      shown = yearly;
    }

    form.addEventListener('change', function () {
      update();
      window.track && window.track('simulator_use', {
        heater: form.elements.sim_heater.value,
        family: form.elements.sim_family.value
      });
    });
    update();
  }
})();
