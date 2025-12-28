import React, { useMemo } from 'react';
import { X, DollarSign, Star, Tag, SlidersHorizontal } from 'lucide-react';

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
  maxPrice
}) {
  
  // Generate price ranges dynamically based on maxPrice
  const priceRanges = useMemo(() => {
    const ranges = [
      { id: 'all', label: 'All Prices', min: 0, max: maxPrice },
      { id: 'under-25', label: 'Under $25', min: 0, max: 25 },
      { id: '25-50', label: '$25 - $50', min: 25, max: 50 },
      { id: '50-100', label: '$50 - $100', min: 50, max: 100 },
      { id: '100-200', label: '$100 - $200', min: 100, max: 200 }
    ];

    // Add dynamic high-price ranges based on maxPrice
    if (maxPrice > 200) {
      if (maxPrice <= 500) {
        ranges.push({ id: '200-plus', label: '$200+', min: 200, max: maxPrice });
      } else if (maxPrice <= 1000) {
        ranges.push({ id: '200-500', label: '$200 - $500', min: 200, max: 500 });
        ranges.push({ id: '500-plus', label: '$500+', min: 500, max: maxPrice });
      } else {
        ranges.push({ id: '200-500', label: '$200 - $500', min: 200, max: 500 });
        ranges.push({ id: '500-1000', label: '$500 - $1000', min: 500, max: 1000 });
        ranges.push({ id: '1000-plus', label: `$1000+`, min: 1000, max: maxPrice });
      }
    }

    return ranges;
  }, [maxPrice]);

  const ratingOptions = [
    { id: 'all', label: 'All Ratings', value: 0 },
    { id: '4plus', label: '4+ Stars', value: 4 },
    { id: '4.5plus', label: '4.5+ Stars', value: 4.5 }
  ];

  // Determine current price range ID from the priceRange array
  const getCurrentPriceRangeId = () => {
    if (!priceRange || priceRange.length !== 2) return 'all';
    
    const [min, max] = priceRange;
    
    // Check if it matches "All Prices"
    if (min === 0 && max >= maxPrice) return 'all';
    
    // Check each range
    for (const range of priceRanges) {
      if (range.min === min && range.max === max) {
        return range.id;
      }
    }
    
    return 'all';
  };

  const currentPriceRangeId = getCurrentPriceRangeId();

  const handlePriceRangeClick = (range) => {
    setPriceRange([range.min, range.max]);
  };

  const handleRatingClick = (option) => {
    setMinRating(option.value);
  };

  const handleBadgeToggle = (badge) => {
    if (selectedBadges.includes(badge)) {
      setSelectedBadges(selectedBadges.filter(b => b !== badge));
    } else {
      setSelectedBadges([...selectedBadges, badge]);
    }
  };

  const clearAllFilters = () => {
    setPriceRange([0, maxPrice]); // ← Use dynamic maxPrice
    setMinRating(0);
    setSelectedBadges([]);
  };

  const hasActiveFilters = 
    !(priceRange[0] === 0 && priceRange[1] >= maxPrice) ||
    minRating !== 0 ||
    selectedBadges.length > 0;

  return (
    <div className="mb-8 lg:mb-0">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="lg:hidden w-full mb-4 px-4 py-3 bg-white rounded-xl border-2 border-slate-200 font-medium text-slate-700 flex items-center justify-between hover:border-violet-300 transition-colors"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" />
          Filters
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-violet-600 text-white text-xs rounded-full">
              Active
            </span>
          )}
        </span>
        <X className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-0' : 'rotate-45'}`} />
      </button>

      {/* Filter Panel */}
      <div className={`bg-white rounded-2xl border-2 border-slate-200 p-6 space-y-6 sticky top-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
        
        {/* Header with Clear All */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </h3>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Price Range Blocks - Dynamic */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-slate-600" />
            <h4 className="font-medium text-slate-700">Price Range</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {priceRanges.map(range => (
              <button
                key={range.id}
                onClick={() => handlePriceRangeClick(range)}
                className={`px-3 py-2.5 rounded-lg font-medium transition-all text-sm ${
                  currentPriceRangeId === range.id
                    ? 'bg-violet-600 text-white shadow-md ring-2 ring-violet-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rating Blocks */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-slate-600" />
            <h4 className="font-medium text-slate-700">Minimum Rating</h4>
          </div>
          <div className="space-y-2">
            {ratingOptions.map(option => (
              <button
                key={option.id}
                onClick={() => handleRatingClick(option)}
                className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  minRating === option.value
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {option.id !== 'all' && <Star className="w-4 h-4 fill-current" />}
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Badges */}
        {availableBadges && availableBadges.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-5 h-5 text-slate-600" />
              <h4 className="font-medium text-slate-700">Features</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableBadges.map(badge => (
                <button
                  key={badge}
                  onClick={() => handleBadgeToggle(badge)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedBadges.includes(badge)
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {badge}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-700">Active filters:</span>
              {currentPriceRangeId !== 'all' && (
                <span className="block mt-1">
                  💰 {priceRanges.find(r => r.id === currentPriceRangeId)?.label}
                </span>
              )}
              {minRating > 0 && (
                <span className="block mt-1">
                  ⭐ {ratingOptions.find(r => r.value === minRating)?.label}
                </span>
              )}
              {selectedBadges.length > 0 && (
                <span className="block mt-1">
                  🏷️ {selectedBadges.length} feature{selectedBadges.length > 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}