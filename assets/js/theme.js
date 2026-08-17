/* Time-of-day theme
   Modes: auto (follows the visitor's clock) → day → dusk → night → auto…
   The <head> bootstrap sets data-time before first paint; this file keeps
   it current and wires the toggle button. Icons are inline SVG drawn in the
   same engraved register as the eave roundels (no unicode glyphs). */
(function () {
  var KEY = 'site.time-theme';
  var MODES = ['auto', 'day', 'dusk', 'night'];

  /* auto = a mitsudomoe (the turning cycle), day = sun disc with rays,
     dusk = sun on the horizon, night = crescent */
  var SVG_OPEN = '<svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">';
  var ICONS = {
    auto: '<svg viewBox="0 0 387.9 389.2" aria-hidden="true" focusable="false"><path d="M 164.4,387.2 C 153.2,385.4 149.9,384.6 137.4,381.0 C 104.5,371.6 71.2,349.8 47.0,321.8 C 32.6,305.1 20.6,285.5 18.8,276.0 C 14.1,250.2 16.2,223.1 24.0,207.8 C 35.5,185.5 53.6,169.5 76.2,161.6 C 86.2,158.1 104.8,157.3 116.9,159.7 C 127.0,161.8 139.3,166.2 145.8,169.9 C 154.3,174.9 165.3,184.2 170.6,190.9 C 177.2,199.3 184.2,213.3 187.1,224.3 C 188.9,231.1 189.3,235.3 189.3,246.3 C 189.3,258.2 189.0,260.8 186.5,268.7 C 185.0,273.7 182.4,280.3 180.8,283.4 C 177.4,290.3 168.8,301.9 164.8,305.1 C 160.4,308.6 161.1,310.5 168.6,316.6 C 187.0,331.3 210.7,341.3 233.9,344.2 C 245.9,345.7 265.9,345.5 275.9,343.8 C 301.1,339.5 329.2,326.2 345.6,310.9 C 352.5,304.5 353.6,304.6 348.7,311.4 C 323.0,347.2 279.2,375.4 234.4,384.8 C 211.5,389.7 184.9,390.6 164.4,387.2 z M 276.4,328.3 C 260.1,326.2 241.2,317.6 229.8,307.1 C 222.6,300.6 212.9,288.2 209.4,281.3 C 200.4,263.4 198.9,239.2 205.4,216.8 C 210.2,200.3 223.2,182.7 237.4,173.8 C 240.7,171.7 244.5,169.2 245.9,168.2 C 247.4,167.3 252.8,164.9 258.1,162.9 C 272.6,157.5 292.0,156.3 308.0,159.9 C 311.3,160.6 311.7,159.7 313.2,146.6 C 315.2,128.4 311.5,102.9 304.3,85.3 C 295.1,62.5 281.7,44.3 264.6,30.9 C 254.0,22.8 237.7,12.1 228.9,7.7 C 216.9,1.7 218.7,0.8 235.7,4.7 C 279.5,14.7 318.3,39.0 345.9,73.8 C 378.0,114.3 393.8,172.1 385.9,220.8 C 381.4,248.9 371.3,278.1 362.7,287.9 C 360.9,290.0 357.7,293.9 355.6,296.4 C 349.7,303.9 335.2,315.4 325.9,320.0 C 321.2,322.4 313.8,325.2 309.4,326.3 C 300.4,328.6 285.4,329.5 276.4,328.3 z M 13.2,264.7 C 10.9,260.7 4.9,239.2 2.8,227.5 C -6.5,175.5 7.4,119.2 40.0,76.2 C 75.2,29.7 132.1,0.9 190.4,0.1 C 202.2,-0.1 202.5,-0.1 213.9,4.1 C 226.3,8.7 230.9,11.1 240.6,18.0 C 253.3,27.0 267.2,45.1 272.4,59.6 C 273.7,63.1 275.5,70.8 276.5,76.7 C 278.0,85.8 278.1,88.8 277.1,97.1 C 275.6,109.8 270.9,125.3 266.0,133.9 C 258.9,146.1 239.5,162.6 225.3,168.6 C 218.1,171.6 203.8,174.9 194.4,175.8 C 182.1,177.0 161.5,172.0 148.4,164.7 C 128.9,153.8 112.0,132.5 107.8,113.6 C 107.1,110.6 105.8,107.8 104.9,107.3 C 101.6,105.5 72.0,121.6 63.0,130.2 C 61.1,131.9 57.3,135.4 54.6,137.8 C 45.2,146.3 32.0,164.5 26.3,176.8 C 22.8,184.4 18.5,196.9 16.8,204.2 C 13.5,218.7 12.0,244.7 13.9,252.5 C 14.5,254.9 14.9,259.1 14.7,261.8 C 14.4,266.2 14.3,266.5 13.2,264.7 z"/></svg>',
    day: SVG_OPEN +
      '<circle cx="7" cy="7" r="2.9"/>' +
      '<g stroke="currentColor" stroke-width="1.5" stroke-linecap="round">' +
      '<path d="M7 0.7V2.4M7 11.6v1.7M0.7 7h1.7M11.6 7h1.7M2.55 2.55l1.2 1.2M10.25 10.25l1.2 1.2M11.45 2.55l-1.2 1.2M3.75 10.25l-1.2 1.2"/></g></svg>',
    dusk: SVG_OPEN +
      '<path d="M2.6 8.2a4.4 4.4 0 0 1 8.8 0z"/>' +
      '<path d="M1 10.6h12M3.2 12.6h7.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>',
    night: SVG_OPEN +
      '<path d="M9.6 1.8A5.6 5.6 0 1 0 9.6 12.2 4.5 4.5 0 0 1 9.6 1.8Z"/></svg>'
  };

  var LABELS = {
    'en': { auto: 'auto', day: 'day', dusk: 'dusk', night: 'night' },
    'zh-Hans': { auto: '自动', day: '昼', dusk: '暮', night: '夜' },
    'ja': { auto: '自動', day: '昼', dusk: '夕', night: '夜' }
  };

  var mode = 'auto';

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

  function labelSet() {
    var lang = document.documentElement.getAttribute('lang') || 'en';
    return LABELS[lang] || LABELS.en;
  }

  function apply() {
    var t = mode === 'auto' ? byClock() : mode;
    document.documentElement.setAttribute('data-time', t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content',
        t === 'night' ? '#0c0906' : t === 'dusk' ? '#3e2a17' : '#4c3520');
    }
    var btn = document.querySelector('.time-toggle');
    if (btn) {
      var L = labelSet();
      var icon = btn.querySelector('.time-icon');
      if (icon) icon.innerHTML = ICONS[mode];
      btn.setAttribute('aria-label',
        'Theme: ' + L[mode] + (mode === 'auto' ? ' (' + L[t] + ')' : '') + '. Click to change.');
      btn.title = L[mode] + (mode === 'auto' ? ' · ' + L[t] : '');
    }
  }

  function init() {
    mode = stored();
    apply();
    var btn = document.querySelector('.time-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
        try { localStorage.setItem(KEY, mode); } catch (e) { /* ok */ }
        apply();
      });
    }
    /* keep auto honest as the hour turns; relabel when the language flips */
    setInterval(function () { if (mode === 'auto') apply(); }, 60000);
    window.addEventListener('site:langchange', apply);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
