import React, { useEffect, useState, useCallback } from 'react';
import { Product } from '../../types';
import { useCart } from '../cart/CartContext';
import { useCurrency } from '../currency/CurrencyContext';
import { useWishlist } from '../wishlist/WishlistContext';
import { CraftMotif } from './Motif';
import { getProductDetails } from './productSpecs';

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
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'story' | 'specs' | 'care'>('story');

  // Reset gallery index and error states when product changes
  useEffect(() => {
    setActiveIdx(0);
    setFadingIn(false);
    setFailedImages({});
    setActiveTab('story');
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

  const selectThumb = useCallback((idx: number) => {
    setActiveIdx((current) => {
      if (idx === current) return current;
      setFadingIn(true);
      setTimeout(() => {
        setActiveIdx(idx);
        setFadingIn(false);
      }, 180);
      return current;
    });
  }, []);

  const goToPrev = useCallback(() => {
    if (!product) return;
    const gallery = buildGallery(product);
    if (gallery.length <= 1) return;
    const prevIdx = (activeIdx - 1 + gallery.length) % gallery.length;
    selectThumb(prevIdx);
  }, [product, activeIdx, selectThumb]);

  const goToNext = useCallback(() => {
    if (!product) return;
    const gallery = buildGallery(product);
    if (gallery.length <= 1) return;
    const nextIdx = (activeIdx + 1) % gallery.length;
    selectThumb(nextIdx);
  }, [product, activeIdx, selectThumb]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!product) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    },
    [product, onClose, goToNext, goToPrev]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!product) return null;

  const isSaved = isWishlisted(product.id);
  const gallery = buildGallery(product);
  const hasGallery = gallery.length > 1;
  const activeSrc = gallery[activeIdx] ?? null;
  const details = getProductDetails(product);

  return (
    <>
      <div className="pd-overlay" id="pdOverlay" onClick={onClose} />
      <aside
        className="pd-modal"
        id="pdModal"
        role="dialog"
        aria-modal="true"
        aria-label="Piece details"
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
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
            {activeSrc && !failedImages[activeSrc] ? (
              <img
                src={`/${activeSrc}`}
                alt={product.alt || product.name}
                onError={() => setFailedImages((prev) => ({ ...prev, [activeSrc]: true }))}
              />
            ) : (
              <CraftMotif
                motif={product.motif || 'paisley'}
                paletteKey={product.cat}
                uid={`pd-${product.id}`}
              />
            )}

            {/* In-image Next/Previous navigation buttons */}
            {hasGallery && (
              <>
                <button
                  type="button"
                  className="pd-media-nav pd-media-prev"
                  onClick={goToPrev}
                  aria-label="Previous image"
                  title="Previous image"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="pd-media-nav pd-media-next"
                  onClick={goToNext}
                  aria-label="Next image"
                  title="Next image"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </>
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
                  {!failedImages[src] ? (
                    <img
                      src={`/${src}`}
                      alt={`Thumbnail ${idx + 1}`}
                      loading="lazy"
                      onError={() => setFailedImages((prev) => ({ ...prev, [src]: true }))}
                    />
                  ) : (
                    <div className="pd-thumb-fallback">
                      <span>{idx + 1}</span>
                    </div>
                  )}
                  {idx === 0 && <span className="pd-thumb-cover">Cover</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info column ────────────────────────────────────────── */}
        <div
          className="pd-info"
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="pd-meta-header">
            <span className="pd-badge" id="pdBadge">
              {product.badge || 'Handmade'}
            </span>
            <StockBadge stock={product.stock} leadTimeWeeks={product.leadTimeWeeks} />
          </div>

          <h3 className="pd-name" id="pdName">
            {product.name}
          </h3>
          <p className="pd-maker" id="pdMaker">
            {product.maker}
          </p>
          <p className="pd-authentic">Handmade · Authentic · Kashmir</p>

          {/* Navigation Tabs: Story, Specifications, Care */}
          <div className="pd-tabs" role="tablist" aria-label="Piece details tabs">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'story'}
              className={`pd-tab-btn ${activeTab === 'story' ? 'active' : ''}`}
              onClick={() => setActiveTab('story')}
            >
              Story &amp; Heritage
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'specs'}
              className={`pd-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Specifications
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'care'}
              className={`pd-tab-btn ${activeTab === 'care' ? 'active' : ''}`}
              onClick={() => setActiveTab('care')}
            >
              Care &amp; Storage
            </button>
          </div>

          {/* Tab 1: Story / Heritage */}
          {activeTab === 'story' && (
            <div className="pd-tab-panel" role="tabpanel">
              <p className="pd-desc" id="pdDesc">
                {product.desc ||
                  'Made entirely by hand in the valley of Kashmir — signed by its maker and certified authentic.'}
              </p>
              <div className="pd-quick-pills">
                <div className="pd-quick-pill">
                  <span className="pill-k">Dimensions:</span>
                  <span className="pill-v">{details.dimensions}</span>
                </div>
                <div className="pd-quick-pill">
                  <span className="pill-k">Origin:</span>
                  <span className="pill-v">{details.origin}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Technical Specifications & Measurements */}
          {activeTab === 'specs' && (
            <div className="pd-tab-panel pd-specs-panel" role="tabpanel">
              <div className="pd-specs-highlight-grid">
                <div className="spec-card">
                  <span className="spec-card-lbl">Dimensions</span>
                  <span className="spec-card-val">{details.dimensions}</span>
                </div>
                <div className="spec-card">
                  <span className="spec-card-lbl">Weight</span>
                  <span className="spec-card-val">{details.weight}</span>
                </div>
                <div className="spec-card">
                  <span className="spec-card-lbl">Materials</span>
                  <span className="spec-card-val">{details.materials}</span>
                </div>
                <div className="spec-card">
                  <span className="spec-card-lbl">Creation Time</span>
                  <span className="spec-card-val">{details.loomTime}</span>
                </div>
              </div>

              <div className="pd-spec-table">
                {details.specs.map((item) => (
                  <div key={item.label} className="pd-spec-row">
                    <span className="pd-spec-name">{item.label}</span>
                    <span className="pd-spec-value">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Care, Washing & Archival Storage */}
          {activeTab === 'care' && (
            <div className="pd-tab-panel pd-care-panel" role="tabpanel">
              <div className="pd-care-item">
                <div className="pd-care-head">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <h4>Cleaning &amp; Wash Method</h4>
                </div>
                <p>{details.care.cleaning}</p>
              </div>

              <div className="pd-care-item">
                <div className="pd-care-head">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                  <h4>Archival Storage</h4>
                </div>
                <p>{details.care.storage}</p>
              </div>

              <div className="pd-care-item">
                <div className="pd-care-head">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <h4>Preservation &amp; Longevity</h4>
                </div>
                <p>{details.care.preservation}</p>
              </div>
            </div>
          )}

          <div className="pd-pricing-row">
            <p className="pd-price" id="pdPrice">
              {formatPrice(product.price)}
            </p>
            <span className="pd-tax-note">All duties &amp; insured delivery included</span>
          </div>

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
            <div className="pd-gallery-nav" aria-label="Image gallery controls">
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
