import React from 'react';
import PriceAlertButton from '../PriceAlertButton';
import { gtagClick } from '../../utils/googletag';
import { ShoppingCart } from 'lucide-react';
import StarRating from './StarRating';
import QRButton from '../QRButton';

export default function StickyBuyButton({ product }) {
  const hasDiscount = product?.listPrice && product.listPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.listPrice - product.price) / product.listPrice) * 100)
    : 0;

  const handleClick = () => {
    gtagClick('affiliate_click', {
      event_category: 'Affiliate',
      event_label: product.title,
      asin: product.asin,
      value: product.price,
      page_from: 'review sticky bar',
      product_category: product.category,
      product_id: product.id
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-violet-200 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src={product.image} 
              alt={product.title} 
              className="w-16 h-16 rounded-lg object-cover"
              loading="lazy"
            />
            <div>
              <div className="font-bold text-slate-900 text-sm">{product.title}</div>
              <div className="flex items-center gap-2">
                <StarRating rating={product.rating} size={14} />
                <span className="text-sm text-slate-600">{product.rating.toFixed(1)}</span>
                {hasDiscount ? (
                  <>
                    <span className="text-sm text-slate-400 line-through">${product.listPrice?.toFixed(2)}</span>
                    <span className="text-lg font-bold text-green-600">${product.price?.toFixed(2)}</span>
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      {discountPercent}% off
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-violet-600">${product.price?.toFixed(2)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href={product.affiliate}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              className="flex-shrink-0 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 px-8 rounded-xl font-bold text-base hover:shadow-lg transition-all flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              View on Amazon
            </a>
            <QRButton
              productUrl={product.affiliate}
              productTitle={product.title}
              productId={product.id}
              productCategory={product.category}
              variant="sticky"
            />
            <PriceAlertButton product={product} className="flex-1" />
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex flex-col items-center gap-2">
          <a
            href={product.affiliate}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-bold text-base hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <ShoppingCart size={20} />
            View on Amazon
          </a>
          <PriceAlertButton product={product} className="w-full" />
        </div>


        <p className="text-[10px] text-slate-400 text-center mt-2">
          As an Amazon Associate we earn from qualifying purchases
        </p>
      </div>
    </div>
  );
}