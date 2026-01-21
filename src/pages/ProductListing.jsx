import React, { useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { TrendingUp, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import FilterPanel from '../components/FilterPanel';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import Pagination from '../components/Pagination';
import Footer from '../components/Footer';
import AmazonSearchBanner from '../components/AmazonSearchBanner';
import BestSelectionsBanner from '../components/BestSelectionsBanner';
import ResultsCountAndSort from '../components/ResultsCountAndSort';
import NoResultsDisplay from '../components/NoResultsDisplay';
import { useProductFilters } from '../hooks/useProducts';
import { useSorting } from '../hooks/useSorting';
import { usePagination } from '../hooks/usePagination';
import { useScrollToGrid } from '../hooks/useScrollToGrid';
import { generateItemListSchema, generateBreadcrumbSchema } from '../utils/schemaGenerators';
import { useData } from '../context/DataContext';

export default function ProductListing() {
  const { products, loading } = useData();

  // Add review URLs to products
  const productsWithReviews = useMemo(() => {
    return products.map(product => ({
      ...product,
      reviewUrl: `/reviews/${product.slug}`
    }));
  }, [products]);
  
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

  // Sorting
  const { sortBy, setSortBy, sortedProducts } = useSorting(filteredProducts);

  // Pagination
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
    currentItems: currentProducts
  } = usePagination(sortedProducts, 12, [
    selectedCategory,
    searchTerm,
    priceRange,
    minRating,
    selectedBadges,
    sortBy
  ]);

  // Scroll to grid when page or category changes
  useScrollToGrid(currentPage);
  useScrollToGrid(selectedCategory);

  // Generate page metadata
  const pageTitle = selectedCategory && selectedCategory !== 'All'
    ? `${selectedCategory} Products | CandidFindings`
    : 'CandidFindings | Honest Product Reviews & Recommendations';

  const pageDescription = selectedCategory && selectedCategory !== 'All'
    ? `Browse our curated selection of ${selectedCategory} products. Expert reviews, honest opinions, and smart recommendations to help you make better buying decisions.`
    : 'Discover expert-curated product reviews and honest opinions. From electronics to home essentials, find products you\'ll actually love with CandidFindings.';

  // Generate schemas
  const itemListSchema = useMemo(() => 
    generateItemListSchema(selectedCategory, sortedProducts),
    [selectedCategory, sortedProducts]
  );

  const breadcrumbSchema = useMemo(() => 
    generateBreadcrumbSchema(selectedCategory),
    [selectedCategory]
  );

  // Track search terms in Google Analytics (debounced)
  useEffect(() => {
    if (!searchTerm || searchTerm.trim() === '') return;

    const timeoutId = setTimeout(() => {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'search', {
          search_term: searchTerm,
          search_category: selectedCategory !== 'All' ? selectedCategory : undefined,
          results_count: sortedProducts.length,
          has_results: sortedProducts.length > 0
        });
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, sortedProducts.length]);

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

  // Clear all filters handler
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setPriceRange([0, maxPrice]);
    setMinRating(0);
    setSelectedBadges([]);
    setSortBy('default');
  };

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
            <AmazonSearchBanner 
              searchTerm={searchTerm} 
              resultsCount={sortedProducts.length} 
            />
            
            <BestSelectionsBanner />
            
            <ResultsCountAndSort
              resultsCount={sortedProducts.length}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            {/* Loading State */}
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
                {sortedProducts.length > 0 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      totalItems={sortedProducts.length}
                      itemsPerPage={12}
                    />
                  </div>
                )}
              </>
            )}

            {/* No Results */}
            {!loading && sortedProducts.length === 0 && (
              <NoResultsDisplay 
                searchTerm={searchTerm}
                onClearFilters={handleClearFilters}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}