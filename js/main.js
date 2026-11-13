/* ============================================================
   个人简历网站交互脚本 · v3(酷炫增强版)
   基础层:主题 / 菜单 / 滚动高亮 / 打字机 / 数字滚动 / 入场动画(纯 CSS 可降级)
   增强层(检测 CDN 加载成功后启用,失败自动回退基础层):
     - Three.js:首屏"墨浪"粒子场(鼠标交互) + 可拖拽旋转的 3D 朱砂印章
     - GSAP + ScrollTrigger:逐字标题入场、滚动编排、磁性按钮
     滚动一律用浏览器原生滚动(不做滚动劫持):滚轮 / 触控板的每一下都立刻生效,不会有"拖泥带水"的延迟感
   ============================================================ */

(function () {
  "use strict";

  var root = document.documentElement;
  // 单页简历:刷新一律回到顶部,保证入场动画与锚点体验一致
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isDesktop = window.matchMedia("(min-width: 861px)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  var hasTHREE = !!window.THREE;
  var useGSAP = hasGSAP && !prefersReduced;

  /* ---------- 0. 兜底:3 秒后强制显示所有未入场元素(任何极端情况内容都可见) ---------- */
  setTimeout(function () {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("visible");
      el.style.opacity = "";
      el.style.transform = "";
    });
  }, 3000);

  /* ---------- 1. 主题切换(初始值由 head 内联脚本设置) ---------- */
  var themeToggle = document.getElementById("themeToggle");
  themeToggle.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    window.dispatchEvent(new CustomEvent("themechange", { detail: { dark: next === "dark" } }));
  });

  /* ---------- 2. 导航栏:滚动加背景 ---------- */
  var navbar = document.getElementById("navbar");
  function onScrollNav() {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  }

  /* ---------- 3. 移动端汉堡菜单 ---------- */
  var burger = document.getElementById("navBurger");
  var navMenu = document.getElementById("navMenu");
  burger.addEventListener("click", function () {
    var open = navMenu.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  navMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navMenu.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- 4. 滚动高亮当前区块 ---------- */
  // 区块位置只在尺寸变化时量一次,滚动时只读缓存 —— 滚动回调里不做任何会触发重排的读取
  var sections = Array.prototype.slice.call(document.querySelectorAll("section[id]"));
  var navLinks = document.querySelectorAll(".nav-link");
  var sectionTops = [], maxScroll = 1, currentId = "";
  function measure() {
    sectionTops = sections.map(function (sec) {
      return { id: sec.id, top: sec.getBoundingClientRect().top + window.scrollY };
    });
    maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }
  function scrollSpy(y) {
    var pos = y + window.innerHeight / 3;
    var id = "hero";
    for (var i = 0; i < sectionTops.length; i++) if (pos >= sectionTops[i].top) id = sectionTops[i].id;
    if (id === currentId) return;
    currentId = id;
    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + id);
    });
  }

  /* ---------- 5. 顶部阅读进度条(用 transform 缩放,不改 width,不触发布局) ---------- */
  var progressBar = document.getElementById("scrollProgress");
  var backTop = document.getElementById("backTop");
  function onScrollFrame() {
    ticking = false;
    var y = window.scrollY;
    onScrollNav();
    scrollSpy(y);
    progressBar.style.transform = "scaleX(" + Math.min(1, y / maxScroll) + ")";
    backTop.classList.toggle("show", y > 500);
  }
  // 所有滚动联动合并成一次 requestAnimationFrame,每帧最多执行一次
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onScrollFrame);
  }, { passive: true });
  window.addEventListener("resize", function () { measure(); onScrollFrame(); });
  window.addEventListener("load", function () { measure(); onScrollFrame(); });
  if ("ResizeObserver" in window) new ResizeObserver(function () { measure(); }).observe(document.body);
  measure();
  onScrollFrame();

  /* ---------- 6. 打字机轮播 ---------- */
  var TITLES = ["AI 研发系统架构师", "AI 应用工程师", "全栈工程师", "前端架构师", "多 Agent 系统构建者"];
  var typedEl = document.getElementById("typed");
  var tIndex = 0, cIndex = 0, deleting = false;
  function typeLoop() {
    var word = TITLES[tIndex];
    typedEl.textContent = word.slice(0, cIndex);
    if (!deleting && cIndex < word.length) {
      cIndex++; setTimeout(typeLoop, 130);
    } else if (deleting && cIndex > 0) {
      cIndex--; setTimeout(typeLoop, 60);
    } else if (!deleting) {
      deleting = true; setTimeout(typeLoop, 1500);
    } else {
      deleting = false; tIndex = (tIndex + 1) % TITLES.length; setTimeout(typeLoop, 380);
    }
  }
  typeLoop();

  /* ---------- 7. 数字滚动(独立的视口观察,两种动效路径通用) ---------- */
  function animateCount(el, target) {
    var duration = 1400;
    var start = performance.now();
    var finished = false, lastFrame = 0;
    function render(p) {
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(target * eased).toLocaleString();
    }
    function finish() {
      if (finished) return;
      finished = true; render(1);
    }
    function tick(now) {
      if (finished) return;
      lastFrame = now;
      render(Math.min((now - start) / duration, 1));
      if (now - start < duration) requestAnimationFrame(tick);
      else finished = true;
    }
    requestAnimationFrame(tick);
    setTimeout(function () {
      if (!finished && performance.now() - lastFrame > 250) finish();
    }, 400);
    setTimeout(finish, 2600);
  }
  if ("IntersectionObserver" in window) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (!el.dataset.done) {
          el.dataset.done = "1";
          animateCount(el, parseInt(el.dataset.count, 10));
        }
        countIO.unobserve(el);
      });
    }, { threshold: 0.4 });
    document.querySelectorAll(".stat-num").forEach(function (el) { countIO.observe(el); });
  } else {
    document.querySelectorAll(".stat-num").forEach(function (el) {
      el.textContent = parseInt(el.dataset.count, 10).toLocaleString();
    });
  }

  /* ---------- 8. 入场动画:GSAP 优先,IO 兜底 ---------- */
  if (useGSAP) {
    root.classList.add("gsap");
    gsap.registerPlugin(ScrollTrigger);
    var revealEls = gsap.utils.toArray(".reveal");
    revealEls.forEach(function (el) { el.classList.add("visible"); });
    gsap.set(revealEls, { opacity: 0, y: 26 });
    function showEl(el) {
      gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", overwrite: true });
    }
    revealEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92) {
        // 视口内或已在上方(刷新恢复滚动位置的场景):立即入场
        showEl(el);
      } else {
        gsap.to(el, {
          opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 92%", once: true }
        });
      }
    });
    ScrollTrigger.refresh();

    // 首屏主标题逐字升起 + 顶部细线展开
    (function heroIntro() {
      var name = document.querySelector(".hero-name");
      if (!name) return;
      var chars = [];
      name.textContent.trim().split("").forEach(function (ch) {
        var s = document.createElement("span");
        s.className = "ch";
        s.textContent = ch;
        chars.push(s);
      });
      name.textContent = "";
      chars.forEach(function (s) { name.appendChild(s); });
      gsap.set(name, { overflow: "hidden" });
      gsap.from(chars, {
        yPercent: 118, rotate: 5, duration: 1.1, ease: "power4.out",
        stagger: 0.14, delay: 0.25
      });
      var mast = document.querySelector(".masthead");
      if (mast) {
        gsap.from(mast, { scaleX: 0, transformOrigin: "left center", duration: 1.1, ease: "power3.inOut", delay: 0.05 });
      }
      var greeting = document.querySelector(".hero-greeting");
      if (greeting) gsap.from(greeting, { opacity: 0, x: -14, duration: 0.8, delay: 0.15, ease: "power2.out" });
    })();

    // 各区块标题逐字入场
    gsap.utils.toArray(".sec-title").forEach(function (title) {
      var chars = [];
      title.textContent.trim().split("").forEach(function (ch) {
        var s = document.createElement("span");
        s.className = "ch";
        s.textContent = ch;
        chars.push(s);
      });
      title.textContent = "";
      chars.forEach(function (s) { title.appendChild(s); });
      gsap.set(title, { overflow: "hidden" });
      gsap.from(chars, {
        yPercent: 120, duration: 0.85, ease: "power4.out", stagger: 0.06,
        scrollTrigger: { trigger: title, start: "top 88%", once: true }
      });
      // 编号与英文小字
      var head = title.closest(".sec-head");
      if (head) {
        var bits = head.querySelectorAll(".sec-idx, .sec-sub");
        if (bits.length) {
          gsap.from(bits, {
            opacity: 0, duration: 0.9, delay: 0.25,
            scrollTrigger: { trigger: head, start: "top 88%", once: true }
          });
        }
      }
    });
  } else {
    /* 基础路径:IntersectionObserver + 主动兜底 */
    function activate(el) {
      if (el.classList.contains("visible")) return;
      el.classList.add("visible");
    }
    function revealInViewport() {
      document.querySelectorAll(".reveal:not(.visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) activate(el);
      });
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          activate(entry.target);
          io.unobserve(entry.target);
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
    }
    var lastCheck = 0;
    window.addEventListener("scroll", function () {
      var now = Date.now();
      if (now - lastCheck < 100) return;
      lastCheck = now;
      revealInViewport();
    }, { passive: true });
    setTimeout(revealInViewport, 300);
    setTimeout(revealInViewport, 1200);
  }

  /* ---------- 9. 锚点跳转:交给原生 CSS(scroll-behavior: smooth + scroll-padding-top) ---------- */

  /* ---------- 10. 返回顶部 ---------- */
  backTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  });

  /* ---------- 11. 滚动词条:克隆一份实现无缝循环 ---------- */
  var tickerTrack = document.getElementById("tickerTrack");
  if (tickerTrack) tickerTrack.innerHTML += tickerTrack.innerHTML;

  /* ---------- 11.5 AllyOS 放映窗:进入视口自动静音播放,章节跳转,时间码 ---------- */
  (function initReel() {
    var reel = document.getElementById("reel");
    var video = document.getElementById("reelVideo");
    if (!reel || !video) return;
    var btn = document.getElementById("reelPlay");
    var tc = document.getElementById("reelTc");
    var fill = document.getElementById("reelFill");
    var chapterBtns = Array.prototype.slice.call(document.querySelectorAll("#reelChapters button"));
    var marks = chapterBtns.map(function (b) { return parseFloat(b.dataset.t); });
    var userPaused = false;
    var inView = false;

    function fmt(s) {
      s = Math.max(0, Math.floor(s || 0));
      return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
    }
    function sync() {
      var d = video.duration || 41;
      var t = video.currentTime || 0;
      tc.textContent = fmt(t) + " / " + fmt(d);
      fill.style.width = (t / d) * 100 + "%";
      var idx = 0;
      marks.forEach(function (m, i) { if (t >= m - 0.05) idx = i; });
      chapterBtns.forEach(function (b, i) { b.classList.toggle("on", i === idx); });
    }
    function play() {
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* 浏览器拒绝自动播放时保持海报帧 */ });
    }
    video.addEventListener("timeupdate", sync);
    video.addEventListener("loadedmetadata", sync);
    video.addEventListener("play", function () { reel.classList.add("is-playing"); });
    video.addEventListener("pause", function () { reel.classList.remove("is-playing"); });

    btn.addEventListener("click", function () {
      if (video.paused) { userPaused = false; play(); }
      else { userPaused = true; video.pause(); }
    });
    video.addEventListener("click", function () { btn.click(); });
    chapterBtns.forEach(function (b, i) {
      b.addEventListener("click", function () {
        video.currentTime = marks[i];
        userPaused = false;
        play();
        sync();
      });
    });

    // reduced-motion:不自动播放,只展示海报帧,由用户主动点播
    if (prefersReduced || !("IntersectionObserver" in window)) { sync(); return; }
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView && !userPaused) {
        video.preload = "auto";
        play();
      } else if (!inView) {
        video.pause();
      }
    }, { threshold: 0.45 }).observe(video);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) video.pause();
      else if (inView && !userPaused) play();
    });
    sync();
  })();

  /* ---------- 12. 磁性按钮(GSAP + 精确指针) ---------- */
  if (useGSAP && finePointer) {
    document.querySelectorAll(".btn-solid, .btn-line").forEach(function (btn) {
      var xTo = gsap.quickTo(btn, "x", { duration: 0.35, ease: "power3.out" });
      var yTo = gsap.quickTo(btn, "y", { duration: 0.35, ease: "power3.out" });
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.22);
        yTo((e.clientY - r.top - r.height / 2) * 0.32);
      });
      btn.addEventListener("mouseleave", function () { xTo(0); yTo(0); });
    });
  }

  /* ============================================================
     增强层 · Three.js
     ============================================================ */
  var PALETTE = {
    light: { ink: "#1d1a15", accent: "#b4432a", paper: "#f6f2ea" },
    dark: { ink: "#ece5d8", accent: "#d96a4a", paper: "#161310" }
  };
  function currentDark() { return root.getAttribute("data-theme") === "dark"; }

  /* ---------- 13. 首屏"墨浪"粒子场 ---------- */
  (function initInkField() {
    var host = document.getElementById("inkField");
    var hero = document.getElementById("hero");
    if (!host || !hero || !hasTHREE || prefersReduced || !isDesktop) return;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
    } catch (e) { return; }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    host.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10);
    var groups = [], accentGroup = null;
    var W = 1, H = 1;
    var running = true, inView = true;
    var t = 0;
    var clock = new THREE.Clock();
    var mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, energy: 0, te: 0 };
    var REP_R = 130, REP_R2 = REP_R * REP_R;

    var LAYERS = [
      { size: 1.15, alpha: 0.10, speed: 0.5,  amp: 15, gap: 26 },
      { size: 1.75, alpha: 0.16, speed: 0.85, amp: 22, gap: 36 },
      { size: 2.70, alpha: 0.25, speed: 1.2,  amp: 30, gap: 50 }
    ];

    function disposePoints(g) {
      if (!g) return;
      scene.remove(g.pts);
      g.geo.dispose();
      g.mat.dispose();
    }

    function build() {
      groups.forEach(disposePoints);
      disposePoints(accentGroup);
      groups = []; accentGroup = null;

      W = hero.clientWidth;
      H = hero.clientHeight;
      camera.right = W;
      camera.bottom = H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);

      var dark = currentDark();
      var inkHex = dark ? PALETTE.dark.ink : PALETTE.light.ink;

      LAYERS.forEach(function (L) {
        var cols = Math.max(8, Math.floor(W / L.gap));
        var rows = Math.max(4, Math.floor(H / 240));
        var n = cols * rows;
        var pos = new Float32Array(n * 3);
        var base = new Float32Array(n * 2);
        var phase = new Float32Array(n);
        var k = 0;
        for (var r = 0; r < rows; r++) {
          for (var c = 0; c < cols; c++) {
            var x = (c + 0.5) * L.gap + (r % 2) * (L.gap / 2);
            var y = (r + 0.5) * (H / rows);
            pos[k * 3] = x; pos[k * 3 + 1] = y; pos[k * 3 + 2] = 0;
            base[k * 2] = x; base[k * 2 + 1] = y;
            phase[k] = Math.random() * Math.PI * 2;
            k++;
          }
        }
        var geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        var mat = new THREE.PointsMaterial({
          size: L.size * Math.min(window.devicePixelRatio || 1, 2),
          transparent: true, opacity: L.alpha, color: inkHex, sizeAttenuation: false
        });
        var pts = new THREE.Points(geo, mat);
        pts.frustumCulled = false;
        scene.add(pts);
        groups.push({ pts: pts, geo: geo, mat: mat, base: base, phase: phase, n: n, L: L });
      });

      // 朱砂色稀疏粒子
      var an = Math.min(80, Math.floor((W * H) / 42000));
      if (an > 6) {
        var apos = new Float32Array(an * 3);
        var abase = new Float32Array(an * 2);
        var aphase = new Float32Array(an);
        for (var i = 0; i < an; i++) {
          var ax = Math.random() * W;
          var ay = Math.random() * H;
          apos[i * 3] = ax; apos[i * 3 + 1] = ay; apos[i * 3 + 2] = 0;
          abase[i * 2] = ax; abase[i * 2 + 1] = ay;
          aphase[i] = Math.random() * Math.PI * 2;
        }
        var ageo = new THREE.BufferGeometry();
        ageo.setAttribute("position", new THREE.BufferAttribute(apos, 3));
        var amat = new THREE.PointsMaterial({
          size: 2.4 * Math.min(window.devicePixelRatio || 1, 2),
          transparent: true, opacity: 0.55,
          color: dark ? PALETTE.dark.accent : PALETTE.light.accent,
          sizeAttenuation: false
        });
        var apts = new THREE.Points(ageo, amat);
        apts.frustumCulled = false;
        scene.add(apts);
        accentGroup = { pts: apts, geo: ageo, mat: amat, base: abase, phase: aphase, n: an };
      }
    }

    function frame() {
      requestAnimationFrame(frame);
      if (!running || !inView) return;
      t += clock.getDelta();
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      mouse.energy += (mouse.te - mouse.energy) * 0.05;

      groups.forEach(function (g) {
        var p = g.geo.attributes.position.array;
        for (var i = 0; i < g.n; i++) {
          var bx = g.base[i * 2], by = g.base[i * 2 + 1];
          var y = by
            + Math.sin(bx * 0.011 + t * g.L.speed + g.phase[i]) * g.L.amp
            + Math.cos(bx * 0.006 - t * g.L.speed * 0.6) * g.L.amp * 0.6;
          var dx = bx - mouse.x, dy = y - mouse.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < REP_R2 && mouse.energy > 0.02) {
            var d = Math.sqrt(d2) || 1;
            var f = (1 - d / REP_R) * 36 * mouse.energy;
            y -= (dy / d) * f;
          }
          p[i * 3] = bx;
          p[i * 3 + 1] = y;
        }
        g.geo.attributes.position.needsUpdate = true;
      });

      if (accentGroup) {
        var ap = accentGroup.geo.attributes.position.array;
        for (var j = 0; j < accentGroup.n; j++) {
          var abx = accentGroup.base[j * 2], aby = accentGroup.base[j * 2 + 1];
          ap[j * 3 + 1] = aby + Math.sin(t * 0.7 + accentGroup.phase[j]) * 14;
        }
        accentGroup.geo.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    }

    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      mouse.tx = e.clientX - r.left;
      mouse.ty = e.clientY - r.top;
      mouse.te = 1;
    });
    hero.addEventListener("pointerleave", function () { mouse.te = 0; });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
      }, { threshold: 0.02 }).observe(hero);
    }
    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) clock.getDelta();
    });

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 200);
    });

    window.addEventListener("themechange", function (e) {
      var dark = e.detail.dark;
      var inkHex = dark ? PALETTE.dark.ink : PALETTE.light.ink;
      groups.forEach(function (g) { g.mat.color.set(inkHex); });
    });

    build();
    frame();
  })();

  /* ---------- 14. 可拖拽旋转的 3D 朱砂印章 ---------- */
  (function initSeal3D() {
    var mount = document.getElementById("sealMount");
    if (!mount || !hasTHREE || prefersReduced || !isDesktop) return;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    var svg = mount.querySelector("svg");
    if (svg) svg.style.display = "none";
    mount.classList.add("is-3d");
    mount.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
    camera.position.set(0, 1.95, 2.05);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    var dl = new THREE.DirectionalLight(0xffffff, 0.5);
    dl.position.set(1.6, 2.2, 1.4);
    scene.add(dl);

    // 印面纹理:红底白框 + 竖排"刘星"
    var texCanvas = document.createElement("canvas");
    texCanvas.width = texCanvas.height = 512;
    var ctx = texCanvas.getContext("2d");
    ctx.fillStyle = "#b4432a";
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = "rgba(246,242,234,.85)";
    ctx.lineWidth = 13;
    ctx.strokeRect(36, 36, 440, 440);
    ctx.fillStyle = "#f6f2ea";
    ctx.textAlign = "center";
    ctx.font = '700 165px "Songti SC","STSong","Noto Serif CJK SC","SimSun",serif';
    ctx.fillText("刘", 256, 225);
    ctx.fillText("星", 256, 425);
    var tex = new THREE.CanvasTexture(texCanvas);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    var sideColor = 0x93321d;
    var materials = [
      new THREE.MeshLambertMaterial({ color: sideColor }),
      new THREE.MeshLambertMaterial({ color: sideColor }),
      new THREE.MeshLambertMaterial({ map: tex }),   // +Y 印面(朝上)
      new THREE.MeshLambertMaterial({ color: 0xb4432a }),
      new THREE.MeshLambertMaterial({ color: 0xa63a24 }),
      new THREE.MeshLambertMaterial({ color: sideColor })
    ];
    var mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 0.24, 1), materials);
    var group = new THREE.Group();
    group.add(mesh);
    scene.add(group);

    function resize() {
      var s = Math.max(56, mount.clientWidth || 72);
      renderer.setSize(s, s);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    // 拖拽旋转 + 惯性
    var dragging = false, lastX = 0, lastY = 0, velY = 0, tiltX = -0.5;
    var el = renderer.domElement;
    el.style.touchAction = "pan-y";
    el.style.cursor = "grab";
    el.addEventListener("pointerdown", function (e) {
      dragging = true;
      lastX = e.clientX; lastY = e.clientY;
      el.style.cursor = "grabbing";
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      velY = dx * 0.008;
      group.rotation.y += velY;
      tiltX = Math.max(-0.75, Math.min(0.15, tiltX + dy * 0.005));
    });
    function endDrag() {
      dragging = false;
      el.style.cursor = "grab";
    }
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);

    // 入场:盖章效果
    if (useGSAP) {
      gsap.from(group.scale, { x: 2.3, y: 2.3, z: 2.3, duration: 0.85, ease: "back.out(1.7)", delay: 0.55 });
      gsap.from(group.rotation, { y: -1.35, duration: 1.15, ease: "power3.out", delay: 0.5 });
    }

    var running = true, inView = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
      }, { threshold: 0.02 }).observe(mount);
    }
    document.addEventListener("visibilitychange", function () { running = !document.hidden; });

    var t0 = 0;
    (function frame() {
      requestAnimationFrame(frame);
      if (!running || !inView) return;
      var dt = 1 / 60;
      t0 += dt;
      if (!dragging) {
        group.rotation.y += 0.005 + velY;
        velY *= 0.94;
        group.rotation.x = tiltX;
        group.position.y = Math.sin(t0 * 1.1) * 0.04;
      } else {
        group.rotation.x += (tiltX - group.rotation.x) * 0.2;
      }
      renderer.render(scene, camera);
    })();
  })();

  /* ---------- 15. 页脚年份 / 刊头年份 ---------- */
  var nowYear = String(new Date().getFullYear());
  document.getElementById("year").textContent = nowYear;
  var mastheadYear = document.getElementById("mastheadYear");
  if (mastheadYear) mastheadYear.textContent = nowYear;
})();
