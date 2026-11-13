/* ============================================================
   刘星 · 个人网站 v4 交互脚本 —— 零依赖,无任何 scroll 监听
   - 滚动永远是浏览器原生的;和滚动有关的一切都交给 IntersectionObserver
   - 动效只有入场淡入(CSS 控制,≤ 0.5s);系统开了"减少动态效果"就全部跳过
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* 1. 深浅色 */
  document.getElementById("themeToggle").addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  /* 2. 移动端菜单 */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("navMenu");
  function setMenu(open) {
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
  }
  burger.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* 3. 当前所在区块 → 导航高亮(观察区块进出视口中线,不读布局) */
  var links = {};
  Array.prototype.forEach.call(menu.querySelectorAll("a[href^='#']"), function (a) {
    links[a.getAttribute("href").slice(1)] = a;
  });
  if (hasIO) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(links).forEach(function (id) {
          if (id === en.target.id) links[id].setAttribute("aria-current", "true");
          else links[id].removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { spy.observe(s); });
  }

  /* 4. 入场淡入 */
  var reveals = document.querySelectorAll(".reveal");
  function showAll() { reveals.forEach(function (el) { el.classList.add("in"); }); }
  if (reduced || !hasIO) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    reveals.forEach(function (el) { io.observe(el); });
    setTimeout(showAll, 4000); // 兜底:任何意外情况下内容都会出现
  }

  /* 5. 短片:进入视口才加载并静音播放,离开就暂停;章节跳转 + 时间码 */
  (function reel() {
    var box = document.getElementById("reel");
    var video = document.getElementById("reelVideo");
    if (!box || !video) return;
    var btn = document.getElementById("reelPlay");
    var tc = document.getElementById("reelTc");
    var fill = document.getElementById("reelFill");
    var chapters = Array.prototype.slice.call(document.querySelectorAll("#reelChapters button"));
    var marks = chapters.map(function (b) { return parseFloat(b.dataset.t); });
    var userPaused = false, inView = false;

    function fmt(s) {
      s = Math.max(0, Math.floor(s || 0));
      return ("0" + Math.floor(s / 60)).slice(-2) + ":" + ("0" + (s % 60)).slice(-2);
    }
    function sync() {
      var d = video.duration || 41, t = video.currentTime || 0, idx = 0;
      tc.textContent = fmt(t) + " / " + fmt(d);
      fill.style.transform = "scaleX(" + Math.min(1, t / d) + ")";
      marks.forEach(function (m, i) { if (t >= m - 0.05) idx = i; });
      chapters.forEach(function (b, i) { b.classList.toggle("on", i === idx); });
    }
    function play() {
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* 浏览器拒绝自动播放:保留海报帧,等用户点 */ });
    }
    video.addEventListener("timeupdate", sync);
    video.addEventListener("loadedmetadata", sync);
    video.addEventListener("play", function () { box.classList.add("is-playing"); btn.setAttribute("aria-label", "暂停短片"); });
    video.addEventListener("pause", function () { box.classList.remove("is-playing"); btn.setAttribute("aria-label", "播放短片"); });
    btn.addEventListener("click", function () {
      if (video.paused) { userPaused = false; play(); } else { userPaused = true; video.pause(); }
    });
    video.addEventListener("click", function () { btn.click(); });
    chapters.forEach(function (b, i) {
      b.addEventListener("click", function () { video.currentTime = marks[i]; userPaused = false; play(); sync(); });
    });
    sync();

    if (reduced || !hasIO) return; // 不自动播放,只显示海报,用户点了才播
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView && !userPaused) play();
      else if (!inView) video.pause();
    }, { threshold: 0.5 }).observe(video);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) video.pause();
      else if (inView && !userPaused) play();
    });
  })();

  /* 6. 年份 */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
