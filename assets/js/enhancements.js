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
  // Koushi Sliding Door Page Transition
  // ==========================================================================
  
  // Create sliding door overlay
  const createSlidingDoorOverlay = function() {
    const overlay = document.createElement('div');
    overlay.className = 'koushi-transition-overlay';
    overlay.innerHTML = `
      <div class="koushi-door koushi-door--left">
        <div class="koushi-lattice"></div>
      </div>
      <div class="koushi-door koushi-door--right">
        <div class="koushi-lattice"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  };
  
  // Add CSS for sliding doors
  const washi1Texture = assetUrl('/assets/img/washi1.png');
  const washi2Texture = assetUrl('/assets/img/washi2.png');
  const transitionStyles = document.createElement('style');
  transitionStyles.textContent = `
    .koushi-transition-overlay {
      position: fixed;
      inset: 0;
      z-index: 10000;
      pointer-events: none;
      display: flex;
    }
    
    .koushi-door {
      flex: 1;
      height: 100%;
      background: #8b4513;
      transform: translateX(0);
      transition: transform 0.8s cubic-bezier(0.76, 0, 0.24, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 
        inset 0 0 60px rgba(0, 0, 0, 0.5),
        inset 6px 0 16px rgba(255, 255, 255, 0.2),
        inset -6px 0 16px rgba(0, 0, 0, 0.4);
    }
    
    .koushi-door--left {
      transform-origin: left center;
      border-right: 8px solid rgba(74, 47, 26, 0.95);
    }
    
    .koushi-door--right {
      transform-origin: right center;
      border-left: 8px solid rgba(74, 47, 26, 0.95);
    }
    
    .koushi-lattice {
      position: absolute;
      inset: 0;
      background-color: #fffef9;
      background-image: 
        /* Horizontal brown grid lines */
        repeating-linear-gradient(0deg,
          transparent 0px,
          transparent 0px,
          #4a2f1a 0px,
          #4a2f1a 5px,
          transparent 5px,
          transparent 100px
    ),
    /* Washi paper texture */
    url('${washi1Texture}');
      background-size: auto, cover;
      background-blend-mode: normal, multiply;
      opacity: 0.95;
    }
    
    /* Right-justify grid on left door - vertical lines from right edge */
    .koushi-door--left .koushi-lattice {
      background-image: 
        /* Horizontal brown grid lines */
        repeating-linear-gradient(0deg,
          transparent 0px,
          transparent 0px,
          #4a2f1a 0px,
          #4a2f1a 5px,
          transparent 5px,
          transparent 100px
        ),
        /* Vertical brown grid lines from RIGHT */
        repeating-linear-gradient(270deg,
          transparent 0px,
          transparent 0px,
          #4a2f1a 0px,
          #4a2f1a 5px,
          transparent 5px,
          transparent 100px
        ),
        /* Wood grain highlight - from RIGHT */
        repeating-linear-gradient(270deg,
          transparent 0px,
          transparent 97px,
          rgba(255, 255, 255, 0.3) 97px,
          rgba(255, 255, 255, 0.3) 98px,
          transparent 98px,
          transparent 100px
        ),
        /* Washi paper texture */
        url('${washi1Texture}');
      background-size: auto, auto, auto, cover;
    }
    
    /* Left-justify grid on right door - vertical lines from left edge */
    .koushi-door--right .koushi-lattice {
      background-image: 
        /* Horizontal brown grid lines */
        repeating-linear-gradient(0deg,
          transparent 0px,
          transparent 0px,
          #4a2f1a 0px,
          #4a2f1a 5px,
          transparent 5px,
          transparent 100px
        ),
        /* Vertical brown grid lines from LEFT */
        repeating-linear-gradient(90deg,
          transparent 0px,
          transparent 0px,
          #4a2f1a 0px,
          #4a2f1a 5px,
          transparent 5px,
          transparent 100px
        ),
        /* Wood grain highlight */
        repeating-linear-gradient(90deg,
          transparent 0px,
          transparent 97px,
          rgba(255, 255, 255, 0.3) 97px,
          rgba(255, 255, 255, 0.3) 98px,
          transparent 98px,
          transparent 100px
        ),
        /* Washi paper texture */
        url('${washi1Texture}');
      background-size: auto, auto, auto, cover;
    }
    
    .koushi-transition-overlay.closing .koushi-door--left {
      transform: translateX(0);
      pointer-events: auto;
    }
    
    .koushi-transition-overlay.closing .koushi-door--right {
      transform: translateX(0);
      pointer-events: auto;
    }
    
    .koushi-transition-overlay.opening .koushi-door--left {
      transform: translateX(-100%);
    }
    
    .koushi-transition-overlay.opening .koushi-door--right {
      transform: translateX(100%);
    }
    
    /* Initial hidden state */
    .koushi-transition-overlay:not(.closing):not(.opening) .koushi-door--left {
      transform: translateX(-100%);
    }
    
    .koushi-transition-overlay:not(.closing):not(.opening) .koushi-door--right {
      transform: translateX(100%);
    }
    
    /* Premium wood grain texture on door frames */
    .koushi-door::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: 
        repeating-linear-gradient(90deg,
          rgba(0, 0, 0, 0.15) 0px,
          rgba(0, 0, 0, 0.08) 2px,
          transparent 2px,
          transparent 6px
        );
      opacity: 0.5;
    }
    
    /* Tang Dynasty vermillion style for Chinese language */
    html[lang='zh-Hans'] .koushi-door {
      background: #c41e3a;
    }
    
    html[lang='zh-Hans'] .koushi-lattice {
      background-color: #fffef9;
      background-image: 
        repeating-linear-gradient(0deg,
          transparent 0px,
          transparent 0px,
          #8b0000 0px,
          #8b0000 5px,
          transparent 5px,
          transparent 100px
        ),
        url('${washi2Texture}');
      background-size: auto, cover;
    }
    
    html[lang='zh-Hans'] .koushi-door--left .koushi-lattice {
      background-image: 
        repeating-linear-gradient(0deg,
          transparent 0px,
          transparent 0px,
          #8b0000 0px,
          #8b0000 5px,
          transparent 5px,
          transparent 100px
        ),
        repeating-linear-gradient(270deg,
          transparent 0px,
          transparent 0px,
          #8b0000 0px,
          #8b0000 5px,
          transparent 5px,
          transparent 100px
        ),
        repeating-linear-gradient(270deg,
          transparent 0px,
          transparent 97px,
          rgba(255, 215, 0, 0.4) 97px,
          rgba(255, 215, 0, 0.4) 98px,
          transparent 98px,
          transparent 100px
        ),
        url('${washi2Texture}');
      background-size: auto, auto, auto, cover;
    }
    
    html[lang='zh-Hans'] .koushi-door--right .koushi-lattice {
      background-image: 
        repeating-linear-gradient(0deg,
          transparent 0px,
          transparent 0px,
          #8b0000 0px,
          #8b0000 5px,
          transparent 5px,
          transparent 100px
        ),
        repeating-linear-gradient(90deg,
          transparent 0px,
          transparent 0px,
          #8b0000 0px,
          #8b0000 5px,
          transparent 5px,
          transparent 100px
        ),
        repeating-linear-gradient(90deg,
          transparent 0px,
          transparent 97px,
          rgba(255, 215, 0, 0.4) 97px,
          rgba(255, 215, 0, 0.4) 98px,
          transparent 98px,
          transparent 100px
        ),
        url('${washi2Texture}');
      background-size: auto, auto, auto, cover;
    }
  `;
  document.head.appendChild(transitionStyles);
  
  // Create overlay on page load
  const overlay = createSlidingDoorOverlay();
  
  // Check if we're arriving from a transition
  const fromTransition = sessionStorage.getItem('koushi-transition') === 'true';
  
  if (fromTransition) {
    // Start with doors closed, then open them
    sessionStorage.removeItem('koushi-transition');
    overlay.classList.add('closing');
    
    setTimeout(function() {
      overlay.classList.remove('closing');
      overlay.classList.add('opening');
    }, 50);
  } else {
    // First visit - doors start open
    overlay.classList.add('opening');
  }
  
  // Handle page transitions for internal links
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    
    // Check if it's an internal link
    if (href && 
        (href.startsWith('/') || href.startsWith(window.location.origin)) &&
        !href.includes('#') && 
        href !== window.location.pathname &&
        href !== window.location.href) {
      
      e.preventDefault();
      
      // Set transition flag
      sessionStorage.setItem('koushi-transition', 'true');
      
      // Remove opening class and add closing
      overlay.classList.remove('opening');
      overlay.classList.add('closing');
      
      // Navigate after doors close
      setTimeout(function() {
        window.location.href = href;
      }, 800);
    }
  });
  
  // ==========================================================================
  // Collapsible Blocks with Koushi Transition
  // ==========================================================================
  
  // Add collapsible functionality
  const collapsibleSections = document.querySelectorAll('.section[data-collapsible="true"], .list-card[data-collapsible="true"]');
  
  collapsibleSections.forEach(function(section) {
    // Create toggle button
    const header = section.querySelector('h2, h3, h4');
    if (!header) return;
    
    // Make header clickable
    header.style.cursor = 'pointer';
    header.style.userSelect = 'none';
    header.style.position = 'relative';
    
    // Add toggle indicator
    const indicator = document.createElement('span');
    indicator.className = 'collapse-indicator';
    indicator.innerHTML = '▼';
    indicator.style.cssText = `
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      font-size: 0.8em;
      color: var(--accent);
    `;
    header.style.position = 'relative';
    header.appendChild(indicator);
    
    // Get content to collapse
    const content = document.createElement('div');
    content.className = 'collapsible-content';
    const children = Array.from(section.children).filter(child => child !== header);
    children.forEach(child => content.appendChild(child));
    section.appendChild(content);
    
    // Set initial state (collapsed by default)
    let isCollapsed = !section.hasAttribute('data-expanded');
    
    function setCollapsedState(collapsed, animate = true) {
      isCollapsed = collapsed;
      
      if (collapsed) {
        indicator.style.transform = 'translateY(-50%) rotate(-90deg)';
        if (animate) {
          // Koushi lattice collapse animation
          content.style.transition = 'max-height 0.6s cubic-bezier(0.76, 0, 0.24, 1), opacity 0.4s ease, transform 0.6s ease';
          content.style.maxHeight = content.scrollHeight + 'px';
          requestAnimationFrame(function() {
            content.style.maxHeight = '0';
            content.style.opacity = '0';
            content.style.transform = 'scaleY(0.95)';
          });
        } else {
          content.style.maxHeight = '0';
          content.style.opacity = '0';
          content.style.transform = 'scaleY(0.95)';
        }
      } else {
        indicator.style.transform = 'translateY(-50%) rotate(0deg)';
        if (animate) {
          content.style.transition = 'max-height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease 0.1s, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
          content.style.maxHeight = content.scrollHeight + 'px';
          content.style.opacity = '1';
          content.style.transform = 'scaleY(1)';
          
          // Remove max-height after animation
          setTimeout(function() {
            content.style.maxHeight = 'none';
          }, 600);
        } else {
          content.style.maxHeight = 'none';
          content.style.opacity = '1';
          content.style.transform = 'scaleY(1)';
        }
      }
    }
    
    // Initialize state
    content.style.transformOrigin = 'top center';
    content.style.overflow = 'hidden';
    setCollapsedState(isCollapsed, false);
    
    // Toggle on header click
    header.addEventListener('click', function() {
      setCollapsedState(!isCollapsed, true);
    });
  });

  console.log('✨ UI enhancements loaded with koushi sliding door transitions and collapsible blocks');
})();
