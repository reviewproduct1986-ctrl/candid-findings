import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';

export default function RelatedProducts({ products }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">You Might Also Like</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <img 
              src={product.image} 
              alt={product.title} 
              className="w-full h-48 object-cover"
              loading="lazy"
            />
            <div className="p-5">
              <h3 className="font-bold text-lg text-slate-900 mb-2">{product.title}</h3>
              <div className="mb-3">
                <StarRating rating={product.rating} size={16} showRating={true} />
              </div>
              <div className="text-2xl font-bold text-violet-600 mb-4">${product.price?.toFixed(2)}</div>
              {product.reviewUrl ? (
                <Link 
                  to={product.reviewUrl} 
                  className="block w-full bg-violet-600 text-white text-center py-2 rounded-lg hover:bg-violet-700 font-semibold"
                >
                  Read Review
                </Link>
              ) : (
                <a 
                  href={product.affiliate} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block w-full bg-slate-600 text-white text-center py-2 rounded-lg hover:bg-slate-700 font-semibold"
                >
                  View on Amazon
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}