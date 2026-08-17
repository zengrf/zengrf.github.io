// Professional UI Enhancements
(function() {
  'use strict';

  const siteBaseAttr = document.documentElement.getAttribute('data-baseurl') || '';
  const normalizedBase = siteBaseAttr === '/' ? '' : siteBaseAttr.replace(/\/$/, '');
  const assetUrl = function(path) {
    return `${normalizedBase}${path}`;
  };

  const externalLinkSelector = 'a[href]';

  const enhanceExternalLinks = function(scope = document) {
    const anchors = scope.querySelectorAll(externalLinkSelector);
    anchors.forEach(function(anchor) {
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      let resolved;
      try {
        resolved = new URL(href, window.location.origin);
      } catch (err) {
        return;
      }

      if (resolved.origin !== window.location.origin) {
        if (!anchor.hasAttribute('target')) {
          anchor.setAttribute('target', '_blank');
        }

        const relTokens = new Set((anchor.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
        relTokens.add('noopener');
        relTokens.add('noreferrer');
        anchor.setAttribute('rel', Array.from(relTokens).join(' '));
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      enhanceExternalLinks();
    });
  } else {
    enhanceExternalLinks();
  }

  const setupFullscreenEmbeds = function() {
    const embedNodes = document.querySelectorAll('.post__embed, .featured-card__preview');
    if (!embedNodes.length) {
      return;
    }

    const supportsFullscreen = Boolean(
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.msFullscreenEnabled
    );

    const embedEntries = [];
    embedNodes.forEach(function(embed) {
      const button = embed.querySelector('.embed-fullscreen');
      const iframe = embed.querySelector('iframe');
      if (!button || !iframe) {
        return;
      }

      embedEntries.push({ embed, button, iframe });

      if (!supportsFullscreen) {
        button.addEventListener('click', function() {
          window.open(iframe.src, '_blank', 'noopener');
        });
        button.setAttribute('aria-label', 'Open interactive demo in new tab');
        return;
      }

      button.addEventListener('click', function() {
        const activeElement = document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement;

        if (activeElement === embed) {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          }
          return;
        }

        if (embed.requestFullscreen) {
          embed.requestFullscreen();
        } else if (embed.webkitRequestFullscreen) {
          embed.webkitRequestFullscreen();
        } else if (embed.msRequestFullscreen) {
          embed.msRequestFullscreen();
        }
      });
    });

    if (!supportsFullscreen || !embedEntries.length) {
      return;
    }

    const updateButtons = function() {
      const activeElement = document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;

      embedEntries.forEach(function(entry) {
        const isFullscreen = activeElement === entry.embed;
        entry.button.classList.toggle('is-fullscreen', isFullscreen);
        entry.button.setAttribute(
          'aria-label',
          isFullscreen ? 'Exit fullscreen' : 'View interactive demo fullscreen'
        );
      });
    };

    document.addEventListener('fullscreenchange', updateButtons);
    document.addEventListener('webkitfullscreenchange', updateButtons);
    document.addEventListener('MSFullscreenChange', updateButtons);
    updateButtons();
  };

  setupFullscreenEmbeds();

  // Add scrolled class to header on scroll
  let lastScroll = 0;
  const header = document.querySelector('.site-header');
  
  if (header) {
    window.addEventListener('scroll', function() {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      lastScroll = currentScroll;
    }, { passive: true });
  }

  // Staggered animation for note cards
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry, index) {
      if (entry.isIntersecting) {
        setTimeout(function() {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 50);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe cards for entrance animation
  const cards = document.querySelectorAll('.note-card, .featured-card');
  cards.forEach(function(card, index) {
    // Set initial state
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    // Delay first few cards less
    if (index < 3) {
      setTimeout(function() {
        observer.observe(card);
      }, 100);
    } else {
      observer.observe(card);
    }
  });

  // Smooth reveal for images
  const images = document.querySelectorAll('.section figure img');
  const imageObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'scale(1)';
        imageObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  images.forEach(function(img) {
    img.style.opacity = '0';
    img.style.transform = 'scale(0.95)';
    img.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    imageObserver.observe(img);
  });

  // Add subtle parallax effect to featured card decorations
  if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    const featuredCards = document.querySelectorAll('.featured-card');
    
    featuredCards.forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;
        
        const decoration = card.querySelector('.featured-card__decoration');
        if (decoration) {
          decoration.style.transform = `translate(${deltaX * 10}px, ${deltaY * 10}px)`;
        }
      });
      
      card.addEventListener('mouseleave', function() {
        const decoration = card.querySelector('.featured-card__decoration');
        if (decoration) {
          decoration.style.transform = '';
        }
      });
    });
  }

  // Preload critical images for smoother experience
  const criticalImages = document.querySelectorAll('img[src*="avatar"], img[src*="hero"]');
  criticalImages.forEach(function(img) {
    const src = img.getAttribute('src');
    if (src) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = src;
      document.head.appendChild(preloadLink);
    }
  });

  // ==========================================================================
  // Collapsible panels — accessible (button semantics, reduced-motion aware)
  // ==========================================================================

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const collapsibleSections = document.querySelectorAll('.section[data-collapsible="true"], .list-card[data-collapsible="true"]');

  collapsibleSections.forEach(function(section, idx) {
    const header = section.querySelector('h2, h3, h4');
    if (!header) return;

    // move everything after the header into a wrapper we can hide
    const content = document.createElement('div');
    content.className = 'collapsible-content';
    content.id = 'collapsible-' + idx;
    Array.from(section.children).filter(function(c) { return c !== header; })
      .forEach(function(c) { content.appendChild(c); });
    section.appendChild(content);

    // real button semantics on the header
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-controls', content.id);

    const indicator = document.createElement('span');
    indicator.className = 'collapse-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    indicator.textContent = '▾';
    indicator.style.cssText = 'margin-left:auto;font-size:0.8em;transition:transform 0.3s ease;';
    header.appendChild(indicator);

    let isCollapsed = !section.hasAttribute('data-expanded');

    function setCollapsedState(collapsed, animate) {
      isCollapsed = collapsed;
      header.setAttribute('aria-expanded', String(!collapsed));
      indicator.style.transform = collapsed ? 'rotate(-90deg)' : 'rotate(0deg)';
      const doAnimate = animate && !prefersReducedMotion;
      if (collapsed) {
        if (doAnimate) {
          content.style.transition = 'max-height 0.35s ease, opacity 0.25s ease';
          content.style.maxHeight = content.scrollHeight + 'px';
          requestAnimationFrame(function() {
            content.style.maxHeight = '0';
            content.style.opacity = '0';
          });
          setTimeout(function() { content.hidden = true; }, 360);
        } else {
          content.style.maxHeight = '0';
          content.style.opacity = '0';
          content.hidden = true;
        }
      } else {
        content.hidden = false;
        if (doAnimate) {
          content.style.transition = 'max-height 0.35s ease, opacity 0.3s ease';
          content.style.maxHeight = content.scrollHeight + 'px';
          content.style.opacity = '1';
          setTimeout(function() { content.style.maxHeight = 'none'; }, 360);
        } else {
          content.style.maxHeight = 'none';
          content.style.opacity = '1';
        }
      }
    }

    content.style.overflow = 'hidden';
    setCollapsedState(isCollapsed, false);

    function toggle() { setCollapsedState(!isCollapsed, true); }
    header.addEventListener('click', toggle);
    header.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

})();
