"use client";

import { useEffect, useState } from "react";

type UsePaginatedSearchStateOptions = {
  initialPageSize?: number;
  initialSearch?: string;
};

export function usePaginatedSearchState(options: UsePaginatedSearchStateOptions = {}) {
  const { initialPageSize = 20, initialSearch = "" } = options;
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPageIndex(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return {
    pageIndex,
    pageSize,
    searchInput,
    debouncedSearch,
    setPageIndex,
    setPageSize,
    setSearchInput,
  };
}
