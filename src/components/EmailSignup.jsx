import React, { useState } from 'react';
import { Mail, Check, AlertCircle, Loader2, X, Inbox, AlertTriangle } from 'lucide-react';

export default function EmailSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Get MailChimp values from environment variables
  const mailchimpDomain = process.env.MAILCHIMP_URL;
  const mailchimpUserId = process.env.MAILCHIMP_USER_ID;
  const mailchimpListId = process.env.MAILCHIMP_LIST_ID;

  const isConfigured = mailchimpDomain && mailchimpUserId && mailchimpListId;

  // Validate email format
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!email) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address (e.g., you@example.com)');
      return;
    }

    if (!isConfigured) {
      setStatus('error');
      setMessage('Email signup is not configured. Please try again later.');
      return;
    }

    setStatus('loading');

    try {
      // Build the MailChimp URL with JSONP support
      const baseUrl = `https://${mailchimpDomain}.list-manage.com/subscribe/post-json`;
      const params = new URLSearchParams({
        u: mailchimpUserId,
        id: mailchimpListId,
        EMAIL: email,
        c: 'mailchimpCallback'
      });

      const url = `${baseUrl}?${params.toString()}`;

      // Create a unique callback name for this request
      const callbackName = 'mailchimpCallback_' + Date.now();
      let timeoutId;
      let scriptElement;

      // Create promise to handle JSONP response
      const jsonpRequest = new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
          cleanup();
          reject(new Error('Request timeout'));
        }, 10000);

        window[callbackName] = (data) => {
          clearTimeout(timeoutId);
          cleanup();
          resolve(data);
        };

        scriptElement = document.createElement('script');
        scriptElement.src = url.replace('mailchimpCallback', callbackName);
        scriptElement.onerror = () => {
          clearTimeout(timeoutId);
          cleanup();
          reject(new Error('Script load error'));
        };

        document.body.appendChild(scriptElement);
      });

      const cleanup = () => {
        if (scriptElement && scriptElement.parentNode) {
          scriptElement.parentNode.removeChild(scriptElement);
        }
        if (window[callbackName]) {
          delete window[callbackName];
        }
      };

      // Wait for response
      const data = await jsonpRequest;

      console.log('MailChimp response:', data); // Debug log

      // Parse response
      if (data.result === 'success') {
        // ✅ IMPORTANT: Check if success message contains "already subscribed"
        // MailChimp sometimes returns success with "already subscribed" message
        const msg = data.msg || '';
        const cleanMsg = msg
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .toLowerCase();

        console.log('Success message (cleaned):', cleanMsg); // Debug log

        // Check if it's actually "already subscribed" disguised as success
        if (
          cleanMsg.includes('already subscribed') ||
          cleanMsg.includes('already a list member') ||
          cleanMsg.includes('already a member of this list') ||
          cleanMsg.includes('is already subscribed') ||
          cleanMsg.includes('already on the list') ||
          cleanMsg.includes('already receiving')
        ) {
          // It's actually "already subscribed" - show as error
          console.log('⚠️ Already subscribed detected in SUCCESS message');
          setStatus('error');
          setMessage("You're already subscribed! Check your inbox for previous emails.");
        } else {
          // True success - new subscription
          console.log('✅ True success - new subscriber');
          setStatus('success');
          setMessage('Welcome! Check your inbox for our welcome email.');
          setShowModal(true);
          setEmail('');
        }

      } else if (data.result === 'error') {
        // MailChimp returned an error
        let errorMessage = 'Something went wrong. Please try again.';
        
        if (data.msg) {
          const msg = data.msg;
          console.log('Error message:', msg);
          
          const cleanMsg = msg
            .replace(/<[^>]*>/g, '')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .toLowerCase();
          
          console.log('Error message (cleaned):', cleanMsg);
          
          // Check for already subscribed
          if (
            cleanMsg.includes('already subscribed') ||
            cleanMsg.includes('already a list member') ||
            cleanMsg.includes('already a member of this list') ||
            cleanMsg.includes('is already subscribed') ||
            cleanMsg.includes('this email cannot be added') ||
            cleanMsg.includes('already on the list')
          ) {
            console.log('✅ Already subscribed detected in ERROR message');
            errorMessage = "You're already subscribed! Check your inbox for previous emails.";
          }
          // Invalid email
          else if (
            cleanMsg.includes('invalid') ||
            cleanMsg.includes('enter a valid') ||
            cleanMsg.includes('provide a valid')
          ) {
            errorMessage = 'Please enter a valid email address (e.g., you@example.com)';
          }
          // Too many signups
          else if (
            cleanMsg.includes('too many') ||
            cleanMsg.includes('recent') ||
            cleanMsg.includes('slow down')
          ) {
            errorMessage = 'Too many signup attempts. Please try again in a few minutes.';
          }
          // Domain-specific errors
          else if (cleanMsg.includes('domain')) {
            errorMessage = 'This email domain is not allowed. Please use a different email.';
          }
          // Use MailChimp's message (cleaned)
          else {
            errorMessage = cleanMsg.charAt(0).toUpperCase() + cleanMsg.slice(1);
          }
        }
        
        setStatus('error');
        setMessage(errorMessage);

      } else {
        // Unexpected response format
        console.warn('Unexpected MailChimp response:', data);
        setStatus('error');
        setMessage('Unexpected response. Please try again.');
      }

    } catch (error) {
      console.error('Subscription error:', error);
      
      if (error.message === 'Request timeout') {
        // Timeout - assume success
        setStatus('success');
        setMessage('Welcome! Check your inbox for our welcome email.');
        setShowModal(true);
        setEmail('');
      } else {
        setStatus('error');
        setMessage('Network error. Please check your connection and try again.');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setStatus('idle');
    setMessage('');
  };

  return (
    <>
      <div className="bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20 rounded-xl p-6 max-w-2xl mx-auto">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mail className="text-violet-400" size={24} />
            <h3 className="text-xl font-bold text-white">
              Never Miss a Deal
            </h3>
          </div>
          <p className="text-sm text-slate-300">
            Get exclusive product deals and recommendations delivered to your inbox weekly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              disabled={status === 'loading'}
            />

            <button
              type="submit"
              disabled={status === 'loading' || !isConfigured}
              className="px-8 py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Subscribing...</span>
                </>
              ) : (
                'Subscribe'
              )}
            </button>
          </div>

          {status === 'error' && (
            <div className="flex items-start gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span className="text-sm">{message}</span>
            </div>
          )}

          <p className="text-xs text-slate-400 text-center">
            We respect your privacy. Unsubscribe at any time. No spam.
          </p>
        </form>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeModal}
        >
          <div 
            className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Success icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <Check size={32} className="text-green-400" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-white text-center mb-2">
              You're Subscribed! 🎉
            </h3>

            {/* Message */}
            <p className="text-slate-300 text-center mb-6">
              Welcome to CandidFindings! We've sent a welcome email to your inbox.
            </p>

            {/* Email tips */}
            <div className="space-y-4 mb-6">
              {/* Check inbox */}
              <div className="flex items-start gap-3 p-3 bg-violet-600/10 border border-violet-500/20 rounded-lg">
                <Inbox className="text-violet-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-semibold text-white mb-1">
                    Check Your Inbox
                  </p>
                  <p className="text-xs text-slate-300">
                    Look for an email from CandidFindings. It should arrive within a few minutes.
                  </p>
                </div>
              </div>

              {/* Check spam */}
              <div className="flex items-start gap-3 p-3 bg-amber-600/10 border border-amber-500/20 rounded-lg">
                <AlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-semibold text-white mb-1">
                    Don't See It? Check Spam
                  </p>
                  <p className="text-xs text-slate-300">
                    Sometimes emails land in your spam or junk folder. If you find it there, mark it as "Not Spam" and move it to your inbox.
                  </p>
                </div>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={closeModal}
              className="w-full py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors"
            >
              Got It!
            </button>

            {/* Footer note */}
            <p className="text-xs text-slate-500 text-center mt-4">
              You can unsubscribe at any time from any email we send.
            </p>
          </div>
        </div>
      )}
    </>
  );
}