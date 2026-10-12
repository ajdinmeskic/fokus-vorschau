/* Gemeinsames Verhalten aller drei Designs: Navigation, Reveal, Vorschau-Hinweise */
(() => {
  const TOAST_DURATION_MS = 3200;
  const SCROLLED_CLASS = 'is-scrolled';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Toast für Funktionen, die in der Vorschau noch nicht aktiv sind */
  let toastTimer;
  function showToast(message) {
    let toast = document.querySelector('.preview-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'preview-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), TOAST_DURATION_MS);
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href="#vorschau"]');
    if (!link) return;
    event.preventDefault();
    showToast('Diese Seite ist in der Vorschau noch nicht enthalten.');
  });

  document.querySelectorAll('form[data-preview-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      showToast('Vorschau: Das Formular wird erst auf der fertigen Website verschickt.');
    });
  });

  /* Mobile Navigation */
  const navToggle = document.querySelector('[data-nav-toggle]');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const isOpen = document.body.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    document.querySelector('.main-nav')?.addEventListener('click', (event) => {
      if (!event.target.closest('a') || !document.body.classList.contains('nav-open')) return;
      document.body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  }

  /* Untermenüs: Klick/Tastatur (Hover übernimmt das CSS auf Desktop) */
  const subToggles = document.querySelectorAll('[data-sub-toggle]');
  function closeAllSubs(except) {
    subToggles.forEach((btn) => {
      if (btn !== except) btn.setAttribute('aria-expanded', 'false');
    });
  }
  subToggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      const willOpen = btn.getAttribute('aria-expanded') !== 'true';
      closeAllSubs(btn);
      btn.setAttribute('aria-expanded', String(willOpen));
    });
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.has-sub')) closeAllSubs();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeAllSubs();
    if (document.body.classList.contains('nav-open')) {
      document.body.classList.remove('nav-open');
      navToggle?.setAttribute('aria-expanded', 'false');
      navToggle?.focus();
    }
  });

  /* Header-Zustand beim Scrollen, ohne Scroll-Handler */
  const sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:12px;pointer-events:none;';
  document.body.prepend(sentinel);
  new IntersectionObserver(([entry]) => {
    document.body.classList.toggle(SCROLLED_CLASS, !entry.isIntersecting);
  }).observe(sentinel);

  /* Einblenden beim Scrollen */
  const revealItems = document.querySelectorAll('[data-reveal]');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((el) => el.classList.add('is-in'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealItems.forEach((el) => revealObserver.observe(el));
  }

  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
