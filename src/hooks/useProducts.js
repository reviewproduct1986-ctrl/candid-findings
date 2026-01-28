import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { categoryToSlug } from '../utils/urlHelper';

/**
 * Hook to filter and search products
 * Now receives products from DataContext instead of fetching
 * Uses Fuse.js for improved fuzzy searching
 */
export function useProductFilters(products, selectedCategory = 'All') {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [minRating, setMinRating] = useState(0);
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();

  // Function to update category (and URL)
  const setSelectedCategory = (category) => {
    if (category === 'All') {
      navigate('/', { replace: true });
    } else {
      navigate(`/category/${categoryToSlug(category)}`);
    }
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

  // Configure Fuse.js options
  const fuseOptions = {
    // Threshold: 0.0 = perfect match, 1.0 = match anything
    threshold: 0.4,
    // Location where the match is expected to be found
    location: 0,
    // Distance: how far from location to search
    distance: 100,
    // Whether to sort by score
    shouldSort: true,
    // Include score in results
    includeScore: true,
    // Minimum character length before searching
    minMatchCharLength: 2,
    // Keys to search with their weights
    keys: [
      { name: 'title', weight: 0.5 },        // 50% weight
      { name: 'category', weight: 0.2 },     // 20% weight
      { name: 'description', weight: 0.2 },  // 20% weight
      { name: 'features', weight: 0.1 }      // 10% weight
    ]
  };

  // Create Fuse instance (memoized to avoid recreating on every render)
  const fuse = useMemo(() => {
    return new Fuse(products, fuseOptions);
  }, [products]);

  // Apply all filters
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => categoryToSlug(p.category) === categoryToSlug(selectedCategory));
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
    
    // Search filter using Fuse.js
    if (searchTerm) {
      // Create a new Fuse instance with the already filtered products
      const searchFuse = new Fuse(filtered, fuseOptions);
      const results = searchFuse.search(searchTerm);
      // Extract the items from Fuse results
      filtered = results.map(result => result.item);
    } else {
      // Default sort: newest first (by lastUpdated date)
      filtered = [...filtered].sort((a, b) => {
        if (a.lastUpdated && b.lastUpdated) {
          return new Date(b.lastUpdated) - new Date(a.lastUpdated);
        }
        // Fallback to ID comparison if no dates
        // Handle both string and number IDs
        const idA = String(a.id);
        const idB = String(b.id);
        return idB.localeCompare(idA);
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