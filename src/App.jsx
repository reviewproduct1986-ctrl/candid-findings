import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductListing from './pages/ProductListing';

// Lazy load ReviewPage - only loads when user visits a review
const ReviewPage = lazy(() => import('./ReviewPage.jsx'));

// Loading component for lazy routes.
function RouteLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

// Main App component with Router
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductListing />} />
        <Route 
          path="/reviews/:slug" 
          element={
            <Suspense fallback={<RouteLoader />}>
              <ReviewPage />
            </Suspense>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}