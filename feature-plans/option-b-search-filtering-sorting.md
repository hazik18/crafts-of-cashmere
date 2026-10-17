# Feature Specification: Option B — Search, Filtering, and Sorting for the Catalog

**Objective**: Upgrade the catalog on `/shop` from a basic tabbed list into an advanced discovery experience. Enable patrons to search by keyword, artisan, and technique, filter by price brackets and GI badges, and sort by price or craft heritage without page reload or visual jarring.

---

## 1. Overview & User Experience

### Current State
- The Shop page (`frontend/src/pages/ShopPage.tsx`) displays 20 items per craft category selected via six static category buttons.
- There is no text search input, price slider, badge filter, or sorting control.
- Patrons cannot cross-search across all 120 pieces at once (e.g., searching for "Ghulam Nabi" only shows items in the currently active tab).

### Target State
1. **Global Search Input**:
   - A minimalist, frosted glass search bar above the catalog grid.
   - Live debounced keyword search (300ms) matching:
     - Piece name (e.g., "Ring Shawl", "Naqashi Vase")
     - Artisan / Maker (e.g., "Fatima Bano", "Bashir Ahmad", "Ghulam Nabi")
     - Craft technique / Material (e.g., "Walnut", "Silk", "Pashmina", "Gold Leaf", "Talim")
     - Description narrative
   - "All Crafts" option added to category tabs so patrons can search the entire 120-piece collection simultaneously.
2. **Artisanal Badge Filtering**:
   - Multi-select pill filters for authentic craft attributes:
     - `GI Certified`
     - `Hand-Spun`
     - `Natural Dyes`
     - `18 Months`
     - `Deep Relief`
     - `Gold Leaf`
     - `Silk & Wool`
     - `Aari Stitch`
3. **Price Brackets & Sorting Controls**:
   - Price range slider or curated brackets:
     - *Discovery & Gifting* (< ₹5,000)
     - *Artisan Accents* (₹5,000 – ₹20,000)
     - *Hero Heirlooms* (₹20,000 – ₹70,000)
     - *Masterpiece Commissions* (> ₹70,000)
   - Sort dropdown:
     - *Curated (Default)*
     - *Price: Low to High*
     - *Price: High to Low*
     - *Artisan Name (A–Z)*
4. **URL State Synchronization**:
   - Filter state reflected in URL query parameters (`/shop?cat=kaani&q=chinar&sort=price_asc&badge=GI+Certified`).
   - Browser back/forward buttons and shared links preserve the exact filtered view.

---

## 2. Component Architecture & State Management

```
frontend/src/pages/ShopPage.tsx
├── ShopHeader (Page head & item counter)
├── ShopControls (Integrated search & filters)
│   ├── SearchInput (Debounced text query with clear button)
│   ├── CategoryTabs (All Crafts + 6 Crafts with dynamic counts)
│   ├── FilterBar (Collapsible filter drawer on mobile)
│   │   ├── BadgeFilterGroup (GI Certified, Hand-Spun, etc.)
│   │   ├── PriceRangeSelector (Min/Max inputs & presets)
│   │   └── SortSelector (Price Low/High, Name, Curated)
│   └── ActiveFilterTags (Dismissible pills showing active constraints)
├── ProductGrid (Responsive 4-column cards with GSAP transitions)
└── ProductDetailModal (Piece lightbox)
```

---

## 3. Data Flow & Filter Algorithm

```typescript
// Filter pipeline in ShopPage.tsx:
const filteredProducts = useMemo(() => {
  return products.filter((item) => {
    // 1. Category check (supports 'all')
    if (activeCat !== 'all' && item.cat !== activeCat) return false;

    // 2. Keyword query (case-insensitive substring match)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchMaker = item.maker.toLowerCase().includes(q);
      const matchBadge = item.badge.toLowerCase().includes(q);
      const matchDesc = (item.desc || '').toLowerCase().includes(q);
      if (!matchName && !matchMaker && !matchBadge && !matchDesc) return false;
    }

    // 3. Badge multi-select filter
    if (selectedBadges.length > 0 && !selectedBadges.includes(item.badge)) {
      return false;
    }

    // 4. Price range filter
    if (priceMin !== null && item.price < priceMin) return false;
    if (priceMax !== null && item.price > priceMax) return false;

    return true;
  }).sort((a, b) => {
    // 5. Sorting
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
    return 0; // default curated order
  });
}, [products, activeCat, searchQuery, selectedBadges, priceMin, priceMax, sortBy]);
```

---

## 4. UI/UX Specifications (Preserving Visual Design)

### 4.1 Search Input Styling
- Positioned above category tabs with clean minimalist aesthetics:
  ```css
  .shop-search {
    max-width: 42rem;
    margin: 0 auto 2.5rem;
    position: relative;
  }
  .shop-search input {
    width: 100%;
    padding: 1rem 1.4rem 1rem 3.2rem;
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid var(--gold-line);
    border-radius: 99px;
    font-family: var(--sans);
    font-size: 0.9rem;
    color: var(--ink);
    backdrop-filter: blur(14px);
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .shop-search input:focus {
    border-color: var(--gold);
    box-shadow: 0 8px 24px -10px rgba(176, 138, 71, 0.35);
  }
  .shop-search svg {
    position: absolute;
    left: 1.2rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--gold);
    pointer-events: none;
  }
  ```

### 4.2 Filter Badges & Sort Controls
- Font: `var(--mono)` (`IBM Plex Mono`) with 0.62rem uppercase tracking.
- Filter chips highlight with `background: var(--ink); color: var(--ivory)`.
- Reset button: `"Clear all filters"` appearing only when filters are active.
- Counter feedback: `"Showing 14 of 120 pieces"`.

---

## 5. Implementation Tasks

1. **Create Filter Hook (`frontend/src/features/products/useProductFilters.ts`)**:
   - Manages state for `searchQuery`, `activeCat`, `selectedBadges`, `priceRange`, and `sortBy`.
   - Synchronizes with `useSearchParams()` from `react-router-dom`.
2. **Create Filter UI Component (`frontend/src/features/products/ShopFilterBar.tsx`)**:
   - Search input with clear (`✕`) button.
   - Badge chips generated dynamically from catalog badges (`GI Certified`, `Hand-Spun`, etc.).
   - Sort dropdown styled with custom CSS matching admin selects.
3. **Empty Results State**:
   - Editorial fallback message when no pieces match:
     ```html
     <div class="shop-empty">
       <p>No pieces found matching “{query}”.</p>
       <button onClick={resetFilters}>View all 120 pieces</button>
     </div>
     ```
4. **GSAP Animation Integration**:
   - Smooth staggered fade-in (`opacity: 0, y: 20` -> `opacity: 1, y: 0`) when filtered results change.

---

## 6. Acceptance Criteria & Testing Checklist

- [ ] Typing in search filters product cards in real time across title, maker, technique, and narrative.
- [ ] Switching between category tabs updates count indicator and filters cards properly.
- [ ] Sorting by "Price: Low to High" and "Price: High to Low" accurately arranges items.
- [ ] Badge multi-select filters display only matching products.
- [ ] Active filters appear in the browser URL (e.g. `/shop?q=chinar&sort=price_desc`).
- [ ] Clearing search/filters restores the full catalog.
- [ ] Responsive behavior tested on mobile: controls stack cleanly without overflow.
