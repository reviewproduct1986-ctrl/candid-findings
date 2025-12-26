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
        // Extract arrays from response
        const productsList = productsData.products || [];
        const blogsList = blogsData.posts || [];
        
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
        setLoading(false);
      });
  }, []);

  return { products, blogs, loading };
}

/**
 * Hook to filter and search products
 */
export function useProductFilters(products) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [minRating, setMinRating] = useState(0);
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

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
    filteredProducts
  };
}