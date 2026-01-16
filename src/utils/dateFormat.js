/**
 * Format a date string for display
 * @param {string} dateString - ISO date string
 * @param {string} format - Format type: 'short', 'medium', 'long'
 * @returns {string} - Formatted date string
 */
export function formatDate(dateString, format = 'short') {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return null;
  
  switch (format) {
    case 'short':
      // Jan 16, 2026
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      
    case 'medium':
      // January 16, 2026
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
      
    case 'long':
      // Thursday, January 16, 2026
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
      
    default:
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
  }
}

/**
 * Format date for display in cards
 * @param {string} dateString - ISO date string
 * @returns {string} - Short formatted date
 */
export function formatCardDate(dateString) {
  return formatDate(dateString, 'short');
}