#!/usr/bin/env node

/**
 * Generate sitemap.xml from products and blog posts
 * Uses products.json as source of truth and verifies blog files exist
 */

const fs = require('fs');
const path = require('path');
const { categoryToSlug } = require('../src/utils/urlHelper');

const SITE_URL = 'https://candidfindings.com'; // Update with your actual domain

/**
 * Check if a blog file exists for a given slug
 */
function blogFileExists(slug) {
  const blogPaths = [
    path.join(__dirname, `../public/data/blogs/blog.${slug}.json`),
    path.join(__dirname, `../data/blogs/blog.${slug}.json`)
  ];
  
  return blogPaths.some(p => fs.existsSync(p));
}

/**
 * Load blog metadata from individual file
 */
function loadBlogMetadata(slug) {
  const blogPaths = [
    path.join(__dirname, `../public/data/blogs/blog.${slug}.json`),
    path.join(__dirname, `../data/blogs/blog.${slug}.json`)
  ];
  
  for (const filePath of blogPaths) {
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return {
          publishedDate: data.publishedDate,
          updatedDate: data.updatedDate
        };
      } catch (error) {
        console.warn(`⚠️  Error reading ${slug}:`, error.message);
        return {};
      }
    }
  }
  
  return {};
}

/**
 * Load products from JSON
 */
