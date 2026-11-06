import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useCart } from '../features/cart/CartContext';
import { useWishlist } from '../features/wishlist/WishlistContext';
import { useCurrency } from '../features/currency/CurrencyContext';
import { CurrencySelector } from '../features/currency/CurrencySelector';
import { Product } from '../types';

interface NavbarProps {
  solid?: boolean;
}

const POPULAR_SEARCHES = [
  { label: 'Pashmina Shawls', cat: 'pashmina' },
  { label: 'Kaani Weaves', cat: 'kaani' },
  { label: 'Walnut Wood', cat: 'walnut' },
  { label: 'Silk Carpets', cat: 'carpet' },
  { label: 'Papier-Mâché', cat: 'papier' },
];

export const Navbar: React.FC<NavbarProps> = ({ solid = false }) => {
  const [isScrolled, setIsScrolled] = useState(solid);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchVal, setSearchVal] = useState(searchParams.get('q') || '');

  const { totalItems, openCart, products, catalog } = useCart();
  const { wishlistCount, openWishlist } = useWishlist();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    setSearchVal(searchParams.get('q') || '');
  }, [searchParams]);

  // Suggestions computation
  const query = searchVal.trim().toLowerCase();

  const categoryMatches = useMemo(() => {
    if (!query || !catalog) return [];
    return (Object.entries(catalog) as [string, { label: string; items: Product[] }][])
      .filter(([key, cat]) => key.toLowerCase().includes(query) || cat.label.toLowerCase().includes(query))
      .slice(0, 3);
  }, [query, catalog]);

  const productMatches = useMemo(() => {
    if (!query || !products) return [];
    return products
      .filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(query);
        const makerMatch = p.maker ? p.maker.toLowerCase().includes(query) : false;
        const catMatch = p.cat.toLowerCase().includes(query);
        const badgeMatch = p.badge ? p.badge.toLowerCase().includes(query) : false;
        return nameMatch || makerMatch || catMatch || badgeMatch;
      })
      .slice(0, 5);
  }, [query, products]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        if (!searchVal) setIsSearchOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchVal]);

  const handleSearchChange = (val: string) => {
    setSearchVal(val);
    setShowSuggestions(true);
    if (location.pathname === '/shop') {
      const nextParams = new URLSearchParams(searchParams);
      if (val.trim()) {
        nextParams.set('q', val);
      } else {
        nextParams.delete('q');
      }
      setSearchParams(nextParams, { replace: true });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (location.pathname !== '/shop') {
      navigate(searchVal.trim() ? `/shop?q=${encodeURIComponent(searchVal.trim())}` : '/shop');
    }
  };

  const handleClearSearch = () => {
    setSearchVal('');
    setShowSuggestions(false);
    if (location.pathname === '/shop') {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('q');
      setSearchParams(nextParams, { replace: true });
    }
  };

  const handleSelectPopular = (cat: string) => {
    setShowSuggestions(false);
    navigate(`/shop?cat=${cat}`);
  };

  const handleSelectCategory = (catKey: string) => {
    setShowSuggestions(false);
    navigate(`/shop?cat=${catKey}`);
  };

  const handleSelectProduct = (product: Product) => {
    setShowSuggestions(false);
    setSearchVal(product.name);
    navigate(`/shop?cat=${product.cat}&q=${encodeURIComponent(product.name)}`);
  };

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
            <div className="nav-dd-group">
              <p className="nav-dd-label">Care &amp; Trust</p>
              <Link to="/shipping" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                Shipping &amp; Delivery
              </Link>
              <Link to="/returns" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                Returns &amp; Guarantee
              </Link>
              <Link to="/authenticity" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                GI Authenticity
              </Link>
              <Link to="/contact" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                Contact &amp; Atelier
              </Link>
            </div>
            <div className="nav-dd-group nav-dd-currency-group">
              <p className="nav-dd-label">Currency</p>
              <div style={{ padding: '0.4rem 1.3rem 0.6rem' }}>
                <CurrencySelector className="nav-dd-currency" />
              </div>
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
        {/* Minimal & Clean Search Bar with Autocomplete Suggestions */}
        <form
          ref={searchContainerRef}
          className={`nav-search ${isSearchOpen ? 'expanded' : ''}`}
          onSubmit={handleSearchSubmit}
          role="search"
          autoComplete="off"
        >
          <div className={`nav-search-inner ${isSearchOpen || searchVal || showSuggestions ? 'focused' : ''}`}>
            <button
              type={isSearchOpen ? 'submit' : 'button'}
              className="nav-search-btn"
              aria-label="Search catalog"
              onClick={() => {
                if (!isSearchOpen) {
                  setIsSearchOpen(true);
                  setShowSuggestions(true);
                  setTimeout(() => searchInputRef.current?.focus(), 60);
                }
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
            <input
              ref={searchInputRef}
              type="search"
              id="navSearchInput"
              name="q"
              className="nav-search-input"
              placeholder="Search heirlooms, crafts…"
              value={searchVal}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                setIsSearchOpen(true);
                setShowSuggestions(true);
              }}
              aria-label="Search heirlooms and crafts"
              autoComplete="off"
              spellCheck={false}
            />
            {searchVal && (
              <button
                type="button"
                className="nav-search-clear"
                onClick={handleClearSearch}
                aria-label="Clear search query"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
            {isSearchOpen && (
              <button
                type="button"
                className="nav-search-mobile-close"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSearchOpen(false);
                  setShowSuggestions(false);
                }}
                aria-label="Close search"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div className="nav-search-dropdown" role="listbox" aria-label="Search suggestions">
              {!query ? (
                /* Curated Popular Searches when input is empty */
                <div className="nav-search-section">
                  <p className="nav-search-heading">Popular Crafts</p>
                  <div className="nav-search-pills">
                    {POPULAR_SEARCHES.map((item) => (
                      <button
                        key={item.cat}
                        type="button"
                        className="nav-search-pill"
                        onClick={() => handleSelectPopular(item.cat)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Matching Results */
                <>
                  {categoryMatches.length > 0 && (
                    <div className="nav-search-section">
                      <p className="nav-search-heading">Craft Category</p>
                      <div className="nav-search-categories">
                        {categoryMatches.map(([catKey, cat]) => (
                          <button
                            key={catKey}
                            type="button"
                            className="nav-search-cat-btn"
                            onClick={() => handleSelectCategory(catKey)}
                          >
                            <span>{cat.label}</span>
                            <span className="nav-search-cat-badge">Craft</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {productMatches.length > 0 && (
                    <div className="nav-search-section">
                      <p className="nav-search-heading">Heirlooms &amp; Pieces</p>
                      <div className="nav-search-products">
                        {productMatches.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            className="nav-search-item"
                            onClick={() => handleSelectProduct(product)}
                          >
                            {product.img ? (
                              <img
                                src={product.img}
                                alt={product.name}
                                className="nav-search-thumb"
                                loading="lazy"
                              />
                            ) : (
                              <div className="nav-search-thumb-fallback" aria-hidden="true">
                                ✦
                              </div>
                            )}
                            <div className="nav-search-info">
                              <span className="nav-search-name">{product.name}</span>
                              <span className="nav-search-maker">
                                {product.maker ? `By ${product.maker}` : product.badge || 'Handcrafted'}
                              </span>
                            </div>
                            <span className="nav-search-price">{formatPrice(product.price)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {categoryMatches.length === 0 && productMatches.length === 0 ? (
                    <div className="nav-search-empty">
                      <p>No heirlooms found for "{searchVal}"</p>
                      <p className="nav-search-empty-hint">Try searching for Pashmina, Kaani, or Walnut</p>
                    </div>
                  ) : (
                    <div className="nav-search-footer">
                      <button
                        type="button"
                        className="nav-search-view-all"
                        onClick={handleSearchSubmit}
                      >
                        <span>View all results for "{searchVal}"</span>
                        <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </form>

        <CurrencySelector className="nav-currency-bar" />

        <button
          className="nav-wishlist"
          id="wishlistToggle"
          aria-label={`Saved heirlooms: ${wishlistCount}`}
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

        <button
          className="nav-cart"
          id="cartToggle"
          aria-label={`Shopping cart: ${totalItems}`}
          title="Cart"
          onClick={openCart}
        >
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
