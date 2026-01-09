import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import PreloadLink from './PreloadLink';
import StarRating from './review/StarRating';
import '../css/ProductCard.css';

export default function ProductCard({ product, index }) {
  return (
    <div
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-violet-200 flex flex-col"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-slate-100 to-slate-200">
        <img
          src={product.image}
          alt={`${product.title} - ${product.category} - ${product.rating} Stars - $${product.price}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading={index < 3 ? "eager" : "lazy"}
          fetchpriority={index < 3 ? "high" : "auto"}
        />
        
        {/* Discount Badge - Top Left Corner (matches screenshot) */}
        {product.listPrice && product.listPrice > product.price && (
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg z-10">
            Save {Math.round(((product.listPrice - product.price) / product.listPrice) * 100)}%
          </div>
        )}
        
        {/* Badge - Top Right Corner */}
        {product.badge && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
            {product.badge}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6 flex flex-col flex-1">
        {/* Category Badge */}
        <PreloadLink
          to={`/?category=${encodeURIComponent(product.category)}`}
          className="category-badge"
          title={`View all ${product.category} products`}
        >
          {product.category}
        </PreloadLink>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2 group-hover:text-violet-600 transition-colors">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-3 mb-4">
          <StarRating rating={product.rating} size={14} />
          <span className="text-xs text-slate-600 font-medium">
            {product.rating.toFixed(1)} • {product.reviews.toLocaleString()} reviews
          </span>
        </div>

        {/* Price - Fixed height for alignment */}
        <div className="mb-6 min-h-[80px]">
          {product.listPrice && product.listPrice > product.price ? (
            // Discount Display
            <>
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-base text-slate-500 line-through">
                  ${product.listPrice.toFixed(2)}
                </p>
                <p className="text-3xl font-bold text-violet-600">
                  ${product.price.toFixed(2)}
                </p>
              </div>
              <p className="text-sm text-green-600 font-semibold mb-1">
                Save ${(product.listPrice - product.price).toFixed(2)}
              </p>
            </>
          ) : (
            // Regular Price
            <div className="flex items-baseline gap-2 mb-1">
              <p className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                ${product.price.toFixed(2)}
              </p>
            </div>
          )}
          <p className="text-[10px] text-slate-500">
            Price may vary on Amazon
          </p>
        </div>

        {/* Action Buttons - Pushed to bottom */}
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
            <div className="w-full bg-gray-100 text-gray-600 py-2.5 px-3 rounded-xl font-semibold text-sm border-2 border-gray-200 flex items-center justify-center gap-1.5 whitespace-nowrap">
              <Sparkles size={14} className="flex-shrink-0" />
              <span>No Review</span>
            </div>
          )}
          
          {/* Amazon Affiliate Disclosure */}
          <p className="text-[10px] text-slate-600 text-center mt-2 leading-tight">
            As an Amazon Associate we earn from qualifying purchases
          </p>
        </div>
      </div>
    </div>
  );
}