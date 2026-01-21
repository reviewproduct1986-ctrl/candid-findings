import { useEffect } from 'react';

export function useScrollToGrid(trigger, headerHeight = 140) {
  useEffect(() => {
    const productGrid = document.querySelector('[data-product-grid]');
    if (productGrid) {
      const yOffset = -headerHeight;
      const y = productGrid.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  }, [trigger, headerHeight]);
}