import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Zap, Star, ChevronRight, Loader2, Sparkles, ArrowRight, Filter, X } from 'lucide-react';

// Simulated Amazon products - in production, use Amazon Product Advertising API
const SAMPLE_PRODUCTS = [
  {
    id: '1',
    title: 'Premium Wireless Noise Cancelling Headphones',
    category: 'Electronics',
    price: 299.99,
    rating: 4.7,
    reviews: 12453,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    affiliate: 'https://amazon.com/dp/example1',
    badge: 'Best Seller'
  },
  {
    id: '2',
    title: 'Smart Fitness Watch with Heart Rate Monitor',
    category: 'Health & Fitness',
    price: 249.99,
    rating: 4.5,
    reviews: 8932,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    affiliate: 'https://amazon.com/dp/example2',
    badge: 'Trending'
  },
  {
    id: '3',
    title: 'Ergonomic Office Chair with Lumbar Support',
    category: 'Home & Office',
    price: 399.99,
    rating: 4.8,
    reviews: 15621,
    image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=400&fit=crop',
    affiliate: 'https://amazon.com/dp/example3',
    badge: 'Top Rated'
  },
  {
    id: '4',
    title: 'Professional Coffee Maker with Timer',
    category: 'Kitchen',
    price: 179.99,
    rating: 4.6,
    reviews: 6234,
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=400&fit=crop',
    affiliate: 'https://amazon.com/dp/example4'
  },
  {
    id: '5',
    title: 'Ultra HD 4K Action Camera Waterproof',
    category: 'Electronics',
    price: 329.99,
    rating: 4.7,
    reviews: 9876,
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop',
    affiliate: 'https://amazon.com/dp/example5',
    badge: 'New Arrival'
  },
  {
    id: '6',
    title: 'Adjustable Laptop Stand Aluminum',
    category: 'Home & Office',
    price: 49.99,
    rating: 4.4,
    reviews: 4521,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    affiliate: 'https://amazon.com/dp/example6'
  }
];

