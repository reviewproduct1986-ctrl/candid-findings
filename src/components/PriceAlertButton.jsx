import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Loader2, Percent, Clock, Mail } from 'lucide-react';

export default function PriceAlertButton({ product }) {
  const [isOpen, setIsOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    percentage: 20,
    duration: 2,
    email: ''
  });
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  // Load saved email from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('priceAlertEmail');
    if (savedEmail) {
      setAlertConfig(prev => ({ ...prev, email: savedEmail }));
    }
  }, []);

  const getCurrentPrice = () => {
    try {
      if (!product || !product.price) return 0;
      if (typeof product.price === 'number') return product.price;
      if (typeof product.price === 'string') {
        const parsed = parseFloat(product.price.replace(/[$,]/g, ''));
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    } catch {
      return 0;
    }
  };

  const currentPrice = getCurrentPrice();

  const getTargetPrice = () => {
    return currentPrice * (1 - alertConfig.percentage / 100);
  };

  const targetPrice = getTargetPrice();
  const savings = currentPrice - targetPrice;

  const percentageOptions = [
    { value: 10, label: '10%', popular: false },
    { value: 20, label: '20%', popular: true },
    { value: 30, label: '30%', popular: true },
    { value: 40, label: '40%', popular: false },
    { value: 50, label: '50%', popular: false }
  ];

  const durationOptions = [
    { value: 1, label: '1mo' },
    { value: 2, label: '2mo' },
    { value: 3, label: '3mo' },
    { value: 6, label: '6mo' }
  ];

  const handleSubmit = async () => {
    setStatus('loading');
    setMessage('');

    if (!alertConfig.email) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(alertConfig.email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    // Save email to localStorage for next time
    localStorage.setItem('priceAlertEmail', alertConfig.email);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + alertConfig.duration);

      const response = await fetch(`${API_URL}/api/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          asin: product.asin,
          productName: product.name,
          productImage: product.image,
          currentPrice: currentPrice,
          targetPrice: targetPrice,
          email: alertConfig.email,
          notificationMethod: 'email',
          expiresAt: expiresAt
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(`Alert set! We'll email you when the price drops ${alertConfig.percentage}%`);
        
        setTimeout(() => {
          setIsOpen(false);
          setStatus('idle');
          setMessage('');
          // Reset but keep email
          setAlertConfig(prev => ({
            percentage: 20,
            duration: 2,
            email: prev.email
          }));
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to create alert');
      }
    } catch (error) {
      console.error('Price alert error:', error);
      setStatus('error');
      setMessage('Unable to connect. Please try again later.');
    }
  };

  if (currentPrice === 0) {
    return null;
  }

  return (
    <>
      {/* Alert Button - Centered, matching other buttons */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 px-6 bg-white border-2 border-violet-600 text-violet-600 rounded-lg font-semibold hover:bg-violet-50 transition-all flex items-center justify-center gap-2"
      >
        <Bell size={20} />
        <span>Set Price Alert</span>
      </button>

      {/* Modal - Simplified Header */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Simplified Header - No redundant text */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex-1">
                <h2 className="text-base font-semibold text-slate-900 truncate pr-8">
                  {product.name}
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              {/* Current Price */}
              <div className="bg-slate-50 rounded-lg p-3 mb-4 flex justify-between items-center">
                <span className="text-sm text-slate-600 font-medium">Current Price:</span>
                <span className="text-2xl font-bold text-slate-900">${currentPrice.toFixed(2)}</span>
              </div>

              {/* Price Drop Percentage */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Percent size={16} className="text-violet-600" />
                  <label className="text-sm font-bold text-slate-900">
                    Notify when price drops by:
                  </label>
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                  {percentageOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setAlertConfig(prev => ({ 
                        ...prev, 
                        percentage: option.value 
                      }))}
                      className={`relative px-2 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all ${
                        alertConfig.percentage === option.value
                          ? 'border-violet-600 bg-violet-50 text-violet-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-violet-200'
                      }`}
                    >
                      {option.popular && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                      <div className="text-base">{option.value}%</div>
                      <div className="text-[10px] text-slate-500 leading-none mt-0.5">
                        ${(currentPrice * (1 - option.value / 100)).toFixed(0)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Clock size={16} className="text-violet-600" />
                  <label className="text-sm font-bold text-slate-900">
                    Check for:
                  </label>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {durationOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setAlertConfig(prev => ({ 
                        ...prev, 
                        duration: option.value 
                      }))}
                      className={`px-2 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                        alertConfig.duration === option.value
                          ? 'border-violet-600 bg-violet-50 text-violet-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-violet-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600">Target price:</p>
                    <p className="text-xl font-bold text-green-700">
                      ${targetPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-green-600">You save:</p>
                    <p className="text-lg font-bold text-green-700">
                      ${savings.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Input */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Mail size={16} className="text-violet-600" />
                  <label className="text-sm font-bold text-slate-900">
                    Your Email:
                  </label>
                </div>
                <input
                  type="email"
                  value={alertConfig.email}
                  onChange={(e) => setAlertConfig(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  We'll email you once when the price drops
                </p>
              </div>

              {/* Status Messages */}
              {status === 'success' && (
                <div className="flex items-start gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-2.5 mb-4">
                  <Check size={16} className="flex-shrink-0 mt-0.5" />
                  <span className="text-xs">{message}</span>
                </div>
              )}

              {status === 'error' && (
                <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5 mb-4">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span className="text-xs">{message}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={status === 'loading'}
                className="w-full py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">Creating Alert...</span>
                  </>
                ) : (
                  <>
                    <Bell size={16} />
                    <span className="text-sm">Set Price Alert</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}