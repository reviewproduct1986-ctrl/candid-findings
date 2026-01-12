import React, { useState } from 'react';
import { QrCode } from 'lucide-react';
import QRCodeModal from './QRCodeModal';

export default function QRButton({ productUrl, productTitle, productId, productCategory, variant = 'default' }) {
  const [showQRModal, setShowQRModal] = useState(false);

  const handleQRClick = () => {
    setShowQRModal(true);
    if (typeof gtag !== 'undefined') {
      gtag('event', 'qr_code_opened', {
        event_category: 'Cross_Device',
        event_label: productTitle,
        product_category: productCategory,
        product_id: productId
      });
    }
  };

  // Larger, easier-to-click variants
  const variants = {
    icon: 'w-11 h-11 bg-transparent border-2 border-violet-300 text-violet-600 hover:bg-violet-50',
    card: 'w-12 h-12 bg-white border-2 border-violet-200 text-violet-600 hover:border-violet-300 hover:bg-violet-50',
    sticky: 'w-14 h-14 bg-violet-50 border-2 border-violet-300 text-violet-700 hover:bg-violet-100'
  };

  const iconSizes = {
    icon: 20,
    card: 22,
    sticky: 24
  };

  return (
    <>
      <button
        onClick={handleQRClick}
        aria-label="Scan QR code"
        title="Open on phone"
        className={`hidden md:flex items-center justify-center ${variants[variant]} rounded-xl transition-all group flex-shrink-0`}
      >
        <QrCode size={iconSizes[variant]} className="group-hover:scale-110 transition-transform" />
      </button>

      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        productUrl={productUrl}
        productTitle={productTitle}
      />
    </>
  );
}