import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight } from 'lucide-react';
import Footer from '../components/Footer';
import ReviewHeader from '../components/review/ReviewHeader';
import { formatDate } from '../utils/dateFormat';
import { calculateReadTime } from '../utils/readTime';
import ProductSection from '../components/ProductSection';
import { generateBestOfCollectionSchema, generateBestOfBreadcrumbSchema, generateOrganizationSchema } from '../utils/schemaGenerators';
import { useData } from '../context/DataContext';

export default function BestOfPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products, bestOfBlogs, loading: dataLoading } = useData();
  
  const [blog, setBlog] = useState(null);
  const [productsWithDetails, setProductsWithDetails] = useState([]);
  const [readTime, setReadTime] = useState(null);

  // Scroll to top when navigating to a new blog
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);
  
  // Find blog and match products from context data
  useEffect(() => {
    if (dataLoading || !products.length || !bestOfBlogs.length) return;

    const foundBlog = bestOfBlogs.find(b => b.slug === slug);
    if (!foundBlog) {
      navigate('/best', { replace: true });
      return;
    }
    
    // Match products by ASIN
    const productsWithData = (foundBlog.products || []).map(blogProduct => {
      const productData = products.find(p => p.asin === blogProduct.asin);
      return {
        ...blogProduct,
        productData: productData || null
      };
    });
    
    // Calculate total read time from all product content
    const allContent = productsWithData
      .map(p => p.content || '')
      .join('\n\n');
    const calculatedReadTime = calculateReadTime(allContent);
    
    setBlog(foundBlog);
    setProductsWithDetails(productsWithData);
    setReadTime(calculatedReadTime);
  }, [slug, products, bestOfBlogs, dataLoading, navigate]);

  if (dataLoading || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const getOGImage = () => {
    // Use first product image or default
    return productsWithDetails[0]?.productData?.image || 
          'https://candidfindings.com/og-image.jpg';
  };
  
  const schemas = [
    generateBestOfCollectionSchema(blog, productsWithDetails.map(p => p.productData).filter(Boolean)),
    generateBestOfBreadcrumbSchema(blog),
    generateOrganizationSchema()
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pb-24">
      <Helmet>
        <title>{blog.title} | CandidFindings</title>
        <meta name="description" content={blog.metaDescription} />
        <link rel="canonical" href={`https://candidfindings.com/best/${blog.slug}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="CandidFindings" />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.metaDescription} />
        <meta property="og:url" content={`https://candidfindings.com/best/${blog.slug}`} />
        <meta property="og:image" content={getOGImage()} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={blog.title} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.metaDescription} />
        <meta name="twitter:image" content={getOGImage()} />
        
        {/* Additional Meta */}
        {blog.keywords && <meta name="keywords" content={blog.keywords.join(', ')} />}
        
        {/* Schemas */}
        {schemas.map((schema, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
      </Helmet>

      {/* Header */}
      <ReviewHeader />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-600 mb-6">
          <Link to="/" className="hover:text-blue-600 transition-colors flex items-center flex-shrink-0 whitespace-nowrap">Home</Link>
          <ChevronRight size={14} className="flex-shrink-0" />
          <Link to="/best" className="hover:text-blue-600 transition-colors flex items-center flex-shrink-0 whitespace-nowrap">Best Selections</Link>
          <ChevronRight size={14} className="flex-shrink-0 hidden sm:block" />
          <span className="text-blue-600 font-medium truncate flex items-center min-w-0 sm:max-w-none">{blog.title}</span>
        </nav>

        {/* Article Container - Matching Review Page */}
        <article className="bg-white rounded-3xl shadow-xl p-6 md:p-12">
          {/* Article Header */}
          <header className="mb-8">
            {/* Category Badge */}
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.category && (
                <span className="px-4 py-1.5 bg-violet-100 text-violet-700 text-sm font-bold rounded-full">
                  {blog.category}
                </span>
              )}
              {blog.featured && (
                <span className="px-4 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold rounded-full">
                  ⭐ Featured
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-3 leading-tight">
              {blog.title}
            </h1>

            {/* Meta Description */}
            {blog.metaDescription && (
              <p className="text-lg text-slate-600 mb-6">
                {blog.metaDescription}
              </p>
            )}
          </header>

          {/* Info Bar - Matching Review Page */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-lg mb-8 border border-slate-200">
            {blog.publishedDate && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500">📝 Published:</span>
                <span className="font-medium text-slate-700">
                  {formatDate(blog.publishedDate, 'medium')}
                </span>
              </div>
            )}
            
            {readTime && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500">⏱️ Read time:</span>
                <span className="font-medium text-slate-700">
                  {readTime}
                </span>
              </div>
            )}
            
            {productsWithDetails.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500">🛍️ Products:</span>
                <span className="font-medium text-slate-700">
                  {productsWithDetails.length} items
                </span>
              </div>
            )}
          </div>

          {/* Products Section */}
          <div className="space-y-12">
            {productsWithDetails.map((product, index) => (
              <ProductSection 
                key={product.asin} 
                product={product} 
                index={index}
                totalProducts={productsWithDetails.length}
              />
            ))}
          </div>

          {/* Back to Top */}
          <div className="mt-12 pt-8 border-t border-slate-200 text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Back to Top ↑
            </button>
          </div>
        </article>
      </main>

      {/* Footer */}
      <Footer />

      {/* Custom Styles - Matching Review Page */}
      <style>{`
        html { scroll-padding-top: 2rem; }
        .prose img {
          margin: 2rem auto;
          border-radius: 1rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}