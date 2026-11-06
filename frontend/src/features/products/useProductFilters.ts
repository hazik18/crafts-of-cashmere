import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, PaginationInfo, AvailableBadge } from '../../types';
import { api } from '../../services/api';

export type PriceBracketId = 'all' | 'under-5k' | '5k-20k' | '20k-70k' | 'above-70k' | 'custom';
export type SortOptionId = 'curated' | 'price_asc' | 'price_desc' | 'name_asc' | 'maker_asc';

export interface PriceBracket {
  id: PriceBracketId;
  label: string;
  min: number | null;
  max: number | null;
}

export const PRICE_BRACKETS: PriceBracket[] = [
  { id: 'all', label: 'All Prices', min: null, max: null },
  { id: 'under-5k', label: 'Under ₹5,000', min: null, max: 4999 },
  { id: '5k-20k', label: '₹5,000 – ₹20,000', min: 5000, max: 20000 },
  { id: '20k-70k', label: '₹20,000 – ₹70,000', min: 20001, max: 70000 },
  { id: 'above-70k', label: 'Above ₹70,000', min: 70001, max: null },
];

export const SORT_OPTIONS: { id: SortOptionId; label: string }[] = [
  { id: 'curated', label: 'Curated Heritage' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'name_asc', label: 'Piece Name (A–Z)' },
  { id: 'maker_asc', label: 'Artisan Name (A–Z)' },
];

/**
 * Automatically computes the optimal items-per-page based on screen size:
 * - Mobile Phones (< 640px, 1 column): 6 pieces
 * - Tablets / Small Screens (640px – 1099px, 2 columns): 8 pieces
 * - Monitors / Desktops (>= 1100px, 4 columns): 12 pieces
 */
function getResponsivePageLimit(): number {
  if (typeof window === 'undefined') return 12;
  const width = window.innerWidth;
  if (width < 640) return 6;
  if (width < 1100) return 8;
  return 12;
}

