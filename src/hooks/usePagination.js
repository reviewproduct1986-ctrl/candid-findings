import { useState, useMemo, useEffect } from 'react';

export function usePagination(items, itemsPerPage = 12, dependencies = []) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when dependencies change
  useEffect(() => {
    setCurrentPage(1);
  }, dependencies);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);

    return {
      totalPages,
      startIndex,
      endIndex,
      currentItems
    };
  }, [items, currentPage, itemsPerPage]);

  return {
    currentPage,
    setCurrentPage,
    ...paginationData
  };
}