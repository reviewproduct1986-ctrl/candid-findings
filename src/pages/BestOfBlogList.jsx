import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight } from 'lucide-react';
import ReviewHeader from '../components/review/ReviewHeader';
import Footer from '../components/Footer';
import GuideCard from '../components/GuideCard';
import { addReadTimesToPosts } from '../utils/readTime';
import { generateBestOfListSchema, generateBestOfWebPageSchema, generateBestOfBreadcrumbSchema, generateOrganizationSchema } from '../utils/schemaGenerators';
import { useData } from '../context/DataContext';

export default function BestOfBlogList() {
  const { products, bestOfBlogs, loading: dataLoading } = useData();
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Process posts when data is loaded
  useEffect(() => {
    if (!dataLoading && bestOfBlogs.length > 0) {
      // Calculate read times from content if available
      const postsWithReadTime = addReadTimesToPosts(bestOfBlogs);
      setPosts(postsWithReadTime);

      document.title = `${getPageTitle()} | CandidFindings`;
      
      const setMeta = (selector, attr, attrName, content) => {
        let meta = document.querySelector(selector);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute(attr, attrName);
          document.head.appendChild(meta);
        }
        meta.content = content;
      };
      
      setMeta('meta[name="description"]', 'name', 'description', getMetaDescription());
      setMeta('meta[property="og:title"]', 'property', 'og:title', getPageTitle());
      setMeta('meta[property="og:description"]', 'property', 'og:description', getMetaDescription());
      setMeta('meta[property="og:image"]', 'property', 'og:image', 'https://candidfindings.com/og-image.jpg');
      setMeta('meta[property="og:url"]', 'property', 'og:url', 'https://candidfindings.com/best');
    }
  }, [bestOfBlogs, dataLoading]);

  // Get unique categories
  const categories = ['All', ...new Set(posts.map(p => p.category).filter(Boolean))];

  // Filter posts by category
  const filteredPosts = selectedCategory === 'All' 
    ? posts 
    : posts.filter(p => p.category === selectedCategory);

  // Separate published and coming soon
  const publishedPosts = filteredPosts.filter(p => !p.comingSoon);
  const regularPosts = publishedPosts.filter(p => !p.featured);

  // Get hero text from post metaDescription
  const getHeroText = () => {
    if (selectedCategory === 'All') {
      return 'Handpicked product recommendations across all categories';
    }
    
    // Find first post in selected category
    const categoryPost = publishedPosts.find(p => p.category === selectedCategory);
    
    // Use metaDescription from post
    if (categoryPost?.metaDescription) {
      return categoryPost.metaDescription;
    }
    
    // Fallback for missing metaDescription
    return `Discover our best ${selectedCategory.toLowerCase()} recommendations`;
  };

  // SEO Helper Functions
  const getMetaDescription = () => {
    if (selectedCategory === 'All') {
      return 'Browse our expert product recommendations. Curated selections across all categories to help you find exactly what you need.';
    }
    const categoryPost = publishedPosts.find(p => p.category === selectedCategory);
    return categoryPost?.metaDescription || 
      `Discover the best ${selectedCategory.toLowerCase()} products. Expert recommendations and honest reviews to help you choose wisely.`;
  };

  const getPageTitle = () => {
    if (selectedCategory === 'All') {
      return 'Best Selections - Expert Product Recommendations | CandidFindings';
    }
    return `Best ${selectedCategory} Products - Curated Recommendations | CandidFindings`;
  };

  const getKeywords = () => {
    const baseKeywords = ['product recommendations', 'best products', 'expert reviews', 'buying guide', 'product comparison'];
    if (selectedCategory !== 'All') {
      const categoryPost = publishedPosts.find(p => p.category === selectedCategory);
      if (categoryPost?.keywords) {
        return [...categoryPost.keywords, ...baseKeywords].join(', ');
      }
      return [...baseKeywords, `best ${selectedCategory.toLowerCase()}`].join(', ');
    }
    return baseKeywords.join(', ');
  };

  const schemas = [
    generateBestOfListSchema(publishedPosts, selectedCategory),
    generateBestOfWebPageSchema(selectedCategory),
    generateBestOfBreadcrumbSchema(null, selectedCategory),
    generateOrganizationSchema()
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{getPageTitle()}</title>
        <meta name="description" content={getMetaDescription()} />
        <link rel="canonical" href="https://candidfindings.com/best" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="CandidFindings" />
        <meta property="og:title" content={
          selectedCategory === 'All'
            ? 'Best Selections - Expert Product Recommendations'
            : `Best ${selectedCategory} Products - Curated Recommendations`
        } />
        <meta property="og:description" content={getMetaDescription()} />
        <meta property="og:url" content="https://candidfindings.com/best" />
        <meta property="og:image" content="https://candidfindings.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={
          selectedCategory === 'All'
            ? 'Best Selections - Expert Product Recommendations'
            : `Best ${selectedCategory} Products`
        } />
        <meta name="twitter:description" content={getMetaDescription()} />
        <meta name="twitter:image" content="https://candidfindings.com/twitter-card.jpg" />
        
        {/* Additional SEO */}
        <meta name="keywords" content={getKeywords()} />
        <meta name="author" content="CandidFindings" />
        <meta name="robots" content="index, follow" />
        
        {schemas.map((schema, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
      </Helmet>

      {/* Header */}
      <ReviewHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 text-white py-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Best <span className="text-cyan-200">Selections</span>
            </h1>
            <p className="text-sm sm:text-base text-blue-50 mb-3">
              {getHeroText()}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm text-blue-100">
          <span>
            <strong className="text-white">{publishedPosts.length}</strong> {selectedCategory === 'All' ? 'Guides' : `${selectedCategory} Guides`}
          </span>
          <span>•</span>
          <span>
            <strong className="text-white">{publishedPosts.reduce((sum, post) => sum + (post.productCount || post.products?.length || 0), 0)}</strong> Products
          </span>
          <span>•</span>
          <span>
            <strong className="text-white">100%</strong> Unbiased
          </span>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <Link to="/" className="hover:text-violet-600 transition-colors flex items-center flex-shrink-0">Home</Link>
          <ChevronRight size={14} className="flex-shrink-0" />
          <span className="text-violet-600 font-medium flex items-center flex-shrink-0">Best Selections</span>
        </nav>
      </div>

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent snap-x snap-mandatory -mx-4 px-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{ minWidth: 'max-content' }}
                className={`
                  px-3 sm:px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all text-xs sm:text-sm flex-shrink-0 snap-start
                  ${selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-500 to-teal-600 text-white shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200 hover:border-blue-300'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {dataLoading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading selections...</p>
          </div>
        ) : (
          <>
            {/* All Guides */}
            {regularPosts.length > 0 && (
              <div className="mb-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {regularPosts.map((post, index) => (
                    <GuideCard key={post.slug} post={post} products={products} offset={index + regularPosts.length} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}