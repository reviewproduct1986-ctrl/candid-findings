import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Star, Sparkles, BookOpen, ChevronDown, ShoppingCart } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Footer from '../components/Footer';

export default function ReviewPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [blog, setBlog] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tocExpanded, setTocExpanded] = useState(false);

  // Calculate discount if listPrice exists
  const hasDiscount = product?.listPrice && product.listPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.listPrice - product.price) / product.listPrice) * 100)
    : 0;
  const savings = hasDiscount ? product.listPrice - product.price : 0;
  
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) {
      // Use current date if no date provided
      const today = new Date();
      return today.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  useEffect(() => {
    Promise.all([
      fetch('/data/products.json').then(res => res.json()),
      fetch('/data/blogs.json').then(res => res.json())
    ])
      .then(([productsData, blogsData]) => {
        const productsList = productsData.products || [];
        const blogsList = blogsData.posts || [];
        
        const foundBlog = blogsList.find(b => b.slug === slug);
        if (!foundBlog) {
          navigate('/', { replace: true });
          return;
        }
        
        const foundProduct = productsList.find(p => p.id === foundBlog.productId);
        if (!foundProduct) {
          navigate('/', { replace: true });
          return;
        }
        
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

  // MANUAL META TAG UPDATES - Bypasses Helmet issues
  useEffect(() => {
    if (!blog || !product) return;
    
    // Update title
    document.title = `${blog.title || product.title + ' Review'} | CandidFindings`;
    
    // Helper function to update/create meta tags
    const setMeta = (selector, attr, attrName, content) => {
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, attrName);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };
    
    // Update all meta tags
    setMeta('meta[name="description"]', 'name', 'description', 
      blog.metaDescription || blog.excerpt || product.description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', 
      blog.title || product.title + ' Review');
    setMeta('meta[property="og:description"]', 'property', 'og:description', 
      blog.metaDescription || blog.excerpt || product.description);
    setMeta('meta[property="og:image"]', 'property', 'og:image', 
      product.image);
    setMeta('meta[property="og:url"]', 'property', 'og:url', 
      `https://candidfindings.com/reviews/${slug}`);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', 
      blog.title || product.title + ' Review');
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', 
      blog.metaDescription || blog.excerpt || product.description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', 
      product.image);
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 
      'summary_large_image');
    
    console.log('✅ Meta tags updated:', document.title);
  }, [blog, product, slug]);

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

  const totalSections = tableOfContents.length + 
    (blog?.pros ? 1 : 0) + 
    (blog?.cons ? 1 : 0) + 
    (blog?.faqs ? 1 : 0) + 
    (blog?.targetAudience ? 1 : 0) + 
    (blog?.verdict ? 1 : 0);

  return ( 
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pb-24">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{blog.title} | CandidFindings</title>
        <meta name="description" content={blog.metaDescription} />
        <link rel="canonical" href={`https://candidfindings.com/reviews/${slug}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="CandidFindings" />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.metaDescription} />
        <meta property="og:url" content={`https://candidfindings.com/reviews/${slug}`} />
        <meta property="og:image" content={product.image} />
        <meta property="og:image:secure_url" content={product.image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${product.title} Review Image`} />
        
        {/* Article Metadata */}
        <meta property="article:published_time" content={blog.publishedDate} />
        <meta property="article:modified_time" content={blog.updatedDate} />
        <meta property="article:author" content="CandidFindings" />
        <meta property="article:section" content={product.category} />
        {blog.keywords?.slice(0, 5).map((keyword, i) => (
          <meta key={i} property="article:tag" content={keyword} />
        ))}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.metaDescription} />
        <meta name="twitter:image" content={product.image} />
        <meta name="twitter:image:alt" content={`${product.title} Review`} />
        
        {/* Preload hero image for faster LCP */}
        <link rel="preload" as="image" href={product.image} fetchpriority="high" />
        
        {/* FAQ Schema */}
        {faqSchema && (
          <script type="application/ld+json">
            {JSON.stringify(faqSchema)}
          </script>
        )}
        
        {/* Product Review Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Review",
            "reviewBody": blog.excerpt || blog.metaDescription,
            "itemReviewed": {
              "@type": "Product",
              "name": product.title,
              "description": product.description || blog.metaDescription,  // ← ADDED
              "image": product.image,
              "sku": product.id,
              "brand": {
                "@type": "Brand",
                "name": product.brand || product.title.split(' ')[0] || "Various"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": product.rating.toString(),
                "reviewCount": (product.reviews || 1).toString(),
                "bestRating": "5",
                "worstRating": "1"
              },
              "offers": {
                "@type": "Offer",
                "price": product.price.toFixed(2),
                "priceCurrency": "USD",
                "priceValidUntil": new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
                "availability": "https://schema.org/InStock",
                "url": product.affiliate,
                "itemCondition": "https://schema.org/NewCondition",
                "seller": {
                  "@type": "Organization",
                  "name": "Amazon"
                },
                "shippingDetails": {
                  "@type": "OfferShippingDetails",
                  "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": "0",
                    "currency": "USD"
                  },
                  "shippingDestination": {
                    "@type": "DefinedRegion",
                    "addressCountry": "US"
                  },
                  "deliveryTime": {
                    "@type": "ShippingDeliveryTime",
                    "handlingTime": {
                      "@type": "QuantitativeValue",
                      "minValue": 0,
                      "maxValue": 1,
                      "unitCode": "DAY"
                    },
                    "transitTime": {
                      "@type": "QuantitativeValue",
                      "minValue": 1,
                      "maxValue": 5,
                      "unitCode": "DAY"
                    }
                  }
                },
                "hasMerchantReturnPolicy": {
                  "@type": "MerchantReturnPolicy",
                  "applicableCountry": "US",
                  "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                  "merchantReturnDays": 30,
                  "returnMethod": "https://schema.org/ReturnByMail",
                  "returnFees": "https://schema.org/FreeReturn"
                }
              }
            },
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": product.rating.toString(),
              "bestRating": "5",
              "worstRating": "1"
            },
            "author": {
              "@type": "Organization",
              "name": "CandidFindings",
              "url": "https://candidfindings.com"
            },
            "publisher": {
              "@type": "Organization",
              "name": "CandidFindings"
            },
            "datePublished": blog.publishedDate,
            "dateModified": blog.updatedDate || blog.publishedDate
          })}
        </script>
      </Helmet>

      {/* Header - NO STICKY */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 lg:py-2.5">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles className="text-white" size={18} />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-slate-900 text-base lg:text-lg leading-tight">
                  CandidFindings
                </h1>
                <p className="text-xs text-slate-500 leading-tight">Honest Recommendations</p>
              </div>
            </Link>
            <Link
              to="/"
              className="px-4 py-2 text-violet-600 hover:text-violet-700 transition-colors text-sm font-semibold bg-white border-2 border-violet-200 rounded-lg"
            >
              View More Products
            </Link>
          </div>
        </div>
      </header>

      {/* FIXED BOTTOM BUTTON - Centered on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-violet-200 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Desktop: Horizontal layout with product info */}
          <div className="hidden md:flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={product.image} 
                alt={product.title} 
                className="w-16 h-16 rounded-lg object-cover"
                loading="lazy"
              />
              <div>
                <div className="font-bold text-slate-900 text-sm">{product.title}</div>
                <div className="flex items-center gap-2">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="text-sm text-slate-600">{product.rating}</span>
                  {hasDiscount ? (
                    <>
                      <span className="text-sm text-slate-400 line-through">${product.listPrice?.toFixed(2)}</span>
                      <span className="text-lg font-bold text-green-600">${product.price?.toFixed(2)}</span>
                      <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        {discountPercent}% off
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-violet-600">${product.price?.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
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
              className="flex-shrink-0 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 px-8 rounded-xl font-bold text-base hover:shadow-lg transition-all flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              View on Amazon
            </a>
          </div>

          {/* Mobile: Centered button */}
          <div className="md:hidden flex flex-col items-center gap-2">
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
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-bold text-base hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              View on Amazon
            </a>
          </div>

          <p className="text-[10px] text-slate-400 text-center mt-2">
            As an Amazon Associate we earn from qualifying purchases
          </p>
        </div>
      </div>

      {/* Review Content */}
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-slate-600">
            <li><Link to="/" className="hover:text-violet-600">Home</Link></li>
            <li className="text-slate-400">/</li>
            <li>
              <Link to={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-violet-600">
                {product.category}
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="text-slate-900 font-medium truncate max-w-md">{product.title}</li>
          </ol>
        </nav>

        <div>
          <article className="bg-white rounded-3xl shadow-xl p-6 md:p-12">
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
              
              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 p-5 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} className={i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                    ))}
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{product.rating}</div>
                  <div className="text-sm text-slate-600">Rating</div>
                </div>
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 p-5 rounded-2xl">
                  {hasDiscount ? (
                    <>
                      {/* Original price (strikethrough) */}
                      <div className="text-lg text-slate-400 line-through mb-1">
                        ${product.listPrice}
                      </div>
                      
                      {/* Sale price */}
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        ${product.price?.toFixed(2)}
                      </div>
                      
                      {/* Savings badge */}
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        <span>💰</span>
                        <span>Save ${savings.toFixed(2)} ({discountPercent.toFixed(0)}% off)</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-slate-900">${product.price?.toFixed(2)}</div>
                      <div className="text-sm text-slate-600">Current Price</div>
                    </>
                  )}
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-200 p-5 rounded-2xl">
                  <div className="text-sm font-semibold text-slate-900">Last Updated</div>
                  <div className="text-sm text-slate-600">{formatDate(blog.lastUpdated)}</div>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <img 
                src={product.image} 
                alt={`${product.title} - Product review image`}
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
                fetchpriority="high"
                loading="eager"
              />
            </div>

            {/* Table of Contents - NO ANIMATIONS */}
            {tableOfContents.length > 0 && (
              <div className="not-prose mb-8 border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setTocExpanded(!tocExpanded)}
                  className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="text-violet-600" size={20} />
                    <h2 className="font-bold text-slate-900">Table of Contents</h2>
                    <span className="text-xs text-slate-500">({totalSections} sections)</span>
                  </div>
                  <ChevronDown className={`text-slate-400 ${tocExpanded ? 'rotate-180 text-violet-600' : ''}`} size={20} />
                </button>

                {tocExpanded && (
                  <div className="p-5 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {tableOfContents.map((heading, index) => (
                        <a
                          key={index}
                          href={`#${heading.id}`}
                          onClick={() => setTocExpanded(false)}
                          className="block p-4 rounded-xl hover:shadow-md"
                          style={{
                            backgroundColor: heading.level === 2 ? '#f0f9ff' : '#fef3c7',
                            borderLeft: heading.level === 2 ? '4px solid #3b82f6' : '4px solid #f59e0b'
                          }}
                        >
                          <span className="font-semibold">{heading.text}</span>
                        </a>
                      ))}
                      
                      {blog?.pros && <a href="#pros" onClick={() => setTocExpanded(false)} className="block p-4 rounded-xl bg-green-50 border-l-4 border-green-500"><span className="font-semibold">Pros</span></a>}
                      {blog?.cons && <a href="#cons" onClick={() => setTocExpanded(false)} className="block p-4 rounded-xl bg-orange-50 border-l-4 border-orange-500"><span className="font-semibold">Cons</span></a>}
                      {blog?.faqs?.length > 0 && <a href="#faqs" onClick={() => setTocExpanded(false)} className="block p-4 rounded-xl bg-blue-50 border-l-4 border-blue-500"><span className="font-semibold">FAQs</span></a>}
                      {blog?.targetAudience && <a href="#who-should-buy" onClick={() => setTocExpanded(false)} className="block p-4 rounded-xl bg-purple-50 border-l-4 border-purple-500"><span className="font-semibold">Who Should Buy</span></a>}
                      {blog?.verdict && <a href="#verdict" onClick={() => setTocExpanded(false)} className="block p-4 rounded-xl bg-violet-50 border-l-4 border-violet-500"><span className="font-semibold">Final Verdict</span></a>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Content - NO SCROLL OFFSETS! */}
            <div className="prose prose-lg prose-slate max-w-none">
              {blog?.content && (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]} 
                  components={{
                      h1: ({node, children, ...props}) => {
                        const text = children?.toString() || '';
                        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        return <h1 id={id} className="text-4xl font-bold text-slate-900 mt-10 mb-6" {...props}>{children}</h1>;
                      },
                      h2: ({node, children, ...props}) => {
                        const text = children?.toString() || '';
                        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        return <h2 id={id} className="text-3xl font-bold text-slate-900 mt-8 mb-4" {...props}>{children}</h2>;
                      },
                      h3: ({node, children, ...props}) => {
                        const text = children?.toString() || '';
                        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        return <h3 id={id} className="text-2xl font-bold text-slate-900 mt-6 mb-3" {...props}>{children}</h3>;
                      },
                      h4: ({node, children, ...props}) => {
                        const text = children?.toString() || '';
                        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        return <h4 id={id} className="text-xl font-bold text-slate-900 mt-4 mb-2" {...props}>{children}</h4>;
                      },
                      p: ({node, children, ...props}) => {
                        return <p className="mb-4 text-slate-700 leading-relaxed" {...props}>{children}</p>;
                      },
                      ul: ({node, children, ...props}) => {
                        return <ul className="list-disc list-inside mb-4 space-y-2" {...props}>{children}</ul>;
                      },
                      ol: ({node, children, ...props}) => {
                        return <ol className="list-decimal list-inside mb-4 space-y-2" {...props}>{children}</ol>;
                      },
                      li: ({node, children, ...props}) => {
                        return <li className="text-slate-700" {...props}>{children}</li>;
                      },
                      strong: ({node, children, ...props}) => {
                        return <strong className="font-bold text-slate-900" {...props}>{children}</strong>;
                      },
                      em: ({node, children, ...props}) => {
                        return <em className="italic" {...props}>{children}</em>;
                      },
                      code: ({node, inline, children, ...props}) => {
                        return inline 
                          ? <code className="px-1.5 py-0.5 bg-slate-100 rounded text-sm font-mono text-violet-600" {...props}>{children}</code>
                          : <code className="block p-4 bg-slate-100 rounded-lg text-sm font-mono overflow-x-auto mb-4" {...props}>{children}</code>;
                      },
                      blockquote: ({node, children, ...props}) => {
                        return <blockquote className="border-l-4 border-violet-500 pl-4 italic text-slate-600 my-4" {...props}>{children}</blockquote>;
                      },
                      a: ({node, children, href, ...props}) => {
                        return <a href={href} className="text-violet-600 hover:text-violet-700 underline" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
                      }
                  }}
                >
                  {blog.content}
                </ReactMarkdown>
              )}

              {/* Pros */}
              {blog?.pros && blog.pros.length > 0 && (
                <div className="my-12">
                  <h3 id="pros" className="text-2xl font-bold text-slate-900 mb-4">What We Love (Pros)</h3>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                    <ul className="space-y-3">
                      {blog.pros.map((pro, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-green-600 font-bold text-xl">✓</span>
                          <span className="text-slate-800">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Cons */}
              {blog?.cons && blog.cons.length > 0 && (
                <div className="my-12">
                  <h3 id="cons" className="text-2xl font-bold text-slate-900 mb-4">Potential Drawbacks (Cons)</h3>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200">
                    <ul className="space-y-3">
                      {blog.cons.map((con, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-orange-600 font-bold text-xl">•</span>
                          <span className="text-slate-800">{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* FAQs */}
              {blog?.faqs && blog.faqs.length > 0 && (
                <div id="faqs" className="mt-12">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    {blog.faqs.map((faq, index) => (
                      <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="font-bold text-lg text-slate-900 mb-3 flex items-start gap-2">
                          <span className="text-blue-600">❓</span>
                          {faq.question}
                        </h4>
                        <p className="text-slate-700 pl-7">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Who Should Buy */}
              {blog?.targetAudience && (
                <>
                  <h3 id="who-should-buy" className="text-2xl font-bold text-slate-900 mb-4">Who Should Buy This?</h3>
                  <div className="bg-purple-50 border-2 border-purple-200 p-6 rounded-2xl mb-8">
                    <p className="text-lg text-slate-700">{blog.targetAudience}</p>
                  </div>
                </>
              )}

              {/* Verdict */}
              {blog?.verdict && (
                <>
                  <h3 id="verdict" className="text-2xl font-bold text-slate-900 mb-4">Final Verdict</h3>
                  <div className="bg-violet-50 border-2 border-violet-200 p-6 rounded-2xl mb-8">
                    <p className="text-lg text-slate-700">
                      <strong className="text-violet-900">Bottom Line:</strong> {blog.verdict}
                    </p>
                  </div>
                </>
              )}
            </div>
          </article>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">You Might Also Like</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <div key={relatedProduct.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <img 
                      src={relatedProduct.image} 
                      alt={relatedProduct.title} 
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-slate-900 mb-2">{relatedProduct.title}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className={i < Math.floor(relatedProduct.rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                        ))}
                        <span className="text-sm text-slate-600">{relatedProduct.rating}</span>
                      </div>
                      <div className="text-2xl font-bold text-violet-600 mb-4">${relatedProduct.price?.toFixed(2)}</div>
                      {relatedProduct.reviewUrl ? (
                        <Link to={relatedProduct.reviewUrl} className="block w-full bg-violet-600 text-white text-center py-2 rounded-lg hover:bg-violet-700 font-semibold">
                          Read Review
                        </Link>
                      ) : (
                        <a href={relatedProduct.affiliate} target="_blank" rel="noopener noreferrer" className="block w-full bg-slate-600 text-white text-center py-2 rounded-lg hover:bg-slate-700 font-semibold">
                          View on Amazon
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <style>{`
        html {
          scroll-padding-top: 2rem;
        }
        
        .prose img {
          margin: 2rem auto;
          border-radius: 1rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}