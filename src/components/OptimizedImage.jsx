import React from 'react';

export default function OptimizedImage({ 
  src, 
  alt, 
  className = '',
  priority = false,
  aspectRatio = 'square' 
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      fetchpriority={priority ? 'high' : 'auto'}
      decoding={priority ? 'sync' : 'async'}
      // Add explicit dimensions to prevent layout shift
      style={{
        aspectRatio: aspectRatio === 'square' ? '1 / 1' : '16 / 9',
        width: '100%',
        height: 'auto'
      }}
    />
  );
}