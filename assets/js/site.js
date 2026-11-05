(function () {
  var nav = document.querySelector('.nav');
  var menus = Array.prototype.slice.call(document.querySelectorAll('.mobile-menu'));
  var toggle = document.querySelector('.nav-toggle');
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var langToggle = document.getElementById('lang-toggle');

  function setStuck() {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 4);
  }

  setStuck();
  window.addEventListener('scroll', setStuck, { passive: true });

  var menuOpen = false;

  function closeMenu() {
    if (!menus.length || !toggle) return;
    menuOpen = false;
    menus.forEach(function (menu) {
      menu.classList.remove('is-open');
    });
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  if (toggle && menus.length) {
    toggle.addEventListener('click', function () {
      menuOpen = !menuOpen;
      menus.forEach(function (menu) {
        menu.classList.toggle('is-open', menuOpen);
      });
      toggle.setAttribute('aria-expanded', menuOpen ? 'true' : 'false');
      toggle.setAttribute('aria-label', menuOpen ? 'Close menu' : 'Open menu');
    });

    menus.forEach(function (menu) {
      Array.prototype.forEach.call(menu.querySelectorAll('a'), function (a) {
        a.addEventListener('click', closeMenu);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  var targets = links
    .map(function (link) {
      return document.querySelector(link.getAttribute('href'));
    })
    .filter(Boolean);

  var spyFrame = 0;

  function updateActive() {
    spyFrame = 0;
    var current = '';
    targets.forEach(function (target) {
      if (target.offsetParent === null) return;
      if (target.getBoundingClientRect().top <= 140) current = target.id;
    });
    links.forEach(function (link) {
      link.classList.toggle('is-active', current !== '' && link.getAttribute('href') === '#' + current);
    });
  }

  function onSpyScroll() {
    if (spyFrame) return;
    spyFrame = window.requestAnimationFrame(updateActive);
  }

  window.addEventListener('scroll', onSpyScroll, { passive: true });

  var currentLang = 'en';

  try {
    if (localStorage.getItem('lang') === 'zh') currentLang = 'zh';
  } catch (e) {
    currentLang = 'en';
  }

  function applyLang(lang, persist) {
    currentLang = lang;
    var zh = lang === 'zh';

    document.documentElement.lang = zh ? 'zh-CN' : 'en';
    document.title = zh
      ? '[Your Name] — 为中小企业提供 AI 落地实施'
      : '[Your Name] — AI implementation for small and mid-sized businesses';

    var meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', zh
        ? '我让 AI 真正走进你的业务——私密运行，并接入你已经在用的工具。为中小型团队提供私有 AI、内部智能体和自定义系统。'
        : 'I put AI to work inside your business — privately, and wired into the tools you already use. Private AI, internal agents and custom systems for teams of 10–200.');
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-lang]'), function (el) {
      el.hidden = el.getAttribute('data-lang') !== lang;
    });

    if (langToggle) {
      langToggle.textContent = zh ? 'EN' : '中文';
      langToggle.setAttribute('aria-label', zh ? 'Switch to English' : 'Switch to Chinese');
    }

    closeMenu();
    updateActive();

    if (persist) {
      try {
        localStorage.setItem('lang', lang);
      } catch (e) {
        // Storage can be unavailable in private mode; the switch still works.
      }
    }
  }

  if (langToggle) {
    langToggle.addEventListener('click', function () {
      applyLang(currentLang === 'zh' ? 'en' : 'zh', true);
    });
  }

  applyLang(currentLang, false);

  function getContactEmail() {
    var mailLinks = Array.prototype.slice.call(document.querySelectorAll('a[href^="mailto:"]'));
    for (var i = 0; i < mailLinks.length; i++) {
      if (mailLinks[i].offsetParent !== null) {
        return mailLinks[i].getAttribute('href').slice(7);
      }
    }
    return mailLinks.length ? mailLinks[0].getAttribute('href').slice(7) : '[your@email.com]';
  }

  Array.prototype.forEach.call(document.querySelectorAll('.checklist-form'), function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var field = form.querySelector('input[type="email"]');
      var email = field ? field.value.trim() : '';
      if (!email) return;

      var zh = currentLang === 'zh';
      var subject = encodeURIComponent(zh ? '私有 AI 就绪清单' : 'Private AI Readiness Checklist');
      var body = encodeURIComponent(
        (zh ? '请把《私有 AI 就绪清单》发送到：' : 'Please send the Private AI Readiness Checklist to: ') + email
      );

      window.location.href = 'mailto:' + getContactEmail() + '?subject=' + subject + '&body=' + body;

      var status = form.parentNode.querySelector('.magnet-status');
      if (status) {
        status.hidden = false;
        status.textContent = zh
          ? '邮件客户端应该已打开，请发送这封邮件。'
          : 'Your email app should open with the request.';
      }
    });
  });
})();
