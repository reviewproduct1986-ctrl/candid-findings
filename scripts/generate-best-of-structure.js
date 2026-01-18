#!/usr/bin/env node

/**
 * Generate best-of-blogs.json structure from products.json
 * Creates blog posts grouped by category, avoiding duplicates
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
    'Beauty': [
      `${productCount} Beauty Products That Actually Work`,
      `${productCount} Must-Have Beauty Essentials`,
      `${productCount} Beauty Products Worth the Hype`,
      `${productCount} Game-Changing Beauty Products`
    ],
    'Home': [
      `${productCount} Home Essentials That Make Life Easier`,
      `${productCount} Must-Have Products for Your Home`,
      `${productCount} Home Products You'll Use Every Day`,
      `${productCount} Essential Home Items Worth Buying`
    ],
    'Health': [
      `${productCount} Health Products That Make a Difference`,
      `${productCount} Essential Health & Wellness Products`,
      `${productCount} Health Products Worth Investing In`,
      `${productCount} Must-Have Health & Wellness Items`
    ],
    'Fashion': [
      `${productCount} Fashion Essentials for Your Wardrobe`,
      `${productCount} Must-Have Fashion Pieces`,
      `${productCount} Wardrobe Staples You Need`,
      `${productCount} Fashion Items Worth the Investment`
    ],
    'Kitchen': [
      `${productCount} Kitchen Gadgets That Actually Help`,
      `${productCount} Must-Have Kitchen Essentials`,
      `${productCount} Kitchen Tools You'll Use Daily`,
      `${productCount} Game-Changing Kitchen Products`
    ],
    'Fitness': [
      `${productCount} Fitness Products That Keep You Motivated`,
      `${productCount} Essential Fitness Gear Worth Buying`,
      `${productCount} Workout Products That Actually Work`,
      `${productCount} Must-Have Fitness Equipment`
    ],
    'Gaming': [
      `${productCount} Gaming Products for the Ultimate Setup`,
      `${productCount} Must-Have Gaming Gear`,
      `${productCount} Gaming Products That Enhance Your Experience`,
      `${productCount} Essential Gaming Equipment`
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
    'Beauty': `${productCount} beauty products that actually work. Tested, approved, and worth adding to your routine.`,
    'Home': `${productCount} home essentials that make everyday life better. Transform your space with these must-haves.`,
    'Health': `${productCount} health and wellness products that make a real difference. Invest in your wellbeing with these picks.`,
    'Fashion': `${productCount} fashion essentials that combine quality and style. Build a wardrobe that works for you.`,
    'Kitchen': `${productCount} kitchen products that make cooking a joy. From essential tools to game-changing gadgets.`,
    'Fitness': `${productCount} fitness products that keep you motivated and help you reach your goals. Equipment that delivers.`,
    'Gaming': `${productCount} gaming products for the ultimate setup. Enhance your experience with these essential picks.`
  };

  return templates[category] || `Discover ${productCount} top-rated ${category.toLowerCase()} products handpicked for quality and value.`;
}

function generateKeywords(category) {
  const baseKeywords = {
    'Technology': ['best tech', 'top tech products', 'must have tech', 'tech gadgets', 'tech essentials', 'best technology', 'tech gear'],
    'Books': ['best books', 'must read books', 'book recommendations', 'top books', 'page turners', 'good books to read', 'best reads'],
    'Beauty': ['best beauty products', 'beauty essentials', 'must have beauty', 'top beauty products', 'beauty favorites', 'skincare', 'makeup'],
    'Home': ['home essentials', 'best home products', 'must have home items', 'home favorites', 'home organization', 'home decor'],
    'Health': ['health products', 'wellness products', 'best health items', 'fitness and health', 'wellness essentials', 'health gear'],
    'Fashion': ['fashion essentials', 'wardrobe staples', 'must have fashion', 'style essentials', 'fashion favorites', 'clothing essentials'],
    'Kitchen': ['kitchen essentials', 'best kitchen gadgets', 'kitchen tools', 'cooking essentials', 'kitchen favorites', 'must have kitchen'],
    'Fitness': ['fitness products', 'workout gear', 'fitness essentials', 'exercise equipment', 'gym essentials', 'fitness gear'],
    'Gaming': ['gaming gear', 'gaming essentials', 'best gaming products', 'gaming setup', 'gaming equipment', 'gamer essentials']
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
  // Sort by some criteria (you can adjust this logic)
  // For now, we'll just take the first N products
  // In a real scenario, you might sort by rating, popularity, price, etc.
  
  return products.slice(0, maxProducts).map(product => ({
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

function generateBestOfBlogs(products, existingPosts) {
  console.log('');
  console.log('📊 Analyzing products...');
  console.log('');
  
  // Group products by category
  const grouped = groupProductsByCategory(products);
  
  console.log(`📦 Found ${Object.keys(grouped).length} categories:`);
  for (const [category, categoryProducts] of Object.entries(grouped)) {
    console.log(`   - ${category}: ${categoryProducts.length} products`);
  }
  console.log('');
  
  // Get existing categories
  const existingCategories = new Set(existingPosts.map(post => post.category));
  console.log('📝 Existing best-of posts:');
  if (existingCategories.size === 0) {
    console.log('   (none)');
  } else {
    for (const category of existingCategories) {
      console.log(`   ✓ ${category}`);
    }
  }
  console.log('');
  
  // Create posts for new categories
  const newPosts = [];
  const skippedCategories = [];
  
  for (const [category, categoryProducts] of Object.entries(grouped)) {
    if (existingCategories.has(category)) {
      skippedCategories.push(category);
      console.log(`⏭️  Skipping ${category} (already exists)`);
      continue;
    }
    
    if (categoryProducts.length < 3) {
      console.log(`⏭️  Skipping ${category} (only ${categoryProducts.length} products, need at least 3)`);
      continue;
    }
    
    console.log(`✨ Creating post for ${category}...`);
    const post = createBlogPost(category, categoryProducts);
    newPosts.push(post);
  }
  
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('📊 GENERATION SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`✅ New posts created: ${newPosts.length}`);
  console.log(`⏭️  Existing posts kept: ${existingCategories.size}`);
  console.log(`📝 Total posts: ${existingPosts.length + newPosts.length}`);
  console.log('═══════════════════════════════════════');
  console.log('');
  
  if (newPosts.length > 0) {
    console.log('🆕 New posts:');
    for (const post of newPosts) {
      console.log(`   - ${post.title}`);
      console.log(`     Slug: ${post.slug}`);
      console.log(`     Products: ${post.products.length}`);
      console.log('');
    }
  }
  
  if (skippedCategories.length > 0) {
    console.log('⏭️  Skipped categories (already exist):');
    for (const category of skippedCategories) {
      console.log(`   - ${category}`);
    }
    console.log('');
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
    
    // Save the combined result
    if (allPosts.length === existingBlogs.posts.length) {
      console.log('');
      console.log('ℹ️  No new posts to add!');
      console.log('   All product categories already have best-of posts.');
      console.log('');
      console.log('💡 To regenerate existing posts, delete best-of-blogs.json and run again.');
      console.log('');
      return;
    }
    
    saveBestOfBlogs(allPosts);
    
    console.log('');
    console.log('🎉 Structure generation complete!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Review the generated best-of-blogs.json');
    console.log('   2. Adjust titles, keywords, or featured status if needed');
    console.log('   3. Run: node generate-best-of-content.js');
    console.log('      (This will fill in the empty content fields)');
    console.log('');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();