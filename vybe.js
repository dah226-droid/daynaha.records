const vybeLogoImage = document.querySelector('.top-nav .dot-logo img');

if (vybeLogoImage) {
  let rafId = null;

  function updateLogoSpinFromScroll() {
    rafId = null;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const spinDegrees = scrollY * 0.35;
    vybeLogoImage.style.transform = `rotate(${spinDegrees}deg)`;
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

  // Side A carousel options (exclude VYBE: carousel-vinyl-01).
  const candidates = [
    { src: 'assets/carousel-vinyl-02.png', alt: 'LUAG project record card', href: 'luag.html' },
    { src: 'assets/carousel-vinyl-05.png', alt: 'Umami Lab project record card', href: 'umami.html' },
    { src: 'assets/carousel-vinyl-08.png', alt: 'Tricoard project record card', href: 'tripage.html' },
    { src: 'assets/carousel-vinyl-06.png', alt: 'Board project record card', href: 'board.html' },
    { src: 'assets/carousel-vinyl-07.png', alt: 'Mag project record card', href: 'mag.html' }
  ];

  const picked = shuffleInPlace(candidates.slice()).slice(0, 3);
  grid.innerHTML = picked
    .map(
      (item) => `
        <a href="${item.href}" class="other-record-link" aria-label="View project">
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
