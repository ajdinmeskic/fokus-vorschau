/* Design B: Zielgruppen-Tabs und Laufband */
(() => {
  /* Tabs nach WAI-ARIA-Muster: Klick, Pfeiltasten, Home/End */
  document.querySelectorAll('[data-tabs]').forEach((root) => {
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));

    function select(index, shouldFocus) {
      tabs.forEach((tab, i) => {
        const isActive = i === index;
        tab.setAttribute('aria-selected', String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
        panels[i].hidden = !isActive;
      });
      if (shouldFocus) tabs[index].focus();
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(i, false));
      tab.addEventListener('keydown', (event) => {
        const keyToIndex = {
          ArrowRight: (i + 1) % tabs.length,
          ArrowLeft: (i - 1 + tabs.length) % tabs.length,
          Home: 0,
          End: tabs.length - 1,
        };
        if (!(event.key in keyToIndex)) return;
        event.preventDefault();
        select(keyToIndex[event.key], true);
      });
    });
  });

  /* Laufband: Inhalt verdoppeln für eine nahtlose Schleife */
  document.querySelectorAll('.marquee-track').forEach((track) => {
    const copy = track.cloneNode(true);
    [...copy.children].forEach((child) => {
      child.setAttribute('aria-hidden', 'true');
      track.appendChild(child);
    });
  });
})();
