import React from 'react';

// Markdown component configuration for ReactMarkdown
export const markdownComponents = {
  h1: ({node, children, ...props}) => {
    const text = children?.toString() || '';
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return <h1 id={id} className="text-4xl font-bold text-slate-900 mt-10 mb-6" {...props}>{children}</h1>;
  },
  h2: ({node, children, ...props}) => {
    const text = children?.toString() || '';
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return <h2 id={id} className="text-3xl font-bold text-slate-900 mt-8 mb-4" {...props}>{children}</h2>;
  },
  h3: ({node, children, ...props}) => {
    const text = children?.toString() || '';
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return <h3 id={id} className="text-2xl font-bold text-slate-900 mt-6 mb-3" {...props}>{children}</h3>;
  },
  h4: ({node, children, ...props}) => {
    const text = children?.toString() || '';
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return <h4 id={id} className="text-xl font-bold text-slate-900 mt-4 mb-2" {...props}>{children}</h4>;
  },
  p: ({node, children, ...props}) => {
    return <p className="mb-4 text-slate-700 leading-relaxed" {...props}>{children}</p>;
  },
  ul: ({node, children, ...props}) => {
    return <ul className="list-disc list-inside mb-4 space-y-2" {...props}>{children}</ul>;
  },
  ol: ({node, children, ...props}) => {
    return <ol className="list-decimal list-inside mb-4 space-y-2" {...props}>{children}</ol>;
  },
  li: ({node, children, ...props}) => {
    return <li className="text-slate-700" {...props}>{children}</li>;
  },
  strong: ({node, children, ...props}) => {
    return <strong className="font-bold text-slate-900" {...props}>{children}</strong>;
  },
  em: ({node, children, ...props}) => {
    return <em className="italic" {...props}>{children}</em>;
  },
  code: ({node, inline, children, ...props}) => {
    return inline 
      ? <code className="px-1.5 py-0.5 bg-slate-100 rounded text-sm font-mono text-violet-600" {...props}>{children}</code>
      : <code className="block p-4 bg-slate-100 rounded-lg text-sm font-mono overflow-x-auto mb-4" {...props}>{children}</code>;
  },
  blockquote: ({node, children, ...props}) => {
    return <blockquote className="border-l-4 border-violet-500 pl-4 italic text-slate-600 my-4" {...props}>{children}</blockquote>;
  },
  a: ({node, children, href, ...props}) => {
    return <a href={href} className="text-violet-600 hover:text-violet-700 underline" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
  }
};