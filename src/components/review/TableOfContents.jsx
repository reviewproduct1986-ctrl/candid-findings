import React from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';

export default function TableOfContents({ 
  tableOfContents, 
  blog, 
  totalSections, 
  tocExpanded, 
  setTocExpanded 
}) {
  if (!tableOfContents || tableOfContents.length === 0) return null;

  return (
    <div className="not-prose mb-8 border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setTocExpanded(!tocExpanded)}
        className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="text-violet-600" size={20} />
          <h2 className="font-bold text-slate-900">Table of Contents</h2>
          <span className="text-xs text-slate-500">({totalSections} sections)</span>
        </div>
        <ChevronDown 
          className={`text-slate-400 transition-all duration-200 ${
            tocExpanded ? 'rotate-180 text-violet-600' : ''
          }`} 
          size={20} 
        />
      </button>

      {tocExpanded && (
        <div className="p-5 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tableOfContents.map((heading, index) => (
              <a
                key={index}
                href={`#${heading.id}`}
                onClick={() => setTocExpanded(false)}
                className="block p-4 rounded-xl hover:shadow-md transition-shadow"
                style={{
                  backgroundColor: heading.level === 2 ? '#f0f9ff' : '#fef3c7',
                  borderLeft: heading.level === 2 ? '4px solid #3b82f6' : '4px solid #f59e0b'
                }}
              >
                <span className="font-semibold">{heading.text}</span>
              </a>
            ))}
            
            {blog?.pros && (
              <a 
                href="#pros" 
                onClick={() => setTocExpanded(false)} 
                className="block p-4 rounded-xl bg-green-50 border-l-4 border-green-500 hover:shadow-md transition-shadow"
              >
                <span className="font-semibold">Pros</span>
              </a>
            )}
            
            {blog?.cons && (
              <a 
                href="#cons" 
                onClick={() => setTocExpanded(false)} 
                className="block p-4 rounded-xl bg-orange-50 border-l-4 border-orange-500 hover:shadow-md transition-shadow"
              >
                <span className="font-semibold">Cons</span>
              </a>
            )}
            
            {blog?.faqs?.length > 0 && (
              <a 
                href="#faqs" 
                onClick={() => setTocExpanded(false)} 
                className="block p-4 rounded-xl bg-blue-50 border-l-4 border-blue-500 hover:shadow-md transition-shadow"
              >
                <span className="font-semibold">FAQs</span>
              </a>
            )}
            
            {blog?.targetAudience && (
              <a 
                href="#who-should-buy" 
                onClick={() => setTocExpanded(false)} 
                className="block p-4 rounded-xl bg-purple-50 border-l-4 border-purple-500 hover:shadow-md transition-shadow"
              >
                <span className="font-semibold">Who Should Buy</span>
              </a>
            )}
            
            {blog?.verdict && (
              <a 
                href="#verdict" 
                onClick={() => setTocExpanded(false)} 
                className="block p-4 rounded-xl bg-violet-50 border-l-4 border-violet-500 hover:shadow-md transition-shadow"
              >
                <span className="font-semibold">Final Verdict</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}