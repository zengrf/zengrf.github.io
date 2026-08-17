/* Miyabi time-of-day theme
   Modes: auto (follows the visitor's clock) → day → dusk → night → auto…
   The <head> bootstrap sets data-time before first paint; this file keeps
   it current and wires the toggle button. */
(function () {
  var KEY = 'site.time-theme';
  var MODES = ['auto', 'day', 'dusk', 'night'];
  var ICONS = { auto: '✽', day: '☀︎', dusk: '◒', night: '☾' };
  var LABEL = { auto: 'auto', day: 'day', dusk: 'dusk', night: 'night' };

  function byClock() {
    var h = new Date().getHours() + new Date().getMinutes() / 60;
    if (h >= 7 && h < 16) return 'day';
    if ((h >= 16 && h < 19.5) || (h >= 5 && h < 7)) return 'dusk';
    return 'night';
  }

  function stored() {
    try {
      var v = localStorage.getItem(KEY);
      return MODES.indexOf(v) >= 0 ? v : 'auto';
    } catch (e) { return 'auto'; }
  }

  function apply(mode) {
    var t = mode === 'auto' ? byClock() : mode;
    document.documentElement.setAttribute('data-time', t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content',
        t === 'night' ? '#0c0906' : t === 'dusk' ? '#3e2a17' : '#4c3520');
    }
    var btn = document.querySelector('.time-toggle');
    if (btn) {
      var icon = btn.querySelector('.time-icon');
      var text = btn.querySelector('.time-label');
      if (icon) icon.textContent = ICONS[mode];
      if (text) text.textContent = LABEL[mode] + (mode === 'auto' ? ' · ' + t : '');
      btn.setAttribute('aria-label',
        'Theme: ' + LABEL[mode] + (mode === 'auto' ? ' (currently ' + t + ')' : '') +
        '. Click to change.');
    }
  }

  function init() {
    var mode = stored();
    apply(mode);
    var btn = document.querySelector('.time-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
        try { localStorage.setItem(KEY, mode); } catch (e) { /* ok */ }
        apply(mode);
      });
    }
    /* keep auto mode honest as the hour turns */
    setInterval(function () { if (mode === 'auto') apply(mode); }, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
