/* Entwurf: mobiles Menü direkt unter der (klebenden) Kopfzeile ausrichten */
(() => {
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('[data-nav-toggle]');
  if (!header || !navToggle) return;
  navToggle.addEventListener('click', () => {
    document.documentElement.style.setProperty('--header-h', `${Math.round(header.getBoundingClientRect().bottom)}px`);
  });
})();
