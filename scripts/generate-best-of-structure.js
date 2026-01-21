#!/usr/bin/env node

/**
 * Generate best-of-blogs.json structure from products.json
 * Creates blog posts grouped by category, avoiding duplicates
 * Checks for new categories that can be added
 */

const fs = require('fs');
const path = require('path');

function loadProducts() {
  const publicPath = path.join(__dirname, '../public/data/products.json');
  const dataPath = path.join(__dirname, '../data/products.json');
  
  let filePath = publicPath;
  if (!fs.existsSync(publicPath) && fs.existsSync(dataPath)) {
    filePath = dataPath;
  }
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ products.json not found!');
    console.log('');
    console.log('Expected location:');
    console.log(`  ${publicPath}`);
    console.log('  or');
    console.log(`  ${dataPath}`);
    console.log('');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const allProducts = data.products || data;
  
  // Filter out unavailable products
  const availableProducts = allProducts.filter(product => {
    // If 'available' field doesn't exist, assume product is available
    return product.available !== false;
  });
  
  const unavailableCount = allProducts.length - availableProducts.length;
  if (unavailableCount > 0) {
    console.log(`⏭️  Filtered out ${unavailableCount} unavailable product(s)`);
  }
  
  return availableProducts;
}

function loadExistingBestOfBlogs() {
  const publicPath = path.join(__dirname, '../public/data/best-of-blogs.json');
  const dataPath = path.join(__dirname, '../data/best-of-blogs.json');
  
  let filePath = publicPath;
  if (!fs.existsSync(publicPath) && fs.existsSync(dataPath)) {
    filePath = dataPath;
  }
  
  if (!fs.existsSync(filePath)) {
    return { posts: [] };
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.warn('⚠️  Error reading existing best-of-blogs.json:', error.message);
    return { posts: [] };
  }
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function generateTitle(category, productCount) {
  const templates = {
    'Technology': [
      `${productCount} Best Tech Products You Actually Need`,
      `${productCount} Must-Have Tech Products That Are Worth It`,
      `${productCount} Top Tech Products That Actually Deliver`,
      `${productCount} Essential Tech Products Worth Your Money`
    ],
    'Books': [
      `${productCount} Books You Won't Be Able to Put Down`,
      `${productCount} Must-Read Books for Your Collection`,
      `${productCount} Books That Will Change How You Think`,
      `${productCount} Page-Turners You Need to Read`
    ],
    'Beauty & Personal Care': [
      `${productCount} Beauty Products That Actually Work`,
      `${productCount} Must-Have Beauty Essentials`,
      `${productCount} Beauty Products Worth the Hype`,
      `${productCount} Game-Changing Beauty Products`
    ],
    'Home & Kitchen': [
      `${productCount} Home Essentials That Make Life Easier`,
      `${productCount} Must-Have Products for Your Home`,
      `${productCount} Home Products You'll Use Every Day`,
      `${productCount} Essential Home Items Worth Buying`
    ],
    'Health & Household': [
      `${productCount} Health Products That Make a Difference`,
      `${productCount} Essential Health & Wellness Products`,
      `${productCount} Health Products Worth Investing In`,
      `${productCount} Must-Have Health & Wellness Items`
    ],
    'Clothing, Shoes & Jewelry': [
      `${productCount} Fashion Essentials for Your Wardrobe`,
      `${productCount} Must-Have Fashion Pieces`,
      `${productCount} Wardrobe Staples You Need`,
      `${productCount} Fashion Items Worth the Investment`
    ],
    'Sports & Outdoors': [
      `${productCount} Fitness Products That Keep You Motivated`,
      `${productCount} Essential Sports & Outdoor Gear`,
      `${productCount} Outdoor Products That Actually Work`,
      `${productCount} Must-Have Sports Equipment`
    ],
    'Automotive': [
      `${productCount} Automotive Products Every Car Owner Needs`,
      `${productCount} Must-Have Car Accessories`,
      `${productCount} Automotive Essentials Worth Buying`,
      `${productCount} Car Products That Make Life Easier`
    ],
    'Electronics': [
      `${productCount} Electronics That Actually Live Up to the Hype`,
      `${productCount} Must-Have Electronic Devices`,
      `${productCount} Essential Electronics Worth Your Money`,
      `${productCount} Top Electronic Products You Need`
    ],
    'Cell Phones & Accessories': [
      `${productCount} Phone Accessories You Actually Need`,
      `${productCount} Must-Have Phone Products`,
      `${productCount} Essential Phone Accessories Worth Buying`,
      `${productCount} Top Phone Products That Deliver`
    ]
  };

  const categoryTemplates = templates[category] || [
    `${productCount} Best ${category} Products`,
    `${productCount} Must-Have ${category} Items`,
    `${productCount} Top ${category} Products Worth Buying`
  ];

  return categoryTemplates[0];
}

function generateMetaDescription(category, productCount) {
  const templates = {
    'Technology': `Discover ${productCount} must-have tech products that actually deliver on their promises. From everyday essentials to game-changers.`,
    'Books': `${productCount} addictive reads you won't be able to put down. Find your next favorite book across multiple genres.`,
    'Beauty & Personal Care': `${productCount} beauty products that actually work. Tested, approved, and worth adding to your routine.`,
    'Home & Kitchen': `${productCount} home essentials that make everyday life better. Transform your space with these must-haves.`,
    'Health & Household': `${productCount} health and wellness products that make a real difference. Invest in your wellbeing with these picks.`,
    'Clothing, Shoes & Jewelry': `${productCount} fashion essentials that combine quality and style. Build a wardrobe that works for you.`,
    'Sports & Outdoors': `${productCount} sports and outdoor products that keep you active and motivated. Gear that delivers results.`,
    'Automotive': `${productCount} automotive products that every car owner needs. From essentials to upgrades worth making.`,
    'Electronics': `${productCount} electronic products that actually live up to the hype. Quality devices worth investing in.`,
    'Cell Phones & Accessories': `${productCount} phone accessories that enhance your daily mobile experience. Essential picks that deliver.`
  };

  return templates[category] || `Discover ${productCount} top-rated ${category.toLowerCase()} products handpicked for quality and value.`;
}

function generateKeywords(category) {
  const baseKeywords = {
    'Technology': ['best tech', 'top tech products', 'must have tech', 'tech gadgets', 'tech essentials', 'best technology', 'tech gear'],
    'Books': ['best books', 'must read books', 'book recommendations', 'top books', 'page turners', 'good books to read', 'best reads'],
    'Beauty & Personal Care': ['best beauty products', 'beauty essentials', 'must have beauty', 'top beauty products', 'beauty favorites', 'skincare', 'makeup'],
    'Home & Kitchen': ['home essentials', 'best home products', 'must have home items', 'home favorites', 'kitchen essentials', 'home decor'],
    'Health & Household': ['health products', 'wellness products', 'best health items', 'fitness and health', 'wellness essentials', 'health gear'],
    'Clothing, Shoes & Jewelry': ['fashion essentials', 'wardrobe staples', 'must have fashion', 'style essentials', 'fashion favorites', 'clothing essentials'],
    'Sports & Outdoors': ['sports products', 'outdoor gear', 'fitness essentials', 'sports equipment', 'outdoor essentials', 'athletic gear'],
    'Automotive': ['car accessories', 'automotive products', 'car essentials', 'vehicle accessories', 'auto products', 'car gear'],
    'Electronics': ['best electronics', 'electronic devices', 'tech products', 'electronics essentials', 'gadgets', 'must have electronics'],
    'Cell Phones & Accessories': ['phone accessories', 'mobile accessories', 'phone essentials', 'smartphone accessories', 'phone gear', 'mobile products']
  };

  return baseKeywords[category] || [
    `best ${category.toLowerCase()}`,
    `${category.toLowerCase()} essentials`,
    `top ${category.toLowerCase()} products`
  ];
}

function groupProductsByCategory(products) {
  const grouped = {};
  
  for (const product of products) {
    const category = product.category || 'Uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(product);
  }
  
  return grouped;
}

function selectProductsForBestOf(products, maxProducts = 5) {
  // Sort by rating (if available) and then by reviews
  const sorted = [...products].sort((a, b) => {
    // First by rating (higher is better)
    if (a.rating && b.rating && a.rating !== b.rating) {
      return b.rating - a.rating;
    }
    // Then by review count (more reviews is better)
    if (a.reviews && b.reviews) {
      return b.reviews - a.reviews;
    }
    return 0;
  });
  
  return sorted.slice(0, maxProducts).map(product => ({
    asin: product.asin,
    content: "" // Empty - to be filled by content generator
  }));
}

function createBlogPost(category, products) {
  const selectedProducts = selectProductsForBestOf(products, 5);
  const title = generateTitle(category, selectedProducts.length);
  const slug = generateSlug(title);
  
  return {
    title: title,
    slug: slug,
    metaDescription: generateMetaDescription(category, selectedProducts.length),
    keywords: generateKeywords(category),
    category: category,
    featured: false, // You can manually set featured posts later
    products: selectedProducts,
    publishedDate: new Date().toISOString(),
    updatedDate: new Date().toISOString()
  };
}

function analyzeCategories(grouped, existingPosts) {
  const existingCategories = new Set(existingPosts.map(post => post.category));
  
  const newCategories = [];
  const skippedExisting = [];
  const insufficientProducts = [];
  
  for (const [category, categoryProducts] of Object.entries(grouped)) {
    if (existingCategories.has(category)) {
      skippedExisting.push({ category, count: categoryProducts.length });
    } else if (categoryProducts.length < 3) {
      insufficientProducts.push({ category, count: categoryProducts.length });
    } else {
      newCategories.push({ category, count: categoryProducts.length });
    }
  }
  
  return {
    newCategories,
    skippedExisting,
    insufficientProducts,
    existingCategories
  };
}

function generateBestOfBlogs(products, existingPosts) {
  console.log('');
  console.log('📊 Analyzing products...');
  console.log('');
  
  // Group products by category
  const grouped = groupProductsByCategory(products);
  
  console.log(`📦 Found ${Object.keys(grouped).length} total categories in products.json:`);
  for (const [category, categoryProducts] of Object.entries(grouped)) {
    console.log(`   - ${category}: ${categoryProducts.length} products`);
  }
  console.log('');
  
  // Analyze what can be added
  const analysis = analyzeCategories(grouped, existingPosts);
  
  console.log('═══════════════════════════════════════');
  console.log('📋 CATEGORY ANALYSIS');
  console.log('═══════════════════════════════════════');
  console.log('');
  
  if (analysis.skippedExisting.length > 0) {
    console.log('✅ Existing best-of posts:');
    for (const { category, count } of analysis.skippedExisting) {
      console.log(`   ✓ ${category} (${count} products available)`);
    }
    console.log('');
  }
  
  if (analysis.newCategories.length > 0) {
    console.log('🆕 NEW categories that can be added:');
    for (const { category, count } of analysis.newCategories) {
      console.log(`   + ${category} (${count} products) ← WILL BE ADDED`);
    }
    console.log('');
  } else {
    console.log('ℹ️  No new categories found with sufficient products');
    console.log('');
  }
  
  if (analysis.insufficientProducts.length > 0) {
    console.log('⚠️  Categories with insufficient products (need 3+):');
    for (const { category, count } of analysis.insufficientProducts) {
      console.log(`   - ${category}: only ${count} product(s)`);
    }
    console.log('');
  }
  
  console.log('═══════════════════════════════════════');
  console.log('');
  
  // Create posts for new categories
  const newPosts = [];
  
  for (const { category } of analysis.newCategories) {
    console.log(`✨ Creating best-of post for ${category}...`);
    const post = createBlogPost(category, grouped[category]);
    newPosts.push(post);
  }
  
  if (newPosts.length > 0) {
    console.log('');
    console.log('📊 GENERATION SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`🆕 New posts created: ${newPosts.length}`);
    console.log(`✅ Existing posts kept: ${analysis.skippedExisting.length}`);
    console.log(`📝 Total posts after update: ${existingPosts.length + newPosts.length}`);
    console.log('═══════════════════════════════════════');
    console.log('');
    
    console.log('🆕 Details of new posts:');
    for (const post of newPosts) {
      console.log(`   📄 ${post.title}`);
      console.log(`      Slug: ${post.slug}`);
      console.log(`      Category: ${post.category}`);
      console.log(`      Products: ${post.products.length}`);
      console.log('');
    }
  }
  
  return [...existingPosts, ...newPosts];
}

function saveBestOfBlogs(posts) {
  const dataDirPublic = path.join(__dirname, '../public/data');
  const dataDir = path.join(__dirname, '../data');
  
  // Create directories if they don't exist
  if (!fs.existsSync(dataDirPublic)) {
    fs.mkdirSync(dataDirPublic, { recursive: true });
  }
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const blogsData = {
    posts: posts
  };
  
  const jsonPathPublic = path.join(dataDirPublic, 'best-of-blogs.json');
  const jsonPath = path.join(dataDir, 'best-of-blogs.json');
  
  // Backup existing file if it exists
  if (fs.existsSync(jsonPathPublic)) {
    const backupPath = path.join(dataDirPublic, `best-of-blogs.backup.${Date.now()}.json`);
    fs.copyFileSync(jsonPathPublic, backupPath);
    console.log(`💾 Backup saved: ${path.basename(backupPath)}`);
  }
  
  // Save to both locations
  fs.writeFileSync(jsonPathPublic, JSON.stringify(blogsData, null, 2));
  fs.writeFileSync(jsonPath, JSON.stringify(blogsData, null, 2));
  
  console.log('✅ Saved to:');
  console.log(`   - ${jsonPathPublic}`);
  console.log(`   - ${jsonPath}`);
  console.log('');
  
  // Summary
  let totalProducts = 0;
  for (const post of posts) {
    totalProducts += post.products.length;
  }
  
  console.log('📊 File contents:');
  console.log(`   - ${posts.length} blog posts`);
  console.log(`   - ${totalProducts} product slots`);
  console.log(`   - ${totalProducts} empty content fields (ready for content generation)`);
}

async function main() {
  try {
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║  Best-Of Blog Structure Generator         ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log('');
    console.log('🎯 What this does:');
    console.log('   - Groups products by category');
    console.log('   - Checks for NEW categories to add');
    console.log('   - Creates best-of blog post structures');
    console.log('   - Avoids duplicate categories');
    console.log('   - Generates titles, slugs, metadata');
    console.log('   - Leaves content empty for AI generation');
    console.log('   - Filters out unavailable products');
    console.log('');

    // Load products (automatically filters out unavailable ones)
    const products = loadProducts();
    console.log(`📦 Loaded ${products.length} available products`);

    // Load existing best-of posts
    const existingBlogs = loadExistingBestOfBlogs();
    console.log(`📄 Found ${existingBlogs.posts.length} existing best-of posts`);

    // Generate new posts for categories that don't exist
    const allPosts = generateBestOfBlogs(products, existingBlogs.posts);
    
    // Check if there are new posts to add
    const newPostCount = allPosts.length - existingBlogs.posts.length;
    
    if (newPostCount === 0) {
      console.log('');
      console.log('✅ No new categories to add!');
      console.log('');
      console.log('ℹ️  All product categories with 3+ products already have best-of posts.');
      console.log('');
      console.log('💡 Options:');
      console.log('   - Add more products to products.json to enable new categories');
      console.log('   - Delete specific posts from best-of-blogs.json to regenerate them');
      console.log('   - Delete entire best-of-blogs.json to start fresh');
      console.log('');
      return;
    }
    
    saveBestOfBlogs(allPosts);
    
    console.log('');
    console.log('🎉 Structure generation complete!');
    console.log('');
    console.log(`✅ Added ${newPostCount} new best-of post${newPostCount > 1 ? 's' : ''}!`);
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Review the updated best-of-blogs.json');
    console.log('   2. Adjust titles, keywords, or featured status if needed');
    console.log('   3. Run: node scripts/generate-best-of-content.js');
    console.log('      (This will generate AI content for empty fields)');
    console.log('');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();