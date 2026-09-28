/* ============================================================
   Atelier Admin — catalog CRUD, orders, subscribers
   Talks to the API in server.js with an X-Admin-Key header.
   ============================================================ */

(function () {
  const KEY_STORE = 'cc-admin-key';
  let adminKey = sessionStorage.getItem(KEY_STORE) || '';
  let catalog = {};
  let activeCat = 'pashmina';
  let editing = null;          // item being edited, or null for "new"
  let pendingUpload = null;    // { filename, dataUrl } waiting to be uploaded on save

  const $ = (id) => document.getElementById(id);
  const loginView = $('loginView');
  const appView = $('appView');
  const toast = $('toast');
  let toastTimer;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('on'), 2600);
  }

  function api(path, opts = {}) {
    return fetch(path, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminKey,
        ...(opts.headers || {}),
      },
    }).then(async (r) => {
      if (r.status === 401) { signOut(); throw new Error('unauthorized'); }
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
      return data;
    });
  }

  /* ---------- auth ---------- */
  function signIn() {
    loginView.hidden = true;
    appView.hidden = false;
    loadCatalog();
  }
  function signOut() {
    adminKey = '';
    sessionStorage.removeItem(KEY_STORE);
    appView.hidden = true;
    loginView.hidden = false;
  }
  $('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const key = $('loginKey').value.trim();
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    }).then((r) => {
      if (!r.ok) throw new Error();
      adminKey = key;
      sessionStorage.setItem(KEY_STORE, key);
      $('loginError').classList.remove('on');
      signIn();
    }).catch(() => $('loginError').classList.add('on'));
  });
  $('logoutBtn').addEventListener('click', signOut);

  /* ---------- main tabs ---------- */
  $('mainTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    $('mainTabs').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === btn));
    ['products', 'orders', 'subscribers'].forEach((v) => { $(`view-${v}`).hidden = v !== btn.dataset.view; });
    if (btn.dataset.view === 'orders') loadOrders();
    if (btn.dataset.view === 'subscribers') loadSubs();
  });

  /* ---------- catalog ---------- */
  function loadCatalog() {
    api('/api/catalog').then((d) => {
      catalog = d.catalog;
      renderCatTabs();
      renderItems();
    }).catch((e) => showToast(`Could not load catalog: ${e.message}`));
  }

  function renderCatTabs() {
    $('catTabs').innerHTML = Object.entries(catalog).map(([key, c]) =>
      `<button data-cat="${key}" class="${key === activeCat ? 'on' : ''}">${c.label} · ${c.items.length}</button>`).join('');
  }
  $('catTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    activeCat = btn.dataset.cat;
    renderCatTabs();
    renderItems();
  });

  function thumbHTML(item) {
    if (item.img) return `<img src="/${item.img}" alt="" loading="lazy" />`;
    if (item.motif && typeof artSVG === 'function') return artSVG(item.motif, item.cat, `adm-${item.id}`);
    return '';
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function renderItems() {
    const items = (catalog[activeCat] || { items: [] }).items;
    $('itemList').innerHTML = items.length ? items.map((it) => `
      <div class="item-row">
        <div class="item-thumb">${thumbHTML(it)}</div>
        <div>
          <p class="item-name">${esc(it.name)}</p>
          <p class="item-desc">${esc(it.desc || '')}</p>
        </div>
        <p class="item-maker">${esc(it.maker)}</p>
        <p class="item-price">₹${Number(it.price).toLocaleString('en-IN')}</p>
        <button class="item-edit" data-id="${it.id}">Edit</button>
      </div>`).join('')
      : '<p class="t-empty">No pieces in this craft yet — add the first one.</p>';
  }

  $('itemList').addEventListener('click', (e) => {
    const btn = e.target.closest('.item-edit');
    if (!btn) return;
    const item = catalog[activeCat].items.find((it) => it.id === btn.dataset.id);
    if (item) openEditor(item);
  });
  $('addItemBtn').addEventListener('click', () => openEditor(null));

  /* ---------- editor ---------- */
  function renderPreview(item) {
    const box = $('editorPreview');
    if (pendingUpload) { box.innerHTML = `<img src="${pendingUpload.dataUrl}" alt="" />`; return; }
    if (item && item.img) { box.innerHTML = `<img src="/${item.img}" alt="" />`; return; }
    const motif = $('motifSelect').value || (item && item.motif);
    if (motif && typeof artSVG === 'function') { box.innerHTML = artSVG(motif, (item && item.cat) || activeCat, 'adm-preview'); return; }
    box.textContent = 'No photo yet';
  }

  function openEditor(item) {
    editing = item;
    pendingUpload = null;
    $('editorTitle').textContent = item ? 'Edit piece' : `New piece — ${catalog[activeCat].label}`;
    $('fName').value = item ? item.name : '';
    $('fMaker').value = item ? item.maker : '';
    $('fPrice').value = item ? item.price : '';
    $('fBadge').value = item ? item.badge : '';
    $('fDesc').value = item ? (item.desc || '') : '';
    $('fAlt').value = item ? (item.alt || '') : '';
    $('motifSelect').value = item && item.motif ? item.motif : '';
    $('photoInput').value = '';
    $('deleteBtn').style.display = item ? '' : 'none';
    $('editorStatus').textContent = '';
    renderPreview(item);
    document.body.classList.add('editor-open');
  }
  function closeEditor() { document.body.classList.remove('editor-open'); }
  $('editorClose').addEventListener('click', closeEditor);
  $('editorOverlay').addEventListener('click', closeEditor);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeEditor(); });

  $('photoInput').addEventListener('change', () => {
    const file = $('photoInput').files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { showToast('Image too large — 8MB max'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      pendingUpload = { filename: file.name, dataUrl: reader.result };
      renderPreview(editing);
    };
    reader.readAsDataURL(file);
  });

  $('motifSelect').addEventListener('change', () => {
    pendingUpload = null;
    $('photoInput').value = '';
    renderPreview(editing);
  });

  $('editorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = $('editorStatus');
    const fields = {
      name: $('fName').value,
      maker: $('fMaker').value,
      price: Number($('fPrice').value),
      badge: $('fBadge').value,
      desc: $('fDesc').value,
      alt: $('fAlt').value,
    };
    try {
      $('saveBtn').disabled = true;
      if (pendingUpload) {
        status.textContent = 'Uploading photo…';
        const up = await api('/api/upload', {
          method: 'POST',
          body: JSON.stringify({ filename: pendingUpload.filename, data: pendingUpload.dataUrl }),
        });
        fields.img = up.path;
      } else if ($('motifSelect').value) {
        fields.motif = $('motifSelect').value;
      }
      status.textContent = 'Saving…';
      if (editing) {
        const d = await api(`/api/products/${editing.id}`, { method: 'PUT', body: JSON.stringify(fields) });
        Object.assign(editing, d.item);
      } else {
        const d = await api('/api/products', { method: 'POST', body: JSON.stringify({ cat: activeCat, ...fields }) });
        catalog[activeCat].items.push(d.item);
      }
      status.textContent = '';
      renderCatTabs();
      renderItems();
      closeEditor();
      showToast('Saved — live on the site');
    } catch (err) {
      status.textContent = `Could not save: ${err.message}`;
    } finally {
      $('saveBtn').disabled = false;
    }
  });

  $('deleteBtn').addEventListener('click', async () => {
    if (!editing) return;
    if (!confirm(`Delete “${editing.name}” permanently?`)) return;
    try {
      await api(`/api/products/${editing.id}`, { method: 'DELETE' });
      catalog[activeCat].items = catalog[activeCat].items.filter((it) => it.id !== editing.id);
      renderCatTabs();
      renderItems();
      closeEditor();
      showToast('Piece deleted');
    } catch (err) {
      $('editorStatus').textContent = `Could not delete: ${err.message}`;
    }
  });

  /* ---------- orders & subscribers ---------- */
  function loadOrders() {
    api('/api/orders').then((d) => {
      const rows = d.orders.slice().reverse().map((o) => `
        <div class="t-row order">
          <span class="t-id">${esc(o.id)}</span>
          <span class="t-mute">${new Date(o.at).toLocaleString()}</span>
          <span>${esc(o.name)}<br/><span class="t-mute">${esc(o.email)}</span></span>
          <span class="t-mute">${o.lines.map((l) => `${l.qty}× ${esc(l.name)}`).join(', ')}</span>
          <span class="t-total">₹${Number(o.total).toLocaleString('en-IN')}</span>
        </div>`).join('');
      $('ordersTable').innerHTML = rows
        ? `<div class="t-row order head"><span>Order</span><span>Placed</span><span>Customer</span><span>Pieces</span><span>Total</span></div>${rows}`
        : '<p class="t-empty">No orders yet — the looms are patient.</p>';
    }).catch((e) => showToast(`Could not load orders: ${e.message}`));
  }

  function loadSubs() {
    api('/api/subscribers').then((d) => {
      const rows = d.subscribers.slice().reverse().map((s) => `
        <div class="t-row sub"><span>${esc(s.email)}</span><span class="t-mute">${new Date(s.at).toLocaleDateString()}</span></div>`).join('');
      $('subsTable').innerHTML = rows
        ? `<div class="t-row sub head"><span>Email</span><span>Joined</span></div>${rows}`
        : '<p class="t-empty">No subscribers yet.</p>';
    }).catch((e) => showToast(`Could not load subscribers: ${e.message}`));
  }

  /* ---------- boot ---------- */
  if (adminKey) {
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: adminKey }),
    }).then((r) => { if (r.ok) signIn(); else signOut(); }).catch(signOut);
  }
})();
