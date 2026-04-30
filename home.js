const homeRoot = document.querySelector('.portfolio');
const heroAsset = document.querySelector('.hero-asset');
const badgeContainer = document.querySelector('.role-badges');
const badgeItems = Array.from(document.querySelectorAll('.role-badges span'));

let syncWorkNavFromProjects = () => {};
let hasPendingWorkHashNavigation = ['#projects', '#work', '#side-b'].includes((location.hash || '').toLowerCase());

function scrollPortfolioToWorkHighlight() {
  if (!homeRoot) return;
  if (typeof window.__homeCompleteIntroForProjects === 'function') {
    window.__homeCompleteIntroForProjects();
  }
  const topNav = document.querySelector('.top-nav');
  const sideBar = document.querySelector('.side-a-bar');
  if (!topNav || !sideBar) return;

  const navBottom = topNav.getBoundingClientRect().bottom;
  const sideBarTop = sideBar.getBoundingClientRect().top;
  const maxScroll = Math.max(0, homeRoot.scrollHeight - homeRoot.clientHeight);
  const deltaToTrigger = sideBarTop - navBottom;
  const targetScrollTop = Math.min(maxScroll, Math.max(0, homeRoot.scrollTop + deltaToTrigger));
  homeRoot.scrollTop = targetScrollTop;
  syncWorkNavFromProjects();
}

function scrollPortfolioToSideBHighlight() {
  if (!homeRoot) return;
  if (typeof window.__homeCompleteIntroForProjects === 'function') {
    window.__homeCompleteIntroForProjects();
  }
  const topNav = document.querySelector('.top-nav');
  const sideBBar = document.querySelector('.side-b-bar');
  if (!topNav || !sideBBar) return;

  const navBottom = topNav.getBoundingClientRect().bottom;
  const sideBTop = sideBBar.getBoundingClientRect().top;
  const maxScroll = Math.max(0, homeRoot.scrollHeight - homeRoot.clientHeight);
  const deltaToTrigger = sideBTop - navBottom;
  const targetScrollTop = Math.min(maxScroll, Math.max(0, homeRoot.scrollTop + deltaToTrigger));
  homeRoot.scrollTop = targetScrollTop;
  syncWorkNavFromProjects();
}

function applyWorkHashFromUrl() {
  const h = (location.hash || '').toLowerCase();
  if (h !== '#projects' && h !== '#work' && h !== '#side-b') return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (h === '#side-b') {
        scrollPortfolioToSideBHighlight();
      } else {
        scrollPortfolioToWorkHighlight();
      }
      hasPendingWorkHashNavigation = false;
    });
  });
}

if (homeRoot && heroAsset && badgeContainer && badgeItems.length) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let introProgress = prefersReducedMotion ? 1 : 0;
  let touchStartY = null;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function updateIntroScene() {
    const slideX = 170 * introProgress;
    heroAsset.style.setProperty('--hero-slide-x', `${slideX}px`);

    const segment = 1 / badgeItems.length;
    badgeItems.forEach((badge, index) => {
      const revealStart = index * segment;
      const revealProgress = clamp((introProgress - revealStart) / segment, 0, 1);
      badge.style.opacity = `${revealProgress}`;
      badge.style.transform = `translateY(${(1 - revealProgress) * 18}px)`;
    });

    if (introProgress >= 0.98) {
      badgeContainer.classList.add('is-visible');
    } else {
      badgeContainer.classList.remove('is-visible');
    }
  }

  const introScrollRate = 0.0016;

  function handleIntroDelta(deltaY) {
    if (prefersReducedMotion) return false;

    const atTop = homeRoot.scrollTop <= 2;

    if (introProgress >= 1) {
      if (deltaY >= 0 || !atTop) return false;
      introProgress = clamp(introProgress + deltaY * introScrollRate, 0, 1);
      updateIntroScene();
      homeRoot.scrollTop = 0;
      return introProgress > 0;
    }

    if (deltaY < 0 && introProgress > 0 && atTop) {
      introProgress = clamp(introProgress + deltaY * introScrollRate, 0, 1);
      updateIntroScene();
      homeRoot.scrollTop = 0;
      return introProgress > 0;
    }

    if (introProgress < 1 && deltaY > 0) {
      introProgress = clamp(introProgress + deltaY * introScrollRate, 0, 1);
      updateIntroScene();
      homeRoot.scrollTop = 0;
      return introProgress < 1;
    }

    if (deltaY <= 0 && introProgress <= 0) return true;

    return false;
  }

  window.addEventListener(
    'wheel',
    (event) => {
      const shouldLockScroll = handleIntroDelta(event.deltaY);
      if (shouldLockScroll) {
        event.preventDefault();
      }
    },
    { passive: false }
  );

  window.addEventListener(
    'touchstart',
    (event) => {
      touchStartY = event.touches?.[0]?.clientY ?? null;
    },
    { passive: true }
  );

  window.addEventListener(
    'touchmove',
    (event) => {
      if (touchStartY === null) return;
      const currentY = event.touches?.[0]?.clientY ?? touchStartY;
      const deltaY = touchStartY - currentY;
      const shouldLockScroll = handleIntroDelta(deltaY);
      if (shouldLockScroll) {
        event.preventDefault();
      }
      touchStartY = currentY;
    },
    { passive: false }
  );

  updateIntroScene();

  window.__homeCompleteIntroForProjects = function completeIntroForProjectsHash() {
    if (introProgress < 1) {
      introProgress = 1;
      updateIntroScene();
    }
  };
}

