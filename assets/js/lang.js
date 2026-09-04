---
---
/* Language switcher.
   Setting <html lang> is what swaps the material world: CSS keys the Tang
   palace palette off html[lang="zh-Hans"] and the Japanese fonts off :lang.
   Text swaps come from the tables below; English restores the original DOM. */
(function () {
  var STORAGE_KEY = 'site.lang';
  var overlay = document.getElementById('lang-overlay');
  var toggle = overlay ? overlay.querySelector('.lang-toggle') : null;
  var toggleText = toggle ? toggle.querySelector('.lang-current') : null;
  var buttons = overlay ? Array.prototype.slice.call(overlay.querySelectorAll('.lang-option')) : [];

  var originalContent = {};

  var langLabels = { 'en': 'English', 'zh-Hans': '简体中文', 'ja': '日本語' };

  {% assign internal_link_prefix = 'href="' | append: site.baseurl | append: '/' %}
  var translations = {
    {% for language in site.data.translations %}
    {{ language[0] | jsonify }}: {
      {% for entry in language[1] %}
      {{ entry[0] | jsonify }}: {{ entry[1] | markdownify | remove: '<p>' | remove: '</p>' | replace: 'href="/', internal_link_prefix | strip | jsonify }}{% unless forloop.last %},{% endunless %}
      {% endfor %}
    }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  };

  function applyTranslations(code) {
    var table = translations[code];
    var nodes = document.querySelectorAll('[data-i18n]');
    Array.prototype.forEach.call(nodes, function (el) {
      var key = el.getAttribute('data-i18n');
      if (!key) return;
      /* UI that other scripts appended (collapse indicators) must survive
         the innerHTML swap — detach it, swap the text, put it back */
      var keep = el.querySelector('.collapse-indicator');
      if (keep) keep.remove();
      if (!(key in originalContent)) originalContent[key] = el.innerHTML;
      if (code === 'en' || !table) {
        el.innerHTML = originalContent[key];
      } else {
        var value = table[key];
        if (value !== undefined) {
          if (/<[^>]+>/.test(value)) { el.innerHTML = value; } else { el.textContent = value; }
        }
      }
      if (keep) el.appendChild(keep);
    });
  }

  function setActive(code) {
    document.documentElement.setAttribute('lang', code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) { /* private mode */ }
    applyTranslations(code);
    if (toggleText) toggleText.textContent = langLabels[code] || 'Language';
    try { window.dispatchEvent(new Event('site:langchange')); } catch (e) { /* old browsers */ }
    buttons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang') === code));
    });
  }

  function openOverlay() {
    if (!overlay) return;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
  }
  function closeOverlay() {
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      overlay.classList.contains('open') ? closeOverlay() : openOverlay();
    });
  }
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var code = btn.getAttribute('data-lang') || 'en';
      closeOverlay();
      if (code === document.documentElement.getAttribute('lang')) return;
      /* the world changes behind the sliding doors */
      if (typeof window.__doorCycle === 'function') {
        window.__doorCycle(function () { setActive(code); });
      } else {
        setActive(code);
      }
    });
  });
  document.addEventListener('click', function (e) {
    if (overlay && overlay.classList.contains('open') && !overlay.contains(e.target)) closeOverlay();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) {
      closeOverlay();
      if (toggle) toggle.focus();
    }
  });

  var initial = 'en';
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored && langLabels[stored]) initial = stored;
  } catch (e) { /* ok */ }
  setActive(initial);
})();
