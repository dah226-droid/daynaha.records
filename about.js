const stage = document.getElementById('vinyl-stage');

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function animateAboutHero() {
  if (!stage) return;

  const viewport = window.innerHeight || 1;
  const maxScroll = Math.max(
    document.documentElement.scrollHeight - viewport,
    1
  );
  const scrollY = window.scrollY || window.pageYOffset || 0;
  const stageTop = stage.offsetTop;

  // Start once the hero is near view, then keep animating until page bottom.
  const start = Math.max(stageTop - viewport * 0.7, 0);
  const end = maxScroll;
  const progress = clamp((scrollY - start) / Math.max(end - start, 1), 0, 1);

  // about1 -> about2 style transition
  const sleeveX = -180 * progress;
  const sleeveY = 10 * progress;
  const sleeveScale = 1 - 0.08 * progress;
  const discX = 240 * progress;
  const discY = -10 * progress;
  const discScale = 1 - 0.04 * progress;
  const discRotate = 180 * progress;

  stage.style.setProperty('--sleeve-x', `${sleeveX}px`);
  stage.style.setProperty('--sleeve-y', `${sleeveY}px`);
  stage.style.setProperty('--sleeve-scale', `${sleeveScale}`);
  stage.style.setProperty('--disc-x', `${discX}px`);
  stage.style.setProperty('--disc-y', `${discY}px`);
  stage.style.setProperty('--disc-scale', `${discScale}`);
  stage.style.setProperty('--disc-rotate', `${discRotate}deg`);
}

window.addEventListener('scroll', animateAboutHero, { passive: true });
window.addEventListener('resize', animateAboutHero);
animateAboutHero();
