import React from 'react';
import { PaginationInfo } from '../../types';

interface ShopPaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export const ShopPagination: React.FC<ShopPaginationProps> = ({
  pagination,
  onPageChange,
}) => {
  const { page, totalPages, hasNext, hasPrev } = pagination;

  if (totalPages <= 1) return null;

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (page <= 4) {
      return [1, 2, 3, 4, 5, '…', totalPages];
    }

    if (page >= totalPages - 3) {
      return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '…', page - 1, page, page + 1, '…', totalPages];
  };

  const handlePageClick = (p: number) => {
    if (p === page || p < 1 || p > totalPages) return;
    onPageChange(p);
  };

  return (
    <nav className="shop-pagination" aria-label="Catalog pagination" >
      {/* Page Navigation Controls */}
      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-btn pagination-prev"
          disabled={!hasPrev}
          onClick={() => handlePageClick(page - 1)}
          aria-label="Previous page"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span>Prev</span>
        </button>

        <div className="pagination-pages">
          {getPageNumbers().map((item, idx) => {
            if (item === '…') {
              return (
                <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                  …
                </span>
              );
            }

            const pageNum = Number(item);
            const isActive = pageNum === page;

            return (
              <button
                key={pageNum}
                type="button"
                className={`pagination-page-btn ${isActive ? 'active' : ''}`}
                onClick={() => handlePageClick(pageNum)}
                aria-label={`Page ${pageNum}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="pagination-btn pagination-next"
          disabled={!hasNext}
          onClick={() => handlePageClick(page + 1)}
          aria-label="Next page"
        >
          <span>Next</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </nav>
  );
};
