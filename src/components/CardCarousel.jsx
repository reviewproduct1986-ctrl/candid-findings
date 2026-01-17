import React, { useState, useEffect } from 'react';

export default function CardCarousel({ asins, allProducts, offset = 0 }) {
  // Start at different index based on offset
  const [currentIndex, setCurrentIndex] = useState(offset % (asins?.length || 1));

  // Get products for this card
  const cardProducts = asins
    .map(asin => allProducts.find(p => p.asin === asin))
    .filter(Boolean); // Remove any not found

  // Auto-slide effect with offset delay
  useEffect(() => {
    if (cardProducts.length <= 1) return;

    let intervalId;
    
    // Initial delay based on offset (500ms stagger between cards)
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % cardProducts.length);
      }, 2500); // Change every 2.5 seconds
    }, offset * 500);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [cardProducts.length, offset]);

  if (cardProducts.length === 0) {
    return (
      <div className="relative h-32 bg-gradient-to-br from-blue-50 to-teal-50 rounded-t-lg flex items-center justify-center">
        <span className="text-slate-400 text-sm">No products</span>
      </div>
    );
  }

  const currentProduct = cardProducts[currentIndex];

  return (
    <div className="relative h-32 overflow-hidden bg-white rounded-t-lg">
      {/* Product Images with slide transition */}
      <div className="relative h-full">
        {cardProducts.map((product, index) => (
          <div
            key={product.asin}
            className={`absolute inset-0 flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 transition-all duration-500 ${
              index === currentIndex
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-95'
            }`}
          >
            <img
              src={product.image}
              alt={product.title}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      {cardProducts.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {cardProducts.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-blue-600 w-3'
                  : 'bg-slate-300 w-1'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}