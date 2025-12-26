import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

/**
 * Smart Link that preloads route chunks on hover/touch
 * Makes navigation feel instant by loading code before click
 */
export default function PreloadLink({ to, onMouseEnter, onTouchStart, children, ...props }) {
  const preloaded = useRef(false);
  
  const preloadRoute = () => {
    if (preloaded.current) return;
    
    // Check if it's a review route
    if (to.startsWith('/reviews/')) {
      // Dynamically import ReviewPage to trigger chunk loading
      import('./ReviewPage').then(() => {
        preloaded.current = true;
      });
    }
  };
  
  const handleMouseEnter = (e) => {
    preloadRoute();
    if (onMouseEnter) onMouseEnter(e);
  };
  
  const handleTouchStart = (e) => {
    preloadRoute();
    if (onTouchStart) onTouchStart(e);
  };
  
  return (
    <Link
      to={to}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleTouchStart}
      {...props}
    >
      {children}
    </Link>
  );
}