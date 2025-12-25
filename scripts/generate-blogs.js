#!/usr/bin/env node

/**
 * Generate SEO-optimized blog posts for products using Claude AI
 */

const fs = require('fs');
const path = require('path');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

/**
 * Read products from JSON file
 */
function loadProducts() {
  const filePath = path.join(__dirname, '../public/data/products.json');
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ products.json not found. Run fetch-products.js first.');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return data.products;
}

/**
 * Generate blog post for a product using Claude AI
 */
async function generateBlogPost(product) {
  console.log(`📝 Generating blog post for: ${product.title}`);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `Write a comprehensive, SEO-optimized blog post about this product:

Product: ${product.title}
Category: ${product.category}
Price: $${product.price}
Rating: ${product.rating}/5 (${product.reviews} reviews)
Features: ${product.features?.join(', ') || 'N/A'}
Description: ${product.description || ''}

Requirements:
1. Engaging, SEO-friendly headline (60-70 characters)
2. Meta description (150-160 characters)
3. Comprehensive review (600-800 words) with:
   - Introduction highlighting key benefits
   - Detailed feature analysis
   - Pros and cons section
   - Who this product is best for
   - Final verdict and recommendation
4. Use natural language with target keywords
5. Include strong call-to-action
6. 8-10 SEO keywords
7. Suggested URL slug (lowercase, hyphens)

Format as JSON with these exact fields:
{
  "title": "...",
  "slug": "...",
  "metaDescription": "...",
  "content": "...",
  "keywords": ["...", "..."],
  "pros": ["...", "..."],
  "cons": ["...", "..."],
  "verdict": "...",
  "targetAudience": "..."
}`
          }
        ],
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const textContent = data.content.find(c => c.type === "text")?.text || "";
    
    // Clean JSON from markdown code fences
    const cleanJson = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const blogData = JSON.parse(cleanJson);

    return {
      id: `blog-${product.id}`,
      productId: product.id,
      asin: product.asin,
      ...blogData,
      product: {
        title: product.title,
        price: product.price,
        rating: product.rating,
        reviews: product.reviews,
        image: product.image,
        affiliate: product.affiliate,
        category: product.category
      },
      publishedDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ Error generating blog for ${product.title}:`, error.message);
    return null;
  }
}

/**
 * Generate blog posts for all products
 */
async function generateAllBlogs(products) {
  console.log(`🤖 Generating blog posts for ${products.length} products...`);
  
  const blogPosts = [];
  
  // Generate posts sequentially to avoid rate limits
  for (const product of products) {
    const blog = await generateBlogPost(product);
    if (blog) {
      blogPosts.push(blog);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return blogPosts;
}

/**
 * Save blog posts to JSON and individual HTML files
 */
function saveBlogPosts(blogPosts) {
  const dataDir = path.join(__dirname, '../public/data');
  const blogsDir = path.join(__dirname, '../public/blogs');
  
  // Create directories
  if (!fs.existsSync(blogsDir)) {
    fs.mkdirSync(blogsDir, { recursive: true });
  }

  // Save all blogs to JSON
  const jsonPath = path.join(dataDir, 'blogs.json');
  const blogsData = {
    posts: blogPosts,
    metadata: {
      totalPosts: blogPosts.length,
      lastUpdated: new Date().toISOString(),
      categories: [...new Set(blogPosts.map(b => b.product.category))]
    }
  };
  fs.writeFileSync(jsonPath, JSON.stringify(blogsData, null, 2));
  console.log(`✅ Saved ${blogPosts.length} blog posts to ${jsonPath}`);

  // Save individual HTML files for each blog
  blogPosts.forEach(blog => {
    const htmlContent = generateBlogHTML(blog);
    const htmlPath = path.join(blogsDir, `${blog.slug}.html`);
    fs.writeFileSync(htmlPath, htmlContent);
  });
  
  console.log(`✅ Saved ${blogPosts.length} individual blog HTML files`);
}

/**
 * Generate standalone HTML for a blog post
 */
function generateBlogHTML(blog) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${blog.title}</title>
  <meta name="description" content="${blog.metaDescription}">
  <meta name="keywords" content="${blog.keywords.join(', ')}">
  
  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${blog.title}">
  <meta property="og:description" content="${blog.metaDescription}">
  <meta property="og:image" content="${blog.product.image}">
  
  <!-- Schema.org structured data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "${blog.product.title}",
    "image": "${blog.product.image}",
    "description": "${blog.metaDescription}",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "${blog.product.rating}",
      "reviewCount": "${blog.product.reviews}"
    },
    "offers": {
      "@type": "Offer",
      "price": "${blog.product.price}",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "${blog.product.affiliate}"
    }
  }
  </script>
  
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1 { color: #333; margin-bottom: 10px; }
    .meta { color: #666; font-size: 0.9em; margin-bottom: 20px; }
    .product-card { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .cta-button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
    .pros-cons { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    .pros, .cons { padding: 15px; border-radius: 6px; }
    .pros { background: #d4edda; }
    .cons { background: #f8d7da; }
  </style>
</head>
<body>
  <article>
    <h1>${blog.title}</h1>
    <div class="meta">
      Published: ${new Date(blog.publishedDate).toLocaleDateString()} | 
      Category: ${blog.product.category}
    </div>
    
    <div class="product-card">
      <img src="${blog.product.image}" alt="${blog.product.title}" style="max-width: 100%; border-radius: 6px;">
      <h2>${blog.product.title}</h2>
      <p>⭐ ${blog.product.rating}/5 (${blog.product.reviews.toLocaleString()} reviews)</p>
      <p><strong>Price: $${blog.product.price}</strong></p>
      <a href="${blog.product.affiliate}" class="cta-button" target="_blank" rel="noopener noreferrer">
        Check Latest Price on Amazon
      </a>
    </div>
    
    <div class="content">
      ${blog.content}
    </div>
    
    <div class="pros-cons">
      <div class="pros">
        <h3>✅ Pros</h3>
        <ul>
          ${blog.pros.map(pro => `<li>${pro}</li>`).join('')}
        </ul>
      </div>
      <div class="cons">
        <h3>❌ Cons</h3>
        <ul>
          ${blog.cons.map(con => `<li>${con}</li>`).join('')}
        </ul>
      </div>
    </div>
    
    <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>Final Verdict</h3>
      <p>${blog.verdict}</p>
      
      <h4>Best For:</h4>
      <p>${blog.targetAudience}</p>
      
      <a href="${blog.product.affiliate}" class="cta-button" target="_blank" rel="noopener noreferrer">
        Buy Now on Amazon
      </a>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em;">
      <strong>Keywords:</strong> ${blog.keywords.join(', ')}
    </div>
  </article>
</body>
</html>`;
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 Starting blog generation...');
    
    // Validate API key
    if (!ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY environment variable not set!');
      process.exit(1);
    }

    const products = loadProducts();
    console.log(`📦 Loaded ${products.length} products`);

    const blogPosts = await generateAllBlogs(products);
    
    if (blogPosts.length === 0) {
      console.warn('⚠️  No blog posts generated!');
      return;
    }

    saveBlogPosts(blogPosts);
    
    console.log('🎉 Blog generation completed successfully!');
    console.log(`   - Total posts: ${blogPosts.length}`);
    console.log(`   - Average keywords per post: ${(blogPosts.reduce((sum, b) => sum + b.keywords.length, 0) / blogPosts.length).toFixed(1)}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
