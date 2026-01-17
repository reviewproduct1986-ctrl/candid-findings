/**
 * Calculate read time for a blog post object
 * @param {Object} post - Blog post object with content field
 * @returns {string} - Formatted string like "5 min read"
 */
export function calculatePostReadTime(post) {
  // Check for different possible content fields
  const content = post.content || post.body || post.text || '';
  return calculateReadTime(content);
}

/**
 * Calculate estimated reading time from content
 * @param {string} content - The text content (can be HTML or plain text)
 * @param {number} wordsPerMinute - Average reading speed (default: 200)
 * @returns {string} - Formatted string like "5 min read"
 */
export function calculateReadTime(content, wordsPerMinute = 200) {
  if (!content) return '1 min read';

  // Strip HTML tags if present
  const strippedContent = content.replace(/<[^>]*>/g, '');
  
  // Count words (split by whitespace)
  const wordCount = strippedContent.trim().split(/\s+/).length;
  
  // Calculate minutes
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  
  // Return formatted string
  return `${minutes} min read`;
}

export function calculateBestOfReadTime(post) {
  if (!post.products || !Array.isArray(post.products)) {
    return '1 min read';
  }
  
  // Combine all product content
  const allContent = post.products
    .map(product => product.content || '')
    .filter(content => content.trim() !== '')
    .join('\n\n');
  
  return calculateReadTime(allContent);
}

/**
 * Add calculated read times to blog posts
 * Works with both regular blogs and best-of blogs
 * @param {Array} posts - Array of blog post objects
 * @returns {Array} - Posts with estimatedReadTime added
 */
export function addReadTimesToPosts(posts) {
  return posts.map(post => {
    // If already has estimatedReadTime and no content to recalculate, keep existing
    if (post.estimatedReadTime && !post.content && !post.products) {
      return post;
    }
    
    let readTime;
    
    // Best-of blog structure: has products array with content
    if (post.products && Array.isArray(post.products)) {
      readTime = calculateBestOfReadTime(post);
    } 
    // Regular blog structure: has content field directly
    else {
      readTime = calculatePostReadTime(post);
    }
    
    // Return post with calculated read time
    return {
      ...post,
      estimatedReadTime: readTime
    };
  });
}