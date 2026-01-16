#!/usr/bin/env node

/**
 * Generate sitemap.xml from products and blog posts
 * Includes homepage, category pages, and all review pages
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://candidfindings.com'; // Update with your actual domain

/**
 * Load blogs from JSON
 */
function loadBlogs() {
  // Try both locations
  const publicPath = path.join(__dirname, '../public/data/blogs.json');
  const dataPath = path.join(__dirname, '../data/blogs.json');
  
  let filePath = publicPath;
  if (!fs.existsSync(publicPath) && fs.existsSync(dataPath)) {
    filePath = dataPath;
  }
  
  if (!fs.existsSync(filePath)) {
    console.warn('⚠️  blogs.json not found - sitemap will only include homepage');
    return { posts: [] };
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return data || { posts: [] };
  } catch (error) {
    console.warn('⚠️  Error reading blogs.json:', error.message);
    return { posts: [] };
  }
}

/**
 * Load best-of blogs from JSON
 */
function loadBestOfBlogs() {
  // Try both locations
  const publicPath = path.join(__dirname, '../public/data/best-of-blogs.json');
  const dataPath = path.join(__dirname, '../data/best-of-blogs.json');
  
  let filePath = publicPath;
  if (!fs.existsSync(publicPath) && fs.existsSync(dataPath)) {
    filePath = dataPath;
  }
  
  if (!fs.existsSync(filePath)) {
    console.warn('⚠️  best-of-blogs.json not found');
    return { posts: [] };
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return data || { posts: [] };
  } catch (error) {
    console.warn('⚠️  Error reading best-of-blogs.json:', error.message);
    return { posts: [] };
  }
}

/**
 * Load products from JSON
 */
function loadProducts() {
  // Try both locations
  const publicPath = path.join(__dirname, '../public/data/products.json');
  const dataPath = path.join(__dirname, '../data/products.json');
  
  let filePath = publicPath;
  if (!fs.existsSync(publicPath) && fs.existsSync(dataPath)) {
    filePath = dataPath;
  }
  
  if (!fs.existsSync(filePath)) {
    console.warn('⚠️  products.json not found');
    return [];
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return data.products || data || [];
  } catch (error) {
    console.warn('⚠️  Error reading products.json:', error.message);
    return [];
  }
}

/**
 * Generate sitemap XML
 */
