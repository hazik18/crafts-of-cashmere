import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCart, formatINR } from '../features/cart/CartContext';
import { useToast } from '../components/ToastContext';
import { CraftCategory, MotifType, Order, Product, Subscriber } from '../types';
import { CraftMotif } from '../features/products/Motif';
import '../styles/admin.css';

const KEY_STORE = 'cc-admin-key';

/* ─── Gallery photo state ───────────────────────────────────────────────── */
interface PendingPhoto {
  /** client-side ID for React key */
  uid: string;
  filename: string;
  /** data URL for preview before upload */
  dataUrl: string;
  /** server path after upload — null until uploaded */
  path: string | null;
}

let _uid = 0;
const makeUid = () => `photo-${++_uid}`;

/* ─── Component ─────────────────────────────────────────────────────────── */
export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [adminKey, setAdminKey] = useState<string>(() => sessionStorage.getItem(KEY_STORE) || '');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [inputKey, setInputKey] = useState<string>('');
  const [loginError, setLoginError] = useState<boolean>(false);

  const [activeView, setActiveView] = useState<'products' | 'orders' | 'subscribers'>('products');
  const [activeCat, setActiveCat] = useState<CraftCategory>('pashmina');

  const [orders, setOrders] = useState<Order[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  /* Editor drawer */
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);

  /* ── Text fields ── */
  const [fName, setFName] = useState('');
  const [fMaker, setFMaker] = useState('');
  const [fPrice, setFPrice] = useState<number | ''>('');
  const [fBadge, setFBadge] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fAlt, setFAlt] = useState('');
  const [fMotif, setFMotif] = useState<MotifType | ''>('');
  const [fStock, setFStock] = useState<'' | '0' | '1'>('');
  const [fLeadTime, setFLeadTime] = useState<number | ''>('');

  /* ── Gallery photos ──
     Each item is either an already-saved server path or a PendingPhoto.
     We keep one unified ordered list. */
  const [galleryPaths, setGalleryPaths] = useState<string[]>([]);   // server paths (saved)
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]); // new, not yet uploaded

  const [editorStatus, setEditorStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  /* Drag-to-reorder */
  const dragFromIdx = useRef<number | null>(null);

  const { catalog, refreshCatalog } = useCart();
  const { showToast } = useToast();

  /* ─── Auth ──────────────────────────────────────────────────────────── */
  const handleSignIn = useCallback(
    async (keyToVerify: string) => {
      try {
        const res = await api.login(keyToVerify);
        if (res.ok) {
          setAdminKey(keyToVerify);
          sessionStorage.setItem(KEY_STORE, keyToVerify);
          setIsAuthenticated(true);
          setLoginError(false);
          refreshCatalog();
        } else {
          setLoginError(true);
        }
      } catch {
        setLoginError(true);
      }
    },
    [refreshCatalog]
  );

  useEffect(() => {
    if (adminKey) handleSignIn(adminKey);
  }, [adminKey, handleSignIn]);

  const handleSignOut = () => {
    setAdminKey('');
    sessionStorage.removeItem(KEY_STORE);
    setIsAuthenticated(false);
    setInputKey('');
    showToast('Signed out of Atelier Admin.');
    navigate('/');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;
    handleSignIn(inputKey.trim());
  };

  /* ─── Orders & Subscribers ──────────────────────────────────────────── */
  const loadOrders = useCallback(async () => {
    try {
      const res = await api.getOrders(adminKey);
      setOrders(res.orders || []);
    } catch (err) {
      showToast(`Could not load orders: ${(err as Error).message}`);
    }
  }, [adminKey, showToast]);

  const loadSubscribers = useCallback(async () => {
    try {
      const res = await api.getSubscribers(adminKey);
      setSubscribers(res.subscribers || []);
    } catch (err) {
      showToast(`Could not load subscribers: ${(err as Error).message}`);
    }
  }, [adminKey, showToast]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeView === 'orders') loadOrders();
    if (activeView === 'subscribers') loadSubscribers();
  }, [activeView, isAuthenticated, loadOrders, loadSubscribers]);

  /* ─── Editor open / close ───────────────────────────────────────────── */
  const openEditor = (item: Product | null) => {
    setEditingItem(item);

    setFName(item ? item.name : '');
    setFMaker(item ? item.maker : '');
    setFPrice(item ? item.price : '');
    setFBadge(item ? item.badge : '');
    setFDesc(item ? item.desc || '' : '');
    setFAlt(item ? item.alt || '' : '');
    setFMotif(item && item.motif ? item.motif : '');
    setFStock(item && item.stock !== undefined ? (String(item.stock) as '' | '0' | '1') : '');
    setFLeadTime(item && item.leadTimeWeeks ? item.leadTimeWeeks : '');

    // Populate gallery from existing product
    setGalleryPaths(item ? [
      ...(item.img ? [item.img] : []),
      ...((item.images ?? []).filter((p) => p !== item.img)),
    ] : []);
    setPendingPhotos([]);

    setEditorStatus('');
    setIsEditorOpen(true);
    document.body.classList.add('editor-open');
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingItem(null);
    setPendingPhotos([]);
    setGalleryPaths([]);
    document.body.classList.remove('editor-open');
  };

  /* Drop the scroll lock if the page unmounts with the editor still open */
  useEffect(() => () => document.body.classList.remove('editor-open'), []);

  /* ─── Photo selection ───────────────────────────────────────────────── */
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const oversized = files.filter((f) => f.size > 8 * 1024 * 1024);
    if (oversized.length) {
      showToast(`${oversized.length} file(s) exceed 8MB and were skipped`);
    }

    const valid = files.filter((f) => f.size <= 8 * 1024 * 1024);

    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPendingPhotos((prev) => [
          ...prev,
          { uid: makeUid(), filename: file.name, dataUrl: reader.result as string, path: null },
        ]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same files can be re-selected
    e.target.value = '';
  };

  /* ─── Delete a photo ────────────────────────────────────────────────── */
  const deleteGalleryPath = (path: string) =>
    setGalleryPaths((prev) => prev.filter((p) => p !== path));

  const deletePendingPhoto = (uid: string) =>
    setPendingPhotos((prev) => prev.filter((p) => p.uid !== uid));

  /* ─── Drag-to-reorder helpers ───────────────────────────────────────── */
  // We track a combined ordered list of items (saved paths + pending)
  type GalleryItem =
    | { kind: 'saved'; path: string }
    | { kind: 'pending'; photo: PendingPhoto };

  const getCombinedGallery = (): GalleryItem[] => [
    ...galleryPaths.map((path): GalleryItem => ({ kind: 'saved', path })),
    ...pendingPhotos.map((photo): GalleryItem => ({ kind: 'pending', photo })),
  ];

  const applyReorder = (items: GalleryItem[]) => {
    setGalleryPaths(
      items.filter((it): it is { kind: 'saved'; path: string } => it.kind === 'saved').map((it) => it.path)
    );
    setPendingPhotos(
      items
        .filter((it): it is { kind: 'pending'; photo: PendingPhoto } => it.kind === 'pending')
        .map((it) => it.photo)
    );
  };

  const handleDragStart = (idx: number) => {
    dragFromIdx.current = idx;
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragFromIdx.current === null || dragFromIdx.current === idx) return;
    const items = getCombinedGallery();
    const moved = items.splice(dragFromIdx.current, 1)[0];
    items.splice(idx, 0, moved);
    dragFromIdx.current = idx;
    applyReorder(items);
  };

  const handleDragEnd = () => {
    dragFromIdx.current = null;
  };

  /* ─── Save ──────────────────────────────────────────────────────────── */
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fName.trim()) return;

    setIsSaving(true);
    setEditorStatus('Saving…');

    try {
      // 1. Upload any pending (new) photos in batch
      let uploadedPaths: string[] = [];
      if (pendingPhotos.length > 0) {
        setEditorStatus(`Uploading ${pendingPhotos.length} photo(s)…`);
        const batch = pendingPhotos.map((p) => ({ data: p.dataUrl, filename: p.filename }));
        const up = await api.uploadBatch(batch, adminKey);
        uploadedPaths = up.paths;
      }

      // 2. Build final ordered gallery
      const finalGallery = [...galleryPaths, ...uploadedPaths];
      const [coverImg, ...restImages] = finalGallery;

      const payload: Partial<Product> = {
        name: fName.trim(),
        maker: fMaker.trim(),
        price: Number(fPrice) || 0,
        badge: fBadge.trim(),
        desc: fDesc.trim(),
        alt: fAlt.trim(),
        img: coverImg ?? null,
        motif: coverImg ? null : (fMotif || 'paisley') as MotifType,
        images: restImages,
        stock: fStock !== '' ? Number(fStock) : undefined,
        leadTimeWeeks: fLeadTime !== '' ? Number(fLeadTime) : undefined,
      };

      if (editingItem) {
        await api.updateProduct(editingItem.id, payload, adminKey);
      } else {
        await api.createProduct({ cat: activeCat, ...payload }, adminKey);
      }

      await refreshCatalog();
      closeEditor();
      showToast('Saved — live on the site');
    } catch (err) {
      setEditorStatus(`Could not save: ${(err as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  /* ─── Delete product ────────────────────────────────────────────────── */
  const handleDeleteProduct = async () => {
    if (!editingItem) return;
    if (!window.confirm(`Delete "${editingItem.name}" permanently?`)) return;

    try {
      await api.deleteProduct(editingItem.id, adminKey);
      await refreshCatalog();
      closeEditor();
      showToast('Piece deleted');
    } catch (err) {
      setEditorStatus(`Could not delete: ${(err as Error).message}`);
    }
  };

  const currentCategory = catalog ? catalog[activeCat] : null;
  const items = currentCategory ? currentCategory.items : [];

  const combined = getCombinedGallery();

  /* ─── Render ────────────────────────────────────────────────────────── */
  return (
    <>
      {!isAuthenticated ? (
        /* Login Gate */
        <div className="login" id="loginView">
          <form className="login-card" id="loginForm" onSubmit={handleLoginSubmit}>
            <p className="login-eyebrow">Crafts of Cashmere</p>
            <h1>Atelier Admin</h1>
            <label htmlFor="loginKey">Admin key</label>
            <input
              type="password"
              id="loginKey"
              autoComplete="current-password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              required
            />
            <button type="submit">Enter the Atelier</button>
            <p className={`login-error ${loginError ? 'on' : ''}`} id="loginError">
              That key is not recognised.
            </p>
            <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
              <Link to="/" style={{ fontSize: '0.8125rem', color: 'var(--ink-mute)', textDecoration: 'none' }}>
                ← Return to Storefront
              </Link>
            </div>
          </form>
        </div>
      ) : (
        /* Authenticated Dashboard */
        <div className="app" id="appView">
          <header className="topbar">
            <div>
              <span className="topbar-logo">Crafts of Cashmere</span>
              <span className="topbar-sub">Atelier Admin</span>
            </div>

            <nav className="topbar-tabs" id="mainTabs">
              <button className={activeView === 'products' ? 'on' : ''} onClick={() => setActiveView('products')}>
                Products
              </button>
              <button className={activeView === 'orders' ? 'on' : ''} onClick={() => setActiveView('orders')}>
                Orders
              </button>
              <button className={activeView === 'subscribers' ? 'on' : ''} onClick={() => setActiveView('subscribers')}>
                Letters
              </button>
            </nav>

            <div className="topbar-actions">
              <a href="/" target="_blank" rel="noopener noreferrer" className="topbar-view-site">View site ↗</a>
              <button id="logoutBtn" onClick={handleSignOut}>Sign out</button>
            </div>
          </header>

          {/* ── Products View ───────────────────────────────────────── */}
          {activeView === 'products' && (
            <main className="view" id="view-products">
              <div className="view-head">
                <div className="cat-tabs" id="catTabs">
                  {catalog &&
                    (Object.entries(catalog) as [CraftCategory, { label: string; items: Product[] }][]).map(
                      ([key, c]) => (
                        <button
                          key={key}
                          className={key === activeCat ? 'on' : ''}
                          onClick={() => setActiveCat(key)}
                        >
                          {c.label} · {c.items.length}
                        </button>
                      )
                    )}
                </div>
                <button className="btn-primary" id="addItemBtn" onClick={() => openEditor(null)}>
                  + Add piece
                </button>
              </div>

              <div className="item-list" id="itemList">
                {items.length === 0 ? (
                  <p className="t-empty">No pieces in this craft yet — add the first one.</p>
                ) : (
                  items.map((it) => (
                    <div key={it.id} className="item-row">
                      <div className="item-thumb">
                        {it.img ? (
                          <img src={`/${it.img}`} alt={it.alt || it.name} loading="lazy" />
                        ) : (
                          <CraftMotif motif={it.motif || 'paisley'} paletteKey={it.cat} uid={`adm-${it.id}`} />
                        )}
                      </div>
                      <div>
                        <p className="item-name">{it.name}</p>
                        <p className="item-desc">{it.desc || ''}</p>
                      </div>
                      <p className="item-maker">{it.maker}</p>
                      <p className="item-price">{formatINR(it.price)}</p>
                      <button className="item-edit" data-id={it.id} onClick={() => openEditor(it)}>
                        Edit
                      </button>
                    </div>
                  ))
                )}
              </div>
            </main>
          )}

          {/* ── Orders View ─────────────────────────────────────────── */}
          {activeView === 'orders' && (
            <main className="view" id="view-orders">
              <h2 className="view-title">Orders</h2>
              <div className="table-wrap" id="ordersTable">
                {orders.length === 0 ? (
                  <p className="t-empty">No orders yet — the looms are patient.</p>
                ) : (
                  <>
                    <div className="t-row order head">
                      <span>Order</span><span>Placed</span><span>Customer</span>
                      <span>Pieces</span><span>Total</span>
                    </div>
                    {orders.slice().reverse().map((o) => (
                      <div key={o.id} className="t-row order">
                        <span className="t-id" data-label="Order">{o.id}</span>
                        <span className="t-mute" data-label="Placed">{new Date(o.at).toLocaleString()}</span>
                        <span data-label="Customer">
                          <span className="t-stack">
                            <span>{o.name}</span>
                            <span className="t-mute">{o.email}</span>
                          </span>
                        </span>
                        <span className="t-mute" data-label="Pieces">
                          {o.lines.map((l) => `${l.qty}× ${l.name}`).join(', ')}
                        </span>
                        <span className="t-total" data-label="Total">{formatINR(o.total)}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </main>
          )}

          {/* ── Subscribers View ────────────────────────────────────── */}
          {activeView === 'subscribers' && (
            <main className="view" id="view-subscribers">
              <h2 className="view-title">Letters from the valley — subscribers</h2>
              <div className="table-wrap" id="subsTable">
                {subscribers.length === 0 ? (
                  <p className="t-empty">No subscribers yet.</p>
                ) : (
                  <>
                    <div className="t-row sub head">
                      <span>Email</span><span>Joined</span>
                    </div>
                    {subscribers.slice().reverse().map((s, idx) => (
                      <div key={idx} className="t-row sub">
                        <span data-label="Email">{s.email}</span>
                        <span className="t-mute" data-label="Joined">{new Date(s.at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </main>
          )}
        </div>
      )}

      {/* ── Editor Drawer ──────────────────────────────────────────────── */}
      {isEditorOpen && (
        <>
          <div className="editor-overlay" id="editorOverlay" onClick={closeEditor} />
          <aside className="editor" id="editor" aria-label="Edit piece" data-lenis-prevent>
            <div className="editor-head">
              <h3 id="editorTitle">
                {editingItem ? 'Edit piece' : `New piece — ${catalog?.[activeCat]?.label || ''}`}
              </h3>
              <button className="editor-close" id="editorClose" onClick={closeEditor}>✕</button>
            </div>

            <form className="editor-form" id="editorForm" onSubmit={handleSaveProduct}>

              {/* ── Photo Gallery Strip ────────────────────────────── */}
              <div className="gallery-section">
                <div className="gallery-label">
                  <span>Photos</span>
                  <span className="gallery-hint">Drag to reorder · First = cover</span>
                </div>

                <div className="gallery-strip" id="galleryStrip">
                  {/* Saved paths */}
                  {combined.map((item, idx) => {
                    const src = item.kind === 'saved' ? `/${item.path}` : item.photo.dataUrl;
                    const label = item.kind === 'saved' ? item.path : item.photo.filename;
                    const isCover = idx === 0;
                    return (
                      <div
                        key={item.kind === 'saved' ? item.path : item.photo.uid}
                        className={`gallery-thumb${isCover ? ' gallery-thumb--cover' : ''}`}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        title={label}
                      >
                        <img
                          src={src}
                          alt={`Gallery photo ${idx + 1}`}
                        />
                        {isCover && <span className="gallery-cover-badge">Cover</span>}
                        <button
                          type="button"
                          className="gallery-delete"
                          aria-label="Remove photo"
                          onClick={() =>
                            item.kind === 'saved'
                              ? deleteGalleryPath(item.path)
                              : deletePendingPhoto(item.photo.uid)
                          }
                        >
                          ✕
                        </button>
                        {item.kind === 'pending' && item.photo.path === null && (
                          <span className="gallery-pending-badge">New</span>
                        )}
                      </div>
                    );
                  })}

                  {/* Empty-state or Add button */}
                  <label
                    className={`gallery-add${combined.length === 0 ? ' gallery-add--empty' : ''}`}
                    htmlFor="photoInput"
                    title="Add photos"
                  >
                    {combined.length === 0 ? (
                      <>
                        <span className="gallery-add-icon">＋</span>
                        <span className="gallery-add-text">Add photos</span>
                      </>
                    ) : (
                      <span className="gallery-add-icon">＋</span>
                    )}
                  </label>
                  <input
                    type="file"
                    id="photoInput"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    hidden
                    onChange={handlePhotoChange}
                  />
                </div>

                {/* Motif fallback when no photos */}
                {combined.length === 0 && (
                  <div className="gallery-motif-row">
                    <label htmlFor="motifSelect">or use motif artwork</label>
                    <select
                      id="motifSelect"
                      value={fMotif}
                      onChange={(e) => setFMotif(e.target.value as MotifType)}
                    >
                      <option value="">— none —</option>
                      <option value="paisley">Paisley</option>
                      <option value="vineBloom">Vine &amp; Bloom</option>
                      <option value="chinarLeaf">Chinar Leaf</option>
                      <option value="boxRosette">Box Rosette</option>
                      <option value="medallion">Medallion</option>
                      <option value="latticeJali">Lattice Jali</option>
                    </select>
                    {fMotif && (
                      <div className="motif-preview-sm">
                        <CraftMotif motif={fMotif as MotifType} paletteKey={activeCat} uid="preview" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Text fields ───────────────────────────────────── */}
              <label htmlFor="fName">Name</label>
              <input id="fName" value={fName} onChange={(e) => setFName(e.target.value)} required maxLength={120} />

              <label htmlFor="fMaker">Maker</label>
              <input id="fMaker" value={fMaker} onChange={(e) => setFMaker(e.target.value)} maxLength={120} placeholder="Woven by …" />

              <div className="editor-row">
                <div>
                  <label htmlFor="fPrice">Price (₹)</label>
                  <input
                    id="fPrice" type="number" min="0" step="100"
                    value={fPrice}
                    onChange={(e) => setFPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="fBadge">Badge</label>
                  <input id="fBadge" value={fBadge} onChange={(e) => setFBadge(e.target.value)} maxLength={40} placeholder="GI Certified" />
                </div>
              </div>

              <div className="editor-row">
                <div>
                  <label htmlFor="fStock">Stock</label>
                  <select id="fStock" value={fStock} onChange={(e) => setFStock(e.target.value as '' | '0' | '1')}>
                    <option value="">— unset —</option>
                    <option value="1">1 of 1 — Heirloom</option>
                    <option value="0">Woven to Order</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="fLeadTime">Lead time (weeks)</label>
                  <input
                    id="fLeadTime" type="number" min="1" step="1"
                    value={fLeadTime}
                    onChange={(e) => setFLeadTime(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="3"
                    disabled={fStock !== '0'}
                  />
                </div>
              </div>

              <label htmlFor="fDesc">Description</label>
              <textarea
                id="fDesc" rows={5} maxLength={2000}
                value={fDesc} onChange={(e) => setFDesc(e.target.value)}
                placeholder="The story of this piece — fibre, hands, time…"
              />

              <label htmlFor="fAlt">Photo alt text</label>
              <input
                id="fAlt" value={fAlt} onChange={(e) => setFAlt(e.target.value)}
                maxLength={300} placeholder="What the photo shows"
              />

              {/* ── Actions ───────────────────────────────────────── */}
              <div className="editor-actions">
                <button type="submit" className="btn-primary" id="saveBtn" disabled={isSaving}>
                  {isSaving ? 'Saving…' : 'Save piece'}
                </button>
                {editingItem && (
                  <button type="button" className="btn-danger" id="deleteBtn" onClick={handleDeleteProduct}>
                    Delete
                  </button>
                )}
              </div>
              <p className="editor-status" id="editorStatus">{editorStatus}</p>
            </form>
          </aside>
        </>
      )}
    </>
  );
};
