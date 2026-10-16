/* Entwurf: Schriftgrösse umschalten, mobiles Menü unter der Kopfzeile ausrichten */
(() => {
  const SIZE_KEY = 'fokus-schrift';
  const root = document.documentElement;
  const sizeButtons = document.querySelectorAll('[data-size-btn]');

  function applySize(size) {
    if (size === 'gross') root.dataset.size = 'gross';
    else delete root.dataset.size;
    sizeButtons.forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.sizeBtn === size)));
  }

  function saveSize(size) {
    try { localStorage.setItem(SIZE_KEY, size); } catch { /* Speicher nicht verfügbar */ }
  }

  applySize(root.dataset.size === 'gross' ? 'gross' : 'normal');
  sizeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      applySize(btn.dataset.sizeBtn);
      saveSize(btn.dataset.sizeBtn);
    });
  });

  /* Das mobile Menü beginnt direkt unter der (klebenden) Kopfzeile */
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('[data-nav-toggle]');
  if (header && navToggle) {
    navToggle.addEventListener('click', () => {
      root.style.setProperty('--header-h', `${Math.round(header.getBoundingClientRect().bottom)}px`);
    });
  }
})();
