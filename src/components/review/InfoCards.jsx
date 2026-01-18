import React from 'react';
import StarRating from './StarRating';

export default function InfoCards({ product }) {
  // Calculate discount
  const hasDiscount = product?.listPrice && product.listPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.listPrice - product.price) / product.listPrice) * 100)
    : 0;
  const savings = hasDiscount ? product.listPrice - product.price : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Rating Card */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 p-5 rounded-2xl">
        <div className="mb-3">
          <StarRating rating={product.rating} size={20} />
        </div>
        <div className="text-4xl font-bold text-slate-900 mb-2">{product.rating.toFixed(1)}</div>
        <div className="text-sm text-slate-600">
          {product.reviews ? (
            <>
              Based on <span className="font-semibold text-slate-900">{product.reviews.toLocaleString()}</span> reviews
            </>
          ) : (
            <span>Customer Rating</span>
          )}
        </div>
      </div>
      
      {/* Price Card */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 p-5 rounded-2xl">
        {hasDiscount ? (
          <>
            <div className="text-lg text-slate-400 line-through mb-1">
              ${product.listPrice?.toFixed(2)}
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              ${product.price?.toFixed(2)}
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
              <span>💰</span>
              <span>Save ${savings.toFixed(2)} ({discountPercent}% off)</span>
            </div>
          </>
        ) : (
          <>
            <div className="text-3xl font-bold text-slate-900 mb-2">${product.price?.toFixed(2)}</div>
            <div className="text-sm text-slate-600">Current Price</div>
          </>
        )}
        <p className="text-xs text-slate-500 mt-1">
          Price may vary on Amazon
        </p>
      </div>
    </div>
  );
}