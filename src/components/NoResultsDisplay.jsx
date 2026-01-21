import React from 'react';
import { getAmazonSearchUrl } from '../utils/affiliateConfig';

export default function NoResultsDisplay({ 
  searchTerm, 
  onClearFilters 
}) {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
      <p className="text-slate-600 mb-6">
        {searchTerm 
          ? `We don't have a review for "${searchTerm}" yet, but you can search for it on Amazon`
          : 'Try adjusting your filters or search terms'
        }
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        {/* Amazon Search Button */}
        {searchTerm && (
          <a
            href={getAmazonSearchUrl(searchTerm)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => {
              if (typeof gtag !== 'undefined') {
                gtag('event', 'amazon_fallback_search', {
                  event_category: 'Affiliate',
                  event_label: searchTerm,
                  search_term: searchTerm
                });
              }
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-200 transition-all"
          >
            <span>Search on Amazon</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
        
        {/* Clear Filters Button */}
        <button
          onClick={onClearFilters}
          className="px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
}