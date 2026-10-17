import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, CraftCategory } from '../../types';

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

export const useProductFilters = (products: Product[]) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL params
  const paramCat = searchParams.get('cat') || 'pashmina';
  const paramQuery = searchParams.get('q') || '';
  const paramSort = (searchParams.get('sort') as SortOptionId) || 'curated';
  const paramBracket = (searchParams.get('bracket') as PriceBracketId) || 'all';
  const paramBadges = searchParams.get('badges') ? searchParams.get('badges')!.split(',').filter(Boolean) : [];
  const paramMin = searchParams.get('min') ? Number(searchParams.get('min')) : null;
  const paramMax = searchParams.get('max') ? Number(searchParams.get('max')) : null;

  // Local state initialized with URL params
  const [activeCat, setActiveCatState] = useState<string>(paramCat);
  const [searchQuery, setSearchQueryState] = useState<string>(paramQuery);
  const [sortBy, setSortByState] = useState<SortOptionId>(paramSort);
  const [priceBracket, setPriceBracketState] = useState<PriceBracketId>(paramBracket);
  const [selectedBadges, setSelectedBadgesState] = useState<string[]>(paramBadges);
  const [priceMin, setPriceMinState] = useState<number | null>(paramMin);
  const [priceMax, setPriceMaxState] = useState<number | null>(paramMax);

  // Sync state if URL changes externally (e.g. back button)
  useEffect(() => {
    setActiveCatState(paramCat);
    setSearchQueryState(paramQuery);
    setSortByState(paramSort);
    setPriceBracketState(paramBracket);
    setSelectedBadgesState(paramBadges);
    setPriceMinState(paramMin);
    setPriceMaxState(paramMax);
  }, [searchParams]);

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
    }) => {
      const nextParams = new URLSearchParams(searchParams);

      const nextCat = updates.cat !== undefined ? updates.cat : activeCat;
      const nextQ = updates.q !== undefined ? updates.q : searchQuery;
      const nextSort = updates.sort !== undefined ? updates.sort : sortBy;
      const nextBracket = updates.bracket !== undefined ? updates.bracket : priceBracket;
      const nextBadges = updates.badges !== undefined ? updates.badges : selectedBadges;
      const nextMin = updates.min !== undefined ? updates.min : priceMin;
      const nextMax = updates.max !== undefined ? updates.max : priceMax;

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

      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams, activeCat, searchQuery, sortBy, priceBracket, selectedBadges, priceMin, priceMax]
  );

  // Handlers
  const setActiveCat = (cat: string) => {
    setActiveCatState(cat);
    updateURL({ cat });
  };

  const setSearchQuery = (q: string) => {
    setSearchQueryState(q);
    updateURL({ q });
  };

  const setSortBy = (sort: SortOptionId) => {
    setSortByState(sort);
    updateURL({ sort });
  };

  const setPriceBracket = (bracket: PriceBracketId) => {
    setPriceBracketState(bracket);
    if (bracket !== 'custom') {
      const found = PRICE_BRACKETS.find((b) => b.id === bracket);
      const min = found ? found.min : null;
      const max = found ? found.max : null;
      setPriceMinState(min);
      setPriceMaxState(max);
      updateURL({ bracket, min, max });
    } else {
      updateURL({ bracket });
    }
  };

  const setCustomRange = (min: number | null, max: number | null) => {
    setPriceBracketState('custom');
    setPriceMinState(min);
    setPriceMaxState(max);
    updateURL({ bracket: 'custom', min, max });
  };

  const toggleBadge = (badge: string) => {
    const updated = selectedBadges.includes(badge)
      ? selectedBadges.filter((b) => b !== badge)
      : [...selectedBadges, badge];
    setSelectedBadgesState(updated);
    updateURL({ badges: updated });
  };

  const resetFilters = () => {
    setSearchQueryState('');
    setSortByState('curated');
    setPriceBracketState('all');
    setSelectedBadgesState([]);
    setPriceMinState(null);
    setPriceMaxState(null);
    const nextParams = new URLSearchParams();
    if (activeCat) nextParams.set('cat', activeCat);
    setSearchParams(nextParams, { replace: true });
  };

  // Derive unique badges with count
  const availableBadges = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      // filter by current category if not all
      if (activeCat !== 'all' && p.cat !== activeCat) return;
      if (p.badge) {
        counts[p.badge] = (counts[p.badge] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([badge, count]) => ({ badge, count }))
      .sort((a, b) => b.count - a.count);
  }, [products, activeCat]);

  // Filter and Sort algorithm
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return products
      .filter((item) => {
        // 1. Category check
        if (activeCat !== 'all' && item.cat !== activeCat) {
          return false;
        }

        // 2. Keyword query match
        if (q) {
          const matchName = item.name.toLowerCase().includes(q);
          const matchMaker = item.maker.toLowerCase().includes(q);
          const matchBadge = (item.badge || '').toLowerCase().includes(q);
          const matchDesc = (item.desc || '').toLowerCase().includes(q);
          const matchCat = (item.cat || '').toLowerCase().includes(q);
          if (!matchName && !matchMaker && !matchBadge && !matchDesc && !matchCat) {
            return false;
          }
        }

        // 3. Badges multi-select match (match any selected)
        if (selectedBadges.length > 0) {
          if (!selectedBadges.includes(item.badge)) {
            return false;
          }
        }

        // 4. Price range match
        if (priceMin !== null && item.price < priceMin) {
          return false;
        }
        if (priceMax !== null && item.price > priceMax) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (sortBy === 'maker_asc') return a.maker.localeCompare(b.maker);
        return 0; // Curated order
      });
  }, [products, activeCat, searchQuery, selectedBadges, priceMin, priceMax, sortBy]);

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
    filteredProducts,
    totalCount: products.length,
    filteredCount: filteredProducts.length,
    availableBadges,
    hasActiveFilters,
  };
};
