import React from 'react';
import { Star, ArrowRight, Sparkles } from 'lucide-react';
import PreloadLink from './PreloadLink';

export default function ProductCard({ product, index }) {
  // Calculate discount percentage if listPrice exists and is higher
  const hasDiscount = product.listPrice && product.listPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.listPrice - product.price) / product.listPrice) * 100)
    : 0;

  return (
    <div
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-violet-200 flex flex-col h-full"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Product Image - Fixed aspect ratio */}
      <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0">
        <img
          src={product.image}
          alt={`${product.title} - ${product.category} - ${product.rating} Stars - $${product.price?.toFixed(2)}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading={index < 3 ? "eager" : "lazy"}
          fetchpriority={index < 3 ? "high" : "auto"}
        />
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
            Save {discountPercent}%
          </div>
        )}
        
        {/* Badge */}
        {product.badge && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
            {product.badge}
          </div>
        )}
      </div>

      {/* Product Info - Flexible height with proper spacing */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Category */}
        <div className="inline-block px-3 py-1 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full mb-3 self-start">
          {product.category}
        </div>

        {/* Title - Fixed height with line clamp */}
        <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-violet-600 transition-colors">
          {product.title}
        </h3>

        {/* Rating - Fixed height */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
              />
            ))}
          </div>
          <span className="text-xs text-slate-600 font-medium">
            {product.rating} • {product.reviews.toLocaleString()} reviews
          </span>
        </div>

        {/* Price - Fixed minimum height with discount support */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-1 min-h-[2.5rem] flex-wrap">
            {hasDiscount && (
              <p className="text-lg text-slate-400 line-through">
                ${product.listPrice?.toFixed(2)}
              </p>
            )}
            <p className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              ${product.price?.toFixed(2)}
            </p>
            {hasDiscount && (
              <span className="text-sm font-semibold text-green-600 whitespace-nowrap">
                Save ${(product.listPrice - product.price).toFixed(2)}
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500">
            Price may vary on Amazon
          </p>
        </div>

        {/* Action Buttons - Push to bottom with mt-auto */}
        <div className="mt-auto flex flex-col gap-2">
          {/* View on Amazon Button */}
          <a
            href={product.affiliate}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              // Track affiliate click in Google Analytics
              if (typeof gtag !== 'undefined') {
                gtag('event', 'affiliate_click', {
                  event_category: 'Affiliate',
                  event_label: product.title,
                  value: product.price,
                  product_category: product.category,
                  product_id: product.id
                });
              }
            }}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2.5 px-3 rounded-xl font-semibold text-sm text-center hover:shadow-lg hover:shadow-violet-200 transition-all group/btn flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span>View on Amazon</span>
            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform flex-shrink-0" />
          </a>

          {/* Read Review Button */}
          {product.reviewUrl ? (
            <PreloadLink
              to={product.reviewUrl}
              className="w-full bg-white text-violet-600 py-2.5 px-3 rounded-xl font-semibold text-sm hover:bg-violet-50 transition-all border-2 border-violet-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="View Detailed Review"
            >
              <Sparkles size={14} className="flex-shrink-0" />
              <span>Review</span>
            </PreloadLink>
          ) : (
            <div className="w-full bg-gray-100 text-gray-400 py-2.5 px-3 rounded-xl font-semibold text-sm border-2 border-gray-200 flex items-center justify-center gap-1.5 whitespace-nowrap">
              <Sparkles size={14} className="flex-shrink-0" />
              <span>No Review</span>
            </div>
          )}
          
          {/* Amazon Affiliate Disclosure */}
          <p className="text-[10px] text-slate-400 text-center mt-2 leading-tight">
            As an Amazon Associate we earn from qualifying purchases
          </p>
        </div>
      </div>
    </div>
  );
}