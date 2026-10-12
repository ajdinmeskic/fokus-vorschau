/* Design C: Fokus-Linse im Hero, Spotlight-Karten, Zähler */
(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const LENS_EASING = 0.14;
  const LENS_SETTLE_PX = 0.4;
  const COUNTER_DURATION_MS = 1600;

  /* Fokus-Linse: das scharfe Bild folgt dem Mauszeiger, weich nachgezogen */
  const hero = document.querySelector('[data-lens]');
  if (hero && hasFinePointer && !prefersReducedMotion) {
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;

    const rect = () => hero.getBoundingClientRect();
    const start = rect();
    target.x = current.x = start.width * Number(hero.dataset.lensX || 0.5);
    target.y = current.y = start.height * Number(hero.dataset.lensY || 0.5);

    function render() {
      current.x += (target.x - current.x) * LENS_EASING;
      current.y += (target.y - current.y) * LENS_EASING;
      hero.style.setProperty('--mx', `${current.x}px`);
      hero.style.setProperty('--my', `${current.y}px`);
      const settled = Math.abs(target.x - current.x) < LENS_SETTLE_PX && Math.abs(target.y - current.y) < LENS_SETTLE_PX;
      frame = settled ? 0 : requestAnimationFrame(render);
    }

    hero.addEventListener('pointermove', (event) => {
      const box = rect();
      target.x = event.clientX - box.left;
      target.y = event.clientY - box.top;
      if (!frame) frame = requestAnimationFrame(render);
    });
  }

  /* Spotlight auf Karten */
  if (hasFinePointer) {
    document.querySelectorAll('.card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const box = card.getBoundingClientRect();
        card.style.setProperty('--x', `${event.clientX - box.left}px`);
        card.style.setProperty('--y', `${event.clientY - box.top}px`);
      });
    });
  }

  /* Zähler zählen beim Sichtbarwerden hoch */
  const counters = document.querySelectorAll('[data-count]');
  function runCounter(el) {
    const endValue = Number(el.dataset.count);
    if (prefersReducedMotion) { el.textContent = String(endValue); return; }
    const startTime = performance.now();
    function tick(now) {
      const progress = Math.min((now - startTime) / COUNTER_DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(endValue * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    counters.forEach((el) => { el.textContent = '0'; });
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => counterObserver.observe(el));
  }
})();
