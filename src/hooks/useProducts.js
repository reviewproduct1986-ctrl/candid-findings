import { useState, useEffect, useMemo } from 'react';

/**
 * Hook to load products and blogs from JSON files
 */
export function useProductData() {
  const [products, setProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/data/products.json').then(res => res.json()),
      fetch('/data/blogs.json').then(res => res.json())
    ])
      .then(([productsData, blogsData]) => {
        // Extract arrays from response with safety checks
        const productsList = productsData?.products || [];
        const blogsList = blogsData?.posts || [];
        
        // Add review URLs to products based on blog slugs
        const productsWithReviews = productsList.map(product => {
          const blog = blogsList.find(b => b.productId === product.id);
          return {
            ...product,
            reviewUrl: blog ? `/reviews/${blog.slug}` : null
          };
        });
        
        setProducts(productsWithReviews);
        setBlogs(blogsList);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading data:', error);
        setProducts([]); // Ensure empty array on error
        setBlogs([]);
        setLoading(false);
      });
  }, []);

  return { products, blogs, loading };
}

/**
 * Hook to filter and search products
 */
export function useProductFilters(products = []) { // Default to empty array
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Calculate max price dynamically from products
  const maxPrice = useMemo(() => {
    if (!products || products.length === 0) return 500; // Default fallback
    
    // Filter out invalid products and find highest price
    const validPrices = products
      .filter(p => p && typeof p.price === 'number')
      .map(p => p.price);
    
    if (validPrices.length === 0) return 500;
    
    const highest = Math.max(...validPrices);
    
    // Round up to nearest 50 for cleaner slider
    return Math.ceil(highest / 50) * 50;
  }, [products]);

  // Initialize price range with dynamic max (only once when products load)
  const [priceRange, setPriceRange] = useState([0, maxPrice]);

  // Update max price when products change
  useEffect(() => {
    if (products && products.length > 0) {
      setPriceRange(prev => [prev[0], maxPrice]);
    }
  }, [maxPrice, products]);

  // Get unique categories with safety checks
  const categories = useMemo(() => {
    if (!products || products.length === 0) return ['All'];
    
    const validCategories = products
      .filter(p => p && p.category) // Filter out invalid products
      .map(p => p.category);
    
    const uniqueCategories = [...new Set(validCategories)];
    return ['All', ...uniqueCategories];
  }, [products]);

  // Get unique badges with safety checks
  const availableBadges = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    const badges = products
      .filter(p => p && p.badge) // Filter out products without badges
      .map(p => p.badge);
    
    return [...new Set(badges)];
  }, [products]);

  // Fuzzy search function
  const fuzzyScore = (str, query) => {
    if (!query || !str) return 0;
    str = String(str).toLowerCase();
    query = String(query).toLowerCase();
    
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
    if (!term || !products) return products;
    
    return products
      .filter(p => p && p.title) // Filter out invalid products
      .map(product => {
        const titleScore = fuzzyScore(product.title, term) * 3;
        const categoryScore = fuzzyScore(product.category || '', term) * 2;
        const descScore = product.description ? fuzzyScore(product.description, term) : 0;
        const featureScore = product.features && Array.isArray(product.features)
          ? Math.max(...product.features.map(f => fuzzyScore(f, term))) 
          : 0;
        
        const totalScore = titleScore + categoryScore + descScore + featureScore;
        
        return { ...product, searchScore: totalScore };
      })
      .filter(p => p.searchScore > 0)
      .sort((a, b) => b.searchScore - a.searchScore);
  };

  // Apply all filters with comprehensive safety checks
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    // Filter out invalid products first
    let filtered = products.filter(p => p && p.title && typeof p.price === 'number');
    
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
      filtered = filtered.filter(p => 
        typeof p.rating === 'number' && p.rating >= minRating
      );
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
        if (a.id && b.id) {
          return String(b.id).localeCompare(String(a.id));
        }
        return 0;
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
    filteredProducts,
    maxPrice // Export max price for FilterPanel
  };
}