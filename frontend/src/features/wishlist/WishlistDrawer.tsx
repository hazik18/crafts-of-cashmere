import React, { useEffect } from 'react';
import { useWishlist } from './WishlistContext';
import { useCart } from '../cart/CartContext';
import { useCurrency } from '../currency/CurrencyContext';
import { CraftMotif } from '../products/Motif';
import { useToast } from '../../components/ToastContext';

export const WishlistDrawer: React.FC = () => {
  const {
    wishlist,
    isWishlistOpen,
    closeWishlist,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist();
  const { products, addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isWishlistOpen) {
        closeWishlist();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWishlistOpen, closeWishlist]);

  const savedProducts = wishlist
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products;

  const handleMoveToCart = (id: string, name: string) => {
    addToCart(id);
    removeFromWishlist(id);
    showToast(`“${name}” moved from heirlooms to cart`);
  };

  const handleAddAllToCart = () => {
    if (savedProducts.length === 0) return;
    savedProducts.forEach((p) => addToCart(p.id));
    showToast(`Added ${savedProducts.length} heirlooms to cart`);
  };

  return (
    <>
      <div
        className={`wishlist-overlay ${isWishlistOpen ? 'open' : ''}`}
        id="wishlistOverlay"
        onClick={closeWishlist}
      />

      <aside
        className={`wishlist-drawer ${isWishlistOpen ? 'open' : ''}`}
        id="wishlistDrawer"
        aria-label="Saved Heirlooms"
      >
        <div className="wishlist-head">
          <div className="wishlist-head-title">
            <h3>Saved Heirlooms</h3>
            <span className="wishlist-count-badge">
              {savedProducts.length} {savedProducts.length === 1 ? 'piece' : 'pieces'}
            </span>
          </div>
          <button
            className="wishlist-close"
            id="wishlistClose"
            aria-label="Close saved heirlooms"
            onClick={closeWishlist}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="wishlist-items" id="wishlistItems">
          {savedProducts.length === 0 ? (
            <div className="wishlist-empty">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--gold)"
                strokeWidth="1.2"
                style={{ opacity: 0.7, marginBottom: '1rem' }}
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              <p className="wishlist-empty-text">
                Your heirloom collection is empty.
              </p>
              <p className="wishlist-empty-sub">
                Bookmark treasures across the catalog to save them for quiet reflection.
              </p>
            </div>
          ) : (
            savedProducts.map((p) => (
              <div key={p.id} className="wishlist-item">
                <div className="wishlist-item-thumb">
                  {p.img ? (
                    <img src={`/${p.img}`} alt={p.alt || p.name} />
                  ) : (
                    <CraftMotif
                      motif={p.motif || 'paisley'}
                      paletteKey={p.cat}
                      uid={`wish-${p.id}`}
                    />
                  )}
                </div>
                <div className="wishlist-item-info">
                  <p className="wishlist-item-badge">{p.badge || 'Authentic'}</p>
                  <p className="wishlist-item-name">{p.name}</p>
                  <p className="wishlist-item-maker">{p.maker}</p>
                  <p className="wishlist-item-price">{formatPrice(p.price)}</p>
                  <div className="wishlist-item-actions">
                    <button
                      className="wishlist-move-btn"
                      onClick={() => handleMoveToCart(p.id, p.name)}
                    >
                      Move to Cart
                    </button>
                    <button
                      className="wishlist-remove-btn"
                      onClick={() => removeFromWishlist(p.id)}
                      aria-label={`Remove ${p.name}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {savedProducts.length > 0 && (
          <div className="wishlist-foot">
            <button
              className="wishlist-add-all-btn"
              onClick={handleAddAllToCart}
            >
              Add All to Cart ({savedProducts.length})
            </button>
            <button
              className="wishlist-clear-btn"
              onClick={clearWishlist}
            >
              Clear Saved
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
