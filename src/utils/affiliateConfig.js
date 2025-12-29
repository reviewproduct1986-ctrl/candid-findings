// Affiliate configuration
// Update your Amazon Associates tag here

export const AFFILIATE_CONFIG = {
  // Your Amazon Associates tag
  // Get this from: https://affiliate-program.amazon.com
  amazonTag: 'candidfindings-20', // Replace with YOUR actual tag
  
  // Amazon base URLs by region
  amazon: {
    US: 'https://www.amazon.com',
    UK: 'https://www.amazon.co.uk',
    CA: 'https://www.amazon.ca',
    DE: 'https://www.amazon.de',
    // Add more regions as needed
  },
  
  // Default region
  defaultRegion: 'US',
};

/**
 * Generate Amazon search URL with affiliate tag
 * @param {string} searchTerm - The search query
 * @param {string} region - Amazon region (US, UK, etc.)
 * @returns {string} Full Amazon search URL with affiliate tag
 */
export function getAmazonSearchUrl(searchTerm, region = AFFILIATE_CONFIG.defaultRegion) {
  const baseUrl = AFFILIATE_CONFIG.amazon[region];
  const encodedSearch = encodeURIComponent(searchTerm);
  return `${baseUrl}/s?k=${encodedSearch}&tag=${AFFILIATE_CONFIG.amazonTag}`;
}

/**
 * Generate Amazon product URL with affiliate tag
 * @param {string} asin - Amazon ASIN
 * @param {string} region - Amazon region
 * @returns {string} Full Amazon product URL with affiliate tag
 */
export function getAmazonProductUrl(asin, region = AFFILIATE_CONFIG.defaultRegion) {
  const baseUrl = AFFILIATE_CONFIG.amazon[region];
  return `${baseUrl}/dp/${asin}?tag=${AFFILIATE_CONFIG.amazonTag}`;
}

/**
 * Add affiliate tag to any Amazon URL
 * @param {string} url - Existing Amazon URL
 * @returns {string} URL with affiliate tag added
 */
export function addAffiliateTag(url) {
  try {
    const urlObj = new URL(url);
    
    // Check if it's an Amazon URL
    if (!urlObj.hostname.includes('amazon.')) {
      return url; // Not Amazon, return as-is
    }
    
    // Add or replace tag parameter
    urlObj.searchParams.set('tag', AFFILIATE_CONFIG.amazonTag);
    
    return urlObj.toString();
  } catch (error) {
    console.error('Invalid URL:', error);
    return url;
  }
}