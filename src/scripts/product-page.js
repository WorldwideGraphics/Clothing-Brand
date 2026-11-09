function init() {
  // Gallery thumbnail switching
  const mainImage = document.getElementById('pdMainImage');
  const thumbs = document.querySelectorAll('.pd-thumb');
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      if (mainImage && thumb.dataset.src) mainImage.src = thumb.dataset.src;
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  // Tab switching
  const tabBtns = document.querySelectorAll('.pd-tab-btn');
  const activateTab = (btn, focus = false) => {
    tabBtns.forEach(tab => {
      const active = tab === btn;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(tab.dataset.tab);
      if (panel) {
        panel.classList.toggle('active', active);
        panel.hidden = !active;
      }
    });
    if (focus) btn.focus();
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => activateTab(btn));
    btn.addEventListener('keydown', event => {
      const currentIndex = Array.from(tabBtns).indexOf(btn);
      let nextIndex;
      if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabBtns.length;
      if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabBtns.length) % tabBtns.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabBtns.length - 1;
      if (nextIndex !== undefined) {
        event.preventDefault();
        activateTab(tabBtns[nextIndex], true);
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
