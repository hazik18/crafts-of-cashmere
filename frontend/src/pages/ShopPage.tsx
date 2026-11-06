import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ProductCard } from '../features/products/ProductCard';
import { ProductDetailModal } from '../features/products/ProductDetailModal';
import { ShopFilterBar } from '../features/products/ShopFilterBar';
import { ShopEmptyState } from '../features/products/ShopEmptyState';
import { ShopPagination } from '../features/products/ShopPagination';
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
    pagination,
    setPage,
    isLoading,
  } = useProductFilters(products);

  const gridRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.body.classList.add('subpage');
    return () => {
      document.body.classList.remove('subpage');
    };
  }, []);

  // Stagger animation on products render & filter changes
  useEffect(() => {
    if (!gridRef.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = gridRef.current.querySelectorAll('.product-card');
    if (cards.length > 0) {
      if (reduced) {
        gsap.set(cards, { opacity: 1, y: 0 });
      } else {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.03,
            ease: 'power3.out',
            overwrite: true,
          }
        );
      }
    }
  }, [activeCat, searchQuery, sortBy, priceBracket, selectedBadges, priceMin, priceMax, filteredProducts]);

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
            <>
              <div
                ref={gridRef}
                className={`product-grid ${isLoading ? 'loading' : ''}`}
                id="productGrid"
                role="tabpanel"
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetails={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>

              <ShopPagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </>
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