function loadProducts() {
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
 * Load best-of blogs from JSON
 */
function loadBestOfBlogs() {
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
 * Categorize products into reviews and best-of based on category and blog existence
 */
function categorizeProducts(products) {
  const reviews = [];
  const bestOf = [];
  const missingBlogs = [];
  
  products.forEach(product => {
    if (!product || !product.slug) return;
    
    // Check if blog file exists
    if (!blogFileExists(product.slug)) {
      missingBlogs.push(product.slug);
      return;
    }
    
    // Load blog metadata
    const metadata = loadBlogMetadata(product.slug);
    
    const entry = {
      slug: product.slug,
      title: product.name || product.slug,
      category: product.category,
      ...metadata
    };
    
    // Categorize based on category field
    if (product.category && product.category.toLowerCase().includes('best')) {
      bestOf.push(entry);
    } else {
      reviews.push(entry);
    }
  });
  
  return { reviews, bestOf, missingBlogs };
}

/**
 * Generate sitemap XML
 */
function generateSitemap(reviews, bestOf, bestOfBlogs, products) {
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
  if (bestOf.length > 0 || (bestOfBlogs?.posts || []).length > 0) {
    xml += `  <!-- Best Selections Directory -->
  <url>
    <loc>${SITE_URL}/best</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

`;
  }

  // Add Best-Of posts from best-of-blogs.json
  const bestOfPosts = bestOfBlogs?.posts || [];
  const publishedBestOfPosts = bestOfPosts.filter(post => !post.comingSoon);
  
  if (publishedBestOfPosts.length > 0) {
    xml += `  <!-- Best Selections Posts (from best-of-blogs.json) -->\n`;
    
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

  // Add Best-Of posts from products with "best" category
  if (bestOf.length > 0) {
    xml += `  <!-- Best Selections Posts (from products) -->\n`;
    
    bestOf.forEach(post => {
      if (!post || !post.slug) return;
      
      const lastmod = post.updatedDate || post.publishedDate ? 
        new Date(post.updatedDate || post.publishedDate).toISOString().split('T')[0] : 
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

  // Add best category pages
  if (bestOfPosts.length > 0) {
    const bestCategories = [...new Set(
      bestOfPosts
        .filter(p => p && p.category)
        .map(p => p.category)
    )];

    if (bestCategories.length > 0) {
      xml += `  <!-- Best Category Pages -->\n`;
      bestCategories.forEach(category => {
        if (!category) return;
        
        xml += `  <url>
    <loc>${SITE_URL}/best/category/${categoryToSlug(category)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>

`;
      });
    }
  }

  // Add individual review posts
  if (reviews.length > 0) {
    xml += `  <!-- Review Posts -->\n`;
    
    reviews.forEach(post => {
      console.log('post: ', post.slug);
      if (!post || !post.slug) return;
      
      const lastmod = post.updatedDate || post.publishedDate ? 
        new Date(post.updatedDate || post.publishedDate).toISOString().split('T')[0] : 
        now;
      
      xml += `  <url>
    <loc>${SITE_URL}/reviews/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

`;
    });
  }

  // Add category pages (excluding "best" categories)
  const categories = [...new Set(
    products
      .filter(p => p && p.category && !p.category.toLowerCase().includes('best'))
      .map(p => p.category)
  )];
  
  if (categories.length > 0) {
    xml += `  <!-- Category Pages -->\n`;
    categories.forEach(category => {
      if (!category) return;
      
      xml += `  <url>
    <loc>${SITE_URL}/category/${categoryToSlug(category)}</loc>
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

</urlset>`;
  
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
    console.log('');
    
    const products = loadProducts();
    const bestOfBlogs = loadBestOfBlogs();
    
    // Categorize products and verify blog files exist
    const { reviews, bestOf, missingBlogs } = categorizeProducts(products);
    
    const bestOfPosts = bestOfBlogs?.posts || [];
    const publishedBestOfPosts = bestOfPosts.filter(p => !p.comingSoon);
    const validProducts = products.filter(p => p && p.category);
    
    console.log(`📦 Total products: ${validProducts.length}`);
    console.log(`📄 Review posts (with blog files): ${reviews.length}`);
    console.log(`⭐ Best-of posts (from products): ${bestOf.length}`);
    console.log(`⭐ Best-of posts (from best-of-blogs.json): ${publishedBestOfPosts.length}`);
    
    if (missingBlogs.length > 0) {
      console.log(`⚠️  Products missing blog files: ${missingBlogs.length}`);
      missingBlogs.slice(0, 5).forEach(slug => {
        console.log(`   - ${slug}`);
      });
      if (missingBlogs.length > 5) {
        console.log(`   ... and ${missingBlogs.length - 5} more`);
      }
    }
    console.log('');
    
    const xml = generateSitemap(reviews, bestOf, bestOfBlogs, validProducts);
    saveSitemap(xml);
    
    console.log('🎉 Sitemap generation completed!');
    console.log('');
    console.log('📍 URLs included:');
    console.log(`   - Homepage: ${SITE_URL}/`);
    
    // Best Selections
    const totalBestOf = bestOf.length + publishedBestOfPosts.length;
    if (totalBestOf > 0) {
      console.log(`   - Best Selections: ${SITE_URL}/best`);
      console.log(`   - Best Selections posts: ${totalBestOf}`);
      
      const allBestOf = [
        ...publishedBestOfPosts.map(p => ({ slug: p.slug, source: 'best-of-blogs.json' })),
        ...bestOf.map(p => ({ slug: p.slug, source: 'products.json' }))
      ];
      
      allBestOf.slice(0, 3).forEach(item => {
        console.log(`     • ${SITE_URL}/best/${item.slug} (${item.source})`);
      });
      if (allBestOf.length > 3) {
        console.log(`     ... and ${allBestOf.length - 3} more`);
      }
    }
    
    // Reviews
    if (reviews.length > 0) {
      console.log(`   - Review posts: ${reviews.length}`);
      reviews.slice(0, 3).forEach(post => {
        console.log(`     • ${SITE_URL}/reviews/${post.slug}`);
      });
      if (reviews.length > 3) {
        console.log(`     ... and ${reviews.length - 3} more`);
      }
    }
    
    // Categories
    const categories = [...new Set(
      validProducts
        .filter(p => p && p.category && !p.category.toLowerCase().includes('best'))
        .map(p => p.category)
    )];
    
    if (categories.length > 0) {
      console.log(`   - Category pages: ${categories.length}`);
      categories.slice(0, 5).forEach(category => {
        console.log(`     • ${SITE_URL}/category/${categoryToSlug(category)}`);
      });
      if (categories.length > 5) {
        console.log(`     ... and ${categories.length - 5} more`);
      }
    }
    
    console.log(`   - Static pages: 3 (About, Privacy, Terms)`);
    console.log('');
    
    const totalUrls = 1 + 
                      (totalBestOf > 0 ? 1 : 0) + totalBestOf + 
                      reviews.length + 
                      categories.length + 3;
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