const DEFAULT_PAGINATION: PaginationInfo = {
  page: 1,
  limit: 12,
  totalItems: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

export const useProductFilters = (_initialProducts?: Product[]) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL params
  const paramCat = searchParams.get('cat') || 'pashmina';
  const paramQuery = searchParams.get('q') || '';
  const paramSort = (searchParams.get('sort') as SortOptionId) || 'curated';
  const paramBracket = (searchParams.get('bracket') as PriceBracketId) || 'all';
  const paramBadges = searchParams.get('badges') ? searchParams.get('badges')!.split(',').filter(Boolean) : [];
  const paramMin = searchParams.get('min') ? Number(searchParams.get('min')) : null;
  const paramMax = searchParams.get('max') ? Number(searchParams.get('max')) : null;
  const paramPage = parseInt(searchParams.get('page') || '1', 10) || 1;

  // Local state initialized with URL params
  const [activeCat, setActiveCatState] = useState<string>(paramCat);
  const [searchQuery, setSearchQueryState] = useState<string>(paramQuery);
  const [sortBy, setSortByState] = useState<SortOptionId>(paramSort);
  const [priceBracket, setPriceBracketState] = useState<PriceBracketId>(paramBracket);
  const [selectedBadges, setSelectedBadgesState] = useState<string[]>(paramBadges);
  const [priceMin, setPriceMinState] = useState<number | null>(paramMin);
  const [priceMax, setPriceMaxState] = useState<number | null>(paramMax);
  const [page, setPageState] = useState<number>(paramPage);

  // Dynamic limit driven exclusively by viewport screen size
  const [limit, setLimitState] = useState<number>(getResponsivePageLimit);

  // Server-side response state
  const [serverProducts, setServerProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    ...DEFAULT_PAGINATION,
    page: paramPage,
    limit,
  });
  const [availableBadges, setAvailableBadges] = useState<AvailableBadge[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [filteredCount, setFilteredCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync state if URL changes externally (e.g. back/forward navigation)
  useEffect(() => {
    setActiveCatState(paramCat);
    setSearchQueryState(paramQuery);
    setSortByState(paramSort);
    setPriceBracketState(paramBracket);
    setSelectedBadgesState(paramBadges);
    setPriceMinState(paramMin);
    setPriceMaxState(paramMax);
    setPageState(paramPage);
  }, [searchParams]);

  // Screen resize listener to auto-adjust items per page without user intervention
  useEffect(() => {
    let timeoutId: number;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const nextLimit = getResponsivePageLimit();
        setLimitState((prev) => (prev !== nextLimit ? nextLimit : prev));
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Push updates to URL query string
  const updateURL = useCallback(
    (updates: {
      cat?: string;
      q?: string;
      sort?: SortOptionId;
      bracket?: PriceBracketId;
      badges?: string[];
      min?: number | null;
      max?: number | null;
      page?: number;
    }) => {
      const nextParams = new URLSearchParams(searchParams);

      const nextCat = updates.cat !== undefined ? updates.cat : activeCat;
      const nextQ = updates.q !== undefined ? updates.q : searchQuery;
      const nextSort = updates.sort !== undefined ? updates.sort : sortBy;
      const nextBracket = updates.bracket !== undefined ? updates.bracket : priceBracket;
      const nextBadges = updates.badges !== undefined ? updates.badges : selectedBadges;
      const nextMin = updates.min !== undefined ? updates.min : priceMin;
      const nextMax = updates.max !== undefined ? updates.max : priceMax;
      const nextPage = updates.page !== undefined ? updates.page : 1; // Default to page 1 on filter changes

      if (nextCat) nextParams.set('cat', nextCat);
      else nextParams.delete('cat');

      if (nextQ.trim()) nextParams.set('q', nextQ.trim());
      else nextParams.delete('q');

      if (nextSort && nextSort !== 'curated') nextParams.set('sort', nextSort);
      else nextParams.delete('sort');

      if (nextBracket && nextBracket !== 'all') nextParams.set('bracket', nextBracket);
      else nextParams.delete('bracket');

      if (nextBadges.length > 0) nextParams.set('badges', nextBadges.join(','));
      else nextParams.delete('badges');

      if (nextMin !== null && !isNaN(nextMin)) nextParams.set('min', String(nextMin));
      else nextParams.delete('min');

      if (nextMax !== null && !isNaN(nextMax)) nextParams.set('max', String(nextMax));
      else nextParams.delete('max');

      if (nextPage > 1) nextParams.set('page', String(nextPage));
      else nextParams.delete('page');

      // Keep URL clean — remove limit from search params
      nextParams.delete('limit');

      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams, activeCat, searchQuery, sortBy, priceBracket, selectedBadges, priceMin, priceMax]
  );

  // Fetch paginated products from server
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    api.getProducts({
      page,
      limit,
      cat: activeCat,
      q: searchQuery,
      sort: sortBy,
      badges: selectedBadges,
      min: priceMin,
      max: priceMax,
    })
      .then((res) => {
        if (cancelled) return;
        setServerProducts(res.products);
        setPagination(res.pagination);
        setAvailableBadges(res.availableBadges);
        setFilteredCount(res.filteredCount);
        setTotalCount(res.totalCount);
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load server paginated products:', err);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCat, searchQuery, sortBy, selectedBadges, priceMin, priceMax, page, limit]);

  // Handlers — all filter changes automatically reset page to 1
  const setActiveCat = (cat: string) => {
    setActiveCatState(cat);
    setPageState(1);
    updateURL({ cat, page: 1 });
  };

  const setSearchQuery = (q: string) => {
    setSearchQueryState(q);
    setPageState(1);
    updateURL({ q, page: 1 });
  };

  const setSortBy = (sort: SortOptionId) => {
    setSortByState(sort);
    setPageState(1);
    updateURL({ sort, page: 1 });
  };

  const setPriceBracket = (bracket: PriceBracketId) => {
    setPriceBracketState(bracket);
    setPageState(1);
    if (bracket !== 'custom') {
      const found = PRICE_BRACKETS.find((b) => b.id === bracket);
      const min = found ? found.min : null;
      const max = found ? found.max : null;
      setPriceMinState(min);
      setPriceMaxState(max);
      updateURL({ bracket, min, max, page: 1 });
    } else {
      updateURL({ bracket, page: 1 });
    }
  };

  const setCustomRange = (min: number | null, max: number | null) => {
    setPriceBracketState('custom');
    setPriceMinState(min);
    setPriceMaxState(max);
    setPageState(1);
    updateURL({ bracket: 'custom', min, max, page: 1 });
  };

  const toggleBadge = (badge: string) => {
    const updated = selectedBadges.includes(badge)
      ? selectedBadges.filter((b) => b !== badge)
      : [...selectedBadges, badge];
    setSelectedBadgesState(updated);
    setPageState(1);
    updateURL({ badges: updated, page: 1 });
  };

  const setPage = (newPage: number) => {
    setPageState(newPage);
    updateURL({ page: newPage });
  };

  const resetFilters = () => {
    setSearchQueryState('');
    setSortByState('curated');
    setPriceBracketState('all');
    setSelectedBadgesState([]);
    setPriceMinState(null);
    setPriceMaxState(null);
    setPageState(1);

    const nextParams = new URLSearchParams();
    if (activeCat) nextParams.set('cat', activeCat);
    setSearchParams(nextParams, { replace: true });
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
      selectedBadges.length > 0 ||
      priceBracket !== 'all' ||
      priceMin !== null ||
      priceMax !== null ||
      sortBy !== 'curated'
  );

  return {
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
    filteredProducts: serverProducts,
    totalCount,
    filteredCount,
    availableBadges,
    hasActiveFilters,
    pagination,
    setPage,
    isLoading,
  };
};
