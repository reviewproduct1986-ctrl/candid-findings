import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight } from 'lucide-react';
import ReviewHeader from '../components/review/ReviewHeader';
import Footer from '../components/Footer';
import GuideCard from '../components/GuideCard';
import { addReadTimesToPosts } from '../utils/readTime';

export default function BestOfBlogList() {
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    // Load both blog posts and products
    Promise.all([
      fetch('/data/best-of-blogs.json').then(res => res.json()),
      fetch('/data/products.json').then(res => res.json())
    ])
      .then(([blogsData, productsData]) => {
        // Calculate read times from content if available
        const postsWithReadTime = addReadTimesToPosts(blogsData.posts || []);
        setPosts(postsWithReadTime);
        setProducts(productsData.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setLoading(false);
      });
  }, []);

  // Get unique categories
  const categories = ['All', ...new Set(posts.map(p => p.category).filter(Boolean))];

  // Filter posts by category
  const filteredPosts = selectedCategory === 'All' 
    ? posts 
    : posts.filter(p => p.category === selectedCategory);

  // Separate published and coming soon
  const publishedPosts = filteredPosts.filter(p => !p.comingSoon);
  const regularPosts = publishedPosts.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <Helmet>
        <title>Best Selections - Expert Product Recommendations | CandidFindings</title>
        <meta name="description" content="Browse our expert product recommendations. Curated selections across all categories to help you find exactly what you need." />
        <link rel="canonical" href="https://candidfindings.com/best" />
      </Helmet>

      {/* Header */}
      <ReviewHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 text-white py-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Best <span className="text-cyan-200">Selections</span>
            </h1>
            <p className="text-sm sm:text-base text-blue-50 opacity-90">
              Handpicked product recommendations from experts
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-slate-600">
          <Link to="/" className="hover:text-violet-600 transition-colors flex items-center">Home</Link>
          <ChevronRight size={14} className="flex-shrink-0" />
          <span className="text-violet-600 font-medium flex items-center">Best Selections</span>
        </nav>
      </div>

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all text-sm
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
        {loading ? (
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

            {/* No Results */}
            {filteredPosts.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No selections found</h3>
                <p className="text-slate-600 mb-6">
                  Try selecting a different category
                </p>
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  View All Selections
                </button>
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