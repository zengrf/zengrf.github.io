(function(){
  const STORAGE_KEY = 'site.lang';
  const overlay = document.getElementById('lang-overlay');
  const toggle = overlay ? overlay.querySelector('.lang-toggle') : null;
  const toggleText = toggle ? toggle.querySelector('.lang-current') : null;
  const languageButtons = overlay ? Array.from(overlay.querySelectorAll('.lang-option')) : [];

  const langLabels = {
    'en': 'English',
    'zh-Hans': '简体中文',
    'ja': '日本語'
  };

  const translations = {
    en: {
      'brand.subtitle': 'Graduate student in mathematics',
      'nav.home': 'Home',
      'nav.research': 'Research',
      'nav.teaching': 'Teaching',
      'nav.notes': 'Notes',
      'nav.ogura': '小倉色紙',
      'nav.cv': 'CV',
      'lang.title': 'Select language',
      'lang.close': 'Close',
      'lang.button': 'Language',
      'home.greeting': 'Hi there!',
      'home.intro_html': 'I am a second-year Ph.D. student in mathematics at the University of Washington, Seattle. I work with <a href="https://math.washington.edu/people/jarod-alper">Jarod Alper</a> and <a href="https://math.washington.edu/people/sara-billey">Sara Billey</a>. I am interested in the intersection of algebraic geometry, homotopy theory, and combinatorics. Recently, I became interested in visualizing mathematics using 3D printing.',
      'home.cta_notes': 'Open Notes hub',
      'home.cta_notes_desc': 'Blog posts, PDF snippets, and interactive demos.',
      'home.ext_demo': 'Sage/Macaulay2 tutorial',
      'home.jl_html': '<strong>JupyterLite (optional)</strong><br>If you add a <code>jupyterlite/</code> build to the repo root, it appears below automatically.',
      'hero.subtitle': 'Graduate student in mathematics',
      'hero.intro.1': 'Hi there! I am a second-year Ph.D. student in mathematics at the University of Washington, Seattle. I work with <a href="https://math.washington.edu/people/jarod-alper">Jarod Alper</a> and <a href="https://math.washington.edu/people/sara-billey">Sara Billey</a>. I am interested in the intersection of algebraic geometry, homotopy theory, and combinatorics. Recently, I became interested in visualizing mathematics using 3D printing.',
      'hero.intro.2': 'I completed my undergraduate studies at the University of Pennsylvania in 2023, double-majoring in mathematics and linguistics, and received an M.A. in Applied Math & Computer Science. Outside of mathematics, you will often find me on the tennis or basketball court, or diving into a new language.',
      'hero.contact.email.label': 'Email',
      'hero.contact.email.value': '<a href="mailto:zengrf@uw.edu">zengrf@uw.edu</a>',
      'hero.contact.office.label': 'Office',
      'hero.contact.office.value': 'Padelford C-20, UW Seattle',
      'hero.contact.cv.label': 'CV',
      'hero.contact.cv.value': '<a href="/Michael%20CV%20Sep%202025.pdf">Download curriculum vitae</a>',
      'hero.pronounce.title': 'How to pronounce my name',
      'hero.pronounce.mandarin.label': 'Mandarin',
      'hero.pronounce.mandarin.value': 'zēng (high tone) — ruò (falling tone) — fán (rising tone)',
      'hero.pronounce.cantonese.label': 'Cantonese',
      'hero.pronounce.cantonese.value': 'zang1 — joek6 — faan4',
      'hero.pronounce.japanese.label': 'Japanese On\'yomi',
      'hero.pronounce.japanese.value': 'sou — jyaku — han',
      'hero.pronounce.korean.label': 'Korean',
      'hero.pronounce.korean.value': 'jeung — yak — beom',
      'hero.pronounce.note': 'You might know me as Michael, マイケル, or Миша.',
      'hero.activity.title': 'Recent activity',
      'hero.activity.item1': '(Upcoming) Joint Mathematics Meetings 2025 in Seattle.',
      'hero.activity.item2': 'Hot Topics: Life after the Telescope Conjecture at SLMath.',
      'hero.activity.item3': 'Western Algebraic Geometry Symposium, University of Arizona (Fall 2024).',
      'hero.activity.item4': 'Park City Math Institute 2024: Motivic Homotopy Theory.',
      'hero.activity.item5': 'International Workshop on Algebraic Topology (iWoAT) at Fudan University, Summer 2024.',
      'hero.activity.note': 'Last updated 2024‑12‑30.'
    },
    'zh-Hans': {
      'brand.subtitle': '数学专业博士生',
      'nav.home': '首页',
      'nav.research': '研究',
      'nav.teaching': '教学',
      'nav.notes': '笔记',
      'nav.ogura': '小仓色纸',
      'nav.cv': '简历',
      'lang.title': '选择界面语言',
      'lang.close': '关闭',
      'lang.button': '語言',
      'home.greeting': '你好！',
      'home.intro_html': '我是在西雅图华盛顿大学攻读数学博士二年级的学生，目前与 <a href="https://math.washington.edu/people/jarod-alper">Jarod Alper</a> 和 <a href="https://math.washington.edu/people/sara-billey">Sara Billey</a> 合作。我的研究兴趣位于代数几何、同伦论与组合学的交汇处，最近也在尝试用 3D 打印来呈现数学。',
      'home.cta_notes': '打开笔记中心',
      'home.cta_notes_desc': '博客文章、PDF 片段和交互式演示。',
      'home.ext_demo': 'Sage/Macaulay2 教程',
      'home.jl_html': '<strong>JupyterLite（可选）</strong><br>如果您将 <code>jupyterlite/</code> 构建添加到仓库根目录，它会自动显示在下方。',
      'hero.subtitle': '数学专业博士生',
      'hero.intro.1': '你好！我是在西雅图华盛顿大学攻读数学博士二年级的学生，目前与 <a href="https://math.washington.edu/people/jarod-alper">Jarod Alper</a> 和 <a href="https://math.washington.edu/people/sara-billey">Sara Billey</a> 合作。我的研究兴趣位于代数几何、同伦论与组合学的交汇处，最近也在尝试用 3D 打印来呈现数学。',
      'hero.intro.2': '我于 2023 年毕业于宾夕法尼亚大学，本科主修数学和语言学，并获得应用数学与计算机科学硕士学位。离开数学时，我常常出现在网球场、篮球场，或者在学习一门新语言。',
      'hero.contact.email.label': '电子邮件',
      'hero.contact.email.value': '<a href="mailto:zengrf@uw.edu">zengrf@uw.edu</a>',
      'hero.contact.office.label': '研究室',
      'hero.contact.office.value': '华盛顿大学西雅图校区 Padelford C-20',
      'hero.contact.cv.label': '简历',
      'hero.contact.cv.value': '<a href="/Michael%20CV%20Sep%202025.pdf">下载最新简历</a>',
      'hero.pronounce.title': '我的名字怎么念',
      'hero.pronounce.mandarin.label': '国语',
      'hero.pronounce.mandarin.value': 'zēng（一声）— ruò（四声）— fán（二声）',
      'hero.pronounce.cantonese.label': '粤语',
      'hero.pronounce.cantonese.value': 'zang1 — joek6 — faan4',
      'hero.pronounce.japanese.label': '日语音读',
      'hero.pronounce.japanese.value': 'sou — jyaku — han',
      'hero.pronounce.korean.label': '韩语',
      'hero.pronounce.korean.value': 'jeung — yak — beom',
      'hero.pronounce.note': '朋友们有时叫我 Michael、マイケル，或是 Миша。',
      'hero.activity.title': '近期活动',
      'hero.activity.item1': '（预告）2025 年西雅图联合数学年会。',
      'hero.activity.item2': 'SLMath「望远镜猜想之后」主题计划。',
      'hero.activity.item3': '2024 年秋 亚利桑那大学西部代数几何研讨会。',
      'hero.activity.item4': '2024 年 PCMI：动机同伦理论课程。',
      'hero.activity.item5': '2024 年复旦大学国际代数拓扑暑期工作坊（iWoAT）。',
      'hero.activity.note': '最后更新：2024‑12‑30。'
    },
    ja: {
      'brand.subtitle': '数学専攻の大学院生',
      'nav.home': 'ホーム',
      'nav.research': '研究',
      'nav.teaching': '教育',
      'nav.notes': 'ノート',
      'nav.ogura': '小倉色紙',
      'nav.cv': '履歴書',
      'lang.title': '言語を選択',
      'lang.close': '閉じる',
      'lang.button': '言語',
      'home.greeting': 'こんにちは！',
      'home.intro_html': 'ワシントン大学シアトル校で数学の博士課程2年生として学んでおります。<a href="https://math.washington.edu/people/jarod-alper">Jarod Alper</a> 先生と <a href="https://math.washington.edu/people/sara-billey">Sara Billey</a> 先生と共に研究しています。代数幾何学、ホモトピー論、組み合わせ論の交差点に興味を持っており、最近は3Dプリントを使った数学の可視化にも関心を寄せています。',
      'home.cta_notes': 'ノートハブを開く',
      'home.cta_notes_desc': 'ブログ記事、PDFスニペット、インタラクティブデモ。',
      'home.ext_demo': 'Sage/Macaulay2 チュートリアル',
      'home.jl_html': '<strong>JupyterLite（オプション）</strong><br>リポジトリのルートに <code>jupyterlite/</code> ビルドを追加すると、自動的に下に表示されます。',
      'hero.subtitle': '数学専攻の大学院生',
      'hero.intro.1': 'こんにちは！ワシントン大学シアトル校で数学の博士課程2年生として学んでおります。<a href="https://math.washington.edu/people/jarod-alper">Jarod Alper</a> 先生と <a href="https://math.washington.edu/people/sara-billey">Sara Billey</a> 先生と共に研究しています。代数幾何学、ホモトピー論、組み合わせ論の交差点に興味を持っており、最近は3Dプリントを使った数学の可視化にも関心を寄せています。',
      'hero.intro.2': '2023年にペンシルベニア大学を卒業し、数学と言語学を専攻、応用数学とコンピュータサイエンスの修士号を取得しました。数学以外では、テニスコートやバスケットボールコート、あるいは新しい言語を学んでいる姿をよく見かけます。',
      'hero.contact.email.label': 'メール',
      'hero.contact.email.value': '<a href="mailto:zengrf@uw.edu">zengrf@uw.edu</a>',
      'hero.contact.office.label': '研究室',
      'hero.contact.office.value': 'ワシントン大学シアトル校 Padelford C-20',
      'hero.contact.cv.label': '履歴書',
      'hero.contact.cv.value': '<a href="/Michael%20CV%20Sep%202025.pdf">履歴書をダウンロード</a>',
      'hero.pronounce.title': '名前の読み方',
      'hero.pronounce.mandarin.label': '中国語（普通話）',
      'hero.pronounce.mandarin.value': 'zēng（一声）— ruò（四声）— fán（二声）',
      'hero.pronounce.cantonese.label': '広東語',
      'hero.pronounce.cantonese.value': 'zang1 — joek6 — faan4',
      'hero.pronounce.japanese.label': '日本語音読み',
      'hero.pronounce.japanese.value': 'そう — じゃく — はん',
      'hero.pronounce.korean.label': '韓国語',
      'hero.pronounce.korean.value': 'jeung — yak — beom',
      'hero.pronounce.note': 'Michael や マイケル、Миша と呼ばれることもあります。',
      'hero.activity.title': '近況',
      'hero.activity.item1': '（予定）2025 年シアトル開催 Joint Mathematics Meetings。',
      'hero.activity.item2': 'SLMath「望遠鏡予想のその後」ホットトピックス。',
      'hero.activity.item3': '2024 年秋 アリゾナ大学 Western Algebraic Geometry Symposium。',
      'hero.activity.item4': '2024 年 PCMI: Motivic Homotopy Theory。',
      'hero.activity.item5': '2024 年復旦大学 International Workshop on Algebraic Topology (iWoAT)。',
      'hero.activity.note': '更新日：2024‑12‑30。'
    }
  };

  function applyTranslations(code) {
    const fallback = translations.en;
    const table = translations[code] || fallback;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (!key) return;
      const value = (table && Object.prototype.hasOwnProperty.call(table, key)) ? table[key] : fallback[key];
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
      const li = btn.parentElement;
      if (btn.dataset.lang === code) {
        li.classList.add('current');
      } else {
        li.classList.remove('current');
      }
    });
    
    document.documentElement.setAttribute('lang', code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch (err) {
      console.warn('Unable to persist language selection', err);
    }
    applyTranslations(code);
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
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  }

  // Only set up UI event listeners if elements exist
  if (toggle && overlay) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (overlay.classList.contains('open')) closeOverlay();
      else openOverlay();
    });

    // Close when clicking outside
    document.addEventListener('click', (event) => {
      if (overlay.classList.contains('open') && 
          !overlay.contains(event.target)) {
        closeOverlay();
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && overlay.classList.contains('open')) {
        closeOverlay();
      }
    });

    languageButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const newLang = btn.dataset.lang;
        
        // Don't trigger transition if same language
        if (newLang === document.documentElement.getAttribute('lang')) {
          closeOverlay();
          return;
        }
        
        // Get or create koushi overlay
        let koushiOverlay = document.querySelector('.koushi-transition-overlay');
        if (!koushiOverlay) {
          // If overlay doesn't exist yet (enhancements.js might not have loaded), skip transition
          setActive(newLang);
          closeOverlay();
          return;
        }
        
        // Close language panel
        closeOverlay();
        
        // Trigger door closing
        koushiOverlay.classList.remove('opening');
        koushiOverlay.classList.add('closing');
        
        // Wait for doors to close, then switch language and reopen
        setTimeout(() => {
          setActive(newLang);
          koushiOverlay.classList.remove('closing');
          koushiOverlay.classList.add('opening');
        }, 800);
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
