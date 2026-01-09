import React from 'react';

export default function ProductSkeleton() {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col">
      {/* Image placeholder - THIS WILL BE YOUR LCP! */}
      <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-slate-200 to-slate-300">
        <div className="w-full h-full animate-pulse bg-slate-300" />
      </div>
      
      {/* Content placeholders */}
      <div className="p-6 flex flex-col flex-1 space-y-4">
        {/* Category badge */}
        <div className="h-8 bg-slate-200 rounded-full w-24 animate-pulse"></div>
        
        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 bg-slate-200 rounded w-full animate-pulse"></div>
          <div className="h-5 bg-slate-200 rounded w-3/4 animate-pulse"></div>
        </div>
        
        {/* Rating */}
        <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
        
        {/* Price */}
        <div className="space-y-2 flex-1">
          <div className="h-10 bg-slate-200 rounded w-32 animate-pulse"></div>
          <div className="h-3 bg-slate-200 rounded w-40 animate-pulse"></div>
        </div>
        
        {/* Buttons */}
        <div className="space-y-2 mt-auto">
          <div className="h-12 bg-slate-200 rounded-xl animate-pulse"></div>
          <div className="h-12 bg-slate-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}