import { initWhatsAppButtons } from './whatsapp.js';

function init() {
  initWhatsAppButtons();

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('open');
      navToggle.classList.toggle('active');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    mainNav.addEventListener('click', event => {
      if (event.target.closest('a')) {
        mainNav.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  // Keep the catalogue navigation as one exclusive dropdown group.
  const navDropdowns = document.querySelectorAll('.nav-dropdown');
  navDropdowns.forEach(dropdown => {
    dropdown.addEventListener('toggle', () => {
      if (!dropdown.open) return;
      navDropdowns.forEach(other => {
        if (other !== dropdown) other.open = false;
      });
    });
  });

  // Header collection search
  const searchToggle = document.querySelector('.search-toggle');
  const headerSearch = document.querySelector('.header-search');
  const searchInput = document.getElementById('headerSearchInput');
  const searchClose = document.querySelector('.search-close');
  const setSearchOpen = (open) => {
    if (!searchToggle || !headerSearch) return;
    headerSearch.hidden = !open;
    searchToggle.setAttribute('aria-expanded', String(open));
    if (open) searchInput?.focus();
  };
  searchToggle?.addEventListener('click', () => setSearchOpen(headerSearch?.hidden));
  searchClose?.addEventListener('click', () => setSearchOpen(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && headerSearch && !headerSearch.hidden) setSearchOpen(false);
  });

  // Product filter pills (homepage only)
  const pills = document.querySelectorAll('.pill');
  const productCards = document.querySelectorAll('.product-card');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.dataset.filter;
      productCards.forEach(card => {
        const show = filter === 'all' || card.dataset.cat === filter;
        card.hidden = !show;
      });
    });
  });

  // Back to top button
  const toTop = document.getElementById('toTop');
  if (toTop) {
    window.addEventListener('scroll', () => {
      toTop.classList.toggle('visible', window.scrollY > 600);
    });
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // Highlight active nav link on scroll (homepage only — sections with ids live there)
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.main-nav a');
  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => link.classList.remove('active'));
          const active = document.querySelector(`.main-nav a[href="/#${entry.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    sections.forEach(section => observer.observe(section));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
