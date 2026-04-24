// ── Custom Cursor ──
const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

const hoverTargets = document.querySelectorAll('a, button, .project-item, .tt-knob, .turntable-wrap');
hoverTargets.forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('expanded'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('expanded'));
});

// ── Scroll Reveal ──
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
reveals.forEach(r => observer.observe(r));

// ── Knob click rotate ──
document.querySelectorAll('.tt-knob').forEach(knob => {
  let rot = 0;
  knob.addEventListener('click', () => {
    rot += 45;
    knob.style.transform = `rotate(${rot}deg) scale(1.1)`;
    setTimeout(() => { knob.style.transform = `rotate(${rot}deg)`; }, 150);
  });
});

// ── Subtle hero parallax on scroll ──
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const title = document.querySelector('.hero-title');
  if (title) title.style.transform = `translateY(${y * 0.08}px)`;
});
