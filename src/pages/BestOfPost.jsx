import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Calendar, Tag } from 'lucide-react';
import Footer from '../components/Footer';
import ReviewHeader from '../components/review/ReviewHeader';
import { markdownComponents } from '../utils/markdownComponents';

export default function BestOfPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [blog, setBlog] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scroll to top when navigating to a new blog
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Load data
  useEffect(() => {
    Promise.all([
      fetch('/data/products.json').then(res => res.json()),
      fetch('/data/best-of-blogs.json').then(res => res.json())
    ])
      .then(([productsData, blogsData]) => {
        const productsList = productsData.products || [];
        const blogsList = blogsData.posts || [];
        
        const foundBlog = blogsList.find(b => b.slug === slug);
        if (!foundBlog) {
          navigate('/', { replace: true });
          return;
        }
        
        setBlog(foundBlog);
        setAllProducts(productsList);
        
        // Get related products if they exist
        if (foundBlog.relatedProducts && foundBlog.relatedProducts.length > 0) {
          const related = productsList
            .map(rp => productsList.find(p => p.id === rp.id || p.asin === rp.asin))
            .filter(p => p); // Remove any that weren't found
          
          setRelatedProducts(related);
        }
        
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading blog data:', error);
        navigate('/', { replace: true });
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
            <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
      <ReviewHeader />

      {/* Blog Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-600 mb-6">
          <Link to="/" className="hover:text-violet-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/best" className="hover:text-violet-600 transition-colors">Best Selections</Link>
          <span>/</span>
          <span className="text-violet-600 font-medium truncate">{blog.title}</span>
        </nav>

        {/* Article Header */}
        <header className="mb-12">
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
                <Tag size={14} />
                {blog.category}
              </span>
            )}
            {blog.featured && (
              <span className="inline-flex items-center px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                Best
              </span>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            {blog.title}
          </h1>

          <div className="flex items-center gap-4 text-slate-600 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <time dateTime={blog.publishedDate}>
                {formatDate(blog.publishedDate)}
              </time>
            </div>
            {blog.updatedDate && blog.updatedDate !== blog.publishedDate && (
              <div className="text-slate-500">
                Updated {formatDate(blog.updatedDate)}
              </div>
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

        {/* Article Content */}
        <div className="prose prose-lg prose-slate max-w-none mb-16">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {blog.content}
          </ReactMarkdown>
        </div>

        {/* Back to Top */}
        <div className="mt-12 text-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium transition-colors"
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