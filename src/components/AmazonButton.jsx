import React, { useState } from 'react';
import { ArrowRight, QrCode, X } from 'lucide-react';
import QRCode from 'qrcode';

export default function AmazonButton({ href, children }) {
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const handleShowQR = async (e) => {
    e.preventDefault();
    
    try {
      // Generate QR code
      const dataUrl = await QRCode.toDataURL(href, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
      setQrDataUrl(dataUrl);
      setShowQR(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  return (
    <>
      <div className="flex justify-center gap-2 my-4">
        {/* View on Amazon Button */}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            // Track affiliate click in Google Analytics
            if (typeof gtag !== 'undefined') {
              gtag('event', 'affiliate_click', {
                event_category: 'Affiliate',
                event_label: 'Blog Amazon Link',
                page_from: 'blog post'
              });
            }
          }}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2.5 px-4 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-violet-200 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
        >
          <span>View on Amazon</span>
          <ArrowRight size={14} className="hover:translate-x-1 transition-transform flex-shrink-0" />
        </a>

        {/* QR Code Button - Icon Only */}
        <button
          onClick={handleShowQR}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2.5 px-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-violet-200 transition-all flex items-center justify-center"
          title="Show QR Code"
        >
          <QrCode size={18} />
        </button>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowQR(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-slate-600" />
            </button>

            {/* Header */}
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Scan to Visit on Amazon
              </h3>
              <p className="text-sm text-slate-600">
                Use your phone's camera to scan
              </p>
            </div>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-xl border-2 border-slate-200 flex justify-center">
              {qrDataUrl && (
                <img 
                  src={qrDataUrl} 
                  alt="QR Code for Amazon product"
                  className="w-64 h-64"
                />
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-500">
                Opens in Amazon mobile app or browser
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}