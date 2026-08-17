(function(){
  const STORAGE_KEY = 'site.lang';
  const overlay = document.getElementById('lang-overlay');
  const toggle = overlay ? overlay.querySelector('.lang-toggle') : null;
  const toggleText = toggle ? toggle.querySelector('.lang-current') : null;
  const languageButtons = overlay ? Array.from(overlay.querySelectorAll('.lang-option')) : [];

  // Store original English content
  const originalContent = new Map();

  const langLabels = {
    'en': 'English',
    'zh-Hans': '简体中文',
    'ja': '日本語'
  };

  const translations = {
    'zh-Hans': {
      'brand.subtitle': '数学专业博士生',
      'nav.home': '首页',
      'nav.research': '研究',
      'nav.teaching': '教学',
      'nav.notes': '笔记',
      'nav.ogura': '小仓色纸',
      'home.greeting': '你好！',
      'hero.subtitle': '数学专业博士生',
      'hero.intro.1': '你好！我是曾若凡，目前是西雅图华盛顿大学数学博士四年级的学生。我的导师是Jarod Alper和Sara Billey。我的研究方向是代数几何，代数组合，和叠理论。',
      'hero.intro.2': '我于 2023 年毕业于宾夕法尼亚大学，本科的专业是数学和语言学。我同时也获得了应用数学与计算机科学硕士学位。我喜欢打网球，打篮球，和学语言。',
      'hero.contact.email.label': '邮箱',
      'hero.contact.email.value': 'zengrf at uw dot edu',
      'hero.contact.office.label': '办公室',
      'hero.contact.office.value': 'Padelford C-20',
      'hero.contact.cv.label': '简历',
      'hero.contact.cv.value': '<a href="/Michael%20CV%20Sep%202025.pdf">下载</a>',
      'hero.pronounce.title': '《曾若凡》的各种读音',
      'hero.pronounce.mandarin.label': '普通话',
      'hero.pronounce.mandarin.value': 'zēng（一声）— ruò（四声）— fán（二声）',
      'hero.pronounce.cantonese.label': '粤语',
      'hero.pronounce.cantonese.value': 'zang1 — joek6 — faan4',
      'hero.pronounce.japanese.label': '日语音读',
      'hero.pronounce.japanese.value': 'そう　sou —　じゃく jyaku — はん　han',
      'hero.pronounce.korean.label': '韩语',
      'hero.pronounce.korean.value': '증 jeung — 약 yak — 범 beom',
      'hero.pronounce.note': '',
      'hero.activity.title': '近期活动',
      'hero.activity.note': ''
    },
    ja: {
      'brand.subtitle': '数学専攻の大学院生',
      'nav.home': 'ホーム',
      'nav.research': '研究',
      'nav.teaching': '教育',
      'nav.notes': 'ノート',
      'nav.ogura': '小倉色紙',
      'home.greeting': 'こんにちは！',
      'hero.subtitle': '数学科博士課程四年生',
      'hero.intro.1': 'こんにちは！曽・マイケルと申します。ワシントン大学シアトル校で数学の博士課程４年生として学んでおります。ジャロッド・アルパー先生とサラ・ビリー先生と共に、代数幾何学、代数的組み合わせ論とスタック論を中心に研究しております。',
      'hero.intro.2': '2023年にペンシルベニア大学を卒業し、学士号は数学と言語学を専攻、修士号は応用数学とコンピュータサイエンスでした。趣味はテニス、バスケットボールと言語の勉強です。',
      'hero.contact.email.label': 'メール',
      'hero.contact.email.value': 'zengrf at uw dot edu',
      'hero.contact.office.label': '研究室',
      'hero.contact.office.value': 'Padelford C-20',
      'hero.contact.cv.label': '履歴書',
      'hero.contact.cv.value': '<a href="/Michael%20CV%20Sep%202025.pdf">履歴書をダウンロード</a>',
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
    const table = translations[code];
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (!key) return;
      
      // Store original content on first translation (if not already stored)
      if (!originalContent.has(key)) {
        originalContent.set(key, el.innerHTML);
      }
      
      // For English, restore original content
      if (code === 'en' || !table) {
        el.innerHTML = originalContent.get(key);
        return;
      }
      
      // For other languages, apply translation
      const value = table[key];
      if (!value) return;
      if (/<[^>]+>/.test(value)) {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    });
  }

  function setActive(code) {
    // Update current language display in toggle button
    if (toggleText) {
      toggleText.textContent = langLabels[code] || 'Language';
    }
    
    // Update which option is current (hidden)
    languageButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const newLang = btn.dataset.lang;
        if (newLang !== document.documentElement.getAttribute('lang')) {
          setActive(newLang);
        }
        closeOverlay();
      });
    });
  }

  // Always apply translations regardless of UI elements
  let initialLang = 'en';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) initialLang = stored;
  } catch (err) {
    console.warn('Unable to read stored language preference', err);
  }
  
  // Only validate against available language buttons if they exist
  if (languageButtons.length > 0) {
    const known = languageButtons.map(btn => btn.dataset.lang);
    if (!known.includes(initialLang)) initialLang = 'en';
  }
  
  setActive(initialLang);
})();
