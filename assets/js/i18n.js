
(function(){
  const SUPPORTED=["en","zh-Hans","zh-Hant","ja","de","ru"];
  const NAMES={"en":"English","zh-Hans":"简体中文","zh-Hant":"繁體中文","ja":"日本語","de":"Deutsch","ru":"Русский"};
  const LSKEY="site.lang";
  const PALETTES={
    "en":{bg:"#FFFCFA",ink:"#2A1F18",primary:"#4A3225",accent:"#D08A2F",accent2:"#B2563A"},
    "ja":{bg:"#FCFAF5",ink:"#221C17",primary:"#4F3530",accent:"#C48E34",accent2:"#3A4C7A"},
    "zh-Hans":{bg:"#F6FBF8",ink:"#13221B",primary:"#315646",accent:"#22A380",accent2:"#167664"},
    "zh-Hant":{bg:"#FDF6EC",ink:"#291E18",primary:"#593B26",accent:"#CD8236",accent2:"#7F4130"},
    "de":{bg:"#F6F8FE",ink:"#162033",primary:"#2A3C61",accent:"#D3364A",accent2:"#4A6CA6"},
    "ru":{bg:"#F3F6FE",ink:"#1B263C",primary:"#2B4670",accent:"#C9A445",accent2:"#3A6FC0"}
  };
  const MOTIFS={
    "en": "url('data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M0 23h24' stroke='%23d97706' stroke-opacity='.12' stroke-width='1'/></svg>')",
    "ja": "url('data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='26' height='26'><path d='M0 24h26M24 0v26' stroke='%23c1822b' stroke-opacity='.10' stroke-width='1'/></svg>')",
    "zh-Hans": "url('data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='1' fill='%231f9e7a' fill-opacity='.18'/></svg>')",
    "zh-Hant": "url('data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M12 0v24M0 12h24' stroke='%23c86b2a' stroke-opacity='.16' stroke-width='1'/></svg>')",
    "de": "url('data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28'><rect x='0' y='12' width='28' height='1' fill='%23d7263d' fill-opacity='.14'/></svg>')",
    "ru": "url('data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='26' height='26'><path d='M0 0h26v1H0z' fill='%232e6cb8' fill-opacity='.12'/></svg>')"
  };

  let overlay=null;
  let toggle=null;
  const langButtons=[];

  function currentLang(){
    const stored=localStorage.getItem(LSKEY);
    if(!stored || !SUPPORTED.includes(stored)){
      localStorage.setItem(LSKEY, "en");
      return "en";
    }
    return stored;
  }
  async function loadLang(lang){ const response=await fetch(`/assets/i18n/${lang}.json`); if(!response.ok) throw new Error(`i18n missing: ${lang}`); return await response.json(); }
  function applyI18n(dict){ document.documentElement.setAttribute("lang", dict.__lang||"en");
    document.querySelectorAll("[data-i18n]").forEach(node=>{ const key=node.getAttribute("data-i18n"); const val=key.split(".").reduce((acc,k)=>acc&&acc[k], dict); if(val){ if(node.hasAttribute("data-i18n-html")) node.innerHTML=val; else node.textContent=val; } });
  }
  function applyPalette(lang){ const palette=PALETTES[lang]||PALETTES.en; const root=document.documentElement;
    root.style.setProperty("--bg", palette.bg); root.style.setProperty("--ink", palette.ink);
    root.style.setProperty("--primary", palette.primary); root.style.setProperty("--accent", palette.accent);
    root.style.setProperty("--accent-2", palette.accent2); root.style.setProperty("--motif", MOTIFS[lang]||"none");
  }
  function highlightActive(lang){
    if(!langButtons.length) return;
    langButtons.forEach(btn=>{
      const isActive=btn.dataset.lang===lang;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", isActive?"true":"false");
      const parent=btn.closest('.lang-item');
      if(parent) parent.classList.toggle('active', isActive);
    });
  }
  function updateToggleLabel(lang){ if(!toggle) return; const label=toggle.querySelector(".lang-toggle__label"); if(label) label.textContent=NAMES[lang]||lang.toUpperCase(); toggle.setAttribute("data-current-lang", lang); }
  function openOverlay(){ if(!overlay) return; overlay.classList.add("active"); document.body.classList.add("lang-open"); highlightActive(currentLang()); const activeBtn=overlay.querySelector('.lang-list button.active'); if(activeBtn) activeBtn.focus(); }
  function closeOverlay(){ if(!overlay) return; overlay.classList.remove("active"); document.body.classList.remove("lang-open"); if(toggle) toggle.focus(); }
  async function setLang(lang){ const body=document.body; body.classList.add("fade"); let effective=lang; let dict=null; try{ dict=await loadLang(lang); }catch(err){ console.warn(err); effective="en"; try{ dict=await loadLang("en"); }catch(fallback){ console.error(fallback); dict={__lang:"en"}; } }
    applyI18n(dict); applyPalette(effective); localStorage.setItem(LSKEY, effective); highlightActive(effective); updateToggleLabel(effective); setTimeout(()=>body.classList.add("show"),10); setTimeout(()=>body.classList.remove("fade"),260); return effective; }
  function removeLegacy(){ document.querySelectorAll('.lang-switch').forEach(node=> node.remove()); }
  function injectSelector(){ if(document.querySelector(".lang-toggle")) return; removeLegacy(); overlay=document.createElement("div"); overlay.className="lang-overlay"; const panel=document.createElement("div"); panel.className="lang-panel";
    const list=document.createElement("ul"); list.className="lang-list"; panel.appendChild(list);
    SUPPORTED.forEach(code=>{
      const item=document.createElement("li"); item.className="lang-item";
      const btn=document.createElement("button"); btn.type="button"; btn.className="lang-option"; btn.dataset.lang=code; btn.textContent=NAMES[code];
      btn.addEventListener("click", ()=>{ setLang(code).then(()=> closeOverlay()); });
      item.appendChild(btn); list.appendChild(item); langButtons.push(btn);
    });
    const closeBtn=document.createElement("button"); closeBtn.type="button"; closeBtn.className="lang-close"; closeBtn.setAttribute("data-i18n","ui.lang_close"); closeBtn.textContent="Close"; closeBtn.addEventListener("click", closeOverlay); panel.appendChild(closeBtn);
    overlay.appendChild(panel); overlay.addEventListener("click", evt=>{ if(evt.target===overlay) closeOverlay(); });
    document.body.appendChild(overlay);
    toggle=document.createElement("button"); toggle.type="button"; toggle.className="lang-toggle"; toggle.innerHTML=`<span class="lang-toggle__label">${NAMES[currentLang()]}</span><span class="lang-toggle__caret" aria-hidden="true">▾</span>`; toggle.setAttribute("aria-label","Change language"); toggle.addEventListener("click", ()=>{ if(overlay.classList.contains("active")) closeOverlay(); else openOverlay(); });
    document.body.appendChild(toggle);
  }
  document.addEventListener("keydown", evt=>{ if(evt.key==="Escape" && document.body.classList.contains("lang-open")) closeOverlay(); });
  document.addEventListener("DOMContentLoaded", async ()=>{ injectSelector(); await setLang(currentLang()); });
  window.__setLang=setLang; window.__setPalette=(colors)=>{ const root=document.documentElement; ["bg","ink","primary","accent","accent2"].forEach(key=>{ if(colors[key]) root.style.setProperty("--"+(key==="accent2"?"accent-2":key), colors[key]); }); };
})();
