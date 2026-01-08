import React, { useState, useEffect } from 'react';
import { Bell, Check, AlertCircle, Loader2, Percent, Clock, MessageCircle } from 'lucide-react';

export default function PriceAlertButton({ product, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    percentage: 0,  // Default to "Any" - most users want any price drop
    duration: 2,
    phone: ''
  });
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [lastSubmitted, setLastSubmitted] = useState({ percentage: null, duration: null });

  // Load saved phone from localStorage on mount
  useEffect(() => {
    const savedPhone = localStorage.getItem('priceAlertPhone');
    if (savedPhone) {
      setAlertConfig(prev => ({ ...prev, phone: savedPhone }));
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
    { value: 0, label: 'Any', subLabel: 'Any drop' },
    { value: 10, label: '10%' },
    { value: 20, label: '20%' },
    { value: 50, label: '50%' }
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

    if (!alertConfig.phone) {
      setStatus('error');
      setMessage('Please enter your phone number');
      return;
    }

    // Basic phone validation (10+ digits)
    const phoneDigits = alertConfig.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setStatus('error');
      setMessage('Please enter a valid phone number');
      return;
    }

    // Format phone to E.164 format for backend
    const formattedPhone = phoneDigits.startsWith('1') 
      ? `+${phoneDigits}` 
      : `+1${phoneDigits}`;

    // Save phone to localStorage for next time
    localStorage.setItem('priceAlertPhone', alertConfig.phone);

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
          phone: formattedPhone,
          notificationMethod: 'sms',
          expiresAt: expiresAt
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        
        // Save what was just submitted
        setLastSubmitted({
          percentage: alertConfig.percentage,
          duration: alertConfig.duration
        });
        
        // Check if alert was updated or created
        if (data.updated) {
          if (alertConfig.percentage === 0) {
            setMessage(`Alert updated! We'll text you when there's any price drop`);
          } else {
            setMessage(`Alert updated! We'll text you when the price drops to $${targetPrice.toFixed(2)}`);
          }
        } else {
          if (alertConfig.percentage === 0) {
            setMessage(`Alert set! We'll text you when there's any price drop`);
          } else {
            setMessage(`Alert set! We'll text you when the price drops ${alertConfig.percentage}%`);
          }
        }
        
        // Don't reset form - keep values so user can adjust from current state
        // Phone is already preserved
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
      {/* Alert Button - Accepts custom className from parent */}
      <button
        onClick={() => setIsOpen(true)}
        className={`w-full py-3 px-6 bg-white border border-violet-600 text-violet-600 rounded-xl font-semibold hover:bg-violet-50 transition-all flex items-center justify-center gap-2 whitespace-nowrap ${className}`}
      >
        <Bell size={18} />
        <span>Price Alert</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setIsOpen(false);
            setStatus('idle');
            setMessage('');
            setLastSubmitted({ percentage: null, duration: null });
            setAlertConfig(prev => ({
              percentage: 0,
              duration: 2,
              phone: prev.phone
            }));
          }}
        >
          <div 
            className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
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
                
                <div className="grid grid-cols-4 gap-2">
                  {percentageOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setAlertConfig(prev => ({ 
                        ...prev, 
                        percentage: option.value 
                      }))}
                      className={`px-2 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all ${
                        alertConfig.percentage === option.value
                          ? 'border-violet-600 bg-violet-50 text-violet-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-violet-200'
                      }`}
                    >
                      <div className="text-base">{option.label}</div>
                      <div className="text-[10px] text-slate-500 leading-none mt-0.5">
                        {option.value === 0 
                          ? option.subLabel
                          : `$${(currentPrice * (1 - option.value / 100)).toFixed(0)}`
                        }
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
                {alertConfig.percentage === 0 ? (
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-700">
                      Any price drop 📉
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      You'll be notified when the price goes down
                    </p>
                  </div>
                ) : (
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
                )}
              </div>

              {/* Phone Input */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <MessageCircle size={16} className="text-violet-600" />
                  <label className="text-sm font-bold text-slate-900">
                    Your Phone:
                  </label>
                </div>
                <input
                  type="tel"
                  value={alertConfig.phone}
                  onChange={(e) => setAlertConfig(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  We'll text you once when the price drops
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

              {/* Action Buttons - Submit and Close */}
              <div className="flex gap-3">
                {/* After success: Show "Adjust Alert" and "Done" buttons */}
                {status === 'success' ? (
                  <>
                    {/* Adjust Alert Button - Only enabled if values changed */}
                    <button
                      onClick={handleSubmit}
                      disabled={
                        alertConfig.percentage === lastSubmitted.percentage &&
                        alertConfig.duration === lastSubmitted.duration
                      }
                      className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                        alertConfig.percentage === lastSubmitted.percentage &&
                        alertConfig.duration === lastSubmitted.duration
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                      }`}
                    >
                      Adjust Alert
                    </button>
                    
                    {/* Done Button */}
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setStatus('idle');
                        setMessage('');
                        setLastSubmitted({ percentage: null, duration: null });
                        // Reset form to defaults for next time
                        setAlertConfig(prev => ({
                          percentage: 0,
                          duration: 2,
                          phone: prev.phone
                        }));
                      }}
                      className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Done
                    </button>
                  </>
                ) : (
                  <>
                    {/* Cancel Button */}
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setStatus('idle');
                        setMessage('');
                        setLastSubmitted({ percentage: null, duration: null });
                        // Reset form to defaults
                        setAlertConfig(prev => ({
                          percentage: 0,
                          duration: 2,
                          phone: prev.phone
                        }));
                      }}
                      className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>

                    {/* Submit Button */}
                    <button
                      onClick={handleSubmit}
                      disabled={status === 'loading'}
                      className="flex-[2] py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span className="text-sm">Creating...</span>
                        </>
                      ) : (
                        <>
                          <Bell size={16} />
                          <span className="text-sm">Set Alert</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}