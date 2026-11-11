/* ============================================================
   个人简历网站交互脚本
   包含:主题切换 / 移动端菜单 / 滚动高亮 / 打字机效果 /
        数字滚动 / 滚动进入动画 / 返回顶部
   (主题的初始应用在 index.html 头部内联脚本中,避免闪烁)
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 1. 主题切换(初始值已由 head 内联脚本设置) ---------- */
  const root = document.documentElement;

  const themeToggle = document.getElementById("themeToggle");
  themeToggle.addEventListener("click", function () {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* ---------- 2. 导航栏:滚动加背景 ---------- */
  const navbar = document.getElementById("navbar");
  function onScrollNav() {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* ---------- 3. 移动端汉堡菜单 ---------- */
  const burger = document.getElementById("navBurger");
  const navMenu = document.getElementById("navMenu");
  burger.addEventListener("click", function () {
    const open = navMenu.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  // 点击菜单项后自动收起
  navMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navMenu.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- 4. 滚动高亮当前所在区块 ---------- */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  function scrollSpy() {
    const pos = window.scrollY + window.innerHeight / 3;
    let currentId = "hero";
    sections.forEach(function (sec) {
      if (pos >= sec.offsetTop) currentId = sec.id;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + currentId);
    });
  }
  window.addEventListener("scroll", scrollSpy, { passive: true });
  scrollSpy();

  /* ---------- 5. 打字机轮播效果 ---------- */
  // ✏️ 修改这里可以换轮播的职位头衔
  const TITLES = ["全栈工程师", "AI 应用工程师", "前端架构师", "多 Agent 系统构建者", "团队管理者"];
  const typedEl = document.getElementById("typed");
  let tIndex = 0, cIndex = 0, deleting = false;

  function typeLoop() {
    const word = TITLES[tIndex];
    typedEl.textContent = word.slice(0, cIndex);

    if (!deleting && cIndex < word.length) {
      cIndex++;
      setTimeout(typeLoop, 140);
    } else if (deleting && cIndex > 0) {
      cIndex--;
      setTimeout(typeLoop, 70);
    } else if (!deleting) {
      deleting = true;
      setTimeout(typeLoop, 1600);
    } else {
      deleting = false;
      tIndex = (tIndex + 1) % TITLES.length;
      setTimeout(typeLoop, 400);
    }
  }
  typeLoop();

  /* ---------- 6. 滚动进入动画(reveal)/ 数字滚动 ---------- */
  // 激活单个 reveal 元素(幂等),并触发其内部数字滚动
  function activate(el) {
    if (el.classList.contains("visible")) return;
    el.classList.add("visible");

    // 数字滚动(reveal 元素自身或其内部包含的 .stat-num 都会触发)
    el.querySelectorAll(".stat-num").forEach(function (numEl) {
      if (!numEl.dataset.count || numEl.dataset.done) return;
      numEl.dataset.done = "1";
      animateCount(numEl, parseInt(numEl.dataset.count, 10));
    });
  }

  // 主动检查视口内的待展示元素
  function revealInViewport() {
    document.querySelectorAll(".reveal:not(.visible)").forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
        activate(el);
      }
    });
  }

  // 主路径:IntersectionObserver
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          activate(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      observer.observe(el);
    });
  }

  // 兜底:页面加载后与滚动/缩放时主动检查,避免 IO 通知延迟导致内容停留隐藏态
  let lastCheck = 0;
  function onScrollReveal() {
    const now = Date.now();
    if (now - lastCheck < 100) return;
    lastCheck = now;
    revealInViewport();
  }
  window.addEventListener("scroll", onScrollReveal, { passive: true });
  window.addEventListener("resize", onScrollReveal, { passive: true });
  setTimeout(revealInViewport, 300);
  setTimeout(revealInViewport, 1200);

  function animateCount(el, target) {
    const duration = 1400;
    const start = performance.now();
    let finished = false;
    let lastFrame = 0;

    function render(p) {
      // easeOutQuart 缓动
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(target * eased).toLocaleString();
    }
    function finish() {
      if (finished) return;
      finished = true;
      render(1);
    }
    function tick(now) {
      if (finished) return;
      lastFrame = now;
      render(Math.min((now - start) / duration, 1));
      if (now - start < duration) requestAnimationFrame(tick);
      else finished = true;
    }
    requestAnimationFrame(tick);

    // 兜底:渲染帧被节流(如后台标签页)时,直接显示最终值
    setTimeout(function () {
      if (!finished && performance.now() - lastFrame > 250) finish();
    }, 400);
    setTimeout(finish, 2600);
  }

  /* ---------- 7. 返回顶部 ---------- */
  const backTop = document.getElementById("backTop");
  window.addEventListener(
    "scroll",
    function () {
      backTop.classList.toggle("show", window.scrollY > 500);
    },
    { passive: true }
  );
  backTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- 8. 页脚年份 / 刊头年份 ---------- */
  const nowYear = String(new Date().getFullYear());
  document.getElementById("year").textContent = nowYear;
  const mastheadYear = document.getElementById("mastheadYear");
  if (mastheadYear) mastheadYear.textContent = nowYear;
})();
