import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useCart, formatINR } from '../features/cart/CartContext';
import { useToast } from '../components/ToastContext';
import { CraftCategory, MotifType, Order, Product, Subscriber } from '../types';
import { CraftMotif } from '../features/products/Motif';
import '../styles/admin.css';

const KEY_STORE = 'cc-admin-key';

export const AdminPage: React.FC = () => {
  const [adminKey, setAdminKey] = useState<string>(() => sessionStorage.getItem(KEY_STORE) || '');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [inputKey, setInputKey] = useState<string>('');
  const [loginError, setLoginError] = useState<boolean>(false);

  const [activeView, setActiveView] = useState<'products' | 'orders' | 'subscribers'>('products');
  const [activeCat, setActiveCat] = useState<CraftCategory>('pashmina');

  const [orders, setOrders] = useState<Order[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  // Editor drawer state
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [pendingUpload, setPendingUpload] = useState<{ filename: string; dataUrl: string } | null>(null);

  const [fName, setFName] = useState('');
  const [fMaker, setFMaker] = useState('');
  const [fPrice, setFPrice] = useState<number | ''>('');
  const [fBadge, setFBadge] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fAlt, setFAlt] = useState('');
  const [fMotif, setFMotif] = useState<MotifType | ''>('');
  const [editorStatus, setEditorStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { catalog, refreshCatalog } = useCart();
  const { showToast } = useToast();

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
    if (adminKey) {
      handleSignIn(adminKey);
    }
  }, [adminKey, handleSignIn]);

  const handleSignOut = () => {
    setAdminKey('');
    sessionStorage.removeItem(KEY_STORE);
    setIsAuthenticated(false);
    setInputKey('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;
    handleSignIn(inputKey.trim());
  };

  // Load orders
  const loadOrders = useCallback(async () => {
    try {
      const res = await api.getOrders(adminKey);
      setOrders(res.orders || []);
    } catch (err) {
      showToast(`Could not load orders: ${(err as Error).message}`);
    }
  }, [adminKey, showToast]);

  // Load subscribers
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

  const openEditor = (item: Product | null) => {
    setEditingItem(item);
    setPendingUpload(null);
    setFName(item ? item.name : '');
    setFMaker(item ? item.maker : '');
    setFPrice(item ? item.price : '');
    setFBadge(item ? item.badge : '');
    setFDesc(item ? item.desc || '' : '');
    setFAlt(item ? item.alt || '' : '');
    setFMotif(item && item.motif ? item.motif : '');
    setEditorStatus('');
    setIsEditorOpen(true);
    document.body.classList.add('editor-open');
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingItem(null);
    setPendingUpload(null);
    document.body.classList.remove('editor-open');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast('Image too large — 8MB max');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPendingUpload({ filename: file.name, dataUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fName.trim()) return;

    setIsSaving(true);
    setEditorStatus('Saving…');

    try {
      let imagePath = editingItem?.img || null;

      if (pendingUpload) {
        setEditorStatus('Uploading photo…');
        const up = await api.uploadImage(pendingUpload.dataUrl, pendingUpload.filename, adminKey);
        imagePath = up.path;
      }

      const payload: Partial<Product> = {
        name: fName.trim(),
        maker: fMaker.trim(),
        price: Number(fPrice) || 0,
        badge: fBadge.trim(),
        desc: fDesc.trim(),
        alt: fAlt.trim(),
        img: imagePath,
        motif: imagePath ? null : fMotif || 'paisley',
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

  const handleDeleteProduct = async () => {
    if (!editingItem) return;
    if (!window.confirm(`Delete “${editingItem.name}” permanently?`)) return;

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
          </form>
        </div>
      ) : (
        /* Authenticated Admin Dashboard */
        <div className="app" id="appView">
          <header className="topbar">
            <div>
              <span className="topbar-logo">Crafts of Cashmere</span>
              <span className="topbar-sub">Atelier Admin</span>
            </div>

            <nav className="topbar-tabs" id="mainTabs">
              <button
                className={activeView === 'products' ? 'on' : ''}
                onClick={() => setActiveView('products')}
              >
                Products
              </button>
              <button
                className={activeView === 'orders' ? 'on' : ''}
                onClick={() => setActiveView('orders')}
              >
                Orders
              </button>
              <button
                className={activeView === 'subscribers' ? 'on' : ''}
                onClick={() => setActiveView('subscribers')}
              >
                Letters
              </button>
            </nav>

            <div className="topbar-actions">
              <a href="/" target="_blank" rel="noopener noreferrer">
                View site ↗
              </a>
              <button id="logoutBtn" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          </header>

          {/* Products View */}
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
                <button
                  className="btn-primary"
                  id="addItemBtn"
                  onClick={() => openEditor(null)}
                >
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
                          <CraftMotif
                            motif={it.motif || 'paisley'}
                            paletteKey={it.cat}
                            uid={`adm-${it.id}`}
                          />
                        )}
                      </div>
                      <div>
                        <p className="item-name">{it.name}</p>
                        <p className="item-desc">{it.desc || ''}</p>
                      </div>
                      <p className="item-maker">{it.maker}</p>
                      <p className="item-price">{formatINR(it.price)}</p>
                      <button
                        className="item-edit"
                        data-id={it.id}
                        onClick={() => openEditor(it)}
                      >
                        Edit
                      </button>
                    </div>
                  ))
                )}
              </div>
            </main>
          )}

          {/* Orders View */}
          {activeView === 'orders' && (
            <main className="view" id="view-orders">
              <h2 className="view-title">Orders</h2>
              <div className="table-wrap" id="ordersTable">
                {orders.length === 0 ? (
                  <p className="t-empty">No orders yet — the looms are patient.</p>
                ) : (
                  <>
                    <div className="t-row order head">
                      <span>Order</span>
                      <span>Placed</span>
                      <span>Customer</span>
                      <span>Pieces</span>
                      <span>Total</span>
                    </div>
                    {orders
                      .slice()
                      .reverse()
                      .map((o) => (
                        <div key={o.id} className="t-row order">
                          <span className="t-id">{o.id}</span>
                          <span className="t-mute">{new Date(o.at).toLocaleString()}</span>
                          <span>
                            {o.name}
                            <br />
                            <span className="t-mute">{o.email}</span>
                          </span>
                          <span className="t-mute">
                            {o.lines.map((l) => `${l.qty}× ${l.name}`).join(', ')}
                          </span>
                          <span className="t-total">{formatINR(o.total)}</span>
                        </div>
                      ))}
                  </>
                )}
              </div>
            </main>
          )}

          {/* Subscribers View */}
          {activeView === 'subscribers' && (
            <main className="view" id="view-subscribers">
              <h2 className="view-title">Letters from the valley — subscribers</h2>
              <div className="table-wrap" id="subsTable">
                {subscribers.length === 0 ? (
                  <p className="t-empty">No subscribers yet.</p>
                ) : (
                  <>
                    <div className="t-row sub head">
                      <span>Email</span>
                      <span>Joined</span>
                    </div>
                    {subscribers
                      .slice()
                      .reverse()
                      .map((s, idx) => (
                        <div key={idx} className="t-row sub">
                          <span>{s.email}</span>
                          <span className="t-mute">{new Date(s.at).toLocaleDateString()}</span>
                        </div>
                      ))}
                  </>
                )}
              </div>
            </main>
          )}
        </div>
      )}

      {/* Editor Drawer */}
      {isEditorOpen && (
        <>
          <div className="editor-overlay" id="editorOverlay" onClick={closeEditor} />
          <aside className="editor" id="editor" aria-label="Edit piece">
            <div className="editor-head">
              <h3 id="editorTitle">
                {editingItem ? 'Edit piece' : `New piece — ${catalog?.[activeCat]?.label || ''}`}
              </h3>
              <button className="editor-close" id="editorClose" onClick={closeEditor}>
                ✕
              </button>
            </div>

            <form className="editor-form" id="editorForm" onSubmit={handleSaveProduct}>
              <div className="editor-media">
                <div className="editor-preview" id="editorPreview">
                  {pendingUpload ? (
                    <img src={pendingUpload.dataUrl} alt="Preview" />
                  ) : editingItem?.img ? (
                    <img src={`/${editingItem.img}`} alt={editingItem.name} />
                  ) : fMotif ? (
                    <CraftMotif motif={fMotif as MotifType} paletteKey={activeCat} uid="preview" />
                  ) : (
                    'No photo yet'
                  )}
                </div>

                <div className="editor-media-controls">
                  <label className="btn-ghost" htmlFor="photoInput">
                    Upload photo
                  </label>
                  <input
                    type="file"
                    id="photoInput"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    onChange={handlePhotoChange}
                  />

                  <label htmlFor="motifSelect">or use motif artwork</label>
                  <select
                    id="motifSelect"
                    value={fMotif}
                    onChange={(e) => {
                      setPendingUpload(null);
                      setFMotif(e.target.value as MotifType);
                    }}
                  >
                    <option value="">— none —</option>
                    <option value="paisley">Paisley</option>
                    <option value="vineBloom">Vine &amp; Bloom</option>
                    <option value="chinarLeaf">Chinar Leaf</option>
                    <option value="boxRosette">Box Rosette</option>
                    <option value="medallion">Medallion</option>
                    <option value="latticeJali">Lattice Jali</option>
                  </select>
                </div>
              </div>

              <label htmlFor="fName">Name</label>
              <input
                id="fName"
                value={fName}
                onChange={(e) => setFName(e.target.value)}
                required
                maxLength={120}
              />

              <label htmlFor="fMaker">Maker</label>
              <input
                id="fMaker"
                value={fMaker}
                onChange={(e) => setFMaker(e.target.value)}
                maxLength={120}
                placeholder="Woven by …"
              />

              <div className="editor-row">
                <div>
                  <label htmlFor="fPrice">Price (₹)</label>
                  <input
                    id="fPrice"
                    type="number"
                    min="0"
                    step="100"
                    value={fPrice}
                    onChange={(e) => setFPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="fBadge">Badge</label>
                  <input
                    id="fBadge"
                    value={fBadge}
                    onChange={(e) => setFBadge(e.target.value)}
                    maxLength={40}
                    placeholder="GI Certified"
                  />
                </div>
              </div>

              <label htmlFor="fDesc">Description</label>
              <textarea
                id="fDesc"
                rows={5}
                maxLength={2000}
                value={fDesc}
                onChange={(e) => setFDesc(e.target.value)}
                placeholder="The story of this piece — fibre, hands, time…"
              />

              <label htmlFor="fAlt">Photo alt text</label>
              <input
                id="fAlt"
                value={fAlt}
                onChange={(e) => setFAlt(e.target.value)}
                maxLength={300}
                placeholder="What the photo shows"
              />

              <div className="editor-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  id="saveBtn"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving…' : 'Save piece'}
                </button>
                {editingItem && (
                  <button
                    type="button"
                    className="btn-danger"
                    id="deleteBtn"
                    onClick={handleDeleteProduct}
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="editor-status" id="editorStatus">
                {editorStatus}
              </p>
            </form>
          </aside>
        </>
      )}
    </>
  );
};
