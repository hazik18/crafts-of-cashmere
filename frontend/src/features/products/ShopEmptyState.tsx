import React from 'react';

interface ShopEmptyStateProps {
  searchQuery?: string;
  onReset: () => void;
}

export const ShopEmptyState: React.FC<ShopEmptyStateProps> = ({ searchQuery, onReset }) => {
  return (
    <div className="shop-empty-state">
      <div className="shop-empty-icon" aria-hidden="true">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1.2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
          <path d="M11 8v6M8 11h6" />
        </svg>
      </div>

      <h3 className="shop-empty-title">No pieces match your search</h3>

      <p className="shop-empty-desc">
        {searchQuery ? (
          <>
            We couldn’t find any heirlooms matching “<strong>{searchQuery}</strong>”.
            <br />
            Try searching for an artisan name (e.g. <em>Fatima Bano</em>, <em>Bashir Ahmad</em>),
            a weave type (<em>Pashmina</em>, <em>Kaani</em>), or reset your filters.
          </>
        ) : (
          <>
            No pieces align with the currently selected price or craft badge filters.
            <br />
            Expand your selection to discover more handcrafted works from the valley.
          </>
        )}
      </p>

      <button className="shop-empty-reset-btn" onClick={onReset}>
        Reset All Filters
      </button>
    </div>
  );
};
