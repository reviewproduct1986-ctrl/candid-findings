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
  availableBadges
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
        
        ${showFilters 
          ? 'block fixed bottom-0 left-0 right-0 z-50 lg:relative rounded-b-none lg:rounded-2xl max-h-[85vh] lg:max-h-[calc(100vh-8rem)] shadow-2xl lg:shadow-none' 
          : 'hidden lg:block'
        }
      `}
      style={showFilters ? {
        animation: 'slideUp 0.3s ease-out'
      } : undefined}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Filter size={20} className="text-violet-600" />
            Filters
          </h3>
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
                    left: `${(priceRange[0] / 500) * 100}%`,
                    right: `${100 - (priceRange[1] / 500) * 100}%`
                  }}
                ></div>
                
                {/* Min Slider */}
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange[0]}
                  onChange={(e) => {
                    const newMin = parseInt(e.target.value);
                    if (newMin <= priceRange[1]) {
                      setPriceRange([newMin, priceRange[1]]);
                    }
                  }}
                  style={{ zIndex: priceRange[0] > priceRange[1] - 50 ? 5 : 3 }}
                />
                
                {/* Max Slider */}
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange[1]}
                  onChange={(e) => {
                    const newMax = parseInt(e.target.value);
                    if (newMax >= priceRange[0]) {
                      setPriceRange([priceRange[0], newMax]);
                    }
                  }}
                  style={{ zIndex: 4 }}
                />
              </div>
              
              {/* Price Range Display */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-violet-600">
                  ${priceRange[0]} - ${priceRange[1]}
                </span>
                {(priceRange[0] !== 0 || priceRange[1] !== 500) && (
                  <button
                    onClick={() => setPriceRange([0, 500])}
                    className="text-xs text-slate-500 hover:text-violet-600 transition-colors underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="pb-6 border-b border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Minimum Rating
            </label>
            <div className="flex gap-2">
              {[0, 3, 4, 4.5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    minRating === rating
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {rating === 0 ? 'All' : `${rating}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Badge Filter */}
          {availableBadges.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableBadges.map((badge) => (
                  <button
                    key={badge}
                    onClick={() => toggleBadge(badge)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedBadges.includes(badge)
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {badge}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {(minRating > 0 || priceRange[1] < 500 || selectedBadges.length > 0) && (
            <button
              onClick={() => {
                setMinRating(0);
                setPriceRange([0, 500]);
                setSelectedBadges([]);
              }}
              className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>
    </>
  );
}