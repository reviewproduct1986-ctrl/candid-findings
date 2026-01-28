export function categoryToSlug(category) {
  return category
    .toLowerCase()
    .replace(/\s+&\s+/g, '-and-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function slugToCategory(slug) {
  return slug
    .replace(/-and-/g, ' & ')
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function affiliateLink(product) {
  return `https://amazon.com/dp/${product.asin}?tag=${process.env.AMAZON_TAG || 'candidfinding-20'}`;
}

/**
 * Generate Amazon search URL with affiliate tag
 * @param {string} searchTerm - The search query
 * @param {string} region - Amazon region (US, UK, etc.)
 * @returns {string} Full Amazon search URL with affiliate tag
 */
export function getAmazonSearchUrl(searchTerm) {
  const baseUrl = 'https://www.amazon.com';
  const encodedSearch = encodeURIComponent(searchTerm);
  return `${baseUrl}/s?k=${encodedSearch}&tag=${process.env.AMAZON_TAG || 'candidfinding-20'}`;
}