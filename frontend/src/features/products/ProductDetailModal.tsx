import React, { useEffect, useState, useCallback } from 'react';
import { Product } from '../../types';
import { useCart } from '../cart/CartContext';
import { useCurrency } from '../currency/CurrencyContext';
import { useWishlist } from '../wishlist/WishlistContext';
import { CraftMotif } from './Motif';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

/** Builds the full ordered gallery: primary img first, then additional images. */
function buildGallery(product: Product): string[] {
  const extra = (product.images ?? []).filter(Boolean);
  if (product.img) {
    return [product.img, ...extra.filter((p) => p !== product.img)];
  }
  return extra;
}

function StockBadge({ stock, leadTimeWeeks }: { stock?: number; leadTimeWeeks?: number }) {
  if (stock === undefined) return null;
  if (stock === 1) {
    return (
      <span className="pd-stock-badge pd-stock-unique">
        1 of 1 &mdash; Single Piece Heirloom
      </span>
    );
  }
  if (stock === 0) {
    const weeks = leadTimeWeeks ?? 3;
    return (
      <span className="pd-stock-badge pd-stock-order">
        Woven to Order &mdash; {weeks} {weeks === 1 ? 'Week' : 'Weeks'}
      </span>
    );
  }
  return null;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [activeIdx, setActiveIdx] = useState(0);
  const [fadingIn, setFadingIn] = useState(false);

  // Reset gallery index when product changes
  useEffect(() => {
    setActiveIdx(0);
    setFadingIn(false);
  }, [product?.id]);

  // Body class for CSS-driven modal open/close animation
  useEffect(() => {
    if (product) {
      document.body.classList.add('pd-open');
    } else {
      document.body.classList.remove('pd-open');
    }
    return () => {
      document.body.classList.remove('pd-open');
    };
  }, [product]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!product) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') {
        const gallery = buildGallery(product);
        setActiveIdx((i) => (i + 1) % gallery.length);
      }
      if (e.key === 'ArrowLeft') {
        const gallery = buildGallery(product);
        setActiveIdx((i) => (i - 1 + gallery.length) % gallery.length);
      }
    },
    [product, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const selectThumb = (idx: number) => {
    if (idx === activeIdx) return;
    setFadingIn(true);
    setTimeout(() => {
      setActiveIdx(idx);
      setFadingIn(false);
    }, 180);
  };

  if (!product) return null;

  const isSaved = isWishlisted(product.id);
  const gallery = buildGallery(product);
  const hasGallery = gallery.length > 1;
  const activeSrc = gallery[activeIdx] ?? null;

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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {/* ── Media column ───────────────────────────────────────── */}
        <div className="pd-media" id="pdMedia">
          {/* Featured image */}
          <div className={`pd-featured-img ${fadingIn ? 'pd-fading' : ''}`}>
            {activeSrc ? (
              <img src={`/${activeSrc}`} alt={product.alt || product.name} />
            ) : (
              <CraftMotif
                motif={product.motif || 'paisley'}
                paletteKey={product.cat}
                uid={`pd-${product.id}`}
              />
            )}
          </div>

          {/* Thumbnail strip — only when 2+ images */}
          {hasGallery && (
            <div className="pd-thumb-strip" id="pdThumbStrip" aria-label="Product gallery thumbnails">
              {gallery.map((src, idx) => (
                <button
                  key={src}
                  className={`pd-thumb${idx === activeIdx ? ' active' : ''}`}
                  onClick={() => selectThumb(idx)}
                  aria-label={`View photo ${idx + 1}`}
                  title={idx === 0 ? 'Cover photo' : `Photo ${idx + 1}`}
                >
                  <img src={`/${src}`} alt={`Thumbnail ${idx + 1}`} loading="lazy" />
                  {idx === 0 && <span className="pd-thumb-cover">Cover</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info column ────────────────────────────────────────── */}
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

          <StockBadge stock={product.stock} leadTimeWeeks={product.leadTimeWeeks} />

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

          {hasGallery && (
            <p className="pd-gallery-hint">
              ← → to browse &nbsp;·&nbsp; {activeIdx + 1} / {gallery.length}
            </p>
          )}
        </div>
      </aside>
    </>
  );
};
