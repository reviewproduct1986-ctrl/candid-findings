import React from 'react';
import { ArrowRight } from 'lucide-react';
import QRButton from './QRButton';

export default function CallToAction({product, page}) {
  return (
    <div className="flex gap-2">
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
              page_from: page,
              product_category: product.category,
              product_id: product.id
            });
          }
        }}
        className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold text-sm text-center hover:shadow-lg hover:shadow-violet-200 transition-all group/btn flex items-center justify-center gap-1.5 whitespace-nowrap"
      >
        <span>View on Amazon</span>
        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform flex-shrink-0" />
      </a>

      {/* Compact QR Button - Desktop Only */}
      <QRButton
        productUrl={product.affiliate}
        productTitle={product.title}
        productId={product.id}
        productCategory={product.category}
        variant="icon"
      />
    </div>
  );
}