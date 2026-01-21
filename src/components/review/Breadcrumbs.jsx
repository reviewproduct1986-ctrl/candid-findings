import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumbs({ title, category, back }) {
  return (
    <nav className="mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm text-slate-600">
        <li><Link to="/" className="hover:text-violet-600">Home</Link></li>
        <li className="text-slate-400">/</li>
        <li>
          <Link to={`${back}`} className="hover:text-violet-600 whitespace-nowrap">
            {category}
          </Link>
        </li>
        <li className="text-slate-400">/</li>
        <li className="text-slate-900 font-medium truncate max-w-md">{title}</li>
      </ol>
    </nav>
  );
}