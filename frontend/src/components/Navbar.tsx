import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../features/cart/CartContext';
import { useWishlist } from '../features/wishlist/WishlistContext';
import { CurrencySelector } from '../features/currency/CurrencySelector';

interface NavbarProps {
  solid?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ solid = false }) => {
  const [isScrolled, setIsScrolled] = useState(solid);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { totalItems, openCart } = useCart();
  const { wishlistCount, openWishlist } = useWishlist();

  useEffect(() => {
    if (solid) {
      setIsScrolled(true);
      return;
    }

    const onScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, [solid]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleCraftClick = (cat: string) => {
    setIsMenuOpen(false);
    navigate(`/shop?cat=${cat}`);
  };

  return (
    <header className={`nav ${isScrolled ? 'scrolled' : ''}`} id="nav">
      <div className="nav-left">
        <div ref={menuRef} className={`nav-menu ${isMenuOpen ? 'open' : ''}`} id="navMenu">
          <button
            className="nav-menu-btn"
            id="navMenuBtn"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
            aria-controls="navDropdown"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen((prev) => !prev);
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            <span>Menu</span>
          </button>

          <div className="nav-dropdown" id="navDropdown" role="menu" aria-label="Site menu">
            <div className="nav-dd-group">
              <p className="nav-dd-label">Shop by Craft</p>
              <button
                type="button"
                className="nav-dd-link-btn"
                role="menuitem"
                onClick={() => handleCraftClick('pashmina')}
              >
                Pashmina
              </button>
              <button
                type="button"
                className="nav-dd-link-btn"
                role="menuitem"
                onClick={() => handleCraftClick('kaani')}
              >
                Kaani
              </button>
              <button
                type="button"
                className="nav-dd-link-btn"
                role="menuitem"
                onClick={() => handleCraftClick('walnut')}
              >
                Wood Carving
              </button>
              <button
                type="button"
                className="nav-dd-link-btn"
                role="menuitem"
                onClick={() => handleCraftClick('papier')}
              >
                Papier-Mâché
              </button>
              <button
                type="button"
                className="nav-dd-link-btn"
                role="menuitem"
                onClick={() => handleCraftClick('carpet')}
              >
                Carpets
              </button>
              <button
                type="button"
                className="nav-dd-link-btn"
                role="menuitem"
                onClick={() => handleCraftClick('crewel')}
              >
                Crewel &amp; Namda
              </button>
            </div>
            <div className="nav-dd-group">
              <p className="nav-dd-label">The House</p>
              <Link to="/#collections" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                Collections
              </Link>
              <Link to="/craft" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                The Craft
              </Link>
              <Link to="/craft#atelier" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                Atelier
              </Link>
              <Link to="/shop" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                The Shop
              </Link>
              <button
                type="button"
                className="nav-dd-link-btn"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false);
                  openWishlist();
                }}
              >
                Saved Heirlooms ({wishlistCount})
              </button>
            </div>
          </div>
        </div>

        <Link to="/" className="nav-logo">
          Crafts of Cashmere
        </Link>
      </div>

      <nav className="nav-links" aria-label="Main navigation">
        <Link to="/#collections">Collections</Link>
        <Link to="/shop">Shop</Link>
        <Link to="/craft">The Craft</Link>
        <Link to="/craft#atelier">Atelier</Link>
      </nav>

      <div className="nav-actions">
        <CurrencySelector />

        <button
          className="nav-wishlist"
          id="wishlistToggle"
          aria-label="Open saved heirlooms"
          title="Saved Heirlooms"
          onClick={openWishlist}
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <span className={`wishlist-count ${wishlistCount > 0 ? 'on' : ''}`} id="wishlistCount">
            {wishlistCount}
          </span>
        </button>

        <button className="nav-cart" id="cartToggle" aria-label="Open cart" onClick={openCart}>
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <path d="M6 7h12l1 13H5L6 7z" />
            <path d="M9 7a3 3 0 0 1 6 0" />
          </svg>
          <span className={`cart-count ${totalItems > 0 ? 'on' : ''}`} id="cartCount">
            {totalItems}
          </span>
        </button>
      </div>
    </header>
  );
};
