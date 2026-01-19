import React, { useMemo, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import FilterPanel from '../components/FilterPanel';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import Pagination from '../components/Pagination';
import Footer from '../components/Footer';
import { useProductFilters } from '../hooks/useProducts';
import { generateItemListSchema, generateBreadcrumbSchema } from '../utils/schemaGenerators';
import { getAmazonSearchUrl } from '../utils/affiliateConfig';
import { useData } from '../context/DataContext';

export default function ProductListing() {
  const { products, blogs, loading } = useData();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 12 products per page (divisible by 2 and 3 for responsive grid)

  // Add review URLs to products
  const productsWithReviews = useMemo(() => {
    return products.map(product => {
      const blog = blogs.find(b => b.productId === product.id);
      return {
        ...product,
        reviewUrl: blog ? `/reviews/${blog.slug}` : null
      };
    });
  }, [products, blogs]);
  
  // Filter logic
  const {
    selectedCategory,
    searchTerm,
    priceRange,
    minRating,
    selectedBadges,
    showFilters,
    setSelectedCategory,
    setSearchTerm,
    setPriceRange,
    setMinRating,
    setSelectedBadges,
    setShowFilters,
    categories,
    availableBadges,
    filteredProducts,
    maxPrice
  } = useProductFilters(productsWithReviews);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm, priceRange, minRating, selectedBadges]);

  // Scroll to top of product grid when page changes
  useEffect(() => {
    const productGrid = document.querySelector('[data-product-grid]');
    if (productGrid) {
      const headerHeight = 140;
      const yOffset = -headerHeight;
      const y = productGrid.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  }, [currentPage]);

  // Generate page title and description based on category
  const pageTitle = selectedCategory && selectedCategory !== 'All'
    ? `${selectedCategory} Products | CandidFindings`
    : 'CandidFindings | Honest Product Reviews & Recommendations';

  const pageDescription = selectedCategory && selectedCategory !== 'All'
    ? `Browse our curated selection of ${selectedCategory} products. Expert reviews, honest opinions, and smart recommendations to help you make better buying decisions.`
    : 'Discover expert-curated product reviews and honest opinions. From electronics to home essentials, find products you\'ll actually love with CandidFindings.';

  // Generate schemas using modular generators
  const itemListSchema = useMemo(() => 
    generateItemListSchema(selectedCategory, filteredProducts),
    [selectedCategory, filteredProducts]
  );

  const breadcrumbSchema = useMemo(() => 
    generateBreadcrumbSchema(selectedCategory),
    [selectedCategory]
  );

  // Track search terms in Google Analytics (debounced)
  useEffect(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'search', {
          search_term: searchTerm,
          search_category: selectedCategory !== 'All' ? selectedCategory : undefined,
          results_count: filteredProducts.length,
          has_results: filteredProducts.length > 0
        });
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, filteredProducts.length]);

  // Update meta tags when category changes
  useEffect(() => {
    const setMeta = (selector, attr, attrName, content) => {
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, attrName);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    setMeta('meta[name="description"]', 'name', 'description', pageDescription);
    setMeta('meta[property="og:title"]', 'property', 'og:title', pageTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', pageDescription);
    
    const categoryUrl = selectedCategory && selectedCategory !== 'All'
      ? `https://candidfindings.com/?category=${encodeURIComponent(selectedCategory)}`
      : 'https://candidfindings.com/';
    setMeta('meta[property="og:url"]', 'property', 'og:url', categoryUrl);
  }, [selectedCategory, pageTitle, pageDescription]);

  // Scroll to product grid when category changes
  useEffect(() => {
    const productGrid = document.querySelector('[data-product-grid]');
    if (productGrid && selectedCategory) {
      const headerHeight = 140;
      const yOffset = -headerHeight;
      const y = productGrid.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link 
          rel="canonical" 
          href={selectedCategory && selectedCategory !== 'All'
            ? `https://candidfindings.com/?category=${encodeURIComponent(selectedCategory)}`
            : 'https://candidfindings.com/'
          } 
        />
        
        {/* Schema Markup */}
        {itemListSchema && (
          <script type="application/ld+json">
            {JSON.stringify(itemListSchema)}
          </script>
        )}
        {breadcrumbSchema && (
          <script type="application/ld+json">
            {JSON.stringify(breadcrumbSchema)}
          </script>
        )}
      </Helmet>

      {/* Header */}
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <TrendingUp size={16} />
              <span>
                {selectedCategory && selectedCategory !== 'All' 
                  ? `${selectedCategory} Products`
                  : 'Curated Product Recommendations'
                }
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              {selectedCategory && selectedCategory !== 'All' ? (
                <>
                  Best {selectedCategory}{' '}
                  <span className="bg-gradient-to-r from-amber-200 to-yellow-300 bg-clip-text text-transparent">
                    Products
                  </span>
                </>
              ) : (
                <>
                  Discover Products You'll{' '}
                  <span className="bg-gradient-to-r from-amber-200 to-yellow-300 bg-clip-text text-transparent">
                    Actually Love
                  </span>
                </>
              )}
            </h1>
            <p className="text-lg sm:text-xl text-violet-100 mb-8">
              {selectedCategory && selectedCategory !== 'All'
                ? `Expert-curated ${selectedCategory.toLowerCase()} reviews and honest opinions`
                : 'Expert-curated reviews and honest opinions to help you make smarter choices'
              }
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <ChevronRight size={16} className="text-amber-300" />
                <span>Unbiased Reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight size={16} className="text-amber-300" />
                <span>Expert Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight size={16} className="text-amber-300" />
                <span>Smart Recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FilterPanel
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              minRating={minRating}
              setMinRating={setMinRating}
              selectedBadges={selectedBadges}
              setSelectedBadges={setSelectedBadges}
              availableBadges={availableBadges}
              maxPrice={maxPrice}
            />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3" data-product-grid>
            
            {/* Amazon Search - Consistent with no-results design */}
            {searchTerm && filteredProducts.length > 0 && (
              <div className="mb-6 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-slate-700 font-medium">
                      Looking for more options for "<span className="text-violet-600 font-semibold">{searchTerm}</span>"?
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Browse thousands more on Amazon
                    </p>
                  </div>
                  <a
                    href={getAmazonSearchUrl(searchTerm)}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={() => {
                      if (typeof gtag !== 'undefined') {
                        gtag('event', 'amazon_search_from_results', {
                          event_category: 'Affiliate',
                          event_label: searchTerm,
                          search_term: searchTerm,
                          results_count: filteredProducts.length
                        });
                      }
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-200 transition-all whitespace-nowrap"
                  >
                    <span>Search on Amazon</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            )}
            
            {/* Results Count */}
            <div className="mb-6 flex items-center flex-wrap gap-3">
              <p className="text-slate-600">
                Showing <span className="font-semibold text-violet-600">{filteredProducts.length}</span>{' '}
                {filteredProducts.length === 1 ? 'product' : 'products'}
                {searchTerm && (
                  <span> for "{searchTerm}"</span>
                )}
                {selectedCategory && selectedCategory !== 'All' && !searchTerm && (
                  <span> in {selectedCategory}</span>
                )}
              </p>
              
              <Link 
                to="/best"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors text-sm font-medium"
                onClick={() => {
                  if (typeof gtag !== 'undefined') {
                    gtag('event', 'click_best_selections', {
                      event_category: 'Navigation',
                      event_label: 'Best Selections Link'
                    });
                  }
                }}
              >
                <span>🏆</span>
                <span>Best Selections</span>
              </Link>
            </div>

            {/* Loading State - Show skeleton cards instead of spinner for better LCP */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(12)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentProducts.map((product, idx) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      index={startIndex + idx} 
                    />
                  ))}
                </div>

                {/* Pagination */}
                {filteredProducts.length > 0 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      totalItems={filteredProducts.length}
                      itemsPerPage={itemsPerPage}
                    />
                  </div>
                )}
              </>
            )}

            {/* No Results */}
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm 
                    ? `We don't have a review for "${searchTerm}" yet, but you can search for it on Amazon`
                    : 'Try adjusting your filters or search terms'
                  }
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  {/* Amazon Search Button */}
                  {searchTerm && (
                    <a
                      href={getAmazonSearchUrl(searchTerm)}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      onClick={() => {
                        if (typeof gtag !== 'undefined') {
                          gtag('event', 'amazon_fallback_search', {
                            event_category: 'Affiliate',
                            event_label: searchTerm,
                            search_term: searchTerm
                          });
                        }
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-200 transition-all"
                    >
                      <span>Search on Amazon</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                  
                  {/* Clear Filters Button */}
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('All');
                      setPriceRange([0, maxPrice]);
                      setMinRating(0);
                      setSelectedBadges([]);
                    }}
                    className="px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}