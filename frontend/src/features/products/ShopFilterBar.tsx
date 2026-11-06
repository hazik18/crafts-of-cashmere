import React, { useState } from 'react';
import { CraftCategory, Catalog } from '../../types';
import { PriceBracketId, SortOptionId } from './useProductFilters';
import { useCurrency } from '../currency/CurrencyContext';
import { ShopSortDropdown } from './ShopSortDropdown';

interface ShopFilterBarProps {
  catalog: Catalog | null;
  activeCat: string;
  onSelectCat: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: SortOptionId;
  onSortChange: (sort: SortOptionId) => void;
  priceBracket: PriceBracketId;
  onPriceBracketChange: (bracket: PriceBracketId) => void;
  selectedBadges: string[];
  onToggleBadge: (badge: string) => void;
  availableBadges: { badge: string; count: number }[];
  priceMin: number | null;
  priceMax: number | null;
  onCustomRangeChange: (min: number | null, max: number | null) => void;
  filteredCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export const ShopFilterBar: React.FC<ShopFilterBarProps> = ({
  catalog,
  activeCat,
  onSelectCat,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  priceBracket,
  onPriceBracketChange,
  selectedBadges,
  onToggleBadge,
  availableBadges,
  priceMin,
  priceMax,
  onCustomRangeChange,
  filteredCount,
  totalCount,
  hasActiveFilters,
  onResetFilters,
}) => {
  const { formatPrice, currentSymbol } = useCurrency();
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [minInput, setMinInput] = useState<string>(priceMin ? String(priceMin) : '');
  const [maxInput, setMaxInput] = useState<string>(priceMax ? String(priceMax) : '');

  const handleApplyCustomPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const minVal = minInput ? parseInt(minInput, 10) : null;
    const maxVal = maxInput ? parseInt(maxInput, 10) : null;
    onCustomRangeChange(minVal, maxVal);
  };

  const categories = catalog
    ? (Object.entries(catalog) as [CraftCategory, { label: string }][])
    : [];