(function setupHomeWorkNav() {
  const workLink = document.querySelector('a.nav-work');
  const topNav = document.querySelector('.top-nav');
  const sideBar = document.querySelector('.side-a-bar');
  if (!homeRoot || !workLink || !topNav || !sideBar) return;
  let wasPurple = ['#projects', '#work', '#side-b'].includes((location.hash || '').toLowerCase());
  let lastScrollTop = homeRoot.scrollTop;

  syncWorkNavFromProjects = function updateWorkNavFromProjects() {
    const navBottom = topNav.getBoundingClientRect().bottom;
    const sideBarTop = sideBar.getBoundingClientRect().top;
    const sideBarAtTrigger = sideBarTop <= navBottom;
    const isWorkHash = ['#projects', '#work', '#side-b'].includes((location.hash || '').toLowerCase());
    const backAtTop = homeRoot.scrollTop <= 2;

    if (backAtTop) {
      wasPurple = false;
      if (isWorkHash && !hasPendingWorkHashNavigation) {
        history.replaceState(null, '', 'index.html');
      }
    } else if (isWorkHash || sideBarAtTrigger) {
      wasPurple = true;
    }

    workLink.classList.toggle('nav-work--in-projects', wasPurple);
    lastScrollTop = homeRoot.scrollTop;
  };

  homeRoot.addEventListener('scroll', syncWorkNavFromProjects, { passive: true });
  window.addEventListener('resize', syncWorkNavFromProjects);
  syncWorkNavFromProjects();

  workLink.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    wasPurple = true;
    hasPendingWorkHashNavigation = true;
    workLink.classList.add('nav-work--in-projects');
    history.replaceState(null, '', '#projects');
    scrollPortfolioToWorkHighlight();
  });
})();

(function setupBackToTopButton() {
  const backToTopButton = document.querySelector('.back-to-top');
  if (!homeRoot || !backToTopButton) return;

  backToTopButton.addEventListener('click', () => {
    homeRoot.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
})();

window.addEventListener('hashchange', applyWorkHashFromUrl);
applyWorkHashFromUrl();

(function setupProjectCarouselArrows() {
  const carousels = Array.from(document.querySelectorAll('.project-carousel'));
  if (!carousels.length) return;

  carousels.forEach((carousel) => {
    const viewport = carousel.querySelector('.carousel-viewport');
    const leftArrow = carousel.querySelector('.carousel-arrow--left');
    const rightArrow = carousel.querySelector('.carousel-arrow--right');
    if (!viewport || !leftArrow || !rightArrow) return;

    function getSlideStep() {
      const slide = viewport.querySelector('.carousel-slide');
      if (!slide) return viewport.clientWidth * 0.75;
      const slideWidth = slide.getBoundingClientRect().width;
      return Math.max(140, slideWidth + 6);
    }

    function nudgeCarousel(direction) {
      const step = getSlideStep();
      viewport.scrollBy({
        left: direction * step,
        behavior: 'smooth'
      });
    }

    function syncArrowVisibility() {
      const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      const atStart = viewport.scrollLeft <= 2;
      const atEnd = viewport.scrollLeft >= maxScrollLeft - 2;

      leftArrow.classList.toggle('is-hidden', atStart || maxScrollLeft <= 2);
      rightArrow.classList.toggle('is-hidden', atEnd || maxScrollLeft <= 2);
    }

    leftArrow.addEventListener('click', () => nudgeCarousel(-1));
    rightArrow.addEventListener('click', () => nudgeCarousel(1));
    viewport.addEventListener('scroll', syncArrowVisibility, { passive: true });
    window.addEventListener('resize', syncArrowVisibility);
    syncArrowVisibility();
  });
})();

(function setupProjectSlideLinks() {
  const linkedSlides = Array.from(document.querySelectorAll('.carousel-slide[data-project-url]'));
  if (!linkedSlides.length) return;

  linkedSlides.forEach((slide) => {
    const projectUrl = slide.getAttribute('data-project-url');
    if (!projectUrl) return;

    slide.setAttribute('tabindex', '0');
    slide.setAttribute('role', 'link');
    slide.setAttribute('aria-label', `${slide.alt}. Open project page.`);

    slide.addEventListener('click', () => {
      window.location.href = projectUrl;
    });

    slide.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      window.location.href = projectUrl;
    });
  });
})();

(function setupHeroDiscInteraction() {
  const heroDisc = document.querySelector('.hero-disc-overlay');
  if (!heroDisc) return;
  heroDisc.setAttribute('draggable', 'false');
  heroDisc.setAttribute('tabindex', '0');

  let isDragging = false;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let hasDragged = false;

  function pauseDisc() {
    heroDisc.classList.add('is-paused');
  }

  function resumeDisc() {
    heroDisc.classList.remove('is-paused');
  }

  heroDisc.addEventListener('click', () => {
    if (hasDragged) return;
    pauseDisc();
  });

  heroDisc.addEventListener('pointerdown', (event) => {
    isDragging = true;
    hasDragged = false;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    heroDisc.classList.add('is-dragging');
    heroDisc.setPointerCapture(event.pointerId);
  });

  heroDisc.addEventListener('pointermove', (event) => {
    if (!isDragging) return;
    const deltaX = event.clientX - pointerStartX;
    const deltaY = event.clientY - pointerStartY;
    const movedEnough = Math.hypot(deltaX, deltaY) > 6;
    if (!movedEnough) return;
    hasDragged = true;
    resumeDisc();
  });

  function stopDragging(event) {
    if (!isDragging) return;
    isDragging = false;
    heroDisc.classList.remove('is-dragging');
    if (heroDisc.hasPointerCapture(event.pointerId)) {
      heroDisc.releasePointerCapture(event.pointerId);
    }
  }

  heroDisc.addEventListener('pointerup', stopDragging);
  heroDisc.addEventListener('pointercancel', stopDragging);
  heroDisc.addEventListener('dragstart', (event) => {
    event.preventDefault();
  });
})();
