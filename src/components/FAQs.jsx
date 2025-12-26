import React from 'react';

export default function FAQs({ blog }) {
  if (!blog?.faqs || blog.faqs.length === 0) return null;

  return (
    <div id="faqs" className="mt-12 scroll-mt-48">
      <h3 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h3>
      <div className="space-y-4">
        {blog.faqs.map((faq, index) => (
          <div 
            key={index} 
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
          >
            <h4 className="font-bold text-lg text-slate-900 mb-3 flex items-start gap-2">
              <span className="text-blue-600 flex-shrink-0">❓</span>
              {faq.question}
            </h4>
            <p className="text-slate-700 leading-relaxed pl-7">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}