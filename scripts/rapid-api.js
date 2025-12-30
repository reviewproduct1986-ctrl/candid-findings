#!/usr/bin/env node

/**
 * Amazon Product Updater - RapidAPI Version
 * 
 * Uses RapidAPI's Real-Time Amazon Data API for accurate product info
 * 
 * Setup:
 * 1. Sign up at https://rapidapi.com
 * 2. Subscribe to: Real-Time Amazon Data API
 * 3. Copy your API key below
 * 
 * Usage: node update-products-rapidapi.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const isoDate = new Date().toISOString().slice(0, 10)

// ⚠️ CONFIGURATION - ADD YOUR API KEY HERE
const CONFIG = {
  rapidApiKey: '6bac5b5110mshc5f115711b25f83p12f32djsn7ab3e451fa00',
  // rapidApiKey: process.env.RAPIDAPI_KEY,
  productsFile: './public/data/products.json',
  backupFile: `./public/data/products.backup.${isoDate}.json`,
  delayBetweenRequests: 2000, // 2 seconds
};

// Statistics
const stats = {
  total: 0,
  updated: 0,
  unavailable: 0,
  errors: 0,
  skipped: 0
};

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

/**
 * Fetch product data from RapidAPI
 */
function fetchProductData(asin) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      hostname: 'real-time-amazon-data.p.rapidapi.com',
      port: null,
      path: `/product-details?asin=${asin}&country=US`,
      headers: {
        'x-rapidapi-key': CONFIG.rapidApiKey,
        'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com'
      }
    };

    const req = https.request(options, (res) => {
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(body);
            resolve(data);
          } catch (err) {
            reject(new Error('Invalid JSON response'));
          }
        } else if (res.statusCode === 401) {
          reject(new Error('Invalid API key - check your RapidAPI key'));
        } else if (res.statusCode === 429) {
          reject(new Error('Rate limit exceeded - upgrade your RapidAPI plan'));
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

/**
 * Parse API response
 */
function parseApiResponse(apiData) {
  console.log('apiData: ', apiData);
  const data = {
    available: true,
    price: null,
    listPrice: null,
    rating: null,
    reviewCount: null
  };

  // Check availability
  if (!apiData || !apiData.data) {
    data.available = false;
    return data;
  }

  const product = apiData.data;

  // Check if product is available
  if (product.availability === 'OUT_OF_STOCK' || 
      product.availability === 'DISCONTINUED') {
    data.available = false;
    return data;
  }

  // Extract price (handle different price formats)
  if (product.product_price) {
    // Remove $ and convert to number
    const priceStr = product.product_price.replace('$', '').replace(',', '');
    data.price = parseFloat(priceStr);
  } else if (product.price) {
    const priceStr = String(product.price).replace('$', '').replace(',', '');
    data.price = parseFloat(priceStr);
  }

  // Extract original price (handle different price formats)
  if (product.product_original_price) {
    // Remove $ and convert to number
    const priceStr = product.product_original_price.replace('$', '').replace(',', '');
    data.listPrice = parseFloat(priceStr);
  } else if (product.product_original_price) {
    const priceStr = String(product.product_original_price).replace('$', '').replace(',', '');
    data.listPrice = parseFloat(priceStr);
  }

  // Extract rating
  if (product.product_star_rating) {
    // Format: "4.6 out of 5 stars"
    const match = product.product_star_rating.match(/([0-9.]+)/);
    if (match) {
      data.rating = parseFloat(match[1]);
    }
  } else if (product.rating) {
    data.rating = parseFloat(product.rating);
  }

  // Extract review count
  if (product.product_num_ratings) {
    // Remove commas and convert to number
    const reviewStr = String(product.product_num_ratings).replace(/,/g, '');
    data.reviewCount = parseInt(reviewStr);
  } else if (product.reviews_count) {
    const reviewStr = String(product.reviews_count).replace(/,/g, '');
    data.reviewCount = parseInt(reviewStr);
  }

  console.log('data: ', data);
  return data?.price ? data : null;
}

/**
 * Update a single product
 */
async function updateProduct(product, index, total) {
  console.log(`\n${colors.cyan}[${index + 1}/${total}] ${product.title}${colors.reset}`);
  
  const asin = product.asin;
  
  if (!asin) {
    console.log(`  ${colors.yellow}⚠ Skipped: No ASIN found${colors.reset}`);
    stats.skipped++;
    return product;
  }

  console.log(`  ASIN: ${asin}`);

  try {
    console.log(`  ${colors.cyan}Fetching from API...${colors.reset}`);
    const apiData = await fetchProductData(asin);
    
    const newData = parseApiResponse(apiData);
    console.log('newData: ', newData);

    if (!newData?.available) {
      console.log(`  ${colors.red}✗ Product unavailable${colors.reset}`);
      stats.unavailable++;
      return {
        ...product,
        available: false,
        lastChecked: new Date().toISOString()
      };
    }

    const updated = { ...product };
    let hasChanges = false;

    if (newData.price !== null && newData.price !== product.price) {
      console.log(`  Price: $${product.price} → $${newData.price}`);
      updated.price = newData.price;
      hasChanges = true;
    }

    if (newData.listPrice !== null && newData.listPrice !== product.listPrice) {
      console.log(`  Price: $${product.listPrice} → $${newData.listPrice}`);
      updated.listPrice = newData.listPrice;
      hasChanges = true;
    }

    if (newData.rating !== null && newData.rating !== product.rating) {
      console.log(`  Rating: ${product.rating} → ${newData.rating}`);
      updated.rating = newData.rating;
      hasChanges = true;
    }

    if (newData.reviewCount !== null && newData.reviewCount !== product.reviews) {
      console.log(`  Reviews: ${product.reviews} → ${newData.reviewCount}`);
      updated.reviews = newData.reviewCount;
      hasChanges = true;
    }

    if (hasChanges) {
      updated.lastUpdated = new Date().toISOString();
      console.log(`  ${colors.green}✓ Updated${colors.reset}`);
      stats.updated++;
    } else {
      console.log(`  ${colors.green}✓ No changes${colors.reset}`);
    }

    updated.lastChecked = new Date().toISOString();
    updated.available = true;
    return updated;

  } catch (error) {
    console.log(`  ${colors.red}✗ Error: ${error.message}${colors.reset}`);
    stats.errors++;
    return {
      ...product,
      lastChecked: new Date().toISOString(),
      lastError: error.message
    };
  }
}

/**
 * Sleep function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function
 */
async function main() {
  console.log(`${colors.bright}${colors.cyan}
╔═══════════════════════════════════════╗
║   Amazon Product Updater (RapidAPI)  ║
╚═══════════════════════════════════════╝
${colors.reset}`);

  // Check API key
  if (CONFIG.rapidApiKey === 'YOUR_RAPIDAPI_KEY_HERE') {
    console.error(`${colors.red}Error: Please add your RapidAPI key to the script${colors.reset}\n`);
    console.log('1. Sign up at https://rapidapi.com');
    console.log('2. Subscribe to: Real-Time Amazon Data API');
    console.log('3. Copy your API key');
    console.log('4. Add it to CONFIG.rapidApiKey in this script\n');
    process.exit(1);
  }

  const productsPath = path.resolve(CONFIG.productsFile);
  const backupPath = path.resolve(CONFIG.backupFile);

  if (!fs.existsSync(productsPath)) {
    console.error(`${colors.red}Error: products.json not found${colors.reset}`);
    process.exit(1);
  }

  console.log(`Reading: ${productsPath}\n`);
  const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  const products = productsData.products;

  stats.total = products.length;
  console.log(`Found ${stats.total} products\n`);

  // Create backup
  try {
    fs.copyFileSync(productsPath, backupPath);
    console.log(`${colors.green}✓ Backup created${colors.reset}\n`);
  } catch (error) {
    console.log(`${colors.yellow}⚠ Could not create backup${colors.reset}\n`);
  }

  // Update each product
  const updatedProducts = [];
  for (let i = 0; i < products.length; i++) {
    const updated = await updateProduct(products[i], i, products.length);
    updatedProducts.push(updated);
    
    if (i < products.length - 1) {
      await sleep(CONFIG.delayBetweenRequests);
    }
  }

  // Save updatedProducts
  const outputData = {
    products: Array.from(updatedProducts.values()),
    metadata: {
      total: updatedProducts.length,
      updated: new Date().toISOString()
    }
  };

  fs.writeFileSync(productsPath, JSON.stringify(outputData), 'utf8');

  // Summary
  console.log(`\n${colors.bright}${colors.cyan}
╔═══════════════════════════════════════╗
║            Summary                    ║
╚═══════════════════════════════════════╝
${colors.reset}`);
  console.log(`Total products:    ${stats.total}`);
  console.log(`${colors.green}Updated:           ${stats.updated}${colors.reset}`);
  console.log(`${colors.red}Unavailable:       ${stats.unavailable}${colors.reset}`);
  console.log(`${colors.yellow}Errors:            ${stats.errors}${colors.reset}`);
  console.log(`${colors.yellow}Skipped:           ${stats.skipped}${colors.reset}`);
  console.log(`\n${colors.green}✓ Done!${colors.reset}\n`);
}

main().catch(error => {
  console.error(`${colors.red}\nFatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});