export default function ModernAffiliateSite() {
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  const [blogPosts, setBlogPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [generatingBlog, setGeneratingBlog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [minRating, setMinRating] = useState(0);
  const [selectedBadges, setSelectedBadges] = useState([]);

  // Levenshtein distance for fuzzy matching (typo tolerance)
  const calculateLevenshteinDistance = (str1, str2) => {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];

    for (let i = 0; i <= len1; i++) matrix[i] = [i];
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[len1][len2];
  };

  // Calculate similarity (0-1, where 1 is identical)
  const calculateSimilarity = (str1, str2) => {
    const distance = calculateLevenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : 1 - (distance / maxLength);
  };

  // Check if strings match with typo tolerance
  const isFuzzyMatch = (str1, str2, threshold = 0.75) => {
    if (str1.toLowerCase() === str2.toLowerCase()) return true;
    if (str1.toLowerCase().includes(str2.toLowerCase()) || 
        str2.toLowerCase().includes(str1.toLowerCase())) return true;
    return calculateSimilarity(str1, str2) >= threshold;
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Weighted search function for better relevance (with fuzzy matching for typos)
  const calculateRelevanceScore = (product, searchTerm) => {
    if (!searchTerm) return 1;
    
    const term = searchTerm.toLowerCase();
    const title = product.title.toLowerCase();
    const category = product.category.toLowerCase();
    const badge = (product.badge || '').toLowerCase();
    
    let score = 0;
    
    // === EXACT MATCHES (Highest Priority) ===
    if (title === term) score += 100;                    // Exact match
    else if (title.startsWith(term)) score += 50;        // Starts with
    else if (title.includes(term)) score += 30;          // Contains
    
    // === FUZZY MATCHING (Typo Tolerance) ===
    // Only check fuzzy if no exact match found
    if (score === 0) {
      const titleWords = title.split(' ');
      
      // Check each word for fuzzy match (handles typos like "hedphone" → "headphone")
      for (const word of titleWords) {
        if (word.length >= 3 && isFuzzyMatch(word, term, 0.75)) {
          score += 25;  // Fuzzy match on individual word
          break;
        }
      }
      
      // Check if entire title is similar (handles "wireles hedphone" → "wireless headphone")
      if (score === 0 && term.length >= 4 && isFuzzyMatch(title, term, 0.70)) {
        score += 20;  // Fuzzy match on entire title
      }
      
      // Very close match bonus (1-2 character typo)
      const similarity = calculateSimilarity(title, term);
      if (similarity >= 0.85 && similarity < 1.0) {
        score += 15;  // Almost exact match
      }
    }
    
    // === CATEGORY MATCHING ===
    if (category === term) score += 20;                  // Exact match
    else if (category.includes(term)) score += 10;       // Contains
    else if (isFuzzyMatch(category, term, 0.80)) score += 8;  // Fuzzy category match
    
    // === BADGE MATCHING ===
    if (badge.includes(term)) score += 5;
    else if (isFuzzyMatch(badge, term, 0.80)) score += 3;  // Fuzzy badge match
    
    // === BONUS SCORING ===
    // Multiple word matches (exact or fuzzy)
    const titleWords = title.split(' ');
    const matchingWords = titleWords.filter(word => 
      word.includes(term) || (word.length >= 3 && isFuzzyMatch(word, term, 0.75))
    ).length;
    if (matchingWords > 1) score += 10;
    
    // Prefer shorter, more specific titles
    if (score > 0 && titleWords.length <= 5) score += 5;
    
    return score;
  };

  // Filter and sort products by relevance
  const filteredProducts = products
    .map(product => ({
      ...product,
      relevanceScore: calculateRelevanceScore(product, searchTerm)
    }))
    .filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = !searchTerm || product.relevanceScore > 0;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesRating = product.rating >= minRating;
      const matchesBadge = selectedBadges.length === 0 || (product.badge && selectedBadges.includes(product.badge));
      
      return matchesCategory && matchesSearch && matchesPrice && matchesRating && matchesBadge;
    })
    .sort((a, b) => {
      // Primary sort: relevance score (highest first)
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      // Secondary sort: rating (if equal relevance)
      return b.rating - a.rating;
    });

  // Get unique badges for filter
  const availableBadges = [...new Set(products.filter(p => p.badge).map(p => p.badge))];
  
  // Clear all filters
  const clearFilters = () => {
    setPriceRange([0, 500]);
    setMinRating(0);
    setSelectedBadges([]);
    setSelectedCategory('All');
  };
  
  // Check if any filters are active
  const hasActiveFilters = priceRange[0] > 0 || priceRange[1] < 500 || minRating > 0 || selectedBadges.length > 0 || selectedCategory !== 'All';

  const generateBlogPost = async (product) => {
    setGeneratingBlog(true);
    setSelectedProduct(product);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Write a comprehensive product review (300-400 words) about this product: "${product.title}". 
              
              Requirements:
              - Engaging headline with the product name
              - Include benefits and features
              - Use natural, conversational language
              - Add a compelling call-to-action
              - Write in an informative, helpful tone
              - Focus on helping customers make informed decisions
              
              Format as JSON with these fields: title, metaDescription, content (as HTML with proper tags), keywords (array of 5-7 relevant keywords)`
            }
          ],
        })
      });

      const data = await response.json();
      const textContent = data.content.find(c => c.type === "text")?.text || "";
      
      const cleanJson = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const blogData = JSON.parse(cleanJson);

      const newPost = {
        id: Date.now(),
        productId: product.id,
        product: product,
        ...blogData,
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      };

      setBlogPosts([newPost, ...blogPosts]);
      setGeneratingBlog(false);
    } catch (error) {
      console.error("Error generating blog post:", error);
      setGeneratingBlog(false);
      alert("Failed to load review. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        
        .glass-morphism {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .gradient-border {
          position: relative;
          background: white;
        }
        
        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .gradient-border:hover::before {
          opacity: 1;
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-morphism shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo & Title */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="text-white" size={18} />
              </div>
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">
                ProductOpinion
              </h1>
            </div>
            
            {/* Search Bar - Inline */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-white border border-slate-200 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all text-slate-700 placeholder-slate-400 text-sm"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all flex-shrink-0 ${
                showFilters || hasActiveFilters
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter size={16} />
              <span className="text-sm hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  •
                </span>
              )}
            </button>

            {/* Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-100 to-indigo-100 rounded-full flex-shrink-0">
              <TrendingUp className="text-violet-600" size={14} />
              <span className="text-xs font-semibold text-violet-900">Expert Reviews</span>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Panel */}
      {showFilters && (
        <div className="sticky top-[62px] z-40 glass-morphism border-t border-slate-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Price Range */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3 text-sm flex items-center gap-2">
                  💰 Price Range
                </h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-violet-600"
                  />
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3 text-sm flex items-center gap-2">
                  ⭐ Minimum Rating
                </h3>
                <div className="flex gap-1">
                  {[0, 3, 4, 4.5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                        minRating === rating
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {rating === 0 ? 'All' : `${rating}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Badge Filter */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3 text-sm flex items-center gap-2">
                  🏆 Badges
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {availableBadges.map(badge => (
                    <button
                      key={badge}
                      onClick={() => {
                        setSelectedBadges(prev =>
                          prev.includes(badge)
                            ? prev.filter(b => b !== badge)
                            : [...prev, badge]
                        );
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedBadges.includes(badge)
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {badge}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <div className="bg-white rounded-lg p-4 border border-slate-200 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2 text-sm">
                    Active Filters
                  </h3>
                  <p className="text-xs text-slate-600 mb-3">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full py-2 px-4 bg-slate-100 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-all"
                  >
                    Clear All
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Categories */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="text-slate-600" size={18} />
            <h2 className="text-lg md:text-xl font-bold text-slate-800">
              Filter by Category
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200 scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-50 shadow-sm hover:shadow-md border border-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-800">
              Curated Products
            </h2>
            <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
              <span className="text-sm font-semibold text-slate-600">
                {filteredProducts.length} results
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, idx) => (
              <div
                key={product.id}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-violet-200"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-slate-100 to-slate-200">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {product.badge && (
                    <div className="absolute top-4 left-4 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold rounded-full shadow-lg">
                      {product.badge}
                    </div>
                  )}
                  <div className="absolute top-4 right-4 px-3 py-1 glass-morphism rounded-full text-xs font-semibold text-slate-700">
                    {product.category}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 line-clamp-2 min-h-[3.5rem]">
                    {product.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-600 font-medium">
                      {product.rating} • {product.reviews.toLocaleString()} reviews
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-6">
                    <p className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                      ${product.price}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={product.affiliate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold text-center hover:shadow-lg hover:shadow-violet-200 transition-all group/btn flex items-center justify-center gap-2"
                    >
                      View Deal
                      <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                    <button
                      onClick={() => generateBlogPost(product)}
                      disabled={generatingBlog && selectedProduct?.id === product.id}
                      className="flex-1 bg-white text-violet-600 py-3 px-4 rounded-xl font-semibold hover:bg-violet-50 transition-all disabled:opacity-50 border-2 border-violet-200 flex items-center justify-center gap-2"
                      title="View Detailed Review"
                    >
                      {generatingBlog && selectedProduct?.id === product.id ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          <span className="text-sm">Loading...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          <span className="text-sm md:text-base">Read Review</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blog Posts Section */}
        {blogPosts.length > 0 && (
          <div className="mt-20">
            <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-10 mb-12 shadow-2xl">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="text-white" size={28} />
                  <h2 className="text-4xl font-bold text-white">
                    Expert Product Reviews
                  </h2>
                </div>
                <p className="text-violet-100 text-lg max-w-2xl">
                  Comprehensive product analysis and buying recommendations from our expert team
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {blogPosts.map(post => (
                <article
                  key={post.id}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-500"
                >
                  <div className="grid md:grid-cols-[300px_1fr] gap-8 p-8">
                    <div className="relative">
                      <img
                        src={post.product.image}
                        alt={post.product.title}
                        className="w-full aspect-square object-cover rounded-2xl shadow-md"
                      />
                      {post.product.badge && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold rounded-full shadow-lg">
                          {post.product.badge}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-4 py-1.5 bg-violet-100 text-violet-700 text-xs font-bold rounded-full">
                          {post.product.category}
                        </span>
                        <span className="text-sm text-slate-500">{post.date}</span>
                      </div>
                      
                      <h3 className="text-3xl font-bold text-slate-800 mb-4">
                        {post.title}
                      </h3>
                      
                      <p className="text-slate-600 mb-6 leading-relaxed">
                        {post.metaDescription}
                      </p>
                      
                      <div 
                        className="prose prose-slate max-w-none mb-6 text-slate-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />
                      
                      <div className="mb-6">
                        <p className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">
                          Optimized Keywords
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {post.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>

                      <a
                        href={post.product.affiliate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-violet-200 transition-all group"
                      >
                        Check Current Price
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Getting Started */}
        {blogPosts.length === 0 && (
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-3xl p-10 border border-violet-100">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  Expert Product Reviews & Recommendations
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Click the sparkle icon on any product to read our detailed expert analysis and buying recommendations
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white p-6 rounded-2xl border border-violet-100">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-violet-600">1</span>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Browse Products</h4>
                <p className="text-sm text-slate-600">
                  Explore our curated selection of top-rated products across all categories
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-violet-100">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-indigo-600">2</span>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Read Expert Reviews</h4>
                <p className="text-sm text-slate-600">
                  Get comprehensive analysis with pros, cons, and honest recommendations
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-violet-100">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-purple-600">3</span>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Shop Smart</h4>
                <p className="text-sm text-slate-600">
                  Make informed decisions with unbiased reviews and best price recommendations
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="text-white" size={20} />
              </div>
              <p className="font-bold text-white text-lg">
                ProductOpinion
              </p>
            </div>
            <p className="text-sm text-slate-400">
              Expert product curation and unbiased reviews © 2024
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}