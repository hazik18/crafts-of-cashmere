import React, { useEffect } from 'react';
import { Product } from '../../types';
import { useCart } from '../cart/CartContext';
import { useCurrency } from '../currency/CurrencyContext';
import { useWishlist } from '../wishlist/WishlistContext';
import { CraftMotif } from './Motif';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && product) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const isSaved = isWishlisted(product.id);

  return (
    <>
      <div className="pd-overlay" id="pdOverlay" onClick={onClose} />
      <aside
        className="pd-modal"
        id="pdModal"
        role="dialog"
        aria-modal="true"
        aria-label="Piece details"
      >
        <button className="pd-close" id="pdClose" aria-label="Close details" onClick={onClose}>
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

        <div className="pd-media" id="pdMedia">
          {product.img ? (
            <img src={`/${product.img}`} alt={product.alt || product.name} />
          ) : (
            <CraftMotif
              motif={product.motif || 'paisley'}
              paletteKey={product.cat}
              uid={`pd-${product.id}`}
            />
          )}
        </div>

        <div className="pd-info">
          <span className="pd-badge" id="pdBadge">
            {product.badge || 'Handmade'}
          </span>
          <h3 className="pd-name" id="pdName">
            {product.name}
          </h3>
          <p className="pd-maker" id="pdMaker">
            {product.maker}
          </p>
          <p className="pd-authentic">Handmade · Authentic · Kashmir</p>
          <p className="pd-desc" id="pdDesc">
            {product.desc ||
              'Made entirely by hand in the valley of Kashmir — signed by its maker and certified authentic.'}
          </p>
          <p className="pd-price" id="pdPrice">
            {formatPrice(product.price)}
          </p>

          <div className="pd-actions">
            <button
              className="pd-add"
              id="pdAdd"
              onClick={() => {
                addToCart(product.id);
                onClose();
              }}
            >
              Add to Cart
            </button>

            <button
              className={`pd-wishlist-btn ${isSaved ? 'saved' : ''}`}
              onClick={() => toggleWishlist(product.id)}
              aria-label={isSaved ? 'Remove from Saved Heirlooms' : 'Save to Heirlooms'}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={isSaved ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              <span>{isSaved ? 'Saved Heirloom' : 'Save Heirloom'}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
