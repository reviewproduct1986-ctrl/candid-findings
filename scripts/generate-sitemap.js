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

  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
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

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return data.products || data || [];
}

/**
 * Generate sitemap XML
 */
function generateSitemap(blogs, products) {
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

  // Add review pages
  if (blogs.posts && blogs.posts.length > 0) {
    xml += `  <!-- Product Review Pages -->\n`;
    
    blogs.posts.forEach(blog => {
      const lastmod = blog.updatedDate ? 
        new Date(blog.updatedDate).toISOString().split('T')[0] : 
        now;
      
      xml += `  <url>
    <loc>${SITE_URL}/reviews/${blog.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

`;
    });
  }

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
    const products = loadProducts();
    
    console.log(`📦 Found ${products.length} products`);
    console.log(`📄 Found ${blogs.posts.length} blog posts`);
    
    const xml = generateSitemap(blogs, products);
    saveSitemap(xml);
    
    console.log('🎉 Sitemap generation completed!');
    console.log('');
    console.log('📍 URLs included:');
    console.log(`   - Homepage: ${SITE_URL}/`);
    
    if (blogs.posts.length > 0) {
      console.log(`   - Review pages: ${blogs.posts.length}`);
      blogs.posts.forEach(blog => {
        console.log(`     • ${SITE_URL}/reviews/${blog.slug}`);
      });
    }
    
    const categories = [...new Set(products.map(p => p.category))];
    if (categories.length > 1) {
      console.log(`   - Category pages: ${categories.length}`);
    }
    
    console.log('');
    console.log(`📊 Total URLs: ${1 + blogs.posts.length + (categories.length > 1 ? categories.length : 0)}`);
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