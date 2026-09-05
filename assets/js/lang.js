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

  var originalContent = new WeakMap();
  var originalLabels = new WeakMap();

  var langLabels = { 'en': 'English', 'zh-Hans': '简体中文', 'ja': '日本語' };

  {% assign internal_link_prefix = 'href="' | append: site.baseurl | append: '/' %}
  var translations = {
    {% for language in site.data.translations %}
    {{ language[0] | jsonify }}: {
      {% for entry in language[1] %}
      {{ entry[0] | jsonify }}: {{ entry[1] | markdownify | replace: 'href="/', internal_link_prefix | strip | jsonify }}{% unless forloop.last %},{% endunless %}
      {% endfor %}
    }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  };

  function applyTranslations(code) {
    var table = translations[code];
    var nodes = document.querySelectorAll('[data-i18n]');
    var math = window.MathJax;
    if (math && math.typesetClear) math.typesetClear(Array.from(nodes));
    Array.prototype.forEach.call(nodes, function (el) {
      var key = el.getAttribute('data-i18n');
      if (!key) return;
      /* UI that other scripts appended (collapse indicators) must survive
         the innerHTML swap — detach it, swap the text, put it back */
      var keep = el.querySelector('.collapse-indicator');
      if (keep) keep.remove();
      if (!originalContent.has(el)) originalContent.set(el, el.innerHTML);
      if (code === 'en' || !table || table[key] === undefined) {
        el.innerHTML = originalContent.get(el);
      } else {
        var fragment = document.createElement('div');
        fragment.innerHTML = table[key];
        var first = fragment.firstElementChild;
        var value = table[key];
        // A Markdown paragraph fits inside a heading or caption; a translated
        // list supplies the items of the existing list, preserving its hooks.
        if (fragment.childElementCount === 1 && first &&
            ((first.tagName === 'P' && el.tagName !== 'DIV') || first.tagName === el.tagName)) {
          value = first.innerHTML;
        }
        if (el.hasAttribute('data-i18n-summary')) {
          var plain = fragment.textContent.trim();
          el.textContent = plain.length > 200 ? plain.slice(0, 197) + '...' : plain;
        } else {
          el.innerHTML = value;
        }
      }
      if (keep) el.appendChild(keep);
    });
    document.querySelectorAll('[data-i18n-aria], [data-i18n-alt]').forEach(function (el) {
      var attr = el.hasAttribute('data-i18n-alt') ? 'alt' : 'aria-label';
      var key = el.getAttribute(attr === 'alt' ? 'data-i18n-alt' : 'data-i18n-aria');
      if (!originalLabels.has(el)) originalLabels.set(el, el.getAttribute(attr));
      if (table && table[key] !== undefined) {
        var fragment = document.createElement('div');
        fragment.innerHTML = table[key];
        el.setAttribute(attr, fragment.textContent.trim());
      } else {
        el.setAttribute(attr, originalLabels.get(el));
      }
    });
    document.querySelectorAll('time[data-local-date]').forEach(function (el) {
      if (!originalContent.has(el)) originalContent.set(el, el.innerHTML);
      el.textContent = code === 'en' ? originalContent.get(el) :
        new Intl.DateTimeFormat(code, { year: 'numeric', month: 'long', day: 'numeric',
          timeZone: {{ site.timezone | jsonify }} }).format(new Date(el.dateTime));
    });
    if (math && math.typesetPromise) {
      math.typesetPromise(Array.from(nodes)).catch(function (error) {
        console.error('Could not typeset translated mathematics:', error);
      });
    }
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