function generateSitemap(blogs, bestOfBlogs, products) {
  const now = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">

  <!-- Homepage -->
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

`;

  // Add Best Selections directory
  xml += `  <!-- Best Selections Directory -->
  <url>
    <loc>${SITE_URL}/best</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

`;

  // Add Best Of blog posts
  const bestOfPosts = bestOfBlogs?.posts || [];
  const publishedBestOfPosts = bestOfPosts.filter(post => !post.comingSoon);
  
  if (publishedBestOfPosts.length > 0) {
    xml += `  <!-- Best Selections Posts -->\n`;
    
    publishedBestOfPosts.forEach(post => {
      if (!post || !post.slug) return;
      
      const lastmod = post.publishedDate ? 
        new Date(post.publishedDate).toISOString().split('T')[0] : 
        now;
      
      xml += `  <url>
    <loc>${SITE_URL}/best/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

`;
    });
  }

  // Add Blog directory
  xml += `  <!-- Blog Directory -->
  <url>
    <loc>${SITE_URL}/reviews</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

`;

  // Add blog posts
  const blogPosts = blogs?.posts || [];
  if (blogPosts.length > 0) {
    xml += `  <!-- Blog Posts -->\n`;
    
    blogPosts.forEach(blog => {
      if (!blog || !blog.slug) return;
      
      const lastmod = blog.updatedDate ? 
        new Date(blog.updatedDate).toISOString().split('T')[0] : 
        now;
      
      xml += `  <url>
    <loc>${SITE_URL}/reviews/${blog.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

`;
    });
  }

  // Add category pages if there are multiple categories
  const categories = [...new Set(
    products
      .filter(p => p && p.category)
      .map(p => p.category)
  )];
  
  if (categories.length > 0) {
    xml += `  <!-- Category Pages -->\n`;
    categories.forEach(category => {
      if (!category) return;
      
      xml += `  <url>
    <loc>${SITE_URL}/?category=${encodeURIComponent(category)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>

`;
    });
  }

  // Add static pages
  xml += `  <!-- Static Pages -->
  <url>
    <loc>${SITE_URL}/about</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>${SITE_URL}/privacy-policy</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>

  <url>
    <loc>${SITE_URL}/terms</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>

`;

  xml += `</urlset>`;
  
  return xml;
}

/**
 * Save sitemap to public folder
 */
function saveSitemap(xml) {
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(sitemapPath, xml);
  console.log(`✅ Saved sitemap to ${sitemapPath}`);
}

/**
 * Main execution
 */
function main() {
  try {
    console.log('🗺️  Generating sitemap.xml...');
    
    const blogs = loadBlogs();
    const bestOfBlogs = loadBestOfBlogs();
    const products = loadProducts();
    
    const blogPosts = blogs?.posts || [];
    const bestOfPosts = bestOfBlogs?.posts || [];
    const publishedBestOfPosts = bestOfPosts.filter(p => !p.comingSoon);
    const validProducts = products.filter(p => p && p.category);
    
    console.log(`📦 Found ${validProducts.length} products`);
    console.log(`📄 Found ${blogPosts.length} blog posts`);
    console.log(`⭐ Found ${publishedBestOfPosts.length} best-of posts`);
    
    const xml = generateSitemap(blogs, bestOfBlogs, validProducts);
    saveSitemap(xml);
    
    console.log('🎉 Sitemap generation completed!');
    console.log('');
    console.log('📍 URLs included:');
    console.log(`   - Homepage: ${SITE_URL}/`);
    
    // Best Selections directory
    console.log(`   - Best Selections: ${SITE_URL}/best`);
    
    // Best Of posts
    if (publishedBestOfPosts.length > 0) {
      console.log(`   - Best Selections posts: ${publishedBestOfPosts.length}`);
      publishedBestOfPosts.slice(0, 3).forEach(post => {
        if (post && post.slug) {
          console.log(`     • ${SITE_URL}/best/${post.slug}`);
        }
      });
      if (publishedBestOfPosts.length > 3) {
        console.log(`     ... and ${publishedBestOfPosts.length - 3} more`);
      }
    }
    
    // Blog directory
    console.log(`   - Blog directory: ${SITE_URL}/reviews`);
    
    // Blog posts
    if (blogPosts.length > 0) {
      console.log(`   - Blog posts: ${blogPosts.length}`);
      blogPosts.slice(0, 3).forEach(blog => {
        if (blog && blog.slug) {
          console.log(`     • ${SITE_URL}/reviews/${blog.slug}`);
        }
      });
      if (blogPosts.length > 3) {
        console.log(`     ... and ${blogPosts.length - 3} more`);
      }
    }
    
    const categories = [...new Set(
      validProducts
        .filter(p => p && p.category)
        .map(p => p.category)
    )];
    
    if (categories.length > 0) {
      console.log(`   - Category pages: ${categories.length}`);
      categories.slice(0, 5).forEach(category => {
        console.log(`     • ${SITE_URL}/?category=${encodeURIComponent(category)}`);
      });
      if (categories.length > 5) {
        console.log(`     ... and ${categories.length - 5} more`);
      }
    }
    
    console.log(`   - Static pages: 3 (About, Privacy, Terms)`);
    console.log('');
    
    const totalUrls = 1 + 1 + publishedBestOfPosts.length + 1 + blogPosts.length + categories.length + 3;
    console.log(`📊 Total URLs: ${totalUrls}`);
    console.log('');
    console.log('💡 Upload public/sitemap.xml to your server!');
    console.log('💡 Submit to Google Search Console: https://search.google.com/search-console');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
main();