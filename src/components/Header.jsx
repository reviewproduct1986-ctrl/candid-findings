import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';

export default function Header({ 
  searchTerm, 
  setSearchTerm, 
  categories, 
  selectedCategory, 
  setSelectedCategory 
}) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[60px]">
        {/* Logo and Search - Compact on desktop, comfortable on mobile */}
        <div className="flex items-center justify-between py-3 lg:py-2.5 gap-3 lg:gap-4">
          {/* Clickable Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 flex-shrink-0 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded-lg"
            aria-label="Go to homepage"
          >
            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 group-active:scale-95">
              <Sparkles className="text-white" size={18} />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-slate-900 text-base lg:text-lg leading-tight group-hover:text-violet-600 transition-colors">
                CandidFindings
              </h1>
              <p className="text-xs text-slate-500 leading-tight">Honest Recommendations</p>
            </div>
          </Link>

          {/* Search Bar - Shows "search" button on mobile keyboard */}
          <form 
            onSubmit={(e) => {
              console.log(1);
              e.preventDefault();
              document.activeElement.blur();
            }}
            className="flex-1 max-w-xl relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-600 pointer-events-none" size={20} />
            <input
              type="text"
              enterKeyHint="search"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all shadow-sm hover:border-slate-300 hover:shadow-md"
            />
            
            {/* Clear button - only shows when there's text */}
            {searchTerm && (
              <button
                type='button'
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </form>
        </div>

        {/* Category Tabs - More padding between buttons */}
        <div className="relative pb-3 lg:pb-2.5">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 pb-2 
                          scrollbar-thin scrollbar-thumb-violet-300 scrollbar-track-transparent
                          hover:scrollbar-thumb-violet-400
                          lg:scrollbar-none lg:px-0 lg:pb-0 lg:gap-2.5">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-5 py-2.5 lg:px-4 lg:py-2 rounded-lg font-medium whitespace-nowrap 
                  transition-all text-sm snap-start
                  min-w-fit touch-manipulation
                  ${selectedCategory === category
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300'
                  }
                `}
              >
                {category}
              </button>
            ))}
            {/* Extra padding at the end for breathing room */}
            <div className="w-4 lg:hidden flex-shrink-0" aria-hidden="true" />
          </div>
        </div>
      </div>
    </header>
  );
}