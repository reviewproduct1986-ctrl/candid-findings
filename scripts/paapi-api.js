#!/usr/bin/env node

/**
 * Amazon Product Updater - Official PA-API Version
 * 
 * Uses Amazon's official Product Advertising API
 * 
 * Setup:
 * 1. Sign up: https://affiliate-program.amazon.com/
 * 2. Apply for PA-API: https://webservices.amazon.com/paapi5/documentation/
 * 3. Get your Access Key, Secret Key, and Associate Tag
 * 4. Install: npm install paapi5-nodejs-sdk
 * 
 * Usage: node update-products-paapi.js
 */

/* yml

# OPTION 2: Amazon PA-API (official, free)
# Uncomment this block and comment out the RapidAPI block above
# - name: Install PA-API SDK
#   run: npm install paapi5-nodejs-sdk
# 
# - name: Update products with PA-API
#   env:
#     AWS_ACCESS_KEY: ${{ secrets.AWS_ACCESS_KEY }}
#     AWS_SECRET_KEY: ${{ secrets.AWS_SECRET_KEY }}
#     AMAZON_PARTNER_TAG: ${{ secrets.AMAZON_PARTNER_TAG }}
#   run: |
#     # Add credentials to script
#     sed -i "s/YOUR_ACCESS_KEY_HERE/$AWS_ACCESS_KEY/" update-products-paapi.js
#     sed -i "s/YOUR_SECRET_KEY_HERE/$AWS_SECRET_KEY/" update-products-paapi.js
#     sed -i "s/YOUR_ASSOCIATE_TAG_HERE/$AMAZON_PARTNER_TAG/" update-products-paapi.js
#     # Run updater
#     node update-products-paapi.js
*/

const fs = require('fs');
const path = require('path');

// Import PA-API SDK
let ProductAdvertisingAPIv1;
try {
  ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk');
} catch (err) {
  console.error('Error: paapi5-nodejs-sdk not installed');
  console.log('\nPlease run: npm install paapi5-nodejs-sdk\n');
  process.exit(1);
}

// ⚠️ CONFIGURATION - ADD YOUR CREDENTIALS HERE
const CONFIG = {
  accessKey: 'YOUR_ACCESS_KEY_HERE',
  secretKey: 'YOUR_SECRET_KEY_HERE',
  partnerTag: 'YOUR_ASSOCIATE_TAG_HERE', // e.g., "yoursite-20"
  region: 'us-east-1', // US marketplace
  productsFile: './public/data/products.json',
  backupFile: './public/data/products.backup.json',
  delayBetweenRequests: 1000, // 1 second (PA-API allows more requests)
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
 * Initialize PA-API client
 */
function initializeClient() {
  const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance;
  defaultClient.accessKey = CONFIG.accessKey;
  defaultClient.secretKey = CONFIG.secretKey;
  defaultClient.host = 'webservices.amazon.com';
  defaultClient.region = CONFIG.region;
  
  return new ProductAdvertisingAPIv1.DefaultApi();
}

/**
 * Fetch product data from PA-API
 */
async function fetchProductData(api, asin) {
  return new Promise((resolve, reject) => {
    const getItemsRequest = new ProductAdvertisingAPIv1.GetItemsRequest();
    getItemsRequest['PartnerTag'] = CONFIG.partnerTag;
    getItemsRequest['PartnerType'] = 'Associates';
    getItemsRequest['ItemIds'] = [asin];
    getItemsRequest['Resources'] = [
      'ItemInfo.Title',
      'Offers.Listings.Price',
      'Offers.Listings.Availability.Message',
      'CustomerReviews.StarRating',
      'CustomerReviews.Count'
    ];

    api.getItems(getItemsRequest, (error, data, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * Parse PA-API response
 */
function parseApiResponse(apiData) {
  const data = {
    available: true,
    price: null,
    rating: null,
    reviewCount: null
  };

  if (!apiData || !apiData.ItemsResult || !apiData.ItemsResult.Items || 
      apiData.ItemsResult.Items.length === 0) {
    data.available = false;
    return data;
  }

  const item = apiData.ItemsResult.Items[0];

  // Check availability
  if (item.Offers && item.Offers.Listings && item.Offers.Listings.length > 0) {
    const listing = item.Offers.Listings[0];
    
    // Get price
    if (listing.Price && listing.Price.Amount) {
      data.price = listing.Price.Amount;
    }

    // Check if unavailable
    if (listing.Availability && listing.Availability.Message) {
      const msg = listing.Availability.Message.toLowerCase();
      if (msg.includes('unavailable') || msg.includes('out of stock')) {
        data.available = false;
        return data;
      }
    }
  }

  // Get rating and review count
  if (item.CustomerReviews) {
    if (item.CustomerReviews.StarRating && item.CustomerReviews.StarRating.Value) {
      data.rating = parseFloat(item.CustomerReviews.StarRating.Value);
    }
    
    if (item.CustomerReviews.Count) {
      data.reviewCount = parseInt(item.CustomerReviews.Count);
    }
  }

  return data;
}

/**
 * Update a single product
 */
async function updateProduct(api, product, index, total) {
  console.log(`\n${colors.cyan}[${index + 1}/${total}] ${product.title}${colors.reset}`);
  
  const asin = product.asin;
  
  if (!asin) {
    console.log(`  ${colors.yellow}⚠ Skipped: No ASIN found${colors.reset}`);
    stats.skipped++;
    return product;
  }

  console.log(`  ASIN: ${asin}`);

  try {
    console.log(`  ${colors.cyan}Fetching from PA-API...${colors.reset}`);
    const apiData = await fetchProductData(api, asin);
    
    const newData = parseApiResponse(apiData);

    if (!newData.available) {
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
║   Amazon Product Updater (PA-API)    ║
╚═══════════════════════════════════════╝
${colors.reset}`);

  // Check credentials
  if (CONFIG.accessKey === 'YOUR_ACCESS_KEY_HERE' ||
      CONFIG.secretKey === 'YOUR_SECRET_KEY_HERE' ||
      CONFIG.partnerTag === 'YOUR_ASSOCIATE_TAG_HERE') {
    console.error(`${colors.red}Error: Please add your PA-API credentials${colors.reset}\n`);
    console.log('1. Sign up: https://affiliate-program.amazon.com/');
    console.log('2. Apply for PA-API: https://webservices.amazon.com/paapi5/documentation/');
    console.log('3. Add your credentials to CONFIG in this script\n');
    process.exit(1);
  }

  const productsPath = path.resolve(CONFIG.productsFile);
  const backupPath = path.resolve(CONFIG.backupFile);

  if (!fs.existsSync(productsPath)) {
    console.error(`${colors.red}Error: products.json not found${colors.reset}`);
    process.exit(1);
  }

  // Initialize API client
  console.log('Initializing PA-API client...\n');
  const api = initializeClient();

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
    const updated = await updateProduct(api, products[i], i, products.length);
    updatedProducts.push(updated);
    
    if (i < products.length - 1) {
      await sleep(CONFIG.delayBetweenRequests);
    }
  }

  // Save
  const outputData = {
    products: updatedProducts,
    metadata: {
      total: updatedProducts.length,
      updated: new Date().toISOString()
    }
  };

  fs.writeFileSync(productsPath, JSON.stringify(outputData, null, 2), 'utf8');

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