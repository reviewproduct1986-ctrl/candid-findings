import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * 
 * Scrolls to top of page when route changes.
 * Add this component to your App.jsx to enable global scroll-to-top on navigation.
 * 
 * Usage in App.jsx:
 * 
 * import ScrollToTop from './components/ScrollToTop';
 * 
 * function App() {
 *   return (
 *     <Router>
 *       <ScrollToTop />  ← Add this
 *       <Routes>
 *         ...
 *       </Routes>
 *     </Router>
 *   );
 * }
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top instantly on route change
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // This component doesn't render anything
}