import { useState, useMemo } from 'react';

export function useSorting(products) {
  const [sortBy, setSortBy] = useState('default');

  const sortedProducts = useMemo(() => {
    const sorted = [...products];

    switch (sortBy) {
      case 'latest':
        // Sort by ID descending (higher ID = newer product)
        return sorted.sort((a, b) => b.id - a.id);
      
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      
      case 'rating':
        return sorted.sort((a, b) => {
          // Sort by rating first, then by review count as tiebreaker
          if (b.rating !== a.rating) {
            return (b.rating || 0) - (a.rating || 0);
          }
          return (b.reviews || 0) - (a.reviews || 0);
        });
      
      case 'reviews':
        return sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
      
      case 'discount':
        return sorted.sort((a, b) => {
          const discountA = a.listPrice ? ((a.listPrice - a.price) / a.listPrice) * 100 : 0;
          const discountB = b.listPrice ? ((b.listPrice - b.price) / b.listPrice) * 100 : 0;
          return discountB - discountA;
        });
      
      case 'savings':
        return sorted.sort((a, b) => {
          const savingsA = a.listPrice ? (a.listPrice - a.price) : 0;
          const savingsB = b.listPrice ? (b.listPrice - b.price) : 0;
          return savingsB - savingsA;
        });
      
      case 'default':
      default:
        // Default: Sort by rating * log(reviews) for quality + popularity balance
        return sorted.sort((a, b) => {
          const scoreA = (a.rating || 0) * Math.log10((a.reviews || 0) + 10);
          const scoreB = (b.rating || 0) * Math.log10((b.reviews || 0) + 10);
          return scoreB - scoreA;
        });
    }
  }, [products, sortBy]);

  return { sortBy, setSortBy, sortedProducts };
}