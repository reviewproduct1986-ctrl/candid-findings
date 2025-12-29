import React from 'react';

export default function ProsCons({ pros, cons }) {
  return (
    <>
      {/* Pros */}
      {pros && pros.length > 0 && (
        <div className="my-12">
          <h3 id="pros" className="text-2xl font-bold text-slate-900 mb-4">What We Love (Pros)</h3>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
            <ul className="space-y-3">
              {pros.map((pro, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-green-600 font-bold text-xl">✓</span>
                  <span className="text-slate-800">{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Cons */}
      {cons && cons.length > 0 && (
        <div className="my-12">
          <h3 id="cons" className="text-2xl font-bold text-slate-900 mb-4">Potential Drawbacks (Cons)</h3>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200">
            <ul className="space-y-3">
              {cons.map((con, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold text-xl">•</span>
                  <span className="text-slate-800">{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}