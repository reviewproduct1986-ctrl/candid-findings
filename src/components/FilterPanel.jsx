import React from 'react';
import { Filter, X } from 'lucide-react';

export default function FilterPanel({
  showFilters,
  setShowFilters,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  selectedBadges,
  setSelectedBadges,
  availableBadges,
  maxPrice = 500 // Default to 500 if not provided
}) {
  const toggleBadge = (badge) => {
    setSelectedBadges(prev =>
      prev.includes(badge)
        ? prev.filter(b => b !== badge)
        : [...prev, badge]
    );
  };

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-violet-200 rounded-xl font-semibold text-violet-600 hover:bg-violet-50 transition-all"
        >
          <Filter size={18} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {showFilters && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setShowFilters(false)}
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        />
      )}

      {/* Filter Panel */}
      <div className={`
        lg:block lg:sticky lg:top-24 
        bg-white rounded-2xl border border-slate-200 p-6 
        max-h-[calc(100vh-8rem)] overflow-y-auto
        
        ${showFilters ? 'fixed inset-x-4 top-24 bottom-24 z-50 lg:relative lg:inset-auto' : 'hidden'}
      `}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Filter size={20} className="text-violet-600" />
            Filters
          </h3>
          
          {/* Mobile Close Button */}
          {showFilters && (
            <button
              onClick={() => setShowFilters(false)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close filters"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Price Range */}
          <div className="pb-6 border-b border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Price Range
            </label>
            <div className="space-y-3">
              {/* Dual Range Slider Container */}
              <div className="range-slider relative pt-2 pb-6">
                {/* Range Track Background */}
                <div className="absolute w-full h-2 bg-slate-200 rounded-lg top-2"></div>
                
                {/* Active Range Highlight */}
                <div 
                  className="absolute h-2 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg top-2"
                  style={{
                    left: `${(priceRange[0] / maxPrice) * 100}%`,
                    right: `${100 - (priceRange[1] / maxPrice) * 100}%`
                  }}
                ></div>
                
                {/* Min Slider */}
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  aria-label="Minimum price"
                  value={priceRange[0]}
                  onChange={(e) => {
                    const newMin = parseInt(e.target.value);
                    if (newMin <= priceRange[1]) {
                      setPriceRange([newMin, priceRange[1]]);
                    }
                  }}
                  className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-violet-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
                  style={{ zIndex: priceRange[0] > priceRange[1] - 50 ? 5 : 3 }}
                />
                
                {/* Max Slider */}
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  aria-label="Maximum price"
                  value={priceRange[1]}
                  onChange={(e) => {
                    const newMax = parseInt(e.target.value);
                    if (newMax >= priceRange[0]) {
                      setPriceRange([priceRange[0], newMax]);
                    }
                  }}
                  className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-violet-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
                  style={{ zIndex: 4 }}
                />
              </div>
              
              {/* Price Range Display */}
              <div className="flex items-center justify-between text-sm">
                <div className="px-3 py-2 bg-slate-100 rounded-lg font-medium text-slate-700">
                  ${priceRange[0]}
                </div>
                <div className="text-slate-400">—</div>
                <div className="px-3 py-2 bg-slate-100 rounded-lg font-medium text-slate-700">
                  ${priceRange[1]}
                </div>
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="pb-6 border-b border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Minimum Rating
            </label>
            <div className="space-y-2">
              {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === rating}
                    onChange={() => setMinRating(rating)}
                    className="w-4 h-4 text-violet-600 focus:ring-violet-500"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-slate-700 group-hover:text-violet-600 transition-colors">
                      {rating}+
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </label>
              ))}
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === 0}
                  onChange={() => setMinRating(0)}
                  className="w-4 h-4 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-sm text-slate-700 group-hover:text-violet-600 transition-colors">
                  All Ratings
                </span>
              </label>
            </div>
          </div>

          {/* Badge Filter */}
          {availableBadges.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Special Badges
              </label>
              <div className="space-y-2">
                {availableBadges.map((badge) => (
                  <label key={badge} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedBadges.includes(badge)}
                      onChange={() => toggleBadge(badge)}
                      className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                    />
                    <span className="text-sm px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium group-hover:bg-amber-200 transition-colors">
                      {badge}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={() => {
            setPriceRange([0, maxPrice]);
            setMinRating(0);
            setSelectedBadges([]);
          }}
          className="w-full mt-6 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    </>
  );
}