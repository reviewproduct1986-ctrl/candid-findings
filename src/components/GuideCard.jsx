import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import CardCarousel from './CardCarousel';
import { formatCardDate } from '../utils/dateFormat';

export default function GuideCard({ post, products, offset }) {
  const asins = post.products.map(item => item.asin);
  const productCount = Object.keys(products).length;

  return (
    <Link
      to={`/best/${post.slug}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-slate-200 hover:border-blue-300"
    >
      {/* Product Carousel */}
      <CardCarousel 
        asins={asins || []} 
        allProducts={products}
        offset={offset}
      />

      {/* Content */}
      <div className="p-3">
        {post.category && (
          <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium mb-1.5">
            {post.category}
          </span>
        )}
        
        <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-slate-600 text-xs mb-2 line-clamp-1">
          {post.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {post.publishedDate && (
            <>
              <div className="flex items-center gap-1">
                <Calendar size={10} />
                <span>{formatCardDate(post.publishedDate)}</span>
              </div>
              {(productCount > 0 || post.estimatedReadTime)}
            </>
          )}
          {post.estimatedReadTime && (
            <span>• {post.estimatedReadTime}</span>
          )}
        </div>
      </div>
    </Link>
  );
}