import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, FileText } from 'lucide-react';
import Footer from '../components/Footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <Helmet>
        <title>Terms of Service - CandidFindings</title>
        <meta name="description" content="Terms of Service for CandidFindings. Read our terms and conditions for using our website." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://candidfindings.com/terms" />
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
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <FileText className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Terms of Service</h1>
              <p className="text-slate-600 text-sm mt-1">Last updated: January 15, 2025</p>
            </div>
          </div>

          {/* Introduction */}
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-700 mb-8">
              Welcome to CandidFindings. By accessing and using our website, you agree to comply with and be bound by the following terms and conditions.
            </p>

            {/* Agreement to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Agreement to Terms</h2>
              <p className="text-slate-700 mb-4">
                By accessing or using CandidFindings, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our website.
              </p>
            </section>

            {/* Use of Website */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Use of Website</h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Permitted Use</h3>
              <p className="text-slate-700 mb-4">
                You may use our website for lawful purposes only. You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful code or malware</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated systems to access the website (scraping, bots, etc.) without permission</li>
                <li>Interfere with or disrupt the website's operation</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3">Account Responsibility</h3>
              <p className="text-slate-700 mb-4">
                If you create an account with us, you are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
              </p>
            </section>

            {/* Content and Reviews */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Content and Product Reviews</h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Our Content</h3>
              <p className="text-slate-700 mb-4">
                All content on CandidFindings, including but not limited to text, graphics, logos, images, and reviews, is the property of CandidFindings or its content suppliers and is protected by copyright laws.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3">Product Information</h3>
              <p className="text-slate-700 mb-4">
                We strive to provide accurate product information and reviews. However:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li>Product information is provided "as is" without warranties</li>
                <li>Prices, availability, and specifications may change</li>
                <li>We are not responsible for inaccuracies in product descriptions</li>
                <li>Always verify details on the retailer's website before purchasing</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3">Reviews and Opinions</h3>
              <p className="text-slate-700 mb-4">
                Our reviews represent our honest opinions based on research and analysis. Individual experiences may vary. We encourage you to do your own research before making purchase decisions.
              </p>
            </section>

            {/* Amazon Affiliate Disclosure */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Amazon Associates Program</h2>
              <p className="text-slate-700 mb-4">
                CandidFindings is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
              </p>
              <p className="text-slate-700 mb-4">
                When you click on product links and make purchases through Amazon:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li>We may earn a commission at no additional cost to you</li>
                <li>The price you pay is the same as going directly to Amazon</li>
                <li>We only recommend products we believe provide value</li>
                <li>Our reviews remain honest and unbiased</li>
              </ul>
            </section>

            {/* Third-Party Links */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Third-Party Links</h2>
              <p className="text-slate-700 mb-4">
                Our website contains links to third-party websites (primarily Amazon). We are not responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li>The content or privacy practices of linked websites</li>
                <li>Products or services offered by third parties</li>
                <li>Transactions made on third-party websites</li>
                <li>Disputes between you and third-party retailers</li>
              </ul>
              <p className="text-slate-700 mb-4">
                Please review the terms and privacy policies of any third-party websites you visit.
              </p>
            </section>

            {/* Disclaimers */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Disclaimers</h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-3">"As Is" Basis</h3>
              <p className="text-slate-700 mb-4">
                Our website and content are provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li>Accuracy, completeness, or reliability of content</li>
                <li>Merchantability or fitness for a particular purpose</li>
                <li>Non-infringement of intellectual property rights</li>
                <li>Uninterrupted or error-free operation</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3">No Professional Advice</h3>
              <p className="text-slate-700 mb-4">
                The information on CandidFindings is for general informational purposes only and should not be considered professional advice. We are not responsible for decisions made based on information provided on our website.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Limitation of Liability</h2>
              <p className="text-slate-700 mb-4">
                To the fullest extent permitted by law, CandidFindings and its affiliates shall not be liable for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li>Any indirect, incidental, special, or consequential damages</li>
                <li>Loss of profits, revenue, data, or use</li>
                <li>Damage to products purchased through affiliate links</li>
                <li>Disputes with third-party retailers</li>
                <li>Any damages arising from your use or inability to use our website</li>
              </ul>
              <p className="text-slate-700 mb-4">
                Some jurisdictions do not allow limitations on implied warranties or liability, so these limitations may not apply to you.
              </p>
            </section>

            {/* Indemnification */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Indemnification</h2>
              <p className="text-slate-700 mb-4">
                You agree to indemnify and hold harmless CandidFindings and its affiliates from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li>Your use of our website</li>
                <li>Your violation of these Terms of Service</li>
                <li>Your violation of any rights of another party</li>
                <li>Any content you submit or post</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Intellectual Property Rights</h2>
              <p className="text-slate-700 mb-4">
                All content on CandidFindings, including text, graphics, logos, and reviews, is protected by copyright and other intellectual property laws. You may not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li>Reproduce, distribute, or display our content without permission</li>
                <li>Modify or create derivative works</li>
                <li>Use our content for commercial purposes without authorization</li>
                <li>Remove copyright or proprietary notices</li>
              </ul>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Changes to Terms</h2>
              <p className="text-slate-700 mb-4">
                We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of the website after changes constitutes acceptance of the new terms.
              </p>
              <p className="text-slate-700 mb-4">
                We encourage you to review these terms periodically to stay informed of any updates.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Termination</h2>
              <p className="text-slate-700 mb-4">
                We reserve the right to terminate or suspend your access to our website at any time, without notice, for any reason, including violation of these Terms of Service.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Governing Law</h2>
              <p className="text-slate-700 mb-4">
                These Terms of Service shall be governed by and construed in accordance with the laws of the United States and the State of California, without regard to conflict of law principles.
              </p>
              <p className="text-slate-700 mb-4">
                Any disputes arising from these terms or your use of our website shall be resolved in the courts located in California.
              </p>
            </section>

            {/* Severability */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Severability</h2>
              <p className="text-slate-700 mb-4">
                If any provision of these Terms of Service is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
              <p className="text-slate-700 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <ul className="list-none space-y-2 text-slate-700">
                <li><strong>Website:</strong> candidfindings.com</li>
                <li><strong>Email:</strong> legal@candidfindings.com</li>
              </ul>
            </section>

            {/* Acknowledgment */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Acknowledgment</h2>
              <p className="text-slate-700 mb-4">
                By using CandidFindings, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}