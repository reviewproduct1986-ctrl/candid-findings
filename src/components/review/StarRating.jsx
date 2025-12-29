import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating, size = 20, showRating = false, className = "" }) {
  // More precise calculation:
  // 0.00-0.24 → empty star
  // 0.25-0.74 → half star
  // 0.75-0.99 → full star (rounds up)
  
  const fullStars = Math.floor(rating);
  const decimal = rating - fullStars;
  
  // Determine if we need a half star or if it rounds up to full
  const needsHalfStar = decimal >= 0.25 && decimal < 0.75;
  const roundsUpToFull = decimal >= 0.75;
  
  const displayFullStars = roundsUpToFull ? fullStars + 1 : fullStars;
  const emptyStars = 5 - displayFullStars - (needsHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Full stars */}
      {[...Array(displayFullStars)].map((_, i) => (
        <Star 
          key={`full-${i}`}
          size={size}
          className="fill-amber-400 text-amber-400"
        />
      ))}
      
      {/* Half star */}
      {needsHalfStar && (
        <div className="relative" style={{ width: size, height: size }}>
          {/* Background empty star */}
          <Star 
            size={size}
            className="text-slate-300 absolute top-0 left-0"
          />
          {/* Foreground half-filled star (clip at 50%) */}
          <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${size * 0.5}px` }}>
            <Star 
              size={size}
              className="fill-amber-400 text-amber-400"
            />
          </div>
        </div>
      )}
      
      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <Star 
          key={`empty-${i}`}
          size={size}
          className="text-slate-300"
        />
      ))}
      
      {/* Optional rating number */}
      {showRating && (
        <span className="ml-1 text-sm font-semibold text-slate-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}