/* ==========================================================================
   KALO VILLA SIARGAO — Unified Script
   GSAP + ScrollTrigger + Lenis + UI logic
   ==========================================================================
   01. Setup & helpers
   02. Lenis smooth scroll
   03. Page load fade-in
   04. Word wrapping for reveal headings
   05. Floating header
   06. Mobile nav overlay
   07. Floating action button
   08. FAQ accordion
   09. Hero (home)
   10. Generic scroll reveals
   11. Gallery tiles
   12. Horizontal scroll (experiences)
   13. Clip-path photo reveals
   14. Stats counters (about)
   15. Testimonials carousel (about)
   16. Instagram carousel (contact)
   17. Booking page entrance
   18. Page hero parallax (sub-pages)
   19. Lucide icons
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     01. Setup & helpers
     ------------------------------------------------------------------------ */
  gsap.registerPlugin(ScrollTrigger);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 768px)').matches;
  var motionOK = !reduceMotion;

  function qs(sel, ctx)  { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ------------------------------------------------------------------------
     02. Lenis smooth scroll
     ------------------------------------------------------------------------ */
  var lenis = null;

  if (motionOK && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: isMobile ? 0.12 : 0.08, smooth: true });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ------------------------------------------------------------------------
     03. Page load — CSS @keyframes pageFadeIn handles the fade
     ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    initAll();
  });

  /* ------------------------------------------------------------------------
     04. Word wrapping for reveal headings — [data-words]
     ------------------------------------------------------------------------ */
  function wrapWords(el) {
    var text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split(/\s+/).map(function (word) {
      return '<span class="word" aria-hidden="true"><span class="word-inner">' + word + '</span></span>';
    }).join(' ');
  }

  /* ------------------------------------------------------------------------
     05. Floating header
     ------------------------------------------------------------------------ */
  function initHeader() {
    var header = qs('.site-header');
    if (!header) return;

    // The pill is always fully transparent — the scroll listener only swaps
    // text/icon color via .is-scrolled: white over the dark hero, ink once
    // past it. Pages with no hero (booking) start in the ink state.
    var hero = qs('.hero') || qs('.page-hero');
    var threshold = hero ? hero.offsetHeight - 90 : -1;

    function updateNav() {
      var y = lenis ? lenis.scroll : window.scrollY;
      header.classList.toggle('is-scrolled', y > threshold);
    }

    if (lenis) {
      lenis.on('scroll', updateNav);
    } else {
      window.addEventListener('scroll', updateNav, { passive: true });
    }
    window.addEventListener('resize', function () {
      threshold = hero ? hero.offsetHeight - 90 : -1;
      updateNav();
    });
    updateNav();
  }

  /* ------------------------------------------------------------------------
     05b. Smart navbar — auto-hide on scroll down, reappear on scroll up
     ------------------------------------------------------------------------ */
  function initNavVisibility() {
    var header = qs('.site-header');
    if (!header) return;

    var lastScrollY = 0;
    var scrollThreshold = 80; // don't hide until scrolled past 80px from top
    var ticking = false;

    function handleNavVisibility() {
      var currentScrollY = lenis ? lenis.scroll : window.scrollY;

      // Menu open state always shows the nav
      if (header.classList.contains('nav-open')) {
        header.classList.remove('nav-hidden');
        lastScrollY = currentScrollY;
        ticking = false;
        return;
      }

      // Always show nav when near the top of the page
      if (currentScrollY < scrollThreshold) {
        header.classList.remove('nav-hidden');
        lastScrollY = currentScrollY;
        ticking = false;
        return;
      }

      // Scrolling DOWN — hide nav; scrolling UP — show nav
      if (currentScrollY > lastScrollY) {
        header.classList.add('nav-hidden');
      } else {
        header.classList.remove('nav-hidden');
      }

      lastScrollY = currentScrollY;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(handleNavVisibility);
        ticking = true;
      }
    }

    if (lenis) {
      lenis.on('scroll', onScroll);
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    var hamburger = qs('.hamburger');
    if (hamburger) {
      hamburger.addEventListener('click', function () {
        header.classList.remove('nav-hidden');
      });
    }
  }

  /* ------------------------------------------------------------------------
     06. Mobile nav overlay
     ------------------------------------------------------------------------ */
  function initMobileNav() {
    var hamburger = qs('.hamburger');
    var overlay = qs('.mobile-nav');
    var header = qs('.site-header');
    if (!hamburger || !overlay) return;

    var links = qsa('.mobile-nav-links a', overlay);
    var cta = qs('.mobile-nav-cta', overlay);
    var social = qs('.mobile-nav-social', overlay);
    var staggerItems = links.concat([cta, social]).filter(Boolean);
    var isOpen = false;
    var animating = false;
    var navTl = null;
    var dur = reduceMotion ? 0 : 1;

    function openNav() {
      if (animating) return;
      animating = true;
      isOpen = true;
      hamburger.classList.add('is-open');
      hamburger.setAttribute('aria-expanded', 'true');
      if (header) header.classList.add('nav-open');
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      if (lenis) lenis.stop();
      document.documentElement.classList.add('lenis-stopped');

      navTl = gsap.timeline({ onComplete: function () { animating = false; navTl = null; } });
      navTl.set(overlay, { visibility: 'visible' })
        .to(overlay, { opacity: 1, duration: 0.4 * dur, ease: 'power2.out' })
        .fromTo(staggerItems,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6 * dur, stagger: 0.08 * dur, ease: 'power3.out' },
          '-=0.15'
        );
    }

    function closeNav() {
      if (navTl) { navTl.kill(); navTl = null; animating = false; }
      if (animating) return;
      animating = true;
      isOpen = false;
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      if (header) header.classList.remove('nav-open');

      var tl = gsap.timeline({
        onComplete: function () {
          overlay.classList.remove('is-open');
          overlay.setAttribute('aria-hidden', 'true');
          gsap.set(overlay, { visibility: 'hidden' });
          if (lenis) lenis.start();
          document.documentElement.classList.remove('lenis-stopped');
          animating = false;
        }
      });
      tl.to(staggerItems.slice().reverse(), {
          opacity: 0, y: 20, duration: 0.35 * dur, stagger: 0.05 * dur, ease: 'power2.in'
        })
        .to(overlay, { opacity: 0, duration: 0.35 * dur, ease: 'power2.in' }, '-=0.1');
    }

    hamburger.addEventListener('click', function () {
      isOpen ? closeNav() : openNav();
    });

    links.forEach(function (link) {
      link.addEventListener('click', function () {
        if (isOpen) closeNav();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closeNav();
    });
  }

  /* ------------------------------------------------------------------------
     07. Floating action button
     ------------------------------------------------------------------------ */
  function initFab() {
    var fab = qs('.fab');
    if (!fab) return;

    var main = qs('.fab-main', fab);
    var subs = qsa('.fab-sub', fab);
    var open = false;
    var dur = reduceMotion ? 0 : 1;

    function expand() {
      open = true;
      fab.classList.add('is-open');
      main.setAttribute('aria-expanded', 'true');
      gsap.to(subs.slice().reverse(), {
        opacity: 1,
        scale: 1,
        duration: 0.5 * dur,
        stagger: 0.06 * dur,
        ease: 'back.out(2)',
        overwrite: true
      });
    }

    function collapse() {
      open = false;
      fab.classList.remove('is-open');
      main.setAttribute('aria-expanded', 'false');
      gsap.to(subs, {
        opacity: 0,
        scale: 0,
        duration: 0.3 * dur,
        stagger: 0.04 * dur,
        ease: 'power2.in',
        overwrite: true
      });
    }

    main.addEventListener('click', function () {
      open ? collapse() : expand();
    });

    if (window.matchMedia('(hover: hover)').matches) {
      fab.addEventListener('mouseenter', expand);
      fab.addEventListener('mouseleave', collapse);
    }

    document.addEventListener('click', function (e) {
      if (open && !fab.contains(e.target)) collapse();
    });
  }

  /* ------------------------------------------------------------------------
     08. FAQ accordion — GSAP height animation
     ------------------------------------------------------------------------ */
  function initFaq() {
    var items = qsa('.faq-item');
    if (!items.length) return;

    var dur = reduceMotion ? 0 : 1;

    items.forEach(function (item) {
      var btn = qs('.faq-q', item);
      var answer = qs('.faq-a', item);
      var chevron = qs('svg', btn);
      if (!btn || !answer) return;

      gsap.set(answer, { height: 0 });
      btn.setAttribute('aria-expanded', 'false');

      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');

        // Close any other open item
        items.forEach(function (other) {
          if (other !== item && other.classList.contains('is-open')) {
            other.classList.remove('is-open');
            qs('.faq-q', other).setAttribute('aria-expanded', 'false');
            gsap.to(qs('.faq-a', other), { height: 0, duration: 0.5 * dur, ease: 'power3.inOut' });
            var otherChevron = qs('.faq-q svg', other);
            if (otherChevron) gsap.to(otherChevron, { rotation: 0, duration: 0.5 * dur, ease: 'power3.inOut' });
          }
        });

        if (isOpen) {
          item.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
          gsap.to(answer, { height: 0, duration: 0.5 * dur, ease: 'power3.inOut' });
          if (chevron) gsap.to(chevron, { rotation: 0, duration: 0.5 * dur, ease: 'power3.inOut' });
        } else {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          gsap.to(answer, {
            height: 'auto',
            duration: 0.6 * dur,
            ease: 'power3.inOut',
            onComplete: function () { ScrollTrigger.refresh(); }
          });
          if (chevron) gsap.to(chevron, { rotation: 180, duration: 0.5 * dur, ease: 'power3.inOut' });
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     09. Hero (home)
     ------------------------------------------------------------------------ */
  function initHero() {
    var hero = qs('.hero');
    if (!hero) return;

    var video = qs('.hero-media video', hero);
    var media = qs('.hero-media', hero);
    var logo = qs('.hero-logo', hero);
    var tagline = qs('.hero-tagline', hero);
    var actions = qs('.hero-actions', hero);
    var scrollHint = qs('.hero-scroll', hero);
    var overlayDeep = qs('.hero-overlay-deep', hero);

    // Video fallback — gradient already painted on .hero background
    if (video) {
      video.addEventListener('error', function () {
        media.style.display = 'none';
      });
      var src = qs('source', video);
      if (src) {
        src.addEventListener('error', function () {
          media.style.display = 'none';
        });
      }
    }

    if (!motionOK) return;

    if (tagline) wrapWords(tagline);

    var tl = gsap.timeline({ delay: 0.2 });

    if (logo) {
      tl.fromTo(logo,
        { opacity: 0, scale: 0.92, filter: 'brightness(0) invert(1) blur(8px)' },
        { opacity: 1, scale: 1, filter: 'brightness(0) invert(1) blur(0px)', duration: 1.4, ease: 'power3.out' }
      );
    }

    if (tagline) {
      tl.fromTo(qsa('.word-inner', tagline),
        { yPercent: 110, clipPath: 'inset(100% 0 0 0)' },
        { yPercent: 0, clipPath: 'inset(0% 0 0 0)', duration: 0.9, stagger: 0.1, ease: 'power3.out' },
        '-=0.7'
      );
    }

    if (actions) {
      tl.fromTo(actions.children,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' },
        '-=0.4'
      );
    }

    if (scrollHint) {
      tl.fromTo(scrollHint,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out' },
        '-=0.3'
      );
    }

    // Parallax + overlay deepen — desktop only
    if (!isMobile) {
      gsap.to(media, {
        yPercent: 40, // video tracks at ~0.4x scroll speed across the hero
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5
        }
      });

      if (overlayDeep) {
        gsap.to(overlayDeep, {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5
          }
        });
      }
    }
  }

  /* ------------------------------------------------------------------------
     10. Generic scroll reveals
     ------------------------------------------------------------------------ */
  function initReveals() {
    if (!motionOK) return;

    // Word-reveal headings
    qsa('[data-words]').forEach(function (heading) {
      wrapWords(heading);
      gsap.fromTo(qsa('.word-inner', heading),
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 1,
          stagger: 0.06,
          ease: 'power3.out',
          scrollTrigger: { trigger: heading, start: 'top 88%' }
        }
      );
    });

    // Single-element fade-up
    qsa('[data-reveal]').forEach(function (el) {
      gsap.fromTo(el,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' }
        }
      );
    });

    // Children stagger
    qsa('[data-reveal-group]').forEach(function (group) {
      var children = Array.prototype.slice.call(group.children);
      if (!children.length) return;
      gsap.fromTo(children,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: group, start: 'top 85%' }
        }
      );
    });

    // Fade-only stagger (identity strip)
    qsa('[data-fade-group]').forEach(function (group) {
      var children = Array.prototype.slice.call(group.children);
      if (!children.length) return;
      gsap.fromTo(children,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: { trigger: group, start: 'top 90%' }
        }
      );
    });

    // Slide in from right (paradise text, contact pills)
    qsa('[data-reveal-right]').forEach(function (group) {
      var children = Array.prototype.slice.call(group.children);
      if (!children.length) return;
      gsap.fromTo(children,
        { x: 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: group, start: 'top 85%' }
        }
      );
    });

    // Large card slide-up (featured package)
    qsa('[data-reveal-card]').forEach(function (el) {
      gsap.fromTo(el,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' }
        }
      );
    });
  }

  /* ------------------------------------------------------------------------
     11. Gallery tiles
     ------------------------------------------------------------------------ */
  function initGallery() {
    var grid = qs('.gallery-grid');
    if (!grid || !motionOK) return;

    var tiles = qsa('.gallery-tile', grid);
    gsap.fromTo(tiles,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.06,
        ease: 'power2.out',
        scrollTrigger: { trigger: grid, start: 'top 88%', once: true },
        onComplete: function () {
          tiles.forEach(function (t) { t.style.willChange = 'auto'; });
        }
      }
    );
  }

  /* ------------------------------------------------------------------------
     12. Horizontal scroll (experiences)
     ------------------------------------------------------------------------ */
  function initHorizontalScroll() {
    var section = qs('.hscroll');
    var track = qs('.hscroll-track');
    if (!section || !track) return;

    if (isMobile || !motionOK) return; // CSS handles vertical stacked fallback

    function getDistance() {
      return Math.max(0, track.scrollWidth - window.innerWidth);
    }

    gsap.to(track, {
      x: function () { return -getDistance(); },
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: function () { return '+=' + getDistance(); },
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });
  }

  /* ------------------------------------------------------------------------
     13. Clip-path photo reveals — [data-clip]
     ------------------------------------------------------------------------ */
  function initClipReveals() {
    if (!motionOK) return;

    qsa('[data-clip]').forEach(function (el) {
      gsap.fromTo(el,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.4,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: el, start: 'top 80%' }
        }
      );
    });
  }

  /* ------------------------------------------------------------------------
     14. Stats counters (about)
     ------------------------------------------------------------------------ */
  function initStats() {
    var numbers = qsa('.stat-number');
    if (!numbers.length) return;

    numbers.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';

      if (!motionOK) {
        el.textContent = prefix + target + suffix;
        return;
      }

      el.textContent = prefix + '0' + suffix;
      var counter = { val: 0 };

      gsap.to(counter, {
        val: target,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: function () {
          el.textContent = prefix + Math.round(counter.val) + suffix;
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     15. Testimonials carousel (about)
     ------------------------------------------------------------------------ */
  function initCarousel() {
    var carousel = qs('.carousel');
    if (!carousel) return;

    var viewport = qs('.carousel-viewport', carousel);
    var track = qs('.carousel-track', carousel);
    var slides = qsa('.carousel-slide', carousel);
    var dotsWrap = qs('.carousel-dots', carousel);
    if (!viewport || !track || slides.length < 2) return;

    var current = 0;
    var autoTimer = null;
    var dur = reduceMotion ? 0 : 0.8;

    // Build dots
    var dots = slides.map(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      dot.addEventListener('click', function () {
        goTo(i);
        restartAuto();
      });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      gsap.to(track, {
        xPercent: -100 * current,
        duration: dur,
        ease: 'power3.inOut'
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(function () { goTo(current + 1); }, 6000);
    }

    function stopAuto() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    function restartAuto() {
      stopAuto();
      startAuto();
    }

    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);

    // Drag / swipe
    var dragStartX = 0;
    var dragging = false;

    viewport.addEventListener('pointerdown', function (e) {
      dragging = true;
      dragStartX = e.clientX;
      viewport.classList.add('is-dragging');
      viewport.setPointerCapture(e.pointerId);
      stopAuto();
    });

    viewport.addEventListener('pointerup', function (e) {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove('is-dragging');
      var delta = e.clientX - dragStartX;
      if (Math.abs(delta) > 50) {
        goTo(delta < 0 ? current + 1 : current - 1);
      }
      startAuto();
    });

    viewport.addEventListener('pointercancel', function () {
      dragging = false;
      viewport.classList.remove('is-dragging');
      startAuto();
    });

    startAuto();
  }

  /* ------------------------------------------------------------------------
     16. Instagram carousel (contact) — drag scroll + progress line
     ------------------------------------------------------------------------ */
  function initIgCarousel() {
    var wrap = qs('.ig-carousel');
    if (!wrap) return;

    var track = qs('.ig-track', wrap);
    var fill = qs('.ig-progress-fill', wrap);
    if (!track) return;

    // Fixed-width fill that travels along the line as the track scrolls
    function updateProgressSimple() {
      var max = track.scrollWidth - track.clientWidth;
      var ratio = max > 0 ? track.scrollLeft / max : 1;
      if (fill) {
        fill.style.width = '25%';
        fill.style.left = (ratio * 75) + '%';
      }
    }

    track.addEventListener('scroll', updateProgressSimple, { passive: true });
    window.addEventListener('resize', updateProgressSimple);
    updateProgressSimple();

    // Drag to scroll
    var isDown = false;
    var startX = 0;
    var startScroll = 0;

    track.addEventListener('pointerdown', function (e) {
      isDown = true;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.classList.add('is-dragging');
      track.setPointerCapture(e.pointerId);
    });

    track.addEventListener('pointermove', function (e) {
      if (!isDown) return;
      track.scrollLeft = startScroll - (e.clientX - startX);
    });

    function endDrag() {
      isDown = false;
      track.classList.remove('is-dragging');
    }

    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('pointerleave', endDrag);
  }

  /* ------------------------------------------------------------------------
     17. Booking page entrance
     ------------------------------------------------------------------------ */
  function initBooking() {
    var split = qs('.booking-split');
    if (!split || !motionOK) return;

    var photo = qs('.booking-photo-img', split);
    var content = qs('.booking-content', split);

    // Ken Burns entrance
    if (photo) {
      gsap.fromTo(photo,
        { scale: 1.08 },
        { scale: 1, duration: 2.5, ease: 'power2.out' }
      );

      // Slow parallax drift on scroll — desktop only
      if (!isMobile) {
        gsap.to(photo, {
          y: -60,
          ease: 'none',
          scrollTrigger: {
            trigger: split,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5
          }
        });
      }
    }

    // Right-side stagger entrance on load
    if (content) {
      gsap.fromTo(Array.prototype.slice.call(content.children),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out', delay: 0.3 }
      );
    }
  }

  /* ------------------------------------------------------------------------
     18. Page hero parallax (sub-pages)
     ------------------------------------------------------------------------ */
  function initPageHero() {
    var hero = qs('.page-hero');
    if (!hero || !motionOK) return;

    var content = qs('.page-hero-content', hero);
    if (content) {
      gsap.fromTo(Array.prototype.slice.call(content.children),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.1, stagger: 0.15, ease: 'power3.out', delay: 0.25 }
      );
    }

    if (isMobile) return;

    var bg = qs('.page-hero-bg', hero);
    if (bg) {
      gsap.fromTo(bg,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5
          }
        }
      );
    }
  }

  /* ------------------------------------------------------------------------
     19. Lucide icons + init order
     ------------------------------------------------------------------------ */
  function initAll() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    initHeader();
    initNavVisibility();
    initMobileNav();
    initFab();
    initFaq();
    initHero();
    initPageHero();
    initReveals();
    initGallery();
    initHorizontalScroll();
    initClipReveals();
    initStats();
    initCarousel();
    initIgCarousel();
    initBooking();

    // Recalculate pins/triggers once everything has laid out
    window.addEventListener('load', function () {
      ScrollTrigger.refresh();
    });
  }
})();
