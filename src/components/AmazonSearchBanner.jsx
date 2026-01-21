import React from 'react';
import { getAmazonSearchUrl } from '../utils/affiliateConfig';

export default function AmazonSearchBanner({ searchTerm, resultsCount }) {
  if (!searchTerm || resultsCount === 0) return null;

  return (
    <div className="mb-6 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="text-slate-700 font-medium">
            Looking for more options for "<span className="text-violet-600 font-semibold">{searchTerm}</span>"?
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Browse thousands more on Amazon
          </p>
        </div>
        <a
          href={getAmazonSearchUrl(searchTerm)}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => {
            if (typeof gtag !== 'undefined') {
              gtag('event', 'amazon_search_from_results', {
                event_category: 'Affiliate',
                event_label: searchTerm,
                search_term: searchTerm,
                results_count: resultsCount
              });
            }
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-200 transition-all whitespace-nowrap"
        >
          <span>Search on Amazon</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}