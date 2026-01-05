import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Shield } from 'lucide-react';
import Footer from '../components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <Helmet>
        <title>Privacy Policy - CandidFindings</title>
        <meta name="description" content="Privacy Policy for CandidFindings. Learn how we collect, use, and protect your information." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://candidfindings.com/privacy-policy" />
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
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Privacy Policy</h1>
              <p className="text-slate-600 text-sm mt-1">Last updated: January 5, 2026</p>
            </div>
          </div>

          {/* Introduction */}
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-700 mb-8">
              At CandidFindings, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
            </p>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Automatically Collected Information</h3>
              <p className="text-slate-700 mb-4">
                When you visit our website, we automatically collect certain information about your device, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>IP address</li>
                <li>Pages visited and time spent on pages</li>
                <li>Referring website addresses</li>
                <li>Device information</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3">Information You Provide</h3>
              <p className="text-slate-700 mb-4">
                We may collect information you voluntarily provide, such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li>Email address (if you subscribe to our newsletter)</li>
                <li>Comments or feedback (if applicable)</li>
                <li>Any other information you choose to provide</li>
              </ul>
            </section>

            {/* Email Communications - NEW SECTION */}
            <section className="mb-8 bg-violet-50/50 rounded-lg p-6 border border-violet-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Email Communications & Newsletter</h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Newsletter Subscription</h3>
              <p className="text-slate-700 mb-4">
                When you subscribe to our email newsletter, we collect:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li>Your email address</li>
                <li>Date and time of subscription</li>
                <li>IP address (for security purposes)</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3">How We Use Your Email</h3>
              <p className="text-slate-700 mb-4">
                We use your email address to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li>Send weekly product recommendations and deals</li>
                <li>Provide exclusive offers to subscribers</li>
                <li>Share updates about CandidFindings</li>
                <li>Send important service-related announcements</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3">Email Service Provider</h3>
              <p className="text-slate-700 mb-4">
                We use <strong>MailChimp</strong> (owned by Intuit) to manage our email list and send newsletters. Your email address is stored on MailChimp's servers, which are located in the United States. MailChimp's privacy policy can be found at:{' '}
                <a href="https://www.intuit.com/privacy/statement/" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 underline">
                  https://www.intuit.com/privacy/statement/
                </a>
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3">Your Rights</h3>
              <p className="text-slate-700 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li><strong>Unsubscribe:</strong> Click the "Unsubscribe" link at the bottom of any email</li>
                <li><strong>Update your preferences:</strong> Manage your subscription settings via email links</li>
                <li><strong>Request deletion:</strong> Email hello@candidfindings.com to delete your data</li>
                <li><strong>Access your data:</strong> Request a copy of the data we have about you</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3">Email Frequency</h3>
              <p className="text-slate-700 mb-4">
                We send approximately one email per week. We may occasionally send additional emails for special offers or important updates. <strong>We will never spam you or sell your email address to third parties.</strong>
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3">Data Security</h3>
              <p className="text-slate-700 mb-4">
                We take reasonable measures to protect your email address from unauthorized access or disclosure. However, no internet transmission is 100% secure.
              </p>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">How We Use Your Information</h2>
              <p className="text-slate-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li>Provide, operate, and maintain our website</li>
                <li>Improve, personalize, and expand our website</li>
                <li>Understand and analyze how you use our website</li>
                <li>Develop new products, services, features, and functionality</li>
                <li>Communicate with you (if you've opted in)</li>
                <li>Send you newsletters and promotional materials (with your consent)</li>
                <li>Find and prevent fraud</li>
              </ul>
            </section>

            {/* Cookies and Tracking */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Cookies and Tracking Technologies</h2>
              <p className="text-slate-700 mb-4">
                We use cookies and similar tracking technologies to track activity on our website and store certain information. Cookies are files with small amounts of data that are sent to your browser from a website and stored on your device.
              </p>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Types of Cookies We Use</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website (Google Analytics)</li>
                <li><strong>Advertising Cookies:</strong> Used to deliver relevant advertisements (Amazon Associates)</li>
              </ul>

              <p className="text-slate-700 mb-4">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
              </p>
            </section>

            {/* Third-Party Services */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Third-Party Services</h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Google Analytics</h3>
              <p className="text-slate-700 mb-4">
                We use Google Analytics to analyze website traffic and usage. Google Analytics uses cookies to collect information about your use of our website. This information is used to compile reports and help us improve our website. Google Analytics collects information anonymously and reports website trends without identifying individual visitors.
              </p>
              <p className="text-slate-700 mb-4">
                For more information on how Google uses data, visit: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 underline">Google Privacy Policy</a>
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3">Amazon Associates Program</h3>
              <p className="text-slate-700 mb-4">
                CandidFindings is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
              </p>
              <p className="text-slate-700 mb-4">
                When you click on Amazon product links and make purchases, Amazon may use cookies to track these referrals. This information is used to credit our account for qualifying purchases.
              </p>
            </section>

            {/* Data Sharing */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">How We Share Your Information</h2>
              <p className="text-slate-700 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties. However, we may share information with:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li><strong>Service Providers:</strong> Companies that help us operate our website (e.g., MailChimp, Google Analytics, hosting providers)</li>
                <li><strong>Amazon:</strong> When you click on affiliate links, Amazon receives information necessary to process referrals</li>
                <li><strong>Legal Requirements:</strong> If required by law or to protect our rights</li>
              </ul>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Security</h2>
              <p className="text-slate-700 mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information. However, please note that no method of transmission over the Internet or electronic storage is 100% secure.
              </p>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Rights and Choices</h2>
              <p className="text-slate-700 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
                <li>Disable cookies through your browser settings</li>
                <li>Opt-out of Google Analytics using the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 underline">Google Analytics Opt-out Browser Add-on</a></li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Children's Privacy</h2>
              <p className="text-slate-700 mb-4">
                Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            {/* California Privacy Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">California Privacy Rights (CCPA)</h2>
              <p className="text-slate-700 mb-4">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to say no to the sale of personal information</li>
                <li>Right to access your personal information</li>
                <li>Right to equal service and price</li>
              </ul>
            </section>

            {/* GDPR */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">European Users (GDPR)</h2>
              <p className="text-slate-700 mb-4">
                If you are located in the European Economic Area (EEA), you have certain data protection rights under the General Data Protection Regulation (GDPR), including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li>Right to access, update, or delete your information</li>
                <li>Right to rectification</li>
                <li>Right to object to processing</li>
                <li>Right to restriction of processing</li>
                <li>Right to data portability</li>
                <li>Right to withdraw consent</li>
              </ul>
            </section>

            {/* Changes to Privacy Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Changes to This Privacy Policy</h2>
              <p className="text-slate-700 mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
              <p className="text-slate-700 mb-4">
                You are advised to review this Privacy Policy periodically for any changes. Changes are effective when posted on this page.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
              <p className="text-slate-700 mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul className="list-none space-y-2 text-slate-700">
                <li><strong>Website:</strong> candidfindings.com</li>
                <li><strong>Email:</strong> hello@candidfindings.com</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}