  return (
    <div className="shop-controls-wrapper">
      {/* 1. Craft Tabs (including All Crafts) */}
      <div className="shop-tabs" role="tablist" aria-label="Craft categories">
        <button
          className={`shop-tab ${activeCat === 'all' ? 'on' : ''}`}
          role="tab"
          aria-selected={activeCat === 'all'}
          onClick={() => onSelectCat('all')}
        >
          All Crafts ({totalCount})
        </button>
        {categories.map(([key, c]) => (
          <button
            key={key}
            className={`shop-tab ${activeCat === key ? 'on' : ''}`}
            role="tab"
            aria-selected={activeCat === key}
            onClick={() => onSelectCat(key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 3. Refined Secondary Controls Toolbar */}
      <div className="shop-filters-toolbar">
        <div className="shop-toolbar-left">
          <button
            className={`shop-filter-toggle-btn ${isFilterPanelOpen ? 'active' : ''}`}
            onClick={() => setIsFilterPanelOpen((prev) => !prev)}
            aria-expanded={isFilterPanelOpen}
            aria-label="Toggle filter options"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 6h18M7 12h10M10 18h4" />
            </svg>
            <span>Filters &amp; Price</span>
            {(selectedBadges.length > 0 || priceBracket !== 'all') && (
              <span className="shop-filter-pill-badge">
                {selectedBadges.length + (priceBracket !== 'all' ? 1 : 0)}
              </span>
            )}
            <svg
              className={`shop-filter-chevron ${isFilterPanelOpen ? 'open' : ''}`}
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {/* Quick Price Bracket Pills on Desktop */}
          <div className="shop-quick-price-pills">
            <button
              className={`shop-price-pill ${priceBracket === 'all' ? 'on' : ''}`}
              onClick={() => onPriceBracketChange('all')}
            >
              All Prices
            </button>
            <button
              className={`shop-price-pill ${priceBracket === 'under-5k' ? 'on' : ''}`}
              onClick={() => onPriceBracketChange('under-5k')}
            >
              Under {formatPrice(5000)}
            </button>
            <button
              className={`shop-price-pill ${priceBracket === '5k-20k' ? 'on' : ''}`}
              onClick={() => onPriceBracketChange('5k-20k')}
            >
              {formatPrice(5000)} – {formatPrice(20000)}
            </button>
            <button
              className={`shop-price-pill ${priceBracket === '20k-70k' ? 'on' : ''}`}
              onClick={() => onPriceBracketChange('20k-70k')}
            >
              {formatPrice(20000)} – {formatPrice(70000)}
            </button>
            <button
              className={`shop-price-pill ${priceBracket === 'above-70k' ? 'on' : ''}`}
              onClick={() => onPriceBracketChange('above-70k')}
            >
              Above {formatPrice(70000)}
            </button>
          </div>
        </div>

        {/* Sort Selector */}
        <ShopSortDropdown sortBy={sortBy} onSortChange={onSortChange} />
      </div>

      {/* 4. Expandable Filter Panel (Badges & Custom Price Range) */}
      <div className={`shop-filter-panel ${isFilterPanelOpen ? 'open' : ''}`}>
        <div className="shop-filter-panel-inner">
          {/* Artisanal Badge Pills */}
          <div className="shop-filter-group">
            <h4 className="shop-filter-group-title">Artisanal Authenticity &amp; Technique</h4>
            <div className="shop-badge-pills">
              {availableBadges.map(({ badge, count }) => {
                const isSelected = selectedBadges.includes(badge);
                return (
                  <button
                    key={badge}
                    className={`shop-badge-pill ${isSelected ? 'selected' : ''}`}
                    onClick={() => onToggleBadge(badge)}
                    type="button"
                    aria-pressed={isSelected}
                  >
                    <span>{badge}</span>
                    <span className="shop-badge-pill-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Price Range Form */}
          <div className="shop-filter-group">
            <h4 className="shop-filter-group-title">Custom Price Range ({currentSymbol})</h4>
            <form className="shop-custom-price-form" onSubmit={handleApplyCustomPrice}>
              <div className="shop-price-inputs">
                <input
                  type="number"
                  id="minPriceInput"
                  name="minPrice"
                  min="0"
                  step="500"
                  placeholder="Min (₹)"
                  value={minInput}
                  onChange={(e) => setMinInput(e.target.value)}
                  className="shop-price-input"
                  aria-label="Minimum price in INR"
                />
                <span className="shop-price-sep">to</span>
                <input
                  type="number"
                  id="maxPriceInput"
                  name="maxPrice"
                  min="0"
                  step="500"
                  placeholder="Max (₹)"
                  value={maxInput}
                  onChange={(e) => setMaxInput(e.target.value)}
                  className="shop-price-input"
                  aria-label="Maximum price in INR"
                />
                <button type="submit" className="shop-price-apply-btn">
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 5. Active Filters & Live Counter Summary */}
      <div className="shop-active-summary">
        <p className="shop-counter-text">
          Showing <strong>{filteredCount}</strong> of {totalCount} heirlooms
          {activeCat !== 'all' && (
            <span>
              {' '}
              in <em>{catalog ? catalog[activeCat as CraftCategory]?.label : activeCat}</em>
            </span>
          )}
        </p>

        {hasActiveFilters && (
          <div className="shop-active-tags">
            {searchQuery && (
              <span className="shop-active-tag">
                Query: “{searchQuery}”
                <button onClick={() => onSearchChange('')} aria-label="Remove search filter">
                  ×
                </button>
              </span>
            )}

            {priceBracket !== 'all' && (
              <span className="shop-active-tag">
                {priceBracket === 'under-5k' && `Under ${formatPrice(5000)}`}
                {priceBracket === '5k-20k' && `${formatPrice(5000)} – ${formatPrice(20000)}`}
                {priceBracket === '20k-70k' && `${formatPrice(20000)} – ${formatPrice(70000)}`}
                {priceBracket === 'above-70k' && `Above ${formatPrice(70000)}`}
                {priceBracket === 'custom' &&
                  `Price: ${priceMin ? formatPrice(priceMin) : '₹0'} – ${
                    priceMax ? formatPrice(priceMax) : 'Max'
                  }`}
                <button onClick={() => onPriceBracketChange('all')} aria-label="Remove price filter">
                  ×
                </button>
              </span>
            )}

            {selectedBadges.map((badge) => (
              <span key={badge} className="shop-active-tag">
                {badge}
                <button onClick={() => onToggleBadge(badge)} aria-label={`Remove ${badge} filter`}>
                  ×
                </button>
              </span>
            ))}

            <button className="shop-clear-all-btn" onClick={onResetFilters}>
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
