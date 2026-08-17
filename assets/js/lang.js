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

  var translations = {
    'zh-Hans': {
      'brand.subtitle': '数学专业博士生',
      'nav.home': '首页',
      'nav.research': '研究',
      'nav.teaching': '教学',
      'nav.notes': '笔记',
      'hero.intro.1': '你好！我是曾若凡，目前是西雅图华盛顿大学数学博士四年级的学生。我的导师是Jarod Alper和Sara Billey。我的研究方向是舒伯特演算、等变相交理论和模空间理论。我也热衷于数学形式化，以及用机器学习辅助数学发现。',
      'hero.intro.2': '我于 2023 年毕业于宾夕法尼亚大学，本科的专业是数学和语言学，同时获得了应用数学与计算机科学硕士学位。我喜欢打网球，打篮球，和学语言。',
      'hero.intro.news1': '自2026年6月起，我担任<a href="https://ai.math.uw.edu">华盛顿大学数学AI实验室</a>的代理主管。我们组织了<a href="https://uw2026leanhackathon.github.io/">2026年华盛顿大学Lean Hackathon</a>。自2026年夏起，我成为了<a href="https://www.simonsfoundation.org/grant/simons-dissertation-fellowship-in-mathematics/">Simons Dissertation Fellow</a>。2026年秋季学期我将访问加州大学伯克利分校。',
      'hero.photo.caption': '上海豫园 · Alex Waugh 拍摄',
      'footer.copyright': '© 曾若凡 · 2026 · 西雅图',
      'hero.contact.email.label': '邮箱',
      'hero.contact.email.value': 'zengrf at uw dot edu',
      'hero.contact.office.label': '办公室',
      'hero.contact.office.value': 'Padelford C-20，华盛顿大学西雅图校区',
      'hero.contact.cv.label': '简历',
      'hero.contact.cv.value': '<a href="/assets/pdf/Michael%20CV%20Aug%202026.pdf">下载简历（2026年8月）</a>',
      'hero.pronounce.title': '“曾若凡”的各种读音',
      'hero.pronounce.mandarin.label': '普通话',
      'hero.pronounce.mandarin.value': 'zēng（一声）— ruò（四声）— fán（二声）',
      'hero.pronounce.cantonese.label': '粤语',
      'hero.pronounce.cantonese.value': 'zang1 — joek6 — faan4',
      'hero.pronounce.japanese.label': '日语音读',
      'hero.pronounce.japanese.value': 'そう　sou — じゃく　jyaku — はん　han',
      'hero.pronounce.korean.label': '韩语',
      'hero.pronounce.korean.value': '증 jeung — 약 yak — 범 beom',
      'hero.pronounce.note': '',
      'hero.activity.title': '近期活动',
      'hero.activity.note': ''
    },
    'ja': {
      'brand.subtitle': '数学専攻の大学院生',
      'nav.home': 'ホーム',
      'nav.research': '研究',
      'nav.teaching': '教育',
      'nav.notes': 'ノート',
      'hero.intro.1': 'こんにちは！曽・マイケルと申します。ワシントン大学シアトル校で数学の博士課程４年生として学んでおります。ジャロッド・アルパー先生とサラ・ビリー先生のもとで、シューベルト・カルキュラス、同変交叉理論、モジュライ理論を中心に研究しております。数学の形式化や、機械学習による数学研究の支援にも関心があります。',
      'hero.intro.2': '2023年にペンシルベニア大学を卒業し、学士号は数学と言語学を専攻、修士号は応用数学とコンピュータサイエンスでした。趣味はテニス、バスケットボールと言語の勉強です。',
      'hero.intro.news1': '2026年6月より、<a href="https://ai.math.uw.edu">ワシントン大学数学AIラボ</a>の所長代理を務めています。<a href="https://uw2026leanhackathon.github.io/">UW 2026 Lean ハッカソン</a>を主催しました。2026年夏からは<a href="https://www.simonsfoundation.org/grant/simons-dissertation-fellowship-in-mathematics/">サイモンズ博士論文フェロー</a>です。2026年秋学期はカリフォルニア大学バークレー校に滞在します。',
      'hero.photo.caption': '上海・豫園にて · 撮影：Alex Waugh',
      'footer.copyright': '© 曽若凡 · 2026 · シアトル',
      'hero.contact.email.label': 'メール',
      'hero.contact.email.value': 'zengrf at uw dot edu',
      'hero.contact.office.label': '研究室',
      'hero.contact.office.value': 'Padelford C-20（ワシントン大学シアトル校）',
      'hero.contact.cv.label': '履歴書',
      'hero.contact.cv.value': '<a href="/assets/pdf/Michael%20CV%20Aug%202026.pdf">履歴書をダウンロード（2026年8月）</a>',
      'hero.pronounce.title': '名前の読み方',
      'hero.pronounce.mandarin.label': '中国語（北京語）',
      'hero.pronounce.mandarin.value': 'zēng（一声）— ruò（四声）— fán（二声）',
      'hero.pronounce.cantonese.label': '中国語（広東語）',
      'hero.pronounce.cantonese.value': 'zang1 — joek6 — faan4',
      'hero.pronounce.japanese.label': '日本語音読み',
      'hero.pronounce.japanese.value': '曽　そう — 若　じゃく — 凡　はん',
      'hero.pronounce.korean.label': '韓国語',
      'hero.pronounce.korean.value': '증 jeung — 약 yak — 범 beom',
      'hero.activity.title': '最近の予定'
    }
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
