import React from 'react';

export default function ComingSoonCard({ post }) {
  return (
    <div className="block bg-white rounded-lg shadow-sm overflow-hidden border border-dashed border-slate-300 opacity-60">
      {/* Image */}
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        <img 
          src={post.image} 
          alt={post.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
          <span className="px-2.5 py-1 bg-slate-900/80 text-white rounded text-xs font-semibold backdrop-blur-sm">
            Coming Soon
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {post.category && (
          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium mb-1.5">
            {post.category}
          </span>
        )}
        
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          {post.title}
        </h3>
        
        <p className="text-slate-500 text-xs italic line-clamp-1">
          {post.description}
        </p>
      </div>
    </div>
  );
}