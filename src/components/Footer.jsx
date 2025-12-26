import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Amazon Affiliate Disclosure */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <span className="text-violet-400">ⓘ</span> Amazon Affiliate Disclosure
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            CandidFindings.com is a participant in the Amazon Services LLC Associates Program, 
            an affiliate advertising program designed to provide a means for sites to earn 
            advertising fees by advertising and linking to Amazon.com. As an Amazon Associate, 
            we earn from qualifying purchases.
          </p>
          <p className="text-xs text-slate-400">
            Product prices and availability are accurate as of the date/time indicated and are subject 
            to change. Any price and availability information displayed on Amazon.com at the time of 
            purchase will apply to the purchase of this product.
          </p>
        </div>

        {/* Site Info */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <p className="font-bold text-white text-lg">
              CandidFindings
            </p>
          </div>
          <p className="text-sm text-slate-400">
            Honest product reviews and candid findings © 2024-2025
          </p>
        </div>
      </div>
    </footer>
  );
}