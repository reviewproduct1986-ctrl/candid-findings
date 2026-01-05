import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Footer from '../components/Footer';
import ReviewHeader from '../components/review/ReviewHeader';
import StickyBuyButton from '../components/review/StickyBuyButton';
import Breadcrumbs from '../components/review/Breadcrumbs';
import ReviewHero from '../components/review/ReviewHero';
import TableOfContents from '../components/review/TableOfContents';
import ProsCons from '../components/review/ProsCons';
import FAQSection from '../components/review/FAQSection';
import ProductCard from '../components/ProductCard';
import { markdownComponents } from '../utils/markdownComponents';
import { generateFAQSchema, generateReviewSchema } from '../utils/schemaGenerators';

export default function ReviewPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [blog, setBlog] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tocExpanded, setTocExpanded] = useState(false);

  // Scroll to top when navigating to a new review
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Calculate discount
  const hasDiscount = product?.listPrice && product.listPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.listPrice - product.price) / product.listPrice) * 100)
    : 0;
  const savings = hasDiscount ? product.listPrice - product.price : 0;
  
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Load data
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
            return { ...p, reviewUrl: relatedBlog ? `/reviews/${relatedBlog.slug}` : null };
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

  // Update meta tags
  useEffect(() => {
    if (!blog || !product) return;
    
    document.title = `${blog.title || product.title + ' Review'} | CandidFindings`;
    
    const setMeta = (selector, attr, attrName, content) => {
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, attrName);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };
    
    setMeta('meta[name="description"]', 'name', 'description', blog.metaDescription || blog.excerpt || product.description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', blog.title || product.title + ' Review');
    setMeta('meta[property="og:description"]', 'property', 'og:description', blog.metaDescription || blog.excerpt || product.description);
    setMeta('meta[property="og:image"]', 'property', 'og:image', product.image);
    setMeta('meta[property="og:url"]', 'property', 'og:url', `https://candidfindings.com/reviews/${slug}`);
  }, [blog, product, slug]);

  // Table of contents
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

  const faqSchema = useMemo(() => generateFAQSchema(blog), [blog]);
  const reviewSchema = useMemo(() => generateReviewSchema(product, blog), [product, blog]);

  const totalSections = tableOfContents.length + 
    (blog?.pros ? 1 : 0) + 
    (blog?.cons ? 1 : 0) + 
    (blog?.faqs ? 1 : 0) + 
    (blog?.targetAudience ? 1 : 0) + 
    (blog?.verdict ? 1 : 0);

  if (loading || !product || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return ( 
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pb-24">
      <Helmet>
        <title>{blog.title} | CandidFindings</title>
        <meta name="description" content={blog.metaDescription} />
        <link rel="canonical" href={`https://candidfindings.com/reviews/${slug}`} />
        <link rel="preload" as="image" href={product.image} fetchpriority="high" />
        
        {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
        {reviewSchema && <script type="application/ld+json">{JSON.stringify(reviewSchema)}</script>}
      </Helmet>

      <ReviewHeader />
      <StickyBuyButton product={product} />

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Breadcrumbs product={product} />

        <article className="bg-white rounded-3xl shadow-xl p-6 md:p-12">
          <ReviewHero 
            product={product}
            blog={blog}
            hasDiscount={hasDiscount}
            savings={savings}
            discountPercent={discountPercent}
            formatDate={formatDate}
          />

          <div className="mb-10">
            <img 
              src={product.image} 
              alt={`${product.title} - Product review image`}
              className="w-full h-96 object-cover rounded-2xl shadow-lg"
              fetchpriority="high"
              loading="eager"
            />
          </div>

          <TableOfContents 
            tableOfContents={tableOfContents}
            blog={blog}
            totalSections={totalSections}
            tocExpanded={tocExpanded}
            setTocExpanded={setTocExpanded}
          />

          <div className="prose prose-lg prose-slate max-w-none">
            {blog?.content && (
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {blog.content}
              </ReactMarkdown>
            )}

            <ProsCons pros={blog?.pros} cons={blog?.cons} />
            <FAQSection faqs={blog?.faqs} />

            {blog?.targetAudience && (
              <>
                <h3 id="who-should-buy" className="text-2xl font-bold text-slate-900 mb-4">Who Should Buy This?</h3>
                <div className="bg-purple-50 border-2 border-purple-200 p-6 rounded-2xl mb-8">
                  <p className="text-lg text-slate-700">{blog.targetAudience}</p>
                </div>
              </>
            )}

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

        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              You May Also Like
            </h2>
            
            {/* ✅ Use ProductCard component */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  showCategory={false}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />

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