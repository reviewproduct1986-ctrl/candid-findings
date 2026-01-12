import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Star, ArrowRight, Sparkles, BookOpen, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Footer from '../components/Footer';
import { gtagClick } from '../utils/googletag';

export default function BuyingGuidePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [guide, setGuide] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load buying guides and products data
    Promise.all([
      fetch('/data/buying-guides.json').then(res => res.json()),
      fetch('/data/products.json').then(res => res.json()),
      fetch('/data/blogs.json').then(res => res.json())
    ])
      .then(([guidesData, productsData, blogsData]) => {
        const guidesList = guidesData.guides || [];
        const productsList = productsData.products || [];
        const blogsList = blogsData.posts || [];
        
        // Find guide by slug
        const foundGuide = guidesList.find(g => g.slug === slug);
        
        if (!foundGuide) {
          navigate('/', { replace: true });
          return;
        }
        
        // Get featured products for this guide
        const featured = (foundGuide.productIds || [])
          .map(productId => {
            const product = productsList.find(p => p.id === productId);
            if (!product) return null;
            
            const blog = blogsList.find(b => b.productId === productId);
            return {
              ...product,
              reviewUrl: blog ? `/reviews/${blog.slug}` : null
            };
          })
          .filter(Boolean);
        
        setGuide(foundGuide);
        setFeaturedProducts(featured);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading guide:', error);
        navigate('/', { replace: true });
      });
  }, [slug, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
          <p className="mt-4 text-slate-600">Loading buying guide...</p>
        </div>
      </div>
    );
  }

  if (!guide) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>{guide.title} - CandidFindings</title>
        <meta name="description" content={guide.excerpt || guide.content.substring(0, 155)} />
        <meta property="og:title" content={guide.title} />
        <meta property="og:description" content={guide.excerpt} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://candidfindings.com/guides/${guide.slug}`} />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 lg:py-2.5">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                <Sparkles className="text-white" size={18} />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-slate-900 text-base lg:text-lg group-hover:text-violet-600 transition-colors">
                  CandidFindings
                </h1>
                <p className="text-xs text-slate-500">Honest Recommendations</p>
              </div>
            </Link>
            <Link
              to="/"
              className="px-4 py-2 text-violet-600 hover:text-violet-700 text-sm font-semibold bg-white border-2 border-violet-200 hover:border-violet-300 hover:bg-violet-50 rounded-lg transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-slate-600">
            <li>
              <Link to="/" className="hover:text-violet-600 transition-colors">Home</Link>
            </li>
            <li className="text-slate-400">/</li>
            <li>
              <Link to="/guides" className="hover:text-violet-600 transition-colors">Buying Guides</Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="text-slate-900 font-medium truncate max-w-md">{guide.title}</li>
          </ol>
        </nav>

        <article className="bg-white rounded-3xl shadow-xl p-6 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="text-violet-600" size={24} />
              <span className="px-4 py-1.5 bg-violet-100 text-violet-700 text-sm font-bold rounded-full">
                Buying Guide
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
              {guide.title}
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed">
              {guide.excerpt}
            </p>
          </div>

          {/* Featured Products Section */}
          {featuredProducts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Top Picks</h2>
              <div className="grid gap-6">
                {featuredProducts.map((product, idx) => (
                  <div key={product.id} className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border-2 border-slate-200 hover:border-violet-300 transition-all">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full md:w-64 h-64 object-cover rounded-xl"
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-violet-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                                #{idx + 1} Pick
                              </span>
                              {product.badge && (
                                <span className="bg-amber-400 text-amber-900 text-sm font-bold px-3 py-1 rounded-full">
                                  {product.badge}
                                </span>
                              )}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">
                              {product.title}
                            </h3>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-violet-600">${product.price?.toFixed(2)}</div>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="text-yellow-500 fill-yellow-500" size={18} />
                              <span className="font-semibold">{product.rating}</span>
                              <span className="text-sm text-slate-600">({product.reviews.toLocaleString()})</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                          <div className="mb-4">
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {product.features.map((feature, fidx) => (
                                <li key={fidx} className="flex items-center gap-2 text-slate-700">
                                  <Check className="text-green-600 flex-shrink-0" size={18} />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Description */}
                        {product.description && (
                          <p className="text-slate-600 mb-4">
                            {product.description}
                          </p>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                          <a
                            href={product.affiliate}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              gtagClick('affiliate_click', {
                                event_category: 'Affiliate',
                                event_label: product.title,
                                value: product.price,
                                asin: product.asin,
                                product_category: product.category
                              });
                            }}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                          >
                            View on Amazon
                            <ArrowRight size={18} />
                          </a>
                          {product.reviewUrl && (
                            <Link
                              to={product.reviewUrl}
                              className="bg-white text-violet-600 py-3 px-6 rounded-xl font-semibold border-2 border-violet-200 hover:border-violet-300 hover:bg-violet-50 transition-all"
                            >
                              Read Full Review
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guide Content */}
          <div className="prose prose-lg prose-slate max-w-none">
            <ReactMarkdown
              components={{
                h2: ({node, ...props}) => <h2 className="text-3xl font-bold text-slate-900 mt-8 mb-4" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-2xl font-bold text-slate-900 mt-6 mb-3" {...props} />,
                p: ({node, ...props}) => <p className="text-lg text-slate-700 leading-relaxed mb-4" {...props} />,
                ul: ({node, ...props}) => <ul className="space-y-2 mb-6 list-disc list-inside" {...props} />,
                li: ({node, ...props}) => <li className="text-slate-700 text-lg" {...props} />,
              }}
            >
              {guide.content}
            </ReactMarkdown>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}