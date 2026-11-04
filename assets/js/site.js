/* =========================================================
   LX — site interactions
   Language switch · navigation · reveal · contact form
   ========================================================= */
(function () {
  "use strict";

  /* --- Site config: change these in one place --- */
  var SITE = {
    email: "hello@lx.dev",
    wechat: "lx-dev",
    whatsapp: "https://wa.me/8613800000000",
    booking: "https://cal.com/lx/intro"
  };

  var STORAGE_KEY = "lx-lang";
  var lang = null;

  try {
    lang = window.localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    lang = null;
  }

  if (lang !== "zh" && lang !== "en") {
    var browserLang = (navigator.language || navigator.userLanguage || "zh").toLowerCase();
    lang = browserLang.indexOf("zh") === 0 ? "zh" : "en";
  }

  function applyLang(next) {
    lang = next === "en" ? "en" : "zh";
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";

    document.querySelectorAll("[data-zh]").forEach(function (el) {
      var value = el.getAttribute("data-" + lang);
      if (!value) return;

      if (el.tagName === "TITLE") {
        document.title = value;
      } else if (el.tagName === "META") {
        el.setAttribute("content", value);
      } else {
        el.innerHTML = value;
      }
    });

    document.querySelectorAll("[data-zh-ph]").forEach(function (el) {
      var value = el.getAttribute("data-" + lang + "-ph");
      if (value) el.setAttribute("placeholder", value);
    });

    document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
      btn.setAttribute(
        "aria-label",
        lang === "zh" ? "Switch to English" : "切换到中文"
      );
    });

    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* storage disabled — no problem */
    }
  }

  applyLang(lang);

  /* --- Sticky nav --- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-stuck", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* --- Active nav link --- */
  var page = (window.location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "");
  document.querySelectorAll(".nav-link").forEach(function (link) {
    var href = (link.getAttribute("href") || "").replace(/\.html$/, "");
    if (href === page || (page === "index" && href === "index")) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });

  /* --- Mobile menu --- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".mobile-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("is-open", !open);
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
      });
    });
  }

  /* --- Language toggle --- */
  document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLang(lang === "zh" ? "en" : "zh");
    });
  });

  /* --- Reveal on scroll --- */
  var revealItems = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach(function (el) {
      el.classList.add("is-in");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    revealItems.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* --- Footer year --- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* --- Contact form → mailto draft (static, no backend) --- */
  var form = document.querySelector("#contact-form");
  if (form) {
    var message = form.querySelector(".form-message");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var data = new FormData(form);
      var name = (data.get("name") || "").trim();
      var email = (data.get("email") || "").trim();
      var company = (data.get("company") || "").trim();
      var type = (data.get("type") || "").trim();
      var budget = (data.get("budget") || "").trim();
      var timeline = (data.get("timeline") || "").trim();
      var brief = (data.get("message") || "").trim();

      var isZh = lang === "zh";
      var problem = "";

      if (!name) problem = isZh ? "请填写你的名字。" : "Please add your name.";
      else if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        problem = isZh ? "请填写有效的邮箱地址。" : "Please add a valid email address.";
      } else if (!brief) {
        problem = isZh ? "用一两句话说说你想解决的问题。" : "Tell me briefly what you want to solve.";
      }

      if (!message) return;

      if (problem) {
        message.textContent = problem;
        message.classList.add("is-error", "is-visible");
        return;
      }

      var subject =
        (isZh ? "【项目咨询】" : "[Project inquiry] ") +
        name +
        (type ? " · " + type : "");

      var lines = isZh
        ? [
            "你好 LX，",
            "",
            "我在你的网站上看到了你的服务，想聊聊一个项目。",
            "",
            "名字：" + name,
            "公司：" + (company || "—"),
            "邮箱：" + email,
            "项目类型：" + (type || "—"),
            "预算范围：" + (budget || "—"),
            "期望时间：" + (timeline || "—"),
            "",
            "想解决的问题：",
            brief,
            "",
            "谢谢。"
          ]
        : [
            "Hi LX,",
            "",
            "I found your site and would like to talk about a project.",
            "",
            "Name: " + name,
            "Company: " + (company || "—"),
            "Email: " + email,
            "Project type: " + (type || "—"),
            "Budget: " + (budget || "—"),
            "Timeline: " + (timeline || "—"),
            "",
            "What I am trying to solve:",
            brief,
            "",
            "Thanks."
          ];

      var url =
        "mailto:" +
        SITE.email +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(lines.join("\r\n"));

      window.location.href = url;

      message.textContent = isZh
        ? "已打开你的邮件客户端并填好内容。如果没有反应，可以直接发邮件到 " + SITE.email + "。"
        : "Your email app should open with the details filled in. If nothing happens, email " + SITE.email + " directly.";
      message.classList.remove("is-error");
      message.classList.add("is-visible");
    });
  }
})();
