import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Star, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Footer from '../components/Footer';
import InfoCards from '../components/InfoCards';
import TableOfContents from '../components/TableOfContents';
import ProsCons from '../components/ProsCons';
import FAQs from '../components/FAQs';
import RelatedProducts from '../components/RelatedProducts';

export default function ReviewPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [blog, setBlog] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tocExpanded, setTocExpanded] = useState(false);
  
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
          navigate('/', { replace: true });
          return;
        }
        
        // Find product by productId from blog
        const foundProduct = productsList.find(p => p.id === foundBlog.productId);
        
        if (!foundProduct) {
          navigate('/', { replace: true });
          return;
        }
        
        // Find related products
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
        navigate('/', { replace: true });
      });
  }, [slug, navigate]);

  // Extract headings for Table of Contents
  const tableOfContents = useMemo(() => {
    if (!blog?.content) return [];
    
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const headings = [];
    let match;
    
    while ((match = headingRegex.exec(blog.content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      headings.push({ level, text, id });
    }
    
    return headings;
  }, [blog?.content]);

  // Extract FAQs for schema
  const faqSchema = useMemo(() => {
    if (!blog?.faqs || blog.faqs.length === 0) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": blog.faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  }, [blog?.faqs]);

  if (loading || !product || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{product.title} Review - CandidFindings</title>
        <meta name="description" content={blog.excerpt} />
        <meta property="og:title" content={`${product.title} Review`} />
        <meta property="og:description" content={blog.excerpt} />
        <meta property="og:image" content={product.image} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://candidfindings.com/reviews/${slug}`} />
        {faqSchema && (
          <script type="application/ld+json">
            {JSON.stringify(faqSchema)}
          </script>
        )}
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
                  CandidFindings
                </h1>
                <p className="text-xs text-slate-500 leading-tight">Honest Recommendations</p>
              </div>
            </Link>
            <Link
              to="/"
              className="px-4 py-2 text-violet-600 hover:text-violet-700 transition-colors text-sm font-semibold bg-white border-2 border-violet-200 hover:border-violet-300 hover:bg-violet-50 rounded-lg"
            >
              View More Products
            </Link>
          </div>
        </div>
      </header>

      {/* Review Content */}
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-slate-600">
            <li>
              <Link to="/" className="hover:text-violet-600 transition-colors">
                Home
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li>
              <Link 
                to={`/?category=${encodeURIComponent(product.category)}`}
                className="hover:text-violet-600 transition-colors"
              >
                {product.category}
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="text-slate-900 font-medium truncate max-w-md">
              {product.title}
            </li>
          </ol>
        </nav>

        {/* Main Content */}
        <div>
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
              
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                {product.title} Review
              </h1>
              
              {/* Info Cards Component */}
              <InfoCards product={product} />
            </div>

            {/* Hero Image */}
            <div className="mb-10">
              <img 
                src={product.image} 
                alt={`${product.title} - Product review image`}
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
              />
            </div>

            {/* Quick Buy Section - Sticky & Compact */}
            <div className="sticky top-16 z-30 mb-10 -mx-6 md:-mx-12">
              <div className="bg-white/95 backdrop-blur-md border-b-2 border-violet-200 shadow-lg px-6 md:px-12 py-4">
                <div className="flex flex-col items-center justify-center gap-2">
                  <a
                    href={product.affiliate}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (typeof gtag !== 'undefined') {
                        gtag('event', 'affiliate_click', {
                          event_category: 'Affiliate',
                          event_label: product.title,
                          value: product.price,
                          product_category: product.category,
                          product_id: product.id
                        });
                      }
                    }}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 px-8 rounded-xl font-bold text-base hover:shadow-lg hover:shadow-violet-200 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    View on Amazon
                    <ArrowRight size={20} />
                  </a>
                  <p className="text-[10px] text-slate-400 text-center">
                    As an Amazon Associate we earn from qualifying purchases
                  </p>
                </div>
              </div>
            </div>

            {/* Table of Contents Component */}
            <TableOfContents 
              tableOfContents={tableOfContents}
              blog={blog}
              tocExpanded={tocExpanded}
              setTocExpanded={setTocExpanded}
            />

            {/* Review Content */}
            <div className="prose prose-lg prose-slate max-w-none">
              {blog?.content && (
                <ReactMarkdown
                  className="text-slate-700"
                  components={{
                    h2: ({node, children, ...props}) => {
                      const text = children?.toString() || '';
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      return <h2 id={id} className="text-3xl font-bold text-slate-900 mt-8 mb-4 scroll-mt-48" {...props}>{children}</h2>;
                    },
                    h3: ({node, children, ...props}) => {
                      const text = children?.toString() || '';
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      return <h3 id={id} className="text-2xl font-bold text-slate-900 mt-6 mb-3 scroll-mt-48" {...props}>{children}</h3>;
                    }
                  }}
                >
                  {blog.content}
                </ReactMarkdown>
              )}

              {/* Pros & Cons Component */}
              <ProsCons blog={blog} />

              {/* FAQs Component */}
              <FAQs blog={blog} />

              {/* Target Audience */}
              {blog?.targetAudience && (
                <>
                  <h3 id="who-should-buy" className="text-2xl font-bold text-slate-900 mb-4 scroll-mt-48">Who Should Buy This?</h3>
                  <div className="bg-purple-50 border-2 border-purple-200 p-6 rounded-2xl mb-8">
                    <p className="text-lg text-slate-700 leading-relaxed">{blog.targetAudience}</p>
                  </div>
                </>
              )}

              {/* Final Verdict */}
              {blog?.verdict && (
                <>
                  <h3 id="verdict" className="text-2xl font-bold text-slate-900 mb-4 scroll-mt-48">Final Verdict</h3>
                  <div className="bg-violet-50 border-2 border-violet-200 p-6 rounded-2xl mb-8">
                    <p className="text-lg text-slate-700 leading-relaxed">
                      <strong className="text-violet-900">Bottom Line:</strong> {blog.verdict}
                    </p>
                  </div>
                </>
              )}
            </div>
          </article>

          {/* Related Products Component */}
          <RelatedProducts relatedProducts={relatedProducts} />
        </div>
      </main>

      {/* Footer */}
      <Footer />

      <style>{`
        .prose img {
          margin: 2rem auto;
          border-radius: 1rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}