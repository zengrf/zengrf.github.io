/* Site behaviors: external links, fullscreen embeds, collapsible bays,
   and the koushi sliding-door page transition.
   Design rule enforced here: nothing fades. The doors and the collapsing
   panels move; opacity is never animated. */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------------
  // External links: open in a new tab with safe rel
  // ------------------------------------------------------------------
  function enhanceExternalLinks() {
    var anchors = document.querySelectorAll('a[href]');
    Array.prototype.forEach.call(anchors, function (anchor) {
      var href = anchor.getAttribute('href');
      if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;
      var resolved;
      try { resolved = new URL(href, window.location.origin); } catch (err) { return; }
      if (resolved.origin !== window.location.origin) {
        if (!anchor.hasAttribute('target')) anchor.setAttribute('target', '_blank');
        var rel = (anchor.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
        if (rel.indexOf('noopener') < 0) rel.push('noopener');
        if (rel.indexOf('noreferrer') < 0) rel.push('noreferrer');
        anchor.setAttribute('rel', rel.join(' '));
      }
    });
  }

  // ------------------------------------------------------------------
  // Fullscreen embeds
  // ------------------------------------------------------------------
  function setupFullscreenEmbeds() {
    var embedNodes = document.querySelectorAll('.post__embed, .featured-card__preview');
    if (!embedNodes.length) return;

    var supportsFullscreen = Boolean(
      document.fullscreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled
    );
    var entries = [];

    Array.prototype.forEach.call(embedNodes, function (embed) {
      var button = embed.querySelector('.embed-fullscreen');
      var iframe = embed.querySelector('iframe');
      if (!button || !iframe) return;
      entries.push({ embed: embed, button: button });

      if (!supportsFullscreen) {
        button.addEventListener('click', function () {
          window.open(iframe.src, '_blank', 'noopener');
        });
        button.setAttribute('aria-label', 'Open interactive demo in new tab');
        return;
      }
      button.addEventListener('click', function () {
        var active = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
        if (active === embed) {
          (document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen).call(document);
          return;
        }
        (embed.requestFullscreen || embed.webkitRequestFullscreen || embed.msRequestFullscreen).call(embed);
      });
    });

    if (!supportsFullscreen || !entries.length) return;
    function updateButtons() {
      var active = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
      entries.forEach(function (entry) {
        var isFs = active === entry.embed;
        entry.button.classList.toggle('is-fullscreen', isFs);
        entry.button.setAttribute('aria-label', isFs ? 'Exit fullscreen' : 'View interactive demo fullscreen');
      });
    }
    document.addEventListener('fullscreenchange', updateButtons);
    document.addEventListener('webkitfullscreenchange', updateButtons);
    document.addEventListener('MSFullscreenChange', updateButtons);
    updateButtons();
  }

  // ------------------------------------------------------------------
  // Collapsible bays — button semantics; motion is a height slide only
  // ------------------------------------------------------------------
  function setupCollapsibles() {
    var sections = document.querySelectorAll('.section[data-collapsible="true"], .list-card[data-collapsible="true"]');
    Array.prototype.forEach.call(sections, function (section, idx) {
      var header = section.querySelector('h2, h3, h4');
      if (!header) return;

      var content = document.createElement('div');
      content.className = 'collapsible-content';
      content.id = 'collapsible-' + idx;
      Array.prototype.slice.call(section.children).forEach(function (child) {
        if (child !== header) content.appendChild(child);
      });
      section.appendChild(content);

      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.setAttribute('aria-controls', content.id);

      var indicator = document.createElement('span');
      indicator.className = 'collapse-indicator';
      indicator.setAttribute('aria-hidden', 'true');
      indicator.innerHTML = '<svg viewBox="0 0 387.9 389.2" focusable="false">' +
        '<path d="M 164.4,387.2 C 153.2,385.4 149.9,384.6 137.4,381.0 C 104.5,371.6 71.2,349.8 47.0,321.8 C 32.6,305.1 20.6,285.5 18.8,276.0 C 14.1,250.2 16.2,223.1 24.0,207.8 C 35.5,185.5 53.6,169.5 76.2,161.6 C 86.2,158.1 104.8,157.3 116.9,159.7 C 127.0,161.8 139.3,166.2 145.8,169.9 C 154.3,174.9 165.3,184.2 170.6,190.9 C 177.2,199.3 184.2,213.3 187.1,224.3 C 188.9,231.1 189.3,235.3 189.3,246.3 C 189.3,258.2 189.0,260.8 186.5,268.7 C 185.0,273.7 182.4,280.3 180.8,283.4 C 177.4,290.3 168.8,301.9 164.8,305.1 C 160.4,308.6 161.1,310.5 168.6,316.6 C 187.0,331.3 210.7,341.3 233.9,344.2 C 245.9,345.7 265.9,345.5 275.9,343.8 C 301.1,339.5 329.2,326.2 345.6,310.9 C 352.5,304.5 353.6,304.6 348.7,311.4 C 323.0,347.2 279.2,375.4 234.4,384.8 C 211.5,389.7 184.9,390.6 164.4,387.2 z M 276.4,328.3 C 260.1,326.2 241.2,317.6 229.8,307.1 C 222.6,300.6 212.9,288.2 209.4,281.3 C 200.4,263.4 198.9,239.2 205.4,216.8 C 210.2,200.3 223.2,182.7 237.4,173.8 C 240.7,171.7 244.5,169.2 245.9,168.2 C 247.4,167.3 252.8,164.9 258.1,162.9 C 272.6,157.5 292.0,156.3 308.0,159.9 C 311.3,160.6 311.7,159.7 313.2,146.6 C 315.2,128.4 311.5,102.9 304.3,85.3 C 295.1,62.5 281.7,44.3 264.6,30.9 C 254.0,22.8 237.7,12.1 228.9,7.7 C 216.9,1.7 218.7,0.8 235.7,4.7 C 279.5,14.7 318.3,39.0 345.9,73.8 C 378.0,114.3 393.8,172.1 385.9,220.8 C 381.4,248.9 371.3,278.1 362.7,287.9 C 360.9,290.0 357.7,293.9 355.6,296.4 C 349.7,303.9 335.2,315.4 325.9,320.0 C 321.2,322.4 313.8,325.2 309.4,326.3 C 300.4,328.6 285.4,329.5 276.4,328.3 z M 13.2,264.7 C 10.9,260.7 4.9,239.2 2.8,227.5 C -6.5,175.5 7.4,119.2 40.0,76.2 C 75.2,29.7 132.1,0.9 190.4,0.1 C 202.2,-0.1 202.5,-0.1 213.9,4.1 C 226.3,8.7 230.9,11.1 240.6,18.0 C 253.3,27.0 267.2,45.1 272.4,59.6 C 273.7,63.1 275.5,70.8 276.5,76.7 C 278.0,85.8 278.1,88.8 277.1,97.1 C 275.6,109.8 270.9,125.3 266.0,133.9 C 258.9,146.1 239.5,162.6 225.3,168.6 C 218.1,171.6 203.8,174.9 194.4,175.8 C 182.1,177.0 161.5,172.0 148.4,164.7 C 128.9,153.8 112.0,132.5 107.8,113.6 C 107.1,110.6 105.8,107.8 104.9,107.3 C 101.6,105.5 72.0,121.6 63.0,130.2 C 61.1,131.9 57.3,135.4 54.6,137.8 C 45.2,146.3 32.0,164.5 26.3,176.8 C 22.8,184.4 18.5,196.9 16.8,204.2 C 13.5,218.7 12.0,244.7 13.9,252.5 C 14.5,254.9 14.9,259.1 14.7,261.8 C 14.4,266.2 14.3,266.5 13.2,264.7 z"/></svg>';
      indicator.style.cssText = 'transition:transform 0.28s ease;';
      header.appendChild(indicator);

      var isCollapsed = !section.hasAttribute('data-expanded');
      content.style.overflow = 'hidden';

      function setState(collapsed, animate) {
        isCollapsed = collapsed;
        header.setAttribute('aria-expanded', String(!collapsed));
        section.classList.toggle('is-collapsed', collapsed);
        indicator.style.transform = collapsed ? 'rotate(0deg)' : 'rotate(90deg)';
        var doAnimate = animate && !prefersReducedMotion;
        if (collapsed) {
          if (doAnimate) {
            content.style.transition = 'max-height 0.34s ease';
            content.style.maxHeight = content.scrollHeight + 'px';
            requestAnimationFrame(function () { content.style.maxHeight = '0'; });
            setTimeout(function () { content.hidden = true; }, 350);
          } else {
            content.style.maxHeight = '0';
            content.hidden = true;
          }
        } else {
          content.hidden = false;
          if (doAnimate) {
            content.style.transition = 'max-height 0.34s ease';
            content.style.maxHeight = content.scrollHeight + 'px';
            setTimeout(function () { content.style.maxHeight = 'none'; }, 350);
          } else {
            content.style.maxHeight = 'none';
          }
        }
      }
      setState(isCollapsed, false);

      function toggle() { setState(!isCollapsed, true); }
      header.addEventListener('click', toggle);
      header.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  }

  // ------------------------------------------------------------------
  // Koushi sliding doors — the page transition
  // Two door leaves slide shut over the old page, open off the new one.
  // Styled entirely in main.scss (.kdoor-*), skinned per language/time.
  // ------------------------------------------------------------------
  function setupDoors() {
    if (prefersReducedMotion) return;

    var DOOR_MS = 780;
    var overlay = document.createElement('div');
    overlay.className = 'kdoor-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
      '<div class="kdoor kdoor--l"><div class="kdoor__paper"></div></div>' +
      '<div class="kdoor kdoor--r"><div class="kdoor__paper"></div></div>';
    document.body.appendChild(overlay);

    var arriving = false;
    try { arriving = sessionStorage.getItem('kdoor') === '1'; } catch (e) { /* ok */ }

    if (arriving) {
      try { sessionStorage.removeItem('kdoor'); } catch (e) { /* ok */ }
      overlay.classList.add('closing');           // first paint: doors shut
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          overlay.classList.remove('closing');    // …then they slide open
          overlay.classList.add('opening');
        });
      });
    } else {
      overlay.classList.add('opening');
    }

    // if the page returns from bfcache with doors shut, reopen them
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) {
        overlay.classList.remove('closing');
        overlay.classList.add('opening');
      }
    });

    /* let other scripts (language switch) run an action behind closed doors */
    window.__doorCycle = function (midAction) {
      overlay.classList.remove('opening');
      overlay.classList.add('closing');
      setTimeout(function () {
        try { midAction(); } catch (err) { /* still reopen */ }
        setTimeout(function () {
          overlay.classList.remove('closing');
          overlay.classList.add('opening');
        }, 160);
      }, DOOR_MS);
    };

    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var link = e.target.closest('a');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      if (link.target && link.target !== '_self') return;
      if (link.hasAttribute('download')) return;

      var url;
      try { url = new URL(href, window.location.href); } catch (err) { return; }
      if (url.origin !== window.location.origin) return;
      if (url.hash && url.pathname === window.location.pathname) return;
      if (/\.(pdf|zip|png|jpe?g|gif|svg)$/i.test(url.pathname)) return;
      if (url.href === window.location.href) return;

      e.preventDefault();
      try { sessionStorage.setItem('kdoor', '1'); } catch (err) { /* ok */ }
      overlay.classList.remove('opening');
      overlay.classList.add('closing');
      setTimeout(function () { window.location.href = url.href; }, DOOR_MS);
    });
  }

  // ------------------------------------------------------------------
  // <details> panels slide like drawers instead of snapping
  // ------------------------------------------------------------------
  function setupDetailsSlide() {
    var panels = document.querySelectorAll('details.toc__details, details.section-toc');
    Array.prototype.forEach.call(panels, function (details) {
      var summary = details.querySelector('summary');
      if (!summary) return;
      var body = document.createElement('div');
      body.className = 'details-body';
      Array.prototype.slice.call(details.children).forEach(function (child) {
        if (child !== summary) body.appendChild(child);
      });
      details.appendChild(body);
      details.classList.toggle('is-open', details.open);
      if (!details.open) { details.open = true; body.style.maxHeight = '0'; body.hidden = true; }
      else { body.style.maxHeight = 'none'; }

      summary.addEventListener('click', function (e) {
        e.preventDefault();
        var opening = !details.classList.contains('is-open');
        details.classList.toggle('is-open', opening);
        if (prefersReducedMotion) {
          body.hidden = !opening;
          body.style.maxHeight = opening ? 'none' : '0';
          return;
        }
        if (opening) {
          body.hidden = false;
          body.style.maxHeight = body.scrollHeight + 'px';
          setTimeout(function () { body.style.maxHeight = 'none'; }, 320);
        } else {
          body.style.maxHeight = body.scrollHeight + 'px';
          requestAnimationFrame(function () { body.style.maxHeight = '0'; });
          setTimeout(function () { body.hidden = true; }, 320);
        }
      });
    });
  }

  function init() {
    enhanceExternalLinks();
    setupFullscreenEmbeds();
    setupCollapsibles();
    setupDetailsSlide();
    setupDoors();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
