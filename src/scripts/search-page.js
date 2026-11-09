import { buildWhatsAppLink } from './whatsapp.js';

const PAGE_SIZE = 24;

function createProductCard(product) {
  const href = `/product/${encodeURIComponent(product.slug)}/`;
  const card = document.createElement('article');
  card.className = 'product-card';
  card.dataset.cat = product.categorySlug;

  const media = document.createElement('div');
  media.className = `product-media ${product.swatch || ''}`.trim();

  const productLink = document.createElement('a');
  productLink.className = 'product-link';
  productLink.href = href;
  productLink.setAttribute('aria-label', `View ${product.name}`);

  const badge = document.createElement('span');
  badge.className = `product-badge ${product.badgeClass || ''}`.trim();
  badge.textContent = product.badge || '';
  productLink.append(badge);

  if (product.image) {
    const image = document.createElement('img');
    image.className = 'product-image';
    image.src = product.image;
    image.alt = product.imageAlt || product.name;
    image.loading = 'lazy';
    image.decoding = 'async';
    productLink.append(image);
  } else {
    const hanger = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    hanger.classList.add('swatch-icon');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#icon-hanger');
    hanger.append(use);
    productLink.append(hanger);
  }

  media.append(productLink);

  const info = document.createElement('div');
  info.className = 'product-info';

  const heading = document.createElement('h3');
  const titleLink = document.createElement('a');
  titleLink.href = href;
  titleLink.textContent = product.name;
  heading.append(titleLink);
  info.append(heading);

  const subtitle = document.createElement('p');
  subtitle.className = 'product-sub';
  subtitle.textContent = product.sub || '';
  info.append(subtitle);

  if (product.availabilityLabel) {
    const availability = document.createElement('p');
    availability.className = `product-availability ${product.available ? 'available' : 'unavailable'}`;
    availability.textContent = product.availabilityLabel;
    info.append(availability);
  }

  const whatsapp = document.createElement('a');
  whatsapp.className = 'btn btn-primary btn-block btn-sm whatsapp-btn';
  whatsapp.href = buildWhatsAppLink(product.name, window.location.href);
  whatsapp.target = '_blank';
  whatsapp.rel = 'noopener';
  whatsapp.innerHTML = '<svg aria-hidden="true"><use href="#icon-whatsapp"></use></svg> Request For Price';
  info.append(whatsapp);

  card.append(media, info);
  return card;
}

async function loadSearchIndex() {
  const response = await fetch('/search-index.json');
  if (!response.ok) {
    throw new Error(`Search index request failed (${response.status}).`);
  }

  const products = await response.json();
  if (!Array.isArray(products)) {
    throw new Error('Search index has an invalid format.');
  }
  return products;
}

function init() {
  const form = document.querySelector('.catalogue-search');
  const input = document.getElementById('catalogueSearchInput');
  const heading = document.getElementById('searchHeading');
  const status = document.getElementById('searchStatus');
  const results = document.getElementById('searchResults');
  const loadMore = document.getElementById('searchLoadMore');
  if (!form || !input || !heading || !status || !results || !loadMore) return;

  const query = new URLSearchParams(window.location.search).get('q')?.trim() || '';
  input.value = query;
  if (!query) return;

  heading.textContent = `Results for “${query}”`;
  status.textContent = 'Searching the collection…';

  let matches = [];
  let renderedCount = 0;

  const renderNextPage = () => {
    const nextProducts = matches.slice(renderedCount, renderedCount + PAGE_SIZE);
    const fragment = document.createDocumentFragment();
    nextProducts.forEach(product => fragment.append(createProductCard(product)));
    results.append(fragment);
    renderedCount += nextProducts.length;
    loadMore.hidden = renderedCount >= matches.length;
    loadMore.textContent = `Show more results (${matches.length - renderedCount} remaining)`;
  };

  loadMore.addEventListener('click', renderNextPage);

  loadSearchIndex()
    .then(products => {
      const normalizedQuery = query.toLocaleLowerCase();
      matches = products.filter(product => product.searchText.includes(normalizedQuery));

      if (!matches.length) {
        status.textContent = 'No pieces found. Try a different item, collection, fabric, or work.';
        return;
      }

      status.textContent = `${matches.length} ${matches.length === 1 ? 'piece' : 'pieces'} found. Showing the first ${Math.min(PAGE_SIZE, matches.length)}.`;
      renderNextPage();
    })
    .catch(error => {
      console.error('Unable to search the collection:', error);
      status.textContent = 'We could not load search results. Please check your connection and try again.';
    });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
