import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function BestSelectionsBanner() {
  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            🏆 Want to see our top picks?
          </h3>
          <p className="text-sm text-slate-600">
            Check out our hand-picked favorites across all categories
          </p>
        </div>
        <Link 
          to="/best"
          className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors whitespace-nowrap"
          onClick={() => {
            if (typeof gtag !== 'undefined') {
              gtag('event', 'click_best_selections', {
                event_category: 'Navigation',
                event_label: 'Best Selections Banner'
              });
            }
          }}
        >
          <span>View Selections</span>
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}