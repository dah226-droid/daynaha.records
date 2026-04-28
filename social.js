const socialLogoImage = document.querySelector('.top-nav .dot-logo img');

if (socialLogoImage) {
  let rafId = null;

  function updateLogoSpinFromScroll() {
    rafId = null;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const spinDegrees = scrollY * 0.35;
    socialLogoImage.style.transform = `rotate(${spinDegrees}deg)`;
  }

  function requestLogoSpinUpdate() {
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(updateLogoSpinFromScroll);
  }

  window.addEventListener('scroll', requestLogoSpinUpdate, { passive: true });
  window.addEventListener('resize', requestLogoSpinUpdate);
  updateLogoSpinFromScroll();
}

function shuffleInPlace(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

(function setupOtherRecordsRandomizer() {
  const grid = document.querySelector('.other-records-grid[data-random-records="true"]');
  if (!grid) return;

  const candidates = [
    { src: 'assets/carousel-sideb-photography.png', alt: 'Photography side B record card', href: 'photography.html' }
  ];

  const picked = shuffleInPlace(candidates.slice()).slice(0, 1);
  grid.innerHTML = picked
    .map(
      (item) => `
        <a href="${item.href}" class="other-record-link" aria-label="View photography project">
          <img src="${item.src}" alt="${item.alt}" />
        </a>
      `
    )
    .join('');
})();

function getOtherRecordsStopScrollY() {
  const section = document.querySelector('.other-records-section');
  if (!section) return null;
  const rect = section.getBoundingClientRect();
  const deltaToStop = rect.bottom - ((window.innerHeight || 0) + 40);
  const currentY = window.scrollY || window.pageYOffset || 0;
  const stopY = currentY + deltaToStop;
  return Math.max(0, stopY);
}

(function enforceOtherRecordsScrollBoundary() {
  const section = document.querySelector('.other-records-section');
  if (!section) return;

  let touchStartY = null;

  function clampScrollToBoundary() {
    const stopY = getOtherRecordsStopScrollY();
    if (stopY === null) return;
    const currentY = window.scrollY || window.pageYOffset || 0;
    if (currentY > stopY) {
      window.scrollTo(0, stopY);
    }
  }

  function shouldLockDownScroll(deltaY) {
    if (deltaY <= 0) return false;
    const stopY = getOtherRecordsStopScrollY();
    if (stopY === null) return false;
    const currentY = window.scrollY || window.pageYOffset || 0;
    if (currentY >= stopY - 1) {
      window.scrollTo(0, stopY);
      return true;
    }
    return false;
  }

  window.addEventListener(
    'wheel',
    (event) => {
      if (shouldLockDownScroll(event.deltaY)) {
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
      if (shouldLockDownScroll(deltaY)) {
        event.preventDefault();
      }
      touchStartY = currentY;
    },
    { passive: false }
  );

  window.addEventListener('scroll', clampScrollToBoundary, { passive: true });
  window.addEventListener('resize', clampScrollToBoundary);
  clampScrollToBoundary();
})();

(function setupBackToTopRewind() {
  const backLink = document.querySelector('.back-link');
  if (!backLink) return;

  let rewindRafId = null;

  function animateRewindToTop() {
    if (rewindRafId !== null) {
      window.cancelAnimationFrame(rewindRafId);
      rewindRafId = null;
    }

    const startY = window.scrollY || window.pageYOffset || 0;
    if (startY <= 0) return;

    const durationMs = Math.min(700, Math.max(320, startY * 0.22));
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Accelerates upward so it feels like a quick rewind.
      const eased = progress * progress * progress;
      const nextY = Math.max(0, startY * (1 - eased));
      window.scrollTo(0, nextY);

      if (progress < 1) {
        rewindRafId = window.requestAnimationFrame(step);
      } else {
        rewindRafId = null;
        window.scrollTo(0, 0);
      }
    }

    rewindRafId = window.requestAnimationFrame(step);
  }

  backLink.addEventListener('click', (event) => {
    event.preventDefault();
    animateRewindToTop();
  });
})();

(function setupSideTocActiveState() {
  const toc = document.querySelector('.side-toc');
  const tocLinks = Array.from(document.querySelectorAll('.side-toc .toc-link'));
  if (!toc || !tocLinks.length) return;

  const purpleRegions = Array.from(document.querySelectorAll('.band, .other-records-section'));
  const linksById = new Map();
  const sections = [];

  tocLinks.forEach((link) => {
    const targetId = link.getAttribute('href')?.replace('#', '');
    if (!targetId) return;
    const section = document.getElementById(targetId);
    if (!section) return;
    linksById.set(targetId, link);
    sections.push(section);
  });

  if (!sections.length) return;

  function setActiveLink(activeId) {
    tocLinks.forEach((link) => link.classList.remove('active'));
    const activeLink = linksById.get(activeId);
    if (activeLink) activeLink.classList.add('active');
  }

  function updateTocContrast() {
    let hasPurpleOverlap = false;
    tocLinks.forEach((link) => {
      const rect = link.getBoundingClientRect();
      const x = rect.left + 4;
      const y = rect.top + rect.height / 2;
      const overlapsPurple = purpleRegions.some((region) => {
        const regionRect = region.getBoundingClientRect();
        return x >= regionRect.left && x <= regionRect.right && y >= regionRect.top && y <= regionRect.bottom;
      });
      if (overlapsPurple) hasPurpleOverlap = true;
      link.classList.toggle('on-purple', overlapsPurple);
    });
    toc.classList.toggle('on-purple', hasPurpleOverlap);
  }

  let contrastRafId = null;
  function requestContrastUpdate() {
    if (contrastRafId !== null) return;
    contrastRafId = window.requestAnimationFrame(() => {
      contrastRafId = null;
      updateTocContrast();
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    {
      root: null,
      rootMargin: '-22% 0px -70% 0px',
      threshold: 0
    }
  );

  sections.forEach((section) => observer.observe(section));
  setActiveLink(sections[0].id);
  updateTocContrast();
  window.addEventListener('scroll', requestContrastUpdate, { passive: true });
  window.addEventListener('resize', requestContrastUpdate);
})();
