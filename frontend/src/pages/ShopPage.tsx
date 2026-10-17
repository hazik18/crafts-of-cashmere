import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ProductCard } from '../features/products/ProductCard';
import { ProductDetailModal } from '../features/products/ProductDetailModal';
import { ShopFilterBar } from '../features/products/ShopFilterBar';
import { ShopEmptyState } from '../features/products/ShopEmptyState';
import { useProductFilters } from '../features/products/useProductFilters';
import { useCart } from '../features/cart/CartContext';
import { Product, CraftCategory } from '../types';

export const ShopPage: React.FC = () => {
  const { catalog, products } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const {
    activeCat,
    setActiveCat,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    priceBracket,
    setPriceBracket,
    selectedBadges,
    toggleBadge,
    priceMin,
    priceMax,
    setCustomRange,
    resetFilters,
    filteredProducts,
    totalCount,
    filteredCount,
    availableBadges,
    hasActiveFilters,
  } = useProductFilters(products);

  const gridRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.body.classList.add('subpage');
    return () => {
      document.body.classList.remove('subpage');
    };
  }, []);

  // GSAP stagger animation whenever filtered product list changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !gridRef.current) return;

    const cards = gridRef.current.querySelectorAll('.product-card');
    if (cards.length > 0) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.035,
          ease: 'power3.out',
          overwrite: true,
        }
      );
    }
  }, [activeCat, searchQuery, sortBy, priceBracket, selectedBadges, priceMin, priceMax]);

  const currentCategory =
    catalog && activeCat !== 'all' ? catalog[activeCat as CraftCategory] : null;

  return (
    <>
      <Navbar solid={true} />

      <main id="top">
        <section className="shop" id="shop">
          <div className="section-head page-head">
            <p className="section-eyebrow">
              <span className="se-idx">01</span>
              <span className="se-label">The Shop</span>
              <span className="se-meta" id="shopMeta">
                {filteredCount} {filteredCount === 1 ? 'piece' : 'pieces'}
                {currentCategory ? ` — ${currentCategory.label}` : ' — All Crafts'}
              </span>
            </p>
            <h2 className="section-title">
              Every piece,<br />
              <em>every craft.</em>
            </h2>
          </div>

          <ShopFilterBar
            catalog={catalog}
            activeCat={activeCat}
            onSelectCat={setActiveCat}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            priceBracket={priceBracket}
            onPriceBracketChange={setPriceBracket}
            selectedBadges={selectedBadges}
            onToggleBadge={toggleBadge}
            availableBadges={availableBadges}
            priceMin={priceMin}
            priceMax={priceMax}
            onCustomRangeChange={setCustomRange}
            filteredCount={filteredCount}
            totalCount={totalCount}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetFilters}
          />

          {filteredProducts.length === 0 ? (
            <ShopEmptyState searchQuery={searchQuery} onReset={resetFilters} />
          ) : (
            <div ref={gridRef} className="product-grid" id="productGrid" role="tabpanel">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <Footer />
    </>
  );
};
