import React, { useRef } from 'react';
import { Product } from '../../types';
import { useCart } from '../cart/CartContext';
import { useCurrency } from '../currency/CurrencyContext';
import { useWishlist } from '../wishlist/WishlistContext';
import { CraftMotif } from './Motif';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const mediaRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const isSaved = isWishlisted(product.id);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (reduced || !isFinePointer || !mediaRef.current) return;

    const r = mediaRef.current.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 5;
    mediaRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
  };

  const handlePointerLeave = () => {
    if (mediaRef.current) {
      mediaRef.current.style.transform = '';
    }
  };

  return (
    <article
      className="product-card"
      data-id={product.id}
      onClick={() => onOpenDetails(product)}
      style={{ cursor: 'pointer' }}
    >
      <div
        ref={mediaRef}
        className="product-media"
        data-tilt
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {product.img ? (
          <img src={`/${product.img}`} alt={product.alt || product.name} loading="lazy" />
        ) : (
          <div className="product-art" role="img" aria-label={product.alt || product.name}>
            <CraftMotif
              motif={product.motif || 'paisley'}
              paletteKey={product.cat}
              uid={product.id}
            />
          </div>
        )}

        <span className="product-badge">{product.badge}</span>

        <button
          className={`product-wishlist-toggle ${isSaved ? 'saved' : ''}`}
          aria-label={isSaved ? `Remove ${product.name} from saved heirlooms` : `Save ${product.name} to heirlooms`}
          title={isSaved ? 'Saved to Heirlooms' : 'Save to Heirlooms'}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill={isSaved ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        <button
          className="product-add"
          data-id={product.id}
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product.id);
          }}
        >
          Add to Cart
        </button>
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-maker">{product.maker}</p>
        <p className="product-authentic">Handmade · Authentic</p>
        <p className="product-price">{formatPrice(product.price)}</p>
      </div>
    </article>
  );
};
