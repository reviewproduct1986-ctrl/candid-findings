import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Shield, Heart, Search, CheckCircle, Mail } from 'lucide-react';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <Helmet>
        <title>About Us - CandidFindings</title>
        <meta name="description" content="Learn about our review process and commitment to honest, unbiased product recommendations." />
        <link rel="canonical" href="https://candidfindings.com/about" />
      </Helmet>

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              About CandidFindings
            </h1>
            <p className="text-xl text-slate-600">
              Helping you make smarter shopping decisions through honest, thorough product reviews.
            </p>
          </div>

          {/* Mission */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We're passionate about cutting through marketing hype to deliver honest, 
              unbiased product reviews that help you make informed purchasing decisions.
            </p>
            <p className="text-slate-700 leading-relaxed">
              In a world of sponsored content and paid reviews, we believe consumers 
              deserve honest opinions they can trust.
            </p>
          </section>

          {/* Review Process */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Our Review Process</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Search className="text-violet-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">
                    1. Thorough Research
                  </h3>
                  <p className="text-slate-600">
                    We analyze thousands of customer reviews, compare specifications, 
                    and research competing products to understand the full picture.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="text-violet-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">
                    2. Real-World Analysis
                  </h3>
                  <p className="text-slate-600">
                    We evaluate products based on real customer experiences, common 
                    use cases, and long-term reliability.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Heart className="text-violet-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">
                    3. Honest Recommendations
                  </h3>
                  <p className="text-slate-600">
                    We only recommend products we genuinely believe provide value. 
                    If we find issues, we tell you about them.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Shield className="text-violet-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">
                    4. Regular Updates
                  </h3>
                  <p className="text-slate-600">
                    We regularly update our reviews to reflect price changes, new models, 
                    and long-term user feedback.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Stay Connected - NEW SECTION */}
          <section className="mb-10 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-6 border border-violet-100">
            <div className="flex gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Mail className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Stay Connected</h2>
                <p className="text-slate-700 leading-relaxed">
                  Subscribe to our weekly newsletter to get the best product recommendations 
                  delivered to your inbox.
                </p>
              </div>
            </div>
            
            <div className="space-y-3 sm:ml-16">
              <div className="flex items-start gap-2">
                <CheckCircle className="text-violet-600 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-slate-700">
                  <strong>Weekly product picks</strong> – Curated recommendations just for you
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="text-violet-600 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-slate-700">
                  <strong>Exclusive deals</strong> – Get notified about the best prices
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="text-violet-600 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-slate-700">
                  <strong>No spam, ever</strong> – Unsubscribe anytime with one click
                </p>
              </div>
            </div>

            <div className="mt-6 sm:ml-16 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  window.scrollTo({
                    top: document.documentElement.scrollHeight,
                    behavior: 'smooth'
                  });
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors cursor-pointer"
              >
                <Mail size={18} />
                Subscribe to Newsletter
              </button>
              <Link
                to="/privacy-policy"
                className="inline-flex items-center justify-center px-6 py-3 border border-violet-200 text-violet-700 rounded-lg font-semibold hover:bg-violet-50 transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </section>

          {/* Transparency */}
          <section className="mb-10 bg-amber-50 rounded-xl p-6 border border-amber-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Commitment to Transparency</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong>We earn commissions from Amazon purchases.</strong> However, this never 
              influences our reviews. We recommend products based solely on their merit.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Your trust is our most valuable asset. We'd rather lose a commission than 
              recommend a product that doesn't meet our standards.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-0">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Get In Touch</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Have questions, suggestions, or feedback? We'd love to hear from you.
            </p>
            <div className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 transition-colors">
              <a href="mailto:hello@candidfindings.com" className="font-semibold">
                hello@candidfindings.com
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}