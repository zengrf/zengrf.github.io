
(function(){
  const bar = document.createElement('div'); bar.id='progress';
  document.addEventListener('readystatechange', ()=>{ if(document.readyState==='complete') document.body.appendChild(bar); });
  function progress(){ const h=document.documentElement, s=h.scrollTop, d=h.scrollHeight-h.clientHeight; bar.style.width = (d>0?(s/d*100):0) + '%'; }
  window.addEventListener('scroll', progress, {passive:true}); window.addEventListener('resize', progress);

  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('revealed'); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  const SIDEBAR_KEY='sidebar.visible';
  function initSidebarToggle(){
    const sidebar=document.querySelector('.sidebar, .page__sidebar');
    if(!sidebar) return;
    const body=document.body;
    if(!sidebar.id) sidebar.id='page-sidebar';

    const avatarImg=sidebar.querySelector('.author__avatar img');
    const toggle=document.createElement('button');
    toggle.type='button';
    toggle.className='sidebar-avatar-toggle';
    toggle.setAttribute('aria-controls', sidebar.id);
    toggle.setAttribute('aria-label','Toggle profile');
    const toggleImg=document.createElement('img');
    toggleImg.alt='Profile';
    if(avatarImg) toggleImg.src=avatarImg.src;
    toggle.appendChild(toggleImg);
    document.body.appendChild(toggle);

    const stored=localStorage.getItem(SIDEBAR_KEY);
    let visible = stored === null ? true : stored === '1';

    function apply(state){
      body.classList.toggle('sidebar-hidden', !state);
      body.classList.toggle('sidebar-visible', state);
      sidebar.setAttribute('aria-hidden', state ? 'false' : 'true');
      toggle.setAttribute('aria-pressed', state ? 'true' : 'false');
    }

    apply(visible);

    function toggleState(){
      visible = !visible;
      apply(visible);
      localStorage.setItem(SIDEBAR_KEY, visible ? '1' : '0');
    }

    toggle.addEventListener('click', toggleState);

    const avatarLink = sidebar.querySelector('.author__avatar a');
    const avatarWrap = sidebar.querySelector('.author__avatar');
    if(avatarWrap) avatarWrap.classList.add('author__avatar--toggle');

    if(avatarLink){
      avatarLink.setAttribute('role','button');
      avatarLink.setAttribute('tabindex','0');
      avatarLink.setAttribute('aria-label','Toggle profile');
      avatarLink.addEventListener('click', evt=>{ evt.preventDefault(); toggleState(); });
      avatarLink.addEventListener('keydown', evt=>{
        if(evt.key==='Enter' || evt.key===' '){ evt.preventDefault(); toggleState(); }
      });
      avatarLink.classList.add('author__avatar--clickable');
    }

    document.addEventListener('keydown', evt=>{
      if(evt.key==='Escape' && visible){
        visible=false;
        apply(visible);
        localStorage.setItem(SIDEBAR_KEY, '0');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.reveal').forEach(el=> io.observe(el));
    initSidebarToggle();
  });
})();
