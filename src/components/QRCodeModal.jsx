import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import QRCode from 'qrcode';

export default function QRCodeModal({ isOpen, onClose, productUrl, productTitle }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      // Generate QR code on canvas
      QRCode.toCanvas(
        canvasRef.current,
        productUrl,
        {
          width: 200,
          margin: 1,
          color: {
            dark: '#000',  // slate-900
            light: '#fff'  // white
          }
        },
        (error) => {
          if (error) console.error('QR Code generation error:', error);
        }
      );
    }
  }, [isOpen, productUrl]);

  // Reset copied state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    
    // Track copy action
    if (typeof gtag !== 'undefined') {
      gtag('event', 'qr_link_copied', {
        event_category: 'Cross_Device',
        event_label: productTitle
      });
    }
    
    // Reset after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl p-4 max-w-xs w-full shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="text-center">
          <p className="text-sm font-bold text-slate-900 mb-3">📱 Open on Your Phone</p>
          
          {/* QR Code */}
          <div className="bg-white border border-slate-200 rounded-lg p-2 mb-3 flex items-center justify-center">
            <canvas 
              ref={canvasRef}
              className="max-w-full h-auto"
            />
          </div>

          {/* Instructions */}
          <div className="mb-3">
            <p className="text-xs text-slate-600 mb-1 line-clamp-1 font-medium">
              {productTitle}
            </p>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Scan with your camera to open in Amazon app
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[10px] text-slate-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Copy Link Section */}
          <div className="mb-2">
            <p className="text-[10px] text-slate-600 mb-2 leading-relaxed">
              Copy the link and paste it in your phone's browser or Amazon app
            </p>
            <button
              onClick={handleCopy}
              className={`w-full py-2.5 text-xs font-semibold rounded-lg transition-all ${
                copied 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-violet-100 text-violet-700 hover:bg-violet-200 border border-transparent'
              }`}
            >
              {copied ? (
                <span className="flex items-center justify-center gap-1">
                  <span>✓</span>
                  <span>Copied!</span>
                </span>
              ) : (
                'Copy Link'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}