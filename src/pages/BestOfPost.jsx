import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Calendar, Tag, ChevronRight, ArrowRight, Clock } from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { markdownComponents } from '../utils/markdownComponents';
import { formatDate } from '../utils/dateFormat';
import { calculateReadTime } from '../utils/readTime';
import QRButton from '../components/QRButton';

export default function BestOfPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [blog, setBlog] = useState(null);
  const [productsWithDetails, setProductsWithDetails] = useState([]);
  const [readTime, setReadTime] = useState(null);
  const [loading, setLoading] = useState(true);

  // Scroll to top when navigating to a new blog
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);
  
  // Load data
  useEffect(() => {
    Promise.all([
      fetch('/data/best-of-blogs.json').then(res => res.json()),
      fetch('/data/products.json').then(res => res.json())
    ])
      .then(([blogsData, productsData]) => {
        const blogsList = blogsData.posts || [];
        const allProducts = productsData.products || [];
        
        const foundBlog = blogsList.find(b => b.slug === slug);
        if (!foundBlog) {
          navigate('/best', { replace: true });
          return;
        }
        
        // Match products by ASIN
        const productsWithData = (foundBlog.products || []).map(blogProduct => {
          const productData = allProducts.find(p => p.asin === blogProduct.asin);
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
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading blog data:', error);
        navigate('/best', { replace: true });
      });
  }, [slug, navigate]);

  // Generate schema for SEO
  const blogSchema = blog ? {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.metaDescription,
    author: {
      '@type': 'Organization',
      name: 'CandidFindings'
    },
    publisher: {
      '@type': 'Organization',
      name: 'CandidFindings',
      logo: {
        '@type': 'ImageObject',
        url: 'https://candidfindings.com/favicon.png'
      }
    },
    datePublished: blog.publishedDate,
    dateModified: blog.updatedDate || blog.publishedDate,
    keywords: blog.keywords?.join(', ')
  } : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <Helmet>
        <title>{blog.title} | CandidFindings</title>
        <meta name="description" content={blog.metaDescription} />
        <link rel="canonical" href={`https://candidfindings.com/best/${blog.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.metaDescription} />
        <meta property="og:url" content={`https://candidfindings.com/best/${blog.slug}`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.metaDescription} />
        
        {/* Schema */}
        {blogSchema && (
          <script type="application/ld+json">
            {JSON.stringify(blogSchema)}
          </script>
        )}
      </Helmet>

      {/* Header */}
      <Header
        searchTerm=""
        setSearchTerm={() => {}}
        categories={[]}
        selectedCategory=""
        setSelectedCategory={() => {}}
      />

      {/* Blog Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-600 mb-6">
          <Link to="/" className="hover:text-blue-600 transition-colors flex items-center">Home</Link>
          <ChevronRight size={14} className="flex-shrink-0" />
          <Link to="/best" className="hover:text-blue-600 transition-colors flex items-center">Best Selections</Link>
          <ChevronRight size={14} className="flex-shrink-0" />
          <span className="text-blue-600 font-medium truncate flex items-center">{blog.title}</span>
        </nav>

        {/* Article Header */}
        <header className="mb-12">
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <Tag size={14} />
                {blog.category}
              </span>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            {blog.title}
          </h1>

          <div className="flex items-center gap-4 text-slate-600 text-sm">
            {blog.publishedDate && (
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <time dateTime={blog.publishedDate}>
                  {formatDate(blog.publishedDate, 'medium')}
                </time>
              </div>
            )}
            {blog.updatedDate && blog.updatedDate !== blog.publishedDate && (
              <div className="text-slate-500">
                Updated {formatDate(blog.updatedDate, 'medium')}
              </div>
            )}
            {readTime && (
              <>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{readTime}</span>
                </div>
              </>
            )}
            {productsWithDetails.length > 0 && (
              <>
                <span>•</span>
                <span>{productsWithDetails.length} products</span>
              </>
            )}
          </div>

          {blog.keywords && blog.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {blog.keywords.slice(0, 5).map((keyword, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Products Section */}
        <div className="space-y-16 mb-16">
          {productsWithDetails.map((product, index) => (
            <ProductSection 
              key={product.asin} 
              product={product} 
              index={index}
            />
          ))}
        </div>

        {/* Back to Top */}
        <div className="mt-12 text-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Back to Top ↑
          </button>
        </div>
      </article>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Product Section Component
function ProductSection({ product, index }) {
  if (!product.productData) {
    return (
      <div className="text-center py-8 text-slate-500">
        Product data not found for ASIN: {product.asin}
      </div>
    );
  }

  const productData = product.productData;

  return (
    <div className="border-t border-slate-200 pt-8">
      {/* Product Number */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {`${index + 1}. ${productData.title}`}
        </h2>
      </div>

      {/* Product Image */}
      <div className="my-6 flex justify-center">
        <div className="max-w-sm w-full">
          <img 
            src={productData.image} 
            alt={productData.title}
            className="w-full h-auto rounded-lg shadow-md"
            loading="lazy"
          />
        </div>
      </div>

      <div className="mb-6 min-h-[80px]">
        <p className="text-3xl font-bold text-violet-600">
        <span>Price ${productData.price.toFixed(2)}</span>
        </p>
      </div>

      {/* Amazon Buttons */}
      <div className="flex justify-center gap-2 my-6">
        {/* View on Amazon Button */}
        <a
          href={productData.affiliate}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            if (typeof gtag !== 'undefined') {
              gtag('event', 'affiliate_click', {
                event_category: 'Affiliate',
                event_label: productData.title,
                page_from: 'blog post'
              });
            }
          }}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2.5 px-4 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-violet-200 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
        >
          <span>View on Amazon</span>
          <ArrowRight size={14} className="hover:translate-x-1 transition-transform flex-shrink-0" />
        </a>

        {/* QR Code Button */}
        <QRButton
          productUrl={productData.affiliate}
          productTitle={productData.title}
          productId={productData.id}
          productCategory={productData.category}
          variant="icon"
        />
      </div>

      {/* Product Content */}
      {product.content && (
        <div className="prose prose-lg prose-slate max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {product.content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}