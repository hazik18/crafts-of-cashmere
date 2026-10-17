import React, { useState, useRef, useEffect } from 'react';
import { SortOptionId, SORT_OPTIONS } from './useProductFilters';

interface ShopSortDropdownProps {
  sortBy: SortOptionId;
  onSortChange: (sort: SortOptionId) => void;
}

export const ShopSortDropdown: React.FC<ShopSortDropdownProps> = ({ sortBy, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeOption = SORT_OPTIONS.find((opt) => opt.id === sortBy) || SORT_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (id: SortOptionId) => {
    onSortChange(id);
    setIsOpen(false);
  };

  const renderIcon = (id: SortOptionId) => {
    switch (id) {
      case 'curated':
        return (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      case 'price_asc':
        return (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        );
      case 'price_desc':
        return (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        );
      case 'name_asc':
        return (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
          </svg>
        );
      case 'maker_asc':
        return (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className="shop-sort-wrap">
      <span className="shop-sort-label">Sort by:</span>

      <div className="shop-custom-sort">
        <button
          type="button"
          className={`shop-sort-trigger ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={`Sort by: ${activeOption.label}`}
        >
          <span className="shop-sort-current-text">{activeOption.label}</span>
          <svg
            className={`shop-sort-chevron ${isOpen ? 'open' : ''}`}
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {isOpen && (
          <div className="shop-sort-menu" role="listbox" aria-label="Sort Options">
            {SORT_OPTIONS.map((opt) => {
              const isSelected = opt.id === sortBy;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`shop-sort-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.id)}
                >
                  <span className="shop-sort-opt-icon">{renderIcon(opt.id)}</span>
                  <span className="shop-sort-opt-label">{opt.label}</span>
                  {isSelected && (
                    <svg
                      className="shop-sort-opt-check"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
