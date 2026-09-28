/* ============================================================
   Crafts of Cashmere — interactions
   One script, three pages. Every module guards for its own
   markup, so each page only wires what it actually contains.
   ============================================================ */

(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';

  // run fn once the window has loaded — immediately if that already happened
  // (the site boots after an async catalog fetch, which may resolve post-load)
  const whenLoaded = (fn) => {
    if (document.readyState === 'complete') fn();
    else window.addEventListener('load', fn);
  };

  // escape admin-entered text before it reaches innerHTML
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  const $id = (id) => document.getElementById(id);

  /* ================= shared state ================= */
  let lenis = null;
  let shopSetTab = null;   // set by initShop when the shop grid is on this page
  let cart = [];
  let renderCart = () => {};
  let addToCart = () => {};
  let showToast = () => {};

  function initSite() {

    /* ---------- smooth scroll ---------- */
    if (!reduced && typeof Lenis !== 'undefined') {
      lenis = new Lenis({ duration: 1.25, easing: (t) => 1 - Math.pow(1 - t, 4) });
      window.__lenis = lenis;
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }

    /* ---------- nav: scroll state, progress, dropdown ---------- */
    const nav = $id('nav');
    const progress = $id('scrollProgress');
    if (nav) {
      const solid = nav.dataset.solid === '1';
      const onScroll = () => {
        nav.classList.toggle('scrolled', solid || window.scrollY > 40);
        if (progress) {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    const navMenu = $id('navMenu');
    if (navMenu) {
      const navMenuBtn = $id('navMenuBtn');
      const navDropdown = $id('navDropdown');
      const closeMenu = () => {
        navMenu.classList.remove('open');
        navMenuBtn.setAttribute('aria-expanded', 'false');
      };
      navMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = navMenu.classList.toggle('open');
        navMenuBtn.setAttribute('aria-expanded', open);
      });
      document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('open') && !navMenu.contains(e.target)) closeMenu();
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
      navDropdown.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        // on the shop page, category links switch tabs in place instead of reloading
        if (link.dataset.cat && shopSetTab) {
          e.preventDefault();
          shopSetTab(link.dataset.cat, true);
        }
        closeMenu();
      });
    }

    /* ---------- same-page anchor links through Lenis ---------- */
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -20 });
        else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      });
    });

    /* ---------- toast ---------- */
    const toast = $id('toast');
    let toastTimer;
    showToast = (msg) => {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('on');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('on'), 2400);
    };

    /* ---------- cart (present on every page) ---------- */
    const CART_KEY = 'valley-cart';
    const cartCount = $id('cartCount');
    const cartItems = $id('cartItems');
    const cartTotal = $id('cartTotal');
    if (cartItems) {
      try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { cart = []; }
      // drop stale entries whose product ids no longer exist in the catalog
      cart = cart.filter((it) => PRODUCTS.some((p) => p.id === it.id));

      const saveCart = () => localStorage.setItem(CART_KEY, JSON.stringify(cart));

      renderCart = () => {
        const n = cart.reduce((s, it) => s + it.qty, 0);
        cartCount.textContent = n;
        cartCount.classList.toggle('on', n > 0);
        if (!cart.length) {
          cartItems.innerHTML = '<p class="cart-empty">Your cart is empty —<br/>the looms are waiting.</p>';
        } else {
          cartItems.innerHTML = cart.map((it) => {
            const p = PRODUCTS.find((x) => x.id === it.id);
            return `
            <div class="cart-item">
              <div class="cart-item-thumb">${p.img ? `<img src="${esc(p.img)}" alt="" />` : artSVG(p.motif || 'paisley', p.cat, `ci-${p.id}`)}</div>
              <div class="cart-item-info">
                <p class="cart-item-name">${esc(p.name)}</p>
                <p class="cart-item-price">${formatINR(p.price)}</p>
                <div class="cart-qty">
                  <button data-dec="${p.id}" aria-label="Decrease quantity">−</button>
                  <span>${it.qty}</span>
                  <button data-inc="${p.id}" aria-label="Increase quantity">+</button>
                </div>
              </div>
              <button class="cart-remove" data-rm="${p.id}">Remove</button>
            </div>`;
          }).join('');
        }
        cartTotal.textContent = formatINR(
          cart.reduce((s, it) => s + it.qty * PRODUCTS.find((x) => x.id === it.id).price, 0));
        saveCart();
      };

      addToCart = (id) => {
        const p = PRODUCTS.find((x) => x.id === id);
        if (!p) return;
        const it = cart.find((x) => x.id === id);
        if (it) it.qty += 1; else cart.push({ id, qty: 1 });
        renderCart();
        showToast(`${p.name} added to cart`);
      };

      cartItems.addEventListener('click', (e) => {
        const inc = e.target.closest('[data-inc]');
        const dec = e.target.closest('[data-dec]');
        const rm = e.target.closest('[data-rm]');
        if (inc) { cart.find((x) => x.id === inc.dataset.inc).qty += 1; renderCart(); }
        if (dec) {
          const it = cart.find((x) => x.id === dec.dataset.dec);
          it.qty -= 1;
          if (it.qty <= 0) cart = cart.filter((x) => x.id !== it.id);
          renderCart();
        }
        if (rm) { cart = cart.filter((x) => x.id !== rm.dataset.rm); renderCart(); }
      });

      const openCart = () => document.body.classList.add('cart-open');
      const closeCart = () => document.body.classList.remove('cart-open');
      $id('cartToggle').addEventListener('click', openCart);
      $id('cartClose').addEventListener('click', closeCart);
      $id('cartOverlay').addEventListener('click', closeCart);
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        closeCart();
        document.body.classList.remove('pd-open', 'co-open');
      });
      $id('cartCheckout').addEventListener('click', () => {
        if (!cart.length) { showToast('Your cart is empty'); return; }
        openCheckout();
      });
      renderCart();
    }

    /* ---------- checkout modal (every page with a cart) ---------- */
    const coForm = $id('coForm');
    function openCheckout() {
      if (!coForm) return;
      $id('coSummary').innerHTML = cart.map((it) => {
        const p = PRODUCTS.find((x) => x.id === it.id);
        return `<div class="co-line"><span>${it.qty}× ${esc(p.name)}</span><span>${formatINR(p.price * it.qty)}</span></div>`;
      }).join('') + `<div class="co-total"><span>Total</span><span>${formatINR(
        cart.reduce((s, it) => s + it.qty * PRODUCTS.find((x) => x.id === it.id).price, 0))}</span></div>`;
      document.body.classList.remove('cart-open');
      document.body.classList.add('co-open');
    }
    if (coForm) {
      const closeCheckout = () => document.body.classList.remove('co-open');
      $id('coClose').addEventListener('click', closeCheckout);
      $id('coOverlay').addEventListener('click', closeCheckout);
      coForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const placeBtn = $id('coPlace');
        placeBtn.disabled = true;
        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: $id('coName').value,
            email: $id('coEmail').value,
            address: $id('coAddress').value,
            items: cart.map((it) => ({ id: it.id, qty: it.qty })),
          }),
        })
          .then((r) => (r.ok ? r.json() : Promise.reject(new Error('order failed'))))
          .then((d) => {
            cart = [];
            renderCart();
            coForm.reset();
            closeCheckout();
            showToast(`Order ${d.orderId} placed — shukriya, we will write to you soon`);
          })
          .catch(() => showToast('Checkout needs the app server — run: node server.js'))
          .finally(() => { placeBtn.disabled = false; });
      });
    }

    /* ---------- collections (home) ---------- */
    const collectionGrid = $id('collectionGrid');
    if (collectionGrid) {
      collectionGrid.innerHTML = COLLECTIONS.map((c, i) => `
        <a class="collection-card" href="shop.html?cat=${c.id}" aria-label="Shop ${esc(c.name)}">
          <span class="collection-idx">0${i + 1}</span>
          <div class="collection-art"><img src="${c.img}" alt="${esc(c.alt)}" loading="lazy" /></div>
          <h3 class="collection-name">${esc(c.name)}</h3>
          <p class="collection-desc">${esc(c.desc)}</p>
          <span class="collection-link">
            Shop the craft
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </span>
        </a>`).join('');
    }

    /* ---------- shop: tabs + grid + product modal ---------- */
    const productGrid = $id('productGrid');
    if (productGrid) {
      const shopTabs = $id('shopTabs');
      const shopMeta = $id('shopMeta');
      const params = new URLSearchParams(location.search);
      let activeCat = CATALOG[params.get('cat')] ? params.get('cat') : 'pashmina';

      const productCardHTML = (p) => {
        const media = p.img
          ? `<img src="${esc(p.img)}" alt="${esc(p.alt)}" loading="lazy" />`
          : `<div class="product-art" role="img" aria-label="${esc(p.alt)}">${artSVG(p.motif, p.cat, p.id)}</div>`;
        return `
        <article class="product-card" data-id="${esc(p.id)}">
          <div class="product-media" data-tilt>
            ${media}
            <span class="product-badge">${esc(p.badge)}</span>
            <button class="product-add" data-id="${esc(p.id)}">Add to Cart</button>
          </div>
          <div class="product-info">
            <h3 class="product-name">${esc(p.name)}</h3>
            <p class="product-maker">${esc(p.maker)}</p>
            <p class="product-authentic">${AUTHENTIC_MARK}</p>
            <p class="product-price">${formatINR(p.price)}</p>
          </div>
        </article>`;
      };

      const bindTilt = (scope) => {
        if (reduced || !matchMedia('(pointer: fine)').matches) return;
        scope.querySelectorAll('[data-tilt]').forEach((el) => {
          el.addEventListener('pointermove', (e) => {
            const r = el.getBoundingClientRect();
            const rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
            const ry = ((e.clientX - r.left) / r.width - 0.5) * 5;
            el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
          });
          el.addEventListener('pointerleave', () => { el.style.transform = ''; });
        });
      };

      const renderProducts = (cat, animate) => {
        const c = CATALOG[cat];
        productGrid.innerHTML = c.items.map(productCardHTML).join('');
        if (shopMeta) shopMeta.textContent = `${c.items.length} pieces — ${c.label}`;
        bindTilt(productGrid);
        const cards = productGrid.querySelectorAll('.product-card');
        if (animate && hasGsap && !reduced) {
          gsap.fromTo(cards,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.045, ease: 'power3.out', overwrite: true });
        } else if (animate) {
          cards.forEach((el) => { el.style.opacity = 1; });
        }
        if (hasGsap && !reduced && window.ScrollTrigger) ScrollTrigger.refresh();
      };

      shopSetTab = (cat, scrollToGrid) => {
        if (!CATALOG[cat]) return;
        activeCat = cat;
        history.replaceState(null, '', `shop.html?cat=${cat}`);
        shopTabs.querySelectorAll('.shop-tab').forEach((b) => {
          const on = b.dataset.cat === cat;
          b.classList.toggle('on', on);
          b.setAttribute('aria-selected', on);
        });
        renderProducts(cat, true);
        if (scrollToGrid) {
          if (lenis) lenis.scrollTo(shopTabs, { offset: -110 });
          else shopTabs.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
        }
      };

      shopTabs.innerHTML = Object.entries(CATALOG).map(([key, c]) => `
        <button class="shop-tab${key === activeCat ? ' on' : ''}" role="tab"
          aria-selected="${key === activeCat}" data-cat="${key}">${esc(c.label)}</button>`).join('');
      shopTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.shop-tab');
        if (btn && btn.dataset.cat !== activeCat) shopSetTab(btn.dataset.cat, false);
      });

      renderProducts(activeCat, false);

      /* product detail modal */
      const pdMedia = $id('pdMedia');
      let pdCurrentId = null;
      const openProduct = (id) => {
        const p = PRODUCTS.find((x) => x.id === id);
        if (!p) return;
        pdCurrentId = id;
        pdMedia.innerHTML = p.img
          ? `<img src="${esc(p.img)}" alt="${esc(p.alt || p.name)}" />`
          : artSVG(p.motif || 'paisley', p.cat, `pd-${p.id}`);
        $id('pdBadge').textContent = p.badge || 'Handmade';
        $id('pdName').textContent = p.name;
        $id('pdMaker').textContent = p.maker;
        $id('pdDesc').textContent = p.desc ||
          'Made entirely by hand in the valley of Kashmir — signed by its maker and certified authentic.';
        $id('pdPrice').textContent = formatINR(p.price);
        document.body.classList.add('pd-open');
      };
      const closeProduct = () => document.body.classList.remove('pd-open');
      $id('pdClose').addEventListener('click', closeProduct);
      $id('pdOverlay').addEventListener('click', closeProduct);
      $id('pdAdd').addEventListener('click', () => {
        if (pdCurrentId) { addToCart(pdCurrentId); closeProduct(); }
      });

      productGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.product-add');
        if (btn) { addToCart(btn.dataset.id); return; }
        const card = e.target.closest('.product-card');
        if (card) openProduct(card.dataset.id);
      });
    }

    /* ---------- newsletter (home) ---------- */
    const newsletterForm = $id('newsletterForm');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: $id('nlEmail').value }),
        }).catch(() => {});
        e.target.style.display = 'none';
        $id('newsletterDone').style.display = 'block';
      });
    }

    /* ---------- marquee (home) ---------- */
    const marqueeTrack = $id('marqueeTrack');
    if (marqueeTrack) marqueeTrack.innerHTML += marqueeTrack.innerHTML;

    /* ---------- GSAP reveals — each guarded by presence ---------- */
    if (hasGsap && !reduced) {
      gsap.registerPlugin(ScrollTrigger);
      if (lenis) lenis.on('scroll', ScrollTrigger.update);

      const exists = (sel) => document.querySelector(sel);

      const fadeUp = (targets, trigger, stagger = 0.08) => {
        gsap.fromTo(targets,
          { opacity: 0, y: 44 },
          {
            opacity: 1, y: 0, duration: 1.1, stagger, ease: 'power3.out',
            scrollTrigger: { trigger, start: 'top 82%' },
          });
      };

      document.querySelectorAll('.section-head').forEach((head) => {
        fadeUp(head.querySelectorAll('.section-eyebrow, .section-title'), head, 0.12);
      });

      /* hero (home) */
      if (exists('.hero')) {
        const heroTl = gsap.timeline({ paused: true });
        gsap.set('.hero-line span', { yPercent: 110 });
        gsap.set(['.hero-eyebrow', '.hero-sub', '.hero-cta', '.hero-assure'], { y: 24 });
        heroTl
          .to('.hero-line span', { yPercent: 0, duration: 1.4, stagger: 0.14, ease: 'power4.out' }, 0.1)
          .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.4)
          .to('.hero-ornament', { opacity: 1, duration: 1.2, ease: 'power3.out' }, 0.55)
          .to('.hero-sub', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.7)
          .to('.hero-cta', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.9)
          .to('.hero-assure', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 1.05);
        heroTl.from('.hero-media img', { scale: 1.14, duration: 2.6, ease: 'power2.out' }, 0);
        window.__heroIntro = heroTl;
        gsap.to('.hero-media', {
          yPercent: 16, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
        });
        gsap.to('.hero-content', {
          yPercent: -14, opacity: 0, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: '75% top', scrub: true },
        });
      }

      /* collections curtain reveals (home) */
      gsap.utils.toArray('.collection-card').forEach((card, i) => {
        const art = card.querySelector('.collection-art');
        const content = card.querySelectorAll('.collection-idx, .collection-name, .collection-desc');
        const tl = gsap.timeline({
          delay: (i % 2) * 0.16,
          scrollTrigger: { trigger: card, start: 'top 86%' },
        });
        tl.set(card, { opacity: 1 }, 0)
          .fromTo(art,
            { clipPath: 'inset(100% 0 0 0)', scale: 1.16, transformOrigin: '50% 100%' },
            { clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 1.5, ease: 'power3.inOut' }, 0)
          .from(content,
            { opacity: 0, y: 26, duration: 0.9, stagger: 0.12, ease: 'power3.out',
              onComplete() { gsap.set(content, { clearProps: 'all' }); } }, 0.65);
      });

      /* shop grid initial reveal */
      if (exists('.product-grid .product-card')) {
        fadeUp('.product-card', '.product-grid', 0.05);
      }

      /* craft page */
      if (exists('.craft-rows')) fadeUp('.craft-row', '.craft-rows', 0.15);
      document.querySelectorAll('.craft-stat strong').forEach((el) => {
        gsap.from(el, {
          opacity: 0, y: 20, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        });
      });
      if (exists('.interlude img')) {
        gsap.fromTo('.interlude img',
          { clipPath: 'inset(100% 0 0 0)' },
          {
            clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'power3.inOut',
            scrollTrigger: { trigger: '.interlude', start: 'top 86%' },
          });
        gsap.fromTo('.interlude img',
          { yPercent: -12 },
          {
            yPercent: 12, ease: 'none',
            scrollTrigger: { trigger: '.interlude', start: 'top bottom', end: 'bottom top', scrub: true },
          });
      }
      if (exists('.atelier')) {
        fadeUp(['.atelier-motif', '.atelier-credit', '.atelier-body'], '.atelier', 0.15);
        gsap.fromTo('.q-line',
          { yPercent: 100, opacity: 1 },
          {
            yPercent: 0, duration: 1.3, stagger: 0.18, ease: 'power4.out',
            scrollTrigger: { trigger: '.atelier-quote', start: 'top 80%' },
          });
      }

      /* home extras */
      if (exists('.assurance')) fadeUp(['.assurance-statement', '.assurance-item'], '.assurance', 0.12);
      if (exists('.newsletter')) fadeUp('.newsletter-inner > *', '.newsletter', 0.1);
      if (marqueeTrack) gsap.to(marqueeTrack, { xPercent: -50, ease: 'none', duration: 26, repeat: -1 });

      whenLoaded(() => ScrollTrigger.refresh());
    } else {
      // no-motion fallback: make everything visible
      document.querySelectorAll(
        '.reveal-line, .hero-ornament, .section-eyebrow, .section-title, .craft-row, .product-card, .collection-card, .atelier-motif, .atelier-credit, .atelier-body, .newsletter-inner > *'
      ).forEach((el) => { el.style.opacity = 1; });
      document.querySelectorAll('.hero-line span').forEach((el) => { el.style.transform = 'none'; });
    }

    /* ---------- preloader (home only) ---------- */
    const preloader = $id('preloader');
    if (preloader) {
      whenLoaded(() => {
        setTimeout(() => {
          preloader.classList.add('done');
          if (window.__heroIntro) window.__heroIntro.play();
          else document.querySelectorAll('.hero-eyebrow, .hero-sub, .hero-cta, .hero-assure').forEach((el) => { el.style.opacity = 1; });
        }, 900);
      });
      setTimeout(() => {
        preloader.classList.add('done');
        if (window.__heroIntro && !window.__heroIntro.isActive() && window.__heroIntro.progress() === 0) window.__heroIntro.play();
      }, 4000);
    }
  }

  /* ---------- boot: prefer the live catalog from the app server ---------- */
  fetch('/api/catalog')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('no api'))))
    .then((d) => {
      if (d && d.catalog && Object.keys(d.catalog).length) {
        CATALOG = d.catalog;
        PRODUCTS = Object.values(CATALOG).flatMap((c) => c.items);
      }
    })
    .catch(() => { /* static hosting — built-in catalog stays */ })
    .finally(initSite);
})();
