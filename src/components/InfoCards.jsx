import React from 'react';
import { Star, Clock } from 'lucide-react';

export default function InfoCards({ product }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      {/* Rating Card */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
        <div className="flex items-center gap-2 mb-2">
          <Star className="text-amber-500 fill-amber-500" size={20} />
          <span className="text-sm font-semibold text-amber-900">Rating</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900">{product.rating}</span>
          <span className="text-sm text-slate-600">/ 5.0</span>
        </div>
        <p className="text-xs text-slate-600 mt-2">
          {product.reviews.toLocaleString()} verified reviews
        </p>
      </div>

      {/* Price Card */}
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-5 border border-violet-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-violet-900">Current Price</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-violet-600">${product.price}</span>
        </div>
        <p className="text-xs text-slate-600 mt-2">
          Price may vary on Amazon
        </p>
      </div>

      {/* Last Updated Card */}
      {product.lastUpdated && (
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-slate-600" size={18} />
            <span className="text-sm font-semibold text-slate-900">Last Updated</span>
          </div>
          <div className="text-base font-semibold text-slate-900">
            {new Date(product.lastUpdated).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Fresh & current info
          </p>
        </div>
      )}
    </div>
  );
}