/* ==========================================================================
   ABBY'S BEAUTY SALON & ACADEMY — SHARED SHOP ENGINE
   Loaded by every shop page. Each page additionally defines its own
   PRODUCTS array (if it lists products) and calls renderProductGrid().
   Product data intentionally stays inline per page, not centralized here.
   ========================================================================== */
(function () {
  'use strict';

  /* ============ ICONS ============ */
  const ICONS = {
    hair: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M5 4c0 4-2 5-2 9s2 7 2 7"/><path d="M9 4c0 4-1.5 5-1.5 9s1.5 7 1.5 7"/><path d="M13 4c0 4-1.5 5-1.5 9s1.5 7 1.5 7"/><path d="M17 4c0 4 2 5 2 9s-2 7-2 7"/></svg>',
    bottle: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3h4v3.5l3 4.7a5 5 0 1 1-10 0l3-4.7V3z"/><path d="M9.3 15h5.4"/></svg>',
    gift: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="9" width="16" height="11" rx="1.2"/><path d="M4 13.2h16M12 9v11"/><path d="M12 9c-1.4-3-5-3.6-5-1.3C7 9 9.2 9 12 9zM12 9c1.4-3 5-3.6 5-1.3C17 9 14.8 9 12 9z"/></svg>',
    cap: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9l10-4 10 4-10 4-10-4z"/><path d="M6 11.3v3.8c0 1.5 2.7 3 6 3s6-1.5 6-3v-3.8"/><path d="M22 9v6"/></svg>',
    sparkle: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/></svg>',
    minus: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    plus: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    trash: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
    bag: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    arrow: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };

  /* ============ CATEGORY META (shared presentation constants — not product data) ============ */
  const CATEGORIES = {
    wigs:     { label: 'Wigs & Extensions',   icon: 'hair',   accent: '#1E3B2C', page: 'shop-wigs.html' },
    care:     { label: 'Haarpflege & Tools',  icon: 'bottle', accent: '#96574F', page: 'shop-haarpflege.html' },
    vouchers: { label: 'Gutscheine',          icon: 'gift',   accent: '#955057', page: 'shop-gutscheine.html' },
    academy:  { label: 'Akademie-Kurse',      icon: 'cap',    accent: '#6E3455', page: 'kurse.html' },
    services: { label: 'Dienstleistungen',    icon: 'sparkle', accent: '#B8826E', page: 'dienstleistungen.html' }
  };
  // Shop-hub categories only. 'academy' and 'services' stay in CATEGORIES above (their own
  // pages still need icon/accent/label) but are not part of the shop's own category set —
  // both are appointment/inquiry based, not cart-purchasable, so they live outside shop.html.
  const CATEGORY_ORDER = ['wigs', 'care', 'vouchers'];

  /* ============ HELPERS ============ */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function formatPrice(n) {
    return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }
  window.formatPrice = formatPrice;

  /* ============ PRODUCT GRID (generic — takes any page's own product list) ============ */
  const shopGrid = document.getElementById('shopGrid');
  let currentProducts = [];

  function productCardHTML(p) {
    const cat = CATEGORIES[p.cat];
    const isViewOnly = p.priceFrom && p.detailUrl;
    const variantsHTML = p.variants.map((v, vi) => `
      <label class="variant-row">
        <span class="variant-label">${escapeHtml(v.label)}</span>
        <select class="variant-select" data-label="${escapeHtml(v.label)}" data-vindex="${vi}">
          ${v.options.map(o => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join('')}
        </select>
      </label>`).join('');

    const visualInner = p.img
      ? `<img class="product-photo" src="${escapeHtml(p.img)}" alt="${escapeHtml(p.name)}" loading="lazy">`
      : `<div class="visual-seal">${ICONS[cat.icon]}</div><span class="visual-cat-label">${escapeHtml(cat.label)}</span>`;
    const visualHTML = p.detailUrl
      ? `<a href="${escapeHtml(p.detailUrl)}" class="product-visual-link" aria-label="${escapeHtml(p.name)} ansehen">${visualInner}</a>`
      : visualInner;
    const nameHTML = p.detailUrl
      ? `<a href="${escapeHtml(p.detailUrl)}" class="product-name-link">${escapeHtml(p.name)}</a>`
      : escapeHtml(p.name);

    const isBooking = !!p.bookingUrl;
    const bookingPriceLabel = p.priceFrom ? escapeHtml(p.priceFrom) : (typeof p.price === 'number' ? formatPrice(p.price) : 'Auf Anfrage');
    const footerHTML = isBooking
      ? `<div class="product-footer">
          <span class="product-price">${bookingPriceLabel}</span>
          <a href="${escapeHtml(p.bookingUrl)}" class="btn-add">Termin anfragen</a>
        </div>`
      : isViewOnly
      ? `<div class="product-footer">
          <span class="product-price">${escapeHtml(p.priceFrom)}</span>
          <a href="${escapeHtml(p.detailUrl)}" class="btn-add">Ansehen</a>
        </div>`
      : `<div class="product-variants">${variantsHTML}</div>
        <div class="product-footer">
          <span class="product-price">${formatPrice(p.price)}</span>
          <button class="btn-add" type="button" data-id="${p.id}">In den Warenkorb</button>
        </div>`;

    return `
    <article class="product-card" data-cat="${p.cat}" data-sub="${p.sub || ''}">
      <div class="product-visual" style="--accent:${cat.accent}">
        ${visualHTML}
      </div>
      <div class="product-info">
        <h3 class="product-name font-display">${nameHTML}</h3>
        <p class="product-desc">${p.desc}</p>
        ${footerHTML}
      </div>
    </article>`;
  }

  function renderProductGrid(products) {
    if (!shopGrid) return;
    currentProducts = products;
    shopGrid.innerHTML = products.map(productCardHTML).join('');
    observeReveal();
  }
  window.renderProductGrid = renderProductGrid;

  /* ============ OPTIONAL SUB-FILTER (scoped within one category page) ============ */
  function initSubFilter(allProducts, barId) {
    const bar = document.getElementById(barId || 'subFilterBar');
    if (!bar) { renderProductGrid(allProducts); return; }
    bar.addEventListener('click', e => {
      const btn = e.target.closest('.filter-pill');
      if (!btn) return;
      bar.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('is-active'));
      btn.classList.add('is-active');
      const sub = btn.dataset.sub;
      const list = sub === 'all' ? allProducts : allProducts.filter(p => p.sub === sub);
      renderProductGrid(list);
    });
    renderProductGrid(allProducts);
  }
  window.initSubFilter = initSubFilter;

  if (shopGrid) {
    shopGrid.addEventListener('click', e => {
      const btn = e.target.closest('.btn-add');
      if (!btn) return;
      const card = btn.closest('.product-card');
      const product = currentProducts.find(p => p.id === btn.dataset.id);
      if (!product) return;
      const variantParts = [];
      card.querySelectorAll('.variant-select').forEach(sel => {
        variantParts.push(sel.dataset.label + ': ' + sel.value);
      });
      addToCart(product, variantParts.join(' · '));
      btn.classList.add('added');
      btn.textContent = 'Hinzugefügt';
      setTimeout(() => { btn.classList.remove('added'); btn.textContent = 'In den Warenkorb'; }, 1000);
      openCart();
    });
  }

  /* ============ SCROLL REVEAL (product cards + category tiles) ============ */
  let revealObserver;
  function observeReveal() {
    const targets = document.querySelectorAll('.product-card:not(.is-visible), .category-tile:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      targets.forEach(c => c.classList.add('is-visible'));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
    }
    targets.forEach(c => revealObserver.observe(c));
  }

  /* ============ CART STATE ============ */
  let cart = [];

  function addToCart(product, variantText) {
    const key = product.id + '::' + variantText;
    const existing = cart.find(i => i.key === key);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        key, id: product.id, name: product.name, price: product.price,
        variantText, qty: 1, accent: CATEGORIES[product.cat].accent, icon: CATEGORIES[product.cat].icon,
        img: product.img || null
      });
    }
    renderCart();
  }
  window.addToCart = addToCart;
  function changeQty(key, delta) {
    const item = cart.find(i => i.key === key);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.key !== key);
    renderCart();
  }
  function removeItem(key) {
    cart = cart.filter(i => i.key !== key);
    renderCart();
  }
  function cartTotal() { return cart.reduce((sum, i) => sum + i.price * i.qty, 0); }
  function cartCount() { return cart.reduce((sum, i) => sum + i.qty, 0); }

  function cartLineHTML(i) {
    const thumbHTML = i.img
      ? `<img class="cart-line-photo" src="${escapeHtml(i.img)}" alt="">`
      : ICONS[i.icon];
    return `
    <div class="cart-line" data-key="${escapeHtml(i.key)}">
      <div class="cart-line-visual" style="--accent:${i.accent}">${thumbHTML}</div>
      <div class="cart-line-info">
        <p class="cart-line-name">${escapeHtml(i.name)}</p>
        ${i.variantText ? `<p class="cart-line-variant">${escapeHtml(i.variantText)}</p>` : ''}
        <div class="cart-line-controls">
          <button class="qty-btn" type="button" data-action="minus" data-key="${escapeHtml(i.key)}" aria-label="Menge verringern">${ICONS.minus}</button>
          <span class="qty-value">${i.qty}</span>
          <button class="qty-btn" type="button" data-action="plus" data-key="${escapeHtml(i.key)}" aria-label="Menge erhöhen">${ICONS.plus}</button>
          <button class="remove-btn" type="button" data-action="remove" data-key="${escapeHtml(i.key)}" aria-label="Entfernen">${ICONS.trash}</button>
        </div>
      </div>
      <div class="cart-line-price">${formatPrice(i.price * i.qty)}</div>
    </div>`;
  }

  const cartBody = document.getElementById('cartBody');
  const cartBadge = document.getElementById('cartBadge');
  const cartTotalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  function renderCart() {
    if (!cartBadge) return;
    const count = cartCount();
    cartBadge.textContent = String(count);
    cartBadge.style.display = count > 0 ? 'flex' : 'none';

    if (cart.length === 0) {
      cartBody.innerHTML = `
        <div class="cart-empty">
          ${ICONS.bag}
          <p>Dein Warenkorb ist noch leer.</p>
        </div>`;
    } else {
      cartBody.innerHTML = cart.map(cartLineHTML).join('');
    }
    cartTotalEl.textContent = formatPrice(cartTotal());
    checkoutBtn.classList.toggle('is-disabled', cart.length === 0);
  }

  if (cartBody) {
    cartBody.addEventListener('click', e => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const key = btn.dataset.key;
      const action = btn.dataset.action;
      if (action === 'minus') changeQty(key, -1);
      if (action === 'plus') changeQty(key, 1);
      if (action === 'remove') removeItem(key);
    });
  }

  /* ============ CART DRAWER OPEN/CLOSE ============ */
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartToggle = document.getElementById('cartToggle');
  const cartClose = document.getElementById('cartClose');

  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.add('is-open');
    cartOverlay.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }
  window.openCart = openCart;
  function closeCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('is-open');
    cartOverlay.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }
  if (cartToggle) cartToggle.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  /* ============ MOBILE NAV ============ */
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeCart(); closeMobileNav(); }
  });

  /* ============ NEWSLETTER ============ */
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', e => {
      e.preventDefault();
      newsletterForm.style.display = 'none';
      document.getElementById('newsletterSuccess').style.display = 'flex';
    });
  }

  /* ============ CATEGORY TILES (hub page reveal-on-scroll only; markup is static HTML) ============ */
  document.addEventListener('DOMContentLoaded', observeReveal);

  /* ============ INIT ============ */
  renderCart();

})();
