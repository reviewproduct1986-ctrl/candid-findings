import React from 'react';

export default function ProsCons({ blog }) {
  if (!blog?.pros && !blog?.cons) return null;

  return (
    <>
      {/* Pros Section */}
      {blog?.pros && blog.pros.length > 0 && (
        <div className="my-12">
          <h3 id="pros" className="text-2xl font-bold text-slate-900 mb-4 scroll-mt-48">
            What We Love (Pros)
          </h3>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
            <ul className="space-y-3">
              {blog.pros.map((pro, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-green-600 font-bold text-xl flex-shrink-0 mt-0.5">✓</span>
                  <span className="text-slate-800 leading-relaxed">{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Cons Section */}
      {blog?.cons && blog.cons.length > 0 && (
        <div className="my-12">
          <h3 id="cons" className="text-2xl font-bold text-slate-900 mb-4 scroll-mt-48">
            Potential Drawbacks (Cons)
          </h3>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200">
            <ul className="space-y-3">
              {blog.cons.map((con, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-orange-600 font-bold text-xl flex-shrink-0 mt-0.5">•</span>
                  <span className="text-slate-800 leading-relaxed">{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}