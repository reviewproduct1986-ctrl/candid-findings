import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Hook to filter and search products
 * Now receives products from DataContext instead of fetching
 */
export function useProductFilters(products) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [minRating, setMinRating] = useState(0);
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Get category from URL params
  const selectedCategory = searchParams.get('category') || 'All';

  // Function to update category (and URL)
  const setSelectedCategory = (category) => {
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  // Calculate max price from all products
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 500;
    const prices = products
      .filter(p => p && typeof p.price === 'number')
      .map(p => p.price);
    return prices.length > 0 ? Math.ceil(Math.max(...prices)) : 500;
  }, [products]);

  // Update price range max when products load
  useEffect(() => {
    if (maxPrice > 0 && priceRange[1] === 500) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice, priceRange]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(products.map(p => p.category))];
    return cats;
  }, [products]);

  // Get unique badges
  const availableBadges = useMemo(() => {
    const badges = products
      .filter(p => p.badge)
      .map(p => p.badge);
    return [...new Set(badges)];
  }, [products]);

  // Fuzzy search function
  const fuzzyScore = (str, query) => {
    if (!query) return 1;
    str = str.toLowerCase();
    query = query.toLowerCase();
    
    let score = 0;
    let queryIndex = 0;
    
    for (let i = 0; i < str.length && queryIndex < query.length; i++) {
      if (str[i] === query[queryIndex]) {
        score += 1;
        queryIndex++;
      }
    }
    
    return queryIndex === query.length ? score / str.length : 0;
  };

  // Weighted fuzzy search
  const searchProducts = (products, term) => {
    if (!term) return products;
    
    return products
      .map(product => {
        const titleScore = fuzzyScore(product.title, term) * 3;
        const categoryScore = fuzzyScore(product.category, term) * 2;
        const descScore = product.description ? fuzzyScore(product.description, term) : 0;
        const featureScore = product.features 
          ? Math.max(...product.features.map(f => fuzzyScore(f, term))) 
          : 0;
        
        const totalScore = titleScore + categoryScore + descScore + featureScore;
        
        return { ...product, searchScore: totalScore };
      })
      .filter(p => p.searchScore > 0)
      .sort((a, b) => b.searchScore - a.searchScore);
  };

  // Apply all filters
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // Price filter
    filtered = filtered.filter(p => 
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );
    
    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(p => p.rating >= minRating);
    }
    
    // Badge filter
    if (selectedBadges.length > 0) {
      filtered = filtered.filter(p => 
        p.badge && selectedBadges.includes(p.badge)
      );
    }
    
    // Search filter (with fuzzy matching and relevance sorting)
    if (searchTerm) {
      filtered = searchProducts(filtered, searchTerm);
    } else {
      // Default sort: newest first (by lastUpdated date)
      filtered = [...filtered].sort((a, b) => {
        if (a.lastUpdated && b.lastUpdated) {
          return new Date(b.lastUpdated) - new Date(a.lastUpdated);
        }
        // Fallback to ID comparison if no dates
        return b.id.localeCompare(a.id);
      });
    }
    
    return filtered;
  }, [products, selectedCategory, searchTerm, priceRange, minRating, selectedBadges]);

  return {
    // State
    selectedCategory,
    searchTerm,
    priceRange,
    minRating,
    selectedBadges,
    showFilters,
    // Setters
    setSelectedCategory,
    setSearchTerm,
    setPriceRange,
    setMinRating,
    setSelectedBadges,
    setShowFilters,
    // Computed
    categories,
    availableBadges,
    maxPrice,
    filteredProducts
  };
}