import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import Footer from '../components/Footer';

export default function BuyingGuidesList() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/data/buying-guides.json')
      .then(res => res.json())
      .then(data => {
        setGuides(data.guides || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading guides:', error);
        setLoading(false);
      });
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
          <p className="mt-4 text-slate-600">Loading buying guides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Buying Guides - CandidFindings</title>
        <meta name="description" content="Expert buying guides to help you make the best purchasing decisions. Compare products, understand features, and find the perfect fit for your needs." />
        <link rel="canonical" href="https://candidfindings.com/guides" />
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
              View Products
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full mb-4">
            <BookOpen size={20} />
            <span className="font-semibold">Buying Guides</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Expert Buying Guides
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Comprehensive guides to help you find the perfect products for your needs
          </p>
        </div>

        {/* Guides Grid */}
        {guides.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {guides.map(guide => (
              <Link
                key={guide.slug}
                to={`/guides/${guide.slug}`}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all group border border-slate-200 hover:border-violet-300"
              >
                {guide.image && (
                  <div className="aspect-video overflow-hidden bg-gradient-to-br from-violet-100 to-indigo-100">
                    <img
                      src={guide.image}
                      alt={guide.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1 rounded-full">
                      {guide.category}
                    </span>
                    {guide.updated && (
                      <span className="text-xs text-slate-500">
                        Updated {new Date(guide.updated).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-violet-600 transition-colors">
                    {guide.title}
                  </h2>
                  
                  <p className="text-slate-600 mb-4 line-clamp-2">
                    {guide.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-2 text-violet-600 font-semibold group-hover:gap-3 transition-all">
                    <span>Read Guide</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <BookOpen size={48} className="mx-auto text-slate-400 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Buying Guides Coming Soon
            </h2>
            <p className="text-slate-600">
              We're working on comprehensive buying guides. Check back soon!
            </p>
            <Link
              to="/"
              className="inline-block mt-6 px-6 py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}