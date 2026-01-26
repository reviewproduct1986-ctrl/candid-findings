import React from 'react';
import { ArrowUpDown, ChevronRight } from 'lucide-react';
import { slugToCategory } from '../utils/urlHelper';

export default function ResultsCountAndSort({ 
  resultsCount, 
  searchTerm, 
  selectedCategory,
  sortBy,
  onSortChange 
}) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <p className="text-slate-600">
        Showing <span className="font-semibold text-violet-600">{resultsCount}</span>{' '}
        {resultsCount === 1 ? 'product' : 'products'}
        {searchTerm && (
          <span> for "{searchTerm}"</span>
        )}
        {selectedCategory && selectedCategory !== 'All' && !searchTerm && (
          <span> in {slugToCategory(selectedCategory)}</span>
        )}
      </p>

      {/* Sort Dropdown */}
      {resultsCount > 0 && (
        <div className="flex items-center gap-2">
          <ArrowUpDown size={16} className="text-slate-500" aria-hidden="true" />
          <div className="relative">
            <label htmlFor="sort-select" className="sr-only">
              Sort products by
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="pl-3 pr-12 py-2 bg-white border-2 border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all cursor-pointer hover:border-slate-300 appearance-none"
            >
              <option value="latest">Recently Added</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviews</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Best Discount %</option>
              <option value="savings">Most Savings $</option>
            </select>
            <ChevronRight 
              size={16} 
              className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-500 pointer-events-none" 
              aria-hidden="true"
            />
          </div>
        </div>
      )}
    </div>
  );
}