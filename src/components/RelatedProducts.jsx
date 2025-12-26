import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';

export default function RelatedProducts({ relatedProducts }) {
  if (!relatedProducts || relatedProducts.length === 0) return null;

  return (
    <div className="mt-12 bg-white rounded-3xl shadow-xl p-6 md:p-12">
      <h2 className="text-3xl font-bold text-slate-900 mb-6">Related Products You Might Like</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedProducts.map((relatedProduct) => (
          relatedProduct.reviewUrl && (
            <Link 
              to={relatedProduct.reviewUrl}
              key={relatedProduct.id}
              className="group bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-5 border-2 border-slate-200 hover:border-violet-400 hover:shadow-xl transition-all"
            >
              {/* Product Image */}
              <div className="aspect-square mb-4 overflow-hidden rounded-xl bg-white">
                <img 
                  src={relatedProduct.image} 
                  alt={relatedProduct.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              {/* Product Info */}
              <h3 className="font-bold text-slate-900 mb-2 group-hover:text-violet-600 transition-colors line-clamp-2">
                {relatedProduct.title}
              </h3>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="text-amber-400 fill-amber-400" size={16} />
                  <span className="font-semibold text-slate-900">{relatedProduct.rating}</span>
                </div>
                <span className="text-sm text-slate-500">
                  ({relatedProduct.reviews.toLocaleString()})
                </span>
              </div>
              
              {/* Price */}
              <div className="text-2xl font-bold text-violet-600 mb-4">
                ${relatedProduct.price}
              </div>
              
              {/* Read Review Link */}
              <div className="flex items-center gap-2 text-violet-600 font-semibold group-hover:gap-3 transition-all">
                Read Review <ArrowRight size={14} />
              </div>
            </Link>
          )
        ))}
      </div>
    </div>
  );
}