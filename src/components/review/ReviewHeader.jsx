import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function ReviewHeader() {
  return (
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
  );
}