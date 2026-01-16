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
 * Add calculated read times to blog posts
 * @param {Array} posts - Array of blog post objects
 * @returns {Array} - Posts with estimatedReadTime added
 */
export function addReadTimesToPosts(posts) {
  return posts.map(post => {
    // If already has estimatedReadTime and content is missing, keep existing
    if (post.estimatedReadTime && !post.content) {
      return post;
    }
    
    // Calculate from content
    return {
      ...post,
      estimatedReadTime: calculatePostReadTime(post)
    };
  });
}