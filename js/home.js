/* ============================================================
   晨星·路西法 · 首页 v5 交互脚本 —— 零依赖,只给 index.html 用
   约定(与 css/home.css 顶部一致,原因见 README「首页 v5」):
   - 只有一个滚动监听,用 requestAnimationFrame 合并;每帧只读一次滚动位置,只写变化了的东西
   - 量尺寸只在加载 / 改窗口时;手机地址栏伸缩不算改窗口
   - 宽度 <= 760px、窗口高度 < 640px、系统开了"减少动态效果" -> 不进 live,页面就是完整静态版
   - canvas 只在它那一章在屏幕上时逐帧画;传送带离开屏幕就暂停
   - 天数从 2026-07-18 起每天自动算;其余数字为 2026-11-28 在 AllyOS 仓库实测
   ============================================================ */
(() => {
  const root = document.documentElement;
  const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ease = (x) => 1 - Math.pow(1 - x, 3);
  const mq = (q) => (window.matchMedia ? window.matchMedia(q) : { matches: false, addEventListener() {} });
  const reduce = mq('(prefers-reduced-motion: reduce)');
  const wide = mq('(min-width: 761px)');
  const finePointer = mq('(hover: hover) and (pointer: fine)');
  const flag = (el, name, on) => (on ? el.setAttribute(name, '') : el.removeAttribute(name));
  const fmt = (n) => n.toLocaleString('en-US');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ---- 天数:从 2026-07-18 起每天自动算 ----
  const start = new Date(2026, 6, 18);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.round((today - start) / 86400000));
  $$('[data-days]').forEach((el) => { el.textContent = fmt(days); });

  // ---- 标题拆字(载入动画用) ----
  const h1 = $('#heroTitle');
  let ci = 0;
  h1.innerHTML = h1.innerHTML.split('<br>').map((line) =>
    Array.from(line).map((c) => (c === ' ' ? ' ' : `<span class="ch" style="--i:${ci++}">${c}</span>`)).join('')).join('<br>');
  if (!reduce.matches) root.classList.add('is-anim');

  // ---- 守卫墙:真实守卫名(scripts/check_*.py 的一部分) ----
  const GUARDS = ['dependency_direction', 'doc_sync', 'rls_enabled', 'definer_search_path', 'money_format_single_source', 'governed_rpc_pgtap_coverage',
    'spec_id_unique', 'migration_spec_id', 'test_amendments', 'commit_signatures', 'release_gate', 'client_money_sums', 'view_security_invoker',
    'serial_reads', 'fk_indexed', 'dead_exports', 'entry_bundle_budget', 'map_budget', 'guard_liveness', 'full_suite_gate',
    'outbox_idempotency_evidence', 'constant_time_compare', 'anon_execute_grant', 'rls_initplan', 'schema_enum_mirrors', 'staff_reads_real_jwt',
    'sql_lint', 'typecheck_coverage', 'shared_component_adoption', 'colocated_tests', 'pr_backlog_trailer', 'stranded_phases',
    'pnpm_audit', 'workflow_lockfile', 'merged_migration_edit', 'undefined_css_vars'];
  const BAD = GUARDS.indexOf('serial_reads');
  const wall = $('#wall');
  GUARDS.forEach((g) => { const d = document.createElement('div'); d.className = 'g'; d.textContent = g; wall.appendChild(d); });

  // ---- 章节小圆点 ----
  const chapDots = $('#chapDots');
  $$('[data-chapter]').forEach(() => chapDots.appendChild(document.createElement('i')));

  const m = { live: false, raf: 0, scenes: [], chaps: [], chap: -1, vh: 0, vw: 0, navOff: 0, lastPP: -1, colors: {} };
  const bar = $('.progress i');

  // ================= 各章的专属效果 =================
  const FX = {};

  const LANES = ['01 需求', '02 追问', '03 规格', '04 实现', '05 守卫', '06 集成', '07 上线'];
  // 01 混乱 → 秩序:canvas 碎片。只在这一章可见时逐帧画。
  FX.chaos = {
    init(s) {
      s.cv = $('canvas', s.el); s.ctx = s.cv.getContext('2d'); s.running = false; s.visible = false;
      const words = ['feat', 'fix', 'migration', '+42 −7', 'test', 'docs', 'refactor', 'rls', 'rpc', 'hotfix', '+3 −120', 'chore', 'schema', 'edge fn', 'i18n', 'ci', 'perf', 'types'];
      s.chips = Array.from({ length: 84 }, (_, i) => ({ t: words[(i * 7) % words.length], r1: Math.random(), r2: Math.random(), ph: Math.random() * 6.28, sp: .6 + Math.random() * .8, rot: (Math.random() - .5) * .6 }));
    },
    measure(s) {
      const stage = s.cv.parentElement, dpr = Math.min(2, window.devicePixelRatio || 1);
      s.cw = stage.clientWidth; s.chH = stage.clientHeight;
      s.cv.width = Math.round(s.cw * dpr); s.cv.height = Math.round(s.chH * dpr); s.dpr = dpr;
      const wr = $('.wrap', stage), sr = stage.getBoundingClientRect(), rr = wr.getBoundingClientRect(), cs = getComputedStyle(wr);
      const x0 = rr.left - sr.left + (parseFloat(cs.paddingLeft) || 0), x1 = rr.right - sr.left - (parseFloat(cs.paddingRight) || 0);
      const y0 = s.chH * .56, y1 = s.chH * .96, rows = Math.ceil(s.chips.length / 7), laneW = (x1 - x0) / 7;
      s.lanes = { x0, laneW, y0, rows, rowH: (y1 - y0) / rows };
      s.ctx.font = '600 11px ui-monospace, "SF Mono", Menlo, Consolas, monospace';
      s.chips.forEach((c, i) => {
        c.w = Math.min(laneW - 10, s.ctx.measureText(c.t).width + 14); c.h = Math.min(18, s.lanes.rowH - 4);
        c.hx = c.r1 * s.cw; c.hy = s.chH * (.06 + c.r2 * .9);
        const lane = i % 7, row = Math.floor(i / 7);
        c.lane = lane; c.ox = x0 + lane * laneW + laneW / 2; c.oy = y0 + row * s.lanes.rowH + s.lanes.rowH / 2;
      });
    },
    vis(s, top) {
      s.visible = top < m.vh && top + s.h > 0;
      if (s.visible && !s.running) { s.running = true; const loop = (t) => { if (!m.live || !s.visible) { s.running = false; return; } FX.chaos.draw(s, t); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
    },
    draw(s, t) {
      const c2 = s.ctx, p = s.last < 0 ? 0 : s.last, col = m.colors, L = s.lanes; if (!L) return;
      c2.setTransform(s.dpr, 0, 0, s.dpr, 0, 0); c2.clearRect(0, 0, s.cw, s.chH);
      c2.font = '600 11px ui-monospace, "SF Mono", Menlo, Consolas, monospace'; c2.textAlign = 'center'; c2.textBaseline = 'middle';
      const laneOn = clamp((p - .6) / .05);
      if (laneOn > 0) {
        c2.globalAlpha = laneOn;
        for (let k = 0; k < 7; k++) {
          const x = L.x0 + k * L.laneW + 4; const lit = p >= .7 + k * .035;
          c2.fillStyle = lit ? col.ink : col.line2; c2.fillRect(x, L.y0 - L.rowH / 2 - 8, L.laneW - 8, 2);
          c2.font = '700 13px ' + getComputedStyle(document.body).fontFamily; c2.textAlign = 'left'; c2.textBaseline = 'alphabetic';
          c2.fillStyle = lit ? col.ink : col.muted; c2.fillText(LANES[k], x, L.y0 - L.rowH / 2 - 16);
        }
        c2.font = '600 11px ui-monospace, "SF Mono", Menlo, Consolas, monospace'; c2.textAlign = 'center'; c2.textBaseline = 'middle';
      }
      const n = s.chips.length;
      for (let i = 0; i < n; i++) {
        const c = s.chips[i];
        const mi = ease(clamp((p - .44 - (i / n) * .08) / .12));
        const ts = t * .001 * c.sp;
        const cx = c.hx + Math.sin(ts + c.ph) * 34, cy = c.hy + Math.cos(ts * 1.2 + c.ph) * 26;
        const x = cx + (c.ox - cx) * mi, y = cy + (c.oy - cy) * mi;
        const rot = (c.rot + Math.sin(ts * .7 + c.ph) * .15) * (1 - mi);
        const lit = mi > .98 && p >= .7 + c.lane * .035;
        c2.globalAlpha = .22 + .73 * mi;
        c2.save(); c2.translate(x, y); c2.rotate(rot);
        c2.beginPath(); if (c2.roundRect) c2.roundRect(-c.w / 2, -c.h / 2, c.w, c.h, 3); else c2.rect(-c.w / 2, -c.h / 2, c.w, c.h);
        if (lit) { c2.fillStyle = col.ink; c2.fill(); c2.fillStyle = col.paper; }
        else { c2.fillStyle = col.paper; c2.fill(); c2.strokeStyle = mi > .5 ? col.ink : col.line2; c2.lineWidth = 1; c2.stroke(); c2.fillStyle = mi > .5 ? col.ink : col.muted; }
        c2.fillText(c.t, 0, .5); c2.restore();
      }
      c2.globalAlpha = 1;
    },
  };

  // 02 Harness:圆形展开 + 七层落下 + 最后压成一个包
  FX.harness = {
    init(s) {
      s.plates = $$('.plate', s.el); s.details = $$('.hd', s.el); s.meter = $$('.h-meter i', s.el);
      s.stack = $('.stack', s.el); s.cap = $('#stackCap'); s.k = -2; s.d = -2;
      s.caps = ['往下滚，一层一层盖厂房', '图纸库 · 地图', '工序 · 技能', '工位 · 子 Agent', '自动开关 · 钩子', '质检 · 118 道守卫', '出货班次 · CI + 列车', '返修改进 · 复盘到规则', '整座工厂 · 一个包'];
    },
    update(s, p) {
      s.el.style.setProperty('--r', `${(8 + 150 * ease(clamp(p / .06))).toFixed(2)}%`);
      s.stack.style.setProperty('--c', ease(clamp((p - .84) / .1)).toFixed(4));
      let k = 0; for (let i = 1; i <= 7; i++) if (p >= .1 + (i - 1) * .1) k = i;
      const d = p >= .84 ? 8 : k;
      if (k !== s.k || d !== s.d) {
        s.k = k; s.d = d;
        s.plates.forEach((pl, i) => { flag(pl, 'data-on', i <= k); flag(pl, 'data-cur', i === k && i > 0 && d < 8); });
        s.details.forEach((el, i) => flag(el, 'data-on', i === d));
        s.meter.forEach((el, i) => flag(el, 'data-on', i < k));
        s.cap.textContent = s.caps[d];
      }
    },
    reset(s) { s.el.style.removeProperty('--r'); s.stack.style.removeProperty('--c'); s.plates.forEach((pl) => { pl.setAttribute('data-on', ''); pl.removeAttribute('data-cur'); }); s.details.forEach((el) => el.setAttribute('data-on', '')); s.k = s.d = -2; },
  };

  // 03 流水线:编号沿七站前进 + 日志追加
  FX.pipe = {
    init(s) { s.stations = $$('.station', s.el); s.steps = $$('.step', s.el); s.logs = $$('.log li:not(.hd2)', s.el); s.counter = $('#stepCounter'); s.step = -2; },
    update(s, p) {
      const step = Math.min(6, Math.floor(clamp((p - .04) / .88) * 7));
      if (step === s.step) return;
      s.step = step; s.el.style.setProperty('--step', String(step));
      s.stations.forEach((st, i) => { flag(st, 'data-on', i <= step); flag(st, 'data-cur', i === step); });
      s.steps.forEach((st, i) => flag(st, 'data-on', i === step));
      s.logs.forEach((st, i) => { flag(st, 'data-on', i <= step); flag(st, 'data-cur', i === step); });
      s.counter.textContent = `· ${step + 1} / 7`;
    },
    reset(s) { s.el.style.removeProperty('--step'); [...s.stations, ...s.steps, ...s.logs].forEach((e) => { e.setAttribute('data-on', ''); e.removeAttribute('data-cur'); }); s.counter.textContent = ''; s.step = -2; },
  };

  // 04 守卫墙:扫描 → 拦截 → 修复 → 全绿
  FX.guards = {
    init(s) { s.gs = $$('.g', s.el); s.cos = $$('.co', s.el); s.num = $('#gNum'); s.small = $('#gSmall'); s.key = ''; s.gs[BAD].classList.add('bad-static'); },
    update(s, p) {
      const q = clamp((p - .06) / .52), n = Math.floor(q * s.gs.length);
      wall.style.setProperty('--q', q.toFixed(4));
      const fixed = p >= .66, scannedBad = n > BAD;
      const st = !scannedBad ? 'scan' : !fixed ? 'fail' : p >= .74 ? 'ok' : 'fix';
      const key = `${n}|${st}`; if (key === s.key) return; s.key = key;
      s.gs.forEach((g, i) => { const bad = i === BAD && !fixed; flag(g, 'data-pass', i < n && !bad); flag(g, 'data-fail', i < n && bad); });
      const passed = Math.round(118 * (n / s.gs.length)) - (st === 'fail' ? 1 : 0);
      s.num.textContent = st === 'ok' ? '118' : String(Math.max(0, passed));
      s.small.textContent = st === 'ok' ? '/ 118 道 · 全绿 · 放行' : st === 'fail' ? '/ 118 道 · 1 道拦截' : '/ 118 道 · 检查中';
      s.cos.forEach((c) => flag(c, 'data-on', c.dataset.st === st));
    },
    reset(s) { wall.style.removeProperty('--q'); s.gs.forEach((g) => { g.removeAttribute('data-pass'); g.removeAttribute('data-fail'); }); s.cos.forEach((c) => c.setAttribute('data-on', '')); s.num.textContent = '118'; s.small.textContent = '/ 118 道 · 全绿 · 放行'; s.key = ''; },
  };

  // 05 证据:卡片横移,缓动追随(与帧率无关)
  const rail = { x: 0, target: 0, loop: false, lastT: 0, active: -1, data: null };
  const applyRail = () => {
    const r = rail.data; if (!r) return;
    r.el.style.transform = `translate3d(${rail.x.toFixed(2)}px,0,0)`;
    const mid = m.vw / 2; let best = 0, bd = Infinity;
    r.cards.forEach((c, i) => { const d = Math.abs(r.left + c.x + rail.x + c.w / 2 - mid); if (d < bd) { bd = d; best = i; } });
    if (best !== rail.active) { rail.active = best; r.cards.forEach((c, i) => flag(c.el, 'data-on', i === best)); $('#railNo').textContent = `0${best + 1} / 0${r.cards.length}`; }
  };
  const railStep = (t) => {
    const dt = Math.min(64, Math.max(1, t - rail.lastT)); rail.lastT = t;
    const d = rail.target - rail.x;
    if (Math.abs(d) < .25) { rail.x = rail.target; applyRail(); rail.loop = false; return; }
    rail.x += d * (1 - Math.pow(.78, dt / 16.667)); applyRail(); requestAnimationFrame(railStep);
  };
  FX.rail = {
    premeasure(s) {
      const el = $('[data-rail]', s.el), vp = el.parentElement, cs = getComputedStyle(vp);
      el.style.transform = '';
      const padL = parseFloat(cs.paddingLeft) || 0, inner = vp.clientWidth - padL - (parseFloat(cs.paddingRight) || 0);
      const max = Math.max(0, el.offsetWidth - inner);
      s.el.style.setProperty('--len', `${Math.round(m.vh * 1.3 + max)}px`);
      rail.data = { el, max, left: vp.getBoundingClientRect().left + padL, cards: Array.from(el.children).map((c) => ({ el: c, x: c.offsetLeft, w: c.offsetWidth })) };
      rail.active = -1;
    },
    update(s, p) {
      if (!rail.data) return;
      rail.target = -rail.data.max * clamp((p - .06) / .86);
      if (!rail.loop && Math.abs(rail.target - rail.x) > .25) { rail.loop = true; rail.lastT = performance.now(); requestAnimationFrame(railStep); }
    },
    after() { rail.x = rail.target; applyRail(); },
    reset(s) { const el = $('[data-rail]', s.el); el.style.transform = ''; s.el.style.removeProperty('--len'); $$('.case', s.el).forEach((c) => c.setAttribute('data-on', '')); rail.data = null; },
  };

  // ================= 滚动引擎 =================
  const setChapter = (i) => {
    m.chap = i; const c = m.chaps[i]; if (!c) return;
    $('#chapLabel').textContent = c.label;
    $$('i', chapDots).forEach((d, j) => { flag(d, 'data-on', j <= i); flag(d, 'data-cur', j === i); });
    $$('.nav-links a[href^="#"]').forEach((a) => { if (a.getAttribute('href') === `#${c.id}`) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  };

  const tick = () => {
    const sy = window.pageYOffset || root.scrollTop || 0, vh = m.vh;
    const pp = clamp(sy / Math.max(1, root.scrollHeight - vh));
    if (Math.abs(pp - m.lastPP) > .0005) { m.lastPP = pp; bar.style.transform = `scaleX(${pp.toFixed(4)})`; }
    let c = 0; for (let i = 0; i < m.chaps.length; i++) if (m.chaps[i].top <= sy + vh * .45) c = i;
    if (c !== m.chap) setChapter(c);
    if (!m.live) return;
    for (const s of m.scenes) {
      const top = s.top - sy;
      if (s.fx && s.fx.vis) s.fx.vis(s, top);
      const p = s.pin ? clamp((m.navOff - top) / Math.max(1, s.h - vh + m.navOff)) : clamp((vh - top) / (vh + s.h));
      if (Math.abs(p - s.last) < .0004) continue;
      s.last = p;
      s.el.style.setProperty('--p', p.toFixed(4));
      if (s.words.length) {
        const n = Math.round(clamp((p - s.wr[0]) / (s.wr[1] - s.wr[0])) * s.words.length);
        if (n !== s.nw) { s.nw = n; s.words.forEach((w, j) => flag(w, 'data-on', j < n)); }
      }
      for (const a of s.ats) { const on = p >= a.at && p < a.until; if (on !== a.on) { a.on = on; flag(a.el, 'data-on', on); } }
      for (const k of s.counts) { const v = Math.round(k.to * ease(clamp((p - k.r[0]) / (k.r[1] - k.r[0])))); if (v !== k.last) { k.last = v; k.el.textContent = fmt(v); } }
      if (s.fx && s.fx.update) s.fx.update(s, p);
    }
  };

  const readColors = () => {
    const cs = getComputedStyle(root);
    m.colors = { ink: cs.getPropertyValue('--ink').trim(), paper: cs.getPropertyValue('--paper').trim(), muted: cs.getPropertyValue('--muted').trim(), line: cs.getPropertyValue('--line').trim(), line2: cs.getPropertyValue('--line-2').trim() };
  };

  const fxState = new Map();
  const sceneFx = (el) => {
    const name = el.dataset.fx; if (!name || !FX[name]) return null;
    if (!fxState.has(el)) { const st = { el }; FX[name].init?.(st); fxState.set(el, st); }
    return fxState.get(el);
  };

  const measure = () => {
    const sy = window.pageYOffset || root.scrollTop || 0;
    m.vh = window.innerHeight; m.vw = window.innerWidth;
    const nav = $('.nav'); m.navOff = nav.getBoundingClientRect().height + (parseFloat(getComputedStyle(nav).top) || 0);
    readColors();
    if (m.live) $$('[data-fx]').forEach((el) => { const st = sceneFx(el); if (st && FX[el.dataset.fx].premeasure) FX[el.dataset.fx].premeasure(st); });
    m.scenes = m.live ? $$('[data-scene]').map((el) => {
      const r = el.getBoundingClientRect(), top = r.top + sy, h = r.height, pin = el.dataset.scene === 'pin';
      if (!pin) el.style.setProperty('--p0', (top < m.vh ? clamp((m.vh - top) / (m.vh + h)) : .5).toFixed(4));
      const own = (x) => x.parentElement.closest('[data-scene]') === el;
      const wr = $('[data-words]', el);
      const st = sceneFx(el);
      const s = st || { el };
      Object.assign(s, {
        pin, top, h, last: -1, fx: el.dataset.fx ? FX[el.dataset.fx] : null,
        words: wr ? $$('.w', wr) : [], wr: wr ? wr.dataset.words.split(',').map(Number) : null, nw: -1,
        ats: $$('[data-at]', el).filter(own).map((a) => ({ el: a, at: +a.dataset.at, until: a.dataset.until ? +a.dataset.until : 2, on: null })),
        counts: $$('[data-count]', el).filter(own).map((k) => ({ el: k, to: +k.dataset.count, r: k.dataset.range.split(',').map(Number), last: -1 })),
      });
      if (s.fx && s.fx.measure) s.fx.measure(s);
      return s;
    }) : [];
    m.chaps = $$('[data-chapter]').map((el) => ({ id: el.id, label: el.dataset.chapter, top: el.getBoundingClientRect().top + sy }));
    m.lastPP = -1; m.chap = -1;
    tick();
    if (m.live) m.scenes.forEach((s) => s.fx && s.fx.after && s.fx.after(s));
  };

  const resetLive = () => {
    $$('[data-fx]').forEach((el) => { const st = fxState.get(el); if (st && FX[el.dataset.fx].reset) FX[el.dataset.fx].reset(st); });
    $$('[data-count]').forEach((k) => { k.textContent = fmt(+k.dataset.count); });
    $$('[data-at]').forEach((a) => a.setAttribute('data-on', ''));
    $$('.w').forEach((w) => w.setAttribute('data-on', ''));
    m.scenes = [];
  };

  const detect = () => {
    const next = !reduce.matches && wide.matches && window.innerHeight >= 640 && window.innerHeight <= 2200;
    if (next !== m.live) { m.live = next; root.classList.toggle('is-live', next); if (!next) resetLive(); }
    measure();
  };

  // 入场上浮:只在 live 时藏一点;静态版一开始就完整可见
  if ('IntersectionObserver' in window) {
    const rio = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.setAttribute('data-in', ''); rio.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('[data-reveal]').forEach((el) => rio.observe(el));
  } else $$('[data-reveal]').forEach((el) => el.setAttribute('data-in', ''));

  const belt = $('#belt');
  if ('IntersectionObserver' in window) new IntersectionObserver((es) => es.forEach((en) => belt.classList.toggle('running', en.isIntersecting))).observe(belt);
  else belt.classList.add('running');

  window.addEventListener('scroll', () => { if (m.raf) return; m.raf = requestAnimationFrame(() => { m.raf = 0; tick(); }); }, { passive: true });
  let lastW = window.innerWidth, lastH = window.innerHeight, rt = 0;
  window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    if (w === lastW && Math.abs(h - lastH) < 160 && mq('(pointer: coarse)').matches) return;
    lastW = w; lastH = h; cancelAnimationFrame(rt); rt = requestAnimationFrame(detect);
  });
  reduce.addEventListener?.('change', detect);
  mq('(prefers-color-scheme: dark)').addEventListener?.('change', () => requestAnimationFrame(measure));
  new MutationObserver(() => requestAnimationFrame(measure)).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  const goCase = () => {
    const id = location.hash.slice(1);
    const card = id && document.getElementById(id);
    if (!card || !card.classList.contains('case')) return;
    const vp = card.closest('.rail-vp'); if (vp) vp.scrollLeft = 0;
    const s = m.scenes.find((x) => x.fx === FX.rail);
    if (!m.live || !s || !rail.data) return;
    const c = rail.data.cards.find((x) => x.el === card); if (!c) return;
    const p = .06 + .86 * clamp(rail.data.max ? c.x / rail.data.max : 0);
    window.scrollTo({ top: s.top - m.navOff + p * (s.h - m.vh + m.navOff) + 2, behavior: 'auto' });
  };
  window.addEventListener('hashchange', () => requestAnimationFrame(goCase));
  window.addEventListener('load', () => { detect(); setTimeout(goCase, 50); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(detect);
  detect();
  setTimeout(detect, 700);

  // ================= 指针交互(只给鼠标,且没开减少动态) =================
  const motionOK = () => !reduce.matches && finePointer.matches;
  const hero = $('#top'); let hp = 0;
  hero.addEventListener('pointermove', (e) => {
    if (!motionOK() || hp) return;
    hp = requestAnimationFrame(() => {
      hp = 0; const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      hero.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    });
  });
  hero.addEventListener('pointerleave', () => { hero.style.setProperty('--mx', '0'); hero.style.setProperty('--my', '0'); });
  $$('.magnet').forEach((b) => {
    b.addEventListener('pointermove', (e) => { if (!motionOK()) return; const r = b.getBoundingClientRect(); b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * .22).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * .35).toFixed(1)}px)`; });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
  $$('.tilt').forEach((c) => {
    c.addEventListener('pointermove', (e) => { if (!motionOK()) return; const r = c.getBoundingClientRect(); c.style.setProperty('--ry', `${(((e.clientX - r.left) / r.width) - .5) * 6}deg`); c.style.setProperty('--rx', `${(.5 - ((e.clientY - r.top) / r.height)) * 6}deg`); });
    c.addEventListener('pointerleave', () => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
  });

  // ================= 开场:数字累加 + 终端回放(只一次) =================
  if (!reduce.matches) {
    const nums = $$('.stat [data-to]'); const t0 = performance.now() + 500;
    const run = (t) => { const k = ease(clamp((t - t0) / 1400)); nums.forEach((el) => { el.textContent = fmt(Math.round(+el.dataset.to * k)); }); if (k < 1) requestAnimationFrame(run); };
    requestAnimationFrame(run);
    const pr = $('#tPrompt'), full = pr.textContent, lines = $$('.t-line');
    pr.textContent = ''; lines.forEach((l) => l.setAttribute('data-wait', ''));
    let i = 0;
    const type = () => {
      if (i <= full.length) { pr.textContent = full.slice(0, i++); setTimeout(type, 55); return; }
      lines.forEach((l, j) => setTimeout(() => {
        const ok = $('.ok', l); ok.textContent = '◌'; l.removeAttribute('data-wait');
        setTimeout(() => { ok.textContent = '✓'; }, 320);
      }, 380 + j * 520));
    };
    setTimeout(type, 900);
  }

  // ================= 复制邮箱 =================
  const cb = $('#copyMail'), addr = $('#mailAddr');
  cb.addEventListener('click', () => {
    const done = () => { cb.textContent = '已复制'; setTimeout(() => { cb.textContent = '复制邮箱'; }, 1800); };
    const fallback = () => { const sel = window.getSelection(), rg = document.createRange(); rg.selectNodeContents(addr); sel.removeAllRanges(); sel.addRange(rg); cb.textContent = '已选中，按 Ctrl/⌘ + C'; };
    try { navigator.clipboard.writeText(addr.textContent.trim()).then(done, fallback); } catch (e) { fallback(); }
  });

  // ================= 站点外壳:深浅色、手机菜单、年份 =================
  $('#themeToggle').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
  const burger = $('#burger'), menu = $('#navMenu');
  const setMenu = (open) => { menu.classList.toggle('open', open); burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单'); };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  $('#year').textContent = String(new Date().getFullYear());
})();
