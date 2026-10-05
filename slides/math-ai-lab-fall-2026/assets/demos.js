/* On-demand, genuine external tools. Local captures remain available offline. */
(() => {
  const demos = {
    search: {url: 'https://www.theoremsearch.com/search', images: ['assets/tools/search-result.png'], captured: '2026-10-04'},
    map: {url: 'https://open-problems-map.pages.dev/?year=2026', images: ['assets/tools/map-full.png', 'assets/tools/map-problem.png'], captured: '2026-10-04'},
    lean: {url: 'https://adam.math.hhu.de/#/g/leanprover-community/NNG4', images: ['assets/tools/lean-game.png'], captured: '2026-10-04'}
  };
  const dialog = document.createElement('dialog');
  dialog.className = 'lab-demo';
  dialog.id = 'lab-demo';
  dialog.setAttribute('aria-labelledby', 'lab-demo-title');
  dialog.innerHTML = '<div class="lab-demo-header"><h2 id="lab-demo-title"></h2><button data-demo-mode="live">Live</button><button data-demo-mode="saved">Saved view</button><button data-demo-previous aria-label="Previous saved view" hidden>←</button><button data-demo-next aria-label="Next saved view" hidden>→</button><a data-demo-open target="_blank" rel="noopener noreferrer">Open in browser ↗</a><button data-demo-close aria-label="Close demo">×</button></div><div class="lab-demo-stage"></div><p class="lab-demo-status" role="status"></p>';
  document.body.append(dialog);
  const stage = dialog.querySelector('.lab-demo-stage');
  const status = dialog.querySelector('.lab-demo-status');
  let active, frame, shot=0, focusBefore;
  function mode(value) {
    if (!active) return;
    stage.replaceChildren();
    frame=null;
    dialog.querySelectorAll('[data-demo-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.demoMode===value)));
    const multiple=value==='saved' && active.images.length>1;
    dialog.querySelector('[data-demo-previous]').hidden=!multiple;
    dialog.querySelector('[data-demo-next]').hidden=!multiple;
    if (value==='saved') {
      const image=document.createElement('img');
      image.src=active.images[shot];
      image.alt=dialog.querySelector('h2').textContent+' · saved view '+(shot+1);
      stage.append(image);
      status.textContent=`Captured ${active.captured} · ${shot+1} / ${active.images.length}. Use Live to interact with the tool.`;
      dialog.querySelector('[data-demo-previous]').disabled=shot===0;
      dialog.querySelector('[data-demo-next]').disabled=shot===active.images.length-1;
    } else {
      const iframe=document.createElement('iframe');
      frame=iframe;
      iframe.src=active.url;
      iframe.title=dialog.querySelector('h2').textContent;
      iframe.allow='fullscreen';
      iframe.referrerPolicy='no-referrer-when-downgrade';
      stage.append(iframe);
      status.textContent='Live tool · Internet required. If it does not load, choose Saved view or Open in browser.';
    }
  }
  function cleanup() {stage.replaceChildren();frame=null;active=null;}
  function close() {cleanup();dialog.close();}
  document.addEventListener('click', e => {
    const link=e.target.closest('a[href^="#demo-"]');
    if (!link) return;
    const item=demos[link.getAttribute('href').slice(6)];
    if (!item) return;
    e.preventDefault();
    focusBefore=link;active=item;shot=0;
    dialog.querySelector('h2').textContent=link.closest('.property-card')?.querySelector('h3')?.textContent||link.textContent;
    dialog.querySelector('[data-demo-open]').href=item.url;
    dialog.showModal();
    mode('saved');
  });
  dialog.querySelectorAll('[data-demo-mode]').forEach(b=>b.onclick=()=>mode(b.dataset.demoMode));
  dialog.querySelector('[data-demo-previous]').onclick=()=>{shot=Math.max(0,shot-1);mode('saved');};
  dialog.querySelector('[data-demo-next]').onclick=()=>{shot=Math.min(active.images.length-1,shot+1);mode('saved');};
  dialog.querySelector('[data-demo-close]').onclick=close;
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  dialog.addEventListener('close',()=>{if(!dialog.open){cleanup();focusBefore?.focus();}});
  window.addEventListener('hashchange',()=>{if(dialog.open)close();});
  window.addEventListener('offline',()=>{if(dialog.open)mode('saved');});
  // External resource links open separately, preserving the current slide.
  document.addEventListener('click',e=>{
    const a=e.target.closest('#slide a[href^="https:"]');
    if(a){a.target='_blank';a.rel='noopener noreferrer';}
  });
  // Printed/PDF demo buttons point to the actual tools, since PDF cannot open a dialog.
  function printLinksWhenReady() {
    if(!window.__ready){setTimeout(printLinksWhenReady,50);return;}
    window.addEventListener('beforeprint',()=>{
      document.querySelectorAll('#print-deck a[href^="#demo-"]').forEach(a=>{
        const item=demos[a.getAttribute('href').slice(6)];
        if(item)a.href=item.url;
      });
    });
  }
  printLinksWhenReady();
})();
