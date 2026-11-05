(function () {
  var nav = document.querySelector('.nav');
  var menu = document.getElementById('mobile-menu');
  var toggle = document.querySelector('.nav-toggle');
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));

  function setStuck() {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 4);
  }

  setStuck();
  window.addEventListener('scroll', setStuck, { passive: true });

  function closeMenu() {
    if (!menu || !toggle) return;
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    Array.prototype.forEach.call(menu.querySelectorAll('a'), function (a) {
      a.addEventListener('click', closeMenu);
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

  updateActive();
  window.addEventListener('scroll', onSpyScroll, { passive: true });

  var form = document.getElementById('checklist-form');
  var status = document.getElementById('checklist-status');
  var mailLink = document.querySelector('a[href^="mailto:"]');
  var contactEmail = mailLink ? mailLink.getAttribute('href').slice(7) : '[your@email.com]';

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var field = form.querySelector('input[type="email"]');
      var email = field ? field.value.trim() : '';
      if (!email) return;

      var subject = encodeURIComponent('Private AI Readiness Checklist');
      var body = encodeURIComponent('Please send the Private AI Readiness Checklist to: ' + email);
      window.location.href = 'mailto:' + contactEmail + '?subject=' + subject + '&body=' + body;

      if (status) {
        status.hidden = false;
        status.textContent = 'Your email app should open with the request.';
      }
    });
  }
})();
