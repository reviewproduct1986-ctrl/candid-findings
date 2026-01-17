import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProductListing from './pages/ProductListing';
import ScrollToTop from './components/ScrollToTop';

// Lazy load pages - only loads when user visits
const ReviewPage = lazy(() => import('./pages/ReviewPage.jsx'));
const BestOfBlogList = lazy(() => import('./pages/BestOfBlogList.jsx'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'));
const TermsOfService = lazy(() => import('./pages/TermsOfService.jsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const BestOfPost = lazy(() => import('./pages/BestOfPost.jsx'));

// Loading component for lazy routes
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
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<ProductListing />} />
        <Route 
          path="/best" 
          element={
            <Suspense fallback={<RouteLoader />}>
              <BestOfBlogList />
            </Suspense>
          } 
        />
        <Route 
          path="/reviews/:slug" 
          element={
            <Suspense fallback={<RouteLoader />}>
              <ReviewPage />
            </Suspense>
          } 
        />
        <Route 
          path="/best/:slug" 
          element={
            <Suspense fallback={<RouteLoader />}>
              <BestOfPost />
            </Suspense>
          } 
        />
        <Route 
          path="/about" 
          element={
            <Suspense fallback={<RouteLoader />}>
              <AboutPage />
            </Suspense>
          } 
        />
        <Route 
          path="/privacy-policy" 
          element={
            <Suspense fallback={<RouteLoader />}>
              <PrivacyPolicy />
            </Suspense>
          } 
        />
        <Route 
          path="/terms" 
          element={
            <Suspense fallback={<RouteLoader />}>
              <TermsOfService />
            </Suspense>
          } 
        />
        {/* Catch-all route - redirect 404s to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}