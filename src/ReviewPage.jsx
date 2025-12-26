import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Star, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Footer from './components/Footer';

export default function ReviewPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [blog, setBlog] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load both products and blogs data
    Promise.all([
      fetch('/data/products.json').then(res => res.json()),
      fetch('/data/blogs.json').then(res => res.json())
    ])
      .then(([productsData, blogsData]) => {
        const productsList = productsData.products || [];
        const blogsList = blogsData.posts || [];
        
        // Find blog by slug
        const foundBlog = blogsList.find(b => b.slug === slug);
        
        if (!foundBlog) {
          setLoading(false);
          return;
        }
        
        // Find product by productId from blog
        const foundProduct = productsList.find(p => p.id === foundBlog.productId);
        
        if (!foundProduct) {
          setLoading(false);
          return;
        }
        
        // Find related products (same category, different product)
        const related = productsList
          .filter(p => p.id !== foundProduct.id && p.category === foundProduct.category)
          .slice(0, 3)
          .map(p => {
            const relatedBlog = blogsList.find(b => b.productId === p.id);
            return {
              ...p,
              reviewUrl: relatedBlog ? `/reviews/${relatedBlog.slug}` : null
            };
          });
        
        setProduct(foundProduct);
        setBlog(foundBlog);
        setRelatedProducts(related);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading data:', error);
        setLoading(false);
      });
  }, [slug]);
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
          <p className="mt-4 text-slate-600">Loading review...</p>
        </div>
      </div>
    );
  }
  
  // If product not found, show 404
  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
          <p className="text-xl text-slate-600 mb-8">Review not found</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <ArrowLeft size={20} />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Dynamic SEO Meta Tags */}
      <Helmet>
        <title>{product.title} Review - CandidFindings</title>
        <meta name="description" content={blog.excerpt || blog.content.substring(0, 155) + '...'} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://candidfindings.com/reviews/${blog.slug}`} />
        <meta property="og:title" content={`${product.title} Review - CandidFindings`} />
        <meta property="og:description" content={blog.excerpt || blog.content.substring(0, 155)} />
        <meta property="og:image" content={product.image} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`https://candidfindings.com/reviews/${blog.slug}`} />
        <meta name="twitter:title" content={`${product.title} Review`} />
        <meta name="twitter:description" content={blog.excerpt || blog.content.substring(0, 155)} />
        <meta name="twitter:image" content={product.image} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`https://candidfindings.com/reviews/${blog.slug}`} />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 lg:py-2.5">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center gap-2.5 flex-shrink-0 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded-lg"
              aria-label="Go to homepage"
            >
              <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 group-active:scale-95">
                <Sparkles className="text-white" size={18} />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-slate-900 text-base lg:text-lg leading-tight group-hover:text-violet-600 transition-colors">
                  GetProductOpinion.
                </h1>
                <p className="text-xs text-slate-500 leading-tight">Expert Recommendations</p>
              </div>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-violet-600 transition-colors text-sm font-medium hover:bg-slate-50 rounded-lg"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to Products</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Review Content */}
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link to="/" className="text-violet-600 hover:text-violet-700">Home</Link>
          <span className="mx-2 text-slate-400">/</span>
          <Link to="/" className="text-violet-600 hover:text-violet-700">Reviews</Link>
          <span className="mx-2 text-slate-400">/</span>
          <span className="text-slate-600">{product.title}</span>
        </nav>

        {/* Article */}
        <article className="bg-white rounded-3xl shadow-xl p-6 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-4 py-1.5 bg-violet-100 text-violet-700 text-sm font-bold rounded-full">
                {product.category}
              </span>
              {product.badge && (
                <span className="px-4 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold rounded-full">
                  {product.badge}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
              {product.title} Review
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-slate-600 mb-6">
              <div className="flex items-center gap-1">
                <Star className="text-yellow-500 fill-yellow-500" size={20} />
                <span className="font-semibold text-slate-900">{product.rating}</span>
                <span className="text-sm">({product.reviews.toLocaleString()} reviews)</span>
              </div>
              <span className="text-2xl font-bold text-violet-600">${product.price}</span>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mb-10">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-96 object-cover rounded-2xl shadow-lg"
            />
          </div>

          {/* Review Content */}
          <div className="prose prose-lg prose-slate max-w-none">
            {/* Render markdown content */}
            {blog?.content && (
              <ReactMarkdown
                className="text-slate-700"
                components={{
                  h2: ({node, ...props}) => <h2 className="text-3xl font-bold text-slate-900 mt-8 mb-4" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-2xl font-bold text-slate-900 mt-6 mb-3" {...props} />,
                  p: ({node, ...props}) => <p className="text-lg text-slate-700 leading-relaxed mb-4" {...props} />,
                  ul: ({node, ...props}) => <ul className="space-y-2 mb-6 list-disc list-inside" {...props} />,
                  li: ({node, ...props}) => <li className="text-slate-700 text-lg" {...props} />,
                }}
              >
                {blog.content}
              </ReactMarkdown>
            )}

            {blog?.pros && blog.pros.length > 0 && (
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">What We Love (Pros)</h3>
                <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8 rounded-r-xl">
                  <ul className="space-y-3">
                    {blog.pros.map((pro, idx) => (
                      <li key={idx} className="text-green-800 text-lg font-medium flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {blog?.cons && blog.cons.length > 0 && (
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Potential Drawbacks (Cons)</h3>
                <div className="bg-orange-50 border-l-4 border-orange-500 p-6 mb-8 rounded-r-xl">
                  <ul className="space-y-3">
                    {blog.cons.map((con, idx) => (
                      <li key={idx} className="text-orange-800 text-lg flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {blog?.targetAudience && (
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Who Should Buy This?</h3>
                <p className="text-lg text-slate-700 leading-relaxed mb-8">
                  {blog.targetAudience}
                </p>
              </>
            )}

            {blog?.verdict && (
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Final Verdict</h3>
                <div className="bg-violet-50 border-2 border-violet-200 p-6 rounded-2xl mb-8">
                  <p className="text-lg text-slate-700 leading-relaxed">
                    <strong className="text-violet-900">Bottom Line:</strong> {blog.verdict}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* CTA Section */}
          <div className="mt-12 p-8 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border-2 border-violet-200">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Ready to Buy?</h3>
              <p className="text-slate-600 mb-6 text-lg">
                Get the best deal on {product.title} today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={product.affiliate}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-4 px-6 sm:px-8 rounded-xl font-bold text-base sm:text-lg hover:shadow-lg hover:shadow-violet-200 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  View Deal - ${product.price}
                  <ArrowRight size={20} />
                </a>
                <Link
                  to="/"
                  className="bg-white text-violet-600 py-4 px-6 sm:px-8 rounded-xl font-bold text-base sm:text-lg border-2 border-violet-200 hover:bg-violet-50 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  View More Products
                </Link>
              </div>
              {/* Amazon Affiliate Disclosure */}
              <p className="mt-6 text-xs text-slate-500 text-center">
                As an Amazon Associate we earn from qualifying purchases. Price and availability subject to change.
              </p>
            </div>
          </div>
        </article>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map(relatedProduct => (
                <Link
                  key={relatedProduct.id}
                  to={relatedProduct.reviewUrl}
                  className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all group"
                >
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="font-bold text-slate-900 mb-2 group-hover:text-violet-600 transition-colors">
                    {relatedProduct.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <span className="text-sm font-semibold">{relatedProduct.rating}</span>
                    </div>
                    <span className="text-lg font-bold text-violet-600">${relatedProduct.price}</span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      <style>{`
        .glass-morphism {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}