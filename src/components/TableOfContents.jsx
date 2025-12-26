import React from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';

export default function TableOfContents({ 
  tableOfContents, 
  blog, 
  tocExpanded, 
  setTocExpanded 
}) {
  if (tableOfContents.length === 0) return null;

  const totalSections = tableOfContents.length + 
    (blog?.pros ? 1 : 0) + 
    (blog?.cons ? 1 : 0) + 
    (blog?.faqs ? 1 : 0) + 
    (blog?.targetAudience ? 1 : 0) + 
    (blog?.verdict ? 1 : 0);

  return (
    <div className="not-prose mb-8 border border-slate-200 rounded-xl overflow-hidden scroll-mt-48 transition-all duration-300">
      <button
        onClick={() => setTocExpanded(!tocExpanded)}
        className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 transition-all duration-300 group"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="text-violet-600 transition-transform duration-300 group-hover:scale-110" size={20} />
          <h2 className="font-bold text-slate-900 transition-colors duration-300 group-hover:text-violet-600">
            Table of Contents
          </h2>
          <span className="text-xs text-slate-500 transition-all duration-300 group-hover:text-violet-500">
            ({totalSections} sections)
          </span>
        </div>
        <ChevronDown 
          className={`text-slate-600 transition-all duration-500 ease-in-out ${
            tocExpanded ? 'rotate-180 text-violet-600' : 'group-hover:translate-y-0.5'
          }`} 
          size={20} 
        />
      </button>
      
      <div className={`transition-all duration-500 ease-in-out ${
        tocExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <nav className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 border-t border-slate-200">
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tableOfContents.map((heading, idx) => (
              <li 
                key={idx}
                style={{
                  animation: tocExpanded ? `slideIn 0.3s ease-out ${idx * 0.03}s both` : 'none'
                }}
              >
                <a
                  href={`#${heading.id}`}
                  onClick={() => setTocExpanded(false)}
                  className={`block px-4 py-3 rounded-lg border-l-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${
                    heading.level === 2 
                      ? 'bg-white border-violet-500 font-semibold text-slate-900 hover:bg-violet-50 hover:border-violet-600 hover:shadow-violet-100' 
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 pl-6'
                  }`}
                >
                  <span className={heading.level === 2 ? 'flex items-center gap-2' : ''}>
                    {heading.level === 2 && (
                      <span className="text-violet-600 transition-transform duration-300 inline-block group-hover:translate-x-1">
                        ▶
                      </span>
                    )}
                    {heading.text}
                  </span>
                </a>
              </li>
            ))}
            
            {blog?.pros && blog.pros.length > 0 && (
              <li style={{
                animation: tocExpanded ? `slideIn 0.3s ease-out ${tableOfContents.length * 0.03}s both` : 'none'
              }}>
                <a 
                  href="#pros" 
                  onClick={() => setTocExpanded(false)}
                  className="block px-4 py-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 font-semibold text-green-900 hover:from-green-100 hover:to-emerald-100 hover:shadow-md hover:shadow-green-100 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-green-600 text-lg transition-transform duration-300 inline-block hover:scale-125">✓</span>
                    Pros
                  </span>
                </a>
              </li>
            )}
            
            {blog?.cons && blog.cons.length > 0 && (
              <li style={{
                animation: tocExpanded ? `slideIn 0.3s ease-out ${(tableOfContents.length + 1) * 0.03}s both` : 'none'
              }}>
                <a 
                  href="#cons" 
                  onClick={() => setTocExpanded(false)}
                  className="block px-4 py-3 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 font-semibold text-orange-900 hover:from-orange-100 hover:to-amber-100 hover:shadow-md hover:shadow-orange-100 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-orange-600 text-lg transition-transform duration-300 inline-block hover:scale-125">•</span>
                    Cons
                  </span>
                </a>
              </li>
            )}
            
            {blog?.faqs && blog.faqs.length > 0 && (
              <li style={{
                animation: tocExpanded ? `slideIn 0.3s ease-out ${(tableOfContents.length + 2) * 0.03}s both` : 'none'
              }}>
                <a 
                  href="#faqs" 
                  onClick={() => setTocExpanded(false)}
                  className="block px-4 py-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 font-semibold text-blue-900 hover:from-blue-100 hover:to-indigo-100 hover:shadow-md hover:shadow-blue-100 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-blue-600 text-lg transition-transform duration-300 inline-block hover:rotate-12">❓</span>
                    FAQs
                  </span>
                </a>
              </li>
            )}
            
            {blog?.targetAudience && (
              <li style={{
                animation: tocExpanded ? `slideIn 0.3s ease-out ${(tableOfContents.length + 3) * 0.03}s both` : 'none'
              }}>
                <a 
                  href="#who-should-buy" 
                  onClick={() => setTocExpanded(false)}
                  className="block px-4 py-3 rounded-lg bg-gradient-to-r from-purple-50 to-violet-50 border-l-4 border-purple-500 font-semibold text-purple-900 hover:from-purple-100 hover:to-violet-100 hover:shadow-md hover:shadow-purple-100 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-purple-600 text-lg transition-transform duration-300 inline-block hover:scale-110">👤</span>
                    Who Should Buy
                  </span>
                </a>
              </li>
            )}
            
            {blog?.verdict && (
              <li style={{
                animation: tocExpanded ? `slideIn 0.3s ease-out ${(tableOfContents.length + 4) * 0.03}s both` : 'none'
              }}>
                <a 
                  href="#verdict" 
                  onClick={() => setTocExpanded(false)}
                  className="block px-4 py-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 font-semibold text-amber-900 hover:from-amber-100 hover:to-yellow-100 hover:shadow-md hover:shadow-amber-100 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-amber-600 text-lg transition-transform duration-300 inline-block hover:rotate-12 hover:scale-110">⭐</span>
                    Final Verdict
                  </span>
                </a>
              </li>
            )}
          </ul>
        </nav>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}