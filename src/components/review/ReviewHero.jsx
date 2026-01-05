import React from 'react';
import InfoCards from './InfoCards';

export default function ReviewHero({ product, blog, hasDiscount, savings, discountPercent, formatDate }) {
  return (
    <div className="mb-8">
      {/* Badges */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="px-4 py-1.5 bg-violet-100 text-violet-700 text-sm font-bold rounded-full">
          {product.category}
        </span>
        {product.badge && (
          <span className="px-4 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold rounded-full">
            {product.badge}
          </span>
        )}
      </div>
      
      {/* Title */}
      <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-3 leading-tight">
        {product.title} Review
      </h1> 

      {/* Date */}
      <p className="text-sm text-slate-500 mb-6">
        Last updated {formatDate(blog.publishedDate)}
      </p>
      
      {/* Info Cards */}
      <InfoCards 
        product={product}
        hasDiscount={hasDiscount}
        savings={savings}
        discountPercent={discountPercent}
      />
    </div>
  );
}