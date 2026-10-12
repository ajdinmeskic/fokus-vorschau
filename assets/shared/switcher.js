/* Vorschau-Leiste: wechselt zwischen Design A/B/C auf derselben Seite */
(() => {
  const DESIGNS = [
    { id: 'a', label: 'A', name: 'Warm' },
    { id: 'b', label: 'B', name: 'Klar' },
    { id: 'c', label: 'C', name: 'Fokus' },
  ];
  const HIDDEN_KEY = 'fokus-vorschau-bar-hidden';

  const isThumbnail = new URLSearchParams(window.location.search).has('thumb');
  const match = window.location.pathname.match(/^(.*\/)([abc])\/([^/]*)$/);
  if (!match || isThumbnail) return;
  const [, basePath, currentDesign, rawPage] = match;
  const page = rawPage || 'index.html';

  function readHidden() {
    try { return sessionStorage.getItem(HIDDEN_KEY) === '1'; } catch { return false; }
  }
  function writeHidden(value) {
    try { sessionStorage.setItem(HIDDEN_KEY, value ? '1' : '0'); } catch { /* Speicher nicht verfügbar */ }
  }

  const bar = document.createElement('nav');
  bar.className = 'preview-bar';
  bar.setAttribute('aria-label', 'Designvorschau wechseln');

  const designLinks = DESIGNS.map((design) => {
    const isCurrent = design.id === currentDesign;
    return `<a href="${basePath}${design.id}/${page}" class="preview-bar__design${isCurrent ? ' is-current' : ''}"${isCurrent ? ' aria-current="page"' : ''}>
      <span class="preview-bar__letter">${design.label}</span><span class="preview-bar__name">${design.name}</span></a>`;
  }).join('');

  bar.innerHTML = `
    <a href="${basePath}index.html" class="preview-bar__home" title="Zur Übersicht aller Designs">Vorschau</a>
    <div class="preview-bar__designs">${designLinks}</div>
    <button type="button" class="preview-bar__close" aria-label="Leiste ausblenden">×</button>`;

  const reopen = document.createElement('button');
  reopen.type = 'button';
  reopen.className = 'preview-bar-reopen';
  reopen.textContent = 'Design wechseln';

  function setHidden(hidden) {
    bar.hidden = hidden;
    reopen.hidden = !hidden;
    writeHidden(hidden);
  }

  bar.querySelector('.preview-bar__close').addEventListener('click', () => setHidden(true));
  reopen.addEventListener('click', () => setHidden(false));

  document.body.append(bar, reopen);
  setHidden(readHidden());
})();
