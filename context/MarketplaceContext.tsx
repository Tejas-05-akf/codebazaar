'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface FilterState {
  businessCategory: string | null;
  solutionType: string | null;
  searchQuery: string;
  sortBy: 'newest' | 'popular' | 'price-low' | 'price-high';
}

interface MarketplaceContextType {
  filter: FilterState;
  setFilter: (filter: Partial<FilterState>) => void;
  clearFilter: () => void;
  setBusinessCategory: (category: string | null) => void;
  setSolutionType: (type: string | null) => void;
  setSortBy: (sort: FilterState['sortBy']) => void;
  setSearchQuery: (query: string) => void;
  filteredCount: number;
  setFilteredCount: (n: number) => void;
}

const defaultFilter: FilterState = {
  businessCategory: null,
  solutionType: null,
  searchQuery: '',
  sortBy: 'popular',
};

const MarketplaceContext = createContext<MarketplaceContextType | null>(null);

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const [filter, setFilterState] = useState<FilterState>(defaultFilter);
  const [filteredCount, setFilteredCount] = useState(0);

  const setFilter = useCallback((partial: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...partial }));
  }, []);

  const clearFilter = useCallback(() => {
    setFilterState(defaultFilter);
  }, []);

  const setBusinessCategory = useCallback((category: string | null) => {
    setFilterState((prev) => ({ ...prev, businessCategory: category, solutionType: null }));
  }, []);

  const setSolutionType = useCallback((type: string | null) => {
    setFilterState((prev) => ({ ...prev, solutionType: type }));
  }, []);

  const setSortBy = useCallback((sort: FilterState['sortBy']) => {
    setFilterState((prev) => ({ ...prev, sortBy: sort }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setFilterState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  return (
    <MarketplaceContext.Provider
      value={{
        filter,
        setFilter,
        clearFilter,
        setBusinessCategory,
        setSolutionType,
        setSortBy,
        setSearchQuery,
        filteredCount,
        setFilteredCount,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) throw new Error('useMarketplace must be inside MarketplaceProvider');
  return ctx;
}
